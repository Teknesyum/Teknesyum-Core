const fs = require('fs');
const path = require('path');
const { read, write, t } = require('./lib.js');
const count = require('./count.js');

function deny(why) {
  return JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: why + ' ' + t('cue.plan') } });
}

function guard(j) {
  if (j.hook_event_name !== 'PreToolUse') return '';
  const p = j.tool_input && (j.tool_input.file_path || j.tool_input.notebook_path);
  if (!p) return '';
  const cwd = j.cwd || process.cwd();
  const n = path.relative(cwd, path.resolve(cwd, String(p))).replace(/\\/g, '/');
  if (/^\.\.\//.test(n) || /^\.claude\//.test(n) || /^[A-Za-z]:/.test(n) || n === 'docs/plan.md') return '';
  if (fs.existsSync(path.join(cwd, 'docs', 'plan.md'))) return '';
  const f = count.file(j);
  const st = read(f);
  if (!st) return '';
  const bak = { ...st, files: { ...st.files } };
  bak.files[n] = bak.files[n] || { adds: 0, dels: 0, fresh: true };
  const why = count.reason(bak);
  if (!why) return '';
  st.denied = (st.denied || 0) + 1;
  write(f, st);
  return deny(why);
}

if (require.main === module) {
  let raw = '';
  process.stdin.on('data', (d) => (raw += d));
  process.stdin.on('end', () => {
    let out = '';
    try { out = guard(JSON.parse(raw)); } catch {}
    if (out) process.stdout.write(out);
    process.exit(0);
  });
}

module.exports = { guard };
