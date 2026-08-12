# Example: quarterly data collection as a BPMN model

The same story as \[example_process()\], one level down: the tidy BPMN
model a wide table compiles to. Delivery, validation, a QA gateway with
a correction loop, approval, publication. Lanes are roles, never people
– people change, roles do not.

## Usage

``` r
example_quarterly()
```

## Value

A \[bpmn()\] model.
