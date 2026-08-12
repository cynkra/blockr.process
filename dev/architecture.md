# Architecture: two layers, one namespace

blockr.process is a pure-R engine plus a blockr UI in one namespace,
separated by file, by dependency direction, and by a test that fails the
build if the line is crossed (`tests/testthat/test-architecture.R`).

```
ENGINE: pure R. No shiny, no blockr.*, no htmlwidgets.
         Runs in Rscript, cron, a container, a test.

  process-table.R   the table semantics: deps, groups, quorums, status
  multi.R           expand per element; instance gates
  event-store.R     the append-only log and its folds
  instance.R        start/stamp/resolve instances
  inbox.R           messages from the outside world
  worker.R          the only thing that executes anything
  bpmn-model.R      table -> tidy BPMN model
  bpmn-xml.R        model -> interchange XML (+ Node auto-layout CLI)
  bpmn-example.R    examples
          ▲
          │  calls: one direction, never the reverse
          │
UI: everything that imports shiny or blockr.*.

  *-block.R         the blocks (process, start-instance, tasks, bpmn,
                    instance views, assign, demo)
  js-block.R,       vendored JS-block factories
  js-transform.R
  bpmn-widget.R     the htmlwidget
  expr-builders.R   builds the expressions blocks EMIT; it exists for
                    the blocks, so it lives on the UI side of the line
  zzz.R             block registration
```

## Why the line exists

The design rule is "a live Shiny session never holds workflow state": the
worker, `dev/act.R` and the board must compute identical answers from the
same event log, with no session anywhere. That is only guaranteed if the
process logic *cannot* reach for a session, so the engine does not link
against one.

In practice this buys:

- **The engine is deployable alone.** `run_worker()` on a server, an inbox
  ingest in cron, the semantics in plain unit tests: none of it drags in
  shiny.
- **Extraction stays a file move.** If the engine ever becomes its own
  package (the same option the DESCRIPTION reserves for the `bpmn-*.R`
  files), it is `git mv` plus a DESCRIPTION, not a refactor. The
  architecture test is what keeps that true over time.

## Rules of thumb when adding code

- Process/task/instance logic → an engine file. If it needs anything from
  shiny, the design is wrong, not the test.
- A block, or anything that renders → a `*-block.R` file (the second
  architecture test insists every new file declares its side).
- A function a block's emitted expression calls must be **exported** and
  called as `blockr.process::fun(...)`, because the expression runs in the
  user's session. Export it, and mark it `@keywords internal` unless it is
  genuine user API: the reference index is the curated surface, the
  namespace is the mechanical one.
