const fs = require('fs');
const path = require('path');
const { read, relayRoot, liveDir, settings, openLogCount, getNotice, t } = require('../hooks/lib.js');
const { status } = require('../hooks/schema.js');

const BANNER_CAP = 120;

const C = {
  dim: '\x1b[2m',
  off: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
};

const SEP = ' \x1b[2m·\x1b[0m ';
const ACTIVE_MS = 5 * 60 * 1000;

function paint(c, s) {
  return process.env.NO_COLOR ? s : c + s + C.off;
}

function contracts(relay) {
  const dir = path.join(relay, 'contracts');
  let files = [];
  try {
    files = fs.readdirSync(dir).filter((f) => /^[A-Za-z]{1,4}\d{1,4}\.md$/.test(f));
  } catch {
    return null;
  }
  const count = { open: 0, active: 0, submitted: 0, blocked: 0, other: 0 };
  for (const f of files) {
    let s = null;
    try {
      s = status(fs.readFileSync(path.join(dir, f), 'utf8'));
    } catch {}
    if (s && count[s] !== undefined) count[s] += 1;
    else count.other += 1;
  }
  return { total: files.length, count };
}

function agents(relay) {
  const live = liveDir(relay);
  let files = [];
  try {
    files = fs.readdirSync(live).filter((f) => f.endsWith('.json') && !f.startsWith('_'));
  } catch {
    return { running: 0, roles: [] };
  }
  const cutoff = Date.now() - ACTIVE_MS;
  const roles = [];
  const rows = [];
  let running = 0;
  for (const f of files) {
    const r = read(path.join(live, f));
    if (!r || r.ended) continue;
    let m = 0;
    try {
      m = fs.statSync(path.join(live, f)).mtimeMs;
    } catch {}
    if (m < cutoff) continue;
    running += 1;
    if (r.role) roles.push(label(r));
    rows.push(r);
  }
  return { running, roles, rows };
}

function calls(relay) {
  const c = read(path.join(liveDir(relay), '_calls.json'));
  return Array.isArray(c) ? c : [];
}

function taskFor(row, pool) {
  for (let i = pool.length - 1; i >= 0; i -= 1) {
    const c = pool[i];
    if (c.used || c.role !== row.role) continue;
    c.used = true;
    return c;
  }
  return null;
}

function roleName(role) {
  if (!role) return t('line.agent');
  const key = 'role.' + String(role).toLowerCase();
  const name = t(key);
  return name === key ? String(role) : name;
}

function cellName(model, effort) {
  if (!model) return '';
  return model + (effort ? '-' + effort : '');
}

function crew(relay) {
  const a = agents(relay);
  if (!a.running) return '';
  const pool = calls(relay);
  const seats = a.rows.map((row) => {
    const c = taskFor(row, pool);
    return {
      role: roleName(row.role),
      cell: cellName(row.model || (c && c.model) || '', row.effort || (c && c.effort) || ''),
      task: (c && c.task) || '',
    };
  });

  if (seats.length === 1) {
    const one = seats[0];
    const head = [one.cell, one.role].filter(Boolean).join(' ');
    return one.task ? head + ' — ' + one.task : head + ' ' + t('line.working');
  }

  const same = seats.every((x) => x.role === seats[0].role && x.cell === seats[0].cell);
  if (same) {
    const one = seats[0];
    return seats.length + ' ' + [one.cell, one.role].filter(Boolean).join(' ') + ' ' + t('line.working');
  }

  const groups = [];
  for (const x of seats) {
    const key = x.role + '|' + x.cell;
    const hit = groups.find((g) => g.key === key);
    if (hit) hit.n += 1;
    else groups.push({ key, n: 1, role: x.role, cell: x.cell });
  }
  return groups
    .map((g) => (g.n > 1 ? g.n + ' ' : '') + [g.cell, g.role].filter(Boolean).join(' '))
    .join(' · ') + ' ' + t('line.working');
}

function label(r) {
  if (!r.model) return r.role;
  return r.role + '·' + r.model + (r.effort ? '/' + r.effort : '');
}

function problems(relay) {
  try {
    return fs
      .readFileSync(path.join(liveDir(relay), 'problems.log'), 'utf8')
      .split('\n')
      .filter(Boolean).length;
  } catch {
    return 0;
  }
}

function tally(roles) {
  const m = new Map();
  for (const r of roles) m.set(r, (m.get(r) || 0) + 1);
  return [...m.entries()].map(([r, n]) => (n > 1 ? r + '×' + n : r)).join(' ');
}

function counters(relay) {
  const t = read(path.join(liveDir(relay), '_tally.json'));
  return { steps: (t && t.steps) || 0, fails: (t && t.fails) || 0 };
}

function titleCase(s) {
  return String(s).replace(/(^|[\s·×—/-])(\p{L})/gu, (m, a, b) => a + b.toLocaleUpperCase('tr'));
}

function banner(cwd, phase) {
  const r = relayRoot(cwd, { git: false });
  if (!r) return '';
  const mark = 'Teknesyum ▸ ';
  const say = (body) => mark + trim(titleCase(body));

  const ty = counters(r.relay);
  if (ty.fails >= 2) return say(t('line.caution') + ' — ' + ty.fails + ' ' + t('line.failRun'));

  if (phase === 'foot') {
    const n = getNotice(r.relay);
    if (n) return say(n);
  }

  const c = crew(r.relay);
  if (c) return say(c);

  const bits = [String(settings().profile || 'normal')];
  const k = contracts(r.relay);
  if (k && k.total) {
    const sub = [];
    if (k.count.blocked) sub.push(k.count.blocked + ' ' + t('line.contract') + ' ' + t('line.blocked'));
    if (k.count.submitted) sub.push(k.count.submitted + ' ' + t('line.contract') + ' ' + t('line.submitted'));
    if (k.count.active) sub.push(k.count.active + ' ' + t('line.contract') + ' ' + t('line.active'));
    if (k.count.open) sub.push(k.count.open + ' ' + t('line.contract') + ' ' + t('line.open'));
    bits.push(sub.length ? sub.join(' · ') : k.total + ' ' + t('line.contracts'));
  }
  const p = problems(r.relay);
  if (p) bits.push(p + ' ' + t('line.problems'));
  if (!gateOn()) bits.push(t('line.gateOff'));

  return say(bits.join(' · '));
}

function gateOn() {
  try {
    const h = path.join(__dirname, '..', 'hooks', 'hooks.json');
    return /guard\.js/.test(fs.readFileSync(h, 'utf8'));
  } catch {
    return false;
  }
}

function trim(line) {
  if (line.length <= BANNER_CAP) return line;
  const cut = line.slice(0, BANNER_CAP);
  const back = cut.lastIndexOf(' · ');
  return back > 20 ? cut.slice(0, back) : cut;
}

function build(input) {
  const cwd = (input && input.workspace && input.workspace.current_dir) || process.cwd();
  const parts = [];

  parts.push(paint(C.cyan, 'Teknesyum') + ' ' + paint(C.dim, '▸') + ' ' + path.basename(path.resolve(cwd)));

  const cfg = settings();
  parts.push(paint(C.dim, String(cfg.profile || 'normal')));

  const logs = openLogCount();

  const r = relayRoot(cwd, { git: false });
  if (!r) {
    parts.push(paint(C.dim, t('line.noRelay')));
    if (logs) parts.push(paint(C.yellow, logs + ' ' + t('line.logs')));
    return parts.join(SEP);
  }

  const c = contracts(r.relay);
  if (c && c.total) {
    const bits = [];
    if (c.count.active) bits.push(paint(C.green, c.count.active + ' ' + t('line.active')));
    if (c.count.submitted) bits.push(paint(C.yellow, c.count.submitted + ' ' + t('line.submitted')));
    if (c.count.open) bits.push(c.count.open + ' ' + t('line.open'));
    if (c.count.blocked) bits.push(paint(C.red, c.count.blocked + ' ' + t('line.blocked')));
    parts.push(bits.length ? bits.join(' ') : c.total + ' ' + t('line.contracts'));
  }

  const a = agents(r.relay);
  if (a.running) parts.push(paint(C.magenta, a.running + ' ' + t('line.agents')) + (a.roles.length ? ' ' + paint(C.dim, tally(a.roles)) : ''));

  const p = problems(r.relay);
  if (p) parts.push(paint(C.red, p + ' ' + t('line.problems')));

  if (logs) parts.push(paint(C.yellow, logs + ' ' + t('line.logs')));

  if (r.worktree) parts.push(paint(C.dim, t('line.worktree')));

  const n = getNotice(r.relay);
  if (n) parts.push(paint(C.dim, '⤷ ') + n);

  return parts.join(SEP);
}

function main() {
  let raw = '';
  process.stdin.on('data', (d) => (raw += d));
  process.stdin.on('end', () => {
    let input = null;
    try {
      input = JSON.parse(raw);
    } catch {}
    try {
      process.stdout.write(build(input));
    } catch {
      process.stdout.write('');
    }
  });
  process.stdin.on('error', () => process.stdout.write(''));
}

function summary(cwd) {
  return build({ workspace: { current_dir: cwd } })
    .replace(/\[[0-9;]*m/g, '')
    .trim();
}

if (require.main === module) main();
module.exports = { build, main, summary, banner };
