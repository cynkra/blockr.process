# Instance block (JS-driven)

The skeleton brought to life: receives the wide process table, lets
people assign \`assignee\`, \`due\` and advance \`status\` per task, and
emits the table with the instance columns applied. Statuses \`blocked\`
and \`skipped\` are computed from the dependency gates, never stored.
Tasks whose outcome other tasks consume (checks) finish with an outcome
label (\`true\`/\`false\` by convention) instead of \`done\`.

## Usage

``` r
new_assign_block(assignments = list(), ...)
```

## Arguments

- assignments:

  Named list: task id -\> \`list(assignee =, due =, status =)\`.

- ...:

  Forwarded to \[blockr.core::new_transform_block()\].

## Details

The control UI is a JavaScript task list (\`inst/js/assign-block.js\`);
R receives the assignments as JSON and turns them into an
\[apply_assignments()\] expression.

\`assignee\` is a free-text field unless the incoming column is a
\*\*factor\*\*, in which case its levels are the roster and the field
becomes a picker. The allowed values are a property of the data, not of
this block: declare them upstream with a stock mutate block, \`assignee
= factor(NA_character\_, levels = c("ana", "ben"))\`.
