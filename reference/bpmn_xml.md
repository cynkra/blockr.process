# Generate BPMN 2.0 XML from a tidy BPMN model

Produces the semantic half of a standard BPMN 2.0 interchange document
(no diagram coordinates). Use \[layout_bpmn()\] or \[write_bpmn()\] to
add auto-computed layout, or \[bpmn_widget()\] to render directly
(layout then happens in the browser).

## Usage

``` r
bpmn_xml(x, include_lanes = TRUE)
```

## Arguments

- x:

  A \[bpmn()\] model.

- include_lanes:

  Emit a \`laneSet\` from the \`lane\` column? Default \`TRUE\`. Nodes
  without a lane (synthesized gateways, start/end events) inherit the
  lane of a neighbour, majority of predecessors first. The bundled
  auto-layout library (bpmn-auto-layout 1.3.0) drops all sequence-flow
  edges when a \`laneSet\` is present, so the layout paths
  (\[layout_bpmn()\] and the widget) strip the lanes before laying out
  and band the result back into lanes afterwards.

## Value

An \`xml2::xml_document\`.
