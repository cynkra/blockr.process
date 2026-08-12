# The required count behind a quorum spec

One grammar for the two places a process table says "how many is
enough": \`join\` on a task with several dependencies, and
\`complete_when\` on a multi-instance container. Both answer the same
question against a different \`n\` – how many dependencies, how many
elements.

## Usage

``` r
process_quorum(spec, n)
```

## Arguments

- spec:

  A quorum spec (character scalar, \`NA\` reads as \`""\`).

- n:

  How many candidates there are.

## Value

An integer: how many must be met.

## Details

\| spec \| meaning \| \|—\|—\| \| \`""\`, \`"all"\` \| every one (the
default) \| \| \`"any"\` \| the first one \| \| \`"n=3"\`, \`"3"\` \|
three of them, capped at \`n\` \| \| \`"pct=90"\`, \`"90

In BPMN terms \`all\` is a parallel gateway (or a plain multi-instance
completion), \`any\` an exclusive merge, and a count or percentage a
complex gateway / a \`completionCondition\` over
\`numberOfCompletedInstances\`.
