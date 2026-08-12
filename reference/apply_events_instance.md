# Overlay an instance's events onto an expanded instance table

The multi-instance counterpart of \[apply_events()\]: rows of an
\[expand_instance()\] table are keyed by (task, element), and so are the
events folded onto them. Single rows (no \`element\`) read the same
events \[apply_events()\] reads, so the two views can never disagree.

## Usage

``` r
apply_events_instance(
  instance_table,
  store = ".runs",
  instance = "instance",
  stamp = NULL
)
```

## Arguments

- instance_table:

  An expanded instance table (see \[expand_instance()\]).

- store:

  Store directory.

- instance:

  Instance id to filter by, or \`NULL\` for all instances.

- stamp:

  Poll counter (ignored).

## Value

\`instance_table\` with \`assignee\`, \`due\`, \`status\` folded from
the store.
