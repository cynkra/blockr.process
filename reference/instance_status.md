# Status of every row of an expanded instance

The multi-instance counterpart of \[process_status()\]. Stored status
wins when it is anything but \`open\`; for \`open\` rows the gates
decide, resolved per the three cases above. How many gates have to be
met is the row's \`join\` quorum, \`all\` by default. Loop-back
dependencies never block, same rule as the single-element case.

## Usage

``` r
instance_status(process, instance_table)
```

## Arguments

- process:

  The definition (for gates, loops, \`join\`, \`complete_when\` and the
  collection every task repeats over).

- instance_table:

  An expanded instance table (see \[expand_instance()\]), carrying the
  current \`status\` per row.

## Value

Character vector, one entry per row of \`instance_table\`: \`open\` (=
ready), \`doing\`, \`blocked\`, \`skipped\`, or a terminal value.
