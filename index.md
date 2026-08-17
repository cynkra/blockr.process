# blockr.process

[Live demo: a quarterly data
collection](https://blockr.cloud/app/data-collection) · [Reference
documentation](https://cynkra.github.io/blockr.process/)

> Replacement of [blockr.task](https://github.com/cynkra/blockr.task)
>
> The API is still moving: function names, column names and the block
> interface may change.

A process definition is a data frame, one row per task. The columns say
who acts, what the task waits for, and whether a script does it instead
of a person.

``` r

process <- data.frame(
  task        = c("deliver", "validate", "review",  "approve"),
  name        = c("Delivery", "Validate", "Review",  "Approve"),
  role        = c("system",   "system",   "analyst", "management"),
  depends_on  = c("",         "deliver",  "validate", "review"),
  script      = c("",         "validate.R", "",      "")
)
```

[`start_instance()`](https://cynkra.github.io/blockr.process/reference/start_instance.md)
opens an instance of a definition and writes an append-only event log. A
click in the task list, a script the worker ran, a message from another
system: each is one appended line. Current state is the latest event per
(task, element, field), so the log is also the audit trail.

[`run_worker()`](https://cynkra.github.io/blockr.process/reference/run_worker.md)
is a headless R process. It runs the tasks that have a `script`, and
ingests the JSON files other systems drop into the inbox. Shiny sessions
hold no workflow state.

       definition            instance                    execution
       ──────────            ────────                    ─────────
       a wide table   ──►    events.jsonl        ◄──     worker (a plain
       in git or a           append-only, one            R process; runs the
       process block         line per event              script tasks)
                                  ▲
                                  │
                             inbox/*.json  ◄── other systems, any language

The table flows through a
[blockr](https://github.com/BristolMyersSquibb/blockr) board. The blocks
edit the definition, work the task list, draw the BPMN diagram and read
the log; any other blockr block also applies. A
`dplyr::filter(assignee == "ana")` block is one person’s task list.

## Installation

``` r

# install.packages("pak")
pak::pak("cynkra/blockr.process")
```

## Quick start

``` r

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

## Columns

Naming follows BPMN 2.0: process, task, lane, multi-instance,
collection, element, instance, assignee. Only `task` and `name` are
required.

| column | what it says |
|----|----|
| `task`, `name` | the id and the label |
| `role` | who may act. Becomes a lane; `system` means nobody |
| `depends_on` | flow, comma separated. `qa_check:false` waits for an outcome |
| `script` | `forecast.R` (a file in the jobs directory) or `mypkg::forecast` (a function in an allowed package); the worker runs it |
| `collection` | this row is a multi-instance group, repeating per element |
| `parent` | which group a task is in |
| `join` | how many dependencies are enough: `all`, `any`, `n=3`, `pct=90` |
| `complete_when` | how many elements close a group |
| `sequential` | elements run one at a time |
| `retry`, `timeout`, `params` | how the worker runs a script |

`depends_on` is flow (a DAG over tasks), `parent` is scope (a tree),
`collection` is repetition (a property of one row). The three never
overlap. A dependency may name a group, in either direction; BPMN
forbids a sequence flow across a sub-process boundary, so container
edges are lowered onto the group’s entries and exits before anything
reads the table.

## Blocks

| block | what it does |
|----|----|
| [`new_process_block()`](https://cynkra.github.io/blockr.process/reference/new_process_block.md) | the editor: the list is the process, with a rail drawing the flow |
| [`new_start_instance_block()`](https://cynkra.github.io/blockr.process/reference/new_start_instance_block.md) | open an instance from a definition and an element list |
| [`new_tasks_block()`](https://cynkra.github.io/blockr.process/reference/new_tasks_block.md) | the task list: chips, filters, assignment. Writes events |
| [`new_bpmn_block()`](https://cynkra.github.io/blockr.process/reference/new_bpmn_block.md) | the diagram, status painted on. Passes the table through |
| `new_instance_state_block()` | fold a store onto an incoming definition, live |
| [`new_event_log_block()`](https://cynkra.github.io/blockr.process/reference/new_event_log_block.md) | the audit history, newest first |
| [`new_assign_block()`](https://cynkra.github.io/blockr.process/reference/new_assign_block.md) | assign people and statuses in block state (no store) |

The diagram is derived from the columns: start and end events, gateways,
lanes and multi-instance markers follow from `depends_on`, `role`,
`collection` and `parent`.

## Vignettes

- [`vignette("running-scripts")`](https://cynkra.github.io/blockr.process/articles/running-scripts.md):
  the worker, the jobs directory, retries and timeouts, what a script
  receives, and how to deploy it (cron, systemd, Docker, Posit Connect).
- [`vignette("external-systems")`](https://cynkra.github.io/blockr.process/articles/external-systems.md):
  the inbox, and how a delivery platform, a database trigger or a CI job
  moves a process forward through it, with idempotency and an audit
  trail. Plus the HTTP and pull variants.

## Demo

[The live demo](https://blockr.cloud/app/data-collection) is a quarterly
data collection over eight reporting units, with a worker running the
scripts, a delivery platform writing into the inbox, and a rework loop.
The same board runs locally:

``` r

source(system.file("examples/data-collection.R", package = "blockr.process"))
```

`dev/data-collection.md` is the click script (what to show, in order),
`dev/data-collection.R` runs the board against local source checkouts.

## Design notes

The BPMN half (model, interchange XML, auto-layout, widget) lives in the
`bpmn-*.R` files and depends on nothing else in the package, so it can
be lifted out into a package of its own once the process model stops
moving. Rendering is
[bpmn-visualization](https://github.com/process-analytics/bpmn-visualization-js)
(Apache-2.0), layout is
[bpmn-auto-layout](https://github.com/bpmn-io/bpmn-auto-layout) (MIT);
both are bundled, so the diagram needs no server-side Node. See
[LICENSE.note](https://cynkra.github.io/blockr.process/LICENSE.note) for
the attribution of the bundled JavaScript.

blockr.process itself is GPL (\>= 3).

The design specs behind the package (the process model, script
execution, external systems) live in cynkra’s internal `blockr.design`
repository under `open/blockr-process/`.
