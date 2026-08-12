# An instance's events, newest first

The audit view. \`stamp\` exists only so a polling block's expression
changes when the log grows; it is otherwise ignored.

## Usage

``` r
instance_log(store = ".runs", instance = "instance", stamp = NULL)
```

## Arguments

- store:

  Store directory.

- instance:

  Instance id to filter by, or \`NULL\` for all instances.

- stamp:

  Poll counter (ignored).

## Value

A data frame.
