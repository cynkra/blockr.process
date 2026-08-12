# Running scripts

A task whose `role` is `system` and whose `script` names a file is run
by the **worker**: a plain R process, started outside the app, that
reads the event log, runs what is ready, and appends what happened.

The board never starts a script and holds no instance state, so closing
the browser does not stop production, two people watching see the same
thing, and the worker can be killed and restarted at any moment without
losing more than the time in between.

## The shape

      jobs/*.R            your scripts, unchanged and unaware of any of this
          ^
          | Rscript, environment variables
      worker              reads the table, runs what is ready, appends events
          |
          v
      events.jsonl        append-only log   <-- people and other systems write here too
          |
          v
      the board           folds the log and draws it

## A first process

``` r

store <- tempfile()
jobs <- tempfile()
dir.create(jobs)

writeLines(
  "cat('rows:', nrow(mtcars), '\n')",
  file.path(jobs, "count.R")
)

process <- data.frame(
  task       = c("count", "sign_off"),
  name       = c("Count the rows", "Sign off"),
  role       = c("system", "management"),
  depends_on = c("", "count"),
  script     = c("count.R", "")
)

run_worker(process, store = store, jobs = jobs, wait = FALSE)
#> worker: instance=instance store=/tmp/RtmpUzXWAL/file29b7ed2b206 jobs=/tmp/RtmpUzXWAL/file29b7798e5f13 code=0067d2a2
#> * count -> count.R
#>   done in 0.2s  (/tmp/RtmpUzXWAL/file29b7ed2b206/instance/logs/count-1.log)
#> worker: waiting for people on: sign_off
```

The worker ran the script, stopped at the task a person owns, and said
so. Everything it did is in the log:

``` r

instance_log(store, "instance")[, c("task", "field", "value", "actor")]
#>    task        field                     value  actor
#> 6 count       status                      done worker
#> 5 count         took                      0.2s worker
#> 4 count          log instance/logs/count-1.log worker
#> 3 count code_version                  0067d2a2 worker
#> 2 count      attempt                         1 worker
#> 1 count       status                     doing worker
```

`took`, `log` and `code_version` are bookkeeping the worker records on
every attempt: how long it ran, where its output went, and which version
of the code that was.

## What a script receives

The script is not aware of blockr.process. Its whole contract is
environment variables in, exit code and stdout out:

| variable | what it is |
|----|----|
| `PROC_INSTANCE` | the instance id |
| `PROC_TASK` | the task id |
| `PROC_ELEMENT` | the element, for a task inside a multi-instance group (`""` otherwise) |
| `PROC_ATTEMPT` | 1 on the first try |
| `PROC_ARTIFACTS` | a directory to write into, per instance |
| `PROC_STORE` | the store, if the script wants to look at the log itself |
| `PROC_PARAM_*` | one per `key=value` pair in the task’s `params` column |

Exit code 0 means done; anything else means failed. Everything the
script prints is captured to
`<store>/<instance>/logs/<task>-<attempt>.log`, one file per attempt,
kept.

`params` is how the same script does two different jobs without anyone
editing it:

``` r

process <- data.frame(
  task   = c("full", "delta"),
  name   = c("Full load", "Delta load"),
  role   = "system",
  depends_on = c("", "full"),
  script = "load.R",
  params = c("mode=full", "mode=delta; since=2026-01-01")
)
```

`mode=full` reaches the script as `PROC_PARAM_MODE`.

## A script that answers a question

A check reports an **answer** rather than a plain success or failure,
and the answer routes the process. One line on stdout:

``` r

cat("::process-output status=false::\n")
```

The label becomes the task’s status, and the tasks that asked for it in
their `depends_on` open or go grey:

``` r

writeLines(
  "cat('::process-output status=false::\n')",
  file.path(jobs, "qa.R")
)

process <- data.frame(
  task       = c("qa", "fix", "publish"),
  name       = c("QA check", "Fix findings", "Publish"),
  role       = c("system", "analyst", "management"),
  depends_on = c("", "qa:false", "qa:true"),
  script     = c("qa.R", "", "")
)

st <- tempfile()
run_worker(process, store = st, jobs = jobs, wait = FALSE, quiet = TRUE)
process_status(apply_events(process, st, "instance"))
#>        qa       fix   publish 
#>   "false"    "open" "skipped"
```

`fix` is open, `publish` is **skipped**: its gate asked for an outcome
that will never come. The branch is in the table, not in code. When
`fix` is done the check is re-armed and runs again, a rework loop a
plain DAG cannot express.

## Once per element

A script task inside a multi-instance group runs once per element, with
`PROC_ELEMENT` telling the script which one:

``` r

writeLines(
  paste(
    "el <- Sys.getenv('PROC_ELEMENT')",
    "writeLines(el, file.path(Sys.getenv('PROC_ARTIFACTS'), paste0(el, '.txt')))",
    sep = "\n"
  ),
  file.path(jobs, "validate.R")
)

process <- data.frame(
  task       = c("each_unit", "validate", "review"),
  name       = c("for each unit", "Validate", "Review"),
  role       = c("", "system", "analyst"),
  depends_on = c("", "", "validate"),
  script     = c("", "validate.R", ""),
  collection = c("unit", "", ""),
  parent     = c("", "each_unit", "each_unit")
)

st <- tempfile()
start_instance(process, c("north", "south"), "2026Q1", st)
run_worker(process, store = st, instance = "2026Q1", jobs = jobs,
           wait = FALSE, quiet = TRUE)

list.files(file.path(st, "2026Q1", "artifacts"))
#> [1] "north.txt" "south.txt"
```

Add `sequential = TRUE` to the group row and the worker runs them one at
a time instead.

## When things go wrong

**Retries** are a column. `retry = 2` means up to three attempts; each
one is a separate log file, and the decision to retry is written into
the event log (actor `worker (retry 1/2)`) rather than hidden inside a
loop.

**Timeouts** are a column too. `timeout = 600` kills the attempt after
ten minutes and records `timeout after 600s` as an `error` event.

``` r

process <- data.frame(
  task = "load", name = "Load", role = "system", depends_on = "",
  script = "load.R", retry = 2, timeout = 600
)
```

A task that runs out of attempts stays `failed`, and the worker reports
what the instance is stuck on. There is no automatic rollback; the
failure is recorded like any other event.

## The jobs directory is a jail

`script` is a **name inside** the jobs directory, never a path out of
it. Absolute paths, `~` and any `..` segment are refused before the
filesystem is touched, and a symlink pointing out of the directory is
caught after. Refusing is an ordinary outcome: the task fails, an
`error` event carries the reason, and nothing is executed.

This matters because a process definition can be edited in a browser by
whoever may edit processes, while the worker runs on a machine that can
reach the production data. The security boundary is therefore **whoever
deploys the jobs directory decides what may run**, not whoever edits the
process. Keep the jobs directory under version control and deploy it
like code.

## Calling a function instead of a file

`script` may also name an exported function of an installed package:

``` r

process <- data.frame(
  task = "forecast", name = "Forecast", role = "system", depends_on = "",
  script = "mypkg::forecast"
)

run_worker(process, store = store, packages = "mypkg")
```

This is usually the better shape for a deployment. The package is
already in the image, so there is no jobs directory to ship, mount or
version separately; `code_version` becomes the package version, which is
a truer answer than a hash of a folder; and the job is a documented,
tested, `R CMD check`ed function.

Everything else stays as it is, on purpose:

- **It still runs in a subprocess**
  (`Rscript --vanilla -e 'mypkg::forecast()'`). Calling in-process would
  cost you the timeout (you cannot reliably interrupt arbitrary R or C
  code in the worker’s own session), crash isolation (a segfault or an
  out-of-memory would take the worker with it), and the per-attempt log
  file. R startup takes a fraction of a second, negligible against any
  real job.
- **The contract is the same.** The function takes no arguments and
  reads `PROC_ELEMENT`, `PROC_ATTEMPT`, `PROC_ARTIFACTS` and the rest
  from its environment, exactly like a script. So the two forms are
  interchangeable and a task can move from one to the other without
  anything else changing.

`packages` is an **allowlist, empty by default**, for the same reason
the jobs directory is a jail. A process definition is edited in a
browser; without the allowlist, `script` could name
[`base::system`](https://rdrr.io/r/base/system.html) and whoever may
edit a process could run anything the worker can. Only a plain
`pkg::fun` is accepted: no `:::`, no arguments, no expression.

## Other languages

The extension picks the interpreter: `.R` → `Rscript --vanilla`, `.sh` →
`sh`, `.py` → `python3`. The map is an argument, so anything else is one
line:

``` r

run_worker(
  process, store = store, jobs = jobs,
  interpreters = c(
    process_interpreters(),
    list(jl = list(command = "julia", args = character()))
  )
)
```

`--vanilla` is deliberate: a script that needs a package environment
should say so on its own first line (`renv::load()`), so what ran is
visible in the script rather than in the worker’s shell.

## Which code ran

Every attempt records a `code_version`: the git short sha of the jobs
directory when it is a working tree, otherwise a content hash of the
scripts. A year later the log still answers exactly which code ran.

It does not record which *packages* were loaded. If that matters, put a
lockfile in the jobs directory (it is part of the hash) and load it in
the script.

## Deploying the worker

One worker per store, enforced by a lock the running worker holds and
touches on every tick; a second one refuses to start, and a lock left
behind by a worker that died is broken automatically.
`worker_alive(store)` answers whether one is running, which a board can
display.

Because the worker is stateless, restarting it is always safe. Pick
whichever of these your platform gives you:

**cron**: run every five minutes, do the work that is ready, exit:

``` sh
*/5 * * * * cd /srv/collection && Rscript worker.R >> worker.log 2>&1
```

with `wait = FALSE` in `worker.R`, so it returns as soon as nothing is
ready. The lock makes overlapping runs safe.

**systemd**: one long-lived process that waits for people:

``` ini
[Service]
WorkingDirectory=/srv/collection
ExecStart=/usr/bin/Rscript worker.R
Restart=always
RestartSec=10
```

with `wait = TRUE` and a large `timeout`.

**Docker**: the same, as the container’s command. Mount the store as a
volume: it is the only state.

**Posit Connect**: a scheduled job (an R script, not an app) doing
exactly what the cron line does. The store has to be on a path the job
can write.

In every case the worker needs three things: the store, the jobs
directory, and whatever credentials the scripts themselves need. It does
not need the app, and the app does not need it; without a worker, script
tasks never start.
