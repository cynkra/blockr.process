# Write one inbox message

The R-side sender, useful from a scheduled script, a test, or a demo
block standing in for a real platform. Any other language does the same
thing by writing the same JSON: write to a temporary name in the same
directory, then rename, so the ingester never sees a half-written file.

## Usage

``` r
write_inbox_message(
  store = ".runs",
  task,
  value = "done",
  field = "status",
  element = NULL,
  instance = "latest",
  actor = "external",
  id = NULL
)
```

## Arguments

- store:

  Store directory.

- task:

  Task the message is about.

- value:

  New value (default \`"done"\`).

- field:

  Field it sets (default \`"status"\`).

- element:

  Element id for a multi-instance task; \`NULL\` for single tasks.

- instance:

  Instance id, or \`"latest"\`.

- actor:

  Who is speaking – the name of the sending system. It ends up in the
  audit trail, so use the system's name, not a person's.

- id:

  Message id. Becomes the file name and is the idempotency key; defaults
  to a timestamped one. Give it a stable, meaningful id
  (\`delivery-2026Q1-northside\`) and a resend is free.

## Value

The path written, invisibly.

## Examples

``` r
store <- tempfile()
write_inbox_message(store, "delivery", element = "northside",
                    actor = "upload-platform", id = "delivery-northside")
```
