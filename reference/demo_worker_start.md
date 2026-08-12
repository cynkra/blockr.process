# Run the demo's worker in a background process

A hosting convenience, and the one place the demo bends its own rule:
the design says the worker lives outside the app (see
\`vignette("running-scripts")\`), because a live Shiny session must
never hold workflow state. A hosted demo has nowhere else to put it, so
the app starts one and the container's lifetime bounds it.

## Usage

``` r
demo_worker_start(store, jobs, tick = 2)
```

## Arguments

- store:

  Store directory.

- jobs:

  Directory holding the scripts.

- tick:

  Seconds between polls while no instance is open.

## Value

The \[callr::r_bg()\] process, invisibly, or \`NULL\` if none was
started.

## Details

The supervising loop exists because the demo starts with no instance:
\[run_worker()\] needs a definition, so this waits for one to appear,
works it to completion, and goes back to waiting – which is also what
makes the "Reset demo" button leave a working board behind.

Does nothing (returning \`NULL\`) if a worker already holds the store's
lock, so it is safe to call once per session in a container that serves
several.

The handle is kept in an internal environment as well as returned,
because processx kills a background process when its handle is garbage
collected – and the natural way to call this, as one statement in an app
script, keeps no reference at all.

## See also

Other demo:
[`demo_collection_process()`](https://cynkra.github.io/blockr.process/reference/demo_collection_process.md),
[`demo_collections()`](https://cynkra.github.io/blockr.process/reference/demo_collections.md),
[`demo_deliveries()`](https://cynkra.github.io/blockr.process/reference/demo_deliveries.md),
[`demo_people()`](https://cynkra.github.io/blockr.process/reference/demo_people.md),
[`demo_reporting_units()`](https://cynkra.github.io/blockr.process/reference/demo_reporting_units.md),
[`new_demo_delivery_block()`](https://cynkra.github.io/blockr.process/reference/new_demo_delivery_block.md),
[`new_demo_start_block()`](https://cynkra.github.io/blockr.process/reference/new_demo_start_block.md)
