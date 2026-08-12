// @ts-check
/* The process editor: a minidag rail whose nodes are tasks.
 *
 * `minidag-rail.js` (blockr.outline) draws the list and owns every gesture --
 * drag a dot onto a row to add a dependency, release on the canvas to append
 * a task, hover an edge for the ✕. This file is the ADAPTER: it turns the
 * flat `tasks` state into that renderer's model and turns the gestures back
 * into edits of the state.
 *
 * The state contract:
 *   {tasks: [{task, name, role, dep, script, parent, collection,
 *             join, complete_when, sequential}]}
 * where `dep` is the comma-separated depends_on string and an outcome
 * qualifier rides inside the token (`qacheck:false`). Order, kinds and loops
 * are DERIVED per render, never stored.
 *
 * The part of a process that REPEATS is a group (mockups/multi-instance.html,
 * variant C): a row with a non-empty `collection` is a BPMN multi-instance
 * sub-process, and the rows whose `parent` names it run once per element of
 * that collection. The renderer already draws exactly that shape -- a frame
 * around a run of rows with a header -- because a board calls it a STACK. So
 * the group is a stack, the header carries the collection, and the editor
 * needs no nesting machinery of its own.
 *
 * That the collection lives on the group and nowhere else is the point: the
 * previous form put a `per` field on every repeated task, which left the
 * dimension to whichever row was ticked first. `collection` names the
 * collection TYPE (`unit`); which list that is gets decided when an
 * instance starts, so the definition stays list-agnostic.
 *
 * THREE RELATIONS, three columns, and they never overlap:
 *   depends_on  flow        a DAG over tasks: what must finish first
 *   parent      scope       a TREE over tasks: which group a task is in
 *   collection  repetition  a property of one row: how often that scope runs
 * `parent` is not a weaker `depends_on`. BPMN keeps containment and sequence
 * flow apart, and forbids a sequence flow that crosses a sub-process
 * boundary: the container carries the edges in and out, its members are
 * wired only among themselves. So an edge leaving a group is STORED on the
 * group (`fg_daten depends_on each_unit`) and LOWERED onto its exits for
 * drawing -- see `_model()`. Naming a member from outside still lowers to
 * the same edge, which is why older definitions keep working.
 *
 * The two quorums, sharing one grammar (all | any | n=<k> | pct=<p>):
 *   complete_when  on the group  how many elements finish the sub-process
 *   join           on a task     how many of its dependencies are enough
 *
 * Two things a process needs that a board does not, both of them renderer
 * options: `allowCycles` (rework sends the work back to the check) and
 * `edgeLabels` (the outcome the branch left on).
 */
(() => {
  'use strict';

  /**
   * The BPMN parallel multi-instance marker, three vertical bars. The group
   * gets no colour of its own (mockups/group-weight.html, variant A): a
   * group is an attribute of a run of rows, and a coloured frame on a white
   * list says "these tasks matter more", which is not what it means. The
   * marker carries the meaning; the frame only says where the run starts
   * and stops.
   */
  const MI_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 5v14"/><path d="M12 5v14"/><path d="M17 5v14"/></svg>';

  /** @type {Record<StepKind, string>} */
  const KIND_ICONS = {
    work: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></svg>',
    script: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m8 8-4 4 4 4"/><path d="m16 8 4 4-4 4"/></svg>',
    decision: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v6"/><path d="M12 9 6 15"/><path d="m12 9 6 6"/><circle cx="6" cy="18" r="2.4"/><circle cx="18" cy="18" r="2.4"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/><path d="m8.5 11 2 2 3.5-3.5"/></svg>'
  };

  /** @type {{kind: StepKind, title: string, hint: string}[]} */
  const KIND_PICKS = [
    { kind: 'work', title: 'Work task', hint: 'a role acts' },
    { kind: 'script', title: 'Script', hint: 'R code runs' },
    { kind: 'decision', title: 'Decision', hint: 'a role answers' },
    { kind: 'check', title: 'Automatic check', hint: 'a script answers' }
  ];

  /**
   * Parse a comma-separated depends_on string into tokens.
   * @param {string} dep
   * @returns {DepToken[]}
   */
  const parseDep = (dep) =>
    String(dep || '')
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t) => {
        const i = t.indexOf(':');
        return i < 0
          ? { on: t, label: null }
          : { on: t.slice(0, i), label: t.slice(i + 1) };
      });

  /** @param {DepToken} t */
  const depRaw = (t) => (t.label ? t.on + ':' + t.label : t.on);

  /** @param {DepToken[]} tokens */
  const joinDep = (tokens) => tokens.map(depRaw).join(', ');

  /**
   * The quorum grammar of `complete_when` / `join`, said in words. Kept in
   * step with `process_quorum()`: all | any | n=<k> | pct=<p>.
   * @param {string} spec
   * @returns {string}
   */
  const quorumWord = (spec) => {
    const s = String(spec || '').trim().toLowerCase();
    if (!s || s === 'all') return 'all';
    if (s === 'any') return 'any';
    const pct = s.match(/^(?:pct\s*=\s*)?([0-9.]+)\s*%$/) ||
                s.match(/^pct\s*=\s*([0-9.]+)$/);
    if (pct) return pct[1] + '% of';
    const n = s.match(/^(?:n\s*=\s*)?([0-9]+)$/);
    if (n) return n[1] + ' of';
    return s;
  };

  /** The presets the group header offers for `complete_when`. */
  const QUORUMS = ['all', 'any', 'pct=50', 'pct=90'];

  /** @param {ProcessStep} g */
  const isSequential = (g) =>
    ['true', 'yes', '1'].includes(String(g.sequential || '').toLowerCase());

  class ProcessBlock {
    /** @param {HTMLElement} el */
    constructor(el) {
      this.el = el;
      /** @type {((submit: boolean) => void) | null} */
      this._callback = null;
      this._submitted = false;
      /** @type {ReturnType<typeof setTimeout> | undefined} */
      this._debounceTimer = undefined;
      /** @type {ProcessStep[]} */
      this._steps = [];
      this._counter = 1;
      /** task id -> the collection it repeats over; rebuilt per `_model()`. */
      this._per = new Map();
      /**
       * Editor-only kind memory for freshly inserted decisions/checks whose
       * outcome nobody consumes yet (derived kind is the durable truth).
       * @type {Record<string, StepKind>}
       */
      this._kinds = {};
      /** @type {(() => void) | null} */
      this._closePicker = null;

      this.el.classList.add('process-block');
      this._rail = minidagRail.create(this.el, this._adapter());
      this._push();
      // test/inspection hook, same purpose as minidag's `window._minidag`
      window._processBlock = this;
      // late-mount handshake: a dock view builds this element AFTER the
      // initial state push -- announce, and R replays the state
      if (window.Shiny) {
        window.Shiny.setInputValue(
          this.el.id + '_ready', Date.now(), { priority: 'event' }
        );
      }
    }

    _autoSubmit() {
      clearTimeout(this._debounceTimer);
      this._debounceTimer = setTimeout(() => this._submit(), 300);
    }

    /** Re-derive the model and hand it to the renderer. */
    _push() {
      this._rail.setData(this._model());
    }

    /** Re-derive, hand over, and tell R. */
    _edit() {
      this._push();
      this._autoSubmit();
    }

    /** @param {string} prefix @returns {string} */
    _newId(prefix) {
      let id;
      do { id = (prefix || 's') + this._counter++; }
      while (this._steps.some((s) => s.task === id));
      return id;
    }

    /** @param {string} id @returns {ProcessStep | undefined} */
    _stepOf(id) {
      return this._steps.find((s) => s.task === id);
    }

    /* --- Groups: the rows that are structure rather than work --- */

    /** The multi-instance sub-processes. @returns {ProcessStep[]} */
    _groups() {
      return this._steps.filter((s) => s.collection.length > 0);
    }

    /** The rows that are actual work. @returns {ProcessStep[]} */
    _body() {
      return this._steps.filter((s) => !s.collection.length);
    }

    /** @param {ProcessStep} g @returns {ProcessStep[]} */
    _membersOf(g) {
      return this._body().filter((s) => s.parent === g.task);
    }

    /** The collections this process already repeats over. @returns {string[]} */
    _collections() {
      /** @type {string[]} */
      const out = [];
      this._groups().forEach((g) => {
        if (!out.includes(g.collection)) out.push(g.collection);
      });
      return out;
    }

    /**
     * A group nobody is in is a frame around nothing, and the renderer has
     * no row to hang it on. Dropping the last member dissolves it.
     */
    _gcGroups() {
      const dead = this._groups().filter((g) => !this._membersOf(g).length);
      dead.forEach((g) => {
        const at = this._steps.indexOf(g);
        if (at >= 0) this._steps.splice(at, 1);
      });
      if (!dead.length) return;
      // an empty group has no member to lower onto, so the tokens naming it
      // die with it rather than lingering for R to drop
      const gone = new Set(dead.map((g) => g.task));
      this._steps.forEach((s) => {
        s.dep = joinDep(parseDep(s.dep).filter((t) => !gone.has(t.on)));
      });
    }

    /* --- The model: the flat tasks list read as a graph --- */

    /** The exits of a group: the members nothing else inside it waits for. */
    _leavesOf(g) {
      const members = this._membersOf(g);
      const ids = new Set(members.map((s) => s.task));
      const consumed = new Set();
      members.forEach((s) => parseDep(s.dep).forEach((t) => {
        if (ids.has(t.on)) consumed.add(t.on);
      }));
      const out = members.filter((s) => !consumed.has(s.task));
      return (out.length ? out : members).map((s) => s.task);
    }

    /** The entries of a group: the members that wait for nothing inside it. */
    _rootsOf(g) {
      const members = this._membersOf(g);
      const ids = new Set(members.map((s) => s.task));
      const out = members.filter(
        (s) => !parseDep(s.dep).some((t) => ids.has(t.on))
      );
      return (out.length ? out : members).map((s) => s.task);
    }

    /**
     * Nodes are tasks, edges are dependency tokens, and the token's outcome
     * qualifier is the edge's `input`. Groups become STACKS, which is the
     * renderer's word for a framed run of rows. Ordering, lanes and loop-back
     * classification all happen downstream in minidag-layout.js.
     *
     * A dependency may name a CONTAINER, which is the BPMN-correct way to
     * write an edge that would otherwise cross a sub-process boundary. The
     * rail has no box for a container, so the token is lowered here the same
     * way `process_body()` lowers it in R -- onto the group's
     * exits, or from its entries -- and `_linkSrc` remembers which token
     * each drawn edge came from so removing it removes the right one.
     */
    _model() {
      const body = this._body();
      const ids = new Set(body.map((s) => s.task));

      /** @type {{id: string, from: string, to: string, input: string}[]} */
      const links = [];
      /** @type {Map<string, {task: string, raw: string}>} */
      this._linkSrc = new Map();
      const add = (from, to, input, owner, raw) => {
        const id = from + '>' + to;
        if (from === to || this._linkSrc.has(id)) return;
        links.push({ id: id, from: from, to: to, input: input || '' });
        this._linkSrc.set(id, { task: owner, raw: raw });
      };

      body.forEach((s) => {
        parseDep(s.dep).forEach((t) => {
          if (ids.has(t.on)) {
            add(t.on, s.task, t.label, s.task, depRaw(t));
            return;
          }
          const g = this._stepOf(t.on);
          // X waits for the sub-process: it waits for every exit of it
          if (g && g.collection.length) {
            this._leavesOf(g).forEach(
              (leaf) => add(leaf, s.task, t.label, s.task, depRaw(t))
            );
          }
        });
      });

      // the sub-process waits for Y: every entry of it does
      this._groups().forEach((g) => {
        const roots = this._rootsOf(g);
        parseDep(g.dep).forEach((t) => {
          if (!ids.has(t.on)) return;
          roots.forEach((r) => add(t.on, r, t.label, g.task, depRaw(t)));
        });
      });

      // which outcome labels somebody downstream consumes, per task
      /** @type {Map<string, string[]>} */
      const outcomes = new Map(body.map((s) => [s.task, []]));
      links.forEach((l) => {
        if (!l.input) return;
        const o = /** @type {string[]} */ (outcomes.get(l.from));
        if (o && !o.includes(l.input)) o.push(l.input);
      });

      // task -> the collection it repeats over; the row hooks read it back
      // out to say what a gate is waiting for
      this._per = new Map();
      const stacks = this._groups().map((g) => {
        const members = this._membersOf(g);
        members.forEach((s) => this._per.set(s.task, g.collection));
        return {
          id: g.task,
          name: g.name || ('for each ' + g.collection),
          // deliberately no `color`: see MI_ICON
          blocks: members.map((s) => s.task),
          group: g
        };
      }).filter((s) => s.blocks.length > 0);

      const blocks = body.map((s) => {
        const outs = /** @type {string[]} */ (outcomes.get(s.task));
        return {
          id: s.task,
          name: s.name,
          task: s,
          outcomes: outs,
          kind: this._kindOf(s, outs)
        };
      });

      return { blocks, links, stacks };
    }

    /**
     * A task that answers a question is a decision (a role) or a check (a
     * script); one that does not is work or a script. "Answers a question" is
     * visible in the data only once somebody hangs off an outcome, so a
     * freshly inserted one is remembered until then.
     * @param {ProcessStep} s
     * @param {string[]} outs
     * @returns {StepKind}
     */
    _kindOf(s, outs) {
      const sys = s.role === 'system';
      if (outs.length) return sys ? 'check' : 'decision';
      const remembered = this._kinds[s.task];
      if (remembered === 'decision' || remembered === 'check') {
        return sys ? 'check' : 'decision';
      }
      return sys ? 'script' : 'work';
    }

    /** The roles this process already knows about. @returns {string[]} */
    _roles() {
      /** @type {string[]} */
      const roles = [];
      this._steps.forEach((s) => {
        if (s.role && s.role !== 'system' && !roles.includes(s.role)) {
          roles.push(s.role);
        }
      });
      return roles;
    }

    /* --- The adapter the renderer talks to --- */

    _adapter() {
      return {
        opts: {
          // a stack here is a multi-instance sub-process: the part that
          // repeats, framed and named once
          stacks: true,
          status: false,          // the instance block owns status, not the design
          allowCycles: true,      // rework goes back to the check
          edgeLabels: true,       // ...on the branch it left on
          nameEdit: 'always',     // naming the task IS the work here
          searchPlaceholder: 'Find a task…',
          emptyText: 'No tasks yet.',
          emptyAddText: '+ Add the first task',
          stackNoun: 'Group',
          stackUnit: 'tasks',
          stackIcon: MI_ICON,
          stackAddText: 'Repeat them per element',
          stackRmTitle: 'Ungroup (the tasks stay, they stop repeating)',
          metrics: { ROW_H: 34 }
        },

        emit: (name, payload) => this._gesture(name, payload),

        nodeLead: (node) => {
          const k = document.createElement('span');
          const dec = node.kind === 'decision' || node.kind === 'check';
          k.className = 'md-kind pb-kind' + (dec ? ' pb-kind-decision' : '');
          k.innerHTML = KIND_ICONS[node.kind];
          const pick = KIND_PICKS.find((p) => p.kind === node.kind);
          k.title = pick ? pick.title : '';
          return k;
        },

        // Two fixed cells, so PERFORMER and the chips beside it line up down
        // the deck instead of starting wherever the name happened to end:
        // "who or what does this" is one question, whether the answer is a
        // role or a script.
        nodeTrail: (node) => {
          const wrap = document.createElement('span');
          wrap.className = 'pb-trail';

          const perf = document.createElement('span');
          perf.className = 'pb-performer';
          if (node.task.role === 'system') {
            perf.appendChild(this._scriptField(node.task));
          } else {
            const slot = document.createElement('span');
            slot.className = 'pb-role-slot';
            perf.appendChild(slot);
            // the select mounts itself, so it needs to be in the document
            setTimeout(() => this._mountRoleSelect(slot, node.task), 0);
          }
          wrap.appendChild(perf);

          const mark = document.createElement('span');
          mark.className = 'pb-mark';
          if (node.kind === 'decision' || node.kind === 'check') {
            mark.appendChild(this._outcomeChips(node));
          }
          const join = this._joinChip(node);
          if (join) mark.appendChild(join);
          wrap.appendChild(mark);

          return wrap;
        },

        stackAside: (stack, collapsed) => this._groupMeta(stack, collapsed),

        // A board asks the consumer which of its inputs are free. A task
        // takes as many predecessors as it likes, so the only question left
        // is which BRANCH of the producer this arm hangs off -- and the only
        // refusal is a dependency that already exists.
        slotsFor: (from, to) => {
          const dup = parseDep(to.task.dep).some((t) => t.on === from.id);
          if (dup) return [];
          if (from.kind === 'decision' || from.kind === 'check') {
            // consumed labels first, then the conventional pair -- ALWAYS.
            // Offering only the consumed ones would make the other branch
            // unreachable the moment the first one is taken.
            const outs = from.outcomes.slice();
            ['true', 'false'].forEach((o) => {
              if (outs.indexOf(o) < 0) outs.push(o);
            });
            return outs;
          }
          return [''];
        },

        slotPrompt: (from) => 'Which outcome of ' + (from.name || from.id) + '?',

        showSlot: (l) => l.input !== ''
      };
    }

    /* --- Gestures --- */

    /**
     * @param {string} name
     * @param {any} payload
     */
    _gesture(name, payload) {
      switch (name) {
      case 'link_add':
        return this._addDep(payload.from, payload.to, payload.input);
      case 'link_rm':
        return this._removeDeps(payload.ids);
      case 'block_rm':
        return this._removeStep(payload.id);
      case 'block_rename':
        return this._rename(payload.id, payload.name);
      case 'block_append':
        return this._openKindPicker(payload.x, payload.y, payload.from);
      case 'block_add':
        return this._openKindPicker(8, 8, null);
      case 'stack_add':
        return this._addGroup(payload.blocks);
      case 'stack_join':
        return this._joinGroup(payload.blocks, payload.stack);
      case 'stack_leave':
        return this._leaveGroup(payload.blocks);
      case 'stack_rename':
        return this._renameGroup(payload.id, payload.name);
      case 'stack_rm':
        return this._removeGroup(payload.id);
      default:
        // block_select has no meaning here: the row IS the task, there is no
        // panel to reveal. Stacks are off.
        return undefined;
      }
    }

    /**
     * Draw an edge. BPMN forbids a sequence flow that crosses a sub-process
     * boundary, so an edge leaving a group is stored as a dependency on the
     * GROUP: one place says "after the whole thing", and it keeps meaning
     * that when a second group feeds the same task. Drawn the other way
     * round (into a group) nothing is ambiguous, so the edge stays as it is.
     * @param {string} from @param {string} to @param {string} input
     */
    _addDep(from, to, input) {
      const task = this._stepOf(to);
      if (!task) return;
      const src = this._stepOf(from);
      const crosses = src && src.parent && src.parent !== task.parent;
      const on = crosses ? src.parent : from;
      const tokens = parseDep(task.dep);
      if (!tokens.some((t) => t.on === on && (t.label || null) === (input || null))) {
        tokens.push({ on: on, label: input || null });
      }
      task.dep = joinDep(tokens);
      this._edit();
    }

    /**
     * @param {string[]} ids `from>to` keys of DRAWN edges, which a lowered
     *   container token may own several of -- kill the token, not the edge.
     */
    _removeDeps(ids) {
      const kill = new Set(Array.isArray(ids) ? ids : [ids]);
      /** @type {Set<string>} */
      const tokens = new Set();
      kill.forEach((id) => {
        const src = this._linkSrc && this._linkSrc.get(id);
        if (src) tokens.add(src.task + '|' + src.raw);
      });
      this._steps.forEach((s) => {
        s.dep = joinDep(parseDep(s.dep).filter(
          (t) => !tokens.has(s.task + '|' + depRaw(t)) &&
                 !kill.has(t.on + '>' + s.task)
        ));
      });
      this._edit();
    }

    /** @param {string} id @param {string} name */
    _rename(id, name) {
      const task = this._stepOf(id);
      if (!task) return;
      task.name = name;
      // no re-render: the renderer defers while the field has focus anyway,
      // and the model it holds already carries the live task object
      this._autoSubmit();
    }

    /**
     * Remove a task and heal the flow: every dependent inherits the removed
     * task's own dependencies (outcome qualifiers on the removed task drop).
     * @param {string} id
     */
    _removeStep(id) {
      const at = this._steps.findIndex((s) => s.task === id);
      if (at < 0) return;
      const removed = this._steps[at];
      const own = parseDep(removed.dep).map(depRaw);
      this._steps.forEach((s) => {
        if (s === removed) return;
        const tokens = parseDep(s.dep);
        if (!tokens.some((t) => t.on === removed.task)) return;
        /** @type {string[]} */
        const out = [];
        tokens.forEach((t) => {
          if (t.on !== removed.task) {
            out.push(depRaw(t));
            return;
          }
          own.forEach((raw) => {
            if (raw.split(':')[0] !== s.task && !out.includes(raw)) {
              out.push(raw);
            }
          });
        });
        s.dep = out.join(', ');
      });
      delete this._kinds[removed.task];
      this._steps.splice(at, 1);
      this._gcGroups();
      this._edit();
    }

    /* --- Groups: the multi-instance sub-process --- */

    /**
     * Frame the selected rows and give them a collection to repeat over.
     * The group row goes in ABOVE its first member, so the stored table
     * reads top-down the way the editor does.
     * @param {string[]} ids
     */
    _addGroup(ids) {
      const members = ids.map((id) => this._stepOf(id)).filter(Boolean);
      if (!members.length) return;
      const collection = this._collections()[0] || 'element';
      const group = {
        task: this._newId('g'),
        name: 'for each ' + collection,
        role: '',
        dep: '',
        script: '',
        parent: '',
        collection: collection,
        join: '',
        complete_when: '',
        sequential: ''
      };
      const at = Math.min(...members.map((s) => this._steps.indexOf(s)));
      this._steps.splice(at, 0, group);
      members.forEach((s) => { s.parent = group.task; });
      this._edit();
    }

    /** @param {string[]} ids @param {string} groupId */
    _joinGroup(ids, groupId) {
      if (!this._stepOf(groupId)) return;
      ids.forEach((id) => {
        const s = this._stepOf(id);
        if (s && !s.collection.length) s.parent = groupId;
      });
      this._gcGroups();
      this._edit();
    }

    /** Dragged out of the frame: the task stops repeating. @param {string[]} ids */
    _leaveGroup(ids) {
      ids.forEach((id) => {
        const s = this._stepOf(id);
        if (s) s.parent = '';
      });
      this._gcGroups();
      this._edit();
    }

    /** @param {string} id @param {string} name */
    _renameGroup(id, name) {
      const g = this._stepOf(id);
      if (!g) return;
      g.name = name;
      this._autoSubmit();
    }

    /** Dissolve the frame; the tasks stay and stop repeating. @param {string} id */
    _removeGroup(id) {
      const at = this._steps.findIndex((s) => s.task === id);
      if (at < 0) return;
      this._dissolveGroup(this._steps[at]);
      this._steps.forEach((s) => {
        if (s.parent === id) s.parent = '';
      });
      this._steps.splice(at, 1);
      this._edit();
    }

    /**
     * Write out a container's edges before the container goes away, so that
     * ungrouping preserves the flow instead of dropping the arrows into it
     * and out of it. Same lowering `_model()` draws with.
     * @param {ProcessStep} g
     */
    _dissolveGroup(g) {
      const leaves = this._leavesOf(g);
      const roots = new Set(this._rootsOf(g));
      const own = parseDep(g.dep);
      this._steps.forEach((s) => {
        if (s === g) return;
        /** @type {DepToken[]} */
        const out = [];
        const push = (t) => {
          if (t.on === s.task) return;
          if (!out.some((o) => depRaw(o) === depRaw(t))) out.push(t);
        };
        parseDep(s.dep).forEach((t) => {
          if (t.on !== g.task) { push(t); return; }
          leaves.forEach((leaf) => push({ on: leaf, label: t.label }));
        });
        if (roots.has(s.task)) own.forEach(push);
        s.dep = joinDep(out);
      });
    }

    /**
     * The group header's right-hand side: what it repeats over, and that the
     * elements run at the same time. BPMN puts both on the multi-instance
     * marker, so this is one object's attributes in one place.
     * @param {{group: ProcessStep}} stack
     * @param {boolean} collapsed
     */
    _groupMeta(stack, collapsed) {
      const wrap = document.createElement('span');
      wrap.className = 'pb-groupmeta';

      const g = stack.group;

      if (collapsed) {
        const txt = document.createElement('span');
        txt.className = 'pb-coll-flat';
        txt.textContent = 'per ' + g.collection;
        wrap.appendChild(txt);
        return wrap;
      }

      const lab = document.createElement('span');
      lab.className = 'pb-coll-label';
      lab.textContent = 'collection';
      wrap.appendChild(lab);

      const slot = document.createElement('span');
      slot.className = 'pb-coll-slot';
      wrap.appendChild(slot);
      setTimeout(() => this._mountCollectionSelect(slot, g), 0);

      // done when: BPMN's completionCondition, the one place that decides
      // how many elements the task after the group waits for
      const dlab = document.createElement('span');
      dlab.className = 'pb-coll-label';
      dlab.textContent = 'done when';
      wrap.appendChild(dlab);

      const dslot = document.createElement('span');
      dslot.className = 'pb-coll-slot';
      wrap.appendChild(dslot);
      setTimeout(() => this._mountQuorumSelect(dslot, g), 0);

      // isSequential: a toggle, because "parallel" was never a fact -- it
      // was the default said out loud
      const par = document.createElement('button');
      par.type = 'button';
      par.className = 'pb-par action-button' +
        (isSequential(g) ? ' pb-par-seq' : '');
      par.textContent = isSequential(g) ? 'one at a time' : 'parallel';
      par.title = isSequential(g)
        ? 'The elements run one after another (BPMN isSequential). Click ' +
          'for all at once.'
        : 'Every element runs at the same time. Click to run them one after ' +
          'another instead.';
      par.addEventListener('click', () => {
        g.sequential = isSequential(g) ? '' : 'true';
        this._edit();
      });
      wrap.appendChild(par);

      return wrap;
    }

    /**
     * @param {HTMLElement} slot
     * @param {ProcessStep} group
     */
    _mountQuorumSelect(slot, group) {
      const cur = String(group.complete_when || '').trim() || 'all';
      const opts = QUORUMS.includes(cur) ? QUORUMS : [...QUORUMS, cur];
      Blockr.Select.single(slot, {
        options: opts,
        selected: cur,
        allowEmpty: false,
        placeholder: 'all',
        onChange: (v) => {
          const next = String(v || 'all');
          group.complete_when = next === 'all' ? '' : next;
          this._edit();
        }
      });
    }

    /**
     * @param {HTMLElement} slot
     * @param {ProcessStep} group
     */
    _mountCollectionSelect(slot, group) {
      const NEW_COLL = '+ New collection…';
      Blockr.Select.single(slot, {
        options: [...this._collections(), NEW_COLL],
        selected: group.collection || null,
        allowEmpty: false,
        placeholder: 'collection',
        onChange: (v) => {
          if (v === NEW_COLL) {
            this._promptNewCollection(slot, group);
            return;
          }
          this._setCollection(group, String(v || ''));
        }
      });
    }

    /**
     * Swap the select for a one-shot text input to name a new collection.
     * @param {HTMLElement} slot
     * @param {ProcessStep} group
     */
    _promptNewCollection(slot, group) {
      slot.innerHTML = '';
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'pb-role-new';
      input.placeholder = 'unit, region…';
      let done = false;
      const commit = () => {
        if (done) return;
        done = true;
        const v = input.value.trim();
        input.blur();            // see _promptNewRole: render defers on focus
        if (v) this._setCollection(group, v); else this._push();
      };
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') commit();
        if (e.key === 'Escape') { done = true; this._push(); }
      });
      input.addEventListener('blur', commit);
      slot.appendChild(input);
      input.focus();
    }

    /**
     * The default name follows the collection, a renamed one does not: the
     * header is a caption the user may have written.
     * @param {ProcessStep} group
     * @param {string} collection
     */
    _setCollection(group, collection) {
      if (!collection || collection === group.collection) {
        this._push();
        return;
      }
      if (group.name === 'for each ' + group.collection) {
        group.name = 'for each ' + collection;
      }
      group.collection = collection;
      this._edit();
    }

    /* --- Creating a task: the four-kind picker --- */

    /**
     * @param {number} x
     * @param {number} y
     * @param {string | null} from task the new one should depend on
     */
    _openKindPicker(x, y, from) {
      if (this._closePicker) this._closePicker();
      const deck = this.el.querySelector('.md-deck');
      if (!deck) return;
      const pop = document.createElement('div');
      pop.className = 'md-picker pb-picker';
      pop.style.left = Math.max(0, Math.min(x, deck.clientWidth - 266)) + 'px';
      // Creating a task means releasing BELOW the list, which is exactly
      // where there is no room left: pull the menu back up so it stays
      // inside the card instead of being clipped by it.
      const estH = KIND_PICKS.length * 28 + 8;
      pop.style.top = Math.max(0, Math.min(y, deck.clientHeight - estH)) + 'px';
      KIND_PICKS.forEach((p) => {
        const item = document.createElement('div');
        item.className = 'md-pick pb-pick';
        item.innerHTML = KIND_ICONS[p.kind] +
          '<b>' + p.title + '</b><span>' + p.hint + '</span>';
        item.addEventListener('click', () => {
          close();
          this._addStep(p.kind, from);
        });
        pop.appendChild(item);
      });
      deck.appendChild(pop);
      /** @param {MouseEvent} e */
      const onDoc = (e) => {
        if (!pop.contains(/** @type {Node} */ (e.target))) close();
      };
      const close = () => {
        document.removeEventListener('mousedown', onDoc);
        pop.remove();
        this._closePicker = null;
      };
      setTimeout(() => document.addEventListener('mousedown', onDoc), 0);
      this._closePicker = close;
    }

    /**
     * @param {StepKind} kind
     * @param {string | null} from
     */
    _addStep(kind, from) {
      const id = this._newId('s');
      const sys = kind === 'script' || kind === 'check';
      const dec = kind === 'decision' || kind === 'check';
      /** @type {ProcessStep} */
      const task = {
        task: id,
        name: '',
        // human kinds start on the process's first role (visible = stored)
        role: sys ? 'system' : (this._roles()[0] || ''),
        dep: '',
        script: '',
        parent: '',
        collection: '',
        join: '',
        complete_when: '',
        sequential: ''
      };
      if (from) {
        const src = this._stepOf(from);
        const model = this._model();
        const srcNode = model.blocks.find((b) => b.id === from);
        const branching = srcNode &&
          (srcNode.kind === 'decision' || srcNode.kind === 'check');
        if (branching) {
          // hang the new task off the first branch nobody consumes yet:
          // the second task drawn from a check gets the OTHER outcome
          const free = ['true', 'false'].find(
            (o) => srcNode.outcomes.indexOf(o) < 0
          );
          task.dep = from + ':' + (free || 'true');
        } else {
          task.dep = from;
        }
        if (!src) task.dep = '';
      }
      if (dec) this._kinds[id] = kind;
      this._steps.push(task);
      this._edit();
      this._focusName(id);
    }

    /** @param {string} id */
    _focusName(id) {
      setTimeout(() => {
        const row = this.el.querySelector(
          '.md-chip[data-id="' + CSS.escape(id) + '"] .md-name'
        );
        if (row instanceof HTMLInputElement) row.focus();
      }, 0);
    }

    /* --- Row fields --- */

    /** @param {ProcessStep} task */
    _scriptField(task) {
      const script = document.createElement('input');
      script.type = 'text';
      script.className = 'pb-script';
      script.placeholder = 'script.R';
      script.value = task.script;
      script.addEventListener('input', () => {
        task.script = script.value.trim();
        this._autoSubmit();
      });
      return script;
    }

    /**
     * The join, stated on the row that actually waits: a task outside a
     * group that gates on one inside it waits for EVERY element, which is
     * the parallel join BPMN draws where the sub-process closes. Saying it
     * here rather than as a row of its own puts it on the thing it is a
     * property of, and it reads the same when two groups feed one task.
     * @param {ProcessNode} node
     * @returns {HTMLElement | null}
     */
    _joinChip(node) {
      if (this._per.get(node.id)) return null;   // a member joins nothing
      /** @type {{coll: string, quorum: string}[]} */
      const waits = [];
      parseDep(node.task.dep).forEach((t) => {
        const g = this._stepOf(t.on);
        const coll = (g && g.collection) || this._per.get(t.on);
        if (!coll || waits.some((w) => w.coll === coll)) return;
        const owner = (g && g.collection) ? g : this._groupOf(t.on);
        waits.push({ coll: coll, quorum: (owner && owner.complete_when) || '' });
      });
      if (!waits.length) return null;

      // Quiet grey, not a pill: this is the one thing on a row that is
      // DERIVED rather than edited, and dressing it like the outcome chips
      // (which are editable branches) made it read as a second setting. No
      // count here -- the editor holds the definition, and how many elements
      // there are is decided when an instance starts.
      const say = (w) => quorumWord(w.quorum) + ' ' + w.coll;
      const chip = document.createElement('span');
      chip.className = 'pb-join';
      chip.textContent = 'waits for ' + waits.map(say).join(' + ');
      chip.title = 'The join where the group closes: this task runs once, ' +
        'after ' + waits.map(say).join(' and ') + ' has finished. Move it ' +
        'into the group and the same dependency means once per element ' +
        'instead.';
      return chip;
    }

    /** The group a task sits in. @param {string} id */
    _groupOf(id) {
      const s = this._stepOf(id);
      return s && s.parent ? this._stepOf(s.parent) : undefined;
    }

    /** @param {{outcomes: string[]}} node */
    _outcomeChips(node) {
      const outs = document.createElement('span');
      outs.className = 'pb-outs';
      const labels = node.outcomes.length ? node.outcomes : ['true', 'false'];
      labels
        .slice()
        .sort((a, b) =>
          (a === 'true' ? 0 : a === 'false' ? 1 : 2) -
          (b === 'true' ? 0 : b === 'false' ? 1 : 2))
        .forEach((o) => {
          const chip = document.createElement('span');
          chip.className = 'pb-out' +
            (o === 'true' ? ' pb-out-t' : o === 'false' ? ' pb-out-f' : '');
          chip.textContent = o;
          outs.appendChild(chip);
        });
      return outs;
    }

    /**
     * @param {HTMLElement} slot
     * @param {ProcessStep} task
     */
    _mountRoleSelect(slot, task) {
      // plain strings: the select renders {label} as a side annotation
      const NEW_ROLE = '+ New role…';
      Blockr.Select.single(slot, {
        options: [...this._roles(), NEW_ROLE],
        selected: task.role || null,
        allowEmpty: true,
        placeholder: 'role',
        onChange: (v) => {
          if (v === NEW_ROLE) {
            this._promptNewRole(slot, task);
            return;
          }
          task.role = String(v || '');
          this._edit();
        }
      });
    }

    /**
     * Swap the select for a one-shot text input to name a new role.
     * @param {HTMLElement} slot
     * @param {ProcessStep} task
     */
    _promptNewRole(slot, task) {
      slot.innerHTML = '';
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'pb-role-new';
      input.placeholder = 'new role…';
      let done = false;
      const commit = () => {
        if (done) return;
        done = true;
        const v = input.value.trim();
        // blur FIRST: the renderer defers a render while anything in the
        // deck has focus, so committing on Enter would leave the old row on
        // screen until the field happened to lose focus
        input.blur();
        if (v) {
          task.role = v;
          this._edit();
        } else {
          this._push();
        }
      };
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') commit();
        if (e.key === 'Escape') { done = true; this._push(); }
      });
      input.addEventListener('blur', commit);
      slot.appendChild(input);
      input.focus();
    }

    /* --- Blockr protocol --- */

    /** @returns {ProcessState} */
    _compose() {
      return { tasks: this._steps };
    }

    _submit() {
      this._submitted = true;
      if (this._callback) this._callback(true);
    }

    getValue() {
      return this._submitted ? this._compose() : null;
    }

    /** @param {ProcessState | null} state */
    setState(state) {
      const raw = (state && Array.isArray(state.tasks)) ? state.tasks : [];
      this._steps = raw.map((s) => ({
        task: String(s.task || ''),
        name: String(s.name || ''),
        role: String(s.role || ''),
        dep: String(s.dep || ''),
        script: String(s.script || ''),
        parent: String(s.parent || ''),
        collection: String(s.collection || ''),
        join: String(s.join || ''),
        complete_when: String(s.complete_when || ''),
        sequential: String(s.sequential || ''),
        per: String(s.per || '')
      })).filter((s) => s.task.length > 0);
      this._adoptLegacyPer();
      this._steps.forEach((s) => { delete s.per; });
      this._counter = this._steps.length + 1;
      this._push();
    }

    /**
     * A definition saved before groups existed marks every repeated task
     * with `per`. Read it once, on the way in: one group per distinct
     * dimension, and the board opens on the shape it would have been drawn
     * in today rather than on an empty editor.
     */
    _adoptLegacyPer() {
      if (this._steps.some((s) => s.collection.length)) return;
      const dims = [];
      this._steps.forEach((s) => {
        if (s.per && !dims.includes(s.per)) dims.push(s.per);
      });
      dims.forEach((dim, i) => {
        const id = 'g' + (i + 1);
        const members = this._steps.filter((s) => s.per === dim);
        const at = this._steps.indexOf(members[0]);
        members.forEach((s) => { s.parent = id; });
        this._steps.splice(at, 0, {
          task: id,
          name: 'for each ' + dim,
          role: '',
          dep: '',
          script: '',
          parent: '',
          collection: dim,
          join: '',
          complete_when: '',
          sequential: '',
          per: ''
        });
      });
    }

    /** No upstream data: nothing to update. @param {unknown} _cols */
    updateColumns(_cols) { /* no-op */ }
  }

  Blockr.registerBlock({
    name: 'process',
    Block: ProcessBlock,
    messages: {
      'process-block-update': (block, msg) =>
        block.setState(/** @type {{state: ProcessState}} */ (msg).state)
    }
  });
})();
