# Apply instance assignments to a wide process table

The instance block's workhorse, exported because the block's expression
calls it at evaluation time. Ensures the instance columns (\`assignee\`,
\`due\`, \`status\`) exist and overrides them per task from
\`assignments\`.

## Usage

``` r
apply_assignments(df, assignments = list())
```

## Arguments

- df:

  A wide process table (one row per task).

- assignments:

  Named list: task id -\> \`list(assignee =, due =, status =)\`. Missing
  fields leave the table value untouched.

## Value

The wide table with instance columns applied.
