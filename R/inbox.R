# The inbox: how the world outside writes into a process.
#
# A delivery lands on an upload platform, a nightly load finishes, a
# ticketing system closes a request -- all of these are events in someone
# else's system that a process is waiting for. The log is already the
# interface (an event is a line, and the whole state is a fold over the
# lines), so the only thing missing is a door that a foreign process can
# knock on without linking against R.
#
# The door is a directory. One message per file:
#
#   <store>/inbox/delivery-2026Q1-northside.json     waiting
#   <store>/inbox/processed/...                      applied, kept as-is
#   <store>/inbox/failed/...                         rejected, with .error
#
# Why a directory and not an HTTP endpoint: it needs no server, no port, no
# token store and no dependency, it works over any shared or synced mount,
# and every language on earth can write a file. What it costs is that the
# filesystem is the authentication -- whoever may write into the inbox may
# move a process forward, which is the same trust as "whoever may INSERT
# into the events table". See `vignette("external-systems")` for the HTTP
# and pull variants, which are twenty lines each on top of this.
#
# Two rules make it safe to point a cron job at:
#
#   1. The file name is the idempotency key. A message whose name is already
#      in `processed/` is not applied again, so a sender that retries after
#      a timeout cannot deliver twice.
#   2. Only the worker (or whoever calls `ingest_inbox()`) writes events.
#      The sender never touches the log, so a half-written message cannot
#      corrupt it -- at worst it is rejected.

#' The inbox directory of a store
#'
#' @param store Store directory.
#' @return The path (not created).
#' @export
inbox_dir <- function(store = ".runs") file.path(store, "inbox")

#' Write one inbox message
#'
#' The R-side sender, useful from a scheduled script, a test, or a demo
#' block standing in for a real platform. Any other language does the same
#' thing by writing the same JSON: write to a temporary name in the same
#' directory, then rename, so the ingester never sees a half-written file.
#'
#' @param store Store directory.
#' @param task Task the message is about.
#' @param value New value (default `"done"`).
#' @param field Field it sets (default `"status"`).
#' @param element Element id for a multi-instance task; `NULL` for single
#'   tasks.
#' @param instance Instance id, or `"latest"`.
#' @param actor Who is speaking -- the name of the sending system. It ends
#'   up in the audit trail, so use the system's name, not a person's.
#' @param id Message id. Becomes the file name and is the idempotency key;
#'   defaults to a timestamped one. Give it a stable, meaningful id
#'   (`delivery-2026Q1-northside`) and a resend is free.
#'
#' @return The path written, invisibly.
#'
#' @examples
#' store <- tempfile()
#' write_inbox_message(store, "delivery", element = "northside",
#'                     actor = "upload-platform", id = "delivery-northside")
#'
#' @export
write_inbox_message <- function(store = ".runs", task, value = "done",
                                field = "status", element = NULL,
                                instance = "latest", actor = "external",
                                id = NULL) {
  stopifnot(is.character(task), length(task) == 1L, nzchar(task))
  dir <- inbox_dir(store)
  dir.create(dir, showWarnings = FALSE, recursive = TRUE)

  id <- id %||% paste0(
    format(Sys.time(), "%Y%m%dT%H%M%OS3"), "-", task,
    if (!is.null(element)) paste0("-", element) else ""
  )
  id <- gsub("[^A-Za-z0-9_.@-]", "-", id)

  msg <- list(
    instance = instance, task = task, field = field,
    value = as.character(value), actor = actor
  )
  if (!is.null(element) && !is.na(element) && nzchar(element)) {
    msg$element <- as.character(element)
  }

  tmp <- file.path(dir, paste0(".", id, ".tmp"))
  writeLines(as.character(jsonlite::toJSON(msg, auto_unbox = TRUE)), tmp)
  path <- file.path(dir, paste0(id, ".json"))
  file.rename(tmp, path)
  invisible(path)
}

#' Move a message aside, keeping the raw file
#' @noRd
inbox_park <- function(path, dir, reason = NULL) {
  dir.create(dir, showWarnings = FALSE, recursive = TRUE)
  target <- file.path(dir, basename(path))
  k <- 1L
  while (file.exists(target)) {
    target <- file.path(dir, paste0(basename(path), ".duplicate-", k))
    k <- k + 1L
  }
  file.rename(path, target)
  if (!is.null(reason)) writeLines(reason, paste0(target, ".error"))
  invisible(target)
}

#' What `check_message()` reads out of the store, read once
#'
#' Validating a message needs three things from the store: which instance
#' `"latest"` means, the definition it was opened with, and its element list.
#' Each of those parses the whole event log line by line, and the log holds
#' the element list as a single JSON blob -- so for an instance over a few
#' thousand elements, reading it is not cheap. Doing that per message made
#' ingestion quadratic: the first sync of the FS Jahreserhebung writes one
#' message per Gemeinde, and 2115 of them took over five minutes, nearly all
#' of it re-parsing the same log.
#'
#' Instances do not appear or change while their inbox is being ingested, so
#' one read per instance per call is enough. Keyed by the id as the message
#' spells it, `"latest"` included.
#'
#' @return A list of accessors, each memoised.
#' @noRd
message_cache <- function(store) {

  seen <- new.env(parent = emptyenv())

  # exists(), not is.null(): NULL is a legitimate answer (an instance that
  # was never started), and caching it is the point.
  once <- function(key, compute) {
    if (!exists(key, seen, inherits = FALSE)) {
      assign(key, compute(), seen)
    }
    get(key, seen, inherits = FALSE)
  }

  list(
    instance = function(x) {
      once(paste0("i-", x), function() resolve_instance(store, x))
    },
    definition = function(i) {
      once(paste0("d-", i), function() instance_definition(store, i))
    },
    collection = function(i) {
      once(paste0("c-", i), function() instance_collection(store, i))
    }
  )
}

#' Check one message against the instance it names
#'
#' @param cache From [message_cache()]; supply one shared cache when checking
#'   several messages against the same store.
#' @return `list(status, reason, event)` where status is `ok`, `reject`
#'   (permanently wrong, and no retry will fix it) or `pending` (right, but
#'   too early -- the instance it names has not been started).
#' @noRd
check_message <- function(msg, store, cache = message_cache(store)) {
  bad <- function(why) list(status = "reject", reason = why)
  if (!is.list(msg) || is.null(msg$task)) {
    return(bad("no 'task' field"))
  }
  scalar <- function(x) {
    if (is.null(x) || !length(x)) NULL else as.character(x)[[1]]
  }
  task <- scalar(msg$task)
  if (is.null(task) || !nzchar(task)) {
    return(bad("empty 'task'"))
  }
  if (startsWith(task, "@")) {
    return(bad("'@' task ids are reserved for the instance stamp"))
  }

  instance <- scalar(msg$instance) %||% "latest"
  instance <- cache$instance(instance)
  def <- cache$definition(instance)
  if (is.null(def)) {
    return(list(
      status = "pending",
      reason = paste0("instance '", instance, "' has not been started")
    ))
  }
  if (!task %in% as.character(def$task)) {
    return(bad(paste0("no task '", task, "' in instance '", instance, "'")))
  }

  per <- multi_tasks(def)
  multi <- nzchar(per[[task]] %||% "")
  element <- scalar(msg$element)
  if (multi) {
    if (is.null(element) || !nzchar(element)) {
      return(bad(paste0("task '", task, "' repeats per ", per[[task]],
                        ", so the message needs an 'element'")))
    }
    known <- cache$collection(instance)
    ids <- if (is.null(known) || !ncol(known)) character() else {
      as.character(known[[1L]])
    }
    if (!element %in% ids) {
      return(bad(paste0("'", element, "' is not an element of instance '",
                        instance, "'")))
    }
  } else if (!is.null(element) && nzchar(element)) {
    return(bad(paste0("task '", task, "' is not multi-instance, ",
                      "so it takes no 'element'")))
  }

  value <- scalar(msg$value) %||% "done"
  field <- scalar(msg$field) %||% "status"
  if (!nzchar(field)) {
    return(bad("empty 'field'"))
  }
  list(status = "ok", event = list(
    task = task, field = field, value = value,
    actor = scalar(msg$actor) %||% "external",
    store = store, instance = instance,
    element = if (is.null(element) || !nzchar(element)) NULL else element
  ))
}

#' Ingest the inbox: turn waiting messages into events
#'
#' Reads every `*.json` at the top level of the inbox in name order, applies
#' the ones that make sense, and moves each file out of the way --
#' `processed/` when it was applied (or was a duplicate of one that was),
#' `failed/` with a `.error` file beside it when it can never apply.
#' Messages for an instance that has not been started yet stay where they
#' are: that is a race, not a mistake, and the next tick will get them.
#'
#' [run_worker()] calls this on every tick. Call it yourself from a cron job
#' if your process has no scripts to run but does have an outside world.
#'
#' @param store Store directory.
#' @param quiet Suppress messages.
#'
#' @return The number of messages applied, invisibly.
#'
#' @examples
#' store <- tempfile()
#' process <- data.frame(
#'   task = "delivery", name = "Delivery", role = "system", depends_on = ""
#' )
#' start_instance(process, instance = "2026Q1", store = store)
#' write_inbox_message(store, "delivery", instance = "2026Q1",
#'                     actor = "upload-platform", id = "d1")
#' ingest_inbox(store, quiet = TRUE)
#' instance_log(store, "2026Q1")[, c("task", "field", "value", "actor")]
#'
#' @export
ingest_inbox <- function(store = ".runs", quiet = FALSE) {
  dir <- inbox_dir(store)
  if (!dir.exists(dir)) {
    return(invisible(0L))
  }
  files <- sort(list.files(dir, pattern = "\\.json$", full.names = TRUE))
  files <- files[!startsWith(basename(files), ".")]
  if (!length(files)) {
    return(invisible(0L))
  }
  done_dir <- file.path(dir, "processed")
  fail_dir <- file.path(dir, "failed")
  applied <- 0L
  pending <- 0L

  # One read of each instance for the whole batch, not one per message; see
  # message_cache(). This is what keeps a first sync of a few thousand
  # messages from taking minutes.
  cache <- message_cache(store)

  for (f in files) {
    # the name is the key: a message already applied is never applied twice,
    # however many times the sender resends it
    if (file.exists(file.path(done_dir, basename(f)))) {
      inbox_park(f, done_dir)
      if (!quiet) message("inbox: ", basename(f), " already applied, ignored")
      next
    }
    msg <- tryCatch(jsonlite::fromJSON(f), error = function(e) e)
    if (inherits(msg, "error")) {
      inbox_park(f, fail_dir, paste0("unreadable JSON: ", conditionMessage(msg)))
      if (!quiet) message("inbox: ", basename(f), " rejected (unreadable JSON)")
      next
    }
    res <- check_message(msg, store, cache)
    if (identical(res$status, "pending")) {
      pending <- pending + 1L
      next
    }
    if (identical(res$status, "reject")) {
      inbox_park(f, fail_dir, res$reason)
      if (!quiet) message("inbox: ", basename(f), " rejected (", res$reason, ")")
      next
    }
    ev <- res$event
    instance_event(
      ev$task, ev$field, ev$value, ev$actor, ev$store, ev$instance,
      element = ev$element, ref = basename(f)
    )
    inbox_park(f, done_dir)
    applied <- applied + 1L
    if (!quiet) {
      message("inbox: ", basename(f), " -> ", ev$task,
              if (!is.null(ev$element)) paste0("@", ev$element) else "",
              " ", ev$field, "=", ev$value)
    }
  }
  if (pending && !quiet) {
    message("inbox: ", pending, " message(s) waiting for an instance to start")
  }
  invisible(applied)
}
