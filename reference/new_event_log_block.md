# Instance log block

An instance's events, newest first: the audit history. Nothing here is
ever updated or deleted; the instance columns upstream are a fold over
exactly these rows.

## Usage

``` r
new_event_log_block(store = ".runs", instance = "instance", poll = 2, ...)
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

  Forwarded to \[blockr.core::new_data_block()\].
