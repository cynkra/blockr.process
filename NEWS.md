# blockr.process (development version)

* **The tasks block no longer has a "send back" button** (and the bulk note
  field that only served it is gone with it). It was the one action-specific
  gesture in an otherwise generic block. Sending work back is a decision, and
  decisions belong in the definition as outcomes: `fix depends_on
  review:rejected` makes `rejected` a terminal state the chip offers, works
  the same for a person as for a check script, re-arms through the loop, and
  shows up in the diagram as a branch. Reopening an already finished task is
  one event from outside -- `process_act()`, an inbox message, a database
  mirror -- because the board is where open work is acted on, not where
  history is rewritten.

* `script` may now name **an exported function of an installed package**
  (`"mypkg::forecast"`) as well as a file in the jobs directory. Usually the
  better shape for a deployment: nothing extra to ship or mount, and the
  `code_version` event becomes the package version. It still runs in a
  subprocess and reads the same `PROC_*` environment as a script, so the two
  forms are interchangeable.

* `run_worker(packages =)` is the allowlist for that form, **empty by
  default**: a `script` cell can be edited in a browser, and without the
  allowlist it could name `base::system`. Only a plain `pkg::fun` is
  accepted: no `:::`, no arguments, no expression.

* pkgdown site (`_pkgdown.yml`), and CI: `R CMD check`, `tsc`, and the JS test
  suite that mirrors the R one.

* **The engine/UI line is now declared and enforced.** The package is two
  layers in one namespace: a pure-R engine (table semantics, event store,
  instances, inbox, worker, BPMN model/XML) with no shiny or blockr
  dependency, and the blocks on top. `dev/architecture.md` documents it and
  an architecture test fails the build if an engine file ever imports UI
  code. The reference index follows the same line; exports that exist only
  as machinery (functions emitted block expressions call, demo scaffolding,
  semantics helpers) are marked internal, still exported but no longer
  documentation surface.

# blockr.process 0.2.0

First public release.

* **The worker really runs the scripts.** `run_worker()` executes a `system`
  task whose `script` is set, wherever it sits in the table, including once
  per element for a task inside a multi-instance group, which was drawn and
  gated but never executed before.

* **The jobs directory is a jail.** `script` is a name inside it; absolute
  paths, `~`, `..` and symlinks pointing out are refused and recorded as a
  failure with a reason, and nothing is executed.

* **One worker per store**, by lock directory with a heartbeat; a lock left by
  a worker that died is broken automatically. `worker_alive()` answers whether
  one is running.

* **`retry` and `timeout` columns**; a retry is written into the event log
  rather than hidden inside a loop. **`code_version`** is recorded per attempt.

* **A file inbox** (`inbox_dir()`, `write_inbox_message()`, `ingest_inbox()`):
  how a system that is not R moves a process forward. One JSON message per
  file, the file name is the idempotency key, and the event points back at the
  message it came from (`ref`).

* Multi-instance groups (`collection`, `parent`), quorums (`join`,
  `complete_when`), `sequential`, and rework loops that re-arm per element.

* Blocks: process editor, start-instance card, task list, BPMN diagram with
  live status, instance state, event log, assign.

* Demo: `source(system.file("examples/data-collection.R", package = "blockr.process"))`,
  live at <https://blockr.cloud/app/data-collection>.
