#' Generate BPMN 2.0 XML from a tidy BPMN model
#'
#' Produces the semantic half of a standard BPMN 2.0 interchange document
#' (no diagram coordinates). Use [layout_bpmn()] or [write_bpmn()] to add
#' auto-computed layout, or [bpmn_widget()] to render directly (layout then
#' happens in the browser).
#'
#' @param x A [bpmn()] model.
#' @param include_lanes Emit a `laneSet` from the `lane` column? Default
#'   `FALSE`: the bundled auto-layout library (bpmn-auto-layout 1.3.0) drops
#'   all sequence-flow edges when a `laneSet` is present, so lanes are
#'   currently kept out of the layout/render path. The `lane` column stays
#'   part of the tidy model.
#'
#' @return An `xml2::xml_document`.
#'
#' @export
bpmn_xml <- function(x, include_lanes = FALSE) {
  stopifnot(inherits(x, "bpmn"))

  doc <- xml2::xml_new_root(
    "bpmn:definitions",
    "xmlns:bpmn" = "http://www.omg.org/spec/BPMN/20100524/MODEL",
    "xmlns:bpmndi" = "http://www.omg.org/spec/BPMN/20100524/DI",
    id = "Definitions_1",
    targetNamespace = "http://blockr.process/bpmn"
  )
  proc <- xml2::xml_add_child(
    doc, "bpmn:process",
    id = "Process_1", name = x$name, isExecutable = "false"
  )

  # Lanes (optional): one lane per distinct non-NA `lane` value
  lanes <- if (include_lanes) {
    unique(x$nodes$lane[!is.na(x$nodes$lane) & nzchar(x$nodes$lane)])
  } else {
    character(0)
  }
  if (length(lanes)) {
    lane_set <- xml2::xml_add_child(proc, "bpmn:laneSet", id = "LaneSet_1")
    for (ln in lanes) {
      lane <- xml2::xml_add_child(
        lane_set, "bpmn:lane",
        id = paste0("Lane_", make_id(ln)), name = ln
      )
      for (nid in x$nodes$id[!is.na(x$nodes$lane) & x$nodes$lane == ln]) {
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
