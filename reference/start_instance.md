# Open an instance: stamp definition and elements into the store

Writes the \`@instance\` events that make an instance self-contained:
the definition as opened (field \`process\`), the element list (field
\`elements\`), the definition's \[process_version()\] (field
\`version\`) and a \`created\` mark. Everything after this moment is
ordinary events on the instance's rows.

## Usage

``` r
start_instance(
  process,
  elements = character(),
  instance = "instance",
  store = ".runs",
  actor = "board"
)
```

## Arguments

- process:

  A wide process table (the definition).

- elements:

  Character vector of element ids, or a data frame whose first column
  holds them plus grouping columns (e.g. \`region\`) carried into the
  instance table. An \`assignee\` column seeds the assignment: every
  human multi-instance task of that element gets a \`assignee\` event
  (actor \`register\`) – the "assignment comes from the register"
  answer. A list without the column leaves everything in the pool.

- instance:

  Instance id (a period: "2026Q1", "2026").

- store:

  Store directory.

- actor:

  Assignee opened the instance.

## Value

The instance id, invisibly.
