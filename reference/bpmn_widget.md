# Render a tidy BPMN model as an interactive diagram

An htmlwidget: auto-layout (bpmn-auto-layout) and rendering
(bpmn-visualization, Apache-2.0) both run in the browser, so no Node.js
is needed for display. Pan and zoom are enabled.

## Usage

``` r
bpmn_widget(
  x,
  status = NULL,
  overlays = NULL,
  width = "100%",
  height = NULL,
  elementId = NULL
)
```

## Arguments

- x:

  A \[bpmn()\] model.

- status:

  Optional named character vector/list: node id -\> status. \`open\`,
  \`doing\`, \`blocked\`, \`skipped\` get dedicated colours; any other
  value (\`done\`, \`true\`, \`false\`, ...) is painted as finished.

- overlays:

  Optional named character vector/list: node id -\> small label rendered
  under the node (e.g. \`"ana · 08-15"\`).

- width, height:

  Widget size (CSS units).

- elementId:

  Optional DOM id.

## Value

An htmlwidget.
