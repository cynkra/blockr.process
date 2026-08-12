# Instance state block

Overlays an instance store onto the incoming process definition: the
instance columns (\`assignee\`, \`due\`, \`status\`) come from the
append-only log, so the board shows what the worker and the people have
actually done, live.

## Usage

``` r
new_runstate_block(store = ".runs", instance = "instance", poll = 2, ...)
```

## Arguments

- store:

  Instance store directory (see \[instance_event()\]).

- instance:

  Instance id, or \`"latest"\` to follow the newest instance in the
  store.

- poll:

  Poll interval in seconds.

- ...:

  Forwarded to \[blockr.core::new_transform_block()\].

## Details

Polling is on the log's size and mtime, so an idle board redraws
nothing. The poll counter rides along in the block's expression as
\`stamp\`, which is what makes the board re-evaluate when the log grows.
A database-backed store would push instead.
