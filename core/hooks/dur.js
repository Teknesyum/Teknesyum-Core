#!/usr/bin/env node
const path = require('path');
const { read, merge, configRoot, t } = require('./lib.js');
const { file, tree } = require('./count.js');

function off() {
  const cfg = read(path.join(configRoot(), 'teknesyum', 'config.json')) || {};
  return cfg.evidence === false || process.env.TEKNESYUM_KANIT === '0';
}

function proven(st, now) {
  return (st.tests || []).some((r) => r.ok !== false && r.tree === now);
}

function decide(j) {
  if (j.hook_event_name !== 'Stop') return null;
  if (j.stop_hook_active) return null;
  if (off()) return null;
  const f = file(j);
  const st = read(f);
  if (!st) return null;
  const now = tree(st.cwd || j.cwd || process.cwd());
  if (!now) return null;
  if (st.stopTree === now) return null;
  if (!Object.keys(st.files || {}).length) return null;
  if (proven(st, now)) {
    merge(f, { stopTree: now });
    return null;
  }
  return { decision: 'block', reason: t('dur.evidence') };
}

if (require.main === module) {
  let raw = '';
  process.stdin.on('data', (d) => (raw += d));
  process.stdin.on('end', () => {
    try {
      const out = decide(JSON.parse(raw));
      if (out) process.stdout.write(JSON.stringify(out));
    } catch {}
    process.exit(0);
  });
  process.stdin.on('error', () => process.exit(0));
}

module.exports = { decide, proven, off };
