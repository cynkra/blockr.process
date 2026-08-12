# Example: a quarterly data collection as a wide process table

The one-table convention mid-instance: skeleton columns (\`task\`,
\`name\`, \`role\`, \`depends_on\`, \`script\`) plus instance columns
(\`assignee\`, \`due\`, \`status\`). The QA check has failed (\`status =
"false"\`), so the reconciliation branch is active and approval waits.

## Usage

``` r
example_process()
```

## Value

A data frame.
