// Post-layout for lanes, pools and message flows.
//
// bpmn-auto-layout (1.3.0) drops every sequence-flow edge as soon as the
// process carries a laneSet, and it does not lay out collaborations at
// all. So the semantic XML blockr.process emits (laneSet + collaboration +
// message flows) is laid out in three steps:
//
//   1. strip: remove laneSet and collaboration, keep the bare process
//   2. layout: bpmn-auto-layout computes shape coordinates for that
//   3. band: re-impose the lanes as horizontal bands (nodes keep their x,
//      each lane stacks its nodes into rows), re-route every edge
//      orthogonally against the new coordinates, draw the pool, the
//      collapsed external pools and the message flows
//
// One implementation for both hosts: the browser widget passes the native
// DOMParser/XMLSerializer, the node CLI passes @xmldom/xmldom.

const NS = {
  bpmn: 'http://www.omg.org/spec/BPMN/20100524/MODEL',
  bpmndi: 'http://www.omg.org/spec/BPMN/20100524/DI',
  dc: 'http://www.omg.org/spec/DD/20100524/DC',
  di: 'http://www.omg.org/spec/DD/20100524/DI'
};
const XMLNS = 'http://www.w3.org/2000/xmlns/';

// geometry constants (px, the BPMN-tool convention of ~100x80 tasks)
const ROW_H = 100; // one row of nodes inside a lane
const LANE_PAD = 12; // above the first and below the last row
const LANE_LABEL_W = 30; // the rotated lane label strip
const POOL_LABEL_W = 30; // the rotated pool label strip
const H_GAP = 20; // minimal x gap when assigning rows
const EXT_POOL_H = 60; // a collapsed external pool
const EXT_POOL_GAP = 30;
const POOL_MARGIN_X = 50; // node bbox -> pool border
const POOL_ORIGIN = { x: 40, y: 40 };

function byLocalName(root, local) {
  const out = [];
  const all = root.getElementsByTagName('*');
  for (let i = 0; i < all.length; i++) {
    const el = all[i];
    if ((el.localName || el.nodeName.replace(/^.*:/, '')) === local) out.push(el);
  }
  return out;
}

function removeAll(doc, local) {
  byLocalName(doc, local).forEach(function (el) {
    if (el.parentNode) el.parentNode.removeChild(el);
  });
}

export function createFinishLayout(env) {
  const layoutProcess = env.layoutProcess;
  const DOMParserImpl = env.DOMParser;
  const XMLSerializerImpl = env.XMLSerializer;

  const parse = function (xml) {
    return new DOMParserImpl().parseFromString(xml, 'text/xml');
  };
  const serialize = function (doc) {
    return new XMLSerializerImpl().serializeToString(doc);
  };

  return async function finishLayout(xml) {
    const semDoc = parse(xml);

    // -- what the semantics carry beyond a bare process ---------------------
    const laneEls = byLocalName(semDoc, 'lane');
    const lanes = laneEls.map(function (el) {
      return {
        id: el.getAttribute('id'),
        name: el.getAttribute('name') || el.getAttribute('id'),
        refs: byLocalName(el, 'flowNodeRef').map(function (r) {
          return (r.textContent || '').trim();
        })
      };
    });
    const collabEl = byLocalName(semDoc, 'collaboration')[0] || null;
    const participants = collabEl
      ? byLocalName(collabEl, 'participant').map(function (el) {
          return {
            id: el.getAttribute('id'),
            name: el.getAttribute('name') || '',
            processRef: el.getAttribute('processRef')
          };
        })
      : [];
    const messageFlows = collabEl
      ? byLocalName(collabEl, 'messageFlow').map(function (el) {
          return {
            id: el.getAttribute('id'),
            sourceRef: el.getAttribute('sourceRef'),
            targetRef: el.getAttribute('targetRef')
          };
        })
      : [];

    // nothing special: the auto-layouter's own DI is fine as it is
    if (!lanes.length && !collabEl) {
      const plain = await layoutProcess(xml);
      return typeof plain === 'string' ? plain : plain.xml;
    }

    // -- strip to the bare process, lay that out ----------------------------
    const stripped = parse(xml);
    removeAll(stripped, 'laneSet');
    removeAll(stripped, 'collaboration');
    removeAll(stripped, 'BPMNDiagram');
    const laidRes = await layoutProcess(serialize(stripped));
    const laidDoc = parse(typeof laidRes === 'string' ? laidRes : laidRes.xml);

    // -- collect the laid-out geometry ---------------------------------------
    const geo = {}; // node id -> {x, y, w, h}
    byLocalName(laidDoc, 'BPMNShape').forEach(function (sh) {
      const b = byLocalName(sh, 'Bounds')[0];
      if (!b) return;
      geo[sh.getAttribute('bpmnElement')] = {
        x: parseFloat(b.getAttribute('x')),
        y: parseFloat(b.getAttribute('y')),
        w: parseFloat(b.getAttribute('width')),
        h: parseFloat(b.getAttribute('height'))
      };
    });

    const seqFlows = byLocalName(semDoc, 'sequenceFlow').map(function (el) {
      return {
        id: el.getAttribute('id'),
        sourceRef: el.getAttribute('sourceRef'),
        targetRef: el.getAttribute('targetRef')
      };
    });

    const externalPools = participants.filter(function (p) {
      return !p.processRef;
    });
    const mainPool = participants.filter(function (p) {
      return !!p.processRef;
    })[0] || null;

    // -- band the nodes into lanes -------------------------------------------
    const nodeIds = Object.keys(geo);
    const poolX = POOL_ORIGIN.x;
    const poolY = POOL_ORIGIN.y + externalPools.length * (EXT_POOL_H + EXT_POOL_GAP);
    const laneBounds = {}; // lane id -> {x, y, w, h}
    let poolW;
    let poolH;

    if (lanes.length) {
      const laneOf = {};
      lanes.forEach(function (ln) {
        ln.refs.forEach(function (id) {
          laneOf[id] = ln.id;
        });
      });
      // a node the laneSet missed goes to the first lane
      nodeIds.forEach(function (id) {
        if (!laneOf[id]) laneOf[id] = lanes[0].id;
      });

      // lanes ordered by where the auto-layout put their nodes
      const meanY = {};
      lanes.forEach(function (ln) {
        const ys = nodeIds
          .filter(function (id) {
            return laneOf[id] === ln.id;
          })
          .map(function (id) {
            return geo[id].y + geo[id].h / 2;
          });
        meanY[ln.id] = ys.length
          ? ys.reduce(function (a, b) {
              return a + b;
            }, 0) / ys.length
          : Infinity;
      });
      const ordered = lanes.slice().sort(function (a, b) {
        return meanY[a.id] - meanY[b.id];
      });

      // x stays, min-x normalized to leave room for the label strips
      const minX = Math.min.apply(
        null,
        nodeIds.map(function (id) {
          return geo[id].x;
        })
      );
      const shiftX = poolX + POOL_LABEL_W + LANE_LABEL_W + 30 - minX;

      let top = poolY;
      ordered.forEach(function (ln) {
        const members = nodeIds
          .filter(function (id) {
            return laneOf[id] === ln.id;
          })
          .sort(function (a, b) {
            return geo[a].x - geo[b].x || geo[a].y - geo[b].y;
          });

        // greedy row assignment: a node joins the first row it does not
        // overlap in x, so parallel branches stack instead of colliding
        const rowEnd = [];
        members.forEach(function (id) {
          const g = geo[id];
          let row = 0;
          while (row < rowEnd.length && g.x < rowEnd[row] + H_GAP) row++;
          rowEnd[row] = g.x + g.w;
          g.x += shiftX;
          g.y = top + LANE_PAD + row * ROW_H + (ROW_H - g.h) / 2;
        });

        const nRows = Math.max(rowEnd.length, 1);
        const h = 2 * LANE_PAD + nRows * ROW_H;
        laneBounds[ln.id] = { x: poolX + POOL_LABEL_W, y: top, h: h };
        top += h;
      });
      poolH = top - poolY;
    } else {
      // no lanes (message flows only): keep the layout, shift into the pool
      const minX = Math.min.apply(null, nodeIds.map(function (id) { return geo[id].x; }));
      const minY = Math.min.apply(null, nodeIds.map(function (id) { return geo[id].y; }));
      const shiftX = poolX + POOL_LABEL_W + 30 - minX;
      const shiftY = poolY + 30 - minY;
      nodeIds.forEach(function (id) {
        geo[id].x += shiftX;
        geo[id].y += shiftY;
      });
      poolH =
        Math.max.apply(null, nodeIds.map(function (id) { return geo[id].y + geo[id].h; })) +
        30 -
        poolY;
    }

    const maxX = Math.max.apply(
      null,
      nodeIds.map(function (id) {
        return geo[id].x + geo[id].w;
      })
    );
    poolW = maxX + POOL_MARGIN_X - poolX;
    Object.keys(laneBounds).forEach(function (id) {
      laneBounds[id].w = poolW - POOL_LABEL_W;
    });

    // -- external pools above the main one -----------------------------------
    const extBounds = {};
    externalPools.forEach(function (p, i) {
      extBounds[p.id] = {
        x: poolX,
        y: POOL_ORIGIN.y + i * (EXT_POOL_H + EXT_POOL_GAP),
        w: poolW,
        h: EXT_POOL_H
      };
    });

    // -- orthogonal edge routing against the new coordinates -----------------
    const center = function (g) {
      return { x: g.x + g.w / 2, y: g.y + g.h / 2 };
    };
    const route = function (s, t) {
      const sc = center(s);
      const tc = center(t);
      if (t.x >= s.x + s.w) {
        // forward: out the right side, into the left side
        const sx = s.x + s.w;
        const tx = t.x;
        if (Math.abs(sc.y - tc.y) < 1) {
          return [
            [sx, sc.y],
            [tx, tc.y]
          ];
        }
        const mx = (sx + tx) / 2;
        return [
          [sx, sc.y],
          [mx, sc.y],
          [mx, tc.y],
          [tx, tc.y]
        ];
      }
      if (t.y > s.y + s.h || t.y + t.h < s.y) {
        // no forward room but clear vertical separation: connect the
        // facing horizontal sides
        const down = t.y > s.y;
        const sy = down ? s.y + s.h : s.y;
        const ty = down ? t.y : t.y + t.h;
        const my = (sy + ty) / 2;
        return [
          [sc.x, sy],
          [sc.x, my],
          [tc.x, my],
          [tc.x, ty]
        ];
      }
      // loop-back: duck under both nodes
      const under = Math.max(s.y + s.h, t.y + t.h) + 30;
      return [
        [sc.x, s.y + s.h],
        [sc.x, under],
        [tc.x, under],
        [tc.x, t.y + t.h]
      ];
    };

    // -- rebuild the DI --------------------------------------------------------
    const root = semDoc.documentElement;
    ['bpmndi', 'dc', 'di'].forEach(function (p) {
      if (!root.getAttribute('xmlns:' + p)) {
        root.setAttributeNS(XMLNS, 'xmlns:' + p, NS[p]);
      }
    });
    removeAll(semDoc, 'BPMNDiagram');

    const mk = function (parent, qname, attrs) {
      const ns = NS[qname.split(':')[0]];
      const el = semDoc.createElementNS(ns, qname);
      Object.keys(attrs || {}).forEach(function (k) {
        el.setAttribute(k, String(attrs[k]));
      });
      parent.appendChild(el);
      return el;
    };
    const shape = function (plane, id, ref, b, horizontal) {
      const sh = mk(plane, 'bpmndi:BPMNShape', { id: id, bpmnElement: ref });
      if (horizontal) sh.setAttribute('isHorizontal', 'true');
      mk(sh, 'dc:Bounds', { x: b.x, y: b.y, width: b.w, height: b.h });
      return sh;
    };
    const edge = function (plane, id, ref, pts) {
      const ed = mk(plane, 'bpmndi:BPMNEdge', { id: id, bpmnElement: ref });
      pts.forEach(function (p) {
        mk(ed, 'di:waypoint', { x: p[0], y: p[1] });
      });
      return ed;
    };

    const diagram = mk(root, 'bpmndi:BPMNDiagram', { id: 'BPMNDiagram_1' });
    const procEl = byLocalName(semDoc, 'process')[0];
    const plane = mk(diagram, 'bpmndi:BPMNPlane', {
      id: 'BPMNPlane_1',
      bpmnElement: collabEl
        ? collabEl.getAttribute('id')
        : procEl.getAttribute('id')
    });

    if (mainPool) {
      shape(
        plane,
        'Shape_' + mainPool.id,
        mainPool.id,
        { x: poolX, y: poolY, w: poolW, h: poolH },
        true
      );
    }
    Object.keys(laneBounds).forEach(function (id) {
      shape(plane, 'Shape_' + id, id, laneBounds[id], true);
    });
    externalPools.forEach(function (p) {
      shape(plane, 'Shape_' + p.id, p.id, extBounds[p.id], true);
    });
    nodeIds.forEach(function (id) {
      shape(plane, 'Shape_' + id, id, geo[id], false);
    });
    seqFlows.forEach(function (f) {
      const s = geo[f.sourceRef];
      const t = geo[f.targetRef];
      if (!s || !t) return;
      edge(plane, 'Edge_' + f.id, f.id, route(s, t));
    });
    messageFlows.forEach(function (f) {
      const sPool = extBounds[f.sourceRef];
      const tPool = extBounds[f.targetRef];
      const s = sPool || geo[f.sourceRef];
      const t = tPool || geo[f.targetRef];
      if (!s || !t) return;
      // vertical connector; anchored at the node end's center x
      const ax = center(tPool ? s : t).x;
      const pts =
        s.y + s.h <= t.y
          ? [
              [ax, s.y + s.h],
              [ax, t.y]
            ]
          : [
              [ax, s.y],
              [ax, t.y + t.h]
            ];
      edge(plane, 'Edge_' + f.id, f.id, pts);
    });

    return serialize(semDoc);
  };
}
