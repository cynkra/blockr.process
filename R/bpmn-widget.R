#' Render a tidy BPMN model as an interactive diagram
#'
#' An htmlwidget: auto-layout (bpmn-auto-layout) and rendering
#' (bpmn-visualization, Apache-2.0) both run in the browser, so no Node.js
#' is needed for display. Pan and zoom are enabled.
#'
#' @param x A [bpmn()] model.
#' @param status Optional named character vector/list: node id -> status.
#'   `open`, `doing`, `blocked`, `skipped` get dedicated colours; any other
#'   value (`done`, `true`, `false`, ...) is painted as finished.
#' @param overlays Optional named character vector/list: node id -> small
#'   label rendered under the node (e.g. `"ana · 08-15"`).
#' @param width,height Widget size (CSS units).
#' @param elementId Optional DOM id.
#'
#' @return An htmlwidget.
#'
#' @export
bpmn_widget <- function(x, status = NULL, overlays = NULL,
                        width = "100%", height = NULL, elementId = NULL) {
  stopifnot(inherits(x, "bpmn"))

  htmlwidgets::createWidget(
    name = "bpmn_widget",
    x = list(
      xml = as.character(bpmn_xml(x)),
      status = as.list(status),
      overlays = as.list(overlays)
    ),
    width = width,
    height = height,
    package = "blockr.process",
    elementId = elementId,
    sizingPolicy = htmlwidgets::sizingPolicy(
      defaultHeight = 420,
      viewer.fill = TRUE,
      browser.fill = TRUE
    )
  )
}

#' Shiny bindings for bpmn_widget
#'
#' @param outputId Output id.
#' @param width,height Widget size (CSS units).
#' @param expr Expression returning a [bpmn_widget()].
#' @param env,quoted Standard shiny render arguments.
#'
#' @name bpmn_widget-shiny
#' @export
bpmnWidgetOutput <- function(outputId, width = "100%", height = "420px") {
  htmlwidgets::shinyWidgetOutput(
    outputId, "bpmn_widget", width, height,
    package = "blockr.process"
  )
}

#' @rdname bpmn_widget-shiny
#' @export
renderBpmnWidget <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) expr <- substitute(expr)
  htmlwidgets::shinyRenderWidget(expr, bpmnWidgetOutput, env, quoted = TRUE)
}
