#' Instance block (JS-driven)
#'
#' The skeleton brought to life: receives the wide process table, lets
#' people assign `assignee`, `due` and advance `status` per task, and emits the
#' table with the instance columns applied. Statuses `blocked` and `skipped` are
#' computed from the dependency gates, never stored. Tasks whose outcome
#' other tasks consume (checks) finish with an outcome label
#' (`true`/`false` by convention) instead of `done`.
#'
#' The control UI is a JavaScript task list (`inst/js/assign-block.js`); R
#' receives the assignments as JSON and turns them into an
#' [apply_assignments()] expression.
#'
#' `assignee` is a free-text field unless the incoming column is a **factor**, in
#' which case its levels are the roster and the field becomes a picker. The
#' allowed values are a property of the data, not of this block: declare them
#' upstream with a stock mutate block,
#' `assignee = factor(NA_character_, levels = c("ana", "ben"))`.
#'
#' @param assignments Named list: task id -> `list(assignee =, due =, status =)`.
#' @param ... Forwarded to [blockr.core::new_transform_block()].
#'
#' @export
new_assign_block <- function(assignments = list(), ...) {
  new_js_transform_block(
    class = "assign_block",
    name = "assign",
    state = list(assignments = assignments),
    expr_fn = function(s) make_assign_expr(s$assignments %||% list()),
    columns_meta = build_tasks_meta,
    # `assignments` is a named object; an empty R list would serialize as
    # `[]` -- force `{}` so the JS side always sees an object.
    normalize_state = function(s) {
      if (!length(s$assignments)) s$assignments <- stats::setNames(list(), character(0))
      s
    },
    # the roster picker is the shared Select component
    shared_deps = "select",
    ...
  )
}

#' The quarterly example's instance data as an assignments list
#'
#' The life columns of [example_process()] in the shape the instance
#' block stores: task id -> assignee/due/status. Used to seed demo boards.
#'
#' @return A named list of assignments as expected by [new_assign_block()].
#' @export
#' @keywords internal
example_assignments <- function() {
  df <- example_process()
  out <- lapply(seq_len(nrow(df)), function(i) {
    a <- list(assignee = df$assignee[i], due = df$due[i], status = df$status[i])
    a[vapply(a, nzchar, logical(1))]
  })
  names(out) <- df$task
  out[lengths(out) > 0]
}
