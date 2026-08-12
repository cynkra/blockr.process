# Add auto-computed diagram layout to a BPMN model

Runs the bundled 'bpmn-auto-layout' library (via Node.js) to add BPMN
diagram interchange (shape coordinates, edge waypoints) to the semantic
XML, so the exported file opens with a proper diagram in any BPMN tool.

## Usage

``` r
layout_bpmn(x)
```

## Arguments

- x:

  A \[bpmn()\] model or a BPMN XML string.

## Value

BPMN XML (character) including \`BPMNDiagram\` layout.
