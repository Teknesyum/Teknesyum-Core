const fs = require('fs');
const path = require('path');
const { read, write, stateFile, safe, openLogCount, t } = require('../hooks/lib.js');

const C = { dim: '\x1b[2m', off: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m' };
const CTX_WARN = 60;
const CTX_LOUD = 85;

function paint(c, s) {
  return process.env.NO_COLOR ? s : c + s + C.off;
}

function contextPart(pct) {
  if (!isFinite(pct) || pct <= 0) return '';
  const n = Math.min(100, Math.round(pct));
  const colour = n >= CTX_LOUD ? C.red : n >= CTX_WARN ? C.yellow : C.dim;
  return paint(colour, t('line.context') + ' ' + n + '%');
}

function state(input) {
  const sid = input && input.session_id;
  if (!sid) return null;
  const f = stateFile('state-' + safe(String(sid)));
  const st = read(f);
  const pct = Number(input.context_window && input.context_window.used_percentage);
  if (st && isFinite(pct) && pct > 0 && Math.round(pct) !== Math.round(Number(st.ctx) || 0)) {
    st.ctx = pct;
    write(f, st);
  }
  return st;
}

function workPart(st, cwd) {
  const names = Object.keys((st && st.files) || {});
  if (!names.length) return [];
  let adds = 0;
  let dels = 0;
  for (const n of names) {
    adds += st.files[n].adds || 0;
    dels += st.files[n].dels || 0;
  }
  const parts = [names.length + ' ' + t('line.files') + ' ' + paint(C.green, '+' + adds) + paint(C.red, '-' + dels)];
  parts.push(fs.existsSync(path.join(cwd, 'docs', 'plan.md')) ? paint(C.green, t('line.plan')) : paint(C.dim, t('line.noPlan')));
  const tests = st.tests || [];
  if (tests.length) {
    const ok = tests.filter((x) => x.ok).length;
    const bad = tests.length - ok;
    parts.push(t('line.tests') + ' ' + paint(C.green, ok + '✓') + (bad ? ' ' + paint(C.red, bad + '✗') : ''));
  }
  return parts;
}

function hookErrors() {
  try {
    return fs.readFileSync(stateFile('hook-errors').replace(/\.json$/, '.log'), 'utf8').split('\n').filter(Boolean).length;
  } catch {
    return 0;
  }
}

function build(input) {
  const cwd = (input && input.workspace && input.workspace.current_dir) || process.cwd();
  const parts = [paint(C.cyan, 'Teknesyum') + ' ' + paint(C.dim, '▸') + ' ' + path.basename(path.resolve(cwd))];
  const st = state(input);
  const ctx = contextPart(Number(input && input.context_window && input.context_window.used_percentage) || Number(st && st.ctx));
  if (ctx) parts.push(ctx);
  parts.push(...workPart(st, cwd));
  if (fs.existsSync(path.join(cwd, '.claude', 'handoff.md'))) parts.push(paint(C.yellow, t('line.handoff')));
  const logs = openLogCount();
  if (logs) parts.push(paint(C.yellow, logs + ' ' + t('line.logs')));
  const errs = hookErrors();
  if (errs) parts.push(paint(C.red, errs + ' ' + t('line.hookErrors')));
  return parts.join(' ' + paint(C.dim, '·') + ' ');
}

function main() {
  let raw = '';
  process.stdin.on('data', (d) => (raw += d));
  process.stdin.on('end', () => {
    let input = null;
    try { input = JSON.parse(raw); } catch {}
    try { process.stdout.write(build(input)); } catch { process.stdout.write(''); }
  });
  process.stdin.on('error', () => process.stdout.write(''));
}

function summary(cwd) {
  return build({ workspace: { current_dir: cwd } }).replace(/\x1b\[[0-9;]*m/g, '').trim();
}

if (require.main === module) main();
module.exports = { build, main, summary };
