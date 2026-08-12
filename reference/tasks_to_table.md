# Turn a tasks list into the wide process table

Exported because the process block's expression calls it at evaluation
time. Tolerant of partially-edited tasks: missing fields become empty
strings, tasks without an id are dropped.

## Usage

``` r
tasks_to_table(tasks = list())
```

## Arguments

- tasks:

  List of \`list(task =, name =, role =, dep =, parent =, collection =,
  script =, join =, complete_when =, sequential =)\`. A task with a
  non-empty \`collection\` is a multi-instance sub-process – a
  container, not work – and the tasks whose \`parent\` names it run once
  per element of that collection (see \[process_groups()\]). The value
  of \`collection\` names the collection \*type\* (\`unit\`); the
  concrete list is instance data, bound when an instance starts.

  \`join\`, \`complete_when\` and \`sequential\` are the optional
  columns: they only reach the table when at least one task sets them,
  so a process that takes every default still reads as seven columns.

## Value

The wide process table (a data frame).
