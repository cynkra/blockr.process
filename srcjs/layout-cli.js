// blockr.process node CLI: read semantic BPMN XML on stdin, write laid-out XML on stdout
import { layoutProcess } from 'bpmn-auto-layout';

const chunks = [];
process.stdin.on('data', (c) => chunks.push(c));
process.stdin.on('end', async () => {
  try {
    const input = Buffer.concat(chunks).toString('utf8');
    const res = await layoutProcess(input);
    const xml = typeof res === 'string' ? res : res.xml;
    process.stdout.write(xml);
    if (res && res.warnings && res.warnings.length) {
      process.stderr.write(JSON.stringify(res.warnings));
    }
  } catch (e) {
    process.stderr.write(String(e && e.stack ? e.stack : e));
    process.exit(1);
  }
});
