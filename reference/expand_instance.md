# Expand a definition into the instance-shaped table

One row per (element, task) for multi-instance tasks, one row per task
with \`element = NA\` for the rest. This is what the instance store's
events are folded onto and what the task lists show; the definition
itself never grows.

## Usage

``` r
expand_instance(process, elements = character(), instance = "instance")
```

## Arguments

- process:

  A wide process table (the definition).

- elements:

  Character vector of element ids (e.g. units), or a data frame whose
  first column holds them plus any grouping columns (e.g. \`region\`) to
  carry along.

- instance:

  Instance id.

## Value

A data frame with the definition columns plus \`instance\`, \`element\`
and the instance columns \`assignee\`, \`due\`, \`status\`. The
sub-process containers are gone – they are structure, not work – and
each row carries its resolved dimension in \`per\`, so the expanded
table answers "what does this repeat over" without the definition beside
it.
