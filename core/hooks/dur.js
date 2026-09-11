#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { read, merge, configRoot, stateFile, t, banner, say } = require('./lib.js');
const { file, tree } = require('./count.js');

function setting() {
  return read(path.join(configRoot(), 'teknesyum', 'config.json')) || {};
}

function off() {
  return setting().evidence === false || process.env.TEKNESYUM_KANIT === '0';
}

const CODE = /\.(js|mjs|cjs|jsx|ts|tsx|py|go|rs|java|rb|php|c|h|cc|cpp|cs|swift|kt|sh|bash|ps1|sql|json|ya?ml|toml)$/i;
const ITEM = /^\s*[-*]\s+\S/;
const DONE = /^\s*[-*]\s+\[[xX]\]/;
const REASON = /\s(—|–|--)\s+\S/;

function code(st) {
  return Object.keys(st.files || {}).filter((n) => CODE.test(n));
}

function proven(st, now) {
  return (st.tests || []).some((r) => r.ok !== false && r.tree === now);
}

function jobs(j) {
  const mark = stateFile('jobs-' + String(j.session_id || 'none'));
  let want = null;
  try { want = JSON.parse(fs.readFileSync(mark, 'utf8')); fs.unlinkSync(mark); } catch {}
  if (setting().jobs === false) return '';
  let body = null;
  try { body = fs.readFileSync(path.join(j.cwd || process.cwd(), '.claude', 'jobs.md'), 'utf8'); } catch {}
  if (body === null) {
    if (!want || !want.n) return '';
    say(j.session_id, banner('banner.jobsMissing', { '%N': want.n }));
    return t('dur.jobsMissing').replace('%N', String(want.n));
  }
  const left = body.split(/\r?\n/).filter((l) => ITEM.test(l) && !DONE.test(l) && !REASON.test(l)).map((l) => l.trim());
  if (!left.length) return '';
  say(j.session_id, banner('banner.jobsOpen', { '%N': left.length }));
  return t('dur.jobs').replace('%N', String(left.length)) + '\n' + left.join('\n');
}

function evidence(j) {
  if (off()) return '';
  const f = file(j);
  const st = read(f);
  if (!st) return '';
  const now = tree(st.cwd || j.cwd || process.cwd());
  if (!now) return '';
  if (st.stopTree === now) return '';
  if (!code(st).length) return '';
  if (proven(st, now)) {
    merge(f, { stopTree: now });
    return '';
  }
  say(j.session_id, banner('banner.evidence', { '%N': code(st).length }));
  return t('dur.evidence');
}

function decide(j) {
  if (j.hook_event_name !== 'Stop') return null;
  if (j.stop_hook_active) return null;
  const why = [jobs(j), evidence(j)].filter(Boolean);
  return why.length ? { decision: 'block', reason: why.join('\n\n') } : null;
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

module.exports = { decide, proven, off, code, jobs, CODE };
