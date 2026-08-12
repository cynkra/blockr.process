/* Process editor tests: `npm test` (i.e. `node --test tests/js/`).
 *
 * The subject is the one thing in `process-block.js` that is real logic
 * rather than DOM: LOWERING. BPMN forbids a sequence flow that crosses a
 * sub-process boundary, so an edge leaving a group is stored on the
 * CONTAINER and lowered onto the group's exits for drawing (and its
 * entries, for a container's own dependency). R does the same in
 * `process_body()`; these two implementations must agree, and
 * the R side has the mirror of every case below in
 * `tests/testthat/test-wide.R`.
 *
 * The DOM is stubbed to the handful of calls the block makes on the way
 * through the constructor -- enough to build the model, not enough to
 * render. What renders is verified in the app, not here.
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

/* ---- the smallest DOM the block will start on ---- */

const el = (tag) => ({
  tagName: tag, className: '', textContent: '', title: '', type: '',
  children: [], style: {}, dataset: {},
  classList: { add() {}, remove() {}, contains() { return false; } },
  appendChild(c) { this.children.push(c); return c; },
  addEventListener() {}, querySelector() { return null; },
  querySelectorAll() { return []; }, focus() {}, blur() {},
  set innerHTML(_) {}, get innerHTML() { return ''; }
});

global.document = { createElement: el, body: el('body') };
global.setTimeout = (f) => f && 0;
global.minidagRail = { create: () => ({ setData() {} }) };
global.Blockr = {
  Select: { single() {} },
  registerBlock(def) { global.__block = def; }
};
global.window = { Shiny: null };

eval(fs.readFileSync(
  path.join(__dirname, '../../inst/js/process-block.js'), 'utf8'
));

/* ---- fixtures ---- */

const step = (o) => Object.assign({
  task: '', name: '', role: '', dep: '', script: '', parent: '',
  collection: '', join: '', complete_when: '', sequential: ''
}, o);

function build(steps) {
  const root = el('div');
  root.id = 'pb';
  const b = new (global.__block.Block)(root);
  b.setState({ tasks: steps });
  return b;
}

/** register -> [for each unit: delivery -> review] -> approve_data */
const grouped = () => [
  step({ task: 'register', name: 'Register', role: 'system' }),
  step({ task: 'each_unit', name: 'for each unit', collection: 'unit',
         dep: 'register' }),
  step({ task: 'delivery', name: 'Delivery', parent: 'each_unit' }),
  step({ task: 'review', name: 'Review', parent: 'each_unit',
         dep: 'delivery' }),
  step({ task: 'approve_data', name: 'Approve', dep: 'each_unit' })
];

const edges = (b) => b._model().links.map((l) => l.from + '>' + l.to).sort();

/* ---- lowering ---- */

test('a container token lowers in both directions', () => {
  assert.deepStrictEqual(edges(build(grouped())), [
    'delivery>review',
    'register>delivery',      // each_unit depends_on register -> the group's entry
    'review>approve_data'     // approve_data depends_on each_unit -> the group's exit
  ]);
});

test('naming a member from outside draws the same graph', () => {
  // which is why definitions written before containers were addressable
  // keep working unchanged
  const raw = grouped();
  raw[1].dep = '';
  raw[2].dep = 'register';
  raw[4].dep = 'review';

  assert.deepStrictEqual(edges(build(raw)), edges(build(grouped())));
});

test('an outcome qualifier rides through the lowering', () => {
  const raw = grouped();
  raw[4].dep = 'each_unit:done';

  const l = build(raw)._model().links.find((x) => x.to === 'approve_data');
  assert.strictEqual(l.input, 'done');
});

test('two groups feeding one task both lower', () => {
  const raw = grouped().concat([
    step({ task: 'each_region', name: 'for each region', collection: 'region' }),
    step({ task: 'region_check', name: 'Region check', parent: 'each_region' })
  ]);
  raw[4].dep = 'each_unit, each_region';

  assert.deepStrictEqual(
    build(raw)._model().links
      .filter((l) => l.to === 'approve_data').map((l) => l.from).sort(),
    ['region_check', 'review']
  );
});

/* ---- gestures ---- */

test('an edge leaving a group is stored on the container', () => {
  const b = build(grouped());
  b._steps.find((s) => s.task === 'approve_data').dep = '';

  b._addDep('review', 'approve_data', '');
  assert.strictEqual(b._steps.find((s) => s.task === 'approve_data').dep, 'each_unit');
});

test('an edge INTO a group stays a plain member edge', () => {
  // nothing is ambiguous in that direction: every element waits for the
  // one task, which is the fan-out
  const b = build(grouped());

  b._addDep('register', 'review', '');
  assert.strictEqual(
    b._steps.find((s) => s.task === 'review').dep, 'delivery, register'
  );
});

test('removing a lowered edge kills the token it came from', () => {
  const b = build(grouped());
  b._model();                       // populates _linkSrc

  b._removeDeps(['review>approve_data']);
  assert.strictEqual(b._steps.find((s) => s.task === 'approve_data').dep, '');
});

test('ungrouping preserves the flow through the frame', () => {
  const b = build(grouped());

  b._removeGroup('each_unit');
  const by = Object.fromEntries(b._steps.map((s) => [s.task, s.dep]));
  assert.strictEqual(by.approve_data, 'review');
  assert.strictEqual(by.delivery, 'register');
  assert.ok(!b._steps.some((s) => s.task === 'each_unit'));
});

/* ---- what the row says ---- */

test('the join chip says the group completion quorum', () => {
  const raw = grouped();
  const node = build(raw)._model().blocks.find((x) => x.id === 'approve_data');

  assert.strictEqual(
    build(raw)._joinChip(node).textContent, 'waits for all unit'
  );
  raw[1].complete_when = 'pct=90';
  assert.strictEqual(
    build(raw)._joinChip(node).textContent, 'waits for 90% of unit'
  );
  raw[1].complete_when = 'n=3';
  assert.strictEqual(
    build(raw)._joinChip(node).textContent, 'waits for 3 of unit'
  );
});

test('a member of the group joins nothing', () => {
  const b = build(grouped());
  const node = b._model().blocks.find((x) => x.id === 'review');

  assert.strictEqual(b._joinChip(node), null);
});

/* ---- legacy ---- */

test('a pre-group `per` definition still migrates to a group', () => {
  const b = build([
    { task: 'a', name: 'A', per: 'unit' },
    { task: 'b', name: 'B', dep: 'a', per: 'unit' },
    { task: 'c', name: 'C', dep: 'b' }
  ]);

  assert.strictEqual(b._groups().length, 1);
  assert.strictEqual(b._groups()[0].collection, 'unit');
  assert.deepStrictEqual(edges(b), ['a>b', 'b>c']);
});
