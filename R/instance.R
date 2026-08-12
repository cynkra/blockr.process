# Opening an instance: the moment the definition becomes work.
#
# An instance is self-contained: [start_instance()] stamps the definition and the
# element list into the event log under the reserved task id `@instance`, so
# [instance_table()] can rebuild the whole expanded table from the store alone.
# Editing the process afterwards changes future instances, never this
# one: the instance records which process version it was started with.
#
# `@instance` cannot collide with a real task: task ids are NCName-ish and never
# start with `@`. [apply_events()] looks rows up by task id, so the stamp
# events are invisible to every existing reader.

#' Short content hash of a process definition
#'
#' Polynomial rolling hash over the definition's cells; enough to tell two
#' versions of a process apart in an audit line, not a cryptographic
#' commitment. Deterministic across sessions.
#'
#' @param process A wide process table.
#' @return An 8-character hex string.
#' @export
process_version <- function(process) {
  stopifnot(is.data.frame(process))
  txt <- paste(
    names(process),
    paste(vapply(process, function(col) {
      paste(ifelse(is.na(col), "", as.character(col)), collapse = "\x1f")
    }, character(1)), collapse = "\x1e"),
    collapse = "\x1d"
  )
  h <- 0
  for (b in utf8ToInt(txt)) {
    h <- (h * 31 + b) %% 268435456 # 2^28: exact in doubles, fits 7 hex digits
  }
  sprintf("%08x", h)
}

#' Open an instance: stamp definition and elements into the store
#'
#' Writes the `@instance` events that make an instance self-contained: the definition
#' as opened (field `process`), the element list (field `elements`), the
#' definition's [process_version()] (field `version`) and a `created` mark.
#' Everything after this moment is ordinary events on the instance's rows.
#'
#' @param process A wide process table (the definition).
#' @param elements Character vector of element ids, or a data frame whose
#'   first column holds them plus grouping columns (e.g. `region`) carried
#'   into the instance table. An `assignee` column seeds the assignment: every
#'   human multi-instance task of that element gets a `assignee` event (actor
#'   `register`) -- the "assignment comes from the register" answer. A list
#'   without the column leaves everything in the pool.
#' @param instance Instance id (a period: "2026Q1", "2026").
#' @param store Store directory.
#' @param actor Assignee opened the instance.
#'
#' @return The instance id, invisibly.
#' @export
start_instance <- function(process, elements = character(), instance = "instance",
                       store = ".runs", actor = "board") {
  stopifnot(is.data.frame(process))
  ev <- instance_events(store, instance)
  if (any(ev$task == "@instance" & ev$field == "created")) {
    stop("instance '", instance, "' already exists in ", store, call. = FALSE)
  }
  if (!is.data.frame(elements)) {
    elements <- data.frame(
      element = as.character(elements), stringsAsFactors = FALSE
    )
  }
  assignee <- elements[["assignee"]]
  elements <- elements[names(elements) != "assignee"]

  instance_event("@instance", "process",
    as.character(jsonlite::toJSON(process, dataframe = "columns", na = "null")),
    actor, store, instance
  )
  instance_event("@instance", "elements",
    as.character(jsonlite::toJSON(elements, dataframe = "columns", na = "null")),
    actor, store, instance
  )
  instance_event("@instance", "version", process_version(process), actor, store, instance)
  instance_event("@instance", "created", format(Sys.time(), "%Y-%m-%dT%H:%M:%S"),
    actor, store, instance
  )

  # assignments from the element list (register): human multi tasks only,
  # the worker's tasks are nobody's task
  if (!is.null(assignee)) {
    per <- multi_tasks(process)
    human <- as.character(process$task[
      nzchar(per) & !is.na(process$role) & process$role != "system"
    ])
    ids <- as.character(elements[[1L]])
    for (s in human) {
      for (i in seq_along(ids)) {
        a <- assignee[i]
        if (!is.na(a) && nzchar(a)) {
          instance_event(
            s, "assignee", a, "register", store, instance,
            element = ids[i]
          )
        }
      }
    }
  }
  invisible(instance)
}

#' One stamped `@instance` field, parsed back from JSON
#' @noRd
instance_stamp_df <- function(store, instance, field) {
  st <- instance_state(store, instance)[["@instance"]]
  raw <- st[[field]]
  if (is.null(raw)) {
    return(NULL)
  }
  as.data.frame(
    lapply(jsonlite::fromJSON(raw), function(col) {
      if (is.list(col)) {
        vapply(col, function(x) {
          if (is.null(x)) NA_character_ else as.character(x)
        }, character(1))
      } else {
        col
      }
    }),
    stringsAsFactors = FALSE
  )
}

#' The newest instance in a store
#'
#' The instance id of the most recently opened instance ([start_instance()] order), or
#' `NULL` for a store without instances. The instance-reading blocks accept
#' `instance = "latest"` and resolve it through this on every poll -- so
#' opening a new instance moves the whole board to it, and the old instances stay
#' in the log, addressable by their id.
#'
#' @param store Store directory.
#' @export
instance_latest <- function(store = ".runs") {
  ev <- instance_events(store, NULL)
  hit <- ev$instance[ev$task == "@instance" & ev$field == "created"]
  if (!length(hit)) NULL else hit[[length(hit)]]
}

#' `"latest"` (or empty) -> the newest instance id; anything else passes through
#' @noRd
resolve_instance <- function(store, instance) {
  if (identical(instance, "latest") || !nzchar(instance %||% "")) {
    instance_latest(store) %||% instance
  } else {
    instance
  }
}

#' The definition an instance was opened with
#'
#' @inheritParams instance_events
#' @return The wide process table as stamped by [start_instance()], or `NULL`
#'   if the instance has not been opened.
#' @export
instance_definition <- function(store = ".runs", instance = "instance") {
  instance_stamp_df(store, instance, "process")
}

#' The element list an instance was opened with
#'
#' @inheritParams instance_events
#' @return A data frame (first column: element ids), or `NULL`.
#' @export
instance_collection <- function(store = ".runs", instance = "instance") {
  instance_stamp_df(store, instance, "elements")
}

#' An instance's expanded table, rebuilt from the store alone
#'
#' [expand_instance()] over the stamped definition and elements, with the
#' events folded on ([apply_events_instance()]). The `status` column holds the
#' STORED status; blocked/skipped are display states, see [instance_view()].
#'
#' @inheritParams instance_events
#' @param stamp Poll counter (ignored).
#'
#' @return The expanded instance table, or an empty data frame if the instance has
#'   not been opened.
#' @export
instance_table <- function(store = ".runs", instance = "instance", stamp = NULL) {
  def <- instance_definition(store, instance)
  if (is.null(def)) {
    return(data.frame())
  }
  inst <- instance_collection(store, instance)
  if (is.null(inst)) inst <- character()
  apply_events_instance(expand_instance(def, inst, instance), store, instance)
}

#' An instance as people should see it
#'
#' [instance_table()] with the display status computed per row: stored terminal
#' values stay, `open` rows resolve to `open`/`blocked`/`skipped` through
#' the dependency gates ([instance_status()]). This is what the tasks block
#' emits and what downstream tables and the BPMN overlay read.
#'
#' @inheritParams instance_table
#'
#' @return The expanded instance table with `status` as display status.
#' @export
instance_view <- function(store = ".runs", instance = "instance", stamp = NULL) {
  def <- instance_definition(store, instance)
  if (is.null(def)) {
    return(data.frame())
  }
  tab <- instance_table(store, instance)
  tab$status <- instance_status(def, tab)
  tab
}
