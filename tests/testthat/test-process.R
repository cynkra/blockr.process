eval_plain <- function(expr) eval(expr, envir = baseenv())

test_that("tasks_to_table round-trips the example", {
  tbl <- tasks_to_table(example_tasks())
  ref <- example_process()
  expect_equal(tbl$task, ref$task)
  expect_equal(tbl$depends_on, ref$depends_on)
  expect_equal(tbl$role, ref$role)
})

test_that("tasks_to_table tolerates junk", {
  expect_equal(nrow(tasks_to_table(list())), 0)
  expect_equal(nrow(tasks_to_table("nope")), 0)
  # task without id dropped, duplicate ids deduped, missing fields empty
  tbl <- tasks_to_table(list(
    list(task = "a", name = "A"),
    list(name = "no id"),
    list(task = "a", name = "dup"),
    list(task = "b")
  ))
  expect_equal(tbl$task, c("a", "b"))
  expect_equal(tbl$script, c("", ""))
})

test_that("make_process_expr embeds the tasks as a literal", {
  ex <- make_process_expr(list(list(task = "x", name = "X", role = "",
                                    dep = "", script = "")))
  out <- eval_plain(ex)
  expect_equal(out$task, "x")
  # empty state evaluates to an empty table, not an error
  expect_equal(nrow(eval_plain(make_process_expr(list()))), 0)
})

test_that("process block server emits the table from constructor state", {
  blk <- new_process_block(tasks = list(
    list(task = "a", name = "A", role = "analyst", dep = "", script = ""),
    list(task = "b", name = "B", role = "system", dep = "a", script = "b.R")
  ))
  shiny::testServer(blk$expr_server, {
    session$flushReact()
    out <- eval_plain(session$returned$expr())
    expect_equal(out$task, c("a", "b"))
    expect_equal(out$depends_on, c("", "a"))
  })
})

test_that("tasks_to_table carries the group columns", {
  tbl <- tasks_to_table(list(
    list(task = "g1", name = "for each unit", collection = "unit"),
    list(task = "a", name = "A", parent = "g1"),
    list(task = "b", name = "B")
  ))

  expect_equal(tbl$collection, c("unit", "", ""))
  expect_equal(tbl$parent, c("", "g1", ""))
  expect_equal(unname(multi_tasks(tbl)), c("", "unit", ""))
  # `params` left the editor: it is a panel on a selected task, not a column
  expect_false("params" %in% names(tbl))
})
