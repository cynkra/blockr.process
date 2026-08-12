# A person acts on a task

The other writer of the instance store. This is exactly what the tasks
block's status chip calls, and what a command line or an inbox message
ends up calling: the worker cannot tell the difference.

## Usage

``` r
process_act(
  task,
  status = "done",
  assignee = NULL,
  due = NULL,
  actor = NULL,
  store = ".runs",
  instance = "instance",
  process = NULL,
  element = NULL
)
```

## Arguments

- task:

  Task id.

- status:

  New status (\`doing\`, \`done\`, or a check's outcome label).

- assignee:

  Person the task is assigned to.

- due:

  Deadline.

- actor:

  Who wrote the event; defaults to \`assignee\`.

- store:

  Store directory.

- instance:

  Instance id.

- process:

  The definition, needed to re-arm loops.

- element:

  Element id when the task is multi-instance; \`NULL\` for single tasks.

## Value

\`status\`, invisibly.
