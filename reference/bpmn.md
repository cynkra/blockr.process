# Create a tidy BPMN model

A BPMN process model as two data frames: one row per node (events,
tasks, gateways), one row per sequence flow (the arrows). This is the
tidy counterpart of the semantic half of a BPMN 2.0 XML file. Layout
(the "diagram interchange" half) is computed automatically and is never
part of the model.

## Usage

``` r
bpmn(nodes, flows, name = "Process", messages = NULL)
```

## Arguments

- nodes:

  Data frame with columns \`id\`, \`name\`, \`type\` and optionally
  \`lane\`, \`script\` (what a script task runs, kept for round-tripping
  through \[bpmn_to_table()\]), \`multi\` (logical: draw the activity as
  multi-instance, the \`\|\|\|\` marker) and \`multi_seq\` (logical:
  that multi-instance runs its elements one at a time, BPMN
  \`isSequential\`, drawn as the \`≡\` marker). Recognized types
  (aliases in parentheses): \`startEvent\` (\`start\`), \`endEvent\`
  (\`end\`), \`task\`, \`userTask\` (\`user\`), \`serviceTask\`
  (\`service\`), \`scriptTask\` (\`script\`), \`manualTask\`
  (\`manual\`), \`sendTask\` (\`send\`), \`receiveTask\` (\`receive\`, a
  task an incoming message completes), \`exclusiveGateway\`
  (\`gateway\`, \`xor\`), \`parallelGateway\` (\`parallel\`, \`and\`),
  \`inclusiveGateway\` (\`inclusive\`, \`or\`), \`complexGateway\`
  (\`complex\`, the quorum join).

- flows:

  Data frame with columns \`from\`, \`to\` and optionally \`name\` (the
  label on the arrow, e.g. a gateway condition).

- name:

  Process name.

- messages:

  Optional data frame with columns \`from\` and \`to\`: message flows
  between the process and the outside world. Exactly one side of each
  row must be a node id; the other side is the label of an external pool
  (drawn collapsed), e.g. \`data.frame(from = "Reporting unit", to =
  "deliver")\` for an incoming delivery. An optional \`name\` column
  labels the flow.

## Value

A \`bpmn\` object: a list with \`nodes\`, \`flows\`, \`name\` and
\`messages\` (\`NULL\` when there are none).

## Examples

``` r
m <- bpmn(
  nodes = data.frame(
    id = c("a", "b", "c"),
    name = c("Start", "Do work", "Done"),
    type = c("start", "task", "end")
  ),
  flows = data.frame(from = c("a", "b"), to = c("b", "c"))
)
m
#> <bpmn> Process: 3 node(s), 2 flow(s)
#> 
#> Nodes:
#> # A tibble: 3 × 7
#>   id    name    type       lane  script multi multi_seq
#>   <chr> <chr>   <chr>      <chr> <chr>  <lgl> <lgl>    
#> 1 a     Start   startEvent NA    NA     FALSE FALSE    
#> 2 b     Do work task       NA    NA     FALSE FALSE    
#> 3 c     Done    endEvent   NA    NA     FALSE FALSE    
#> 
#> Flows:
#> # A tibble: 2 × 3
#>   from  to    name 
#>   <chr> <chr> <chr>
#> 1 a     b     NA   
#> 2 b     c     NA   
```
