# Progress of the multi-instance tasks

What the diagram shows as an overlay and the board as a bar: how many
elements of each repeated task are finished. The gate reads off this, so
"alle bearbeitet" is a count and not a special state.

## Usage

``` r
instance_counts(process, instance_table)
```

## Arguments

- process:

  The definition (for gates, loops, \`join\`, \`complete_when\` and the
  collection every task repeats over).

- instance_table:

  An expanded instance table (see \[expand_instance()\]), carrying the
  current \`status\` per row.

## Value

A data frame with \`task\`, \`total\`, \`required\`, \`done\`,
\`doing\`, \`blocked\`, \`open\`, \`pct\`, \`pct_doing\` and
\`pct_blocked\`.

## Details

\`doing\` counts the elements someone has picked up and \`blocked\` the
ones still waiting on a gate, so the bar can draw four states – not
started, waiting, in progress, done. \`open\` stays "everything not
finished" (it includes both), which is what the gate asks for.

\`required\` is how many elements the gate downstream actually waits for
– \`total\` unless the group carries a \`complete_when\` quorum. A
counter that says "9 / 12" while the gate opens at 11 would be lying by
omission.
