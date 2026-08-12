# Package index

## The process table

A process definition is one wide table; these read it. Pure R.

- [`example_process()`](https://cynkra.github.io/blockr.process/reference/example_process.md)
  : Example: a quarterly data collection as a wide process table
- [`process_tasks()`](https://cynkra.github.io/blockr.process/reference/process_tasks.md)
  : Per-task metadata for a wide process table
- [`process_status()`](https://cynkra.github.io/blockr.process/reference/process_status.md)
  : Computed display status for every task of a wide process table
- [`process_groups()`](https://cynkra.github.io/blockr.process/reference/process_groups.md)
  [`process_scopes()`](https://cynkra.github.io/blockr.process/reference/process_groups.md)
  [`process_collection()`](https://cynkra.github.io/blockr.process/reference/process_groups.md)
  [`process_complete_when()`](https://cynkra.github.io/blockr.process/reference/process_groups.md)
  [`process_sequential()`](https://cynkra.github.io/blockr.process/reference/process_groups.md)
  [`process_body()`](https://cynkra.github.io/blockr.process/reference/process_groups.md)
  : Multi-instance groups of a wide process table
- [`process_version()`](https://cynkra.github.io/blockr.process/reference/process_version.md)
  : Short content hash of a process definition

## Instances and the event log

An instance is an append-only event log; opening one stamps the
definition and the element list into it. Current state is a fold over
the lines. Pure R.

- [`start_instance()`](https://cynkra.github.io/blockr.process/reference/start_instance.md)
  : Open an instance: stamp definition and elements into the store
- [`instance_event()`](https://cynkra.github.io/blockr.process/reference/instance_event.md)
  : Append one event to an instance store
- [`instance_events()`](https://cynkra.github.io/blockr.process/reference/instance_events.md)
  : Read an instance store's events
- [`instance_view()`](https://cynkra.github.io/blockr.process/reference/instance_view.md)
  : An instance as people should see it
- [`instance_table()`](https://cynkra.github.io/blockr.process/reference/instance_table.md)
  : An instance's expanded table, rebuilt from the store alone
- [`instance_status()`](https://cynkra.github.io/blockr.process/reference/instance_status.md)
  : Status of every row of an expanded instance
- [`instance_log()`](https://cynkra.github.io/blockr.process/reference/instance_log.md)
  : An instance's events, newest first
- [`instance_latest()`](https://cynkra.github.io/blockr.process/reference/instance_latest.md)
  : The newest instance in a store
- [`instance_definition()`](https://cynkra.github.io/blockr.process/reference/instance_definition.md)
  : The definition an instance was opened with
- [`instance_collection()`](https://cynkra.github.io/blockr.process/reference/instance_collection.md)
  : The element list an instance was opened with
- [`expand_instance()`](https://cynkra.github.io/blockr.process/reference/expand_instance.md)
  : Expand a definition into the instance-shaped table
- [`apply_events()`](https://cynkra.github.io/blockr.process/reference/apply_events.md)
  : Overlay an instance's events onto a process definition

## The worker

The only thing in the package that executes anything – a plain R
process, deliberately outside the app.

- [`run_worker()`](https://cynkra.github.io/blockr.process/reference/run_worker.md)
  : Run a process until it needs a person (or finishes)
- [`process_act()`](https://cynkra.github.io/blockr.process/reference/process_act.md)
  : A person acts on a task
- [`worker_alive()`](https://cynkra.github.io/blockr.process/reference/worker_alive.md)
  : Is a worker running on this store?
- [`process_interpreters()`](https://cynkra.github.io/blockr.process/reference/process_interpreters.md)
  : How a script file is executed, by extension
- [`code_version()`](https://cynkra.github.io/blockr.process/reference/code_version.md)
  : Which version of the code ran

## The inbox

How a system that is not R moves a process forward: one JSON file per
message, the file name is the idempotency key.

- [`inbox_dir()`](https://cynkra.github.io/blockr.process/reference/inbox_dir.md)
  : The inbox directory of a store
- [`write_inbox_message()`](https://cynkra.github.io/blockr.process/reference/write_inbox_message.md)
  : Write one inbox message
- [`ingest_inbox()`](https://cynkra.github.io/blockr.process/reference/ingest_inbox.md)
  : Ingest the inbox: turn waiting messages into events

## Blocks

The process on a blockr board.

- [`new_process_block()`](https://cynkra.github.io/blockr.process/reference/new_process_block.md)
  : Process block (JS-driven editor)
- [`new_start_instance_block()`](https://cynkra.github.io/blockr.process/reference/new_start_instance_block.md)
  : Open-instance block
- [`new_tasks_block()`](https://cynkra.github.io/blockr.process/reference/new_tasks_block.md)
  : Tasks block
- [`new_bpmn_block()`](https://cynkra.github.io/blockr.process/reference/new_bpmn_block.md)
  : BPMN block
- [`new_runstate_block()`](https://cynkra.github.io/blockr.process/reference/new_runstate_block.md)
  : Instance state block
- [`new_event_log_block()`](https://cynkra.github.io/blockr.process/reference/new_event_log_block.md)
  : Instance log block
- [`new_assign_block()`](https://cynkra.github.io/blockr.process/reference/new_assign_block.md)
  : Instance block (JS-driven)

## BPMN

The diagram half – tidy model, interchange XML, auto-layout, widget.
Pure R plus a bundled JS renderer; depends on nothing else in the
package.

- [`bpmn()`](https://cynkra.github.io/blockr.process/reference/bpmn.md)
  : Create a tidy BPMN model
- [`as_bpmn()`](https://cynkra.github.io/blockr.process/reference/as_bpmn.md)
  : Convert a wide process table to a tidy BPMN model
- [`bpmn_xml()`](https://cynkra.github.io/blockr.process/reference/bpmn_xml.md)
  : Generate BPMN 2.0 XML from a tidy BPMN model
- [`write_bpmn()`](https://cynkra.github.io/blockr.process/reference/write_bpmn.md)
  : Write a tidy BPMN model to a .bpmn file
- [`layout_bpmn()`](https://cynkra.github.io/blockr.process/reference/layout_bpmn.md)
  : Add auto-computed diagram layout to a BPMN model
- [`bpmn_widget()`](https://cynkra.github.io/blockr.process/reference/bpmn_widget.md)
  : Render a tidy BPMN model as an interactive diagram
- [`bpmnWidgetOutput()`](https://cynkra.github.io/blockr.process/reference/bpmn_widget-shiny.md)
  [`renderBpmnWidget()`](https://cynkra.github.io/blockr.process/reference/bpmn_widget-shiny.md)
  : Shiny bindings for bpmn_widget
