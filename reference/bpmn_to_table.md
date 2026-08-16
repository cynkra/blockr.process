# Convert a tidy BPMN model to a wide process-table scaffold

The inverse of \[as_bpmn()\], so a process drawn in any BPMN tool
becomes a table blockr.process can run: draw in Camunda Modeler,
\[read_bpmn()\] the file, \`bpmn_to_table()\` the model, drop the table
into a process block.

## Usage

``` r
bpmn_to_table(x)
```

## Arguments

- x:

  A \[bpmn()\] model.

## Value

A tibble with columns \`task\`, \`name\`, \`role\`, \`depends_on\`,
\`script\`, \`collection\`, \`parent\`, \`join\`, \`sequential\`.

## Details

What the inversion does: - Events and gateways disappear into the
\`depends_on\` grammar: a task behind a converging gateway depends on
everything flowing into that gateway (\`join\` records the kind –
exclusive/inclusive merge becomes \`"any"\`, a complex gateway named
\`"k of n"\` becomes \`"n=k"\`); a task behind a diverging gateway
depends on the gateway's input, qualified by the branch label
(\`"validate:yes"\`). Chains of gateways resolve through. - Lanes become
\`role\`; a lane-less script/service/send/receive task becomes \`role =
"system"\`. - Multi-instance activities are grouped back into
containers: each connected run of multi-instance nodes gets a group row
(\`collection = "item"\`, a placeholder), its members point at it via
\`parent\`, and edges crossing the group boundary are lifted onto the
group row – the inverse of the lowering \[as_bpmn()\] performs.

The result is a \*\*scaffold\*\*, not a finished definition: fill in
\`collection\` names, check the quorums, and add \`script\` values where
the XML did not carry them (files written by \[write_bpmn()\] do).

## See also

\[read_bpmn()\], \[as_bpmn()\]
