# Combine per-gate verdicts into a display status

The one rule both \[process_status()\] and its multi-instance
counterpart in blockr.process apply, so that \`all\` and a quorum differ
in a number and nowhere else: reach the quorum and the task is ready;
fall short of it even if everything still open went your way and it can
never be reached, so the task is skipped; otherwise wait.

## Usage

``` r
process_gate_status(met, pending, need)
```

## Arguments

- met, pending:

  How many gates are satisfied, how many may still be.

- need:

  The quorum (\[process_quorum()\]).

## Value

\`"open"\`, \`"blocked"\` or \`"skipped"\`.
