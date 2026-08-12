// The post-layout banding in srcjs/postlayout.js: lanes become horizontal
// bands, every edge is re-routed, pools and message flows get shapes. The
// auto-layouter is stubbed with a fixed DI, so this exercises only our
// geometry; the R suite (test-bpmn.R) covers the real pipeline end to end.
"use strict";

const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const XMLDOM = path.join(__dirname, "../../srcjs/node_modules/@xmldom/xmldom");

const SEMANTIC = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  id="Definitions_1" targetNamespace="http://blockr.process/bpmn">
  <bpmn:collaboration id="Collaboration_1">
    <bpmn:participant id="Participant_1" name="P" processRef="Process_1"/>
    <bpmn:participant id="Pool_ext" name="Outside"/>
    <bpmn:messageFlow id="MessageFlow_1" sourceRef="Pool_ext" targetRef="b"/>
  </bpmn:collaboration>
  <bpmn:process id="Process_1" name="P" isExecutable="false">
    <bpmn:laneSet id="LaneSet_1">
      <bpmn:lane id="Lane_one" name="one">
        <bpmn:flowNodeRef>s</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>a</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_two" name="two">
        <bpmn:flowNodeRef>b</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>e</bpmn:flowNodeRef>
      </bpmn:lane>
    </bpmn:laneSet>
    <bpmn:startEvent id="s"/>
    <bpmn:userTask id="a" name="A"/>
    <bpmn:receiveTask id="b" name="B"/>
    <bpmn:endEvent id="e"/>
    <bpmn:sequenceFlow id="f1" sourceRef="s" targetRef="a"/>
    <bpmn:sequenceFlow id="f2" sourceRef="a" targetRef="b"/>
    <bpmn:sequenceFlow id="f3" sourceRef="b" targetRef="e"/>
  </bpmn:process>
</bpmn:definitions>`;

// what a stub auto-layouter answers for the stripped process
const LAID = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1">
  <bpmn:process id="Process_1"/>
  <bpmndi:BPMNDiagram id="D">
    <bpmndi:BPMNPlane id="Pl" bpmnElement="Process_1">
      <bpmndi:BPMNShape bpmnElement="s"><dc:Bounds x="100" y="100" width="36" height="36"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape bpmnElement="a"><dc:Bounds x="200" y="80" width="100" height="80"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape bpmnElement="b"><dc:Bounds x="360" y="200" width="100" height="80"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape bpmnElement="e"><dc:Bounds x="520" y="220" width="36" height="36"/></bpmndi:BPMNShape>
      <bpmndi:BPMNEdge bpmnElement="f1"><di:waypoint x="0" y="0"/><di:waypoint x="1" y="1"/></bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

test("postlayout bands lanes, draws pools and routes every edge", { skip: !fs.existsSync(XMLDOM) }, async () => {
  const { DOMParser, XMLSerializer } = require(XMLDOM);
  const { createFinishLayout } = require("../../srcjs/postlayout.js");

  let sawStripped = "";
  const finishLayout = createFinishLayout({
    layoutProcess: async (xml) => {
      sawStripped = xml;
      return LAID;
    },
    DOMParser,
    XMLSerializer
  });

  const out = await finishLayout(SEMANTIC);

  // the layouter never saw the parts that break it
  assert.ok(!/laneSet|collaboration/.test(sawStripped));

  const doc = new DOMParser().parseFromString(out, "text/xml");
  const all = Array.prototype.slice.call(doc.getElementsByTagName("*"));
  const of = (local) => all.filter((el) => el.localName === local);
  const shapeOf = {};
  of("BPMNShape").forEach((sh) => {
    const b = Array.prototype.slice
      .call(sh.getElementsByTagName("*"))
      .filter((el) => el.localName === "Bounds")[0];
    shapeOf[sh.getAttribute("bpmnElement")] = {
      x: +b.getAttribute("x"),
      y: +b.getAttribute("y"),
      w: +b.getAttribute("width"),
      h: +b.getAttribute("height")
    };
  });

  // semantics kept: laneSet and collaboration are back in the output
  assert.ok(/laneSet/.test(out) && /collaboration/.test(out));

  // the plane points at the collaboration, so the pool is rendered
  const plane = of("BPMNPlane")[0];
  assert.strictEqual(plane.getAttribute("bpmnElement"), "Collaboration_1");

  // lanes tile the pool
  const pool = shapeOf["Participant_1"];
  const one = shapeOf["Lane_one"];
  const two = shapeOf["Lane_two"];
  assert.ok(pool && one && two);
  assert.strictEqual(one.h + two.h, pool.h);

  // nodes sit inside their lane's band
  for (const [id, lane] of [["s", one], ["a", one], ["b", two], ["e", two]]) {
    const n = shapeOf[id];
    assert.ok(n.y >= lane.y && n.y + n.h <= lane.y + lane.h, id);
  }

  // the external pool sits fully above the main one
  const ext = shapeOf["Pool_ext"];
  assert.ok(ext.y + ext.h <= pool.y);

  // one edge per sequence flow plus the message flow, each with waypoints
  const edges = of("BPMNEdge");
  assert.strictEqual(edges.length, 4);
  for (const e of edges) {
    const wp = Array.prototype.slice
      .call(e.getElementsByTagName("*"))
      .filter((el) => el.localName === "waypoint");
    assert.ok(wp.length >= 2, e.getAttribute("bpmnElement"));
  }
});
