#' Generate BPMN 2.0 XML from a tidy BPMN model
#'
#' Produces the semantic half of a standard BPMN 2.0 interchange document
#' (no diagram coordinates). Use [layout_bpmn()] or [write_bpmn()] to add
#' auto-computed layout, or [bpmn_widget()] to render directly (layout then
#' happens in the browser).
#'
#' @param x A [bpmn()] model.
#' @param include_lanes Emit a `laneSet` from the `lane` column? Default
#'   `TRUE`. Nodes without a lane (synthesized gateways, start/end events)
#'   inherit the lane of a neighbour, majority of predecessors first. The
#'   bundled auto-layout library (bpmn-auto-layout 1.3.0) drops all
#'   sequence-flow edges when a `laneSet` is present, so the layout paths
#'   ([layout_bpmn()] and the widget) strip the lanes before laying out and
#'   band the result back into lanes afterwards.
#'
#' @return An `xml2::xml_document`.
#'
#' @export
bpmn_xml <- function(x, include_lanes = TRUE) {
  stopifnot(inherits(x, "bpmn"))

  doc <- xml2::xml_new_root(
    "bpmn:definitions",
    "xmlns:bpmn" = "http://www.omg.org/spec/BPMN/20100524/MODEL",
    "xmlns:bpmndi" = "http://www.omg.org/spec/BPMN/20100524/DI",
    "xmlns:dc" = "http://www.omg.org/spec/DD/20100524/DC",
    "xmlns:di" = "http://www.omg.org/spec/DD/20100524/DI",
    id = "Definitions_1",
    targetNamespace = "http://blockr.process/bpmn"
  )

  # Lanes: one per distinct non-NA `lane` value, every node assigned
  lane_of <- if (include_lanes) fill_lanes(x$nodes, x$flows) else NULL
  lanes <- unique(lane_of[!is.na(lane_of)])
  msgs <- x$messages

  # A pool only makes sense in a collaboration, and message flows require
  # one: wrap the process in a participant when either is present.
  if (length(lanes) || !is.null(msgs)) {
    collab <- xml2::xml_add_child(
      doc, "bpmn:collaboration",
      id = "Collaboration_1"
    )
    xml2::xml_add_child(
      collab, "bpmn:participant",
      id = "Participant_1", name = x$name, processRef = "Process_1"
    )
    if (!is.null(msgs)) {
      pools <- unique(ifelse(
        msgs$from %in% x$nodes$id, msgs$to, msgs$from
      ))
      pool_id <- stats::setNames(paste0("Pool_", make_id(pools)), pools)
      for (p in pools) {
        # no processRef: a collapsed, black-box pool
        xml2::xml_add_child(
          collab, "bpmn:participant",
          id = pool_id[[p]], name = p
        )
      }
      ref <- function(v) ifelse(v %in% x$nodes$id, v, pool_id[v])
      for (i in seq_len(nrow(msgs))) {
        if (is.na(msgs$name[i]) || !nzchar(msgs$name[i])) {
          xml2::xml_add_child(
            collab, "bpmn:messageFlow",
            id = paste0("MessageFlow_", i),
            sourceRef = ref(msgs$from[i]), targetRef = ref(msgs$to[i])
          )
        } else {
          xml2::xml_add_child(
            collab, "bpmn:messageFlow",
            id = paste0("MessageFlow_", i),
            sourceRef = ref(msgs$from[i]), targetRef = ref(msgs$to[i]),
            name = msgs$name[i]
          )
        }
      }
    }
  }

  proc <- xml2::xml_add_child(
    doc, "bpmn:process",
    id = "Process_1", name = x$name, isExecutable = "false"
  )

  if (length(lanes)) {
    lane_set <- xml2::xml_add_child(proc, "bpmn:laneSet", id = "LaneSet_1")
    for (ln in lanes) {
      lane <- xml2::xml_add_child(
        lane_set, "bpmn:lane",
        id = paste0("Lane_", make_id(ln)), name = ln
      )
      for (nid in x$nodes$id[!is.na(lane_of) & lane_of == ln]) {
        ref <- xml2::xml_add_child(lane, "bpmn:flowNodeRef")
        xml2::xml_set_text(ref, nid)
      }
    }
  }

  flow_ids <- paste0("Flow_", seq_len(nrow(x$flows)))

  for (i in seq_len(nrow(x$nodes))) {
    n <- x$nodes[i, ]
    el <- if (is.na(n$name) || !nzchar(n$name)) {
      xml2::xml_add_child(proc, paste0("bpmn:", n$type), id = n$id)
    } else {
      xml2::xml_add_child(proc, paste0("bpmn:", n$type), id = n$id, name = n$name)
    }
    # <bpmn:incoming>/<bpmn:outgoing> references are required for tools
    # (incl. the bundled auto-layout) to traverse the graph
    for (fid in flow_ids[x$flows$to == n$id]) {
      ref <- xml2::xml_add_child(el, "bpmn:incoming")
      xml2::xml_set_text(ref, fid)
    }
    for (fid in flow_ids[x$flows$from == n$id]) {
      ref <- xml2::xml_add_child(el, "bpmn:outgoing")
      xml2::xml_set_text(ref, fid)
    }
    # Last, per the tActivity content model (loopCharacteristics follows
    # incoming/outgoing): the ||| marker on the box, or the sequential
    # three-bar one when the elements run one at a time.
    if (isTRUE(n$multi)) {
      xml2::xml_add_child(
        el, "bpmn:multiInstanceLoopCharacteristics",
        isSequential = if (isTRUE(n$multi_seq)) "true" else "false"
      )
    }
    # What the script task runs (a jobs-directory file or pkg::fun), so a
    # table -> XML -> table round trip keeps the worker wiring.
    if (n$type == "scriptTask" && !is.na(n$script) && nzchar(n$script)) {
      s <- xml2::xml_add_child(el, "bpmn:script")
      xml2::xml_set_text(s, n$script)
    }
  }

  for (i in seq_len(nrow(x$flows))) {
    f <- x$flows[i, ]
    if (is.na(f$name) || !nzchar(f$name)) {
      xml2::xml_add_child(
        proc, "bpmn:sequenceFlow",
        id = flow_ids[i], sourceRef = f$from, targetRef = f$to
      )
    } else {
      xml2::xml_add_child(
        proc, "bpmn:sequenceFlow",
        id = flow_ids[i], sourceRef = f$from, targetRef = f$to,
        name = f$name
      )
    }
  }

  doc
}

#' Turn a label into a safe XML id fragment
#' @noRd
make_id <- function(x) {
  gsub("[^A-Za-z0-9]", "_", x)
}

#' Assign every node a lane
#'
#' BPMN wants each flow node in exactly one lane once a laneSet exists, but
#' synthesized nodes (start/end events, join gateways) have none. They
#' inherit a neighbour's lane: the majority of their predecessors when any
#' predecessor has one (a join belongs where its inputs converge, the end
#' event where the process ends), otherwise the majority of their
#' successors (the start event belongs to whoever acts first).
#'
#' Returns a character vector along `nodes` (`NA` throughout when no node
#' has a lane -- then no laneSet is emitted at all).
#' @noRd
fill_lanes <- function(nodes, flows) {
  lane <- ifelse(is.na(nodes$lane) | !nzchar(nodes$lane), NA, nodes$lane)
  names(lane) <- nodes$id
  if (all(is.na(lane))) {
    return(unname(lane))
  }

  majority <- function(v) {
    v <- v[!is.na(v)]
    if (!length(v)) NA_character_ else names(which.max(table(v)))
  }
  for (i in seq_len(nrow(nodes) + 1L)) {
    open <- names(lane)[is.na(lane)]
    if (!length(open)) break
    for (id in open) {
      pick <- majority(lane[flows$from[flows$to == id]])
      if (is.na(pick)) pick <- majority(lane[flows$to[flows$from == id]])
      if (!is.na(pick)) lane[[id]] <- pick
    }
  }
  # a node not connected to anything laned at all
  lane[is.na(lane)] <- lane[!is.na(lane)][1L]
  lane
}

#' Add auto-computed diagram layout to a BPMN model
#'
#' Runs the bundled 'bpmn-auto-layout' library (via Node.js) to add BPMN
#' diagram interchange (shape coordinates, edge waypoints) to the semantic
#' XML, so the exported file opens with a proper diagram in any BPMN tool.
#'
#' @param x A [bpmn()] model or a BPMN XML string.
#'
#' @return BPMN XML (character) including `BPMNDiagram` layout.
#'
#' @export
layout_bpmn <- function(x) {
  xml <- if (inherits(x, "bpmn")) {
    as.character(bpmn_xml(x))
  } else {
    as.character(x)
  }

  node_bin <- Sys.which("node")
  if (!nzchar(node_bin)) {
    stop(
      "layout_bpmn() needs Node.js (>= 18) on the PATH. ",
      "Rendering via bpmn_widget() works without it (layout runs in the browser)."
    )
  }
  cli <- system.file("node", "layout-cli.mjs", package = "blockr.process")
  if (!nzchar(cli)) stop("Bundled layout-cli.mjs not found.")

  tmp_in <- tempfile(fileext = ".bpmn")
  on.exit(unlink(tmp_in), add = TRUE)
  writeLines(xml, tmp_in)

  res <- suppressWarnings(
    system2(node_bin, cli, stdin = tmp_in, stdout = TRUE, stderr = TRUE)
  )
  status <- attr(res, "status")
  if (!is.null(status) && status != 0) {
    stop("bpmn-auto-layout failed: ", paste(res, collapse = "\n"))
  }
  paste(res, collapse = "\n")
}

#' Write a tidy BPMN model to a .bpmn file
#'
#' @param x A [bpmn()] model.
#' @param path Output file path (conventionally `.bpmn`).
#' @param layout Add auto-computed diagram layout (needs Node.js)? If `FALSE`,
#'   only the semantic XML is written.
#'
#' @return `path`, invisibly.
#'
#' @export
write_bpmn <- function(x, path, layout = TRUE) {
  stopifnot(inherits(x, "bpmn"))
  if (layout) {
    writeLines(layout_bpmn(x), path)
  } else {
    xml2::write_xml(bpmn_xml(x), path)
  }
  invisible(path)
}
