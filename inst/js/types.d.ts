/**
 * Type declarations for the instance block.
 *
 * The state interface is the R <-> JS protocol contract: write it FIRST
 * when changing the block, then keep `_compose()` / `setState()` and
 * `make_assign_expr()` in sync with it.
 */

/* --- The instance block's state (the protocol contract) --- */

/**
 * One task's instance assignment. Only edited fields are present; missing
 * fields leave the table value untouched (see apply_assignments()).
 */
interface RunAssignment {
  assignee?: string;
  /** ISO date, '' while unset. */
  due?: string;
  /**
   * Stored status. 'open' | 'doing' are the not-finished states; any
   * other value means finished: 'done' for plain tasks, an outcome label
   * ('true' | 'false' by convention) for checks. 'blocked' / 'skipped'
   * are computed for display and never stored.
   */
  status?: string;
}

/** The `instance-columns` payload: the task rows plus any column vocabularies. */
interface RunColumnsMeta {
  tasks: StepMeta[];
  /** Column name -> allowed values, from the incoming factor levels. */
  levels: Record<string, string[]>;
}

interface RunState {
  /** task id -> assignment. {} while untouched. */
  assignments: Record<string, RunAssignment>;
}

/* --- Task metadata pushed by R on every data change --- */
/* (process_tasks() serialized; replaces column metadata on the
   factory's `instance-columns` channel.) */

interface StepGate {
  /** Task id this gate waits on. */
  on: string;
  /** Outcome label the gate requires, absent = any finished status. */
  label?: string;
}

interface StepMeta {
  task: string;
  name: string;
  role: string;
  script: string;
  /** Table values (the instance columns as loaded). */
  assignee: string;
  due: string;
  status: string;
  /** Non-loop dependencies. */
  gates: StepGate[];
  /** Loop-back dependencies (never block). */
  loops: string[];
  /**
   * Outcome labels other tasks consume from this task. Non-empty marks a
   * check: its terminal statuses are these labels instead of 'done'.
   */
  outcomes: string[];
}

/* --- The tasks block's payload (pushed whole on every store change) --- */

/** One task of the instance's definition, as the task list needs it. */
interface TaskStep {
  task: string;
  name: string;
  role: string;
  /** Multi-instance: does this task run once per element? */
  per: boolean;
  /** Outcome labels other tasks consume; non-empty marks a check. */
  outcomes: string[];
}

/** One row of the expanded instance table. */
interface TaskRow {
  task: string;
  /** Element id for multi rows, absent for single rows. */
  element?: string;
  assignee: string;
  due: string;
  /** STORED status: what the chip cycle advances. */
  status: string;
  /** Display status: blocked / skipped are computed, never stored. */
  disp: string;
  /** Name of the task a blocked row waits on ("waiting for <waits>"). */
  waits?: string;
  /** Plus one property per facet column (e.g. region). */
  [facet: string]: string | undefined;
}

/** The `tasks-rows` payload: everything the list draws. */
interface TasksPayload {
  instance: string;
  version: string;
  tasks: TaskStep[];
  rows: TaskRow[];
  /** Per multi task: element progress (what the gate counts). */
  counts: Record<
    string,
    {
      total: number;
      done: number;
      /** picked up, not finished -- the bar's blue segment */
      doing: number;
      /** waiting on a gate -- the bar's amber segment */
      blocked: number;
      /** everything not finished, doing and blocked included (the gate) */
      open: number;
      pct: number;
      pct_doing: number;
      pct_blocked: number;
    }
  >;
  roster: string[];
  /** Grouping columns of the element list and their values. */
  facets: Record<string, string[]>;
}

/** The `<id>_act` input: one gesture, one event batch for R. */
interface TasksAct {
  rows: { task: string; element: string }[];
  field: 'assignee' | 'due' | 'status' | 'note';
  value: string;
  actor: string;
}

/* --- The process block's state (the protocol contract) --- */

interface ProcessStep {
  /** Stable task id (NCName-ish; generated s1, s2, ... for new tasks). */
  task: string;
  name: string;
  /** 'system' => script task; '' => plain task; else user task (the lane). */
  role: string;
  /**
   * Comma-separated depends_on string, outcome qualifiers as `task:label`.
   * A token may name a GROUP, which is how an edge that would cross a
   * sub-process boundary is written; it lowers onto the group's exits (or,
   * on a group's own `dep`, onto its entries).
   */
  dep: string;
  /** Script to run; only meaningful when role === 'system'. */
  script: string;
  /**
   * Non-empty makes this row a multi-instance SUB-PROCESS rather than work:
   * a container, named by the collection TYPE it repeats over ('unit',
   * 'region'). Only the group carries it, which is what stops two tasks
   * disagreeing about the dimension. Which concrete list that is gets
   * decided when an instance starts, so this is Camunda's `inputElement`
   * and not its `inputCollection`.
   */
  collection: string;
  /** The group this task sits in ('' = top level, runs once). */
  parent: string;
  /**
   * Quorum on a task with several dependencies: how many have to be met.
   * '' or 'all' (a parallel join), 'any', 'n=<k>', 'pct=<p>'.
   */
  join?: string;
  /**
   * Quorum on a GROUP: how many elements finish the sub-process, which is
   * what the task after it waits for. Same grammar as `join`; BPMN's
   * completionCondition.
   */
  complete_when?: string;
  /**
   * On a GROUP: 'true' runs the elements one after another (BPMN
   * isSequential). '' is the default, all at once.
   */
  sequential?: string;
  /**
   * LEGACY (pre-group definitions): the dimension marked on every repeated
   * task. Read once by setState() and turned into a group, never written.
   */
  per?: string;
}

interface ProcessState {
  tasks: ProcessStep[];
}

/* --- Rail editor internals (derived from ProcessState, never stored) --- */

/**
 * The four task kinds of the picker. Derived from the fields: consumed
 * outcome labels mark a decision ('system' => automatic check); otherwise
 * role 'system' => script, anything else => work task.
 */
type StepKind = 'work' | 'script' | 'decision' | 'check';

/** One parsed depends_on token: `on` or `on:label`. */
interface DepToken {
  on: string;
  /** Outcome qualifier, null when unqualified. */
  label: string | null;
}

/* --- The minidag rail (blockr.outline), driven by the process adapter --- */

/** A group as the renderer sees it: a stack, with its defining row along. */
interface ProcessStack {
  id: string;
  name: string;
  /**
   * Optional, and this editor deliberately omits it: a group is marked by
   * the multi-instance glyph (`MI_ICON`), not by a colour. The renderer
   * falls back to its own default.
   */
  color?: string;
  /** Member task ids, in table order. */
  blocks: string[];
  /** The `collection` row itself, so the header can edit it in place. */
  group: ProcessStep;
}

/** A task as the renderer sees it: a node with the task hanging off it. */
interface ProcessNode {
  id: string;
  name: string;
  task: ProcessStep;
  kind: StepKind;
  /** Outcome labels other tasks consume from this task. */
  outcomes: string[];
}

/** A dependency as the renderer sees it; `input` is the outcome qualifier. */
interface ProcessEdge {
  id: string;
  from: string;
  to: string;
  input: string;
}

interface MinidagRailModel {
  blocks: ProcessNode[];
  links: ProcessEdge[];
  stacks: ProcessStack[];
}

interface MinidagRailHandle {
  setData(model: MinidagRailModel): void;
  setBadge(msg: unknown): void;
  render(): void;
  inspect(): unknown;
}

/** See `blockr.outline/inst/assets/js/minidag-rail.js` for the adapter contract. */
interface MinidagRailAdapter {
  opts?: Record<string, unknown>;
  emit(name: string, payload: any): void;
  nodeLead?(node: ProcessNode): Node | null;
  nodeTrail?(node: ProcessNode): Node | null;
  stackAside?(stack: ProcessStack, collapsed: boolean): Node | null;
  slotsFor(from: ProcessNode, to: ProcessNode): string[];
  slotPrompt?(from: ProcessNode, to: ProcessNode): string;
  showSlot?(link: ProcessEdge): boolean;
}

declare const minidagRail: {
  create(el: HTMLElement, adapter: MinidagRailAdapter): MinidagRailHandle;
};

interface Window {
  /** Test/inspection hook on the live editor (cf. minidag's `_minidag`). */
  _processBlock: unknown;
  /** Shiny at runtime; absent in static test harnesses. */
  Shiny?: {
    setInputValue(name: string, value: unknown, opts?: { priority?: string }): void;
  };
}

/* --- Shared Blockr API subset (from blockr.dplyr's types.d.ts) --- */

interface BlockrBlockClass {
  new (el: HTMLElement): BlockrBlock;
}

interface BlockrBlock {
  getValue(): unknown | null;
  setState(state: unknown): void;
}

interface BlockrRegisterConfig {
  name: string;
  Block: BlockrBlockClass;
  messages?: Record<string, (block: BlockrBlock, msg: unknown) => void>;
}

interface BlockrSelectHandle {
  el: HTMLElement;
  getValue(): string | string[];
  setOptions(
    opts: (string | { value: string; label?: string })[],
    selected?: string | string[]
  ): void;
  destroy(): void;
}

interface BlockrSelectConfig {
  options: (string | { value: string; label?: string })[];
  selected?: string | string[] | null;
  placeholder?: string;
  allowEmpty?: boolean;
  reorderable?: boolean;
  onChange?: (value: any) => void;
}

declare namespace Blockr {
  function registerBlock(config: BlockrRegisterConfig): void;
  const icons: Record<string, string>;
  namespace Select {
    function single(container: HTMLElement, config: BlockrSelectConfig): BlockrSelectHandle;
    function multi(container: HTMLElement, config: BlockrSelectConfig): BlockrSelectHandle;
  }
}
