# The worker: the only thing in the package that executes anything.
#
# No shiny, no board, no widget. It reads the definition, folds the instance
# store, asks the process table which tasks are ready, runs the ones whose
# role is `system`, and appends what happened. A task belonging to a person
# stops it; that person's event lets it continue.
#
# Deliberately boring, and deliberately outside the app: a live Shiny
# session never holds workflow state, so closing the browser does not stop
# a production instance. The worker is the process that is allowed to run
# code, and it is the only one -- which is why the safety rules (the jobs
# directory is a jail, one worker per store, a task is tried a bounded
# number of times) live here rather than in the board.

#' Is this task the worker's to run?
#' @noRd
is_system_task <- function(df, task) {
  i <- match(task, df$task)
  if (is.na(i)) {
    return(FALSE)
  }
  role <- if ("role" %in% names(df)) df$role[i] else ""
  script <- if ("script" %in% names(df)) df$script[i] else ""
  isTRUE(!is.na(role) && role == "system" && !is.na(script) && nzchar(script))
}

#' One cell of the definition, as a scalar
#' @noRd
task_cell <- function(df, task, col, default = "") {
  if (!col %in% names(df)) {
    return(default)
  }
  i <- match(task, df$task)
  if (is.na(i)) {
    return(default)
  }
  v <- df[[col]][i]
  if (is.na(v) || !nzchar(as.character(v))) default else as.character(v)
}

#' How many times has this task been started before?
#' @noRd
attempt_count <- function(store, instance, task, element = NULL) {
  ev <- instance_events(store, instance)
  if (!nrow(ev)) {
    return(0L)
  }
  same <- if (is.null(element) || is.na(element)) {
    is.na(ev$element)
  } else {
    !is.na(ev$element) & ev$element == element
  }
  sum(ev$task == task & same & ev$field == "status" & ev$value == "doing")
}

#' `full_reconciliation=TRUE` -> `PROC_PARAM_FULL_RECONCILIATION=TRUE`
#'
#' Semicolon-separated `key=value` pairs. This is how a parameter reaches a
#' script without anyone editing the script: the value is a property of the
#' task, the script only reads its environment.
#' Returns a NAMED vector (`c(PROC_PARAM_FULL_RECONCILIATION = "TRUE")`),
#' because that is what [set_proc_env()] wants.
#' @noRd
param_env <- function(params) {
  if (is.null(params) || is.na(params) || !nzchar(params)) {
    return(character())
  }
  toks <- trimws(strsplit(params, ";")[[1]])
  toks <- toks[nzchar(toks)]
  if (!length(toks)) {
    return(character())
  }
  kv <- lapply(toks, function(t) trimws(strsplit(t, "=", fixed = TRUE)[[1]]))
  stats::setNames(
    vapply(kv, function(p) if (length(p) > 1L) p[2L] else "", character(1)),
    vapply(kv, function(p) paste0("PROC_PARAM_", toupper(p[1L])), character(1))
  )
}

#' Put the task's contract where a child process will actually find it
#'
#' `system2(env =)` looks like the obvious way to hand `PROC_*` to a script,
#' and on a Unix-alike it is. On Windows it is not: R documents that `env`
#' there reaches only commands that accept `NAME=VALUE` on their own command
#' line, and `Rscript` does not -- so every variable went missing, every
#' script wrote to `file.path("", ...)`, and every script task failed. Set
#' them in this process instead and the child inherits them, which is true
#' on every platform.
#'
#' The worker is single-threaded and restores the previous values on the way
#' out (see the `on.exit()` in [run_script_task()]), so the pollution lasts
#' exactly as long as the subprocess.
#'
#' @param vars Named character vector.
#' @return The previous values -- `NA` where a variable was unset -- to hand
#'   to [restore_proc_env()].
#' @noRd
set_proc_env <- function(vars) {
  if (!length(vars)) {
    return(character())
  }
  old <- Sys.getenv(names(vars), unset = NA_character_, names = TRUE)
  do.call(Sys.setenv, as.list(vars))
  old
}

#' @noRd
restore_proc_env <- function(old) {
  if (!length(old)) {
    return(invisible(NULL))
  }
  had <- !is.na(old)
  if (any(had)) do.call(Sys.setenv, as.list(old[had]))
  if (any(!had)) Sys.unsetenv(names(old)[!had])
  invisible(NULL)
}

#' A check reports its answer on stdout: `::process-output status=false::`
#' @noRd
parse_step_output <- function(logfile) {
  if (!file.exists(logfile)) {
    return(NULL)
  }
  lines <- readLines(logfile, warn = FALSE)
  hits <- unlist(regmatches(
    lines, regexpr("::process-output status=[^:]+::", lines)
  ))
  if (!length(hits)) {
    return(NULL)
  }
  sub("::$", "", sub("^::process-output status=", "", utils::tail(hits, 1)))
}

# ---- what may be executed, and with what -------------------------------

#' How a script file is executed, by extension
#'
#' The worker runs files, not commands: the `script` column of a process
#' table names a file inside the jobs directory, and its extension picks the
#' interpreter. Pass your own list to [run_worker()] to add one (`list(jl =
#' list(command = "julia", args = character()))`); the names are lowercase
#' extensions.
#'
#' `Rscript --vanilla` on purpose: a script that needs a package environment
#' should say so itself (`renv::load()` on line one), so that what ran is
#' visible in the script rather than in the worker's shell.
#'
#' @return A named list of `list(command, args)`.
#' @export
process_interpreters <- function() {
  list(
    r = list(
      command = file.path(R.home("bin"), "Rscript"), args = "--vanilla"
    ),
    sh = list(command = Sys.which("sh"), args = character()),
    py = list(command = Sys.which("python3"), args = character())
  )
}

#' Resolve a script name against the jobs directory
#'
#' The jobs directory is a jail. A process definition is edited in a
#' browser by whoever may edit processes, and the worker runs on a machine
#' that can reach the data -- so `script` is a name *inside* `jobs`, never a
#' path out of it. Absolute paths, `~` and any `..` segment are refused
#' before the filesystem is touched, and the resolved path is checked to be
#' under the resolved root afterwards, which also catches a symlink pointing
#' out of the jail.
#'
#' @param jobs Directory holding the scripts.
#' @param script Value of the task's `script` column.
#'
#' @return The absolute path of the script.
#' @noRd
resolve_script <- function(jobs, script) {
  if (is.null(script) || is.na(script) || !nzchar(script)) {
    stop("no script given", call. = FALSE)
  }
  if (grepl("^([/\\\\~]|[A-Za-z]:)", script)) {
    stop("script must be a name inside the jobs directory, not a path: ",
         script, call. = FALSE)
  }
  parts <- strsplit(script, "[/\\\\]")[[1]]
  if (any(parts == "..")) {
    stop("script must not leave the jobs directory: ", script, call. = FALSE)
  }
  if (!dir.exists(jobs)) {
    stop("jobs directory does not exist: ", jobs, call. = FALSE)
  }
  root <- normalizePath(jobs, winslash = "/", mustWork = TRUE)
  path <- suppressWarnings(
    normalizePath(file.path(root, script), winslash = "/", mustWork = FALSE)
  )
  if (!file.exists(path)) {
    stop("script not found in jobs directory: ", script, call. = FALSE)
  }
  if (!startsWith(path, paste0(sub("/$", "", root), "/"))) {
    stop("script resolves outside the jobs directory: ", script, call. = FALSE)
  }
  path
}

#' Resolve `pkg::fun` against the worker's package allowlist
#'
#' The second thing a `script` cell may be: a function in an installed
#' package, rather than a file in the jobs directory. Better for a
#' deployment -- the package is already in the image, `packageVersion()` is a
#' truer `code_version` than a hash of a folder, and the function is
#' testable and documented like any other.
#'
#' It needs its own jail, and for the same reason the jobs directory has
#' one: the `script` cell is edited in a browser. Left open, `pkg::fun`
#' would let whoever may edit a process call `system()` -- a bigger hole
#' than the path traversal the jobs jail closes. So a deployment declares
#' which packages may be reached (`run_worker(packages =)`), nothing is
#' callable by default, and the form is a strict `pkg::fun` -- no `:::`, no
#' arguments, no expression.
#'
#' @param script Value of the task's `script` column.
#' @param packages Character vector of allowed package names.
#'
#' @return `list(pkg, fun)`.
#' @noRd
resolve_function <- function(script, packages) {
  if (!grepl("^[a-zA-Z][a-zA-Z0-9.]*::[a-zA-Z._][a-zA-Z0-9._]*$", script)) {
    stop("not a plain 'pkg::fun' reference: ", script,
         " (no ':::', no arguments, no expression)", call. = FALSE)
  }
  parts <- strsplit(script, "::", fixed = TRUE)[[1]]
  pkg <- parts[[1]]
  fun <- parts[[2]]

  if (!length(packages)) {
    stop("this worker runs no package functions: pass ",
         "run_worker(packages = \"", pkg, "\") to allow it", call. = FALSE)
  }
  if (!pkg %in% packages) {
    stop("package '", pkg, "' is not in the worker's allowlist (",
         paste(packages, collapse = ", "), ")", call. = FALSE)
  }
  if (!requireNamespace(pkg, quietly = TRUE)) {
    stop("package '", pkg, "' is not installed on this worker", call. = FALSE)
  }
  if (!is.function(tryCatch(getExportedValue(pkg, fun),
                            error = function(e) NULL))) {
    stop("'", script, "' is not an exported function of '", pkg, "'",
         call. = FALSE)
  }
  list(pkg = pkg, fun = fun)
}

#' Is this `script` cell a package function rather than a file?
#' @noRd
is_function_script <- function(script) {
  !is.null(script) && !is.na(script) && grepl("::", script, fixed = TRUE)
}

#' Which interpreter runs this file
#' @noRd
script_interpreter <- function(path, interpreters) {
  ext <- tolower(sub("^.*\\.", "", basename(path)))
  it <- interpreters[[ext]]
  if (is.null(it) || !nzchar(it$command %||% "")) {
    stop("no interpreter for '.", ext, "' scripts", call. = FALSE)
  }
  it
}

#' Which version of the code ran
#'
#' Recorded on every attempt as a `code_version` event, so the log answers
#' "what exactly ran here" a year later. The git commit of the jobs
#' directory when it is a working tree, otherwise a content hash of the
#' scripts -- both are 8 hex characters, and neither claims more than
#' "these bytes, that day".
#'
#' @param jobs Directory holding the scripts.
#' @return An 8-character string, or `""` when the directory is unreadable.
#' @export
code_version <- function(jobs = ".") {
  if (!dir.exists(jobs)) {
    return("")
  }
  git <- Sys.which("git")
  if (nzchar(git)) {
    sha <- tryCatch(
      suppressWarnings(system2(
        git, c("-C", shQuote(normalizePath(jobs)), "rev-parse", "--short=8",
               "HEAD"),
        stdout = TRUE, stderr = FALSE
      )),
      error = function(e) character()
    )
    sha <- sha[nzchar(sha)]
    # a hex string and nothing else: an empty answer, an error message or a
    # stubbed-out git must not be recorded as a version
    if (length(sha) == 1L && grepl("^[0-9a-f]{7,40}$", sha)) {
      return(substr(sha, 1, 8))
    }
  }
  files <- sort(list.files(jobs, recursive = TRUE, full.names = TRUE))
  files <- files[!dir.exists(files)]
  if (!length(files)) {
    return("")
  }
  txt <- paste(
    basename(files),
    vapply(files, function(f) {
      paste(readLines(f, warn = FALSE), collapse = "\n")
    }, character(1)),
    collapse = "\x1e"
  )
  h <- 0
  for (b in utf8ToInt(txt)) {
    h <- (h * 31 + b) %% 268435456
  }
  sprintf("%08x", h)
}

# ---- one worker per store ----------------------------------------------

#' Take the worker lock on a store
#'
#' Two workers on one store both pick up the same ready task and run it
#' twice. The lock is a directory -- `dir.create()` is atomic on every
#' filesystem worth running this on -- holding an `owner` file that is
#' touched on every tick. A lock whose owner has not been touched for
#' `stale` seconds belonged to a worker that died, and is broken with a
#' message.
#'
#' @param store Store directory.
#' @param stale Seconds after which an untouched lock may be broken.
#' @param quiet Suppress messages.
#'
#' @return The lock directory path, invisibly.
#' @noRd
worker_lock <- function(store, stale = 120, quiet = FALSE) {
  dir.create(store, showWarnings = FALSE, recursive = TRUE)
  lock <- file.path(store, ".worker.lock")
  owner <- file.path(lock, "owner")
  got <- dir.create(lock, showWarnings = FALSE)

  if (!got) {
    age <- suppressWarnings(as.numeric(difftime(
      Sys.time(), file.info(owner)$mtime, units = "secs"
    )))
    if (is.na(age) || age > stale) {
      if (!quiet) {
        message("worker: breaking a stale lock (",
                if (is.na(age)) "no heartbeat file" else
                  paste0(round(age), "s without a heartbeat"), ")")
      }
      unlink(lock, recursive = TRUE)
      got <- dir.create(lock, showWarnings = FALSE)
    }
  }
  if (!got) {
    held <- tryCatch(readLines(owner, warn = FALSE), error = function(e) "?")
    stop("another worker is running on ", store, " (", paste(held, collapse = " "),
         "). Stop it, or pass lock = FALSE if you are certain.", call. = FALSE)
  }
  writeLines(
    c(paste0("pid=", Sys.getpid()),
      paste0("host=", Sys.info()[["nodename"]]),
      paste0("since=", format(Sys.time(), "%Y-%m-%dT%H:%M:%S"))),
    owner
  )
  invisible(lock)
}

#' @noRd
worker_heartbeat <- function(lock) {
  if (!is.null(lock) && dir.exists(lock)) {
    Sys.setFileTime(file.path(lock, "owner"), Sys.time())
  }
  invisible(NULL)
}

#' @noRd
worker_unlock <- function(lock) {
  if (!is.null(lock)) unlink(lock, recursive = TRUE)
  invisible(NULL)
}

#' Is a worker running on this store?
#'
#' Reads the lock a running [run_worker()] holds and touches on every tick.
#' A board can show it ("no worker is running, scripts will not start"), and
#' a script that would rather ingest the inbox itself can ask first.
#'
#' @param store Store directory.
#' @param stale Seconds without a heartbeat after which the answer is `FALSE`.
#'
#' @return `TRUE` or `FALSE`.
#' @export
worker_alive <- function(store = ".runs", stale = 120) {
  owner <- file.path(store, ".worker.lock", "owner")
  if (!file.exists(owner)) {
    return(FALSE)
  }
  age <- suppressWarnings(as.numeric(difftime(
    Sys.time(), file.info(owner)$mtime, units = "secs"
  )))
  !is.na(age) && age <= stale
}

# ---- running one task ---------------------------------------------------

#' Re-arm the checks a just-finished task loops back into
#'
#' The rework rule: `reconcile` finishes, so `qa_check` -- which already
#' holds a terminal `false` -- goes back to `open` and is run again. Without
#' this a loop is drawn but never travelled.
#'
#' @param df The table with the instance applied.
#' @param finished Task that just reached a terminal status.
#' @param element Element the task belongs to, or `NULL` for single tasks.
#'   Loops inside a multi-instance group are re-armed per element: sending
#'   one region back must not re-open the checks of the others.
#' @inheritParams instance_event
#'
#' @return Character vector of re-armed task ids, invisibly.
#' @export
#' @keywords internal
rearm_loops <- function(df, finished, store = ".runs", instance = "instance",
                        element = NULL) {
  tasks <- process_tasks(df)
  status <- if (is.null(element) || is.na(element)) {
    process_status(df)
  } else {
    # the element's own column of the expanded table
    tab <- instance_table(store, instance)
    if (!nrow(tab) || !"element" %in% names(tab)) {
      return(invisible(character()))
    }
    rows <- tab[!is.na(tab$element) & tab$element == element, , drop = FALSE]
    stats::setNames(as.character(rows$status), as.character(rows$task))
  }
  out <- character()
  for (s in tasks) {
    if (!finished %in% unlist(s$loops)) next
    st <- status[[s$task]]
    if (is.null(st) || st %in% c("open", "doing", "blocked")) next
    instance_event(s$task, "status", "open", "worker (re-arm)", store, instance,
                   element = element)
    out <- c(out, s$task)
  }
  invisible(out)
}

#' Run one script task
#'
#' @return `list(outcome, retry)` -- `retry` says the task was put back to
#'   `open` because it failed with attempts left.
#' @noRd
run_script_task <- function(task, df, store, instance, jobs, element = NULL,
                            interpreters = process_interpreters(),
                            packages = character(), version = "",
                            quiet = FALSE) {
  script <- task_cell(df, task, "script")
  params <- task_cell(df, task, "params")
  retries <- suppressWarnings(as.integer(task_cell(df, task, "retry", "0")))
  if (is.na(retries)) retries <- 0L
  limit <- suppressWarnings(as.numeric(task_cell(df, task, "timeout", "0")))
  if (is.na(limit) || limit <= 0) limit <- 0

  elem <- if (is.null(element) || is.na(element)) NULL else as.character(element)
  attempt <- attempt_count(store, instance, task, elem) + 1L
  tag <- if (is.null(elem)) task else paste0(task, "@", elem)

  logs <- file.path(store, instance, "logs")
  artifacts <- file.path(store, instance, "artifacts")
  dir.create(logs, showWarnings = FALSE, recursive = TRUE)
  dir.create(artifacts, showWarnings = FALSE, recursive = TRUE)
  logfile <- file.path(logs, sprintf("%s-%d.log", gsub("[^A-Za-z0-9_.@-]", "_", tag), attempt))

  instance_event(task, "status", "doing", "worker", store, instance, element = elem)
  instance_event(task, "attempt", attempt, "worker", store, instance, element = elem)

  # Refusing to run is an outcome like any other, and it belongs in the log
  # in the same shape as a crash: the task fails, the reason is readable,
  # nothing is executed.
  # Two things a `script` cell may be -- a file in the jobs directory, or a
  # function in an allowed package -- and each is resolved through its own
  # jail.
  spec <- tryCatch(
    if (is_function_script(script)) {
      ref <- resolve_function(script, packages)
      it <- interpreters[["r"]]
      list(
        command = it$command,
        args = c(it$args, "-e", shQuote(paste0(ref$pkg, "::", ref$fun, "()"))),
        label = script,
        version = paste(ref$pkg, as.character(utils::packageVersion(ref$pkg)))
      )
    } else {
      path <- resolve_script(jobs, script)
      it <- script_interpreter(path, interpreters)
      list(command = it$command, args = c(it$args, shQuote(path)),
           label = basename(path), version = version)
    },
    error = function(e) e
  )
  if (inherits(spec, "error")) {
    writeLines(paste0("blockr.process: ", conditionMessage(spec)), logfile)
    instance_event(task, "error", conditionMessage(spec), "worker", store,
                   instance, element = elem)
    instance_event(task, "log", rel_to_store(logfile, store), "worker", store,
                   instance, element = elem)
    instance_event(task, "status", "failed", "worker", store, instance,
                   element = elem)
    if (!quiet) message("* ", tag, " refused: ", conditionMessage(spec))
    return(list(outcome = "failed", retry = FALSE))
  }

  if (!quiet) {
    message("* ", tag, " -> ", spec$label,
            if (nzchar(params)) paste0(" [", params, "]") else "",
            if (attempt > 1) paste0(" (attempt ", attempt, ")") else "")
  }
  if (nzchar(spec$version)) {
    instance_event(task, "code_version", spec$version, "worker", store,
                   instance, element = elem)
  }

  # Set the contract in THIS process and let the child inherit it, rather
  # than passing `env =` to system2(). See set_proc_env(): on Windows that
  # argument reaches only commands that take `NAME=VALUE` on their own
  # command line, which Rscript does not.
  old_env <- set_proc_env(c(
    PROC_INSTANCE = instance,
    PROC_TASK = task,
    PROC_ELEMENT = elem %||% "",
    PROC_ATTEMPT = as.character(attempt),
    PROC_ARTIFACTS = artifacts,
    PROC_STORE = normalizePath(store, mustWork = FALSE),
    param_env(params)
  ))
  on.exit(restore_proc_env(old_env), add = TRUE)

  t0 <- Sys.time()
  code <- suppressWarnings(system2(
    spec$command,
    spec$args,
    stdout = logfile, stderr = logfile,
    timeout = limit
  ))
  took <- round(as.numeric(difftime(Sys.time(), t0, units = "secs")), 1)
  timed_out <- limit > 0 && identical(as.integer(code), 124L)

  outcome <- if (code != 0) "failed" else parse_step_output(logfile) %||% "done"

  instance_event(task, "log", rel_to_store(logfile, store), "worker", store,
                 instance, element = elem)
  instance_event(task, "took", paste0(took, "s"), "worker", store, instance,
                 element = elem)
  if (timed_out) {
    instance_event(task, "error", paste0("timeout after ", limit, "s"),
                   "worker", store, instance, element = elem)
  }
  instance_event(task, "status", outcome, "worker", store, instance,
                 element = elem)
  if (!quiet) {
    message("  ", outcome, if (timed_out) " (timeout)" else "", " in ", took,
            "s  (", logfile, ")")
  }

  # A failure with attempts left goes back to `open`: the retry is a
  # decision recorded in the log, not a loop hidden inside one tick.
  retry <- identical(outcome, "failed") && attempt <= retries
  if (retry) {
    instance_event(
      task, "status", "open",
      paste0("worker (retry ", attempt, "/", retries, ")"),
      store, instance, element = elem
    )
    if (!quiet) message("  retrying (", attempt, "/", retries, ")")
  } else if (!identical(outcome, "failed")) {
    rearm_loops(apply_events(df, store, instance), task, store, instance,
                element = elem)
  }
  list(outcome = outcome, retry = retry)
}

#' Path recorded in the log: relative to the store, so it survives a move
#' @noRd
rel_to_store <- function(path, store) {
  sub(paste0("^", store, "/?"), "", path)
}

# ---- the loop -----------------------------------------------------------

#' Everything that is ready, as (task, element) pairs
#' @noRd
ready_work <- function(process, store, instance) {
  inst <- instance_collection(store, instance)
  if (is.null(inst)) {
    # an unstamped store: the definition is the instance
    df <- apply_events(process, store, instance)
    st <- process_status(df)
    open <- names(st)[st == "open"]
    return(list(
      live = names(st)[st %in% c("open", "doing", "blocked")],
      ready = data.frame(
        task = open, element = rep(NA_character_, length(open)),
        stringsAsFactors = FALSE
      )
    ))
  }
  tab <- apply_events_instance(
    expand_instance(process, inst, instance), store, instance
  )
  disp <- instance_status(process, tab)
  elem <- if ("element" %in% names(tab)) {
    as.character(tab$element)
  } else {
    rep(NA_character_, nrow(tab))
  }
  open <- which(disp == "open")
  list(
    live = unique(as.character(tab$task[disp %in% c("open", "doing", "blocked")])),
    ready = data.frame(
      task = as.character(tab$task)[open], element = elem[open],
      stringsAsFactors = FALSE
    )
  )
}

#' One element at a time for a sequential group
#'
#' `sequential = TRUE` on a multi-instance group means BPMN's sequential
#' multi-instance: the elements run one after another. Without this the
#' worker would start twelve of them at once, which is exactly what the
#' definition asked it not to do.
#' @noRd
drop_parallel_elements <- function(mine, process) {
  if (!nrow(mine)) {
    return(mine)
  }
  seq_of <- process_sequential(process)
  seq_of <- seq_of[!duplicated(names(seq_of))]
  keep <- rep(TRUE, nrow(mine))
  for (t in unique(mine$task)) {
    if (!isTRUE(unname(seq_of[t]))) next
    rows <- which(mine$task == t)
    if (length(rows) > 1L) keep[rows[-1L]] <- FALSE
  }
  mine[keep, , drop = FALSE]
}

#' Run a process until it needs a person (or finishes)
#'
#' The worker is a plain R process: start it from cron, a systemd unit, a
#' Connect scheduled job or a second terminal. It holds no state of its own
#' -- everything it knows it read from the store, everything it did it wrote
#' there -- so killing it and starting it again loses nothing but the time
#' in between.
#'
#' On every tick it ingests the inbox ([ingest_inbox()]), folds the log,
#' and runs the ready tasks whose role is `system` and which name a script.
#' A ready task belonging to a person stops it (or, with `wait = TRUE`, it
#' waits for that person's event).
#'
#' @param process A wide process table (the definition).
#' @param store Instance store directory.
#' @param instance Instance id, or `"latest"` for the newest instance in the
#'   store.
#' @param jobs Directory holding the scripts named in the `script` column.
#'   Scripts are resolved inside it and nowhere else.
#' @param wait Poll for human events instead of returning at the first task
#'   a person owns.
#' @param tick Poll interval in seconds.
#' @param timeout Give up waiting after this many seconds.
#' @param lock Take the worker lock, so a second worker on the same store
#'   refuses to start.
#' @param inbox Ingest the file inbox on every tick.
#' @param interpreters Extension -> interpreter map, see
#'   [process_interpreters()].
#' @param packages Packages whose functions a `script` cell may name
#'   (`"mypkg::forecast"`). The allowlist for the function form, and the
#'   counterpart of `jobs` for the file form: empty by default, so a
#'   deployment has to say which code it is willing to run.
#' @param quiet Suppress progress messages.
#'
#' @return The table with the instance applied, invisibly.
#'
#' @examples
#' store <- tempfile()
#' jobs <- tempfile()
#' dir.create(jobs)
#' writeLines("cat('hello\n')", file.path(jobs, "hello.R"))
#'
#' process <- data.frame(
#'   task = "greet", name = "Greet", role = "system",
#'   depends_on = "", script = "hello.R"
#' )
#' run_worker(process, store = store, jobs = jobs, wait = FALSE, quiet = TRUE)
#' instance_log(store, "instance")[, c("task", "field", "value")]
#'
#' @export
run_worker <- function(process, store = ".runs", instance = "instance",
                       jobs = ".", wait = TRUE, tick = 2, timeout = 900,
                       lock = TRUE, inbox = TRUE,
                       interpreters = process_interpreters(),
                       packages = character(), quiet = FALSE) {
  stopifnot(is.data.frame(process))
  dir.create(store, showWarnings = FALSE, recursive = TRUE)
  instance <- resolve_instance(store, instance)

  held <- if (isTRUE(lock)) worker_lock(store, quiet = quiet) else NULL
  on.exit(worker_unlock(held), add = TRUE)

  version <- code_version(jobs)
  if (!quiet) {
    message("worker: instance=", instance, " store=", store, " jobs=", jobs,
            if (nzchar(version)) paste0(" code=", version) else "")
  }
  waited <- 0

  repeat {
    worker_heartbeat(held)
    if (isTRUE(inbox)) ingest_inbox(store, quiet = quiet)

    df <- apply_events(process, store, instance)
    work <- ready_work(process, store, instance)

    if (!length(work$live)) {
      if (!quiet) message("worker: process complete")
      return(invisible(apply_events(process, store, instance)))
    }

    ready <- work$ready
    is_mine <- vapply(ready$task, function(s) is_system_task(df, s), logical(1))
    mine <- drop_parallel_elements(ready[is_mine, , drop = FALSE], process)

    if (nrow(mine)) {
      backoff <- FALSE
      for (i in seq_len(nrow(mine))) {
        res <- run_script_task(
          mine$task[i], df, store, instance, jobs,
          element = mine$element[i], interpreters = interpreters,
          packages = packages, version = version, quiet = quiet
        )
        backoff <- backoff || isTRUE(res$retry)
      }
      waited <- 0
      if (backoff) Sys.sleep(tick)
      next
    }

    # Two kinds of "not mine", and confusing them is what makes a stuck
    # process unreadable: a task with a person's role waits for a person, a
    # `system` task with no script waits for a message from outside (see
    # [ingest_inbox()]) and no amount of waiting by a person will do.
    theirs <- unique(ready$task[!is_mine])
    outside <- theirs[vapply(
      theirs, function(s) identical(task_cell(df, s, "role"), "system"),
      logical(1)
    )]
    theirs_label <- function() {
      paste(c(
        if (length(setdiff(theirs, outside))) {
          paste0("people on: ", paste(setdiff(theirs, outside), collapse = ", "))
        },
        if (length(outside)) {
          paste0("messages on: ", paste(outside, collapse = ", "))
        }
      ), collapse = "; ")
    }
    if (!length(theirs)) {
      if (!quiet) {
        message("worker: nothing ready and no human task -- stuck on: ",
                paste(work$live, collapse = ", "))
      }
      return(invisible(apply_events(process, store, instance)))
    }

    if (!wait) {
      if (!quiet) {
        message("worker: waiting for ", theirs_label())
      }
      return(invisible(apply_events(process, store, instance)))
    }
    if (waited == 0 && !quiet) {
      message("worker: waiting for ", theirs_label())
    }
    Sys.sleep(tick)
    waited <- waited + tick
    if (waited >= timeout) {
      if (!quiet) message("worker: gave up waiting after ", timeout, "s")
      return(invisible(apply_events(process, store, instance)))
    }
  }
}

#' A person acts on a task
#'
#' The other writer of the instance store. This is exactly what the tasks
#' block's status chip calls, and what a command line or an inbox message
#' ends up calling: the worker cannot tell the difference.
#'
#' @param task Task id.
#' @param status New status (`doing`, `done`, or a check's outcome label).
#' @param assignee Person the task is assigned to.
#' @param due Deadline.
#' @param actor Who wrote the event; defaults to `assignee`.
#' @param process The definition, needed to re-arm loops.
#' @param element Element id when the task is multi-instance; `NULL` for
#'   single tasks.
#' @inheritParams instance_event
#'
#' @return `status`, invisibly.
#' @export
process_act <- function(task, status = "done", assignee = NULL, due = NULL,
                        actor = NULL, store = ".runs", instance = "instance",
                        process = NULL, element = NULL) {
  actor <- actor %||% assignee %||% "human"
  instance <- resolve_instance(store, instance)
  if (!is.null(assignee)) {
    instance_event(task, "assignee", assignee, actor, store, instance,
                   element = element)
  }
  if (!is.null(due)) {
    instance_event(task, "due", due, actor, store, instance, element = element)
  }
  if (!is.null(status)) {
    instance_event(task, "status", status, actor, store, instance,
                   element = element)
  }

  if (!is.null(process)) {
    rearm_loops(apply_events(process, store, instance), task, store, instance,
                element = element)
  }
  invisible(status)
}
