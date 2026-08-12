test_that("as_bpmn converts the example wide table", {
  m <- as_bpmn(example_process(), name = "Q")
  expect_s3_class(m, "bpmn")
  # 7 tasks + start + end (no join: qa_check's reconcile dep is a loop-back)
  expect_setequal(
    m$nodes$id,
    c("_start", "deliver", "validate", "qa_check", "reconcile", "approve",
      "forecast", "publish", "_end")
  )
  # outcome qualifiers become edge labels
  lab <- m$flows[!is.na(m$flows$name), ]
  expect_setequal(lab$name, c("true", "false"))
  expect_equal(lab$to[lab$name == "false"], "reconcile")
  expect_equal(lab$to[lab$name == "true"], "approve")
  # the loop-back edge reconcile -> qa_check exists and is direct
  expect_true(any(m$flows$from == "reconcile" & m$flows$to == "qa_check"))
})

test_that("roles derive task types", {
  m <- as_bpmn(example_process())
  types <- setNames(m$nodes$type, m$nodes$id)
  expect_equal(unname(types["validate"]), "scriptTask")
  expect_equal(unname(types["deliver"]), "userTask")
})

test_that("true fan-in synthesizes a parallel join", {
  df <- data.frame(
    task = c("a", "b", "c", "d"),
    name = c("A", "B", "C", "D"),
    depends_on = c("", "a", "a", "b, c")
  )
  m <- as_bpmn(df)
  expect_true("join_d" %in% m$nodes$id)
  expect_equal(m$nodes$type[m$nodes$id == "join_d"], "parallelGateway")
})

test_that("invalid ids are sanitized", {
  df <- data.frame(
    task = c("1", "2"),
    name = c("A", "B"),
    depends_on = c("", "1")
  )
  m <- as_bpmn(df)
  expect_true(all(c("s_1", "s_2") %in% m$nodes$id))
  expect_true(any(m$flows$from == "s_1" & m$flows$to == "s_2"))
})

test_that("layout round-trip works incl. loop and labels", {
  skip_if(Sys.which("node") == "", "needs node")
  x <- layout_bpmn(as_bpmn(example_process()))
  expect_gt(length(gregexpr("BPMNEdge", x)[[1]]), 5)
})

test_that("process_status computes blocked/skipped from gates", {
  st <- process_status(example_process())
  expect_equal(unname(st[c("deliver", "validate", "qa_check", "reconcile")]),
               c("done", "done", "false", "doing"))
  expect_equal(unname(st[["approve"]]), "skipped")  # qa_check finished false, needs true
  expect_equal(unname(st[["forecast"]]), "blocked") # approve not finished
  expect_equal(unname(st[["publish"]]), "blocked")
})

test_that("process_tasks marks checks via outcomes and loop deps", {
  ps <- process_tasks(example_process())
  byid <- setNames(ps, vapply(ps, `[[`, "", "task"))
  expect_setequal(unlist(byid$qa_check$outcomes), c("true", "false"))
  expect_equal(unlist(byid$qa_check$loops), "reconcile")
  expect_equal(byid$approve$gates[[1]]$label, "true")
  expect_length(byid$deliver$gates, 0)
})

# --- multi-instance groups (option C) ---------------------------------------

grouped_process <- function() {
  data.frame(
    task = c("each_unit", "delivery", "review", "approve_data"),
    name = c("for each unit", "Delivery", "Review", "Approve"),
    role = c("", "system", "analyst", "steward"),
    depends_on = c("", "", "delivery", "review"),
    script = c("", "import.R", "", ""),
    parent = c("", "each_unit", "each_unit", ""),
    collection = c("unit", "", "", ""),
    stringsAsFactors = FALSE
  )
}

test_that("a non-empty collection marks a row as the group container", {
  g <- process_groups(grouped_process())

  expect_equal(nrow(g), 1L)
  expect_equal(g$group, "each_unit")
  expect_equal(g$collection, "unit")
})

test_that("process_collection resolves a task's dimension through its parent", {
  per <- process_collection(grouped_process())

  expect_equal(unname(per[c("delivery", "review")]), c("unit", "unit"))
  expect_equal(unname(per["approve_data"]), "")
  # the container repeats nothing itself
  expect_equal(unname(per["each_unit"]), "")
})

test_that("process_collection falls back to the legacy per column", {
  legacy <- data.frame(
    task = c("a", "b"), name = c("A", "B"), per = c("unit", ""),
    stringsAsFactors = FALSE
  )
  expect_equal(unname(process_collection(legacy)), c("unit", ""))
})

test_that("the group row is a container, not work", {
  p <- grouped_process()

  expect_false("each_unit" %in% process_body(p)$task)
  expect_false("each_unit" %in% vapply(process_tasks(p), function(s) s$task, character(1)))
  expect_false("each_unit" %in% as_bpmn(p)$nodes$id)
  expect_false("each_unit" %in% names(process_status(p)))
})

test_that("members of a group become multi-instance activities", {
  m <- as_bpmn(grouped_process())

  expect_equal(m$nodes$multi[m$nodes$id == "review"], TRUE)
  expect_equal(m$nodes$multi[m$nodes$id == "approve_data"], FALSE)
  # ...and the marker reaches the XML, which is what draws |||
  x <- as.character(bpmn_xml(m))
  expect_match(x, "multiInstanceLoopCharacteristics")
})

test_that("a dependency on a task that does not exist is dropped", {
  p <- grouped_process()
  p$depends_on[p$task == "approve_data"] <- "removed, review"

  m <- as_bpmn(p)
  expect_false(any(m$flows$from == "removed"))
  expect_true(any(m$flows$from == "review" & m$flows$to == "approve_data"))
})

# --- container edges: sequence flow may not cross a group boundary ----------

test_that("a dependency on the container lowers onto its exits", {
  p <- grouped_process()
  # the BPMN-correct form: wait for the sub-process, not for one of its rows
  p$depends_on[p$task == "approve_data"] <- "each_unit"

  b <- process_body(p)
  expect_equal(b$depends_on[b$task == "approve_data"], "review")

  m <- as_bpmn(p)
  expect_false("each_unit" %in% m$nodes$id)
  expect_true(any(m$flows$from == "review" & m$flows$to == "approve_data"))
})

test_that("naming a member from outside lowers to the same edge", {
  # which is why definitions written before containers were addressable keep
  # working: both forms are the parallel join over every element
  member <- process_body(grouped_process())
  p <- grouped_process()
  p$depends_on[p$task == "approve_data"] <- "each_unit"

  expect_equal(process_body(p)$depends_on, member$depends_on)
})

test_that("the container's own depends_on gates its entries", {
  p <- grouped_process()
  p <- rbind(
    data.frame(task = "register", name = "Register", role = "system",
               depends_on = "", script = "", parent = "", collection = "",
               stringsAsFactors = FALSE),
    p
  )
  p$depends_on[p$task == "each_unit"] <- "register"

  b <- process_body(p)
  # delivery is the entry of the group, review is not
  expect_equal(b$depends_on[b$task == "delivery"], "register")
  expect_equal(b$depends_on[b$task == "review"], "delivery")
})

test_that("an outcome qualifier survives lowering", {
  p <- grouped_process()
  p$depends_on[p$task == "review"] <- "delivery:true"
  p$depends_on[p$task == "approve_data"] <- "each_unit:done"

  b <- process_body(p)
  expect_equal(b$depends_on[b$task == "approve_data"], "review:done")
})

# --- nested groups ----------------------------------------------------------

nested_process <- function() {
  data.frame(
    task = c("each_region", "each_unit", "lief", "bearb", "kt_fg", "bund"),
    name = c("per region", "per unit", "Delivery", "Review",
             "region-Approve", "Bundesfreigabe"),
    role = c("", "", "system", "analyst", "region", "bund"),
    depends_on = c("", "", "", "lief", "each_unit", "each_region"),
    parent = c("", "each_region", "each_unit", "each_unit", "each_region", ""),
    collection = c("region", "unit", "", "", "", ""),
    stringsAsFactors = FALSE
  )
}

test_that("process_scopes gives the enclosing chain, innermost first", {
  sc <- process_scopes(nested_process())

  expect_equal(sc$lief, c("each_unit", "each_region"))
  expect_equal(sc$kt_fg, "each_region")
  expect_equal(sc$bund, character(0))
})

test_that("nested groups resolve to the innermost collection", {
  per <- process_collection(nested_process())

  expect_equal(unname(per[c("lief", "bearb")]), c("unit", "unit"))
  expect_equal(unname(per["kt_fg"]), "region")
  expect_equal(unname(per["bund"]), "")
})

test_that("nested containers lower innermost first", {
  b <- process_body(nested_process())

  expect_setequal(b$task, c("lief", "bearb", "kt_fg", "bund"))
  expect_equal(b$depends_on[b$task == "kt_fg"], "bearb")
  expect_equal(b$depends_on[b$task == "bund"], "kt_fg")
})

test_that("a parent cycle errors instead of looping", {
  p <- nested_process()
  p$parent[p$task == "each_region"] <- "each_unit"

  expect_error(process_scopes(p), "Cyclic")
  expect_error(process_body(p), "Cyclic")
})

# --- quorum: join and complete_when ----------------------------------------

test_that("process_quorum reads the grammar", {
  expect_equal(process_quorum("", 12), 12L)
  expect_equal(process_quorum("all", 12), 12L)
  expect_equal(process_quorum("any", 12), 1L)
  expect_equal(process_quorum("n=3", 12), 3L)
  expect_equal(process_quorum("3", 12), 3L)
  expect_equal(process_quorum("pct=90", 12), 11L)
  expect_equal(process_quorum("90%", 12), 11L)
  # a quorum is never more than there is, nor less than one
  expect_equal(process_quorum("n=99", 12), 12L)
  expect_equal(process_quorum("pct=1", 12), 1L)
  # ...and an empty candidate set needs nothing
  expect_equal(process_quorum("any", 0), 0L)
  expect_error(process_quorum("most", 12), "Unknown quorum spec")
})

test_that("join picks the gateway a fan-in synthesizes", {
  df <- data.frame(
    task = c("a", "b", "c", "d"),
    name = c("A", "B", "C", "D"),
    depends_on = c("", "a", "a", "b, c"),
    join = c("", "", "", "any"),
    stringsAsFactors = FALSE
  )
  m <- as_bpmn(df)
  expect_equal(m$nodes$type[m$nodes$id == "join_d"], "exclusiveGateway")
  expect_equal(m$nodes$name[m$nodes$id == "join_d"], "any")

  df$join[df$task == "d"] <- "n=2"
  m <- as_bpmn(df)
  # 2 of 2 is just an AND join
  expect_equal(m$nodes$type[m$nodes$id == "join_d"], "parallelGateway")
})

test_that("join relaxes the gates in process_status", {
  df <- data.frame(
    task = c("a", "b", "c"),
    name = c("A", "B", "C"),
    depends_on = c("", "", "a, b"),
    status = c("done", "open", "open"),
    stringsAsFactors = FALSE
  )
  expect_equal(unname(process_status(df)[["c"]]), "blocked")

  df$join <- c("", "", "any")
  expect_equal(unname(process_status(df)[["c"]]), "open")
})

test_that("a quorum that can no longer be reached skips the task", {
  df <- data.frame(
    task = c("a", "b", "c"),
    name = c("A", "B", "C"),
    depends_on = c("", "", "a:true, b:true"),
    status = c("false", "open", "open"),
    join = c("", "", "all"),
    stringsAsFactors = FALSE
  )
  expect_equal(unname(process_status(df)[["c"]]), "skipped")

  # ...but one of two is still within reach
  df$join[df$task == "c"] <- "any"
  expect_equal(unname(process_status(df)[["c"]]), "blocked")
})

test_that("sequential reaches the members and the XML", {
  p <- grouped_process()
  p$sequential <- c(TRUE, FALSE, FALSE, FALSE)

  expect_true(unname(process_sequential(p)[["review"]]))
  expect_false(unname(process_sequential(p)[["approve_data"]]))

  m <- as_bpmn(p)
  expect_true(m$nodes$multi_seq[m$nodes$id == "review"])
  expect_match(as.character(bpmn_xml(m)), "isSequential=\"true\"")
})

test_that("complete_when rides along on the group", {
  p <- grouped_process()
  p$complete_when <- c("pct=90", "", "", "")

  expect_equal(unname(process_complete_when(p)[["review"]]), "pct=90")
  expect_equal(unname(process_complete_when(p)[["approve_data"]]), "")
  expect_equal(process_groups(p)$complete_when, "pct=90")
})
