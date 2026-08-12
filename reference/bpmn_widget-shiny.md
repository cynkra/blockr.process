# Shiny bindings for bpmn_widget

Shiny bindings for bpmn_widget

## Usage

``` r
bpmnWidgetOutput(outputId, width = "100%", height = "420px")

renderBpmnWidget(expr, env = parent.frame(), quoted = FALSE)
```

## Arguments

- outputId:

  Output id.

- width, height:

  Widget size (CSS units).

- expr:

  Expression returning a \[bpmn_widget()\].

- env, quoted:

  Standard shiny render arguments.
