# The newest instance in a store

The instance id of the most recently opened instance
(\[start_instance()\] order), or \`NULL\` for a store without instances.
The instance-reading blocks accept \`instance = "latest"\` and resolve
it through this on every poll – so opening a new instance moves the
whole board to it, and the old instances stay in the log, addressable by
their id.

## Usage

``` r
instance_latest(store = ".runs")
```

## Arguments

- store:

  Store directory.
