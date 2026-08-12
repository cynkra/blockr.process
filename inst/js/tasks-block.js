// @ts-check
/* The tasks block: the instance's task list, wired to the store.
 *
 * R pushes the whole drawable payload (`tasks-rows`) on every store change;
 * every gesture here -- chip click, assignment, bulk assign --
 * goes straight back as ONE Shiny input event (`<id>_act`) that R turns
 * into instance-store events. Nothing is owned on this side: the next payload
 * is the truth, including what other people just clicked.
 */
(() => {
  'use strict';

  const NOT_FINISHED = ['open', 'doing'];

  /**
   * jsonlite auto_unbox turns length-1 vectors into scalars.
   * @template T
   * @param {T | T[] | null | undefined} x
   * @returns {T[]}
   */
  const arr = (x) => (
    x == null ? [] : Array.isArray(x) ? x : /** @type {T[]} */ ([x])
  );

  /** @param {string} s */
  const finished = (s) => s.length > 0 && NOT_FINISHED.indexOf(s) < 0;

  /**
   * @param {TaskRow} row
   * @returns {string}
   */
  const chipLabel = (row) => {
    const d = row.disp || 'open';
    if (d === 'open') return 'open';
    if (d === 'doing') return 'in progress';
    if (d === 'blocked') {
      return row.waits ? 'waiting for ' + row.waits : 'blocked';
    }
    if (d === 'skipped') return 'skipped';
    if (d === 'done') return 'done';
    return d; // an outcome label: true / false / ...
  };

  /** @param {string} d */
  const chipClass = (d) =>
    d === 'open' || d === 'doing' || d === 'blocked' || d === 'skipped'
      ? d
      : 'finished';

  /** @param {TaskRow} row */
  const keyOf = (row) => row.task + '@' + (row.element || '');

  class TasksBlock {
    /** @param {HTMLElement} el */
    constructor(el) {
      this.el = el;
      /** @type {((submit: boolean) => void) | null} */
      this._callback = null;
      /** @type {TasksPayload} */
      this._payload = { instance: '', version: '', tasks: [], rows: [], counts: {}, roster: [], facets: {} };
      /** @type {{status: string, assignee: string, facets: Record<string, string>}} */
      this._filters = { status: 'all', assignee: '', facets: {} };
      /** @type {Set<string>} */
      this._sel = new Set();
      this._assignTo = '';

      this.el.classList.add('tasks-block');
      this._bar = document.createElement('div');
      this._bar.className = 'tasks-toolbar';
      this._bulk = document.createElement('div');
      this._bulk.className = 'tasks-bulk';
      this._list = document.createElement('div');
      this.el.appendChild(this._bar);
      this.el.appendChild(this._bulk);
      this.el.appendChild(this._list);
      this._render();
      // late-mount handshake: announce, and R re-pushes the payload
      if (window.Shiny) {
        window.Shiny.setInputValue(
          this.el.id + '_ready', Date.now(), { priority: 'event' }
        );
      }
    }

    /* --- R -> JS --- */

    /** @param {TasksPayload} payload */
    updateRows(payload) {
      this._payload = {
        instance: payload.instance || '',
        version: payload.version || '',
        tasks: arr(payload.tasks),
        rows: arr(payload.rows).map((r) => ({
          ...r,
          assignee: r.assignee || '',
          due: r.due || '',
          status: r.status || 'open',
          disp: r.disp || 'open'
        })),
        counts: payload.counts || {},
        roster: arr(payload.roster).map(String),
        facets: payload.facets || {}
      };
      const alive = new Set(this._payload.rows.map(keyOf));
      this._sel.forEach((k) => { if (!alive.has(k)) this._sel.delete(k); });
      this._render();
    }

    /* --- JS -> R: one gesture, one input event --- */

    /**
     * @param {{task: string, element?: string}[]} rows
     * @param {string} field
     * @param {string} value
     * @param {string} [actor]
     */
    _act(rows, field, value, actor) {
      if (!rows.length || !window.Shiny) return;
      window.Shiny.setInputValue(
        this.el.id + '_act',
        {
          rows: rows.map((r) => ({ task: r.task, element: r.element || '' })),
          field,
          value,
          actor: actor || 'board'
        },
        { priority: 'event' }
      );
    }

    /* --- filtering --- */

    /** @param {TaskRow} row */
    _visible(row) {
      const f = this._filters;
      const d = row.disp;
      if (f.status === 'open' && !(d === 'open' || d === 'doing')) return false;
      if (f.status === 'waiting' && d !== 'blocked') return false;
      if (f.status === 'done' && !(finished(d) || d === 'skipped')) return false;
      if (f.assignee && row.assignee !== f.assignee) return false;
      for (const col of Object.keys(f.facets)) {
        const want = f.facets[col];
        if (want && String(/** @type {any} */ (row)[col] || '') !== want) return false;
      }
      return true;
    }

    /* --- rendering --- */

    _render() {
      this._renderToolbar();
      this._renderBulk();
      this._renderList();
    }

    /**
     * @param {HTMLElement} host
     * @param {string[]} options
     * @param {string} selected
     * @param {string} placeholder
     * @param {(v: string) => void} onChange
     */
    _select(host, options, selected, placeholder, onChange) {
      const slot = document.createElement('div');
      slot.className = 'tasks-select';
      host.appendChild(slot);
      Blockr.Select.single(slot, {
        options,
        selected: selected || null,
        allowEmpty: true,
        placeholder,
        onChange: (v) => onChange(String(v || ''))
      });
      return slot;
    }

    _renderToolbar() {
      this._bar.innerHTML = '';
      if (!this._payload.tasks.length) return;

      this._select(
        this._bar, ['open', 'waiting', 'done'],
        this._filters.status === 'all' ? '' : this._filters.status,
        'all', (v) => { this._filters.status = v || 'all'; this._render(); }
      );
      if (this._payload.roster.length) {
        this._select(
          this._bar, this._payload.roster, this._filters.assignee,
          'all assignees', (v) => { this._filters.assignee = v; this._render(); }
        );
      }
      for (const col of Object.keys(this._payload.facets)) {
        this._select(
          this._bar, arr(this._payload.facets[col]).map(String),
          this._filters.facets[col] || '', col,
          (v) => { this._filters.facets[col] = v; this._render(); }
        );
      }

      const meta = document.createElement('span');
      meta.className = 'tasks-meta';
      meta.textContent = 'Instance ' + this._payload.instance +
        (this._payload.version ? ' · version ' + this._payload.version : '');
      this._bar.appendChild(meta);
    }

    _renderBulk() {
      this._bulk.innerHTML = '';
      if (!this._sel.size) {
        this._bulk.classList.remove('tasks-bulk--on');
        return;
      }
      this._bulk.classList.add('tasks-bulk--on');

      const n = document.createElement('span');
      n.className = 'tasks-count';
      n.textContent = this._sel.size + ' selected';
      this._bulk.appendChild(n);

      const selRows = () =>
        this._payload.rows.filter((r) => this._sel.has(keyOf(r)));

      this._select(
        this._bulk, this._payload.roster, this._assignTo, 'assign to…',
        (v) => { this._assignTo = v; }
      );
      const assign = document.createElement('button');
      assign.type = 'button';
      assign.className = 'tasks-btn';
      assign.textContent = 'assign';
      assign.addEventListener('click', () => {
        if (!this._assignTo) return;
        this._act(selRows(), 'assignee', this._assignTo);
        this._sel.clear();
        this._renderBulk();
      });
      this._bulk.appendChild(assign);
    }

    _renderList() {
      this._list.innerHTML = '';
      if (!this._payload.tasks.length) {
        const empty = document.createElement('div');
        empty.className = 'tasks-empty';
        empty.textContent = 'No instance started yet ' +
          '(start_instance() stamps process and collection into the store).';
        this._list.appendChild(empty);
        return;
      }

      this._payload.tasks.forEach((task) => {
        const rows = this._payload.rows.filter((r) => r.task === task.task);
        const shown = rows.filter((r) => this._visible(r));
        const cnt = this._payload.counts[task.task];

        if (task.per) {
          this._list.appendChild(this._sectionHead(task, shown, cnt));
          shown.forEach((r) => this._list.appendChild(this._row(task, r, true)));
        } else if (shown.length) {
          shown.forEach((r) => this._list.appendChild(this._row(task, r, false)));
        }
      });
    }

    /**
     * @param {TaskStep} task
     * @param {TaskRow[]} shown
     * @param {{total: number, done: number, doing: number, blocked: number,
     *   pct: number, pct_doing: number, pct_blocked: number} | undefined} cnt
     */
    _sectionHead(task, shown, cnt) {
      const head = document.createElement('div');
      head.className = 'tasks-section';

      const check = document.createElement('input');
      check.type = 'checkbox';
      check.className = 'tasks-check';
      check.title = 'select all visible';
      check.checked = shown.length > 0 &&
        shown.every((r) => this._sel.has(keyOf(r)));
      check.addEventListener('change', () => {
        shown.forEach((r) => {
          if (check.checked) this._sel.add(keyOf(r));
          else this._sel.delete(keyOf(r));
        });
        this._render();
      });
      head.appendChild(check);

      const name = document.createElement('span');
      name.className = 'tasks-section-name';
      name.textContent = task.name || task.task;
      head.appendChild(name);

      if (cnt) {
        // the states in one bar, in the order an element travels them:
        // done (green), in progress (blue), waiting on a gate (amber); the
        // track shows through for the rest -- not started
        const doing = cnt.doing || 0;
        const blocked = cnt.blocked || 0;
        const rest = Math.max(
          0, (cnt.total || 0) - (cnt.done || 0) - doing - blocked);
        const bar = document.createElement('span');
        bar.className = 'tasks-bar';
        bar.title = [
          cnt.done + ' done', doing + ' in progress',
          blocked + ' waiting', rest + ' not started'
        ].join(', ');
        [
          ['tasks-bar-done', cnt.pct],
          ['tasks-bar-doing', cnt.pct_doing],
          ['tasks-bar-blocked', cnt.pct_blocked]
        ].forEach(([cls, pct]) => {
          const seg = document.createElement('i');
          seg.className = String(cls);
          seg.style.width = (Number(pct) || 0) + '%';
          bar.appendChild(seg);
        });
        head.appendChild(bar);

        const num = document.createElement('span');
        num.className = 'tasks-section-count';
        num.textContent = cnt.done + ' / ' + cnt.total;
        head.appendChild(num);
      }
      return head;
    }

    /**
     * @param {TaskStep} task
     * @param {TaskRow} row
     * @param {boolean} isInstance
     */
    _row(task, row, isInstance) {
      const div = document.createElement('div');
      div.className = 'blockr-row tasks-row' +
        (isInstance ? ' tasks-row--element' : '');

      const check = document.createElement('input');
      check.type = 'checkbox';
      check.className = 'tasks-check';
      check.checked = this._sel.has(keyOf(row));
      check.addEventListener('change', () => {
        if (check.checked) this._sel.add(keyOf(row));
        else this._sel.delete(keyOf(row));
        this._renderBulk();
      });
      div.appendChild(check);

      const name = document.createElement('span');
      name.className = 'tasks-name';
      name.textContent = isInstance ? (row.element || '') : (task.name || task.task);
      const facets = Object.keys(this._payload.facets)
        .map((col) => /** @type {any} */ (row)[col])
        .filter((v) => v);
      if (facets.length) {
        const tag = document.createElement('span');
        tag.className = 'tasks-facet';
        tag.textContent = facets.join(' · ');
        name.appendChild(tag);
      }
      div.appendChild(name);

      // a system task is NOBODY's task: the platform or the worker writes
      // its events -- no assignment, no hand-cycled chip
      const isSystem = task.role === 'system';

      if (isSystem) {
        const auto = document.createElement('span');
        auto.className = 'tasks-auto';
        auto.textContent = 'automatic';
        auto.title = 'The system writes this task (upload platform or ' +
          'worker); nobody ticks it off.';
        div.appendChild(auto);
      } else {
        // assignment: pick from the roster, written to the store immediately
        const whoSlot = document.createElement('div');
        whoSlot.className = 'tasks-select tasks-assignee';
        div.appendChild(whoSlot);
        Blockr.Select.single(whoSlot, {
          options: this._payload.roster.indexOf(row.assignee) < 0 && row.assignee
            ? [row.assignee].concat(this._payload.roster)
            : this._payload.roster,
          selected: row.assignee || null,
          allowEmpty: true,
          placeholder: task.role || 'assignee',
          onChange: (v) => this._act([row], 'assignee', String(v || ''))
        });
      }

      const disp = row.disp || 'open';
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'tasks-chip tasks-chip--' + chipClass(disp);
      chip.textContent = chipLabel(row);
      if (!isSystem && disp !== 'blocked' && disp !== 'skipped') {
        chip.addEventListener('click', () => {
          const terminal = task.outcomes && task.outcomes.length
            ? arr(task.outcomes).map(String)
            : ['done'];
          const cycle = ['open', 'doing'].concat(terminal);
          const cur = row.status || 'open';
          const next = cycle[(cycle.indexOf(cur) + 1) % cycle.length];
          this._act([row], 'status', next, row.assignee || 'board');
        });
      } else {
        chip.disabled = true;
      }
      div.appendChild(chip);

      return div;
    }

    /* --- Blockr protocol: nothing to submit, R owns the state --- */

    getValue() {
      return null;
    }

    /** @param {{store?: string, instance?: string} | null} _state */
    setState(_state) { /* address only; nothing to draw from it */ }
  }

  Blockr.registerBlock({
    name: 'tasks',
    Block: TasksBlock,
    messages: {
      'tasks-rows': (block, msg) =>
        /** @type {TasksBlock} */ (block).updateRows(
          /** @type {{payload: TasksPayload}} */ (msg).payload),
      'tasks-block-update': (block, msg) =>
        block.setState(/** @type {{state: any}} */ (msg).state)
    }
  });
})();
