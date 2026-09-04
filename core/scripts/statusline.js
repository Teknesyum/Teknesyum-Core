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

const B = {
  mark: '\x1b[38;5;51m',
  seat: '\x1b[38;5;135m',
  warn: '\x1b[38;5;201m',
};

const SEP = ' \x1b[2m·\x1b[0m ';
const ACTIVE_MS = 5 * 60 * 1000;
const QUIET_MS = 2 * 60 * 1000;
const WORK_LINES = 2;
const STEP_CEILING = 150;

function paint(c, s) {
  return process.env.NO_COLOR ? s : c + s + C.off;
}

const tint = paint;

function plain(s) {
  return String(s).replace(/\x1b\[[0-9;]*m/g, '');
}

function fit(parts, cap) {
  const kept = [];
  let used = 0;
  for (const p of parts) {
    if (!p) continue;
    const w = wide(p).length + (kept.length ? 3 : 0);
    if (used + w > cap) break;
    kept.push(p);
    used += w;
  }
  if (!kept.length && parts.length) kept.push(plain(parts[0]).slice(0, cap));
  return kept.join(tint(C.dim, ' · '));
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

function stale(relay) {
  const r = read(path.join(liveDir(relay), '_stale.json'));
  return r && Array.isArray(r.ids) ? r.ids.length : 0;
}

function headSha(root) {
  try {
    const h = fs.readFileSync(path.join(root, '.git', 'HEAD'), 'utf8').trim();
    if (!h.startsWith('ref:')) return h;
    const ref = h.slice(4).trim();
    try {
      return fs.readFileSync(path.join(root, '.git', ref), 'utf8').trim();
    } catch {
      const packed = fs.readFileSync(path.join(root, '.git', 'packed-refs'), 'utf8');
      const m = new RegExp('^([0-9a-f]{40}) ' + ref + '$', 'm').exec(packed);
      return m ? m[1] : '';
    }
  } catch {
    return '';
  }
}

function mapStale(relay, cwd) {
  const roots = [path.dirname(path.dirname(relay)), path.resolve(cwd)];
  for (const root of roots)
    for (const d of [path.join(root, '.claude', 'relay'), path.join(root, '.claude')]) {
      const j = read(path.join(d, 'map.json'));
      if (!j || !j._map || !j._map.head) continue;
      const now = headSha(root);
      if (now) return now !== j._map.head;
    }
  return false;
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

const FAMILY = /(haiku|sonnet|opus|fable)/i;

function familyOf(model) {
  const m = FAMILY.exec(String(model || ''));
  return m ? m[1].toLowerCase() : String(model || '');
}

function cellName(model, effort) {
  if (!model) return '';
  return familyOf(model) + (effort ? '-' + effort : '');
}

const CELLS = {};

const CONSULT_MS = 30 * 60 * 1000;

function tierCell(role) {
  if (!role) return null;
  const key = String(role).toLowerCase();
  if (CELLS[key] !== undefined) return CELLS[key];
  let cell = null;
  try {
    const t = require('./contract.js').tier;
    const r = t(key, {}) || t('t0', {});
    if (r && r.model) cell = { model: r.model, effort: r.effort || '' };
  } catch {}
  CELLS[key] = cell;
  return cell;
}

function seatCell(row, c) {
  const model = row.model || (c && c.model) || '';
  const effort = row.effort || (c && c.effort) || '';
  const t = tierCell(row.role);
  if (!model) return t ? cellName(t.model, t.effort) : '';
  if (effort) return cellName(model, effort);
  const same = t && String(t.model).toLowerCase() === String(model).toLowerCase();
  return cellName(model, same ? t.effort : '');
}

function goalOf(relay, id, cache) {
  const none = { title: '', round: 0, cap: 0, raised: false };
  if (!id) return none;
  if (cache[id] !== undefined) return cache[id];
  const got = { title: '', round: 0, cap: STEP_CEILING, raised: false };
  try {
    const head = fs.readFileSync(path.join(relay, 'contracts', id + '.md'), 'utf8').slice(0, 400);
    const m = /^#[ \t]+(.+)$/m.exec(head);
    if (m) got.title = m[1].trim().slice(0, 60);
    const n = /^round:[ \t]*(\d+)/m.exec(head);
    if (n) got.round = Number(n[1]);
    const c = /^ceiling:[ \t]*(\d+)/m.exec(head);
    if (c && Number(c[1]) > 0) {
      got.cap = Number(c[1]);
      got.raised = got.cap !== STEP_CEILING;
    }
  } catch {}
  cache[id] = got;
  return got;
}

function quietFor(row, now) {
  const at = Date.parse(row.updated || row.started || '');
  if (!at) return 0;
  const gap = now - at;
  return gap >= QUIET_MS ? Math.floor(gap / 60000) : 0;
}

function lastFile(row) {
  const list = Array.isArray(row.files) ? row.files : [];
  if (!list.length) return '';
  return String(list[list.length - 1]).split('/').pop();
}

function consulting(relay) {
  try {
    const f = path.join(path.dirname(path.dirname(relay)), 'docs', 'danisma', '_pending.json');
    const rows = JSON.parse(fs.readFileSync(f, 'utf8'));
    if (!Array.isArray(rows)) return '';
    const now = Date.now();
    const live = rows.filter((x) => now - Number(x.at || 0) < CONSULT_MS);
    if (!live.length) return '';
    const who = familyOf(live[live.length - 1].model);
    return who ? titleCase(who) + ' ' + t('line.consulting') : t('line.consulting');
  } catch {}
  return '';
}

function sharpening(relay) {
  const r = read(path.join(liveDir(relay), '_sharpen.json'));
  if (!r || !r.at) return '';
  return Date.now() - Number(r.at) < CONSULT_MS ? t('line.sharpening') : '';
}

function seats(relay) {
  const a = agents(relay);
  if (!a.running) return [];
  const pool = calls(relay);
  const goals = {};
  const now = Date.now();
  return a.rows.filter((row) => row.role).map((row) => {
    const c = taskFor(row, pool);
    const id = row.contract || (c && c.contract) || '';
    const g = goalOf(relay, id, goals);
    return {
      role: titleCase(roleName(row.role)),
      cell: titleCase(seatCell(row, c)),
      id,
      round: g.round,
      what: titleCase(g.title || (c && c.task) || ''),
      file: lastFile(row),
      quiet: quietFor(row, now),
    };
  });
}

function group(list) {
  const out = [];
  for (const s of list) {
    const key = [s.role, s.cell, s.id].join('|');
    const hit = out.find((g) => g.key === key);
    if (hit) {
      hit.n += 1;
      hit.quiet = Math.max(hit.quiet, s.quiet);
    } else
      out.push({ key, n: 1, role: s.role, cell: s.cell, id: s.id, round: s.round, quiet: s.quiet });
  }
  return out;
}

function bold(x) { return x ? "**" + x + "**" : ""; }
function chip(x) { return x ? "`" + x + "`" : ""; }
function soft(x) { return x ? "_" + x + "_" : ""; }
function wide(x) { return plain(x).replace(/[`*_]/g, ""); }

function seatLine(list) {
  const parts = [];
  for (const g of group(list)) {
    const seat = (g.n > 1 ? g.n + '× ' : '') + [g.cell, g.role].filter(Boolean).join(' ');
    parts.push(bold(seat));
    if (g.id) parts.push(g.id + (g.round > 1 ? ' R' + g.round : ''));
    if (g.quiet) parts.push(chip(g.quiet + ' ' + t('line.quiet')));
  }
  return parts;
}

function workLines(list, asked) {
  const seen = [];
  for (const s of list) {
    if (!s.what || seen.some((x) => x.what === s.what)) continue;
    seen.push(s);
  }
  const room = seen.length > WORK_LINES ? WORK_LINES - 1 : WORK_LINES;
  const lines = [];
  for (const s of seen.slice(0, room)) {
    const bits = [s.what];
    if (s.file) bits.push(soft((asked ? asked + ':' : t('line.last')) + ' ') + s.file);
    else if (asked) bits.push(chip(asked));
    lines.push('└ ' + fit(bits, BANNER_CAP - 2));
  }
  const rest = seen.length - lines.length;
  if (rest > 0) lines.push('└ ' + soft('+' + rest + ' ' + t('line.more')));
  return lines;
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

function headLine(parts) {
  return bold('Teknesyum') + ' ▸ ' + fit(parts, BANNER_CAP - 12);
}

function banner(cwd, phase) {
  return plain(draw(cwd, phase));
}

function draw(cwd, phase) {
  const r = relayRoot(cwd, { git: false });
  if (!r) return '';

  const ty = counters(r.relay);
  if (ty.fails >= 2) {
    return headLine([tint(B.warn, titleCase(t('line.caution')) + ' — ' + ty.fails + ' ' + t('line.failRun'))]);
  }

  if (phase === 'foot') {
    const n = getNotice(r.relay);
    if (n) return headLine([titleCase(n)]);
    const k = contracts(r.relay);
    const wait = k ? Number(k.count.submitted || 0) + Number(k.count.blocked || 0) : 0;
    if (wait) return headLine([titleCase(wait + ' ' + t('line.contract') + ' ' + t('line.waiting'))]);
    return '';
  }

  const asked = consulting(r.relay);
  const mark = sharpening(r.relay);
  const list = seats(r.relay);
  if (list.length) {
    const head = seatLine(list);
    if (mark) head.unshift(chip(titleCase(mark)));
    return [headLine(head)].concat(workLines(list, asked)).join('\n');
  }

  const bits = [];
  if (mark) bits.push(mark);
  const k = contracts(r.relay);
  if (k && k.total) {
    const sub = [];
    if (k.count.blocked) sub.push(k.count.blocked + ' ' + t('line.contract') + ' ' + t('line.blocked'));
    if (k.count.submitted) sub.push(k.count.submitted + ' ' + t('line.contract') + ' ' + t('line.submitted'));
    if (k.count.active) sub.push(k.count.active + ' ' + t('line.contract') + ' ' + t('line.active'));
    if (k.count.open) sub.push(k.count.open + ' ' + t('line.contract') + ' ' + t('line.open'));
    bits.push(sub.length ? sub.join(' · ') : k.total + ' ' + t('line.contracts'));
  }
  if (asked) bits.push(asked);
  const p = problems(r.relay);
  if (p) bits.push(p + ' ' + t('line.problems'));
  if (!gateOn()) bits.push(t('line.gateOff'));

  if (!bits.length) return '';
  return headLine(bits.map(titleCase));
}

function update() {
  try {
    return require('./update.js').hint();
  } catch {
    return '';
  }
}

function gateOn() {
  try {
    const h = path.join(__dirname, '..', 'hooks', 'hooks.json');
    return /guard\.js/.test(fs.readFileSync(h, 'utf8'));
  } catch {
    return false;
  }
}

const CTX_WARN = 70;
const CTX_LOUD = 85;

function contextPart(input) {
  const raw = input && input.context_window && input.context_window.used_percentage;
  const pct = Number(raw);
  if (!isFinite(pct) || pct <= 0) return '';
  const n = Math.min(100, Math.round(pct));
  const colour = n >= CTX_LOUD ? C.red : n >= CTX_WARN ? C.yellow : C.dim;
  return paint(colour, t('line.context') + ' ' + n + '%');
}

function build(input) {
  const cwd = (input && input.workspace && input.workspace.current_dir) || process.cwd();
  const parts = [];

  parts.push(paint(C.cyan, 'Teknesyum') + ' ' + paint(C.dim, '▸') + ' ' + path.basename(path.resolve(cwd)));

  const cfg = settings();
  parts.push(paint(C.dim, String(cfg.profile || 'normal')));

  const ctx = contextPart(input);
  if (ctx) parts.push(ctx);

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

  const st = stale(r.relay);
  if (st) parts.push(paint(C.yellow, st + ' ' + t('line.stale')));

  if (mapStale(r.relay, cwd))
    parts.push(paint(C.yellow, t('line.mapStale')));

  const a = agents(r.relay);
  if (a.running) parts.push(paint(C.magenta, a.running + ' ' + t('line.agents')) + (a.roles.length ? ' ' + paint(C.dim, tally(a.roles)) : ''));

  const p = problems(r.relay);
  if (p) parts.push(paint(C.red, p + ' ' + t('line.problems')));

  if (logs) parts.push(paint(C.yellow, logs + ' ' + t('line.logs')));

  if (r.worktree) parts.push(paint(C.dim, t('line.worktree')));

  const n = getNotice(r.relay);
  if (n) parts.push(paint(C.dim, '⤷ ') + n);

  const up = update();
  if (up) parts.push(paint(C.dim, 'v' + up + ' ' + t('line.update')));

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
module.exports = { build, main, summary, banner, plain };
