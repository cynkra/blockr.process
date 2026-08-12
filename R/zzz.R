.onLoad <- function(libname, pkgname) {
  blockr.core::register_blocks(
    # new_start_instance_block is deliberately absent: its `sources` cannot
    # serialize, so deployments register their own wrapping ctor instead
    # (see the block's "Not registered directly" section).
    ctor = c(
      "new_process_block", "new_assign_block", "new_bpmn_block",
      "new_tasks_block", "new_runstate_block", "new_event_log_block"
    ),
    name = c("Process", "Instance", "BPMN", "Tasks", "Instance state", "Instance log"),
    description = c(
      "A process definition: one wide table, one row per task",
      "Assign people, deadlines and statuses; blocked/skipped are computed",
      "The process table as a BPMN diagram with live status painted on",
      "An instance's task list wired to the instance store: every click is an event",
      "Overlay an instance store onto the incoming definition, live",
      "An instance's events newest first: the audit history"
    ),
    category = c(
      "input", "transform", "transform", "input", "transform", "input"
    ),
    package = pkgname
  )

  # The demo's two blocks (R/demo-blocks.R). They are registered because the
  # gallery board must be able to SAVE and RESTORE, which goes through the
  # registry -- and named "(demo)" because they are deployment code that
  # happens to ship here, not part of the process model.
  blockr.core::register_blocks(
    ctor = c("new_demo_start_block", "new_demo_delivery_block"),
    name = c("Start instance (demo)", "Delivery platform (demo)"),
    description = c(
      paste(
        "Start an instance from the incoming definition, with the demo's",
        "element lists baked in"
      ),
      paste(
        "The upload platform as a button: writes one inbox message per",
        "click, which the worker turns into an event"
      )
    ),
    category = c("transform", "input"),
    package = pkgname
  )
}
