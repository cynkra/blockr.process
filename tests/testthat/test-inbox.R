# The inbox is the door the outside world knocks on. What matters is that a
# message that makes sense becomes exactly one event, that the same message
# twice becomes one event, and that a message that makes no sense is parked
# with a reason rather than half-applied.

inbox_process <- function() {
  data.frame(
    task = c("each_unit", "delivery", "review", "approve"),
    name = c("for each unit", "Delivery", "Review", "Approve"),
    role = c("", "system", "analyst", "management"),
    depends_on = c("", "", "delivery", "each_unit"),
    collection = c("unit", "", "", ""),
    parent = c("", "each_unit", "each_unit", ""),
    stringsAsFactors = FALSE
  )
}

started <- function(elements = c("north", "south")) {
  store <- tempfile()
  start_instance(inbox_process(), elements, "2026Q1", store)
  store
}

test_that("a message becomes an event and the file is kept as the receipt", {
  store <- started()
  write_inbox_message(store, "delivery", element = "north",
                      instance = "2026Q1", actor = "upload-platform",
                      id = "delivery-2026Q1-north")

  expect_equal(ingest_inbox(store, quiet = TRUE), 1L)

  ev <- instance_events(store, "2026Q1")
  ev <- ev[ev$task == "delivery", ]
  expect_equal(nrow(ev), 1L)
  expect_equal(ev$value, "done")
  expect_equal(ev$element, "north")
  expect_equal(ev$actor, "upload-platform")
  # the event points back at the message that caused it
  expect_equal(ev$ref, "delivery-2026Q1-north.json")

  expect_length(list.files(inbox_dir(store), pattern = "\\.json$"), 0L)
  expect_true(file.exists(file.path(inbox_dir(store), "processed",
                                    "delivery-2026Q1-north.json")))
})

test_that("the message unblocks the task that waits for it", {
  store <- started()
  write_inbox_message(store, "delivery", element = "north",
                      instance = "2026Q1", id = "d-north")
  ingest_inbox(store, quiet = TRUE)

  tab <- instance_view(store, "2026Q1")
  expect_equal(tab$status[tab$task == "review" & tab$element == "north"], "open")
  expect_equal(tab$status[tab$task == "review" & tab$element == "south"],
               "blocked")
})

test_that("the same message twice is applied once", {
  store <- started()
  write_inbox_message(store, "delivery", element = "north",
                      instance = "2026Q1", id = "d-north")
  ingest_inbox(store, quiet = TRUE)
  # the sender did not see our answer and resends, byte for byte
  write_inbox_message(store, "delivery", element = "north",
                      instance = "2026Q1", id = "d-north")
  expect_equal(ingest_inbox(store, quiet = TRUE), 0L)

  ev <- instance_events(store, "2026Q1")
  expect_equal(sum(ev$task == "delivery"), 1L)
  expect_true(file.exists(file.path(
    inbox_dir(store), "processed", "d-north.json.duplicate-1"
  )))
})

test_that("a message that can never apply is parked with its reason", {
  store <- started()
  cases <- list(
    "no-task" = list(instance = "2026Q1", value = "done"),
    "unknown-task" = list(instance = "2026Q1", task = "nope"),
    "unknown-element" = list(instance = "2026Q1", task = "delivery",
                             element = "westside"),
    "element-missing" = list(instance = "2026Q1", task = "delivery"),
    "element-on-single" = list(instance = "2026Q1", task = "approve",
                               element = "north")
  )
  dir.create(inbox_dir(store), recursive = TRUE, showWarnings = FALSE)
  for (nm in names(cases)) {
    writeLines(
      as.character(jsonlite::toJSON(cases[[nm]], auto_unbox = TRUE)),
      file.path(inbox_dir(store), paste0(nm, ".json"))
    )
  }
  writeLines("{not json", file.path(inbox_dir(store), "broken.json"))

  expect_equal(ingest_inbox(store, quiet = TRUE), 0L)
  expect_equal(nrow(instance_events(store, "2026Q1")[
    instance_events(store, "2026Q1")$task %in% c("delivery", "approve"),
  ]), 0L)

  failed <- list.files(file.path(inbox_dir(store), "failed"))
  expect_setequal(
    failed,
    c(paste0(c(names(cases), "broken"), ".json"),
      paste0(c(names(cases), "broken"), ".json.error"))
  )
  reason <- readLines(file.path(inbox_dir(store), "failed",
                                "unknown-element.json.error"))
  expect_match(reason, "westside")
})

test_that("a message that is merely early waits for its instance", {
  store <- tempfile()
  write_inbox_message(store, "delivery", element = "north",
                      instance = "2026Q1", id = "early")

  expect_equal(ingest_inbox(store, quiet = TRUE), 0L)
  expect_length(list.files(inbox_dir(store), pattern = "\\.json$"), 1L)

  start_instance(inbox_process(), c("north", "south"), "2026Q1", store)
  expect_equal(ingest_inbox(store, quiet = TRUE), 1L)
})

test_that("'latest' finds the instance the sender does not know the name of", {
  store <- started()
  start_instance(inbox_process(), c("north", "south"), "2026Q2", store)
  write_inbox_message(store, "delivery", element = "north", id = "d")
  ingest_inbox(store, quiet = TRUE)

  expect_equal(nrow(instance_events(store, "2026Q1")[
    instance_events(store, "2026Q1")$task == "delivery",
  ]), 0L)
  expect_equal(sum(instance_events(store, "2026Q2")$task == "delivery"), 1L)
})

test_that("the worker ingests the inbox on every tick", {
  store <- started()
  jobs <- tempfile()
  dir.create(jobs)
  write_inbox_message(store, "delivery", element = "north",
                      instance = "2026Q1", id = "d-north")

  run_worker(inbox_process(), store = store, instance = "2026Q1", jobs = jobs,
             wait = FALSE, quiet = TRUE)

  tab <- instance_view(store, "2026Q1")
  expect_equal(tab$status[tab$task == "review" & tab$element == "north"], "open")
})

test_that("a message can assign, not just finish", {
  store <- started()
  write_inbox_message(store, "review", field = "assignee", value = "ana",
                      element = "north", instance = "2026Q1",
                      actor = "hr-system", id = "a1")
  ingest_inbox(store, quiet = TRUE)

  tab <- instance_view(store, "2026Q1")
  expect_equal(tab$assignee[tab$task == "review" & tab$element == "north"],
               "ana")
})
