# Run a process until it needs a person (or finishes)

The worker is a plain R process: start it from cron, a systemd unit, a
Connect scheduled job or a second terminal. It holds no state of its own
– everything it knows it read from the store, everything it did it wrote
there – so killing it and starting it again loses nothing but the time
in between.

## Usage

``` r
run_worker(
  process,
  store = ".runs",
  instance = "instance",
  jobs = ".",
  wait = TRUE,
  tick = 2,
  timeout = 900,
  lock = TRUE,
  inbox = TRUE,
  interpreters = process_interpreters(),
  packages = character(),
  quiet = FALSE
)
```

## Arguments

- process:

  A wide process table (the definition).

- store:

  Instance store directory.

- instance:

  Instance id, or \`"latest"\` for the newest instance in the store.

- jobs:

  Directory holding the scripts named in the \`script\` column. Scripts
  are resolved inside it and nowhere else.

- wait:

  Poll for human events instead of returning at the first task a person
  owns.

- tick:

  Poll interval in seconds.

- timeout:

  Give up waiting after this many seconds.

- lock:

  Take the worker lock, so a second worker on the same store refuses to
  start.

- inbox:

  Ingest the file inbox on every tick.

- interpreters:

  Extension -\> interpreter map, see \[process_interpreters()\].

- packages:

  Packages whose functions a \`script\` cell may name
  (\`"mypkg::forecast"\`). The allowlist for the function form, and the
  counterpart of \`jobs\` for the file form: empty by default, so a
  deployment has to say which code it is willing to run.

- quiet:

  Suppress progress messages.

## Value

The table with the instance applied, invisibly.

## Details

On every tick it ingests the inbox (\[ingest_inbox()\]), folds the log,
and runs the ready tasks whose role is \`system\` and which name a
script. A ready task belonging to a person stops it (or, with \`wait =
TRUE\`, it waits for that person's event).

## Examples

``` r
store <- tempfile()
jobs <- tempfile()
dir.create(jobs)
writeLines("cat('hello\n')", file.path(jobs, "hello.R"))

process <- data.frame(
  task = "greet", name = "Greet", role = "system",
  depends_on = "", script = "hello.R"
)
run_worker(process, store = store, jobs = jobs, wait = FALSE, quiet = TRUE)
instance_log(store, "instance")[, c("task", "field", "value")]
#>    task        field                     value
#> 6 greet       status                      done
#> 5 greet         took                      0.2s
#> 4 greet          log instance/logs/greet-1.log
#> 3 greet code_version                  098a9a45
#> 2 greet      attempt                         1
#> 1 greet       status                     doing
```
