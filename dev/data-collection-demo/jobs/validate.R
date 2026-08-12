# Validate one delivery. This is the multi-instance script task: the worker
# runs it once per reporting unit, and the only thing that tells the two
# runs apart is the environment.
#
# The script knows nothing about blockr.process. Its whole contract is:
#   in   PROC_INSTANCE, PROC_TASK, PROC_ELEMENT, PROC_ATTEMPT,
#        PROC_ARTIFACTS, PROC_STORE, PROC_PARAM_*
#   out  exit code (0 = done), stdout/stderr (captured), files in artifacts

unit <- Sys.getenv("PROC_ELEMENT")
out <- Sys.getenv("PROC_ARTIFACTS")

cat("Validating the delivery from", unit, "\n")
Sys.sleep(1)

# stands in for reading the uploaded file
set.seed(nchar(unit))
dat <- data.frame(
  unit = unit,
  period = c("M1", "M2", "M3"),
  value = round(runif(3, 80, 120), 1)
)
write.csv(dat, file.path(out, paste0("validated-", unit, ".csv")),
          row.names = FALSE)

cat("3 rows, no missing values ->",
    file.path(out, paste0("validated-", unit, ".csv")), "\n")
