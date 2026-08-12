// blockr.process BPMN browser bundle: auto-layout + rendering, exposed as global BlockrBpmn
import { layoutProcess } from 'bpmn-auto-layout';
import { BpmnVisualization, FitType } from 'bpmn-visualization';
import { createFinishLayout } from './postlayout.js';

// layout + lane banding + pools, against the browser's own XML machinery
const finishLayout = createFinishLayout({
  layoutProcess: layoutProcess,
  DOMParser: window.DOMParser,
  XMLSerializer: window.XMLSerializer
});

export { layoutProcess, finishLayout, BpmnVisualization, FitType };
