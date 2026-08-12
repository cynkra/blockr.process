# Tasks block

An instance's task list: one section per task, one row per element for
the "per-element" tasks, with per-row assignment and a status chip that
writes \[instance_event()\]s. The toolbar filters (status, person, any
grouping column the element list carried, e.g. \`region\`) and acts on
the selection: bulk-assign, and "send back" – the rework, which reopens
exactly the checked rows and re-closes the gate downstream.

## Usage

``` r
new_tasks_block(
  store = ".runs",
  instance = "instance",
  poll = 2,
  roster = character(),
  ...
)
```

## Arguments

- store:

  Instance store directory (see \[instance_event()\]).

- instance:

  Instance id, or \`"latest"\` to follow the newest instance in the
  store (\[instance_latest()\]): opening a new instance moves the list
  to it.

- poll:

  Poll interval in seconds.

- roster:

  Characters: the people assignments can pick from (the deployment's
  register). The definition's roles are NOT offered – roles are lanes,
  not persons; without a roster the block falls back to them so a bare
  demo stays usable.

- ...:

  Forwarded to \[blockr.core::new_data_block()\].

## Details

The block emits \[instance_view()\], so downstream tables and the BPMN
diagram redraw on every event. Polling is on the log's size and mtime;
an idle board redraws nothing.
