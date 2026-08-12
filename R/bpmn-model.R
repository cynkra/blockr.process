#' Create a tidy BPMN model
#'
#' A BPMN process model as two data frames: one row per node (events, tasks,
#' gateways), one row per sequence flow (the arrows). This is the tidy
#' counterpart of the semantic half of a BPMN 2.0 XML file. Layout (the
#' "diagram interchange" half) is computed automatically and is never part
#' of the model.
#'
#' @param nodes Data frame with columns `id`, `name`, `type` and optionally
#'   `lane`, `multi` (logical: draw the activity as multi-instance, the
#'   `|||` marker) and `multi_seq` (logical: that multi-instance runs its
#'   elements one at a time, BPMN `isSequential`, drawn as the `≡` marker).
#'   Recognized types (aliases in parentheses): `startEvent`
#'   (`start`), `endEvent` (`end`), `task`, `userTask` (`user`),
#'   `serviceTask` (`service`), `scriptTask` (`script`), `manualTask`
#'   (`manual`), `exclusiveGateway` (`gateway`, `xor`), `parallelGateway`
#'   (`parallel`, `and`), `complexGateway` (`complex`, the quorum join).
#' @param flows Data frame with columns `from`, `to` and optionally `name`
#'   (the label on the arrow, e.g. a gateway condition).
#' @param name Process name.
#'
#' @return A `bpmn` object: a list with `nodes`, `flows` and `name`.
#'
#' @examples
#' m <- bpmn(
#'   nodes = data.frame(
#'     id = c("a", "b", "c"),
#'     name = c("Start", "Do work", "Done"),
#'     type = c("start", "task", "end")
#'   ),
#'   flows = data.frame(from = c("a", "b"), to = c("b", "c"))
#' )
#' m
#'
#' @export
bpmn <- function(nodes, flows, name = "Process") {
  stopifnot(is.data.frame(nodes), is.data.frame(flows))

  req_nodes <- c("id", "name", "type")
  missing_req <- setdiff(req_nodes, names(nodes))
  if (length(missing_req)) {
    stop("`nodes` is missing columns: ", paste(missing_req, collapse = ", "))
  }
  req_flows <- c("from", "to")
  missing_req <- setdiff(req_flows, names(flows))
  if (length(missing_req)) {
    stop("`flows` is missing columns: ", paste(missing_req, collapse = ", "))
  }

  nodes <- tibble::as_tibble(nodes)
  flows <- tibble::as_tibble(flows)

  nodes$id <- as.character(nodes$id)
  nodes$name <- as.character(nodes$name)
  nodes$type <- canonical_type(as.character(nodes$type))
  if (!"lane" %in% names(nodes)) nodes$lane <- NA_character_
  nodes$lane <- as.character(nodes$lane)
  # a multi-instance activity: one BPMN box, run once per element of a
  # collection, drawn with the ||| marker
  if (!"multi" %in% names(nodes)) nodes$multi <- FALSE
  nodes$multi <- !is.na(nodes$multi) & as.logical(nodes$multi)
  if (!"multi_seq" %in% names(nodes)) nodes$multi_seq <- FALSE
  nodes$multi_seq <- nodes$multi &
    !is.na(nodes$multi_seq) & as.logical(nodes$multi_seq)

  flows$from <- as.character(flows$from)
  flows$to <- as.character(flows$to)
  if (!"name" %in% names(flows)) flows$name <- NA_character_
  flows$name <- as.character(flows$name)

  # -- validation -------------------------------------------------------------
  if (anyNA(nodes$id) || any(!nzchar(nodes$id))) {
    stop("Every node needs a non-empty `id`.")
  }
  dup <- nodes$id[duplicated(nodes$id)]
  if (length(dup)) {
    stop("Duplicated node ids: ", paste(unique(dup), collapse = ", "))
  }
  # BPMN ids are XML NCNames: must start with a letter or underscore.
  # Invalid ids make bpmn-moddle drop the element silently and the
  # auto-layouter then crashes on an undefined lookup.
  bad_id <- !grepl("^[A-Za-z_][A-Za-z0-9_.-]*$", nodes$id)
  if (any(bad_id)) {
    stop(
      "Invalid node id(s) (BPMN ids must start with a letter or '_', ",
      "then letters, digits, '_', '-', '.'): ",
      paste(unique(nodes$id[bad_id]), collapse = ", ")
    )
  }
  unknown <- setdiff(c(flows$from, flows$to), nodes$id)
  if (length(unknown)) {
    stop(
      "Flows reference unknown node ids: ",
      paste(unique(unknown), collapse = ", ")
    )
  }
  if (!any(nodes$type == "startEvent")) {
    stop("A BPMN process needs at least one start event (type = \"start\").")
  }
  if (!any(nodes$type == "endEvent")) {
    stop("A BPMN process needs at least one end event (type = \"end\").")
  }

  structure(
    list(nodes = nodes, flows = flows, name = as.character(name)),
    class = "bpmn"
  )
}

#' Map friendly type aliases to BPMN element names
#' @noRd
canonical_type <- function(x) {
  map <- c(
    start = "startEvent", startevent = "startEvent",
    end = "endEvent", endevent = "endEvent",
    task = "task",
    user = "userTask", usertask = "userTask",
    service = "serviceTask", servicetask = "serviceTask",
    script = "scriptTask", scripttask = "scriptTask",
    manual = "manualTask", manualtask = "manualTask",
    gateway = "exclusiveGateway", xor = "exclusiveGateway",
    exclusivegateway = "exclusiveGateway",
    parallel = "parallelGateway", and = "parallelGateway",
    parallelgateway = "parallelGateway",
    complex = "complexGateway", complexgateway = "complexGateway"
  )
  out <- unname(map[tolower(x)])
  bad <- is.na(out)
  if (any(bad)) {
    stop(
      "Unknown node type(s): ", paste(unique(x[bad]), collapse = ", "),
      "\nRecognized: start, end, task, user, service, script, manual, ",
      "gateway (xor), parallel (and), complex."
    )
  }
  out
}

#' @export
print.bpmn <- function(x, ...) {
  cat(
    "<bpmn> ", x$name, ": ", nrow(x$nodes), " node(s), ",
    nrow(x$flows), " flow(s)\n\n", sep = ""
  )
  cat("Nodes:\n")
  print(x$nodes)
  cat("\nFlows:\n")
  print(x$flows)
  invisible(x)
}
