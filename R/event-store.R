# The instance store: where an instance's life is written down.
#
# Definition and instance have different rhythms and different homes. The
# definition is a table in git; the instance is an append-only log. Current state
# is the latest event per (task, field) -- so the instance columns of the wide
# table are a fold over the log, and the audit history is not a feature
# anyone can forget to write, it IS the storage.
#
# JSONL here because it needs no server and can be read in a text editor.
# The five functions below are the whole interface: point them at a Postgres
# table with an INSERT-only grant and nothing else in the package changes.

#' Path of the event log within a store
#' @noRd
events_file <- function(store) file.path(store, "events.jsonl")

#' Size + mtime of the log, for pollers that must not redraw an idle board
#' @noRd
store_fingerprint <- function(store) {
  f <- events_file(store)
  if (!file.exists(f)) {
    return("")
  }
  i <- file.info(f)
  paste0(i$size, "-", as.numeric(i$mtime))
}

#' Append one event to an instance store
#'
#' The only writer. Both the worker and the people write here, which is why
#' `actor` is recorded separately from `assignee`: `assignee` is whose task it is,
#' `actor` is assignee moved it.
#'
#' @param task Task id.
#' @param field Field the event sets: `assignee`, `due`, `status`, or any
#'   bookkeeping field the worker records (`log`, `took`, `attempt`).
#' @param value New value.
#' @param actor Assignee or what wrote this event.
#' @param store Store directory.
#' @param instance Instance id.
#' @param ts Timestamp.
#' @param element Element id for multi-instance tasks (the per-element rows,
#'   see [expand_instance()]); `NULL` for single tasks. Written to the log
#'   only when set, so single-element stores stay byte-identical.
#' @param ref Where this event came from, when it came from somewhere with a
#'   name: the inbox message file, a ticket id, a request id. Written only
#'   when set. `actor` says which system spoke, `ref` says which of its
#'   messages this was -- together they make an event traceable back out of
#'   the process into the system that caused it.
#'
#' @return `value`, invisibly.
#' @export
instance_event <- function(task, field, value, actor = "worker",
                      store = ".runs", instance = "instance",
                      ts = format(Sys.time(), "%Y-%m-%dT%H:%M:%S"),
                      element = NULL, ref = NULL) {
  dir.create(store, showWarnings = FALSE, recursive = TRUE)
  ev <- list(
    ts = ts, instance = instance, task = task, field = field,
    value = as.character(value), actor = actor
  )
  if (!is.null(element) && !is.na(element) && nzchar(element)) {
    ev$element <- as.character(element)
  }
  if (!is.null(ref) && !is.na(ref) && nzchar(ref)) {
    ev$ref <- as.character(ref)
  }
  line <- jsonlite::toJSON(ev, auto_unbox = TRUE)
  cat(line, "\n", sep = "", file = events_file(store), append = TRUE)
  invisible(value)
}

#' Read an instance store's events
#'
#' @param store Store directory.
#' @param instance Instance id to filter by, or `NULL` for all instances.
#'
#' @return A data frame with columns `ts`, `instance`, `task`, `field`, `value`,
#'   `actor`, `element` (`NA` for single-task events and old logs) and `ref`
#'   (`NA` unless the event came in from a named message).
#' @export
instance_events <- function(store = ".runs", instance = NULL) {
  empty <- data.frame(
    ts = character(), instance = character(), task = character(),
    field = character(), value = character(), actor = character(),
    element = character(), ref = character(),
    stringsAsFactors = FALSE
  )
  f <- events_file(store)
  if (!file.exists(f)) {
    return(empty)
  }
  lines <- readLines(f, warn = FALSE)
  lines <- lines[nzchar(trimws(lines))]
  if (!length(lines)) {
    return(empty)
  }
  # one line at a time: a half-written line from a concurrent appender must
  # not take down the reader
  rows <- lapply(lines, function(l) {
    tryCatch(jsonlite::fromJSON(l), error = function(e) NULL)
  })
  rows <- Filter(Negate(is.null), rows)
  chr1 <- function(x) {
    if (is.null(x) || !length(x)) NA_character_ else as.character(x[[1]])
  }
  out <- do.call(
    rbind,
    lapply(rows, function(r) {
      # normalized column set: an old log has no `element` or `ref` key, and
      # rbind over ragged rows would otherwise throw
      data.frame(
        ts = chr1(r$ts), instance = chr1(r$instance), task = chr1(r$task),
        field = chr1(r$field), value = chr1(r$value), actor = chr1(r$actor),
        element = chr1(r$element), ref = chr1(r$ref),
        stringsAsFactors = FALSE
      )
    })
  )
  if (is.null(out)) {
    return(empty)
  }
  if (!is.null(instance)) out <- out[!is.na(out$instance) & out$instance == instance, , drop = FALSE]
  out
}

#' Fold key of one event: `task` for single tasks, `task@instance` for
#' element rows. Composite keys keep element events invisible to the
#' task-keyed lookups in [apply_events()].
#' @noRd
event_key <- function(task, element = NA_character_) {
  ifelse(
    is.na(element) | !nzchar(element),
    task,
    paste0(task, "@", element)
  )
}

#' Fold an instance's events into per-task state
#'
#' @inheritParams instance_events
#' @return Named list: key -> list of field -> latest value, where the key
#'   is the task id, or `task@instance` for multi-instance events.
#' @export
#' @keywords internal
instance_state <- function(store = ".runs", instance = "instance") {
  ev <- instance_events(store, instance)
  state <- list()
  for (i in seq_len(nrow(ev))) {
    s <- event_key(ev$task[i], ev$element[i])
    if (is.null(state[[s]])) state[[s]] <- list()
    state[[s]][[ev$field[i]]] <- ev$value[i]
  }
  state
}

#' An instance's events, newest first
#'
#' The audit view. `stamp` exists only so a polling block's expression
#' changes when the log grows; it is otherwise ignored.
#'
#' @inheritParams instance_events
#' @param stamp Poll counter (ignored).
#'
#' @return A data frame.
#' @export
instance_log <- function(store = ".runs", instance = "instance", stamp = NULL) {
  ev <- instance_events(store, instance)
  if (!nrow(ev)) {
    return(ev)
  }
  ev[
    rev(seq_len(nrow(ev))),
    c("ts", "task", "element", "field", "value", "actor", "ref")
  ]
}

#' Overlay an instance's events onto a process definition
#'
#' The counterpart of [apply_assignments()]: same result shape, but the instance columns
#' come from the store instead of from block state. Exported because the instance
#' state block's expression calls it at evaluation time.
#'
#' @param df A wide process table (the definition).
#' @inheritParams instance_events
#' @param stamp Poll counter (ignored).
#'
#' @return The wide table with `assignee`, `due`, `status` and `instance` applied.
#' @export
apply_events <- function(df, store = ".runs", instance = "instance", stamp = NULL) {
  stopifnot(is.data.frame(df))
  if (!"task" %in% names(df)) {
    return(df)
  }
  state <- instance_state(store, instance)

  for (col in c("assignee", "due", "status")) {
    if (!col %in% names(df)) df[[col]] <- ""
    df[[col]] <- as.character(df[[col]])
    df[[col]][is.na(df[[col]])] <- ""
  }
  df$status[!nzchar(df$status)] <- "open"
  df$instance <- instance

  for (i in seq_len(nrow(df))) {
    s <- state[[df$task[i]]]
    if (is.null(s)) next
    for (col in c("assignee", "due", "status")) {
      if (!is.null(s[[col]])) df[[col]][i] <- s[[col]]
    }
  }
  df
}

#' Overlay an instance's events onto an expanded instance table
#'
#' The multi-instance counterpart of [apply_events()]: rows of an
#' [expand_instance()] table are keyed by (task, element), and so are the events
#' folded onto them. Single rows (no `element`) read the same events
#' [apply_events()] reads, so the two views can never disagree.
#'
#' @param instance_table An expanded instance table (see [expand_instance()]).
#' @inheritParams instance_events
#' @param stamp Poll counter (ignored).
#'
#' @return `instance_table` with `assignee`, `due`, `status` folded from the store.
#' @export
#' @keywords internal
apply_events_instance <- function(instance_table, store = ".runs", instance = "instance",
                             stamp = NULL) {
  stopifnot(is.data.frame(instance_table))
  if (!nrow(instance_table) || !"task" %in% names(instance_table)) {
    return(instance_table)
  }
  state <- instance_state(store, instance)

  inst <- if ("element" %in% names(instance_table)) {
    as.character(instance_table$element)
  } else {
    rep(NA_character_, nrow(instance_table))
  }
  keys <- event_key(as.character(instance_table$task), inst)

  for (col in c("assignee", "due", "status")) {
    if (!col %in% names(instance_table)) instance_table[[col]] <- ""
    instance_table[[col]] <- as.character(instance_table[[col]])
    instance_table[[col]][is.na(instance_table[[col]])] <- ""
  }
  instance_table$status[!nzchar(instance_table$status)] <- "open"

  for (i in seq_len(nrow(instance_table))) {
    s <- state[[keys[i]]]
    if (is.null(s)) next
    for (col in c("assignee", "due", "status")) {
      if (!is.null(s[[col]])) instance_table[[col]][i] <- s[[col]]
    }
  }
  instance_table
}
