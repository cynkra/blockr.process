# What is each blocked row waiting on?

For every row of an expanded instance whose display status is
\`blocked\`, the task id of the first unmet dependency – which is how
the task list can say "waiting for delivery" instead of a bare
"blocked". \`NA\` for rows that are not blocked.

## Usage

``` r
instance_waiting(process, instance_table)
```

## Arguments

- process:

  The definition (for gates, loops, \`join\`, \`complete_when\` and the
  collection every task repeats over).

- instance_table:

  An expanded instance table (see \[expand_instance()\]), carrying the
  current \`status\` per row.

## Value

Character vector, one entry per row of \`instance_table\`.
