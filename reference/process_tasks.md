# Per-task metadata for a wide process table

The machine-readable reading of the table that run UIs and status
computation share: for every task its gates (non-loop dependencies with
optional outcome label), loop-back dependencies, and the outcome labels
other tasks consume from it (non-empty marks the task as a check).

## Usage

``` r
process_tasks(df)
```

## Arguments

- df:

  A wide process table (see \[as_bpmn()\] for the conventions).

## Value

A list (one element per task) of lists with \`task\`, \`name\`,
\`role\`, \`script\`, \`per\` (the collection it repeats over, \`""\`
for single tasks), \`join\` (the fan-in quorum spec), \`assignee\`,
\`due\`, \`status\`, \`gates\` (list of \`list(on, label)\`), \`loops\`
(character), \`outcomes\` (character). Multi-instance group rows are
containers, not tasks, and are left out.
