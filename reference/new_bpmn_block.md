# BPMN block

Renders the incoming wide process table as a BPMN diagram (via the BPMN
half: auto-layout + bpmn-visualization, no watermark) with the instance
painted on: finished tasks green, \`doing\` blue, computed \`blocked\`
amber and \`skipped\` gray, and a \`assignee - due\` overlay under
assigned tasks. The data passes through unchanged, so downstream blocks
(tables, dplyr views) keep working on the same table.

## Usage

``` r
new_bpmn_block(title = "Process", ...)
```

## Arguments

- title:

  Process name shown in the exported BPMN.

- ...:

  Forwarded to \[blockr.core::new_transform_block()\].
