# A quarterly data collection, run as a process: eight reporting units
# deliver a file, a script validates each one, a person reviews it, and when
# they are all through the data is approved, consolidated, QA-checked and
# published as a forecast.
#
# What makes it a process demo rather than a dashboard demo:
#
#   - The event log IS the state. Every chip, every assignment, every script
#     run is one appended line; every panel is a fold over those lines.
#   - The outside world writes in. "Simulate delivery" writes one JSON file
#     into the store's inbox -- exactly what an upload platform would do --
#     and a worker turns it into an event.
#   - A worker runs the scripts. validate.R runs once per unit; qa_check.R
#     answers `true`/`false` on stdout and the answer routes the process, so
#     the QA branch and its rework loop live in the table, not in an
#     if-statement.
#
# Three views, switched top right:
#
#   Process   the editor with the multi-instance group -- the definition,
#             touched once a year
#   Instance  the daily surface: tasks and diagram, the delivery platform
#             strip below (the diagram counts n / 8)
#   Log       every event, newest first
#
# Nothing is started here: opening the instance IS the demo's first move.
# The Instance view starts on the "no instance <<2026Q1>> -- start it?" card.
#
# Run with:
#   source(system.file("examples/data-collection.R", package = "blockr.process"))
#
# ---- Package loading (dual: installed vs local source) ---------------------
# `dev_local = FALSE` (the default, and what ships) attaches the INSTALLED
# packages with library(). Set it to TRUE -- or source this file from the
# dev/data-collection.R wrapper -- to load every blockr package from its
# LOCAL source checkout with pkgload::load_all(). One board, two loaders, no
# drift.
if (!exists("dev_local")) dev_local <- FALSE

blockr_pkgs <- c(
  "blockr.core",
  "blockr.dplyr",
  "blockr.dock",
  "blockr.outline",   # the minidag rail the process editor is built on
  "blockr.session",   # project save / load / versions
  "blockr.process"
)

for (pkg in blockr_pkgs) {
  if (dev_local) pkgload::load_all(pkg, quiet = TRUE)
  else library(pkg, character.only = TRUE)
}

# the standard HTML table preview for block results, as everywhere in blockr
options(blockr.tabular_display = blockr.ui::html_table_display)

# ---- Curate the block browser ----------------------------------------------
# Keep ONLY `dataset` and `glue` from blockr.core; drop its low-level / noise
# blocks (subset, merge, rbind, head, scatter, csv, filebrowser, upload) via
# unregister_blocks(), selecting by the registry `package` attribute so only
# core blocks are affected.
core_keep <- c("dataset_block", "glue_block")
core_drop <- setdiff(
  names(Filter(
    function(entry) identical(attr(entry, "package"), "blockr.core"),
    available_blocks()
  )),
  core_keep
)
unregister_blocks(core_drop)

# ---- Where the instance lives -----------------------------------------------
# One store per CONTAINER, not per session: ShinyProxy seats several people in
# one container, and the best moment of this demo is two windows watching the
# same event log -- one person ticks a task, the other sees it appear. A
# `tempfile()` store would give everyone a private process and lose that.
# Ephemeral either way: /tmp dies with the container.
store <- Sys.getenv("BLOCKR_PROCESS_STORE", unset = "/tmp/blockr-process-demo")
instance <- Sys.getenv("BLOCKR_PROCESS_INSTANCE", unset = "2026Q1")
dir.create(store, showWarnings = FALSE, recursive = TRUE)

# The scripts the worker runs. system.file() does not see `inst/` under
# pkgload::load_all(), so the dev path is spelled out.
jobs <- system.file("examples", "jobs", package = "blockr.process")
if (!file.exists(file.path(jobs, "validate.R"))) {
  jobs <- file.path(
    system.file(package = "blockr.process"), "inst", "examples", "jobs"
  )
}

# ---- The worker --------------------------------------------------------------
# A hosting convenience, and the one place this demo bends its own rule: the
# design says the worker lives OUTSIDE the app (vignette("running-scripts")),
# because a live Shiny session must never hold workflow state. A hosted demo
# has nowhere else to put it, so the app starts one and the container's
# lifetime bounds it. In production this is a cron entry or a systemd unit,
# and the board does not know it exists.
#
# No-ops if a worker already holds the store's lock. Without one the demo
# still works: the delivery block ingests the inbox itself and says so --
# which is what BLOCKR_PROCESS_WORKER=0 is for, when you want to run the
# worker in a terminal and watch it work.
if (!identical(Sys.getenv("BLOCKR_PROCESS_WORKER", "1"), "0")) {
  demo_worker_start(store, jobs)
}

# ---- The board --------------------------------------------------------------
# The definition the process block opens with. In a real installation this is
# whatever the last edit saved; here it comes from the package.
process_tasks_def <- local({
  df <- demo_collection_process()
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
    start = new_demo_start_block(
      store = store, instance = instance, block_name = "Start instance"
    ),
    tasks = new_tasks_block(
      store = store, instance = "latest", roster = demo_people(),
      block_name = "Tasks"
    ),
    bpmn = new_bpmn_block(title = "Quarterly data collection"),
    bpmn_def = new_bpmn_block(title = "Quarterly data collection (definition)"),
    delivery = new_demo_delivery_block(
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

serve(board, plugins = custom_plugins(manage_project()))
