# The store with elements, and an instance's life from creation on.

unit_process <- function() {
  data.frame(
    task = c("delivery", "review", "approve_data", "consolidate"),
    name = c("Delivery", "Review data",
             "Approve data", "Consolidate"),
    role = c("system", "analyst", "steward", "system"),
    depends_on = c("", "delivery", "review", "approve_data"),
    script = c("", "", "", "consolidate.R"),
    per = c("unit", "unit", "", ""),
    stringsAsFactors = FALSE
  )
}

test_that("element events round-trip and old logs read as NA", {
  store <- withr::local_tempdir()

  instance_event("delivery", "status", "done", "uploadplattform", store, "2026",
            element = "northside")
  instance_event("approve_data", "assignee", "mira", "board", store, "2026")

  ev <- instance_events(store, "2026")
  expect_equal(nrow(ev), 2L)
  expect_equal(ev$element, c("northside", NA_character_))

  # a single-task event carries no element key at all in the log
  lines <- readLines(file.path(store, "events.jsonl"))
  expect_false(grepl("element", lines[2], fixed = TRUE))
})

test_that("apply_events stays blind to element events", {
  store <- withr::local_tempdir()
  p <- unit_process()

  instance_event("review", "status", "done", "ana", store, "2026",
            element = "northside")
  instance_event("approve_data", "status", "doing", "mira", store, "2026")

  df <- apply_events(p, store, "2026")
  expect_equal(df$status[df$task == "review"], "open")
  expect_equal(df$status[df$task == "approve_data"], "doing")
})

test_that("apply_events_instance folds per (task, element)", {
  store <- withr::local_tempdir()
  p <- unit_process()
  tab <- expand_instance(p, c("northside", "lakeview"), "2026")

  instance_event("review", "status", "done", "ana", store, "2026",
            element = "northside")
  instance_event("review", "assignee", "ana", "board", store, "2026",
            element = "northside")

  out <- apply_events_instance(tab, store, "2026")
  w <- out$task == "review" & out$element == "northside"
  u <- out$task == "review" & out$element == "lakeview"
  expect_equal(out$status[w], "done")
  expect_equal(out$assignee[w], "ana")
  expect_equal(out$status[u], "open")
  expect_equal(out$assignee[u], "")
})

test_that("start_instance stamps and instance_table rebuilds from the store alone", {
  store <- withr::local_tempdir()
  p <- unit_process()
  inst <- data.frame(
    unit = c("northside", "lakeview", "eastgate"),
    region = c("SG", "SG", "SG"),
    stringsAsFactors = FALSE
  )

  start_instance(p, inst, "2026", store)

  expect_equal(instance_definition(store, "2026"), p)
  expect_equal(instance_collection(store, "2026"), inst)

  tab <- instance_table(store, "2026")
  expect_equal(nrow(tab), 3 * 2 + 2)
  expect_true("region" %in% names(tab))
  expect_true(all(tab$status == "open"))

  # opening the same instance twice must fail, not silently double-stamp
  expect_error(start_instance(p, inst, "2026", store), "already exists")
})

test_that("process_version tells two definitions apart", {
  p <- unit_process()
  v1 <- process_version(p)
  p2 <- p
  p2$name[1] <- "Delivery received"
  expect_false(identical(v1, process_version(p2)))
  expect_identical(v1, process_version(unit_process()))
  expect_match(v1, "^[0-9a-f]{8}$")
})

test_that("instance_view computes display status and a delivery unblocks", {
  store <- withr::local_tempdir()
  p <- unit_process()
  start_instance(p, c("northside", "lakeview"), "2026", store)

  v <- instance_view(store, "2026")
  b <- v$task == "review"
  # nobody delivered: every Review waits, the gate waits
  expect_true(all(v$status[b] == "blocked"))
  expect_equal(v$status[v$task == "approve_data"], "blocked")

  # the upload platform writes the delivery: only northside's row opens
  instance_event("delivery", "status", "done", "uploadplattform", store, "2026",
            element = "northside")
  v <- instance_view(store, "2026")
  expect_equal(v$status[b & v$element == "northside"], "open")
  expect_equal(v$status[b & v$element == "lakeview"], "blocked")
})

test_that("process_act writes per element and instance_view folds it", {
  store <- withr::local_tempdir()
  p <- unit_process()
  start_instance(p, c("northside", "lakeview"), "2026", store)

  for (g in c("northside", "lakeview")) {
    instance_event("delivery", "status", "done", "uploadplattform", store, "2026",
              element = g)
    process_act("review", "done", assignee = "ana", store = store,
                instance = "2026", element = g)
  }

  v <- instance_view(store, "2026")
  expect_true(all(v$status[v$task == "review"] == "done"))
  # all elements done: the gate opens
  expect_equal(v$status[v$task == "approve_data"], "open")

  ev <- instance_events(store, "2026")
  expect_true(all(c("northside", "lakeview") %in%
                    ev$element[ev$task == "review"]))
})

test_that("an assignee column in the element list seeds assignments", {
  store <- withr::local_tempdir()
  p <- unit_process()
  inst <- data.frame(
    unit = c("northside", "lakeview", "eastgate"),
    region = c("SG", "SG", "SG"),
    assignee = c("ana", "ben", ""),
    stringsAsFactors = FALSE
  )

  start_instance(p, inst, "2026", store)

  # the input column seeds events; it never rides along as a stamped facet
  expect_false("assignee" %in% names(instance_collection(store, "2026")))
  tab <- instance_table(store, "2026")

  # human multi task seeded per element; the pool row stays empty; the
  # system multi task (delivery) is nobody's task
  b <- tab$task == "review"
  expect_equal(tab$assignee[b & tab$element == "northside"], "ana")
  expect_equal(tab$assignee[b & tab$element == "lakeview"], "ben")
  expect_equal(tab$assignee[b & tab$element == "eastgate"], "")
  expect_true(all(tab$assignee[tab$task == "delivery"] == ""))

  ev <- instance_events(store, "2026")
  expect_true(all(ev$actor[ev$field == "assignee"] == "register"))
})

test_that("instance_latest follows start_instance order", {
  store <- withr::local_tempdir()
  p <- unit_process()
  expect_null(instance_latest(store))

  start_instance(p, c("northside"), "2026", store)
  expect_equal(instance_latest(store), "2026")

  start_instance(p, c("northside", "lakeview"), "2027", store)
  expect_equal(instance_latest(store), "2027")
  # the old instance stays addressable
  expect_equal(nrow(instance_table(store, "2026")), 1 * 2 + 2)
})
