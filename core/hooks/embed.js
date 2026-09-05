const fs = require('fs');
const path = require('path');
const { isContractName, field, fault } = require('./schema.js');

// The contract rides inside the Agent prompt between these two lines, so the
// coordinator never spends a turn writing the file. The hook writes it at
// PreToolUse, before the agent exists - no race with the agent's first call.
const OPEN = '<<<SOZLESME>>>';
const CLOSE = '<<</SOZLESME>>>';
const PATH = /contracts[\\/]+(?:done[\\/]+)?([A-Za-z]{1,12}\d{1,4}[A-Za-z]{0,3})\.md/i;

function block(prompt) {
  const text = String(prompt || '').replace(/\r\n/g, '\n');
  const a = text.indexOf(OPEN);
  if (a < 0) return null;
  const b = text.indexOf(CLOSE, a + OPEN.length);
  if (b < 0) throw new Error('The embedded contract opens with ' + OPEN + ' and never closes with ' + CLOSE + '.');
  return text.slice(a + OPEN.length, b).replace(/^\s*\n/, '').replace(/\s+$/, '') + '\n';
}

function materialize(relay, prompt) {
  const body = block(prompt);
  if (body === null) return null;
  const m = PATH.exec(String(prompt || ''));
  if (!m) throw new Error('The prompt embeds a contract but names no contracts/<ID>.md path to write it to.');
  const id = m[1];
  const declared = field('id', body);
  if (!declared) throw new Error('The embedded contract has no id: line.');
  if (declared !== id)
    throw new Error('The embedded contract says id: ' + declared + ' but the prompt names contracts/' + id + '.md.');
  if (!isContractName(id + '.md')) throw new Error('Malformed contract id: ' + id);
  const bad = fault(body);
  if (bad) throw new Error('The embedded contract is malformed: ' + bad);
  const file = path.join(relay, 'contracts', id + '.md');
  if (fs.existsSync(file)) return { id, file, written: false };
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body, 'utf8');
  return { id, file, written: true };
}

module.exports = { materialize, block, OPEN, CLOSE };
