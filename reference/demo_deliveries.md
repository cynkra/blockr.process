# The deliveries table, as the board shows it

What the upload platform's own table would answer: one row per unit,
delivered or not, with the timestamp from the event log. \`stamp\` only
makes the calling expression change on every poll.

## Usage

``` r
demo_deliveries(store, instance, stamp = NULL)
```

## Arguments

- store:

  Store directory.

- instance:

  Instance id, or \`"latest"\`.

- stamp:

  Ignored; changes the call so the block re-evaluates.

## Value

A data frame with one row per unit.

## See also

Other demo:
[`demo_collection_process()`](https://cynkra.github.io/blockr.process/reference/demo_collection_process.md),
[`demo_collections()`](https://cynkra.github.io/blockr.process/reference/demo_collections.md),
[`demo_people()`](https://cynkra.github.io/blockr.process/reference/demo_people.md),
[`demo_reporting_units()`](https://cynkra.github.io/blockr.process/reference/demo_reporting_units.md),
[`demo_worker_start()`](https://cynkra.github.io/blockr.process/reference/demo_worker_start.md),
[`new_demo_delivery_block()`](https://cynkra.github.io/blockr.process/reference/new_demo_delivery_block.md),
[`new_demo_start_block()`](https://cynkra.github.io/blockr.process/reference/new_demo_start_block.md)
