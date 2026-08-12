# Append one event to an instance store

The only writer. Both the worker and the people write here, which is why
\`actor\` is recorded separately from \`assignee\`: \`assignee\` is
whose task it is, \`actor\` is assignee moved it.

## Usage

``` r
instance_event(
  task,
  field,
  value,
  actor = "worker",
  store = ".runs",
  instance = "instance",
  ts = format(Sys.time(), "%Y-%m-%dT%H:%M:%S"),
  element = NULL,
  ref = NULL
)
```

## Arguments

- task:

  Task id.

- field:

  Field the event sets: \`assignee\`, \`due\`, \`status\`, or any
  bookkeeping field the worker records (\`log\`, \`took\`, \`attempt\`).

- value:

  New value.

- actor:

  Assignee or what wrote this event.

- store:

  Store directory.

- instance:

  Instance id.

- ts:

  Timestamp.

- element:

  Element id for multi-instance tasks (the per-element rows, see
  \[expand_instance()\]); \`NULL\` for single tasks. Written to the log
  only when set, so single-element stores stay byte-identical.

- ref:

  Where this event came from, when it came from somewhere with a name:
  the inbox message file, a ticket id, a request id. Written only when
  set. \`actor\` says which system spoke, \`ref\` says which of its
  messages this was – together they make an event traceable back out of
  the process into the system that caused it.

## Value

\`value\`, invisibly.
