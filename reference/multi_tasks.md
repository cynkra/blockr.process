# Which tasks of a definition are multi-instance?

The dimension every task repeats over, resolved through the group it
sits in (see \[process_groups()\]). Group rows are containers and answer
\`""\`, same as a single task.

## Usage

``` r
multi_tasks(process)
```

## Arguments

- process:

  A wide process table.

## Value

Named character vector: task id -\> dimension (\`""\` for single).
