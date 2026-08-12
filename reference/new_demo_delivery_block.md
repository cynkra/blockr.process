# Delivery platform block (demo)

The outside world, as a button. In production the platform writes a file
into the store's inbox when a unit uploads (or a database trigger does,
or a curl in a CI job); here a click writes exactly that file –
\[write_inbox_message()\], one message, named after the unit so a resend
costs nothing.

## Usage

``` r
new_demo_delivery_block(store = ".runs", instance = "instance", poll = 2, ...)
```

## Arguments

- store:

  Store directory.

- instance:

  Instance id, or \`"latest"\`.

- poll:

  Seconds between refreshes.

- ...:

  Forwarded to \[blockr.core::new_data_block()\].

## Value

A block.

## Details

Nothing here writes an event. The worker ingests the inbox on its next
tick and appends it, and within a poll the unit's Review flips from
"waiting for Data delivery" to open. When no worker is running the block
ingests the message itself and says so, because a demo that silently
does nothing teaches the wrong lesson.

Emits the deliveries table, so a table view downstream shows the
platform's side of the story.

## See also

Other demo:
[`demo_collection_process()`](https://cynkra.github.io/blockr.process/reference/demo_collection_process.md),
[`demo_collections()`](https://cynkra.github.io/blockr.process/reference/demo_collections.md),
[`demo_deliveries()`](https://cynkra.github.io/blockr.process/reference/demo_deliveries.md),
[`demo_people()`](https://cynkra.github.io/blockr.process/reference/demo_people.md),
[`demo_reporting_units()`](https://cynkra.github.io/blockr.process/reference/demo_reporting_units.md),
[`demo_worker_start()`](https://cynkra.github.io/blockr.process/reference/demo_worker_start.md),
[`new_demo_start_block()`](https://cynkra.github.io/blockr.process/reference/new_demo_start_block.md)
