# Data collection demo: the whole thing, running

A quarterly data collection from eight reporting units. It is the smallest
example that still contains every part of blockr.process working for real:
a process that repeats per unit, people picking tasks up in a browser,
scripts actually running in a worker process, and an outside system moving
the process forward without knowing that blockr exists.

The board lives in one file, `inst/examples/data-collection.R`, so an
installed user runs it with

```r
source(system.file("examples/data-collection.R", package = "blockr.process"))
```

and it is also the exact file the blockr.cloud gallery deploys.

```
  delivery platform ─┐  writes             ┌─ ingests
                     ▼                     ▼
             <store>/inbox/*.json ──► worker (headless, dev/worker.R)
                                            │  runs inst/examples/jobs/*.R
  tasks block ──────────────► <store>/events.jsonl ◄── dev/act.R (a person,
  (chips, assign, send back)     append-only                     from the shell)
                                       │
                                       ▼
                        the board folds the log and redraws
```

Three writers share one file, with no server between them. The board never starts a
script and holds no instance state, so closing the browser does not stop
production, and two people watching see the same thing.

`<store>` is `/tmp/blockr-process-demo` unless `BLOCKR_PROCESS_STORE` says
otherwise.

## The process

| task | role | what it means |
|---|---|---|
| `each_unit` | | the multi-instance group: `collection = unit` |
| `delivery` | system, **no script** | done when the outside world says so (an inbox message) |
| `validate` | system, `validate.R` | the worker runs it **once per unit** |
| `review` | analyst | a person, once per unit |
| `approve_data` | steward | the gate: waits for `each_unit` to close |
| `consolidate` | system, `consolidate.R` | once, over every validated delivery |
| `qa_check` | system, `qa_check.R` | answers `true` / `false` on stdout |
| `reconcile` | analyst | `depends_on qa_check:false`, loops back into the check |
| `approve_publication` | management | `depends_on qa_check:true` |
| `forecast` | system, `forecast.R` | once, at the end |

`depends_on` is flow (a DAG over tasks), `parent` is scope (a tree), and
`collection` is repetition (a property of one row); the three relations
never overlap. `parent` is not a weaker `depends_on`. BPMN forbids a
sequence flow that crosses a sub-process boundary, so the edge out of the
group is written on the **container** (`approve_data depends_on
each_unit`) and lowered onto the group's exits when anything reads the
table.

## Run it

From an R session at the workspace root:

```r
source("blockr.process/dev/data-collection.R")   # dev_local = TRUE, port 3838
```

The app starts its own worker (`demo_worker_start()`), which is the hosting
convenience the gallery needs. To watch a worker's output instead, point the
app somewhere without one and run it yourself in a second terminal:

```sh
BLOCKR_PROCESS_WORKER=0 Rscript -e 'source("blockr.process/dev/data-collection.R")'
Rscript blockr.process/dev/worker.R          # reads the definition out of the store
```

For a clean board (back to the "start an instance" card), press **Reset
demo** in the app, or `rm -rf /tmp/blockr-process-demo`.

## The click script (what to show, in order)

1. **Process**: the definition. The three front tasks sit in a violet
   frame, **for each unit**: a BPMN multi-instance sub-process, and the
   one place the eight exist. The header names the collection and says
   **done when** (the completion quorum, `all` by default). The row below
   the frame carries **waits for all unit**, which is the join where the
   sub-process closes; set *done when* to `pct=90` and the same chip says
   `waits for 90% of unit`. The diagram draws the same thing: `|||` on the
   repeated activities.
2. **Start instance**. The Instance view starts on the card
   "No instance «2026Q1» yet": period, source (the lists live on
   the database: the register, with assignments, or the unassigned list, or
   regions), one click. The card becomes the instance header, the task list
   unfolds, the diagram paints itself, and ana and ben already have their
   five (actor `register` in the event log). Three stay in the pool. Bonus
   line: edit the process afterwards and the header says the change applies
   to the NEXT instance, never this one.
3. **Tasks**: filter by region, tick the pool rows, **assign to**: bulk
   assignment, two events.
4. **Delivery platform**: click **Simulate delivery**. No click of ours; in
   production the platform writes this. It does not write an event; it
   writes `<store>/inbox/delivery-2026Q1-Northgate.json`, and the **worker**
   turns that into an event on its next tick. Within a poll the unit's
   Review flips from *waiting for Data delivery* to *open*, and the worker
   has already run `validate.R` for it. (Watch it from a second browser
   window: same store, same flip.)
5. **Tasks**: click the status chip: open → in progress → done. Every
   click is an event in the store (`actor` = the assignee), not block
   state. The section header counts up, the diagram shows the same count on
   the unit boxes; the gate opens when the count is full.
6. **Rework, per element**: tick a finished unit, write a note, **send
   back**. Only that row reopens, the gate re-closes, the note hangs on the
   element (see the event log).
7. **The worker takes over**: approve the data and `consolidate.R` runs,
   then `qa_check.R`, which answers **false** on its first attempt. The
   branch is in the table, so *Reconcile findings* opens and *Approve
   publication* goes grey as **skipped**.
8. **Rework, on the single track**: mark *Reconcile findings* done. The
   check is re-armed (`false` → `open`), the worker runs it again, attempt 2
   answers **true**, and now approval is ready. That is the loop a DAG
   cannot express; both attempts are kept in `<store>/2026Q1/logs/`.
9. **Approve publication** → `forecast.R` runs and the instance is
   complete. `<store>/2026Q1/artifacts/` holds every file the scripts wrote.

## Where everything lives

```
<store>/events.jsonl              the log: the whole truth, append-only
<store>/inbox/                    messages from outside, one file each
<store>/inbox/processed/          applied, kept as the receipt
<store>/inbox/failed/             rejected, with the reason beside them
<store>/2026Q1/logs/              one file per task per ATTEMPT
<store>/2026Q1/artifacts/         what the scripts wrote
<store>/.worker.lock/             held by the running worker
```

Three moves cover the instance lifecycle:

- **New instance…** (link in the instance header): points the card at the
  next free id. Start it, and every block on `instance = "latest"` moves to
  the new one. The old instance stays in the log, addressable by its id
  (pin a block to `instance = "2026Q1"` to keep watching it).
- **Reset demo** (link in the delivery strip): archives the log to
  `<store>/events-<timestamp>.jsonl` (nothing is deleted) and clears the
  inbox.
- **From the shell**: `rm -rf /tmp/blockr-process-demo` removes the store
  entirely, archives included.

## Driving it without a browser

`dev/act.R` is what the status chip does, one layer down:

```sh
Rscript blockr.process/dev/act.R review done ana Northgate   # one element
Rscript blockr.process/dev/act.R approve_data done mira      # the gate
Rscript blockr.process/dev/act.R reconcile done ben          # re-arms QA
```

and a delivery, the way the platform sends it (any language that can write
a file can do this):

```r
blockr.process::write_inbox_message(
  "/tmp/blockr-process-demo", task = "delivery", element = "Riverside",
  instance = "2026Q1", actor = "delivery-platform",
  id = "delivery-2026Q1-Riverside"      # resend-safe: the id is the key
)
```

## What is deliberately not here

- **Boundary events**: a deadline on a delivery that fires a reminder. It
  is the one thing the table cannot say today; the spec is
  `_blockr.design/open/blockr-process/6-boundary-events.md`.
- **Late delivery**: same key, one more event, mechanically identical to
  the rework.
- **HTTP ingress**: the inbox is a directory here. Putting a plumber
  endpoint in front of it is twenty lines, see
  `vignette("external-systems")`.
