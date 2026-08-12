# Talking to other systems

Half of what a real process waits for happens somewhere else: a file
lands on an upload platform, a nightly load finishes, a ticket closes, a
lab returns a result. None of that is a click in your app.

The event log **is** the API. Current state is a fold over an
append-only list of events, so causing an event is the only thing an
outside system ever needs to do.

## The inbox

One message per file, dropped into `<store>/inbox/`:

``` json
{"instance": "2026Q1", "task": "delivery", "element": "Northgate",
 "field": "status", "value": "done", "actor": "delivery-platform"}
```

Only `task` is required. `instance` defaults to `"latest"`, `field` to
`"status"`, `value` to `"done"`, `actor` to `"external"`, so the
smallest useful message is `{"task": "delivery"}`.

Nothing but a directory is involved: no server, no port, no token store,
no dependency. Every language can write a file, and it works over any
shared or synced mount. What it costs is that **the filesystem is the
authentication**: whoever may write into the inbox may move a process
forward. That is the same trust as “whoever may INSERT into the events
table”; enforce it with directory permissions.

## End to end

``` r

store <- tempfile()

process <- data.frame(
  task       = c("each_unit", "delivery", "review", "approve"),
  name       = c("for each unit", "Data delivery", "Review", "Approve"),
  role       = c("", "system", "analyst", "management"),
  depends_on = c("", "", "delivery", "each_unit"),
  collection = c("unit", "", "", ""),
  parent     = c("", "each_unit", "each_unit", "")
)

start_instance(process, c("north", "south"), "2026Q1", store)
```

`delivery` is `system` **with no script**: the worker will not run it
(no script) and the task list will not let anyone tick it (role
`system`), so the only thing that can complete it is a message from
outside. That is the convention for a task that waits on the outside
world: BPMN’s receive task.

The platform delivers `north`:

``` r

write_inbox_message(
  store, task = "delivery", element = "north", instance = "2026Q1",
  actor = "delivery-platform", id = "delivery-2026Q1-north"
)

ingest_inbox(store)
#> inbox: delivery-2026Q1-north.json -> delivery@north status=done
```

``` r

tab <- instance_view(store, "2026Q1")
tab[, c("task", "element", "status")]
#>       task element  status
#> 1 delivery   north    done
#> 2 delivery   south    open
#> 3   review   north    open
#> 4   review   south blocked
#> 5  approve    <NA> blocked
```

`north` may be reviewed; `south` is still blocked, waiting for its own
delivery. The event says who caused it and which message it was:

``` r

instance_log(store, "2026Q1")[1, c("task", "element", "value", "actor", "ref")]
#>       task element value             actor                        ref
#> 5 delivery   north  done delivery-platform delivery-2026Q1-north.json
```

`ref` is what makes an event traceable back **out** of the process:
`actor` says which system spoke, `ref` says which of its messages this
was.

In production nobody calls
[`ingest_inbox()`](https://cynkra.github.io/blockr.process/reference/ingest_inbox.md)
by hand;
[`run_worker()`](https://cynkra.github.io/blockr.process/reference/run_worker.md)
does it on every tick. A process with no scripts at all can run
[`ingest_inbox()`](https://cynkra.github.io/blockr.process/reference/ingest_inbox.md)
from cron instead; it is an ordinary function.

## Resending is free

Networks time out and senders retry. A delivery counted twice is a wrong
process, so **the file name is the idempotency key**:

``` r

write_inbox_message(
  store, task = "delivery", element = "north", instance = "2026Q1",
  actor = "delivery-platform", id = "delivery-2026Q1-north"
)

ingest_inbox(store)
#> inbox: delivery-2026Q1-north.json already applied, ignored
sum(instance_events(store, "2026Q1")$task == "delivery")
#> [1] 1
```

One event, not two. Give a message a stable id that says what it is
about (`delivery-2026Q1-north`), and a resend costs nothing. The
duplicate is kept in `processed/` rather than deleted, because a file
someone sent is evidence.

## Three outcomes

| outcome | what happens | where the file goes |
|----|----|----|
| applied | one event is appended | `inbox/processed/` |
| impossible | nothing is written | `inbox/failed/`, with a `.error` beside it |
| early | nothing happens yet | stays in `inbox/` |

“Impossible” means it can never apply, however often it is retried: no
such task in this instance, an element that is not in the collection, an
element on a task that does not repeat, unreadable JSON. The reason is
written next to the file:

``` r

write_inbox_message(store, "delivery", element = "westside",
                    instance = "2026Q1", id = "wrong")
ingest_inbox(store, quiet = TRUE)

readLines(file.path(inbox_dir(store), "failed", "wrong.json.error"))
#> [1] "'westside' is not an element of instance '2026Q1'"
```

“Early” means the message is right but the instance has not been started
yet, a race rather than a mistake. The file stays where it is and the
next tick picks it up.

Validation is against **the instance**, not a schema: the definition an
instance was started with is stamped into its log, so the check knows
which tasks exist and which elements are real.

## Sending from somewhere else

Anything that can write a file can send a message. Write to a temporary
name in the same directory and rename, so a half-written file is never
read:

``` sh
# shell
cat > /srv/store/inbox/.tmp <<JSON
{"instance":"2026Q1","task":"delivery","element":"north","actor":"platform"}
JSON
mv /srv/store/inbox/.tmp /srv/store/inbox/delivery-2026Q1-north.json
```

``` sql
-- Postgres: a trigger writing the same file with COPY ... TO PROGRAM,
-- or (more usual) a NOTIFY that a small listener turns into a message
```

``` python
# python
import json, os, tempfile
msg = {"instance": "2026Q1", "task": "delivery", "element": "north",
       "actor": "platform"}
d = "/srv/store/inbox"
fd, tmp = tempfile.mkstemp(dir=d)
os.write(fd, json.dumps(msg).encode()); os.close(fd)
os.rename(tmp, os.path.join(d, "delivery-2026Q1-north.json"))
```

## When the sender cannot reach the filesystem

Two variants, both built on the same message, so the process side does
not change.

**HTTP**: put a [plumber](https://www.rplumber.io) route in front of the
inbox. This is the whole server:

``` r

# plumber.R
library(blockr.process)
store <- Sys.getenv("PROC_STORE")

#* @post /events
function(req, res, task, element = NULL, value = "done",
         field = "status", instance = "latest", actor = "api", id = NULL) {
  if (!identical(req$HTTP_AUTHORIZATION, paste("Bearer", Sys.getenv("PROC_TOKEN")))) {
    res$status <- 401
    return(list(error = "unauthorized"))
  }
  write_inbox_message(store, task, value, field, element, instance, actor, id)
  list(ok = TRUE)
}
```

``` sh
curl -X POST https://.../events -H "Authorization: Bearer $TOKEN" \
  -d task=delivery -d element=north -d id=delivery-2026Q1-north
```

The endpoint never writes an event; it writes a message, and the worker
does the rest. Idempotency, validation and the audit trail come along
unchanged.

**Pull**: a scheduled script on the process side asks the other system
what is true and turns the difference into messages:

``` r

delivered <- DBI::dbGetQuery(con, "
  SELECT unit, uploaded_at FROM deliveries WHERE period = '2026Q1'
")

for (i in seq_len(nrow(delivered))) {
  write_inbox_message(
    store, task = "delivery", element = delivered$unit[i],
    instance = "2026Q1", actor = "upload-db",
    id = paste0("delivery-2026Q1-", delivered$unit[i])   # <- resends are no-ops
  )
}
ingest_inbox(store)
```

The id means the script does not need to remember what it already sent,
and it does not need to query for “new” rows. Sending everything every
time is correct, because the second send of a message is ignored. That
is simpler than a watermark, and a missed run is repaired by the next
one.

## Assignments, not just completions

A message sets any field, so a roster system can assign work:

``` r

write_inbox_message(store, "review", field = "assignee", value = "ana",
                    element = "north", instance = "2026Q1",
                    actor = "hr-system", id = "assign-north")
ingest_inbox(store, quiet = TRUE)

tab <- instance_view(store, "2026Q1")
tab[tab$task == "review", c("element", "assignee", "status")]
#>   element assignee  status
#> 3   north      ana    open
#> 4   south          blocked
```

## What is not here yet

Everything above is inbound. A process that wants to **tell** another
system something (a webhook when an instance completes, a row written
back when a delivery is approved) has no support yet; you would write it
as a script task. First-class outbound messages are the most likely next
addition.
