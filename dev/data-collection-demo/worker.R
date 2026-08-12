# The worker. Start it, leave it running: it ingests the delivery
# platform's messages, runs the scripts whose turn it is, and waits while
# the people work.
#
#   Rscript dev/data-collection-demo/worker.R
#
# It is a plain R process and knows nothing about Shiny. In production this
# is a cron entry, a systemd unit or a scheduled job -- see
# vignette("running-scripts").

here <- local({
  a <- grep("^--file=", commandArgs(FALSE), value = TRUE)
  if (length(a)) dirname(normalizePath(sub("^--file=", "", a[1]))) else getwd()
})

pkgload::load_all(file.path(here, "../.."), quiet = TRUE)  # blockr.process

`%else%` <- function(x, y) if (is.null(x)) y else x

store <- Sys.getenv("DC_STORE", unset = file.path(here, "_runs"))
instance <- Sys.getenv("DC_INSTANCE", unset = "latest")

# The instance carries the definition it was started with, so the worker
# reads the process out of the store rather than being told: editing the
# board later cannot change what a running instance does.
instance <- blockr.process::instance_latest(store) %else% instance
process <- blockr.process::instance_definition(store, instance)
if (is.null(process)) {
  stop("no instance in ", store, " -- start one in the app first (the ",
       "'Start instance' card), or call start_instance() yourself")
}

blockr.process::run_worker(
  process = process,
  store = store,
  instance = instance,
  jobs = file.path(here, "jobs"),
  wait = !identical(Sys.getenv("DC_WAIT", "1"), "0")
)
