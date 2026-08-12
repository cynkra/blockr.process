# The last automatic task of the instance: runs once management has
# approved the publication.

out <- Sys.getenv("PROC_ARTIFACTS")

cat("Computing the forecast\n")
Sys.sleep(1)

dat <- read.csv(file.path(out, "consolidated.csv"))
agg <- aggregate(value ~ unit, dat, sum)
agg$forecast <- round(agg$value * 1.013, 1)
write.csv(agg, file.path(out, "forecast.csv"), row.names = FALSE)

cat("Forecast for", nrow(agg), "units -> forecast.csv\n")
