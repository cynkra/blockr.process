# An instance as people should see it

\[instance_table()\] with the display status computed per row: stored
terminal values stay, \`open\` rows resolve to
\`open\`/\`blocked\`/\`skipped\` through the dependency gates
(\[instance_status()\]). This is what the tasks block emits and what
downstream tables and the BPMN overlay read.

## Usage

``` r
instance_view(store = ".runs", instance = "instance", stamp = NULL)
```

## Arguments

- store:

  Store directory.

- instance:

  Instance id to filter by, or \`NULL\` for all instances.

- stamp:

  Poll counter (ignored).

## Value

The expanded instance table with \`status\` as display status.
