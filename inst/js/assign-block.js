// @ts-check
(() => {
  'use strict';

  const NOT_FINISHED = ['open', 'doing'];

  /** @typedef {'assignee' | 'due' | 'status'} RunField */

  class RunBlock {
    /** @param {HTMLElement} el */
    constructor(el) {
      this.el = el;
      /** @type {((submit: boolean) => void) | null} */
      this._callback = null;
      this._submitted = false;
      /** @type {ReturnType<typeof setTimeout> | undefined} */
      this._debounceTimer = undefined;
      /** @type {StepMeta[]} */
      this._steps = [];
      /**
       * Allowed values per instance column, when the incoming data carries them
       * as factor levels. Empty means the field stays free text.
       * @type {Record<string, string[]>}
       */
      this._levels = {};
      /** @type {Record<string, RunAssignment>} */
      this._assignments = {};
      /** @type {HTMLDivElement} */
      this._list = document.createElement('div');
      this._buildDOM();
    }

    _autoSubmit() {
      clearTimeout(this._debounceTimer);
      this._debounceTimer = setTimeout(() => this._submit(), 300);
    }

    _buildDOM() {
      this.el.classList.add('assign-block');
      this.el.appendChild(this._list);
      this._render();
      // late-mount handshake (see process-block.js)
      if (window.Shiny) {
        window.Shiny.setInputValue(
          this.el.id + '_ready', Date.now(), { priority: 'event' }
        );
      }
    }

    /**
     * Effective (assignment-overridden) field value for a task.
     * @param {StepMeta} task
     * @param {RunField} field
     * @returns {string}
     */
    _val(task, field) {
      const a = this._assignments[task.task];
      const v = a ? a[field] : undefined;
      if (v !== undefined && v !== null) return String(v);
      return String(task[field] || '');
    }

    /**
     * Stored -> displayed status: compute blocked/skipped for open tasks.
     * @param {StepMeta} task
     * @returns {string}
     */
    _displayStatus(task) {
      const s = this._val(task, 'status') || 'open';
      if (s !== 'open') return s;
      /** @type {Record<string, string>} */
      const stored = {};
      this._steps.forEach((m) => { stored[m.task] = this._val(m, 'status') || 'open'; });
      let waiting = false, mismatch = false;
      (task.gates || []).forEach((g) => {
        const ds = stored[g.on] || 'open';
        const finished = NOT_FINISHED.indexOf(ds) < 0 && ds.length > 0;
        if (!finished) waiting = true;
        else if (g.label && ds !== g.label) mismatch = true;
      });
      return mismatch ? 'skipped' : waiting ? 'blocked' : 'open';
    }

    /**
     * Assignee does this task: a picker when the incoming `assignee` column is a
     * factor (its levels are the roster), free text when it is not. The
     * vocabulary is a property of the DATA -- upstream declares it with a
     * stock mutate block -- so this block never carries a list of people.
     * @param {StepMeta} task
     * @param {string} hint
     * @returns {HTMLElement}
     */
    _whoField(task, hint) {
      const roster = this._levels.assignee || [];
      const current = this._val(task, 'assignee');

      if (!roster.length) {
        const assignee = document.createElement('input');
        assignee.type = 'text';
        assignee.className = 'assign-assignee';
        assignee.placeholder = hint;
        assignee.value = current;
        assignee.addEventListener('input', () =>
          this._set(task.task, 'assignee', assignee.value.trim()));
        return assignee;
      }

      const slot = document.createElement('div');
      slot.className = 'assign-assignee assign-assignee-select';
      Blockr.Select.single(slot, {
        // a name already in the data but not in the levels would otherwise
        // vanish from its own row
        options: roster.indexOf(current) < 0 && current
          ? [current].concat(roster) : roster,
        selected: current || null,
        allowEmpty: true,
        placeholder: hint,
        onChange: (v) => this._set(task.task, 'assignee', String(v || ''))
      });
      return slot;
    }

    /**
     * Status values a click cycles through for this task.
     * @param {StepMeta} task
     * @returns {string[]}
     */
    _cycle(task) {
      const terminal = (task.outcomes && task.outcomes.length) ? task.outcomes : ['done'];
      return ['open', 'doing'].concat(terminal);
    }

    /**
     * @param {string} stepId
     * @param {RunField} field
     * @param {string} value
     */
    _set(stepId, field, value) {
      if (!this._assignments[stepId]) this._assignments[stepId] = {};
      this._assignments[stepId][field] = value;
      this._autoSubmit();
    }

    _render() {
      this._list.innerHTML = '';
      if (!this._steps.length) {
        const empty = document.createElement('div');
        empty.className = 'assign-empty';
        empty.textContent = 'Connect a process table to assign its tasks.';
        this._list.appendChild(empty);
        return;
      }
      this._steps.forEach((task) => {
        const row = document.createElement('div');
        row.className = 'blockr-row assign-row';

        const name = document.createElement('div');
        name.className = 'assign-name';
        name.textContent = task.name || task.task;
        const id = document.createElement('span');
        id.className = 'assign-id';
        id.textContent = task.task;
        name.appendChild(id);
        row.appendChild(name);

        // the lane as the hint: assigning turns the role into a person
        const hint = task.role && task.role !== 'system' ? task.role : 'assignee';
        row.appendChild(this._whoField(task, hint));

        const due = document.createElement('input');
        due.type = 'date';
        due.className = 'assign-due';
        due.value = this._val(task, 'due');
        due.addEventListener('change', () => this._set(task.task, 'due', due.value));
        row.appendChild(due);

        const disp = this._displayStatus(task);
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'assign-chip assign-chip--' + this._chipClass(disp);
        chip.textContent = disp === 'doing' ? 'in progress' : disp;
        if (disp !== 'blocked' && disp !== 'skipped') {
          chip.addEventListener('click', () => {
            const cycle = this._cycle(task);
            const cur = this._val(task, 'status') || 'open';
            const next = cycle[(cycle.indexOf(cur) + 1) % cycle.length];
            this._set(task.task, 'status', next);
            this._render();
          });
        } else {
          chip.disabled = true;
        }
        row.appendChild(chip);

        this._list.appendChild(row);
      });
    }

    /**
     * @param {string} s
     * @returns {string}
     */
    _chipClass(s) {
      if (s === 'open' || s === 'doing' || s === 'blocked' || s === 'skipped') return s;
      return 'finished';
    }

    /** @returns {RunState} */
    _compose() {
      return { assignments: this._assignments };
    }

    _submit() {
      this._submitted = true;
      if (this._callback) this._callback(true);
    }

    getValue() {
      return this._submitted ? this._compose() : null;
    }

    /** @param {RunState | null} state */
    setState(state) {
      const a = state && state.assignments;
      // jsonlite may deliver an empty named list as [] -- normalize to {}
      this._assignments = (a && !Array.isArray(a)) ? a : {};
      this._render();
    }

    /** @param {RunColumnsMeta} meta */
    updateSteps(meta) {
      this._steps = Array.isArray(meta.tasks) ? meta.tasks : [];
      this._levels = meta.levels || {};
      this._render();
    }
  }

  Blockr.registerBlock({
    name: 'assign',
    Block: RunBlock,
    messages: {
      'assign-columns': (block, msg) =>
        /** @type {RunBlock} */ (block).updateSteps(
          /** @type {{columns: RunColumnsMeta}} */ (msg).columns),
      'assign-block-update': (block, msg) =>
        block.setState(/** @type {{state: RunState}} */ (msg).state)
    }
  });
})();
