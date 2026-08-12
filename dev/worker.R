# The worker for the data-collection demo. Start it, leave it running: it
# ingests the delivery platform's messages, runs the scripts whose turn it
# is, and waits while the people work.
#
#   Rscript blockr.process/dev/worker.R
#
# It is a plain R process and knows nothing about Shiny. In production this
# is a cron entry, a systemd unit or a scheduled job; see
# vignette("running-scripts").
#
# The app starts its own worker by default (demo_worker_start()), so run the
# app with BLOCKR_PROCESS_WORKER=0 if you want this one to do the work and
# show you its output.

here <- local({
  a <- grep("^--file=", commandArgs(FALSE), value = TRUE)
  if (length(a)) dirname(normalizePath(sub("^--file=", "", a[1]))) else getwd()
})

pkgload::load_all(file.path(here, ".."), quiet = TRUE)  # blockr.process

`%else%` <- function(x, y) if (is.null(x)) y else x

store <- Sys.getenv("BLOCKR_PROCESS_STORE", unset = "/tmp/blockr-process-demo")
instance <- Sys.getenv("BLOCKR_PROCESS_INSTANCE", unset = "latest")

# The instance carries the definition it was started with, so the worker
# reads the process out of the store rather than being told: editing the
# board later cannot change what a running instance does.
instance <- blockr.process::instance_latest(store) %else% instance
process <- blockr.process::instance_definition(store, instance)
if (is.null(process)) {
  stop("no instance in ", store, "; start one in the app first (the ",
       "'Start instance' card), or call start_instance() yourself")
}

blockr.process::run_worker(
  process = process,
  store = store,
  instance = instance,
  jobs = file.path(here, "..", "inst", "examples", "jobs"),
  wait = !identical(Sys.getenv("BLOCKR_PROCESS_WAIT", "1"), "0")
)
