# Write a tidy BPMN model to a .bpmn file

Write a tidy BPMN model to a .bpmn file

## Usage

``` r
write_bpmn(x, path, layout = TRUE)
```

## Arguments

- x:

  A \[bpmn()\] model.

- path:

  Output file path (conventionally \`.bpmn\`).

- layout:

  Add auto-computed diagram layout (needs Node.js)? If \`FALSE\`, only
  the semantic XML is written.

## Value

\`path\`, invisibly.
