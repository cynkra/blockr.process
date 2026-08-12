# Re-arm the checks a just-finished task loops back into

The rework rule: \`reconcile\` finishes, so \`qa_check\` – which already
holds a terminal \`false\` – goes back to \`open\` and is run again.
Without this a loop is drawn but never travelled.

## Usage

``` r
rearm_loops(
  df,
  finished,
  store = ".runs",
  instance = "instance",
  element = NULL
)
```

## Arguments

- df:

  The table with the instance applied.

- finished:

  Task that just reached a terminal status.

- store:

  Store directory.

- instance:

  Instance id.

- element:

  Element the task belongs to, or \`NULL\` for single tasks. Loops
  inside a multi-instance group are re-armed per element: sending one
  region back must not re-open the checks of the others.

## Value

Character vector of re-armed task ids, invisibly.
