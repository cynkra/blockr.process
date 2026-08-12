# The start-instance block with the demo's lists baked in

\[new_start_instance_block()\] takes \`sources\`; functions and data
frames passed by hand do not survive a board save, so a deployment
registers a wrapper like this one and board restore goes through it.

## Usage

``` r
new_demo_start_block(
  store = ".runs",
  instance = "2026Q1",
  source = "",
  poll = 2,
  ...
)
```

## Arguments

- store:

  Instance store directory (see \[instance_event()\]).

- instance:

  Instance id.

- source:

  Name of the selected element list.

- poll:

  Poll interval in seconds.

- ...:

  Forwarded to \[new_start_instance_block()\].

## Value

A block.

## See also

Other demo:
[`demo_collection_process()`](https://cynkra.github.io/blockr.process/reference/demo_collection_process.md),
[`demo_collections()`](https://cynkra.github.io/blockr.process/reference/demo_collections.md),
[`demo_deliveries()`](https://cynkra.github.io/blockr.process/reference/demo_deliveries.md),
[`demo_people()`](https://cynkra.github.io/blockr.process/reference/demo_people.md),
[`demo_reporting_units()`](https://cynkra.github.io/blockr.process/reference/demo_reporting_units.md),
[`demo_worker_start()`](https://cynkra.github.io/blockr.process/reference/demo_worker_start.md),
[`new_demo_delivery_block()`](https://cynkra.github.io/blockr.process/reference/new_demo_delivery_block.md)
