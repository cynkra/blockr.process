# A person acting from the shell: exactly what the status chip in the
# tasks block does, one layer down. Useful to drive the demo without a
# browser, or to script an action.
#
#   Rscript blockr.process/dev/act.R review done ana Northgate
#   Rscript blockr.process/dev/act.R approve_data done mira
#   Rscript blockr.process/dev/act.R reconcile done ben
#
#   arguments: <task> [<status>] [<actor>] [<element>]

here <- local({
  a <- grep("^--file=", commandArgs(FALSE), value = TRUE)
  if (length(a)) dirname(normalizePath(sub("^--file=", "", a[1]))) else getwd()
})

pkgload::load_all(file.path(here, ".."), quiet = TRUE)  # blockr.process

args <- commandArgs(TRUE)
if (!length(args)) {
  stop("usage: Rscript act.R <task> [<status>] [<actor>] [<element>]")
}
store <- Sys.getenv("BLOCKR_PROCESS_STORE", unset = "/tmp/blockr-process-demo")

blockr.process::process_act(
  task = args[1],
  status = if (length(args) > 1) args[2] else "done",
  actor = if (length(args) > 2) args[3] else "shell",
  element = if (length(args) > 3) args[4] else NULL,
  store = store,
  instance = "latest",
  process = blockr.process::instance_definition(
    store, blockr.process::instance_latest(store)
  )
)

message("ok: ", paste(args, collapse = " "))
