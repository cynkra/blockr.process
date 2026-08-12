#' Convert a wide process table to a tidy BPMN model
#'
#' The wide table is the "one table" convention: one row per process task,
#' skeleton columns describing the task, optional instance columns (`assignee`, `due`,
#' `status`) describing a run. `as_bpmn()` reads only the skeleton columns.
#'
#' Conventions:
#' - `role == "system"` becomes a script task (when `script` is set) or a
#'   service task; any other non-empty role becomes a user task; empty role
#'   a plain task.
#' - A row with a non-empty `collection` is a **multi-instance sub-process**
#'   (see [process_groups()]), not work of its own: it is dropped from the
#'   diagram and the rows whose `parent` names it are marked multi-instance
#'   instead, which is the `|||` marker on the activity.
#' - `depends_on` is comma-separated. A dependency may qualify the outcome it
#'   waits for: `"qacheck:true"`. The qualifier becomes the label on the
#'   arrow (`true`/`false` is the convention for binary checks).
#' - A dependency may name a **container**, in either direction: `"each_g"`
#'   waits for the sub-process to complete, and a container's own
#'   `depends_on` gates its members. Sequence flow may not cross a
#'   sub-process boundary in BPMN, so [process_body()] lowers container
#'   edges onto the members before anything else reads them (see there).
#' - Start and end events are synthesized: tasks without dependencies hang
#'   off a start event, tasks nothing depends on flow into an end event.
#' - Fan-in of more than one (non-loop) dependency synthesizes a join
#'   gateway. `join` on the waiting row says which kind: `all` (the default,
#'   a parallel gateway), `any`, or a quorum like `n=3` / `pct=90` (see
#'   [process_quorum()]). Loop-back edges (a dependency that is itself
#'   reachable from the task) stay direct arrows, so rework loops render as
#'   loops.
#'
#' @param df Data frame with at least `task` and `name` columns; `role`,
#'   `depends_on`, `script`, `parent`, `collection`, `join`, `complete_when`
#'   and `sequential` are used when present.
#' @param name Process name.
#'
#' @return A [bpmn()] model.
#'
#' @export
as_bpmn <- function(df, name = "Process") {
  stopifnot(is.data.frame(df), all(c("task", "name") %in% names(df)))

  # the sub-process rows are containers, so the diagram shows their members
  # carrying the multi-instance marker rather than a box of their own
  coll <- process_collection(df)
  multi <- stats::setNames(nzchar(coll), names(coll))
  seq_of <- process_sequential(df)
  df <- process_body(df)
  multi <- multi[!duplicated(names(multi))][as.character(df$task)]
  seq_of <- seq_of[!duplicated(names(seq_of))][as.character(df$task)]

  task <- as.character(task_col(df))
  role <- if ("role" %in% names(df)) as.character(df$role) else rep(NA, nrow(df))
  script <- if ("script" %in% names(df)) as.character(df$script) else rep(NA, nrow(df))
  join_spec <- chr_col(df, "join")

  id <- ncname(task)
  names(id) <- task

  dep <- parse_deps(df)

  node_type <- function(i) {
    r <- role[i]
    if (!is.na(r) && r == "system") {
      if (!is.na(script[i]) && nzchar(script[i])) "script" else "service"
    } else if (!is.na(r) && nzchar(r)) {
      "user"
    } else {
      "task"
    }
  }

  nodes <- data.frame(
    id = unname(id),
    name = as.character(df$name),
    type = vapply(seq_along(task), node_type, character(1)),
    lane = role,
    multi = unname(multi),
    multi_seq = unname(seq_of),
    stringsAsFactors = FALSE
  )
  flows <- data.frame(
    from = character(0), to = character(0), name = character(0),
    stringsAsFactors = FALSE
  )

  loops <- loop_deps(task, dep)

  for (i in seq_along(task)) {
    d <- dep[[i]]
    if (!nrow(d)) next
    is_loop <- d$on %in% loops[[task[i]]]
    direct <- d[is_loop, , drop = FALSE]
    gated <- d[!is_loop, , drop = FALSE]

    if (nrow(gated) > 1) {
      join <- paste0("join_", id[[task[i]]])
      need <- process_quorum(join_spec[i], nrow(gated))
      nodes <- rbind(nodes, data.frame(
        id = join,
        name = join_label(join_spec[i], need, nrow(gated)),
        type = join_type(need, nrow(gated)),
        lane = NA, multi = FALSE, multi_seq = FALSE,
        stringsAsFactors = FALSE
      ))
      flows <- rbind(
        flows,
        data.frame(from = id[gated$on], to = join, name = gated$label,
                   stringsAsFactors = FALSE),
        data.frame(from = join, to = id[[task[i]]], name = NA,
                   stringsAsFactors = FALSE)
      )
    } else if (nrow(gated) == 1) {
      flows <- rbind(flows, data.frame(
        from = id[[gated$on]], to = id[[task[i]]], name = gated$label,
        stringsAsFactors = FALSE
      ))
    }
    if (nrow(direct)) {
      flows <- rbind(flows, data.frame(
        from = id[direct$on], to = id[[task[i]]], name = direct$label,
        stringsAsFactors = FALSE
      ))
    }
  }

  roots <- task[vapply(dep, nrow, integer(1)) == 0]
  depended_on <- unique(unlist(lapply(dep, function(d) d$on)))
  leaves <- setdiff(task, depended_on)

  nodes <- rbind(
    data.frame(id = "_start", name = "Start", type = "start", lane = NA,
               multi = FALSE, multi_seq = FALSE, stringsAsFactors = FALSE),
    nodes,
    data.frame(id = "_end", name = "End", type = "end", lane = NA,
               multi = FALSE, multi_seq = FALSE, stringsAsFactors = FALSE)
  )
  flows <- rbind(
    data.frame(from = "_start", to = unname(id[roots]), name = NA,
               stringsAsFactors = FALSE),
    flows,
    data.frame(from = unname(id[leaves]), to = "_end", name = NA,
               stringsAsFactors = FALSE)
  )

  bpmn(nodes, flows, name = name)
}

#' The gateway a fan-in synthesizes, from its quorum
#'
#' `all` is the parallel (AND) join BPMN draws where concurrent paths meet;
#' `any` is the exclusive merge; anything in between is a complex gateway,
#' which is the only BPMN element that carries a quorum.
#' @noRd
join_type <- function(need, n) {
  if (need >= n) "parallel" else if (need <= 1L) "gateway" else "complex"
}

#' @noRd
join_label <- function(spec, need, n) {
  if (need >= n) "" else if (need <= 1L) "any" else paste0(need, " of ", n)
}

#' Multi-instance groups of a wide process table
#'
#' The part of a process that repeats is a BPMN **multi-instance
#' sub-process**, and under the one-table convention that sub-process is a
#' row like any other: a row with a non-empty `collection` is the group, and
#' the rows whose `parent` names it are its members. Each member runs once
#' per element of the collection, and a task outside the group that depends
#' on it waits for the whole sub-process to complete (the parallel join,
#' see `complete_when` for the quorum).
#'
#' The value of `collection` names the **collection type** the sub-process
#' iterates (`unit`), not the concrete list: the definition is
#' list-agnostic and the elements are bound when an instance starts. In
#' Camunda's vocabulary the column therefore holds `inputElement`, while
#' `inputCollection` is instance data.
#'
#' `process_groups()` lists the groups, `process_collection()` answers the
#' question every consumer actually asks -- what does this task repeat over
#' -- and `process_body()` drops the containers, leaving the rows that are
#' real work.
#'
#' Groups nest: a group whose `parent` names another group repeats inside
#' it. `process_scopes()` gives the full enclosing chain,
#' `process_collection()` the innermost collection.
#'
#' Tables written before groups existed marked every repeated task with a
#' `per` column instead; `process_collection()` falls back to it when there
#' is no `collection` column, so old definitions (and the process JSON
#' stamped into a running instance) keep folding.
#'
#' @param df A wide process table.
#'
#' @return `process_groups()`: a data frame with `group`, `name`,
#'   `collection`, `parent` (the enclosing group, `""` at top level),
#'   `complete_when` and `sequential`, one row per group.
#'
#' @export
process_groups <- function(df) {
  empty <- data.frame(
    group = character(0), name = character(0), collection = character(0),
    parent = character(0), complete_when = character(0),
    sequential = logical(0), stringsAsFactors = FALSE
  )
  if (!is.data.frame(df) || !nrow(df) || !all(c("task", "collection") %in% names(df))) {
    return(empty)
  }
  coll <- as.character(df$collection)
  coll[is.na(coll)] <- ""
  hit <- which(nzchar(coll))
  if (!length(hit)) {
    return(empty)
  }
  data.frame(
    group = as.character(task_col(df))[hit],
    name = if ("name" %in% names(df)) as.character(df$name)[hit] else "",
    collection = coll[hit],
    parent = chr_col(df, "parent")[hit],
    complete_when = chr_col(df, "complete_when")[hit],
    sequential = lgl_col(df, "sequential")[hit],
    stringsAsFactors = FALSE
  )
}

#' @rdname process_groups
#'
#' @return `process_scopes()`: a named list over every row of `df` -- the
#'   group ids enclosing that row, innermost first, `character(0)` at top
#'   level. Errors on a `parent` cycle.
#'
#' @export
process_scopes <- function(df) {
  task <- as.character(task_col(df))
  out <- stats::setNames(rep(list(character(0)), length(task)), task)
  if (!length(task)) {
    return(out)
  }

  grp <- process_groups(df)
  if (!nrow(grp)) {
    return(out)
  }
  parent <- stats::setNames(chr_col(df, "parent"), task)
  up <- stats::setNames(grp$parent, grp$group)

  for (i in seq_along(task)) {
    chain <- character(0)
    at <- parent[[i]]
    while (nzchar(at) && at %in% grp$group) {
      if (at %in% chain) {
        stop(
          "Cyclic `parent`: group '", at, "' encloses itself (via ",
          paste(chain, collapse = " -> "), ").",
          call. = FALSE
        )
      }
      chain <- c(chain, at)
      at <- up[[at]] %||na% ""
    }
    out[[i]] <- chain
  }
  out
}

#' @rdname process_groups
#'
#' @return `process_collection()`: a named character vector over every row of
#'   `df` -- the collection that row repeats over, `""` for single tasks and
#'   for the group rows themselves. Nested groups resolve to the innermost.
#'
#' @export
process_collection <- function(df) {
  task <- if (is.data.frame(df) && "task" %in% names(df)) {
    as.character(task_col(df))
  } else {
    character(0)
  }
  out <- stats::setNames(rep("", length(task)), task)
  if (!length(task)) {
    return(out)
  }

  grp <- process_groups(df)
  if (nrow(grp)) {
    scopes <- process_scopes(df)
    coll <- stats::setNames(grp$collection, grp$group)
    hit <- vapply(scopes, function(ch) {
      if (!length(ch)) "" else coll[[ch[1L]]]
    }, character(1))
    hit[task %in% grp$group] <- ""
    out[] <- unname(hit)
    return(out)
  }

  if ("per" %in% names(df)) {
    out[] <- chr_col(df, "per")
  }
  out
}

#' @rdname process_groups
#'
#' @return `process_complete_when()`: a named character vector over every row
#'   -- the quorum spec of the group that row belongs to (`""` = all, and
#'   `""` for single tasks). This is what a task waiting on the group has to
#'   clear; see [process_quorum()] for the grammar.
#'
#' @export
process_complete_when <- function(df) {
  out <- group_attr(df, "complete_when", "")
  if (!nrow(process_groups(df)) && "complete_when" %in% names(df)) {
    # no containers left to inherit from: an EXPANDED instance table, which
    # carries the resolved quorum per row the same way it carries `per`
    out[] <- chr_col(df, "complete_when")
  }
  out
}

#' @rdname process_groups
#'
#' @return `process_sequential()`: a named logical vector over every row --
#'   whether the group that row belongs to runs its elements one at a time
#'   (BPMN `isSequential`). `FALSE` for single tasks.
#'
#' @export
process_sequential <- function(df) {
  group_attr(df, "sequential", FALSE)
}

#' The value a row inherits from the innermost group it sits in
#' @noRd
group_attr <- function(df, field, default) {
  task <- if (is.data.frame(df) && "task" %in% names(df)) {
    as.character(task_col(df))
  } else {
    character(0)
  }
  out <- stats::setNames(rep(default, length(task)), task)
  if (!length(task)) {
    return(out)
  }
  grp <- process_groups(df)
  if (!nrow(grp)) {
    return(out)
  }
  scopes <- process_scopes(df)
  val <- stats::setNames(grp[[field]], grp$group)
  hit <- vapply(scopes, function(ch) {
    if (!length(ch)) default else val[[ch[1L]]]
  }, vector(mode = typeof(default), length = 1L))
  hit[task %in% grp$group] <- default
  stats::setNames(unname(hit), task)
}

#' @rdname process_groups
#'
#' @return `process_body()`: `df` without its group rows, with every
#'   container edge lowered onto the members (see details).
#'
#' @details
#' BPMN forbids a sequence flow that crosses a sub-process boundary: the
#' container carries the incoming and outgoing flows, its members are wired
#' only among themselves. `process_body()` is where that is turned back into
#' a flat table, by *lowering* each container's edges onto its members,
#' innermost group first:
#'
#' - `X depends_on G` becomes a dependency on every **leaf** member of `G`
#'   (the members nothing else in `G` waits for), which is the parallel join
#'   where the sub-process closes.
#' - `G depends_on Y` becomes a dependency of every **root** member of `G`
#'   (the members that wait for nothing else in `G`) on `Y`, which is the
#'   fan-out where it opens.
#'
#' A dependency that names a *member* from outside the group is left alone.
#' It lowers to the same edge, which is why definitions written before
#' containers were addressable keep working unchanged.
#'
#' @export
process_body <- function(df) {
  grp <- process_groups(df)
  if (!nrow(grp)) {
    return(df)
  }
  process_scopes(df) # validates: errors on a parent cycle
  lower_containers(df)
}

#' Lower every container's edges onto its members, innermost group first
#'
#' One group per pass, and the pass removes the container row, so a nested
#' group's members are re-parented outward and the enclosing group sees them
#' as direct children on the next pass. Terminates because every pass drops
#' a row.
#' @noRd
lower_containers <- function(df) {
  repeat {
    grp <- process_groups(df)
    if (!nrow(grp)) {
      break
    }
    inner <- grp$group[!grp$group %in% grp$parent]
    if (!length(inner)) {
      stop("Cyclic `parent` among groups: ",
           paste(grp$group, collapse = ", "), call. = FALSE)
    }
    df <- lower_one(df, grp[match(inner[1L], grp$group), , drop = FALSE])
  }
  df
}

#' @noRd
lower_one <- function(df, g) {
  task <- as.character(task_col(df))
  parent <- chr_col(df, "parent")
  raw <- chr_col(df, "depends_on")

  at <- match(g$group, task)
  members <- task[parent == g$group & task != g$group]

  toks <- lapply(raw, dep_tokens)

  # entry and exit of the sub-process. A group whose members all sit on one
  # rework cycle has neither, and then every member is both.
  in_group <- function(i) toks[[i]]$on[toks[[i]]$on %in% members]
  has_in <- vapply(match(members, task), function(i) length(in_group(i)) > 0, logical(1))
  consumed <- unique(unlist(lapply(match(members, task), in_group)))
  roots <- if (any(!has_in)) members[!has_in] else members
  leaves <- setdiff(members, consumed)
  if (!length(leaves)) leaves <- members

  own <- toks[[at]]
  own <- own[own$on != g$group, , drop = FALSE]

  for (i in seq_along(task)) {
    if (i == at) next
    d <- toks[[i]]
    hit <- d$on == g$group
    if (any(hit)) {
      # X waits for the sub-process: it waits for every exit of it
      grown <- do.call(rbind, c(
        list(d[!hit, , drop = FALSE]),
        lapply(which(hit), function(k) {
          data.frame(on = leaves, label = d$label[k], stringsAsFactors = FALSE)
        })
      ))
      d <- grown[grown$on != task[i], , drop = FALSE]
    }
    if (task[i] %in% roots && nrow(own)) {
      # the sub-process waits for Y: every entry of it does
      d <- rbind(d, own[own$on != task[i], , drop = FALSE])
    }
    toks[[i]] <- d[!duplicated(paste(d$on, d$label)), , drop = FALSE]
  }

  df$depends_on <- vapply(toks, dep_string, character(1))
  df$parent <- ifelse(parent == g$group, g$parent, parent)
  df[-at, , drop = FALSE]
}

#' The required count behind a quorum spec
#'
#' One grammar for the two places a process table says "how many is enough":
#' `join` on a task with several dependencies, and `complete_when` on a
#' multi-instance container. Both answer the same question against a
#' different `n` -- how many dependencies, how many elements.
#'
#' | spec | meaning |
#' |---|---|
#' | `""`, `"all"` | every one (the default) |
#' | `"any"` | the first one |
#' | `"n=3"`, `"3"` | three of them, capped at `n` |
#' | `"pct=90"`, `"90%"` | ninety percent of them, rounded up |
#'
#' In BPMN terms `all` is a parallel gateway (or a plain multi-instance
#' completion), `any` an exclusive merge, and a count or percentage a
#' complex gateway / a `completionCondition` over `numberOfCompletedInstances`.
#'
#' @param spec A quorum spec (character scalar, `NA` reads as `""`).
#' @param n How many candidates there are.
#'
#' @return An integer: how many must be met.
#'
#' @export
#' @keywords internal
process_quorum <- function(spec, n) {
  n <- as.integer(n)
  spec <- if (length(spec) != 1L || is.na(spec)) "" else trimws(as.character(spec))
  low <- tolower(spec)

  if (!nzchar(low) || low == "all") {
    return(n)
  }
  if (low == "any") {
    return(min(1L, n))
  }
  pct <- regmatches(low, regexec("^(?:pct\\s*=\\s*)?([0-9]*\\.?[0-9]+)\\s*%$", low))[[1]]
  if (!length(pct)) {
    pct <- regmatches(low, regexec("^pct\\s*=\\s*([0-9]*\\.?[0-9]+)\\s*$", low))[[1]]
  }
  if (length(pct)) {
    need <- as.integer(ceiling(as.numeric(pct[2L]) / 100 * n))
    return(max(min(need, n), min(1L, n)))
  }
  cnt <- regmatches(low, regexec("^(?:n\\s*=\\s*)?([0-9]+)$", low))[[1]]
  if (length(cnt)) {
    return(max(min(as.integer(cnt[2L]), n), min(1L, n)))
  }
  stop(
    "Unknown quorum spec: '", spec, "'. ",
    "Use all, any, n=<count> or pct=<percent>.",
    call. = FALSE
  )
}

#' Combine per-gate verdicts into a display status
#'
#' The one rule both [process_status()] and its multi-instance counterpart
#' in blockr.process apply, so that `all` and a quorum differ in a number
#' and nowhere else: reach the quorum and the task is ready; fall short of
#' it even if everything still open went your way and it can never be
#' reached, so the task is skipped; otherwise wait.
#'
#' @param met,pending How many gates are satisfied, how many may still be.
#' @param need The quorum ([process_quorum()]).
#'
#' @return `"open"`, `"blocked"` or `"skipped"`.
#'
#' @export
#' @keywords internal
process_gate_status <- function(met, pending, need) {
  if (met >= need) {
    "open"
  } else if (met + pending < need) {
    "skipped"
  } else {
    "blocked"
  }
}

#' Parse depends_on into per-task data frames of (on, label)
#'
#' Tokens naming something that is not a task of `df` are dropped rather than
#' carried: a dependency on a task since deleted has no node to draw an arrow
#' from, and every consumer downstream would have to guard against it
#' individually. Containers are not among the dropped: they are lowered onto
#' their members by [process_body()], which every caller runs first.
#' @noRd
parse_deps <- function(df) {
  raw <- chr_col(df, "depends_on")
  known <- as.character(task_col(df))
  lapply(raw, function(d) {
    t <- dep_tokens(d)
    t[t$on %in% known, , drop = FALSE]
  })
}

#' @noRd
dep_tokens <- function(d) {
  toks <- trimws(strsplit(if (is.na(d)) "" else d, ",")[[1]])
  toks <- toks[nzchar(toks)]
  data.frame(
    on = sub(":.*$", "", toks),
    label = ifelse(grepl(":", toks), sub("^[^:]*:", "", toks), NA_character_),
    stringsAsFactors = FALSE
  )
}

#' @noRd
dep_string <- function(t) {
  if (!nrow(t)) {
    return("")
  }
  paste(ifelse(is.na(t$label), t$on, paste0(t$on, ":", t$label)), collapse = ", ")
}

#' Column accessors that tolerate a partially-filled table
#' @noRd
task_col <- function(df) {
  if ("task" %in% names(df)) df$task else character(0)
}

#' @noRd
chr_col <- function(df, nm, default = "") {
  if (!nm %in% names(df)) {
    return(rep(default, nrow(df)))
  }
  x <- as.character(df[[nm]])
  ifelse(is.na(x), default, x)
}

#' @noRd
lgl_col <- function(df, nm, default = FALSE) {
  if (!nm %in% names(df)) {
    return(rep(default, nrow(df)))
  }
  x <- df[[nm]]
  if (is.character(x)) {
    x <- tolower(trimws(x)) %in% c("true", "yes", "1", "sequential")
  }
  x <- as.logical(x)
  ifelse(is.na(x), default, x)
}

#' Which of a task's dependencies close a cycle (loop-back edges)?
#'
#' An edge x -> s (s depends on x) is a loop-back iff x is reachable from s
#' AND x sits at greater-or-equal BFS depth from the process roots --
#' reachability alone cannot orient a 2-cycle (both edges of
#' qacheck <-> reconcile would qualify); depth gives the flow direction.
#' @noRd
loop_deps <- function(task, dep) {
  succ <- stats::setNames(lapply(task, function(s) character(0)), task)
  for (i in seq_along(task)) {
    for (on in dep[[i]]$on) {
      if (on %in% task) succ[[on]] <- c(succ[[on]], task[i])
    }
  }

  # shortest-path depth from the roots (tasks without dependencies)
  depth <- stats::setNames(rep(Inf, length(task)), task)
  queue <- task[vapply(dep, nrow, integer(1)) == 0]
  depth[queue] <- 0
  while (length(queue)) {
    x <- queue[1]; queue <- queue[-1]
    for (nx in succ[[x]]) {
      if (depth[[nx]] > depth[[x]] + 1) {
        depth[[nx]] <- depth[[x]] + 1
        queue <- c(queue, nx)
      }
    }
  }

  reachable <- function(from) {
    seen <- character(0); queue <- succ[[from]]
    while (length(queue)) {
      x <- queue[1]; queue <- queue[-1]
      if (x %in% seen) next
      seen <- c(seen, x); queue <- c(queue, succ[[x]])
    }
    seen
  }

  stats::setNames(lapply(task, function(s) {
    d <- dep[[match(s, task)]]$on
    down <- reachable(s)
    d[d %in% down & depth[d] >= depth[[s]]]
  }), task)
}

#' Make ids XML-NCName-safe (prefix invalid ids)
#' @noRd
ncname <- function(x) {
  ifelse(grepl("^[A-Za-z_][A-Za-z0-9_.-]*$", x), x,
         paste0("s_", gsub("[^A-Za-z0-9_.-]", "_", x)))
}

#' Example: a quarterly data collection as a wide process table
#'
#' The one-table convention mid-instance: skeleton columns (`task`, `name`,
#' `role`, `depends_on`, `script`) plus instance columns (`assignee`, `due`,
#' `status`). The QA check has failed (`status = "false"`), so the
#' reconciliation branch is active and approval waits.
#'
#' @return A data frame.
#'
#' @export
example_process <- function() {
  tibble::tibble(
    task = c("deliver", "validate", "qa_check", "reconcile", "approve",
             "forecast", "publish"),
    name = c("Upload delivery", "Validate data", "QA check",
             "Reconcile findings", "Approve publication", "Compute forecast",
             "Publish dataset"),
    role = c("analyst", "system", "system", "team", "management", "system",
             "system"),
    depends_on = c("", "deliver", "validate, reconcile", "qa_check:false",
                   "qa_check:true", "approve", "forecast"),
    script = c("", "validate.R", "qa_check.R", "", "", "forecast.R",
               "publish.R"),
    assignee = c("ana", "", "", "ben", "mira", "", ""),
    due = c("2026-07-10", "2026-07-11", "2026-07-12", "2026-07-20",
            "2026-08-20", "2026-08-25", "2026-08-28"),
    status = c("done", "done", "false", "doing", "open", "open", "open")
  )
}

#' Per-task metadata for a wide process table
#'
#' The machine-readable reading of the table that run UIs and status
#' computation share: for every task its gates (non-loop dependencies with
#' optional outcome label), loop-back dependencies, and the outcome labels
#' other tasks consume from it (non-empty marks the task as a check).
#'
#' @param df A wide process table (see [as_bpmn()] for the conventions).
#'
#' @return A list (one element per task) of lists with `task`, `name`,
#'   `role`, `script`, `per` (the collection it repeats over, `""` for
#'   single tasks), `join` (the fan-in quorum spec), `assignee`, `due`,
#'   `status`, `gates` (list of `list(on, label)`), `loops` (character),
#'   `outcomes` (character). Multi-instance group rows are containers, not
#'   tasks, and are left out.
#'
#' @export
process_tasks <- function(df) {
  per <- process_collection(df)
  df <- process_body(df)
  per <- per[!duplicated(names(per))][as.character(task_col(df))]

  task <- as.character(task_col(df))
  dep <- parse_deps(df)
  loops <- loop_deps(task, dep)

  col <- function(nm, default = "") chr_col(df, nm, default)
  role <- col("role"); script <- col("script"); name <- col("name")
  assignee <- col("assignee"); due <- col("due"); status <- col("status", "open")
  join <- col("join")
  status <- ifelse(nzchar(status), status, "open")

  outcomes <- stats::setNames(vector("list", length(task)), task)
  for (i in seq_along(task)) {
    d <- dep[[i]]
    for (j in seq_len(nrow(d))) {
      if (!is.na(d$label[j]) && d$on[j] %in% task) {
        outcomes[[d$on[j]]] <- unique(c(outcomes[[d$on[j]]], d$label[j]))
      }
    }
  }

  lapply(seq_along(task), function(i) {
    d <- dep[[i]]
    is_loop <- d$on %in% loops[[task[i]]]
    list(
      task = task[i], name = name[i], role = role[i], script = script[i],
      per = unname(per[i]), join = join[i],
      assignee = assignee[i], due = due[i], status = status[i],
      gates = lapply(which(!is_loop), function(j) {
        list(on = d$on[j],
             label = if (is.na(d$label[j])) NULL else d$label[j])
      }),
      loops = as.list(d$on[is_loop]),
      outcomes = as.list(outcomes[[task[i]]] %||na% character(0))
    )
  })
}

#' @noRd
`%||na%` <- function(x, y) if (is.null(x)) y else x

#' Computed display status for every task of a wide process table
#'
#' Stored status wins when it is anything but `open` (`doing`, `done`, or
#' an outcome label -- any non-open value means the task has life). For
#' `open` tasks the gates decide: a gate whose dependency finished with the
#' outcome it asked for is met, one that finished with another outcome
#' never will be, and an unfinished one may still go either way. How many
#' have to be met is the row's `join` quorum, `all` by default
#' ([process_quorum()]). Loop-back dependencies never block.
#'
#' @param df A wide process table.
#'
#' @return Named character vector: task -> display status.
#'
#' @export
process_status <- function(df) {
  tasks <- process_tasks(df)
  stored <- stats::setNames(
    vapply(tasks, function(s) s$status, character(1)),
    vapply(tasks, function(s) s$task, character(1))
  )
  finished <- function(s) !(s %in% c("open", "doing")) & nzchar(s)

  out <- stored
  for (s in tasks) {
    if (stored[[s$task]] != "open") next
    if (!length(s$gates)) next
    met <- 0L; pending <- 0L
    for (g in s$gates) {
      ds <- stored[[g$on]] %||na% "open"
      if (!finished(ds)) {
        pending <- pending + 1L
      } else if (is.null(g$label) || ds == g$label) {
        met <- met + 1L
      }
    }
    out[[s$task]] <- process_gate_status(
      met, pending, process_quorum(s$join, length(s$gates))
    )
  }
  out
}
