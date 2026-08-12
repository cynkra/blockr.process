# The tasks block: the instance's task list, wired to the STORE.
#
# The instance block edits block state; this block edits the instance. Every chip
# click, assignment and rework is one event appended to the instance
# store -- the same channel the worker and the upload platform write to --
# so two people watching the board see each other's clicks, and closing
# the browser loses nothing.
#
# The block is a reader with a pen, never an owner: its state is just the
# address of the instance (`store`, `instance`, `poll`), and its output is
# [instance_view()], the expanded instance table with display statuses.

#' Tasks block
#'
#' An instance's task list: one section per task, one row per element for the
#' "per-element" tasks, with per-row assignment and a status chip that
#' writes [instance_event()]s. The toolbar filters (status, person, any grouping
#' column the element list carried, e.g. `region`) and acts on the
#' selection: bulk-assign, and "send back" -- the rework, which reopens
#' exactly the checked rows and re-closes the gate downstream.
#'
#' The block emits [instance_view()], so downstream tables and the BPMN diagram
#' redraw on every event. Polling is on the log's size and mtime; an idle
#' board redraws nothing.
#'
#' @param store Instance store directory (see [instance_event()]).
#' @param instance Instance id, or `"latest"` to follow the newest instance in the
#'   store ([instance_latest()]): opening a new instance moves the list to it.
#' @param poll Poll interval in seconds.
#' @param roster Characters: the people assignments can pick from (the
#'   deployment's register). The definition's roles are NOT offered --
#'   roles are lanes, not persons; without a roster the block falls back
#'   to them so a bare demo stays usable.
#' @param ... Forwarded to [blockr.core::new_data_block()].
#'
#' @export
new_tasks_block <- function(store = ".runs", instance = "instance", poll = 2,
                            roster = character(), ...) {
  blockr.core::new_data_block(
    function(id) {
      moduleServer(id, function(input, output, session) {
        ns <- session$ns
        r_store <- reactiveVal(store)
        r_run <- reactiveVal(instance)
        r_roster <- reactiveVal(roster)
        cur_run <- function() resolve_instance(r_store(), r_run())
        tick <- reactiveVal(0L)
        seen <- store_fingerprint(store)

        observe({
          invalidateLater(poll * 1000, session)
          now <- store_fingerprint(r_store())
          if (!identical(now, seen)) {
            seen <<- now
            tick(isolate(tick()) + 1L)
          }
        })

        # rows to JS on every store change (and once at startup: the
        # custom-message queue in blockr-core.js replays until the element
        # binds)
        observeEvent(tick(), {
          session$sendCustomMessage(
            "tasks-rows",
            list(
              id = ns("tasks_input"),
              payload = tasks_payload(r_store(), cur_run(), r_roster())
            )
          )
        })

        # late-mount handshake: a dock view builds the element after the
        # startup push; the JS constructor announces and gets the payload
        observeEvent(input$tasks_input_ready, {
          session$sendCustomMessage(
            "tasks-rows",
            list(
              id = ns("tasks_input"),
              payload = tasks_payload(r_store(), cur_run(), r_roster())
            )
          )
        })

        # JS -> store: one action = one or more events. `rows` is a list of
        # {task, element}; a Shiny custom input delivers it as nested lists.
        observeEvent(input$tasks_input_act, {
          act <- input$tasks_input_act
          run_id <- cur_run()
          def <- instance_definition(r_store(), run_id)
          for (row in act$rows) {
            inst <- row$element
            if (is.null(inst) || !nzchar(inst %||% "")) inst <- NULL
            if (identical(act$field, "status")) {
              process_act(
                row$task, status = act$value,
                actor = act$actor %||% "board",
                store = r_store(), instance = run_id,
                process = def, element = inst
              )
            } else {
              instance_event(
                row$task, act$field, act$value,
                actor = act$actor %||% "board",
                store = r_store(), instance = run_id, element = inst
              )
            }
          }
          # reflect the write immediately instead of waiting out the poll
          seen <<- store_fingerprint(r_store())
          tick(isolate(tick()) + 1L)
        })

        list(
          expr = reactive(
            bbquote(
              blockr.process::instance_view(store = .(s), instance = .(r), stamp = .(k)),
              # tick() rides along, so "latest" re-resolves on every event
              list(s = r_store(), r = cur_run(), k = tick())
            )
          ),
          state = list(
            store = r_store, instance = r_run, poll = reactive(poll),
            roster = r_roster
          )
        )
      })
    },
    js_block_ui("tasks", shared_deps = "select"),
    class = "tasks_block",
    expr_type = "bquoted",
    allow_empty_state = TRUE,
    ...
  )
}

#' Everything the task list needs to draw, from the store
#'
#' @return A list: `instance`, `version`, `tasks` (id, name, role, per, outcomes,
#'   single-row assignee/due/status), `rows` (one per expanded instance row), `counts`
#'   (per multi task), `roster`, `facets` (grouping columns and their
#'   values). `NULL` fields are dropped by the JSON encoder.
#' @noRd
tasks_payload <- function(store, instance, roster = character()) {
  def <- instance_definition(store, instance)
  if (is.null(def)) {
    return(list(instance = instance, rows = list(), tasks = list(), counts = list()))
  }

  tab <- instance_table(store, instance)
  disp <- instance_status(def, tab)
  waiting <- instance_waiting(def, tab)
  counts <- instance_counts(def, tab)

  name_of <- stats::setNames(as.character(def$name), as.character(def$task))
  per <- multi_tasks(def)

  meta <- process_tasks(def)
  tasks <- lapply(meta, function(s) {
    list(
      task = s$task,
      name = s$name,
      role = s$role,
      per = nzchar(per[[s$task]] %||% ""),
      outcomes = I(as.list(s$outcomes %||% character()))
    )
  })

  known <- c(
    names(def), "instance", "element", "assignee", "due", "status", "kind",
    # written onto the expanded table by expand_instance(), not facets
    "params", "per", "parent", "collection"
  )
  facet_cols <- setdiff(names(tab), known)

  rows <- lapply(seq_len(nrow(tab)), function(i) {
    row <- list(
      task = tab$task[i],
      element = if (is.na(tab$element[i])) NULL else tab$element[i],
      assignee = tab$assignee[i] %||% "",
      due = tab$due[i] %||% "",
      status = tab$status[i],
      disp = disp[i],
      waits = if (is.na(waiting[i])) NULL else
        (name_of[[waiting[i]]] %||% waiting[i])
    )
    for (col in facet_cols) {
      if (!is.na(tab[[col]][i])) row[[col]] <- as.character(tab[[col]][i])
    }
    row
  })

  facets <- lapply(facet_cols, function(col) {
    vals <- unique(as.character(tab[[col]]))
    I(as.list(sort(vals[!is.na(vals)])))
  })
  names(facets) <- facet_cols

  # persons, not lanes: the deployment's roster plus anyone already
  # assigned; only a roster-less block falls back to the role names
  people <- if (length(roster)) as.character(roster) else
    setdiff(as.character(def$role), c("system", "", NA))
  roster <- sort(unique(c(people, tab$assignee[nzchar(tab$assignee %||% "")])))

  cnt <- lapply(seq_len(nrow(counts)), function(i) {
    list(
      total = counts$total[i], done = counts$done[i],
      doing = counts$doing[i], blocked = counts$blocked[i],
      open = counts$open[i], pct = counts$pct[i],
      pct_doing = counts$pct_doing[i], pct_blocked = counts$pct_blocked[i]
    )
  })
  names(cnt) <- counts$task

  list(
    instance = instance,
    version = instance_state(store, instance)[["@instance"]]$version %||% "",
    tasks = tasks,
    rows = rows,
    counts = cnt,
    roster = I(as.list(roster)),
    facets = facets
  )
}
