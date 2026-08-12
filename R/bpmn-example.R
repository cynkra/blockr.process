#' Example: quarterly data collection as a BPMN model
#'
#' The same story as [example_process()], one level down: the tidy BPMN
#' model a wide table compiles to. Delivery, validation, a QA gateway with a
#' correction loop, approval, publication. Lanes are roles, never people --
#' people change, roles do not.
#'
#' @return A [bpmn()] model.
#'
#' @importFrom tibble tibble
#' @export
#' @keywords internal
example_quarterly <- function() {
  nodes <- tibble(
    id = c(
      "start", "deliver", "validate", "qa", "fix",
      "review", "approve", "publish", "end"
    ),
    name = c(
      "Quarter opens",
      "Upload delivery",
      "Validate data (R)",
      "QA passed?",
      "Request correction",
      "Review deliveries",
      "Approve publication",
      "Publish dataset (R)",
      "Published"
    ),
    type = c(
      "start", "user", "script", "gateway", "user",
      "user", "user", "script", "end"
    ),
    lane = c(
      "System", "Analyst", "System", "System", "Analyst",
      "Team", "Management", "System", "System"
    )
  )

  flows <- tibble(
    from = c("start", "deliver", "validate", "qa", "qa", "fix", "review",
             "approve", "publish"),
    to = c("deliver", "validate", "qa", "review", "fix", "validate",
           "approve", "publish", "end"),
    name = c(NA, NA, NA, "yes", "no", NA, NA, NA, NA)
  )

  bpmn(nodes, flows, name = "Quarterly data collection")
}
