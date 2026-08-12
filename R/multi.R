# Multi-instance tasks: the "per-element" part of a process.
#
# Decision of 2026-08-10 (mockups/many-items.html, variant D): the definition
# stays small and the RUN carries one row per (element, task). A new unit
# is data, never a process change.
#
# Decision of 2026-08-11 (mockups/multi-instance.html, variant C): the part
# that repeats is a BPMN MULTI-INSTANCE SUB-PROCESS, and in the one-table
# convention that sub-process is a row like any other -- a `collection` names
# what it repeats over, and the rows whose `parent` names it are its members.
# The old form marked every repeated task with `per = "unit"`, which left
# the dimension to whichever row was ticked first; a group has ONE place for
# it. `process_collection()` reads both, so instances started under
# the old form keep folding.
#
# Three dependency cases follow, and they are the whole semantics:
#
#   multi  -> multi   per element   (review@northside waits for
#                                     delivery@northside, not for all)
#   single -> multi   fan-out        (every element waits for the one task)
#   multi  -> single  the GATE       (the single task waits for the elements;
#                                     BPMN calls this a parallel join, and it
#                                     is why "alle bearbeitet" needs no new
#                                     concept -- it is a count)
#
# The gate is a count, so it takes a threshold: `complete_when` on the group
# says how many elements are enough ("all" by default, or a quorum like
# pct=90 -- BPMN's completionCondition). `join` on the waiting row says the
# same thing one level up, across several dependencies. Both go through
# `process_quorum()`, so they differ in a number and nowhere else.

#' Which tasks of a definition are multi-instance?
#'
#' The dimension every task repeats over, resolved through the group it sits
#' in (see [process_groups()]). Group rows are containers and
#' answer `""`, same as a single task.
#'
#' @param process A wide process table.
#' @return Named character vector: task id -> dimension (`""` for single).
#' @export
#' @keywords internal
multi_tasks <- function(process) {
  process_collection(process)
}

#' Expand a definition into the instance-shaped table
#'
#' One row per (element, task) for multi-instance tasks, one row per task
#' with `element = NA` for the rest. This is what the instance store's events are
#' folded onto and what the task lists show; the definition itself never grows.
#'
#' @param process A wide process table (the definition).
#' @param elements Character vector of element ids (e.g. units), or a
#'   data frame whose first column holds them plus any grouping columns
#'   (e.g. `region`) to carry along.
#' @param instance Instance id.
#'
#' @return A data frame with the definition columns plus `instance`, `element` and
#'   the instance columns `assignee`, `due`, `status`. The sub-process
#'   containers are gone -- they are structure, not work -- and each row
#'   carries its resolved dimension in `per`, so the expanded table answers
#'   "what does this repeat over" without the definition beside it.
#' @export
expand_instance <- function(process, elements = character(), instance = "instance") {
  stopifnot(is.data.frame(process))

  extra <- NULL
  if (is.data.frame(elements)) {
    extra <- elements[, -1, drop = FALSE]
    elements <- as.character(elements[[1]])
  }
  elements <- as.character(elements)

  # One instance stamps ONE element list, so one row per (element, task) can
  # only answer a single collection. Nested groups are representable (and the
  # diagram draws them) but there is no second list to expand against, so say
  # so rather than silently expanding the innermost and losing the outer.
  depth <- lengths(process_scopes(process))
  if (any(depth > 1L)) {
    stop(
      "Nested multi-instance groups cannot be expanded: an instance carries ",
      "one element list. Nested here: ",
      paste(names(depth)[depth > 1L], collapse = ", "),
      call. = FALSE
    )
  }

  # Resolved off the containers BEFORE they are dropped, and written back per
  # row: the expanded table has to answer "what does this repeat over" and
  # "how many of them are enough" on its own, because the live diagram and
  # the tasks block rebuild a definition from it with no groups in sight.
  per <- multi_tasks(process)
  done_when <- process_complete_when(process)
  process <- process_body(process)
  keep <- function(x) unname(x[!duplicated(names(x))][as.character(process$task)])
  per <- per[!duplicated(names(per))][as.character(process$task)]
  process$per <- unname(per)
  if (any(nzchar(done_when))) process$complete_when <- keep(done_when)
  out <- list()

  for (i in seq_len(nrow(process))) {
    row <- process[i, , drop = FALSE]
    if (nzchar(per[[i]]) && length(elements)) {
      rep_row <- row[rep(1L, length(elements)), , drop = FALSE]
      rep_row$element <- elements
      if (!is.null(extra) && ncol(extra)) {
        rep_row <- cbind(rep_row, extra, row.names = NULL)
      }
      out[[length(out) + 1L]] <- rep_row
    } else {
      row$element <- NA_character_
      if (!is.null(extra) && ncol(extra)) {
        row[names(extra)] <- NA
      }
      out[[length(out) + 1L]] <- row
    }
  }

  df <- do.call(rbind, c(out, list(make.row.names = FALSE)))
  df$instance <- instance
  for (col in c("assignee", "due", "status")) {
    if (!col %in% names(df)) df[[col]] <- ""
  }
  df$status[!nzchar(df$status) | is.na(df$status)] <- "open"
  df
}

#' Where every gate of an expanded instance stands
#'
#' The shared reading of the three dependency cases: for every row of the
#' instance table and every non-loop dependency of its task, one of `met`
#' (the dependency finished with the outcome this task asked for), `mismatch`
#' (it finished with another one, so this gate never opens) or `waiting`.
#'
#' The multi -> single case is the interesting one: the dependency has one
#' row per element, and how many of them have to be met is the group's
#' `complete_when` quorum, `all` by default.
#'
#' @inheritParams instance_status
#'
#' @return A list, one element per row of `instance_table`, of
#'   `list(on, state)`.
#' @noRd
instance_gates <- function(process, instance_table) {
  tasks <- process_tasks(process)
  names(tasks) <- vapply(tasks, function(s) s$task, character(1))
  per <- multi_tasks(process)
  done_when <- process_complete_when(process)

  task <- as.character(instance_table$task)
  inst <- if ("element" %in% names(instance_table)) {
    as.character(instance_table$element)
  } else {
    rep(NA_character_, nrow(instance_table))
  }
  stored <- as.character(instance_table$status)
  stored[is.na(stored) | !nzchar(stored)] <- "open"

  finished <- function(x) nzchar(x) & !(x %in% c("open", "doing"))
  matches <- function(x, label) {
    if (is.null(label)) rep(TRUE, length(x)) else x == label
  }

  # stored status of one (task, element); for a multi task read from the same
  # element, for a single task from the row without an element
  at <- function(s, i) {
    hit <- if (nzchar(per[[s]] %||% "")) {
      which(task == s & !is.na(inst) & inst == i)
    } else {
      which(task == s & is.na(inst))
    }
    if (!length(hit)) "open" else stored[hit[1L]]
  }

  lapply(seq_along(task), function(k) {
    s <- tasks[[task[k]]]
    if (is.null(s) || !length(s$gates)) {
      return(list())
    }
    me_multi <- nzchar(per[[task[k]]] %||% "")

    lapply(s$gates, function(g) {
      dep_multi <- nzchar(per[[g$on]] %||% "")

      state <- if (dep_multi && !me_multi) {
        # the gate: the elements of the dependency, counted against the
        # group's completion quorum
        vals <- stored[task == g$on]
        ok <- sum(finished(vals) & matches(vals, g$label))
        pending <- sum(!finished(vals))
        need <- process_quorum(done_when[[g$on]] %||% "", length(vals))
        if (!length(vals)) {
          "waiting"
        } else if (ok >= need) {
          "met"
        } else if (ok + pending < need) {
          "mismatch"
        } else {
          "waiting"
        }
      } else {
        ds <- at(g$on, inst[k])
        if (!finished(ds)) {
          "waiting"
        } else if (matches(ds, g$label)) {
          "met"
        } else {
          "mismatch"
        }
      }
      list(on = g$on, state = state)
    })
  })
}

#' Status of every row of an expanded instance
#'
#' The multi-instance counterpart of [process_status()]. Stored
#' status wins when it is anything but `open`; for `open` rows the gates
#' decide, resolved per the three cases above. How many gates have to be met
#' is the row's `join` quorum, `all` by default. Loop-back dependencies never
#' block, same rule as the single-element case.
#'
#' @param process The definition (for gates, loops, `join`, `complete_when`
#'   and the collection every task repeats over).
#' @param instance_table An expanded instance table (see [expand_instance()]), carrying the
#'   current `status` per row.
#'
#' @return Character vector, one entry per row of `instance_table`: `open`
#'   (= ready), `doing`, `blocked`, `skipped`, or a terminal value.
#' @export
instance_status <- function(process, instance_table) {
  stopifnot(is.data.frame(process), is.data.frame(instance_table))
  if (!nrow(instance_table)) {
    return(character())
  }

  joins <- task_joins(process)
  gates <- instance_gates(process, instance_table)

  task <- as.character(instance_table$task)
  stored <- as.character(instance_table$status)
  stored[is.na(stored) | !nzchar(stored)] <- "open"

  vapply(seq_along(task), function(k) {
    if (stored[k] != "open") {
      return(stored[k])
    }
    g <- gates[[k]]
    if (!length(g)) {
      return("open")
    }
    state <- vapply(g, `[[`, character(1), "state")
    process_gate_status(
      sum(state == "met"), sum(state == "waiting"),
      process_quorum(joins[[task[k]]] %||% "", length(state))
    )
  }, character(1))
}

#' What is each blocked row waiting on?
#'
#' For every row of an expanded instance whose display status is `blocked`, the
#' task id of the first unmet dependency -- which is how the task list can
#' say "waiting for delivery" instead of a bare "blocked". `NA` for rows
#' that are not blocked.
#'
#' @inheritParams instance_status
#'
#' @return Character vector, one entry per row of `instance_table`.
#' @export
#' @keywords internal
instance_waiting <- function(process, instance_table) {
  stopifnot(is.data.frame(process), is.data.frame(instance_table))
  if (!nrow(instance_table)) {
    return(character())
  }

  status <- instance_status(process, instance_table)
  gates <- instance_gates(process, instance_table)

  vapply(seq_along(status), function(k) {
    if (status[k] != "blocked") {
      return(NA_character_)
    }
    for (g in gates[[k]]) {
      if (g$state == "waiting") {
        return(g$on)
      }
    }
    NA_character_
  }, character(1))
}

#' The fan-in quorum of every task of a definition
#' @noRd
task_joins <- function(process) {
  tasks <- process_tasks(process)
  stats::setNames(
    vapply(tasks, function(s) s$join %||% "", character(1)),
    vapply(tasks, function(s) s$task, character(1))
  )
}

#' Progress of the multi-instance tasks
#'
#' What the diagram shows as an overlay and the board as a bar: how many
#' elements of each repeated task are finished. The gate reads off this, so
#' "alle bearbeitet" is a count and not a special state.
#'
#' `doing` counts the elements someone has picked up and `blocked` the ones
#' still waiting on a gate, so the bar can draw four states -- not started,
#' waiting, in progress, done. `open` stays "everything not finished" (it
#' includes both), which is what the gate asks for.
#'
#' `required` is how many elements the gate downstream actually waits for --
#' `total` unless the group carries a `complete_when` quorum. A counter that
#' says "9 / 12" while the gate opens at 11 would be lying by omission.
#'
#' @inheritParams instance_status
#'
#' @return A data frame with `task`, `total`, `required`, `done`, `doing`,
#'   `blocked`, `open`, `pct`, `pct_doing` and `pct_blocked`.
#' @export
#' @keywords internal
instance_counts <- function(process, instance_table) {
  per <- multi_tasks(process)
  multi <- names(per)[nzchar(per)]
  status <- instance_status(process, instance_table)
  done_when <- process_complete_when(process)

  rows <- lapply(multi, function(s) {
    hit <- which(as.character(instance_table$task) == s)
    st <- status[hit]
    done <- sum(nzchar(st) & !(st %in% c("open", "doing", "blocked", "skipped")))
    doing <- sum(st == "doing")
    blocked <- sum(st == "blocked")
    share <- function(n) if (length(hit)) round(100 * n / length(hit)) else 0L
    data.frame(
      task = s,
      total = length(hit),
      required = process_quorum(done_when[[s]] %||% "", length(hit)),
      done = done,
      doing = doing,
      blocked = blocked,
      open = length(hit) - done,
      pct = share(done),
      pct_doing = share(doing),
      pct_blocked = share(blocked),
      stringsAsFactors = FALSE
    )
  })

  if (!length(rows)) {
    return(data.frame(
      task = character(), total = integer(), required = integer(),
      done = integer(),
      doing = integer(), blocked = integer(), open = integer(),
      pct = numeric(), pct_doing = numeric(), pct_blocked = numeric(),
      stringsAsFactors = FALSE
    ))
  }
  do.call(rbind, rows)
}
