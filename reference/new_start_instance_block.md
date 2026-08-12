# Open-instance block

Takes the process definition as its input and opens an instance from it:
pick the year (the instance id), pick a collection, click "Start
instance" – one \[start_instance()\]. Once the instance exists the card
shows its header (id, \[process_version()\], created, size) and warns
when the incoming definition no longer matches the stamped one.

## Usage

``` r
new_start_instance_block(
  store = ".runs",
  instance = "instance",
  source = "",
  sources = list(),
  poll = 2,
  class = "start_instance_block",
  ctor = sys.parent(),
  ctor_pkg = NULL,
  ...
)
```

## Arguments

- store:

  Instance store directory (see \[instance_event()\]).

- instance:

  Instance id.

- source:

  Name of the selected element list.

- sources:

  Named list of element lists: each a data frame (first column: element
  ids, e.g. units; further columns become the instance table's facets,
  an \`assignee\` column seeds assignments) or a zero-argument function
  returning one (a \`SELECT\` on the platform's database). Not
  serialized: a deployment wraps this constructor with its lists baked
  in and registers the wrapper.

- poll:

  Poll interval in seconds.

- class:

  Block S3 class. The wrapping constructor passes its own subclass (e.g.
  \`c("start_block", "start_instance_block")\`) so the registry keys on
  the wrapper.

- ctor, ctor_pkg:

  Forwarded to \[blockr.core::new_transform_block()\]; default: the
  CALLING constructor becomes the ctor of record, so its formals
  (\`store\`, \`instance\`, \`source\`, \`poll\`) define the block's
  state.

- ...:

  Forwarded to \[blockr.core::new_transform_block()\].

## Details

The block emits \[instance_view()\], the expanded instance table.

## Not registered directly

This is a factory in the spirit of the JS-block factories: \`sources\`
holds data (or query functions) that cannot serialize, so a deployment
MUST wrap it in its own constructor – with the lists baked in – and
register that wrapper. See the demo's \`dcdemo::new_start_block()\`.
