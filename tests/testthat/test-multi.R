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

test_that("expand_instance makes one row per element for multi tasks only", {
  df <- expand_instance(unit_process(), c("northside", "lakeview", "eastgate"), "2026")

  expect_equal(nrow(df), 3 * 2 + 2)
  expect_equal(sum(df$task == "review"), 3)
  expect_equal(sum(df$task == "approve_data"), 1)
  expect_true(is.na(df$element[df$task == "approve_data"]))
  expect_setequal(
    df$element[df$task == "review"], c("northside", "lakeview", "eastgate")
  )
  expect_true(all(df$status == "open"))
  expect_true(all(df$instance == "2026"))
})

test_that("expand_instance carries grouping columns from a data frame", {
  inst <- data.frame(
    unit = c("northside", "lakeview"), region = c("SG", "SG"),
    stringsAsFactors = FALSE
  )
  df <- expand_instance(unit_process(), inst, "2026")

  expect_true("region" %in% names(df))
  expect_equal(df$region[df$task == "review"], c("SG", "SG"))
  expect_true(is.na(df$region[df$task == "approve_data"]))
})

test_that("a per-element dependency waits only for its own element", {
  df <- expand_instance(unit_process(), c("northside", "lakeview"), "2026")
  df$status[df$task == "delivery" & df$element == "northside"] <- "done"

  st <- instance_status(unit_process(), df)
  b <- df$task == "review"

  # northside delivered, so its Review is ready; lakeview's still waits
  expect_equal(st[b & df$element == "northside"], "open")
  expect_equal(st[b & df$element == "lakeview"], "blocked")
})

test_that("the gate waits for ALL elements", {
  p <- unit_process()
  df <- expand_instance(p, c("northside", "lakeview"), "2026")
  df$status[df$task == "delivery"] <- "done"
  df$status[df$task == "review" & df$element == "northside"] <- "done"

  st <- instance_status(p, df)
  expect_equal(st[df$task == "approve_data"], "blocked")

  df$status[df$task == "review" & df$element == "lakeview"] <- "done"
  st <- instance_status(p, df)
  expect_equal(st[df$task == "approve_data"], "open")
})

test_that("one unit back in rework closes the gate again", {
  p <- unit_process()
  df <- expand_instance(p, c("northside", "lakeview", "eastgate"), "2026")
  df$status[df$task %in% c("delivery", "review")] <- "done"
  expect_equal(instance_status(p, df)[df$task == "approve_data"], "open")

  # Mira sends eastgate back: the other two stay done, the gate re-closes
  df$status[df$task == "review" & df$element == "eastgate"] <- "open"
  st <- instance_status(p, df)

  expect_equal(st[df$task == "approve_data"], "blocked")
  expect_equal(st[df$task == "review" & df$element == "northside"], "done")
  expect_equal(st[df$task == "review" & df$element == "eastgate"], "open")
})

test_that("a single task downstream of the gate fans nothing out", {
  p <- unit_process()
  df <- expand_instance(p, c("northside", "lakeview"), "2026")
  df$status[df$task %in% c("delivery", "review")] <- "done"
  df$status[df$task == "approve_data"] <- "done"

  st <- instance_status(p, df)
  expect_equal(sum(df$task == "consolidate"), 1L)
  expect_equal(st[df$task == "consolidate"], "open")
})

test_that("a single task upstream fans out to every element", {
  p <- rbind(
    data.frame(
      task = "start", name = "Open instance", role = "system",
      depends_on = "", script = "", per = "", stringsAsFactors = FALSE
    ),
    unit_process()
  )
  p$depends_on[p$task == "delivery"] <- "start"

  df <- expand_instance(p, c("northside", "lakeview"), "2026")
  expect_true(all(instance_status(p, df)[df$task == "delivery"] == "blocked"))

  df$status[df$task == "start"] <- "done"
  expect_true(all(instance_status(p, df)[df$task == "delivery"] == "open"))
})

test_that("outcome qualifiers work per element", {
  p <- data.frame(
    task = c("check", "recheck", "ok"),
    name = c("Check", "Recheck", "Sign-off"),
    role = c("system", "team", "system"),
    depends_on = c("", "check:false", "check:true"),
    script = c("p.R", "", "ok.R"),
    per = c("unit", "unit", "unit"),
    stringsAsFactors = FALSE
  )
  df <- expand_instance(p, c("northside", "lakeview"), "2026")
  df$status[df$task == "check" & df$element == "northside"] <- "false"
  df$status[df$task == "check" & df$element == "lakeview"] <- "true"

  st <- instance_status(p, df)
  expect_equal(st[df$task == "recheck" & df$element == "northside"], "open")
  expect_equal(st[df$task == "recheck" & df$element == "lakeview"], "skipped")
  expect_equal(st[df$task == "ok" & df$element == "northside"], "skipped")
  expect_equal(st[df$task == "ok" & df$element == "lakeview"], "open")
})

test_that("instance_counts reports progress per repeated task", {
  p <- unit_process()
  df <- expand_instance(p, c("northside", "lakeview", "eastgate", "Gossau"), "2026")
  df$status[df$task == "delivery"] <- "done"
  df$status[df$task == "review" &
              df$element %in% c("northside", "lakeview", "eastgate")] <- "done"

  cnt <- instance_counts(p, df)
  b <- cnt[cnt$task == "review", ]

  expect_equal(b$total, 4L)
  expect_equal(b$done, 3L)
  expect_equal(b$open, 1L)
  expect_equal(b$pct, 75)
})

test_that("instance_counts separates in progress from not started", {
  p <- unit_process()
  df <- expand_instance(p, c("northside", "lakeview", "eastgate", "Gossau"), "2026")
  df$status[df$task == "delivery"] <- "done"
  df$status[df$task == "review" & df$element == "northside"] <- "done"
  df$status[df$task == "review" &
              df$element %in% c("lakeview", "eastgate")] <- "doing"

  b <- instance_counts(p, df)
  b <- b[b$task == "review", ]

  expect_equal(b$done, 1L)
  expect_equal(b$doing, 2L)
  expect_equal(b$blocked, 0L)
  expect_equal(b$open, 3L)          # open = everything not finished
  expect_equal(b$pct, 25)
  expect_equal(b$pct_doing, 50)
  expect_equal(b$total - b$done - b$doing, 1L)  # not started
})

test_that("instance_counts counts the elements waiting on a gate", {
  p <- unit_process()
  df <- expand_instance(p, c("northside", "lakeview", "eastgate", "Gossau"), "2026")
  # only northside delivered, so its Review is open and the other three
  # are still blocked by the gate
  df$status[df$task == "delivery" & df$element == "northside"] <- "done"

  b <- instance_counts(p, df)
  b <- b[b$task == "review", ]

  expect_equal(b$done, 0L)
  expect_equal(b$doing, 0L)
  expect_equal(b$blocked, 3L)
  expect_equal(b$pct_blocked, 75)
  expect_equal(b$total - b$done - b$doing - b$blocked, 1L)  # not started
})

test_that("a definition without a per column behaves as before", {
  p <- unit_process()
  p$per <- NULL
  df <- expand_instance(p, c("northside", "lakeview"), "2026")

  expect_equal(nrow(df), nrow(p))
  expect_true(all(is.na(df$element)))

  df$status[df$task == "delivery"] <- "done"
  st <- instance_status(p, df)
  expect_equal(st[df$task == "review"], "open")
  expect_equal(st[df$task == "approve_data"], "blocked")
})

# --- the group form (mockups/multi-instance.html, variant C) -----------------

grouped_process <- function() {
  data.frame(
    task = c("each_unit", "delivery", "review", "approve_data", "consolidate"),
    name = c("for each unit", "Delivery", "Review data",
             "Approve data", "Consolidate"),
    role = c("", "system", "analyst", "steward", "system"),
    depends_on = c("", "", "delivery", "review", "approve_data"),
    script = c("", "", "", "", "consolidate.R"),
    collection = c("unit", "", "", "", ""),
    parent = c("", "each_unit", "each_unit", "", ""),
    stringsAsFactors = FALSE
  )
}

test_that("a task's dimension comes from the group it sits in", {
  per <- multi_tasks(grouped_process())

  expect_equal(unname(per[c("delivery", "review")]),
               c("unit", "unit"))
  expect_equal(unname(per[c("approve_data", "consolidate")]), c("", ""))
  # the container repeats nothing of its own
  expect_equal(unname(per["each_unit"]), "")
})

test_that("the group container is never a task row of the instance", {
  df <- expand_instance(grouped_process(), c("northside", "lakeview"), "2026")

  expect_false("each_unit" %in% df$task)
  expect_equal(nrow(df), 2 * 2 + 2)
  # ...and every row knows what it repeats over, without the definition
  expect_equal(df$per[df$task == "review"], c("unit", "unit"))
  expect_equal(df$per[df$task == "approve_data"], "")
})

test_that("grouped and legacy definitions compute the same statuses", {
  legacy <- unit_process()          # the pre-group form, `per` per task
  grouped <- grouped_process()[, c("task", "name", "role", "depends_on",
                                   "script", "collection", "parent")]
  grouped <- grouped[grouped$task != "consolidate", ]

  elements <- c("northside", "lakeview")
  a <- expand_instance(legacy[legacy$task != "consolidate", ], elements, "2026")
  b <- expand_instance(grouped, elements, "2026")
  a$status[a$task == "delivery"] <- "done"
  b$status[b$task == "delivery"] <- "done"

  expect_equal(a$task, b$task)
  expect_equal(a$element, b$element)
  expect_equal(
    unname(instance_status(legacy, a)), unname(instance_status(grouped, b))
  )
})

test_that("the gate still waits for all elements under a group", {
  p <- grouped_process()
  df <- expand_instance(p, c("northside", "lakeview"), "2026")
  df$status[df$task == "delivery"] <- "done"
  df$status[df$task == "review" & df$element == "northside"] <- "done"

  expect_equal(instance_status(p, df)[df$task == "approve_data"], "blocked")
  expect_equal(instance_waiting(p, df)[df$task == "approve_data"], "review")

  df$status[df$task == "review"] <- "done"
  expect_equal(instance_status(p, df)[df$task == "approve_data"], "open")
})

test_that("the diagram drops the container and marks its members", {
  m <- as_bpmn(grouped_process())

  expect_false("each_unit" %in% m$nodes$id)
  expect_true(m$nodes$multi[m$nodes$id == "review"])
  expect_false(m$nodes$multi[m$nodes$id == "approve_data"])
})

# --- container edges, quorums, nesting --------------------------------------

test_that("the gate reads the same whether it names the container or a member", {
  p <- grouped_process()
  q <- p
  q$depends_on[q$task == "approve_data"] <- "each_unit"

  df <- expand_instance(p, c("northside", "lakeview"), "2026")
  df$status[df$task == "delivery"] <- "done"
  df$status[df$task == "review" & df$element == "northside"] <- "done"

  expect_equal(
    unname(instance_status(q, expand_instance(q, c("northside", "lakeview"), "2026"))),
    unname(instance_status(p, expand_instance(p, c("northside", "lakeview"), "2026")))
  )
  expect_equal(instance_status(q, df)[df$task == "approve_data"], "blocked")
  expect_equal(instance_waiting(q, df)[df$task == "approve_data"], "review")
})

test_that("the container's own depends_on gates every element", {
  p <- rbind(
    data.frame(
      task = "register", name = "Register", role = "system", depends_on = "",
      script = "", collection = "", parent = "", stringsAsFactors = FALSE
    ),
    grouped_process()
  )
  p$depends_on[p$task == "each_unit"] <- "register"

  df <- expand_instance(p, c("northside", "lakeview"), "2026")
  st <- instance_status(p, df)
  expect_true(all(st[df$task == "delivery"] == "blocked"))

  df$status[df$task == "register"] <- "done"
  st <- instance_status(p, df)
  expect_true(all(st[df$task == "delivery"] == "open"))
})

test_that("complete_when opens the gate before every element is done", {
  p <- grouped_process()
  p$complete_when <- c("pct=50", "", "", "", "")

  df <- expand_instance(p, c("northside", "lakeview", "eastgate", "Degersheim"), "2026")
  df$status[df$task == "delivery"] <- "done"
  df$status[df$task == "review" & df$element == "northside"] <- "done"
  expect_equal(instance_status(p, df)[df$task == "approve_data"], "blocked")

  df$status[df$task == "review" & df$element == "lakeview"] <- "done"
  expect_equal(instance_status(p, df)[df$task == "approve_data"], "open")

  # and the counter says what the gate is actually waiting for
  cnt <- instance_counts(p, df)
  expect_equal(cnt$required[cnt$task == "review"], 2L)
  expect_equal(cnt$total[cnt$task == "review"], 4L)
})

test_that("join relaxes a fan-in across two dependencies", {
  p <- grouped_process()
  p$depends_on[p$task == "consolidate"] <- "approve_data, each_unit"

  df <- expand_instance(p, c("northside"), "2026")
  df$status[df$task %in% c("delivery", "review")] <- "done"
  df$status[df$task == "approve_data"] <- "open"
  expect_equal(instance_status(p, df)[df$task == "consolidate"], "blocked")

  p$join <- ifelse(p$task == "consolidate", "any", "")
  expect_equal(instance_status(p, df)[df$task == "consolidate"], "open")
})

test_that("expand_instance refuses nested groups instead of guessing", {
  p <- data.frame(
    task = c("each_region", "each_unit", "lief", "bund"),
    name = c("per region", "per unit", "Delivery", "Bund"),
    role = c("", "", "system", "bund"),
    depends_on = c("", "", "", "each_region"),
    script = "",
    collection = c("region", "unit", "", ""),
    parent = c("", "each_region", "each_unit", ""),
    stringsAsFactors = FALSE
  )
  expect_error(expand_instance(p, c("northside"), "2026"), "Nested multi-instance")
  # the diagram still draws it
  expect_true(as_bpmn(p)$nodes$multi[
    as_bpmn(p)$nodes$id == "lief"
  ])
})

test_that("tasks_to_table only widens for the options actually used", {
  plain <- tasks_to_table(list(list(task = "a", name = "A")))
  expect_false(any(c("join", "complete_when", "sequential") %in% names(plain)))

  wide <- tasks_to_table(list(
    list(task = "g", name = "G", collection = "unit",
         complete_when = "pct=90", sequential = "true"),
    list(task = "a", name = "A", parent = "g")
  ))
  expect_true(all(c("complete_when", "sequential") %in% names(wide)))
  expect_false("join" %in% names(wide))
  expect_type(wide$sequential, "logical")
  expect_equal(unname(process_complete_when(wide)[["a"]]), "pct=90")
  expect_true(unname(process_sequential(wide)[["a"]]))
})

test_that("the expanded table answers the quorum without the definition", {
  # the live diagram and the tasks block rebuild a definition from the
  # EXPANDED table, where the containers are long gone
  p <- grouped_process()
  p$complete_when <- c("pct=50", "", "", "", "")

  tab <- expand_instance(p, c("A", "B", "C", "D"), "2026")
  expect_true("complete_when" %in% names(tab))

  def <- tab[!duplicated(tab$task), , drop = FALSE]
  expect_equal(instance_counts(def, tab)$required, c(2L, 2L))

  tab$status[tab$task == "delivery"] <- "done"
  tab$status[tab$task == "review" & tab$element %in% c("A", "B")] <- "done"
  expect_equal(
    unname(instance_status(def, tab)), unname(instance_status(p, tab))
  )
  expect_equal(instance_status(def, tab)[tab$task == "approve_data"], "open")
})
