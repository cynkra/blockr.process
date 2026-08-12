eval_bquoted <- function(expr, df) {
  resolved <- do.call(bquote, list(expr, list(data = as.name("data"))))
  eval(resolved, envir = list(data = df))
}

test_that("apply_assignments creates instance columns and applies assignments", {
  df <- example_process()[, c("task", "name", "role", "depends_on", "script")]
  out <- apply_assignments(df, list(
    reconcile = list(assignee = "ben", status = "doing"),
    qa_check = list(status = "false")
  ))
  expect_true(all(c("assignee", "due", "status") %in% names(out)))
  expect_equal(out$assignee[out$task == "reconcile"], "ben")
  expect_equal(out$status[out$task == "qa_check"], "false")
  expect_equal(out$status[out$task == "deliver"], "open")
})

test_that("apply_assignments is a no-op on empty assignments and odd input", {
  df <- example_process()
  expect_equal(apply_assignments(df, list())$status, df$status)
  # unknown task ids are ignored, partial assignments merge
  out <- apply_assignments(df, list(nope = list(status = "done")))
  expect_equal(out$status, df$status)
  # non-process data passes through untouched
  expect_equal(apply_assignments(mtcars), mtcars)
})

test_that("make_assign_expr builds a self-contained expression", {
  df <- example_process()

  # empty state: pass-through via apply_assignments(df)
  out <- eval_bquoted(make_assign_expr(list()), df)
  expect_equal(out$status, df$status)

  a <- list(approve = list(assignee = "mira", status = "doing"))
  out <- eval_bquoted(make_assign_expr(a), df)
  expect_equal(out$assignee[out$task == "approve"], "mira")
  expect_equal(out$status[out$task == "approve"], "doing")
})

test_that("instance block server produces the expression from constructor state", {
  blk <- new_assign_block(
    assignments = list(reconcile = list(status = "done"))
  )
  shiny::testServer(
    blk$expr_server,
    args = list(data = shiny::reactive(example_process())),
    {
      session$flushReact()
      out <- eval_bquoted(session$returned$expr(), example_process())
      expect_equal(out$status[out$task == "reconcile"], "done")
    }
  )
})

test_that("tasks meta ships gates and outcomes", {
  meta <- build_tasks_meta(example_process())
  byid <- setNames(meta$tasks, vapply(meta$tasks, `[[`, "", "task"))
  expect_setequal(unlist(byid$qa_check$outcomes), c("true", "false"))
  expect_equal(byid$reconcile$gates[[1]]$label, "false")
  # non-process data degrades to empty meta, not an error
  expect_equal(build_tasks_meta(mtcars), list(tasks = list(), levels = setNames(list(), character())))
})

test_that("a factor instance column ships its levels as the field's vocabulary", {
  df <- example_process()

  # plain character: no vocabulary, the field stays free text
  expect_length(build_tasks_meta(df)$levels, 0L)

  # a factor `assignee` (declared upstream by a mutate block) IS the roster
  df$assignee <- factor(df$assignee, levels = c("ana", "ben", "mira"))
  lv <- build_tasks_meta(df)$levels
  expect_named(lv, "assignee")
  expect_equal(unlist(lv$assignee), c("ana", "ben", "mira"))

  # levels the data never uses still count: an empty column can carry a
  # roster, which is how the demo board declares one
  df$assignee <- factor(NA_character_, levels = c("bea", "cem"))
  expect_equal(unlist(build_tasks_meta(df)$levels$assignee), c("bea", "cem"))

  # and every instance column is eligible, not just `assignee`
  df$status <- factor(df$status, levels = c("open", "doing", "true", "false"))
  expect_setequal(names(build_tasks_meta(df)$levels), c("assignee", "status"))
})

test_that("apply_assignments accepts a factor instance column", {
  df <- example_process()
  df$assignee <- factor(df$assignee, levels = c("ana", "ben", "mira"))
  out <- apply_assignments(df, list(approve = list(assignee = "ana")))
  expect_equal(out$assignee[out$task == "approve"], "ana")
  expect_type(out$assignee, "character")
})
