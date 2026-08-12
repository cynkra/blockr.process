# A check: it does not report success or failure, it reports an ANSWER, and
# the answer routes the process. The convention is one line on stdout:
#
#   ::process-output status=<label>::
#
# The label becomes the task's status, and the tasks that asked for
# `qa_check:true` or `qa_check:false` in their `depends_on` open or go grey
# accordingly. Nobody wrote an if-statement; the branch is in the table.
#
# For the demo the answer is scripted: the first attempt finds a problem,
# the attempt after the reconciliation passes.

out <- Sys.getenv("PROC_ARTIFACTS")
attempt <- as.integer(Sys.getenv("PROC_ATTEMPT", "1"))

dat <- read.csv(file.path(out, "consolidated.csv"))
cat("QA check on", nrow(dat), "rows, attempt", attempt, "\n")
Sys.sleep(1)

if (attempt == 1L) {
  cat("2 units report a value outside the plausible range\n")
  cat("::process-output status=false::\n")
} else {
  cat("all values within range\n")
  cat("::process-output status=true::\n")
}
