# Run the data-collection board against LOCAL source checkouts (your latest
# uncommitted changes to any blockr package). This is the pkgload::load_all()
# counterpart of the shipped, library()-based
# inst/examples/data-collection.R: it just flips the loader and sources it, so
# the two can never drift.
#
# Run from an R session at the workspace root:
#   source("blockr.process/dev/data-collection.R")
#
# The store defaults to /tmp/blockr-process-demo and SURVIVES a restart, which
# is usually what you want while developing. For a clean board (back to the
# "start an instance" card), either press "Reset demo" in the app or point it
# somewhere fresh:
#   Sys.setenv(BLOCKR_PROCESS_STORE = tempfile("dc-"))
#
# (End users without the source checkouts run the shipped copy instead:
#   source(system.file("examples/data-collection.R", package = "blockr.process")))

options(shiny.port = 3838, shiny.host = "0.0.0.0")

dev_local <- TRUE
source("blockr.process/inst/examples/data-collection.R")
