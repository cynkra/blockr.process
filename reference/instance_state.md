# Fold an instance's events into per-task state

Fold an instance's events into per-task state

## Usage

``` r
instance_state(store = ".runs", instance = "instance")
```

## Arguments

- store:

  Store directory.

- instance:

  Instance id to filter by, or \`NULL\` for all instances.

## Value

Named list: key -\> list of field -\> latest value, where the key is the
task id, or \`task@instance\` for multi-instance events.
