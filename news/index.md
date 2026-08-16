# Changelog

## blockr.process (development version)

- **The tasks block sorts by status.** A `sort` control in the toolbar,
  defaulting to `by status`: open, then in progress, then waiting, then
  skipped, then done – so unfolding a step of two thousand elements
  leads with the ones that still need somebody rather than with two
  hundred that are finished. Stable within a status, so an element keeps
  its place in the collection’s own order and does not jump about as its
  neighbours move. `by id` restores the collection order.

- **The tasks block folds its element lists.** A task that repeats over
  thousands of elements used to paint a DOM node for each of them on
  every render – for a process over 2115 elements (8462 rows) that was
  around thirty seconds, and the overview drowned in the detail.
  Sections with more than 25 elements now start folded, so what you see
  first is one line per step with its progress bar; unfolding draws 200
  at a time with a “show the rest” button. 8462 rows render as 66 DOM
  nodes, unfolding a section costs 27ms, and a section folded or
  unfolded by hand stays that way. Grouping the rows by task is also one
  pass now rather than a scan of every row per task.

- **Ingesting a batch of inbox messages no longer re-reads the instance
  for every message.** `check_message()` needs three things from the
  store – what `"latest"` resolves to, the stamped definition, the
  element list – and each of them parses the whole event log, which
  holds the element list as a single JSON blob. Read once per instance
  per
  [`ingest_inbox()`](https://cynkra.github.io/blockr.process/reference/ingest_inbox.md)
  call instead of once per message: the first synchronisation of a
  process over 2115 elements went from over five minutes (still
  unfinished) to 5.8 seconds. Instances neither appear nor change while
  their own inbox is being ingested, so the batch can safely share one
  read.

- **BPMN files can now be read, not only written.**
  [`read_bpmn()`](https://cynkra.github.io/blockr.process/reference/read_bpmn.md)
  parses a BPMN 2.0 interchange document – from this package, Camunda
  Modeler, bpmn.io – into the tidy model, whatever the namespace
  prefixes, and
  [`bpmn_to_table()`](https://cynkra.github.io/blockr.process/reference/bpmn_to_table.md)
  inverts the compile: gateways dissolve back into the `depends_on`
  grammar (branch labels become outcome qualifiers, converging gateways
  become `join`), lanes become roles, multi-instance runs regroup into
  container rows. Draw a process in a modeler, drop the file in, get a
  table blockr.process can run.
  [`bpmn_xml()`](https://cynkra.github.io/blockr.process/reference/bpmn_xml.md)
  writes what a script task runs into the standard `<bpmn:script>`
  element, so a table survives the round trip with its worker wiring
  intact.

- **Lanes render.** Roles have always been lanes in the model, but the
  bundled auto-layouter drops every edge as soon as a `laneSet` appears,
  so they were kept out of the diagram. The layout paths (widget and
  [`layout_bpmn()`](https://cynkra.github.io/blockr.process/reference/layout_bpmn.md))
  now share a post-layout step that strips the lanes before laying out
  and re-imposes them afterwards: nodes band into their lanes, every
  edge is re-routed orthogonally, and the process gets its pool. Who
  does what is now visible in every diagram.

- **A `system` task without a script draws as a receive task** (the
  envelope marker): nothing for the worker to run means only an inbox
  message or a manual act completes it, and the diagram now says so.
  Passing `as_bpmn(external = "Reporting unit")` adds a collapsed pool
  of that name with a message flow into each receive task – the
  integration story of
  [`vignette("external-systems")`](https://cynkra.github.io/blockr.process/articles/external-systems.md),
  drawn.
  [`bpmn()`](https://cynkra.github.io/blockr.process/reference/bpmn.md)
  gained a `messages` argument for the general case, plus `sendTask` and
  `inclusiveGateway` vocabulary.

- **The tasks block no longer has a “send back” button** (and the bulk
  note field that only served it is gone with it). It was the one
  action-specific gesture in an otherwise generic block. Sending work
  back is a decision, and decisions belong in the definition as
  outcomes: `fix depends_on review:rejected` makes `rejected` a terminal
  state the chip offers, works the same for a person as for a check
  script, re-arms through the loop, and shows up in the diagram as a
  branch. Reopening an already finished task is one event from outside –
  [`process_act()`](https://cynkra.github.io/blockr.process/reference/process_act.md),
  an inbox message, a database mirror – because the board is where open
  work is acted on, not where history is rewritten.

- `script` may now name **an exported function of an installed package**
  (`"mypkg::forecast"`) as well as a file in the jobs directory. Usually
  the better shape for a deployment: nothing extra to ship or mount, and
  the `code_version` event becomes the package version. It still runs in
  a subprocess and reads the same `PROC_*` environment as a script, so
  the two forms are interchangeable.

- `run_worker(packages =)` is the allowlist for that form, **empty by
  default**: a `script` cell can be edited in a browser, and without the
  allowlist it could name
  [`base::system`](https://rdrr.io/r/base/system.html). Only a plain
  `pkg::fun` is accepted: no `:::`, no arguments, no expression.

- pkgdown site (`_pkgdown.yml`), and CI: `R CMD check`, `tsc`, and the
  JS test suite that mirrors the R one.

- **The engine/UI line is now declared and enforced.** The package is
  two layers in one namespace: a pure-R engine (table semantics, event
  store, instances, inbox, worker, BPMN model/XML) with no shiny or
  blockr dependency, and the blocks on top. `dev/architecture.md`
  documents it and an architecture test fails the build if an engine
  file ever imports UI code. The reference index follows the same line;
  exports that exist only as machinery (functions emitted block
  expressions call, demo scaffolding, semantics helpers) are marked
  internal, still exported but no longer documentation surface.

## blockr.process 0.2.0

First public release.

- **The worker really runs the scripts.**
  [`run_worker()`](https://cynkra.github.io/blockr.process/reference/run_worker.md)
  executes a `system` task whose `script` is set, wherever it sits in
  the table, including once per element for a task inside a
  multi-instance group, which was drawn and gated but never executed
  before.

- **The jobs directory is a jail.** `script` is a name inside it;
  absolute paths, `~`, `..` and symlinks pointing out are refused and
  recorded as a failure with a reason, and nothing is executed.

- **One worker per store**, by lock directory with a heartbeat; a lock
  left by a worker that died is broken automatically.
  [`worker_alive()`](https://cynkra.github.io/blockr.process/reference/worker_alive.md)
  answers whether one is running.

- **`retry` and `timeout` columns**; a retry is written into the event
  log rather than hidden inside a loop. **`code_version`** is recorded
  per attempt.

- **A file inbox**
  ([`inbox_dir()`](https://cynkra.github.io/blockr.process/reference/inbox_dir.md),
  [`write_inbox_message()`](https://cynkra.github.io/blockr.process/reference/write_inbox_message.md),
  [`ingest_inbox()`](https://cynkra.github.io/blockr.process/reference/ingest_inbox.md)):
  how a system that is not R moves a process forward. One JSON message
  per file, the file name is the idempotency key, and the event points
  back at the message it came from (`ref`).

- Multi-instance groups (`collection`, `parent`), quorums (`join`,
  `complete_when`), `sequential`, and rework loops that re-arm per
  element.

- Blocks: process editor, start-instance card, task list, BPMN diagram
  with live status, instance state, event log, assign.

- Demo:
  `source(system.file("examples/data-collection.R", package = "blockr.process"))`,
  live at <https://blockr.cloud/app/data-collection>.
