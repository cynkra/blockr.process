# An instance's expanded table, rebuilt from the store alone

\[expand_instance()\] over the stamped definition and elements, with the
events folded on (\[apply_events_instance()\]). The \`status\` column
holds the STORED status; blocked/skipped are display states, see
\[instance_view()\].

## Usage

``` r
instance_table(store = ".runs", instance = "instance", stamp = NULL)
```

## Arguments

- store:

  Store directory.

- instance:

  Instance id to filter by, or \`NULL\` for all instances.

- stamp:

  Poll counter (ignored).

## Value

The expanded instance table, or an empty data frame if the instance has
not been opened.
