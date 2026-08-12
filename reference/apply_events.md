# Overlay an instance's events onto a process definition

The counterpart of \[apply_assignments()\]: same result shape, but the
instance columns come from the store instead of from block state.
Exported because the instance state block's expression calls it at
evaluation time.

## Usage

``` r
apply_events(df, store = ".runs", instance = "instance", stamp = NULL)
```

## Arguments

- df:

  A wide process table (the definition).

- store:

  Store directory.

- instance:

  Instance id to filter by, or \`NULL\` for all instances.

- stamp:

  Poll counter (ignored).

## Value

The wide table with \`assignee\`, \`due\`, \`status\` and \`instance\`
applied.
