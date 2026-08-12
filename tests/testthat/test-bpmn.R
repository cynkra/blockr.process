# The BPMN half on its own: the tidy model, the XML in both directions,
# the table inversion, and the laid-out diagram interchange.

quarterly_wide <- function() {
  tibble::tibble(
    task = c("deliver", "receive", "validate", "review"),
    name = c("Send delivery", "Delivery received", "Validate data",
             "Review results"),
    role = c("analyst", "system", "system", "team"),
    depends_on = c("", "deliver", "receive", "validate"),
    script = c("", "", "validate.R", "")
  )
}

# -- the model ----------------------------------------------------------------

test_that("bpmn() knows the receive, send and inclusive types", {
  n <- data.frame(
    id = c("a", "b", "c", "d", "e"),
    name = c("S", "Get", "Send", "Or", "E"),
    type = c("start", "receive", "send", "or", "end")
  )
  f <- data.frame(from = c("a", "b", "c", "d"), to = c("b", "c", "d", "e"))
  m <- bpmn(n, f)
  expect_equal(
    m$nodes$type,
    c("startEvent", "receiveTask", "sendTask", "inclusiveGateway", "endEvent")
  )
})

test_that("bpmn() validates message flows", {
  n <- data.frame(id = c("a", "b"), name = c("S", "E"),
                  type = c("start", "end"))
  f <- data.frame(from = "a", to = "b")

  m <- bpmn(n, f, messages = data.frame(from = "Outside", to = "a"))
  expect_equal(m$messages$from, "Outside")

  # both endpoints inside the process
  expect_error(
    bpmn(n, f, messages = data.frame(from = "a", to = "b")),
    "exactly one node-id endpoint"
  )
  # neither endpoint inside
  expect_error(
    bpmn(n, f, messages = data.frame(from = "x", to = "y")),
    "exactly one node-id endpoint"
  )
})

test_that("a system task without a script is a receive task", {
  m <- as_bpmn(quarterly_wide())
  types <- setNames(m$nodes$type, m$nodes$id)
  expect_equal(unname(types["receive"]), "receiveTask")
  expect_equal(unname(types["validate"]), "scriptTask") # script set
})

test_that("external = draws a collapsed pool at the receive tasks", {
  m <- as_bpmn(quarterly_wide(), external = "Reporting unit")
  expect_equal(m$messages$from, "Reporting unit")
  expect_equal(m$messages$to, "receive")

  # no receive task, no pool
  df <- quarterly_wide()
  df$script[df$task == "receive"] <- "ingest.R"
  expect_null(as_bpmn(df, external = "Reporting unit")$messages)
})

# -- the XML, outbound --------------------------------------------------------

test_that("bpmn_xml emits lanes by default and fills the gaps", {
  doc <- bpmn_xml(as_bpmn(quarterly_wide()))
  lanes <- xml2::xml_find_all(doc, ".//bpmn:lane")
  expect_setequal(
    xml2::xml_attr(lanes, "name"),
    c("analyst", "system", "team")
  )
  # the synthesized start event inherits the first actor's lane
  refs <- xml2::xml_text(xml2::xml_find_all(
    doc, ".//bpmn:lane[@name='analyst']/bpmn:flowNodeRef"
  ))
  expect_true("_start" %in% refs)
  # every node sits in exactly one lane
  all_refs <- xml2::xml_text(xml2::xml_find_all(doc, ".//bpmn:flowNodeRef"))
  expect_equal(sort(all_refs), sort(unique(all_refs)))
  expect_setequal(
    all_refs,
    xml2::xml_attr(xml2::xml_find_all(
      doc, ".//bpmn:process/*[@id][not(self::bpmn:laneSet)][not(self::bpmn:sequenceFlow)]"
    ), "id")
  )
})

test_that("bpmn_xml wraps lanes and messages in a collaboration", {
  doc <- bpmn_xml(as_bpmn(quarterly_wide(), external = "Reporting unit"))
  parts <- xml2::xml_find_all(doc, ".//bpmn:participant")
  expect_equal(length(parts), 2L)
  # the external pool is collapsed: it has no processRef
  ext <- parts[xml2::xml_attr(parts, "name") == "Reporting unit"]
  expect_true(is.na(xml2::xml_attr(ext, "processRef")))
  mf <- xml2::xml_find_first(doc, ".//bpmn:messageFlow")
  expect_equal(xml2::xml_attr(mf, "targetRef"), "receive")

  # a lane-free, message-free model stays a bare process
  df <- data.frame(task = c("a", "b"), name = c("A", "B"),
                   depends_on = c("", "a"))
  doc <- bpmn_xml(as_bpmn(df))
  expect_length(xml2::xml_find_all(doc, ".//bpmn:collaboration"), 0)
  expect_length(xml2::xml_find_all(doc, ".//bpmn:laneSet"), 0)
})

test_that("bpmn_xml writes the script a script task runs", {
  doc <- bpmn_xml(as_bpmn(quarterly_wide()))
  s <- xml2::xml_find_first(doc, ".//bpmn:scriptTask/bpmn:script")
  expect_equal(xml2::xml_text(s), "validate.R")
})

# -- the XML, inbound ---------------------------------------------------------

test_that("read_bpmn round-trips what bpmn_xml writes", {
  m <- as_bpmn(example_process(), name = "Q", external = "Supplier")
  m2 <- read_bpmn(bpmn_xml(m))

  expect_s3_class(m2, "bpmn")
  expect_equal(m2$name, "Q")
  expect_setequal(m2$nodes$id, m$nodes$id)
  expect_equal(
    m2$nodes$type[match(m$nodes$id, m2$nodes$id)],
    m$nodes$type
  )
  expect_equal(
    m2$nodes$script[m2$nodes$id == "validate"],
    "validate.R"
  )
  # lanes come back filled (bpmn_xml assigned one to every node)
  expect_true(all(!is.na(m2$nodes$lane)))
  # flows with their labels
  expect_equal(nrow(m2$flows), nrow(m$flows))
  expect_setequal(
    m2$flows$name[!is.na(m2$flows$name)],
    c("true", "false")
  )
})

test_that("read_bpmn reads a Camunda-style file", {
  m <- read_bpmn(test_path("fixtures", "camunda-review.bpmn"))

  expect_equal(m$name, "Application review")
  types <- setNames(m$nodes$type, m$nodes$id)
  expect_equal(unname(types["Activity_receive"]), "receiveTask")
  expect_equal(unname(types["Gateway_ok"]), "exclusiveGateway")
  expect_equal(
    m$nodes$script[m$nodes$id == "Activity_score"], "score.R"
  )
  expect_true(m$nodes$multi[m$nodes$id == "Activity_score"])
  expect_true(m$nodes$multi_seq[m$nodes$id == "Activity_score"])
  expect_equal(
    m$nodes$lane[m$nodes$id == "Activity_decide"], "Board"
  )
  expect_equal(m$messages$from, "Applicant")
  expect_equal(m$messages$to, "Activity_receive")
})

test_that("read_bpmn refuses elements outside the vocabulary", {
  xml <- paste0(
    "<definitions xmlns=\"http://www.omg.org/spec/BPMN/20100524/MODEL\">",
    "<process id=\"p\"><startEvent id=\"s\"/><subProcess id=\"x\"/>",
    "<endEvent id=\"e\"/></process></definitions>"
  )
  expect_error(read_bpmn(xml), "subProcess")
})

test_that("read_bpmn accepts a default-namespace document", {
  xml <- paste0(
    "<definitions xmlns=\"http://www.omg.org/spec/BPMN/20100524/MODEL\">",
    "<process id=\"p\" name=\"Plain\">",
    "<startEvent id=\"s\"/><userTask id=\"t\" name=\"Do\"/>",
    "<endEvent id=\"e\"/>",
    "<sequenceFlow id=\"f1\" sourceRef=\"s\" targetRef=\"t\"/>",
    "<sequenceFlow id=\"f2\" sourceRef=\"t\" targetRef=\"e\"/>",
    "</process></definitions>"
  )
  m <- read_bpmn(xml)
  expect_equal(m$name, "Plain")
  expect_setequal(m$nodes$id, c("s", "t", "e"))
})

# -- the table inversion ------------------------------------------------------

test_that("bpmn_to_table inverts as_bpmn on the example", {
  tbl <- bpmn_to_table(as_bpmn(example_process()))
  orig <- example_process()

  expect_setequal(tbl$task, orig$task)
  i <- match(orig$task, tbl$task)
  expect_equal(tbl$role[i], orig$role)
  expect_equal(tbl$script[i], orig$script)
  # dependency strings match up to token order
  canon <- function(x) {
    lapply(strsplit(x, ","), function(t) sort(trimws(t)))
  }
  expect_equal(canon(tbl$depends_on[i]), canon(orig$depends_on))
})

test_that("bpmn_to_table resolves a drawn gateway into qualifiers", {
  tbl <- bpmn_to_table(example_quarterly())

  expect_false("qa" %in% tbl$task) # the gateway is grammar now
  expect_equal(tbl$depends_on[tbl$task == "review"], "validate:yes")
  expect_equal(tbl$depends_on[tbl$task == "fix"], "validate:no")
  # the rework loop stays a plain dependency
  deps <- strsplit(tbl$depends_on[tbl$task == "validate"], ", ")[[1]]
  expect_setequal(deps, c("deliver", "fix"))
  # lanes came along as roles
  expect_equal(tbl$role[tbl$task == "approve"], "Management")
})

test_that("bpmn_to_table records the join a converging gateway carries", {
  df <- data.frame(
    task = c("a", "b", "c", "d"),
    name = c("A", "B", "C", "D"),
    depends_on = c("", "a", "a", "b, c"),
    join = c("", "", "", "any")
  )
  tbl <- bpmn_to_table(as_bpmn(df))
  expect_equal(tbl$join[tbl$task == "d"], "any")

  df$join <- c("", "", "", "n=2") # = all of 2: a parallel join
  tbl <- bpmn_to_table(as_bpmn(df))
  expect_equal(tbl$join[tbl$task == "d"], "")

  df <- rbind(df, data.frame(task = "e", name = "E", depends_on = "a",
                             join = ""))
  df$depends_on[df$task == "d"] <- "b, c, e"
  df$join[df$task == "d"] <- "n=2" # 2 of 3: the complex gateway
  tbl <- bpmn_to_table(as_bpmn(df))
  expect_equal(tbl$join[tbl$task == "d"], "n=2")
})

test_that("bpmn_to_table regroups multi-instance runs into a container", {
  df <- tibble::tibble(
    task = c("kickoff", "each_u", "upload", "check", "publish"),
    name = c("Kick off", "Per unit", "Upload", "Check", "Publish"),
    role = c("team", "", "analyst", "system", "system"),
    depends_on = c("", "kickoff", "", "upload", "each_u"),
    script = c("", "", "", "check.R", "publish.R"),
    collection = c("", "unit", "", "", ""),
    parent = c("", "", "each_u", "each_u", ""),
    sequential = c(NA, TRUE, NA, NA, NA)
  )
  tbl <- bpmn_to_table(as_bpmn(df))

  grp <- tbl$task[nzchar(tbl$collection)]
  expect_length(grp, 1L)
  expect_setequal(tbl$task[tbl$parent == grp], c("upload", "check"))
  # the container carries the entry edge and the sequential flag
  expect_equal(tbl$depends_on[tbl$task == grp], "kickoff")
  expect_true(tbl$sequential[tbl$task == grp])
  # members keep only their in-group edges
  expect_equal(tbl$depends_on[tbl$task == "upload"], "")
  expect_equal(tbl$depends_on[tbl$task == "check"], "upload")
  # the exit edge points at the group again
  expect_equal(tbl$depends_on[tbl$task == "publish"], grp)
  # and the group row precedes its members
  expect_lt(which(tbl$task == grp), which(tbl$task == "upload"))
})

# -- the laid-out diagram -----------------------------------------------------

test_that("layout keeps every edge with lanes present, and bands the nodes", {
  skip_if(Sys.which("node") == "", "needs node")

  m <- as_bpmn(quarterly_wide(), name = "C", external = "Reporting unit")
  doc <- xml2::read_xml(layout_bpmn(m))

  shp <- function(pred) {
    xml2::xml_find_all(doc, paste0(".//*[local-name() = 'BPMNShape']", pred))
  }
  bounds <- function(el) {
    b <- xml2::xml_find_first(el, ".//*[local-name() = 'Bounds']")
    as.numeric(xml2::xml_attrs(b)[c("x", "y", "width", "height")])
  }

  # one edge per sequence flow plus the message flow
  edges <- xml2::xml_find_all(doc, ".//*[local-name() = 'BPMNEdge']")
  expect_length(edges, nrow(m$flows) + 1L)
  # every edge has at least two waypoints
  for (e in edges) {
    expect_gte(
      length(xml2::xml_find_all(e, ".//*[local-name() = 'waypoint']")), 2L
    )
  }

  # lane shapes exist and tile the pool
  lane_shapes <- shp("[starts-with(@bpmnElement, 'Lane_')]")
  expect_length(lane_shapes, 3L)
  pool <- shp("[@bpmnElement = 'Participant_1']")
  expect_length(pool, 1L)
  pb <- bounds(pool[[1]])
  lane_h <- vapply(lane_shapes, function(l) bounds(l)[4], numeric(1))
  expect_equal(sum(lane_h), pb[4])

  # each task sits inside its lane's vertical band
  lane_y <- lapply(lane_shapes, bounds)
  names(lane_y) <- xml2::xml_attr(lane_shapes, "bpmnElement")
  for (task in c("deliver", "receive", "validate", "review")) {
    ln <- paste0("Lane_", c(
      deliver = "analyst", receive = "system",
      validate = "system", review = "team"
    )[[task]])
    tb <- bounds(shp(paste0("[@bpmnElement = '", task, "']"))[[1]])
    expect_gte(tb[2], lane_y[[ln]][2])
    expect_lte(tb[2] + tb[4], lane_y[[ln]][2] + lane_y[[ln]][4])
  }

  # the collapsed external pool sits above the main pool
  ext <- shp("[@bpmnElement = 'Pool_Reporting_unit']")
  expect_length(ext, 1L)
  eb <- bounds(ext[[1]])
  expect_lte(eb[2] + eb[4], pb[2])

  # the whole thing still reads back
  expect_s3_class(read_bpmn(doc), "bpmn")
})

test_that("layout of a lane-free model is untouched by the banding path", {
  skip_if(Sys.which("node") == "", "needs node")

  df <- data.frame(task = c("a", "b"), name = c("A", "B"),
                   depends_on = c("", "a"))
  doc <- xml2::read_xml(layout_bpmn(as_bpmn(df)))
  expect_length(
    xml2::xml_find_all(doc, ".//*[local-name() = 'BPMNEdge']"), 3L
  )
  expect_length(
    xml2::xml_find_all(doc, ".//*[local-name() = 'BPMNShape'][@isHorizontal]"),
    0L
  )
})
