#!/usr/bin/env node
const { drain } = require('./lib.js');

function build(j) {
  if (!j || j.hook_event_name !== 'MessageDisplay') return '';
  const top = j.index === 0;
  if (!top && !j.final) return '';
  const lines = drain(j.session_id);
  if (!lines.length) return '';
  const block = lines.map((l) => '`' + String(l).replace(/`/g, "'") + '`').join('\n\n');
  const delta = String(j.delta || '');
  const body = !delta.trim() ? block : top ? block + '\n\n' + delta : delta.replace(/\s+$/, '') + '\n\n' + block;
  return JSON.stringify({ hookSpecificOutput: { hookEventName: 'MessageDisplay', displayContent: body } });
}

if (require.main === module) {
  let raw = '';
  process.stdin.on('data', (d) => (raw += d));
  process.stdin.on('end', () => {
    let out = '';
    try { out = build(JSON.parse(raw)); } catch {}
    if (out) process.stdout.write(out);
    process.exit(0);
  });
  process.stdin.on('error', () => process.exit(0));
}

module.exports = { build };
