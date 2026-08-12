# blockr.process

<!-- badges: start -->
[![lifecycle](https://img.shields.io/badge/lifecycle-experimental-orange.svg)](https://lifecycle.r-lib.org/articles/stages.html#experimental)
<!-- badges: end -->

**[Live demo: a quarterly data collection →](https://blockr.cloud/app/data-collection)**

**The organization as a data frame.** A process definition is one wide
table: one row per task, columns saying who does it, what it waits for, and
whether a script does it instead of a person. That table is the model;
everything else in the package is a view of it or a fold over its event
log.

```r
process <- data.frame(
  task        = c("deliver", "validate", "review",  "approve"),
  name        = c("Delivery", "Validate", "Review",  "Approve"),
  role        = c("system",   "system",   "analyst", "management"),
  depends_on  = c("",         "deliver",  "validate", "review"),
  script      = c("",         "validate.R", "",      "")
)
```

From that one table you get, with no further modelling:

- a **BPMN 2.0 diagram** with live status painted on (start/end events,
  gateways, lanes and multi-instance markers are derived, not drawn),
- a **task list** people work in, where every click is an event,
- a **worker** that runs the tasks that are scripts,
- an **event log** that is the audit trail, because it is the storage.

Built on [blockr](https://github.com/BristolMyersSquibb/blockr): the table
flows through a board, so any blockr block composes with it: a
`dplyr::filter(assignee == "ana")` block is a personal task view, and a
table block is a management report.

## Installation

```r
# install.packages("pak")
pak::pak("cynkra/blockr.process")
```

## The three moving parts

```
   definition            instance                    execution
   ──────────            ────────                    ─────────
   a wide table   ──►    events.jsonl        ◄──     worker (a plain
   in git or a           append-only, one            R process; runs the
   process block         line per event              script tasks)
                              ▲
                              │
                         inbox/*.json  ◄── other systems, any language
```

- **Definition**: a data frame. Edit it in R, in a CSV, or in the process
  block's editor. It never changes while an instance runs; an instance
  records the version it started with.
- **Instance**: `start_instance()` stamps the definition and the element
  list into the log. Every click, every script, every message after that is
  one appended line. Current state is the latest event per (task, element,
  field), so the history is complete by construction.
- **Execution**: `run_worker()` is a headless R process. A live Shiny
  session never holds workflow state, so closing the browser does not stop
  production and two people watching see the same thing.

## Quick start

```r
library(blockr.process)

store <- tempfile()
jobs  <- tempfile(); dir.create(jobs)
writeLines("cat('validated\n')", file.path(jobs, "validate.R"))

process <- data.frame(
  task       = c("each_unit", "delivery", "validate", "review"),
  name       = c("for each unit", "Delivery", "Validate", "Review"),
  role       = c("",  "system", "system",     "analyst"),
  depends_on = c("",  "",       "delivery",   "validate"),
  script     = c("",  "",       "validate.R", ""),
  collection = c("unit", "", "", ""),          # this row IS the group
  parent     = c("", "each_unit", "each_unit", "each_unit")
)

# open an instance over three reporting units
start_instance(process, c("north", "south", "east"), "2026Q1", store)

# the outside world delivers one of them
write_inbox_message(store, "delivery", element = "north",
                    instance = "2026Q1", actor = "platform", id = "d-north")

# the worker ingests it and validates that delivery, and only that one
run_worker(process, store = store, instance = "2026Q1", jobs = jobs,
           wait = FALSE)

instance_view(store, "2026Q1")[, c("task", "element", "status")]
#>       task element  status
#> 1 delivery   north    done
#> 2 delivery   south    open
#> 3 delivery    east    open
#> 4 validate   north    done     <- the script ran for north, and only north
#> 5 validate   south blocked
#> 6 validate    east blocked
#> 7   review   north    open     <- a person's turn now
#> 8   review   south blocked
#> 9   review    east blocked
```

## The table's vocabulary

The vocabulary is BPMN 2.0 throughout: process, task, lane,
multi-instance, collection, element, instance, assignee. Process
architects can read a definition without a glossary.

| column | what it says |
|---|---|
| `task`, `name` | the id and the label |
| `role` | who may act. Becomes a lane; `system` means nobody |
| `depends_on` | flow, comma separated. `qa_check:false` waits for an outcome |
| `script` | `forecast.R` (a file in the jobs directory) or `mypkg::forecast` (a function in an allowed package); the worker runs it |
| `collection` | **this row is a multi-instance group**, repeating per element |
| `parent` | which group a task is in |
| `join` | how many dependencies are enough: `all`, `any`, `n=3`, `pct=90` |
| `complete_when` | how many elements close a group |
| `sequential` | elements run one at a time |
| `retry`, `timeout`, `params` | how the worker runs a script |

`depends_on` is flow (a DAG over tasks), `parent` is scope (a tree), and
`collection` is repetition (a property of one row); the three relations
never overlap. A dependency may name a group, in
either direction; BPMN forbids a sequence flow that crosses a sub-process
boundary, so container edges are lowered onto the group's entries and exits
before anything reads the table.

Everything except `task` and `name` is optional. A definition with three
columns is a valid process.

## Blocks

| block | what it does |
|---|---|
| `new_process_block()` | the editor: the list is the process, with a rail drawing the flow |
| `new_start_instance_block()` | open an instance from a definition and an element list |
| `new_tasks_block()` | the task list: chips, assignment, send-back. Writes events |
| `new_bpmn_block()` | the diagram, status painted on. Passes the table through |
| `new_instance_state_block()` | fold a store onto an incoming definition, live |
| `new_event_log_block()` | the audit history, newest first |
| `new_assign_block()` | assign people and statuses in block state (no store) |

## Running scripts, and talking to other systems

Two vignettes cover the parts that leave the R session:

- `vignette("running-scripts")`: the worker, the jobs directory, retries
  and timeouts, what a script receives, and how to deploy it (cron,
  systemd, Docker, Posit Connect).
- `vignette("external-systems")`: the inbox, and how a delivery platform,
  a database trigger or a CI job moves a process forward through it, with
  idempotency and an audit trail. Plus the HTTP and pull variants.

## Demo

**[Try it live: a quarterly data collection][demo]**: eight reporting units,
real scripts running in a worker, a delivery platform writing into the inbox,
and a rework loop the diagram travels.

Open one instance: the task list unfolds per unit,
"Simulate delivery" writes an inbox message that the *worker* turns into an
event, the QA check answers `false` on its first attempt so the rework branch
opens, and after the reconciliation it answers `true`. Open a second browser
window on the same demo and you are both watching the same event log.

The same board runs locally, from the installed package:

```r
source(system.file("examples/data-collection.R", package = "blockr.process"))
```

`dev/data-collection.md` is the click script (what to show, in order) and
`dev/data-collection.R` runs the board against local source checkouts.

[demo]: https://blockr.cloud/app/data-collection

## Design notes

The BPMN half (model, interchange XML, auto-layout, widget) lives in the
`bpmn-*.R` files and depends on nothing else in the package, so it can be
lifted back out into a standalone package once the process model stops
moving. Rendering is
[bpmn-visualization](https://github.com/process-analytics/bpmn-visualization-js)
(Apache-2.0), layout is
[bpmn-auto-layout](https://github.com/bpmn-io/bpmn-auto-layout) (MIT); both
are bundled, so the diagram needs no server-side Node. See
[LICENSE.note](LICENSE.note) for the full attribution of the bundled
JavaScript.

blockr.process itself is GPL (>= 3).

The design specs behind the package (the process model, script execution,
external systems) live in cynkra's internal `blockr.design` repository under
`open/blockr-process/`.
