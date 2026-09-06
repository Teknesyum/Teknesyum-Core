const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { read, write, stateFile, configRoot, safe, t } = require('./lib.js');

const FILE_MAX = 5;
const DIFF_MAX = 150;
const CTX_MAX = 60;
const RISK = /(^|\/)(migrations?\/|\.github\/|dockerfile$)|auth|secur|config|\.lock$|-lock\.json$/i;
const TEST = /\b(npm|pnpm|yarn|bun)\s+(run\s+)?test\b|\bnpx\s+(ava|jest|mocha|vitest)\b|\bpytest\b|\bgo\s+test\b|\bcargo\s+test\b|\bdotnet\s+test\b|\bnode\s+\S*test\S*\.m?js\b/i;
const EDITS = /^(Write|Edit|NotebookEdit)$/;
const SHELLS = /^(Bash|PowerShell)$/;

function file(j) {
  return stateFile('state-' + safe(String(j.session_id || 'none')));
}

function fresh(j) {
  return { session: j.session_id || '', cwd: j.cwd || process.cwd(), started: new Date().toISOString(), files: {}, diff: 0, tests: [], warned: {}, ctx: 0, transcript: j.transcript_path || '' };
}

function rel(cwd, p) {
  return path.relative(cwd, path.resolve(cwd, String(p))).replace(/\\/g, '/');
}

function numstat(cwd, names) {
  const out = {};
  if (!names.length) return out;
  const r = spawnSync('git', ['-C', cwd, 'diff', '--numstat', 'HEAD', '--'].concat(names), { encoding: 'utf8', windowsHide: true, timeout: 10000 });
  if (!r.error && r.status === 0)
    for (const line of String(r.stdout).split('\n')) {
      const m = /^(\d+|-)\t(\d+|-)\t(.+)$/.exec(line);
      if (m) out[m[3].replace(/\\/g, '/')] = { adds: Number(m[1]) || 0, dels: Number(m[2]) || 0 };
    }
  for (const n of names)
    if (!out[n]) {
      let adds = 0;
      try { adds = fs.readFileSync(path.join(cwd, n), 'utf8').replace(/\r?\n$/, '').split('\n').length; } catch {}
      out[n] = { adds, dels: 0, fresh: true };
    }
  return out;
}

function refresh(st) {
  const names = Object.keys(st.files);
  const rows = numstat(st.cwd, names);
  let total = 0;
  let edited = 0;
  for (const n of names) {
    st.files[n] = rows[n] || st.files[n] || { adds: 0, dels: 0 };
    total += st.files[n].adds + st.files[n].dels;
    if (!st.files[n].fresh) edited += st.files[n].adds + st.files[n].dels;
  }
  st.diff = total;
  st.edited = edited;
}

function planAt(cwd) {
  return fs.existsSync(path.join(cwd, 'docs', 'plan.md'));
}

function reason(st) {
  const names = Object.keys(st.files);
  const risky = names.find((n) => RISK.test(n));
  if (risky) return risky;
  if (names.length >= FILE_MAX) return names.length + ' ' + t('cue.files');
  const edited = st.edited == null ? st.diff : st.edited;
  if (edited >= DIFF_MAX) return edited + ' ' + t('cue.lines');
  return '';
}

function speak(text) {
  return JSON.stringify({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: text } });
}

function onEdit(j, st) {
  const p = j.tool_input && (j.tool_input.file_path || j.tool_input.notebook_path);
  if (!p) return '';
  const n = rel(st.cwd, p);
  if (/^\.\.\//.test(n) || /^\.claude\//.test(n) || /^[A-Za-z]:/.test(n)) return '';
  st.files[n] = st.files[n] || { adds: 0, dels: 0 };
  refresh(st);
  if (st.warned.plan || planAt(st.cwd)) return '';
  const why = reason(st);
  if (!why) return '';
  st.warned.plan = true;
  return speak(why + ' ' + t('cue.plan'));
}

function tree(cwd) {
  const r = spawnSync('git', ['-C', cwd, 'status', '--porcelain', '--branch'], { encoding: 'utf8', windowsHide: true, timeout: 10000 });
  if (r.error || r.status !== 0) return '';
  const head = spawnSync('git', ['-C', cwd, 'rev-parse', 'HEAD'], { encoding: 'utf8', windowsHide: true, timeout: 10000 });
  return require('crypto').createHash('sha1').update(String(head.stdout || '') + String(r.stdout || '')).digest('hex').slice(0, 12);
}

function onShell(j, st, failed) {
  const cmd = String((j.tool_input && j.tool_input.command) || '');
  if (!TEST.test(cmd)) return '';
  const res = j.tool_response || {};
  const out = typeof res === 'string' ? res : String(res.stdout || '') + String(res.stderr || '');
  const ok = failed ? false : out.trim() ? true : null;
  st.tests.push({ cmd: cmd.slice(0, 120), ok, at: new Date().toISOString(), tree: tree(st.cwd) });
  st.tests = st.tests.slice(-8);
  return '';
}

function onContext(st) {
  if (st.warned.ctx || Number(st.ctx) < CTX_MAX) return '';
  st.warned.ctx = true;
  require('./handoff.js').generate(st.cwd, st);
  return speak(t('cue.context').replace('%N', String(Math.round(st.ctx))));
}

function onSeat(st) {
  const seat = read(path.join(configRoot(), 'teknesyum', 'seat.json'));
  if (!seat || !seat.at || seat.at === st.seat) return '';
  st.seat = seat.at;
  const kb = (Number(seat.bytes || 0) / 1024).toFixed(1);
  return JSON.stringify({ systemMessage: t('banner.seat').replace('%S', (seat.slugs || []).join(', ')).replace('%K', kb) });
}

function handle(j) {
  const ev = j.hook_event_name;
  const f = file(j);
  if (ev === 'SessionStart') {
    const st = read(f);
    if (!st || j.source === 'startup' || j.source === 'clear') write(f, fresh(j));
    if (j.source !== 'compact' && fs.existsSync(path.join(j.cwd || process.cwd(), '.claude', 'handoff.md'))) return t('cue.resume') + '\n';
    return '';
  }
  const st = read(f) || fresh(j);
  if (j.cwd) st.cwd = j.cwd;
  if (j.transcript_path) st.transcript = j.transcript_path;
  let out = '';
  if (ev === 'PostToolUse') {
    if (EDITS.test(j.tool_name)) out = onEdit(j, st);
    else if (SHELLS.test(j.tool_name)) out = onShell(j, st);
    if (!out) out = onContext(st);
  } else if (ev === 'PostToolUseFailure') {
    if (SHELLS.test(j.tool_name)) onShell(j, st, true);
  } else if (ev === 'Stop') {
    refresh(st);
    out = onSeat(st);
  }
  write(f, st);
  return out;
}

function errorLog(e) {
  try {
    fs.appendFileSync(stateFile('hook-errors').replace(/\.json$/, '.log'), new Date().toISOString() + ' count.js ' + String((e && e.stack) || e) + '\n');
  } catch {}
}

if (require.main === module) {
  let raw = '';
  process.stdin.on('data', (d) => (raw += d));
  process.stdin.on('end', () => {
    let out = '';
    try { out = handle(JSON.parse(raw)); } catch (e) { errorLog(e); }
    if (out) process.stdout.write(out);
    process.exit(0);
  });
}

module.exports = { handle, reason, file, tree, FILE_MAX, DIFF_MAX, CTX_MAX, RISK, TEST };
