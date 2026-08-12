// blockr.process node CLI: read semantic BPMN XML on stdin, write laid-out XML on stdout
import { layoutProcess } from 'bpmn-auto-layout';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { createFinishLayout } from './postlayout.js';

const finishLayout = createFinishLayout({
  layoutProcess,
  DOMParser,
  XMLSerializer
});

const chunks = [];
process.stdin.on('data', (c) => chunks.push(c));
process.stdin.on('end', async () => {
  try {
    const input = Buffer.concat(chunks).toString('utf8');
    process.stdout.write(await finishLayout(input));
  } catch (e) {
    process.stderr.write(String(e && e.stack ? e.stack : e));
    process.exit(1);
  }
});
