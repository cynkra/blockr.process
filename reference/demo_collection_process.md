# The quarterly data collection, as the process editor would emit it

Eight reporting units send in a file; each file is validated by a script
and reviewed by a person; when they are all through, the data is
approved, consolidated, QA-checked, and published as a forecast.

## Usage

``` r
demo_collection_process()
```

## Value

A wide process table; see \[as_bpmn()\] for the column contract.

## Details

The part that repeats sits inside a multi-instance sub-process,
\`each_unit\`, which is the one place the collection is named.
Everything after it runs once, and the first of those – Approve data –
waits for \`each_unit\` itself, not for one of its rows: that is the
parallel join where the sub-process closes, and naming the container is
what BPMN means by a sequence flow that does not cross the boundary.

Three kinds of row, and the demo turns on the difference:

\- \*\*\`delivery\`\*\* is \`system\` with NO script. Nobody can tick it
and the worker cannot run it: it is done when the outside world says so,
which is an inbox message (see \[ingest_inbox()\]). - \*\*\`validate\`,
\`consolidate\`, \`qa_check\`, \`forecast\`\*\* are \`system\` WITH a
script. The worker runs them; \`validate\` sits inside the group, so it
runs once per unit. - everything else has a role, and roles are roles: a
person picks the task up in the task list. Who that person is, is
instance data.

\`qa_check\` answers \`true\` or \`false\` on stdout, so the branch is
in the table rather than in an if-statement, and \`reconcile\` loops
back into it: the rework a DAG cannot express.

## See also

Other demo:
[`demo_collections()`](https://cynkra.github.io/blockr.process/reference/demo_collections.md),
[`demo_deliveries()`](https://cynkra.github.io/blockr.process/reference/demo_deliveries.md),
[`demo_people()`](https://cynkra.github.io/blockr.process/reference/demo_people.md),
[`demo_reporting_units()`](https://cynkra.github.io/blockr.process/reference/demo_reporting_units.md),
[`demo_worker_start()`](https://cynkra.github.io/blockr.process/reference/demo_worker_start.md),
[`new_demo_delivery_block()`](https://cynkra.github.io/blockr.process/reference/new_demo_delivery_block.md),
[`new_demo_start_block()`](https://cynkra.github.io/blockr.process/reference/new_demo_start_block.md)
