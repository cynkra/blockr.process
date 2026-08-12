# Consolidate every validated delivery into one dataset. Runs once, after a
# person has approved the data -- the gate where the sub-process closes.

out <- Sys.getenv("PROC_ARTIFACTS")

cat("Consolidating instance", Sys.getenv("PROC_INSTANCE"), "\n")
Sys.sleep(1)

files <- list.files(out, pattern = "^validated-.*\\.csv$", full.names = TRUE)
if (!length(files)) {
  stop("nothing to consolidate: no validated deliveries in ", out)
}
dat <- do.call(rbind, lapply(files, read.csv))
write.csv(dat, file.path(out, "consolidated.csv"), row.names = FALSE)

cat(nrow(dat), "rows from", length(files), "units -> consolidated.csv\n")
