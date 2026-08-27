const fs = require('fs');
const path = require('path');
const { read, relayRoot, liveDir, settings } = require('../hooks/lib.js');
const { status } = require('../hooks/schema.js');

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
    files = fs.readdirSync(live).filter((f) => f.endsWith('.json'));
  } catch {
    return { running: 0, roles: [] };
  }
  const cutoff = Date.now() - ACTIVE_MS;
  const roles = [];
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
    if (r.role) roles.push(r.role);
  }
  return { running, roles };
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

function build(input) {
  const cwd = (input && input.workspace && input.workspace.current_dir) || process.cwd();
  const parts = [];

  parts.push(paint(C.cyan, path.basename(path.resolve(cwd))));

  const cfg = settings();
  if (cfg.profile) parts.push(paint(C.dim, cfg.profile));

  const r = relayRoot(cwd, { git: false });
  if (!r) {
    parts.push(paint(C.dim, 'no relay'));
    return parts.join(SEP);
  }

  const c = contracts(r.relay);
  if (c && c.total) {
    const bits = [];
    if (c.count.active) bits.push(paint(C.green, c.count.active + ' active'));
    if (c.count.submitted) bits.push(paint(C.yellow, c.count.submitted + ' submitted'));
    if (c.count.open) bits.push(c.count.open + ' open');
    if (c.count.blocked) bits.push(paint(C.red, c.count.blocked + ' blocked'));
    parts.push(bits.length ? bits.join(' ') : c.total + ' contracts');
  }

  const a = agents(r.relay);
  if (a.running) parts.push(paint(C.magenta, a.running + ' agents') + (a.roles.length ? ' ' + paint(C.dim, tally(a.roles)) : ''));

  const p = problems(r.relay);
  if (p) parts.push(paint(C.red, p + ' problems'));

  if (r.worktree) parts.push(paint(C.dim, 'worktree'));

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

if (require.main === module) main();
module.exports = { build };
