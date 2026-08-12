# Two read-only windows on an instance store.
#
# The board must READ the instance, never own it: the worker is a separate OS
# process, so anything a block held in its own state would be a second and
# eventually wrong copy.

#' Instance state block
#'
#' Overlays an instance store onto the incoming process definition: the instance
#' columns (`assignee`, `due`, `status`) come from the append-only log, so the
#' board shows what the worker and the people have actually done, live.
#'
#' Polling is on the log's size and mtime, so an idle board redraws nothing.
#' The poll counter rides along in the block's expression as `stamp`, which
#' is what makes the board re-evaluate when the log grows. A database-backed
#' store would push instead.
#'
#' @param store Instance store directory (see [instance_event()]).
#' @param instance Instance id, or `"latest"` to follow the newest instance in the store.
#' @param poll Poll interval in seconds.
#' @param ... Forwarded to [blockr.core::new_transform_block()].
#'
#' @export
#' @importFrom shiny invalidateLater isolate observe renderText textOutput
new_runstate_block <- function(store = ".runs", instance = "instance", poll = 2, ...) {
  new_transform_block(
    function(id, data) {
      moduleServer(id, function(input, output, session) {
        r_store <- reactiveVal(store)
        r_run <- reactiveVal(instance)
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

        output$info <- renderText({
          tick()
          paste0(
            "instance ", cur_run(), " - ",
            nrow(instance_events(r_store(), cur_run())), " events"
          )
        })

        list(
          expr = reactive(
            bbquote(
              blockr.process::apply_events(
                .(data), store = .(s), instance = .(r), stamp = .(k)
              ),
              list(s = r_store(), r = cur_run(), k = tick())
            )
          ),
          state = list(store = r_store, instance = r_run, poll = reactive(poll))
        )
      })
    },
    function(id) {
      div(
        class = "block-container",
        div(
          class = "text-body-secondary small py-1",
          textOutput(NS(id, "info"), inline = TRUE)
        )
      )
    },
    class = "instance_state_block",
    expr_type = "bquoted",
    allow_empty_state = TRUE,
    ...
  )
}

#' Instance log block
#'
#' An instance's events, newest first: the audit history. Nothing here is ever
#' updated or deleted; the instance columns upstream are a fold over exactly
#' these rows.
#'
#' @inheritParams new_runstate_block
#' @param ... Forwarded to [blockr.core::new_data_block()].
#'
#' @export
#' @importFrom blockr.core new_data_block
new_event_log_block <- function(store = ".runs", instance = "instance", poll = 2, ...) {
  new_data_block(
    function(id) {
      moduleServer(id, function(input, output, session) {
        r_store <- reactiveVal(store)
        r_run <- reactiveVal(instance)
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

        list(
          expr = reactive(
            bbquote(
              blockr.process::instance_log(store = .(s), instance = .(r), stamp = .(k)),
              list(s = r_store(), r = cur_run(), k = tick())
            )
          ),
          state = list(store = r_store, instance = r_run, poll = reactive(poll))
        )
      })
    },
    function(id) {
      div(
        class = "block-container",
        div(
          class = "text-body-secondary small py-1",
          "append-only; current state = latest event per (task, field)"
        )
      )
    },
    class = "event_log_block",
    expr_type = "bquoted",
    allow_empty_state = TRUE,
    ...
  )
}
