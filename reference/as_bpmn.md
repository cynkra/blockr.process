# Convert a wide process table to a tidy BPMN model

The wide table is the "one table" convention: one row per process task,
skeleton columns describing the task, optional instance columns
(\`assignee\`, \`due\`, \`status\`) describing a run. \`as_bpmn()\`
reads only the skeleton columns.

## Usage

``` r
as_bpmn(df, name = "Process", external = NULL)
```

## Arguments

- df:

  Data frame with at least \`task\` and \`name\` columns; \`role\`,
  \`depends_on\`, \`script\`, \`parent\`, \`collection\`, \`join\`,
  \`complete_when\` and \`sequential\` are used when present.

- name:

  Process name.

- external:

  Optional label of the external pool the inbox messages come from (e.g.
  \`"Reporting unit"\`). When set, every receive task (\`role ==
  "system"\` without a script) gets a message flow from a collapsed pool
  of that name, so the diagram shows where the process touches the
  outside world. \`NULL\` (the default) draws no pool.

## Value

A \[bpmn()\] model.

## Details

Conventions: - \`role == "system"\` becomes a script task when
\`script\` is set, and a \*\*receive task\*\* when it is not: a system
task without a script is completed by an inbox message (see
\`vignette("external-systems")\`), and the envelope marker says so. Any
other non-empty role becomes a user task; empty role a plain task. - A
row with a non-empty \`collection\` is a \*\*multi-instance
sub-process\*\* (see \[process_groups()\]), not work of its own: it is
dropped from the diagram and the rows whose \`parent\` names it are
marked multi-instance instead, which is the \`\|\|\|\` marker on the
activity. - \`depends_on\` is comma-separated. A dependency may qualify
the outcome it waits for: \`"qacheck:true"\`. The qualifier becomes the
label on the arrow (\`true\`/\`false\` is the convention for binary
checks). - A dependency may name a \*\*container\*\*, in either
direction: \`"each_g"\` waits for the sub-process to complete, and a
container's own \`depends_on\` gates its members. Sequence flow may not
cross a sub-process boundary in BPMN, so \[process_body()\] lowers
container edges onto the members before anything else reads them (see
there). - Start and end events are synthesized: tasks without
dependencies hang off a start event, tasks nothing depends on flow into
an end event. - Fan-in of more than one (non-loop) dependency
synthesizes a join gateway. \`join\` on the waiting row says which kind:
\`all\` (the default, a parallel gateway), \`any\`, or a quorum like
\`n=3\` / \`pct=90\` (see \[process_quorum()\]). Loop-back edges (a
dependency that is itself reachable from the task) stay direct arrows,
so rework loops render as loops.
