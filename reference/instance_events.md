# Read an instance store's events

Read an instance store's events

## Usage

``` r
instance_events(store = ".runs", instance = NULL)
```

## Arguments

- store:

  Store directory.

- instance:

  Instance id to filter by, or \`NULL\` for all instances.

## Value

A data frame with columns \`ts\`, \`instance\`, \`task\`, \`field\`,
\`value\`, \`actor\`, \`element\` (\`NA\` for single-task events and old
logs) and \`ref\` (\`NA\` unless the event came in from a named
message).
