`%||%` <- function(x, y) if (is.null(x)) y else x

#' Apply instance assignments to a wide process table
#'
#' The instance block's workhorse, exported because the block's expression calls
#' it at evaluation time. Ensures the instance columns (`assignee`, `due`, `status`)
#' exist and overrides them per task from `assignments`.
#'
#' @param df A wide process table (one row per task).
#' @param assignments Named list: task id -> `list(assignee =, due =, status =)`.
#'   Missing fields leave the table value untouched.
#'
#' @return The wide table with instance columns applied.
#'
#' @export
#' @keywords internal
apply_assignments <- function(df, assignments = list()) {
  stopifnot(is.data.frame(df))
  if (!"task" %in% names(df)) {
    return(df)
  }

  for (col in c("assignee", "due", "status")) {
    if (!col %in% names(df)) df[[col]] <- ""
    df[[col]] <- as.character(df[[col]])
    df[[col]][is.na(df[[col]])] <- ""
  }
  df$status[!nzchar(df$status)] <- "open"

  if (!is.list(assignments)) assignments <- list()
  for (task in names(assignments)) {
    i <- which(df$task == task)
    if (!length(i)) next
    a <- assignments[[task]]
    for (col in c("assignee", "due", "status")) {
      v <- a[[col]]
      if (!is.null(v) && length(v) == 1 && !is.na(v)) {
        df[[col]][i] <- as.character(v)
      }
    }
  }
  df
}

#' Build the instance block expression
#'
#' Pure function: assignments in, quoted code out. The assignments list is
#' embedded as a literal so the resulting expression is self-contained and
#' readable in the board's code view.
#'
#' @param assignments Named list of per-task assignments (see [apply_assignments()]).
#' @noRd
make_assign_expr <- function(assignments = list()) {
  if (!is.list(assignments) || !length(assignments)) {
    return(bbquote(blockr.process::apply_assignments(.(data))))
  }
  bbquote(
    blockr.process::apply_assignments(.(data), assignments = .(a)),
    list(a = assignments)
  )
}

#' Task metadata pushed to the instance block's JS on every data change
#'
#' Repurposes the factory's `<name>-columns` channel: the instance block needs the
#' ROWS (one entry per task, gates and outcomes reading from the process table) and,
#' alongside them, the vocabulary of any column that HAS one.
#'
#' An instance column's allowed values are not blockr.process's business: they are
#' a property of the data, and R already has a type that carries them. If
#' `assignee` arrives as a factor, its levels are the roster and the field becomes
#' a picker; if it arrives as plain character, it stays free text. Upstream
#' declares the roster with a stock mutate block:
#'
#'     assignee = factor(NA_character_, levels = c("ana", "ben", "mira", "theo"))
#'
#' (a *new* column, since `assignee` is created by [apply_assignments()] downstream of the
#' process table -- the mutate block is where the roster is declared, not
#' where an existing column is converted).
#'
#' @param df The incoming wide process table.
#' @noRd
build_tasks_meta <- function(df) {
  if (!is.data.frame(df) || !all(c("task", "name") %in% names(df)) ||
      !nrow(df)) {
    return(list(tasks = list(), levels = stats::setNames(list(), character())))
  }
  list(
    tasks = process_tasks(df),
    levels = build_run_levels(df)
  )
}

#' Factor levels of the instance columns, for the fields that should be pickers
#' @noRd
build_run_levels <- function(df) {
  cols <- intersect(c("assignee", "due", "status"), names(df))
  lv <- lapply(cols, function(col) {
    if (is.factor(df[[col]])) I(as.list(levels(df[[col]]))) else NULL
  })
  names(lv) <- cols
  lv <- lv[lengths(lv) > 0]
  if (!length(lv)) stats::setNames(list(), character()) else lv
}

#' Turn a tasks list into the wide process table
#'
#' Exported because the process block's expression calls it at evaluation
#' time. Tolerant of partially-edited tasks: missing fields become empty
#' strings, tasks without an id are dropped.
#'
#' @param tasks List of `list(task =, name =, role =, dep =, parent =,
#'   collection =, script =, join =, complete_when =, sequential =)`. A task
#'   with a non-empty `collection` is a multi-instance sub-process -- a
#'   container, not work -- and the tasks whose `parent` names it run once
#'   per element of that collection (see [process_groups()]). The
#'   value of `collection` names the collection *type* (`unit`); the
#'   concrete list is instance data, bound when an instance starts.
#'
#'   `join`, `complete_when` and `sequential` are the optional columns: they
#'   only reach the table when at least one task sets them, so a process
#'   that takes every default still reads as seven columns.
#'
#' @return The wide process table (a data frame).
#'
#' @export
#' @keywords internal
tasks_to_table <- function(tasks = list()) {
  if (!is.list(tasks)) tasks <- list()
  chr <- function(x) {
    if (is.null(x) || !length(x) || is.na(x[1])) "" else as.character(x[1])
  }
  core <- c("task", "name", "role", "depends_on", "script", "parent",
            "collection")
  opt <- c("join", "complete_when", "sequential")

  rows <- lapply(tasks, function(s) {
    if (!is.list(s) || !nzchar(chr(s$task))) return(NULL)
    data.frame(
      task = chr(s$task),
      name = chr(s$name),
      role = chr(s$role),
      depends_on = chr(s$dep),
      script = chr(s$script),
      parent = chr(s$parent),
      collection = chr(s$collection),
      join = chr(s$join),
      complete_when = chr(s$complete_when),
      sequential = chr(s$sequential),
      stringsAsFactors = FALSE
    )
  })
  rows <- Filter(Negate(is.null), rows)
  if (!length(rows)) {
    empty <- lapply(core, function(x) character(0))
    return(as.data.frame(stats::setNames(empty, core), stringsAsFactors = FALSE))
  }
  out <- do.call(rbind, rows)
  out <- out[!duplicated(out$task), , drop = FALSE]
  # an all-default optional column is noise in the table view, and every
  # reader treats absent and default the same
  keep <- c(core, opt[vapply(opt, function(nm) any(nzchar(out[[nm]])), logical(1))])
  out <- out[, keep, drop = FALSE]
  if ("sequential" %in% keep) {
    out$sequential <- tolower(out$sequential) %in% c("true", "yes", "1")
  }
  out
}

#' Build the process block expression
#' @param tasks Tasks list (see [tasks_to_table()]).
#' @noRd
make_process_expr <- function(tasks = list()) {
  bquote(blockr.process::tasks_to_table(.(s)), list(s = tasks))
}
