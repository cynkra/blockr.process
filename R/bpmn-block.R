#' BPMN block
#'
#' Renders the incoming wide process table as a BPMN diagram (via the BPMN half:
#' auto-layout + bpmn-visualization, no watermark) with the instance painted on:
#' finished tasks green, `doing` blue, computed `blocked` amber and
#' `skipped` gray, and a `assignee - due` overlay under assigned tasks. The data
#' passes through unchanged, so downstream blocks (tables, dplyr views)
#' keep working on the same table.
#'
#' @param title Process name shown in the exported BPMN.
#' @param ... Forwarded to [blockr.core::new_transform_block()].
#'
#' @export
new_bpmn_block <- function(title = "Process", ...) {
  new_transform_block(
    function(id, data) {
      moduleServer(id, function(input, output, session) {
        r_title <- reactiveVal(title)

        output$diagram <- renderBpmnWidget({
          df <- data()
          shiny::validate(shiny::need(
            is.data.frame(df) && all(c("task", "name") %in% names(df)) &&
              nrow(df) > 0,
            "The BPMN block expects a process table with 'task' and 'name' columns."
          ))

          # An EXPANDED instance table (one row per element, see expand_instance())
          # collapses back to the definition for drawing; the multi tasks
          # get their element count painted on instead of assignee/due.
          if ("element" %in% names(df) && any(!is.na(df$element))) {
            view <- bpmn_collapse_run(df)
            df <- view$def
            status <- view$status
            overlays <- view$overlays
          } else {
            status <- process_status(df)
            assignee <- if ("assignee" %in% names(df)) as.character(df$assignee) else rep("", nrow(df))
            due <- if ("due" %in% names(df)) as.character(df$due) else rep("", nrow(df))
            lab <- trimws(paste(
              ifelse(is.na(assignee) | !nzchar(assignee), "", assignee),
              ifelse(is.na(due) | !nzchar(due), "",
                     paste0("\u00b7 ", substr(due, 6, 10))
              )
            ))
            overlays <- stats::setNames(as.list(lab), as.character(df$task))
            overlays <- overlays[nzchar(unlist(overlays))]
          }

          bpmn_widget(
            as_bpmn(df, name = r_title()),
            status = status,
            overlays = overlays
          )
        })

        list(
          expr = reactive(quote(.(data))),
          state = list(title = r_title)
        )
      })
    },
    function(id) {
      tagList(
        div(
          class = "block-container",
          bpmnWidgetOutput(NS(id, "diagram"), height = "380px")
        )
      )
    },
    class = "bpmn_block",
    expr_type = "bquoted",
    allow_empty_state = TRUE,
    ...
  )
}

#' Collapse an expanded instance table for the diagram
#'
#' One box per task again: single tasks keep their status and assignee/due
#' overlay, multi-instance tasks aggregate -- all elements finished paints
#' the box done, any progress paints it doing, and the overlay is the count
#' ("1800 / 2131"). The gate reads off the same count, so the diagram and
#' the task list can never disagree.
#'
#' @param df An expanded instance table (see [expand_instance()]).
#' @return A list: `def` (the definition rows), `status` (named per task),
#'   `overlays` (named list of labels).
#' @noRd
bpmn_collapse_run <- function(df) {
  def <- df[!duplicated(df$task), , drop = FALSE]
  disp <- instance_status(def, df)
  counts <- instance_counts(def, df)

  task <- as.character(df$task)
  status <- character(nrow(def))
  overlays <- list()

  for (i in seq_len(nrow(def))) {
    s <- as.character(def$task[i])
    rows <- which(task == s)

    if (s %in% counts$task) {
      cnt <- counts[counts$task == s, ]
      st <- disp[rows]
      # `required`, not `total`: with a completion quorum the box is done
      # when the gate downstream opens, which is what the counter says
      status[i] <- if (cnt$done >= cnt$required && cnt$total > 0) {
        "done"
      } else if (cnt$done > 0 || any(st == "doing")) {
        "doing"
      } else if (all(st == "skipped")) {
        "skipped"
      } else if (all(st == "blocked")) {
        "blocked"
      } else {
        "open"
      }
      overlays[[s]] <- paste0(cnt$done, " / ", cnt$total)
    } else {
      status[i] <- disp[rows[1L]]
      assignee <- as.character(df$assignee[rows[1L]] %||% "")
      due <- as.character(df$due[rows[1L]] %||% "")
      lab <- trimws(paste(
        if (is.na(assignee) || !nzchar(assignee)) "" else assignee,
        if (is.na(due) || !nzchar(due)) "" else paste0("\u00b7 ", substr(due, 6, 10))
      ))
      if (nzchar(lab)) overlays[[s]] <- lab
    }
  }

  list(
    def = def,
    status = stats::setNames(status, as.character(def$task)),
    overlays = overlays
  )
}
