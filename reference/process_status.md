# Computed display status for every task of a wide process table

Stored status wins when it is anything but \`open\` (\`doing\`,
\`done\`, or an outcome label – any non-open value means the task has
life). For \`open\` tasks the gates decide: a gate whose dependency
finished with the outcome it asked for is met, one that finished with
another outcome never will be, and an unfinished one may still go either
way. How many have to be met is the row's \`join\` quorum, \`all\` by
default (\[process_quorum()\]). Loop-back dependencies never block.

## Usage

``` r
process_status(df)
```

## Arguments

- df:

  A wide process table.

## Value

Named character vector: task -\> display status.
