# Ingest the inbox: turn waiting messages into events

Reads every \`\*.json\` at the top level of the inbox in name order,
applies the ones that make sense, and moves each file out of the way –
\`processed/\` when it was applied (or was a duplicate of one that was),
\`failed/\` with a \`.error\` file beside it when it can never apply.
Messages for an instance that has not been started yet stay where they
are: that is a race, not a mistake, and the next tick will get them.

## Usage

``` r
ingest_inbox(store = ".runs", quiet = FALSE)
```

## Arguments

- store:

  Store directory.

- quiet:

  Suppress messages.

## Value

The number of messages applied, invisibly.

## Details

\[run_worker()\] calls this on every tick. Call it yourself from a cron
job if your process has no scripts to run but does have an outside
world.

## Examples

``` r
store <- tempfile()
process <- data.frame(
  task = "delivery", name = "Delivery", role = "system", depends_on = ""
)
start_instance(process, instance = "2026Q1", store = store)
write_inbox_message(store, "delivery", instance = "2026Q1",
                    actor = "upload-platform", id = "d1")
ingest_inbox(store, quiet = TRUE)
instance_log(store, "2026Q1")[, c("task", "field", "value", "actor")]
#>        task    field
#> 5  delivery   status
#> 4 @instance  created
#> 3 @instance  version
#> 2 @instance elements
#> 1 @instance  process
#>                                                                           value
#> 5                                                                          done
#> 4                                                           2026-08-16T22:10:36
#> 3                                                                      0c6c4a44
#> 2                                                                {"element":[]}
#> 1 {"task":["delivery"],"name":["Delivery"],"role":["system"],"depends_on":[""]}
#>             actor
#> 5 upload-platform
#> 4           board
#> 3           board
#> 2           board
#> 1           board
```
