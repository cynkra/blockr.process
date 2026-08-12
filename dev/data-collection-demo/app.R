# The data collection board: a quarterly collection from eight reporting
# units, with everything that makes it real -- an event log the outside
# world can write into, and a worker that runs the scripts.
#
# Three views, switched top right:
#
#   Process   the editor with the multi-instance group -- the definition,
#             touched once a year
#   Instance  the daily surface: tasks and diagram, the delivery platform
#             strip below (chips WRITE the event log; assign, send back
#             = rework; the diagram counts n / 8)
#   Log       every event, newest first
#
# Nothing is started here: opening the instance IS the demo's moment. The
# Instance view starts on the "no instance «2026Q1» -- start it?" card.
#
#   shiny::runApp("blockr.process/dev/data-collection-demo",
#                 port = blockr_port(), host = "0.0.0.0")
#
# and, in a second terminal, the worker that runs the scripts:
#
#   Rscript blockr.process/dev/data-collection-demo/worker.R

library(blockr.core)
library(blockr.dplyr)
library(blockr.dock)
library(blockr.outline)
library(blockr.session)

# the standard HTML table preview for block results, as everywhere in blockr
options(blockr.tabular_display = blockr.ui::html_table_display)

here <- getwd()
if (!file.exists(file.path(here, "dcdemo/DESCRIPTION"))) {
  here <- file.path(here, "dev/data-collection-demo")
}

pkgload::load_all(file.path(here, "../.."), quiet = TRUE)  # blockr.process
pkgload::load_all(file.path(here, "dcdemo"), quiet = TRUE)

store <- Sys.getenv("DC_STORE", unset = file.path(here, "_runs"))
instance <- Sys.getenv("DC_INSTANCE", unset = "2026Q1")

process_tasks_def <- local({
  df <- dcdemo::collection_process()
  lapply(seq_len(nrow(df)), function(i) {
    list(
      task = df$task[i], name = df$name[i], role = df$role[i],
      dep = df$depends_on[i], script = df$script[i],
      parent = df$parent[i], collection = df$collection[i]
    )
  })
})

# One view per audience: the definition, the daily instance, the history.
# Each view is a grid; views derive from the grids so membership and
# arrangement never disagree.
grids <- list(
  # the diagram twice, on purpose: under the editor it shows the STRUCTURE
  # (definition only), under the tasks the LIVE INSTANCE (status + counters)
  # -- two bpmn blocks, one per source
  Process = dock_grid(
    "process", "bpmn_def",
    orientation = "vertical", sizes = c(3, 2)
  ),
  Instance = dock_grid(
    group("start", "tasks", sizes = c(1.4, 3)),
    "bpmn",
    "delivery",
    orientation = "vertical", sizes = c(3, 2, 0.8)
  ),
  Log = dock_grid("log")
)

board <- new_dock_board(
  blocks = c(
    process = new_process_block(
      tasks = process_tasks_def, block_name = "Process"
    ),
    start = dcdemo::new_start_block(
      store = store, instance = instance, block_name = "Start instance"
    ),
    tasks = new_tasks_block(
      store = store, instance = "latest", roster = dcdemo::people(),
      block_name = "Tasks"
    ),
    bpmn = new_bpmn_block(title = "Quarterly data collection"),
    bpmn_def = new_bpmn_block(title = "Quarterly data collection (definition)"),
    delivery = dcdemo::new_delivery_block(
      store = store, instance = "latest", block_name = "Delivery platform"
    ),
    log = new_event_log_block(
      store = store, instance = "latest", block_name = "Event log"
    )
  ),
  links = c(
    new_link(from = "process", to = "start", input = "data"),
    new_link(from = "process", to = "bpmn_def", input = "data"),
    new_link(from = "tasks", to = "bpmn", input = "data")
  ),
  extensions = new_minidag_extension(),
  grids = grids,
  views = lapply(grids, function(g) dock_view(layout_panel_ids(g))),
  active = "Instance"
)

# blockr.session's manage_project plugin: save / load / version from the app
serve(
  board,
  plugins = custom_plugins(manage_project())
)
