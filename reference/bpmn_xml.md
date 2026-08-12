# Generate BPMN 2.0 XML from a tidy BPMN model

Produces the semantic half of a standard BPMN 2.0 interchange document
(no diagram coordinates). Use \[layout_bpmn()\] or \[write_bpmn()\] to
add auto-computed layout, or \[bpmn_widget()\] to render directly
(layout then happens in the browser).

## Usage

``` r
bpmn_xml(x, include_lanes = FALSE)
```

## Arguments

- x:

  A \[bpmn()\] model.

- include_lanes:

  Emit a \`laneSet\` from the \`lane\` column? Default \`FALSE\`: the
  bundled auto-layout library (bpmn-auto-layout 1.3.0) drops all
  sequence-flow edges when a \`laneSet\` is present, so lanes are
  currently kept out of the layout/render path. The \`lane\` column
  stays part of the tidy model.

## Value

An \`xml2::xml_document\`.
