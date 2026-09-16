#!/usr/bin/env node
const { main, drain } = require('./lib.js');

function build(j) {
  if (!j || j.hook_event_name !== 'MessageDisplay') return '';
  const top = j.index === 0;
  if (!top && !j.final) return '';
  const lines = drain(j.session_id);
  if (!lines.length) return '';
  const block = lines
    .map((l) => (l && typeof l === 'object' && l.block ? String(l.block) : '`' + String(l).replace(/`/g, "'") + '`'))
    .join('\n\n');
  const delta = String(j.delta || '');
  const body = !delta.trim() ? block : top ? block + '\n\n' + delta : delta.replace(/\s+$/, '') + '\n\n' + block;
  return JSON.stringify({ hookSpecificOutput: { hookEventName: 'MessageDisplay', displayContent: body } });
}

if (require.main === module) main(build);

module.exports = { build };
