#!/usr/bin/env node
const fs = require('fs');
const { read, stateFile, t } = require('./lib.js');
const { file, tree } = require('./count.js');

function proven(st) {
  const now = tree(st.cwd || process.cwd());
  if (!now) return true;
  return (st.tests || []).some((r) => r.ok !== false && r.tree === now);
}

function decide(j) {
  if (j.hook_event_name !== 'Stop') return null;
  if (j.stop_hook_active) return null;
  const st = read(file(j));
  if (!st || !st.doubt) return null;
  if (!Object.keys(st.files || {}).length) return null;
  if (proven(st)) return null;
  return { decision: 'block', reason: t('dur.evidence') };
}

if (require.main === module) {
  let raw = '';
  process.stdin.on('data', (d) => (raw += d));
  process.stdin.on('end', () => {
    try {
      const out = decide(JSON.parse(raw));
      if (out) process.stdout.write(JSON.stringify(out));
    } catch (e) {
      try { fs.appendFileSync(stateFile('hook-errors').replace(/\.json$/, '.log'), new Date().toISOString() + ' dur.js ' + String((e && e.stack) || e) + '\n'); } catch {}
    }
    process.exit(0);
  });
  process.stdin.on('error', () => process.exit(0));
}

module.exports = { decide, proven };
