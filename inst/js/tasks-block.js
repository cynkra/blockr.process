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

  /** Sections with more elements than this start folded. */
  const FOLD_ABOVE = 25;
  /** Elements drawn per unfolded section before the "show the rest" line. */
  const PAGE = 200;

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

  /**
   * Sort rank of a display status: what still needs somebody, first. Sorting
   * by status is how you answer "which ones are not in yet" on a collection
   * of a few thousand -- scrolling for the handful of open ones among two
   * thousand done is not an answer.
   * @param {string} d
   */
  const rank = (d) => {
    const i = ['open', 'doing', 'blocked', 'skipped', 'done'].indexOf(d);
    return i < 0 ? 4 : i;   // an outcome label (true/false/...) counts as done
  };

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
      /**
       * Task ids whose element list is unfolded. A collapsed section is a
       * heading and a bar; an unfolded one is a DOM node per element, and a
       * process that repeats over a few thousand of them (the FS
       * Jahreserhebung: 2115 Gemeinden, 8462 rows) takes half a minute to
       * paint if every section unfolds itself. Sections above
       * FOLD_ABOVE start folded, so what you see first is where the whole
       * thing stands; small processes are unaffected and look as before.
       * @type {Set<string>}
       */
      this._open = new Set();
      /** Elements rendered per unfolded section before "show the rest". */
      this._cap = {};
      /** `status` (what needs doing first) or `id` (the collection's order). */
      this._sort = 'status';

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

      // Sorting, not just filtering: filtering to `open` hides how many are
      // done, and the count in the section head is what you compare against.
      // Spelled "by ..." so it cannot be read as a second status filter.
      // Plain strings, not {value, label} pairs: this select renders both
      // parts of a pair (it is built for code + description, as in the
      // Haushalt picker), which would read "statusby status" here.
      this._select(
        this._bar, ['by status', 'by id'],
        this._sort === 'id' ? 'by id' : 'by status', 'sort',
        (v) => { this._sort = v === 'by id' ? 'id' : 'status'; this._render(); }
      );

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

      // One pass to group, not one scan of every row per task: with 8462
      // rows and seven tasks the filter-per-task was most of the work before
      // a single node was made.
      /** @type {Record<string, TaskRow[]>} */
      const byTask = {};
      this._payload.rows.forEach((r) => {
        if (!this._visible(r)) return;
        (byTask[r.task] = byTask[r.task] || []).push(r);
      });

      if (this._sort === 'status') {
        // Stable within a status, so the collection's own order still holds
        // inside each group and an element does not jump about as it moves.
        Object.keys(byTask).forEach((k) => {
          byTask[k] = byTask[k]
            .map((r, i) => ({ r: r, i: i }))
            .sort((a, b) => {
              const d = rank(a.r.disp || 'open') - rank(b.r.disp || 'open');
              return d !== 0 ? d : a.i - b.i;
            })
            .map((x) => x.r);
        });
      }

      this._payload.tasks.forEach((task) => {
        const shown = byTask[task.task] || [];
        const cnt = this._payload.counts[task.task];

        if (task.per) {
          const open = this._isOpen(task.task, shown.length);
          this._list.appendChild(this._sectionHead(task, shown, cnt, open));
          if (!open) return;

          const cap = this._cap[task.task] || PAGE;
          shown.slice(0, cap).forEach(
            (r) => this._list.appendChild(this._row(task, r, true))
          );
          if (shown.length > cap) {
            this._list.appendChild(this._more(task.task, cap, shown.length));
          }
        } else if (shown.length) {
          shown.forEach((r) => this._list.appendChild(this._row(task, r, false)));
        }
      });
    }

    /**
     * Folded or not: what the user last clicked, else folded when the section
     * is big enough for painting it to be felt.
     * @param {string} task
     * @param {number} n
     */
    _isOpen(task, n) {
      if (this._open.has(task)) return true;
      if (this._open.has('!' + task)) return false;   // folded by hand
      return n <= FOLD_ABOVE;
    }

    /**
     * @param {string} task
     * @param {number} cap
     * @param {number} total
     */
    _more(task, cap, total) {
      const more = document.createElement('button');
      more.type = 'button';
      more.className = 'tasks-more';
      more.textContent = 'show ' + Math.min(PAGE, total - cap) +
        ' more of ' + total;
      more.addEventListener('click', () => {
        this._cap[task] = cap + PAGE;
        this._render();
      });
      return more;
    }

    /**
     * @param {TaskStep} task
     * @param {TaskRow[]} shown
     * @param {{total: number, done: number, doing: number, blocked: number,
     *   pct: number, pct_doing: number, pct_blocked: number} | undefined} cnt
     */
    _sectionHead(task, shown, cnt, open) {
      const head = document.createElement('div');
      head.className = 'tasks-section';

      // Same chevron as blockr.viz's tables (section_chevron_svg()), same
      // contract: the SECTION carries `collapsed` and the CSS turns the
      // icon, so there is one rotation rule rather than two glyphs.
      if (!open) head.classList.add('collapsed');

      const fold = document.createElement('button');
      fold.type = 'button';
      fold.className = 'tasks-fold';
      fold.setAttribute('aria-expanded', open ? 'true' : 'false');
      fold.title = open ? 'fold' : 'unfold';
      fold.innerHTML = '<svg class="blockr-chev" viewBox="0 0 24 24" ' +
        'fill="none" stroke="currentColor" stroke-width="2.4" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M6 9l6 6 6-6"/></svg>';
      fold.addEventListener('click', () => {
        // Both directions are remembered: a section folded by hand stays
        // folded even when a filter leaves few enough rows to auto-unfold it.
        if (open) {
          this._open.delete(task.task);
          this._open.add('!' + task.task);
        } else {
          this._open.delete('!' + task.task);
          this._open.add(task.task);
        }
        this._render();
      });
      head.appendChild(fold);

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
