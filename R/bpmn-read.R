#' Read a BPMN 2.0 XML file into a tidy BPMN model
#'
#' The inverse of [bpmn_xml()]: parses the semantic half of a BPMN 2.0
#' interchange document -- from this package, Camunda Modeler, bpmn.io or
#' any other standards-conform tool -- into a [bpmn()] model. Diagram
#' coordinates are ignored (layout is always recomputed), namespace
#' prefixes don't matter (`bpmn:`, `bpmn2:`, none).
#'
#' What is read: the flow nodes [bpmn()] models (events, tasks, gateways),
#' sequence flows with their labels, lanes, multi-instance markers
#' (`isSequential` included), a `<script>` child on script tasks (the
#' worker wiring [bpmn_xml()] writes), and message flows to or from
#' collapsed pools. A file using elements outside that vocabulary
#' (sub-processes, boundary or intermediate events, call activities) is
#' refused with a list of the offending elements rather than silently
#' flattened.
#'
#' @param x A path to a `.bpmn` file, a string of BPMN XML, or an
#'   `xml2::xml_document`.
#'
#' @return A [bpmn()] model. Pass it on to [bpmn_to_table()] to get a wide
#'   process-table scaffold blockr.process can run.
#'
#' @seealso [bpmn_to_table()], [bpmn_xml()], [write_bpmn()]
#'
#' @export
read_bpmn <- function(x) {
  doc <- if (inherits(x, "xml_document")) {
    x
  } else {
    stopifnot(is.character(x))
    xml2::read_xml(paste(x, collapse = "\n"))
  }

  procs <- find_local(doc, ".//process")
  if (!length(procs)) {
    stop("No <process> element found in the BPMN document.")
  }
  if (length(procs) > 1L) {
    warning("Multiple <process> elements; reading the first only.")
  }
  proc <- procs[[1]]
  proc_id <- xml2::xml_attr(proc, "id")

  node_types <- c(
    "startEvent", "endEvent", "task", "userTask", "serviceTask",
    "scriptTask", "manualTask", "sendTask", "receiveTask",
    "exclusiveGateway", "parallelGateway", "inclusiveGateway",
    "complexGateway"
  )
  unsupported <- c(
    "subProcess", "adHocSubProcess", "transaction", "callActivity",
    "boundaryEvent", "intermediateCatchEvent", "intermediateThrowEvent",
    "eventBasedGateway", "businessRuleTask"
  )

  kids <- xml2::xml_children(proc)
  nm <- xml2::xml_name(kids)
  bad <- unique(nm[nm %in% unsupported])
  if (length(bad)) {
    stop(
      "The process uses BPMN elements blockr.process does not model: ",
      paste(bad, collapse = ", "), "."
    )
  }

  # -- nodes ------------------------------------------------------------------
  node_els <- kids[nm %in% node_types]
  if (!length(node_els)) {
    stop("The process contains no flow nodes.")
  }
  read_node <- function(el) {
    multi <- find_local1(el, "./multiInstanceLoopCharacteristics")
    script <- find_local1(el, "./script")
    data.frame(
      id = xml2::xml_attr(el, "id"),
      name = xml2::xml_attr(el, "name", default = ""),
      type = xml2::xml_name(el),
      lane = NA_character_,
      script = if (inherits(script, "xml_missing")) {
        NA_character_
      } else {
        xml2::xml_text(script)
      },
      multi = !inherits(multi, "xml_missing"),
      multi_seq = !inherits(multi, "xml_missing") &&
        identical(xml2::xml_attr(multi, "isSequential"), "true"),
      stringsAsFactors = FALSE
    )
  }
  nodes <- do.call(rbind, lapply(node_els, read_node))
  if (anyNA(nodes$id)) {
    stop("Every flow node needs an id.")
  }

  # -- lanes ------------------------------------------------------------------
  for (lane in find_local(proc, "./laneSet/lane")) {
    label <- xml2::xml_attr(lane, "name")
    if (is.na(label) || !nzchar(label)) label <- xml2::xml_attr(lane, "id")
    refs <- xml2::xml_text(find_local(lane, "./flowNodeRef"))
    nodes$lane[nodes$id %in% refs] <- label
  }

  # -- sequence flows ---------------------------------------------------------
  flow_els <- kids[nm == "sequenceFlow"]
  flows <- data.frame(
    from = vapply(flow_els, xml2::xml_attr, character(1), attr = "sourceRef"),
    to = vapply(flow_els, xml2::xml_attr, character(1), attr = "targetRef"),
    name = vapply(flow_els, xml2::xml_attr, character(1), attr = "name"),
    stringsAsFactors = FALSE
  )

  # -- message flows (collapsed pools) ----------------------------------------
  messages <- NULL
  collab <- find_local1(doc, ".//collaboration")
  if (!inherits(collab, "xml_missing")) {
    parts <- find_local(collab, "./participant")
    part_label <- stats::setNames(
      ifelse(
        nzchar(xml2::xml_attr(parts, "name", default = "")),
        xml2::xml_attr(parts, "name", default = ""),
        xml2::xml_attr(parts, "id")
      ),
      xml2::xml_attr(parts, "id")
    )
    endpoint <- function(ref) {
      if (ref %in% nodes$id) ref else part_label[ref]
    }
    rows <- lapply(find_local(collab, "./messageFlow"), function(mf) {
      from <- xml2::xml_attr(mf, "sourceRef")
      to <- xml2::xml_attr(mf, "targetRef")
      # keep only flows touching this process: one node end, one pool end
      if (xor(from %in% nodes$id, to %in% nodes$id)) {
        data.frame(
          from = endpoint(from), to = endpoint(to),
          name = xml2::xml_attr(mf, "name"),
          stringsAsFactors = FALSE
        )
      }
    })
    rows <- rows[!vapply(rows, is.null, logical(1))]
    if (length(rows)) messages <- do.call(rbind, rows)
  }

  # -- process name -----------------------------------------------------------
  name <- xml2::xml_attr(proc, "name")
  if (is.na(name) || !nzchar(name)) {
    part <- find_local1(
      doc,
      sprintf(".//collaboration/participant[@processRef='%s']", proc_id)
    )
    name <- if (inherits(part, "xml_missing")) {
      NA_character_
    } else {
      xml2::xml_attr(part, "name")
    }
  }
  if (is.na(name) || !nzchar(name)) name <- "Process"

  bpmn(nodes, flows, name = name, messages = messages)
}

#' Namespace-agnostic xpath: match element names by local-name()
#'
#' BPMN files prefix their elements differently (`bpmn:`, `bpmn2:`, a
#' default namespace, none), and `xml2::xml_ns_strip()` only removes
#' default namespaces. Rewriting each step of a simple path as
#' `*[local-name() = ...]` matches them all. Predicates (`[@a='b']`) are
#' kept verbatim.
#' @noRd
local_xpath <- function(path) {
  steps <- strsplit(path, "/", fixed = TRUE)[[1]]
  steps <- vapply(steps, function(s) {
    if (!nzchar(s) || s == "." || s == "..") {
      return(s)
    }
    pred <- ""
    if (grepl("[", s, fixed = TRUE)) {
      pred <- sub("^[^\\[]*", "", s)
      s <- sub("\\[.*$", "", s)
    }
    paste0("*[local-name() = '", s, "']", pred)
  }, character(1))
  paste(steps, collapse = "/")
}

#' @noRd
find_local <- function(x, path) {
  xml2::xml_find_all(x, local_xpath(path))
}

#' @noRd
find_local1 <- function(x, path) {
  xml2::xml_find_first(x, local_xpath(path))
}

#' Convert a tidy BPMN model to a wide process-table scaffold
#'
#' The inverse of [as_bpmn()], so a process drawn in any BPMN tool becomes
#' a table blockr.process can run: draw in Camunda Modeler, [read_bpmn()]
#' the file, `bpmn_to_table()` the model, drop the table into a process
#' block.
#'
#' What the inversion does:
#' - Events and gateways disappear into the `depends_on` grammar: a task
#'   behind a converging gateway depends on everything flowing into that
#'   gateway (`join` records the kind -- exclusive/inclusive merge becomes
#'   `"any"`, a complex gateway named `"k of n"` becomes `"n=k"`); a task
#'   behind a diverging gateway depends on the gateway's input, qualified
#'   by the branch label (`"validate:yes"`). Chains of gateways resolve
#'   through.
#' - Lanes become `role`; a lane-less script/service/send/receive task
#'   becomes `role = "system"`.
#' - Multi-instance activities are grouped back into containers: each
#'   connected run of multi-instance nodes gets a group row (`collection =
#'   "item"`, a placeholder), its members point at it via `parent`, and
#'   edges crossing the group boundary are lifted onto the group row --
#'   the inverse of the lowering [as_bpmn()] performs.
#'
#' The result is a **scaffold**, not a finished definition: fill in
#' `collection` names, check the quorums, and add `script` values where the
#' XML did not carry them (files written by [write_bpmn()] do).
#'
#' @param x A [bpmn()] model.
#'
#' @return A tibble with columns `task`, `name`, `role`, `depends_on`,
#'   `script`, `collection`, `parent`, `join`, `sequential`.
#'
#' @seealso [read_bpmn()], [as_bpmn()]
#'
#' @export
bpmn_to_table <- function(x) {
  stopifnot(inherits(x, "bpmn"))
  nodes <- x$nodes
  flows <- x$flows

  gw_types <- c(
    "exclusiveGateway", "parallelGateway", "inclusiveGateway",
    "complexGateway"
  )
  kind <- stats::setNames(
    ifelse(
      nodes$type %in% gw_types, "gateway",
      ifelse(nodes$type %in% c("startEvent", "endEvent"), "event", "task")
    ),
    nodes$id
  )
  type_of <- stats::setNames(nodes$type, nodes$id)
  name_of <- stats::setNames(nodes$name, nodes$id)
  indeg <- stats::setNames(
    vapply(nodes$id, function(id) sum(flows$to == id), integer(1)),
    nodes$id
  )

  no_deps <- data.frame(
    on = character(0), label = character(0), stringsAsFactors = FALSE
  )

  # the incoming edges of `id`, resolved through gateways to task-level
  # gates: a diverging gateway's branch label qualifies the dependency,
  # a converging gateway fans out into all of its inputs
  resolve_in <- function(id, seen = character(0)) {
    inc <- flows[flows$to == id, , drop = FALSE]
    out <- no_deps
    for (i in seq_len(nrow(inc))) {
      src <- inc$from[i]
      lab <- inc$name[i]
      if (!src %in% names(kind) || kind[[src]] == "event") next
      if (kind[[src]] == "gateway") {
        if (src %in% seen) next
        up <- resolve_in(src, c(seen, src))
        if (!is.na(lab) && nzchar(lab)) {
          up$label <- ifelse(is.na(up$label), lab, up$label)
        }
        out <- rbind(out, up)
      } else {
        out <- rbind(out, data.frame(
          on = src,
          label = if (is.na(lab) || !nzchar(lab)) NA_character_ else lab,
          stringsAsFactors = FALSE
        ))
      }
    }
    unique(out)
  }

  # the quorum of the converging gateway directly in front of a task
  join_of <- function(id) {
    srcs <- flows$from[flows$to == id]
    srcs <- srcs[srcs %in% names(kind)]
    g <- srcs[kind[srcs] == "gateway" & indeg[srcs] > 1L]
    if (!length(g)) {
      return("")
    }
    ty <- type_of[[g[1L]]]
    if (ty == "parallelGateway") {
      return("") # all of them, the default
    }
    if (ty == "complexGateway") {
      m <- regmatches(name_of[[g[1L]]], regexec("^(\\d+) of \\d+$", name_of[[g[1L]]]))[[1L]]
      if (length(m) == 2L) {
        return(paste0("n=", m[2L]))
      }
    }
    "any" # exclusive/inclusive merge, or an unreadable quorum
  }

  t_ids <- nodes$id[kind[nodes$id] == "task"]
  resolved <- stats::setNames(lapply(t_ids, resolve_in), t_ids)
  parent <- stats::setNames(rep("", length(t_ids)), t_ids)

  # -- regroup multi-instance runs into containers ----------------------------
  multi_of <- stats::setNames(nodes$multi, nodes$id)
  seq_of <- stats::setNames(nodes$multi_seq, nodes$id)
  remaining <- t_ids[multi_of[t_ids]]
  groups <- list()
  while (length(remaining)) {
    comp <- remaining[1L]
    repeat {
      grow <- unique(c(
        flows$to[flows$from %in% comp], flows$from[flows$to %in% comp]
      ))
      grow <- setdiff(intersect(grow, remaining), comp)
      if (!length(grow)) break
      comp <- c(comp, grow)
    }
    remaining <- setdiff(remaining, comp)

    gid <- paste0("each_", comp[1L])
    while (gid %in% c(t_ids, names(groups))) gid <- paste0(gid, "_grp")

    ext <- no_deps
    for (m in comp) {
      r <- resolved[[m]]
      outside <- !(r$on %in% comp)
      ext <- rbind(ext, r[outside, , drop = FALSE])
      resolved[[m]] <- r[!outside, , drop = FALSE]
      parent[[m]] <- gid
    }
    for (t in setdiff(t_ids, comp)) {
      r <- resolved[[t]]
      hit <- r$on %in% comp
      if (any(hit)) {
        r$on[hit] <- gid
        resolved[[t]] <- unique(r)
      }
    }
    groups[[gid]] <- list(
      first = comp[1L],
      deps = unique(ext),
      sequential = any(seq_of[comp])
    )
  }
  # a group gating on another group's member gates on that group
  for (gid in names(groups)) {
    d <- groups[[gid]]$deps
    hit <- d$on %in% names(parent) & nzchar(parent[d$on])
    d$on[hit] <- parent[d$on[hit]]
    groups[[gid]]$deps <- unique(d)
  }

  # -- assemble, group rows ahead of their first member -----------------------
  role_of <- function(id) {
    ln <- nodes$lane[nodes$id == id]
    if (!is.na(ln) && nzchar(ln)) {
      return(ln)
    }
    if (type_of[[id]] %in% c("scriptTask", "serviceTask", "sendTask", "receiveTask")) {
      return("system")
    }
    ""
  }

  rows <- list()
  for (id in t_ids) {
    gid <- parent[[id]]
    if (nzchar(gid) && !is.null(groups[[gid]])) {
      g <- groups[[gid]]
      groups[[gid]] <- NULL # emit once, before the first member reached
      rows[[length(rows) + 1L]] <- data.frame(
        task = gid, name = "Multi-instance group", role = "",
        depends_on = dep_string(g$deps), script = "", collection = "item",
        parent = "", join = "", sequential = g$sequential,
        stringsAsFactors = FALSE
      )
    }
    script <- nodes$script[nodes$id == id]
    rows[[length(rows) + 1L]] <- data.frame(
      task = id, name = name_of[[id]], role = role_of(id),
      depends_on = dep_string(resolved[[id]]),
      script = if (is.na(script)) "" else script,
      collection = "", parent = parent[[id]], join = join_of(id),
      sequential = FALSE, stringsAsFactors = FALSE
    )
  }

  tibble::as_tibble(do.call(rbind, rows))
}
