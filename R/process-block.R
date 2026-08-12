#' Process block (JS-driven editor)
#'
#' Design a process as a list of tasks: name, role, dependencies (with
#' optional outcome qualifiers -- pick "QA check · only true" to hang a task
#' off one branch of a check) and, for `system` tasks, the script to run.
#' The block emits the wide process table; the diagram and the instance views
#' downstream redraw as you edit.
#'
#' The control UI is the minidag rail (`blockr.outline::minidag_rail_dep()`)
#' driven by a process adapter (`inst/js/process-block.js`): tasks are rows in
#' flow order, dependencies are the rail drawn beside them, and the gestures
#' are the board editor's -- drag a task's dot onto another row to make it
#' depend on it, release on empty canvas to append a task, hover a rail edge
#' for the ✕.
#'
#' The part of a process that repeats is a group: select the rows, press
#' "Group them", and they sit inside a multi-instance sub-process whose
#' header names the collection it runs once per. That frame is not a UI
#' invention -- it is how BPMN models a fan-out -- and it is the only place
#' the collection is named, so two tasks can no longer disagree about what
#' the process repeats over.
#'
#' @param tasks List of tasks, each `list(task =, name =, role =, dep =,
#'   script =, parent =, collection =)` where `dep` is the comma-separated
#'   `depends_on` string (outcome qualifiers as `task:label`), `collection`
#'   marks the row as a multi-instance sub-process and names what it repeats
#'   over, and `parent` puts a task inside one. Defaults to the quarterly
#'   production example.
#' @param ... Forwarded to [blockr.core::new_data_block()].
#'
#' @export
new_process_block <- function(tasks = example_tasks(), ...) {
  new_js_data_block(
    class = "process_block",
    name = "process",
    state = list(tasks = tasks),
    expr_fn = function(s) make_process_expr(s$tasks %||% list()),
    # `tasks` is an array of objects; force `[]` over `{}` when empty and
    # keep dep strings scalars.
    normalize_state = function(s) {
      if (!length(s$tasks)) s$tasks <- list()
      s
    },
    # the editor IS blockr.outline's minidag rail, driven by a process adapter
    extra_deps = blockr.outline::minidag_rail_dep(),
    ...
  )
}

#' The quarterly example as a tasks list (the process block's default)
#'
#' @return A list of tasks as expected by [new_process_block()].
#' @export
example_tasks <- function() {
  df <- example_process()
  col <- function(nm, i) if (nm %in% names(df)) df[[nm]][i] else ""
  lapply(seq_len(nrow(df)), function(i) {
    list(
      task = df$task[i],
      name = df$name[i],
      role = df$role[i],
      dep = df$depends_on[i],
      script = df$script[i],
      parent = col("parent", i),
      collection = col("collection", i)
    )
  })
}
