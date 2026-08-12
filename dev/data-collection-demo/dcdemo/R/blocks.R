`%||%` <- function(x, y) if (is.null(x)) y else x

# The demo deployment: one process, the lists it is started from, and the
# delivery platform as a button. Everything here is the kind of code an
# installation writes for itself -- the package under test is
# blockr.process.

#' The quarterly data collection, as the process editor would emit it
#'
#' Eight reporting units send in a file; each file is validated by a script
#' and reviewed by a person; when they are all through, the data is
#' approved, consolidated, QA-checked, and published as a forecast.
#'
#' The part that repeats sits inside a multi-instance sub-process,
#' `each_unit`, which is the one place the collection is named. Everything
#' after it runs once, and the first of those -- Approve data -- waits for
#' `each_unit` itself, not for one of its rows: that is the parallel join
#' where the sub-process closes, and naming the container is what BPMN means
#' by a sequence flow that does not cross the boundary.
#'
#' Three kinds of row, and the demo turns on the difference:
#'
#' - **`delivery`** is `system` with NO script. Nobody can tick it and the
#'   worker cannot run it: it is done when the outside world says so, which
#'   is an inbox message (see `blockr.process::ingest_inbox()`).
#' - **`validate`, `consolidate`, `qa_check`, `forecast`** are `system` WITH
#'   a script. The worker runs them; `validate` sits inside the group, so it
#'   runs once per unit.
#' - everything else has a role, and roles are roles: a person picks the
#'   task up in the task list. Who that person is, is instance data.
#'
#' `qa_check` answers `true` or `false` on stdout, so the branch is in the
#' table rather than in an if-statement, and `reconcile` loops back into it:
#' the rework a DAG cannot express.
#'
#' @export
collection_process <- function() {
  data.frame(
    task = c(
      "each_unit",
      "delivery", "validate", "review",
      "approve_data", "consolidate", "qa_check", "reconcile",
      "approve_publication", "forecast"
    ),
    name = c(
      "for each unit",
      "Data delivery", "Validate delivery", "Review data",
      "Approve data", "Consolidate", "QA check", "Reconcile findings",
      "Approve publication", "Compute forecast"
    ),
    # ROLES, never persons: the definition is the durable document (and the
    # BPMN lane). ana and ben enter at instance time, as assignee events.
    role = c(
      "",
      "system", "system", "analyst",
      "steward", "system", "system", "analyst",
      "management", "system"
    ),
    # approve_data waits for the CONTAINER: the sub-process closing, not one
    # of the rows inside it. Naming a member would work (it lowers to the
    # same edge) but says "wait for Review" where the truth is "wait for all
    # of them", and with a second group it would say nothing at all.
    depends_on = c(
      "",
      "", "delivery", "validate",
      "each_unit", "approve_data", "consolidate, reconcile", "qa_check:false",
      "qa_check:true", "approve_publication"
    ),
    script = c(
      "",
      "", "validate.R", "",
      "", "consolidate.R", "qa_check.R", "",
      "", "forecast.R"
    ),
    # the group container, then who is inside it
    collection = c("unit", rep("", 9)),
    parent = c(
      "",
      "each_unit", "each_unit", "each_unit",
      "", "", "", "",
      "", ""
    ),
    stringsAsFactors = FALSE
  )
}

#' The reporting units an instance is started from
#'
#' Stands in for a SELECT on the register. Eight units so the screen stays
#' readable; `region` rides along and becomes the task list's filter,
#' `assignee` seeds who works on what -- three stay in the pool for the
#' bulk-assign moment.
#'
#' @export
reporting_units <- function() {
  data.frame(
    unit = c(
      "Northgate", "Riverside", "Lakeview", "Hillcrest",
      "Eastport", "Fairview", "Greenwood", "Westbrook"
    ),
    region = c(rep("North", 4), rep("South", 4)),
    assignee = c("ana", "ana", "ana", "ben", "ben", "", "", ""),
    stringsAsFactors = FALSE
  )
}

#' The people assignments can pick from
#'
#' A vocabulary of its own, separate from the definition's roles: roles are
#' durable, people change.
#'
#' @export
people <- function() {
  c("ana", "ben", "mira", "theo")
}

#' The element lists "on the database"
#'
#' What the start card offers as a source. A named list, each entry a data
#' frame (in production: a function running a SELECT). The second list has
#' no `assignee` column -- starting from it leaves everything in the pool;
#' the third repeats over a different dimension entirely, which is all it
#' takes to run the same process per region instead of per unit.
#'
#' @export
collections <- function() {
  pool <- reporting_units()
  pool$assignee <- NULL
  list(
    "units (register)" = reporting_units(),
    "units (unassigned)" = pool,
    "regions" = data.frame(
      region = c("North", "South", "East", "West"),
      stringsAsFactors = FALSE
    )
  )
}

#' The start-instance block with the demo's lists baked in
#'
#' The generic block takes `sources`; functions do not serialize, so the
#' deployment registers this wrapper and board restore goes through it.
#'
#' @export
new_start_block <- function(store = ".runs", instance = "2026Q1", source = "",
                            poll = 2, ...) {
  blockr.process::new_start_instance_block(
    store = store, instance = instance, source = source,
    sources = collections(), poll = poll,
    class = c("start_block", "start_instance_block"), ...
  )
}

#' The deliveries table, as the board shows it
#'
#' What the platform's own table would answer: one row per unit, delivered
#' or not, with the timestamp from the event log. `stamp` only makes the
#' calling expression change on every poll.
#'
#' @export
deliveries <- function(store, instance, stamp = NULL) {
  tab <- blockr.process::instance_table(store, instance)
  if (!nrow(tab)) {
    return(data.frame(
      unit = character(), region = character(),
      delivered = logical(), at = character(),
      stringsAsFactors = FALSE
    ))
  }
  del <- tab[tab$task == "delivery" & !is.na(tab$element), , drop = FALSE]

  ev <- blockr.process::instance_events(store, instance)
  ev <- ev[
    ev$task == "delivery" & ev$field == "status" & !is.na(ev$element),
    , drop = FALSE
  ]
  at <- stats::setNames(ev$ts, ev$element)

  data.frame(
    unit = del$element,
    region = if ("region" %in% names(del)) del$region else "",
    delivered = del$status != "open",
    at = ifelse(del$status != "open", at[del$element], ""),
    stringsAsFactors = FALSE
  )
}

#' Delivery platform block
#'
#' The outside world, as a button. In production the platform writes a file
#' into the store's inbox when a unit uploads (or a database trigger does,
#' or a curl in a CI job); here a click writes exactly that file --
#' `blockr.process::write_inbox_message()`, one message, named after the
#' unit so a resend costs nothing.
#'
#' Nothing here writes an event. The worker ingests the inbox on its next
#' tick and appends it, and within a poll the unit's Review flips from
#' "waiting for Data delivery" to open. When no worker is running the block
#' ingests the message itself and says so, because a demo that silently does
#' nothing teaches the wrong lesson.
#'
#' Emits the deliveries table, so a table view downstream shows the
#' platform's side of the story.
#'
#' @export
new_delivery_block <- function(store = ".runs", instance = "instance",
                               poll = 2, ...) {
  new_data_block(
    function(id) {
      moduleServer(id, function(input, output, session) {
        r_store <- reactiveVal(store)
        r_run <- reactiveVal(instance)
        cur_run <- function() {
          blockr.process::instance_latest(r_store()) %||% r_run()
        }
        tick <- reactiveVal(0L)
        note <- reactiveVal("")

        undelivered <- function() {
          tab <- blockr.process::instance_table(r_store(), cur_run())
          if (!nrow(tab)) {
            return(character())
          }
          del <- tab[tab$task == "delivery" & !is.na(tab$element), ]
          del$element[del$status == "open"]
        }

        observe({
          invalidateLater(poll * 1000, session)
          tick(isolate(tick()) + 1L)
        })

        output$next_up <- renderText({
          tick()
          if (is.null(blockr.process::instance_definition(r_store(), cur_run()))) {
            return("no instance started")
          }
          rest <- undelivered()
          paste(c(
            if (!length(rest)) "all units delivered" else {
              paste0("next: ", rest[1L], " (", length(rest), " still open)")
            },
            note()
          ), collapse = " · ")
        })

        observeEvent(input$go, {
          rest <- undelivered()
          if (!length(rest)) {
            return()
          }
          unit <- rest[1L]
          run <- cur_run()
          blockr.process::write_inbox_message(
            store = r_store(), task = "delivery", element = unit,
            instance = run, actor = "delivery-platform",
            id = paste0("delivery-", run, "-", unit)
          )
          # A worker would pick this up within a tick. Without one, the
          # board is as entitled to ingest as anyone else -- it is a
          # function, not a privilege.
          if (blockr.process::worker_alive(r_store())) {
            note("message written, waiting for the worker")
          } else {
            n <- blockr.process::ingest_inbox(r_store(), quiet = TRUE)
            note(paste0("no worker running: ", n, " message(s) ingested here"))
          }
          tick(isolate(tick()) + 1L)
        })

        # Demo only: archive the log (append-only, so never delete -- the
        # old instances move aside, timestamped) and the board falls back to
        # the "no instance" card everywhere.
        observeEvent(input$reset, {
          f <- file.path(r_store(), "events.jsonl")
          if (file.exists(f)) {
            file.rename(f, file.path(
              r_store(),
              paste0(
                "events-", format(Sys.time(), "%Y%m%dT%H%M%S"), ".jsonl"
              )
            ))
          }
          unlink(blockr.process::inbox_dir(r_store()), recursive = TRUE)
          note("")
          tick(isolate(tick()) + 1L)
        })

        list(
          expr = reactive(
            bbquote(
              dcdemo::deliveries(store = .(s), instance = .(r), stamp = .(k)),
              list(s = r_store(), r = cur_run(), k = tick())
            )
          ),
          state = list(store = r_store, instance = r_run, poll = reactive(poll))
        )
      })
    },
    # A strip, not a form: the 30px tier (blockr.docs/design-system), tokens
    # with literal fallbacks. Styled inline because dcdemo is a dev-only
    # package with no asset pipeline of its own -- a real block ships a
    # sheet under inst/css.
    function(id) {
      div(
        class = "block-container",
        tags$style(HTML("
          .dlb-strip { display: flex; align-items: center; gap: 10px;
            padding: 2px 0 4px; }
          .dlb-go { height: 30px; padding: 0 12px; border-radius: 8px;
            border: 1px solid var(--blockr-color-primary, #2563eb);
            background: var(--blockr-color-primary, #2563eb); color: #fff;
            font: inherit; font-size: 0.8125rem; font-weight: 500;
            white-space: nowrap; cursor: pointer;
            transition: background-color .15s ease, border-color .15s ease; }
          .dlb-go:hover { background: var(--blockr-color-primary-hover, #1d4ed8);
            border-color: var(--blockr-color-primary-hover, #1d4ed8); }
          .dlb-go:focus-visible { outline: none;
            box-shadow: var(--blockr-focus-ring, 0 0 0 3px rgba(37,99,235,.12)); }
          .dlb-next { font-size: 0.8125rem;
            color: var(--blockr-color-text-meta, #6b7280);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .dlb-reset { margin-left: auto; background: none; border: none;
            padding: 0; font: inherit; font-size: 0.8125rem;
            color: var(--blockr-color-text-subtle, #9ca3af); cursor: pointer;
            transition: color .15s ease; }
          .dlb-reset:hover { color: var(--blockr-color-danger, #dc2626); }
        ")),
        div(
          class = "dlb-strip",
          tags$button(
            id = NS(id, "go"), type = "button",
            class = "dlb-go action-button", "Simulate delivery"
          ),
          div(
            class = "dlb-next",
            textOutput(NS(id, "next_up"), inline = TRUE)
          ),
          tags$button(
            id = NS(id, "reset"), type = "button",
            class = "dlb-reset action-button", "Reset demo",
            title = paste(
              "Archives the event log (nothing is deleted); the board",
              "falls back to the start-instance card."
            )
          )
        )
      )
    },
    class = "delivery_block",
    expr_type = "bquoted",
    allow_empty_state = TRUE,
    ...
  )
}
