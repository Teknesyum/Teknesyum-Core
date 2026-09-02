#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { relayRoot, projectRoot, settings, liveDir, read, setNotice, t } = require('../hooks/lib.js');
const { isContractName, field, list, owned, verifySteps, entries, scalar } = require('../hooks/schema.js');
const seal = require('../hooks/seal.js');
const risk = require('./risk.js');

const NL = String.fromCharCode(10);

const argv = process.argv.slice(2);

function arg(name) {
  const i = argv.indexOf('--' + name);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : null;
}

function has(name) {
  return argv.includes('--' + name);
}

function out(lines, code) {
  process.stdout.write(lines.join('\n') + '\n');
  process.exitCode = code || 0;
}

function stop(lines) {
  return out(lines, 2);
}

function git(root, args) {
  const r = spawnSync('git', ['-C', root].concat(args), {
    encoding: 'utf8',
    timeout: 30000,
    windowsHide: true,
    maxBuffer: 8 * 1024 * 1024,
  });
  return r.error || r.status !== 0 ? null : String(r.stdout || '').trim();
}

function locate() {
  const r = relayRoot(arg('root') || process.cwd());
  if (!r) return null;
  return { relay: r.relay, root: projectRoot(r.relay) };
}

function load(id) {
  if (!id || !isContractName(id + '.md')) return { error: 'Missing or malformed contract id.' };
  const where = locate();
  if (!where) return { error: 'No relay root - .claude/relay does not exist.' };
  const src = path.join(where.relay, 'contracts', id + '.md');
  const dst = path.join(where.relay, 'contracts', 'done', id + '.md');
  let body;
  try {
    body = fs.readFileSync(src, 'utf8');
  } catch {
    return { error: 'Cannot read ' + path.relative(where.root, src) };
  }
  if (fs.existsSync(dst)) return { error: id + ' is already under done/.' };
  return { ...where, id, src, dst, body };
}

const VERIFY_TIMEOUT = Number(process.env.TEKNESYUM_VERIFY_TIMEOUT_MS) || 45 * 60 * 1000;

const FORBIDDEN_IN_VERIFY = [
  { re: /contracts[\\/]d?one/i, why: 'touches contracts/done/' },
  { re: /contract\.js/i, why: 'calls contract.js' },
  { re: /relay[\\/](audits|live)/i, why: 'touches audits/ or live/' },
];

const HOLLOW = [
  { re: /^\s*:\s*$/, why: 'does nothing' },
  { re: /^\s*true\s*$/i, why: 'always passes' },
  { re: /^\s*(exit\s+0|cd\s+\S+|pwd|ls|dir)\s*$/i, why: 'always passes' },
  { re: /^\s*echo\b/i, why: 'prints instead of testing' },
  { re: /^\s*#/, why: 'is a comment' },
];

function hollowStep(step) {
  const s = String(step).trim();
  if (!s) return 'is empty';
  for (const h of HOLLOW) if (h.re.test(s)) return h.why;
  return '';
}

function hollowVerify(steps) {
  if (!steps.length) return [];
  const graded = steps.map((s) => [s, hollowStep(s)]);
  return graded.every(([, why]) => why) ? graded : [];
}

function looseVerify(body) {
  if (verifySteps(body).length) return '';
  return scalar('verify', body);
}

const NO_TESTS = [
  /(^|[^a-z])no tests? (were )?(ran|run|found|to run|executed)/i,
  /Total tests: 0(?![0-9])/i,
  /(^|[^0-9])0 tests? (ran|passed|executed)/i,
  /collected 0 items/i,
  /(^|[^a-z])no test (matches|matched|files? found)/i,
  /tests? run: 0(?![0-9])/i,
];

function emptyRun(text) {
  for (const re of NO_TESTS) if (re.test(text)) return true;
  return false;
}

function lockPath(relay) {
  return path.join(liveDir(relay), '_verify.lock');
}

function alive(pid) {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return String((e && e.code) || '') === 'EPERM';
  }
}

function takeLock(relay, id) {
  const f = lockPath(relay);
  const held = read(f);
  if (held && held.pid !== process.pid && alive(held.pid)) return held;
  try {
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, JSON.stringify({ pid: process.pid, id: id, at: new Date().toISOString() }));
  } catch {}
  return null;
}

function dropLock(relay) {
  try {
    fs.unlinkSync(lockPath(relay));
  } catch {}
}

function unsafeStep(step) {
  for (const f of FORBIDDEN_IN_VERIFY) if (f.re.test(step)) return f.why;
  return '';
}

function killTree(pid) {
  if (!pid) return false;
  if (process.platform === 'win32') {
    const r = spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], { windowsHide: true, timeout: 20000 });
    return !r.error && r.status === 0;
  }
  try {
    process.kill(-pid, 'SIGKILL');
    return true;
  } catch {}
  try {
    process.kill(pid, 'SIGKILL');
    return true;
  } catch {}
  return false;
}

function runVerify(root, steps) {
  const results = [];
  for (const step of steps) {
    const r = spawnSync(step, {
      cwd: root,
      shell: true,
      encoding: 'utf8',
      timeout: VERIFY_TIMEOUT,
      windowsHide: true,
      detached: process.platform !== 'win32',
      maxBuffer: 16 * 1024 * 1024,
    });
    const code = r.error ? -1 : r.status;
    const timedOut = !!(r.error && String(r.error.code || '') === 'ETIMEDOUT') || r.signal === 'SIGTERM';
    let swept = null;
    if (timedOut) swept = killTree(r.pid);
    const text = String((r.stdout || '') + (r.stderr || ''));
    results.push({
      step,
      code,
      ok: code === 0,
      timedOut,
      swept,
      tail: text.split('\n').filter(Boolean).slice(-12).join('\n'),
      error: r.error ? String(r.error.message) : '',
    });
  }
  return results;
}

function reportVerify(results) {
  const lines = [];
  for (const r of results) {
    lines.push((r.ok ? '  pass  ' : '  FAIL  ') + r.step + (r.ok ? '' : '  (exit ' + r.code + ')'));
    if (!r.ok) {
      if (r.error) lines.push('        ' + r.error);
      if (r.timedOut)
        lines.push(
          '        it ran past the limit; the process tree was ' + (r.swept ? 'swept' : 'left behind - kill it by hand before the next run')
        );
      for (const l of r.tail.split('\n').filter(Boolean)) lines.push('        ' + l);
    }
  }
  return lines;
}

const ROLES_DIR = path.resolve(__dirname, '..', 'roles');
const TIERS_FILE = path.resolve(__dirname, '..', 'tiers.json');

const MODEL_RANK = { haiku: 0, sonnet: 1, opus: 2, fable: 2 };
const EFFORT_RANK = { low: 0, medium: 1, high: 2, xhigh: 3, max: 4 };
const BUMP_CHAIN = ['haiku', 'sonnet', 'opus'];
const EFFORT_CHAIN = ['low', 'medium', 'high'];

let _tiers = null;

function tiers() {
  if (!_tiers) _tiers = JSON.parse(fs.readFileSync(TIERS_FILE, 'utf8'));
  return _tiers;
}

const AUTO_EFFORT_CAP = tiers().autoEffortCap;
const PROFILE_CEILING = tiers().ceiling;

function parseCell(text) {
  const parts = String(text).split('/');
  return { model: (parts[0] || '').toLowerCase(), effort: parts[1] ? parts[1].toLowerCase() : null };
}

function bumpModel(m) {
  const i = BUMP_CHAIN.indexOf(m);
  return i >= 0 && i < BUMP_CHAIN.length - 1 ? BUMP_CHAIN[i + 1] : m;
}

function bumpEffort(e) {
  if (!e) return e;
  const i = EFFORT_CHAIN.indexOf(e);
  if (i < 0 || EFFORT_RANK[e] >= EFFORT_RANK[AUTO_EFFORT_CAP]) return e;
  return EFFORT_CHAIN[i + 1];
}

function roleRow(role) {
  const name = String(role || '');
  if (!/^[a-z][a-z0-9-]*$/.test(name)) return null;
  const T = tiers();
  let body = null;
  try {
    body = fs.readFileSync(path.join(ROLES_DIR, name + '.md'), 'utf8');
  } catch {
    body = null;
  }
  const declared = body ? field('tier', body).toLowerCase() : '';
  const row = declared || name;
  return T.cells[row] ? row : null;
}

function projectProfile() {
  const where = locate();
  if (!where) return '';
  try {
    const cfg = JSON.parse(fs.readFileSync(path.join(where.relay, 'config.json'), 'utf8'));
    return String((cfg && cfg.profile) || '').toLowerCase();
  } catch {
    return '';
  }
}

function profileOf(want) {
  const T = tiers();
  const p = String(want || projectProfile() || settings().profile || 'normal').toLowerCase();
  return T.profiles.indexOf(p) >= 0 ? p : 'normal';
}

function roleBase(role, profile) {
  const row = roleRow(role);
  if (!row) return null;
  const p = profileOf(profile);
  const cell = parseCell(tiers().cells[row][p]);
  return { row, profile: p, model: cell.model, effort: cell.effort };
}

function tier(role, opt) {
  const o = opt || {};
  const T = tiers();
  const row = roleRow(role);
  if (!row) return null;

  const profile = profileOf(o.profile);
  const askerModel = String(o.asker || '').toLowerCase();
  let cellText = T.cells[row][profile];
  let pairedFrom = '';
  const closed = row === 'advisor' && String(cellText).toLowerCase() === 'off';

  if (!closed && row === 'advisor' && askerModel && T.advisorLadder && T.advisorLadder[askerModel]) {
    cellText = T.advisorLadder[askerModel];
    pairedFrom = askerModel;
  }
  const base = closed ? { model: '', effort: '' } : parseCell(cellText);
  let model = base.model;
  let effort = base.effort;

  const reasons = [];
  const signals = [];
  const notes = [];
  let raisedBySignal = false;

  if (pairedFrom)
    reasons.push('the asker runs ' + pairedFrom + ', so the advisor steps up to ' + cellText);

  if (String(o.risk || '').toLowerCase() === 'high') {
    signals.push('risk high');
    raisedBySignal = true;
    if (MODEL_RANK[model] < MODEL_RANK.opus) {
      model = 'opus';
      reasons.push('risk high raises the model to opus');
    }
    if (effort && EFFORT_RANK[effort] < EFFORT_RANK.medium) {
      effort = 'medium';
      reasons.push('risk high lifts the effort to medium');
    }
  }

  const fails = Number(o.repeatFail || 0);
  if (fails >= T.signals.repeatFail.effortAt) {
    signals.push('verify failed ' + fails + ' times with the same signature');
    raisedBySignal = true;
    const e2 = bumpEffort(effort);
    if (e2 !== effort) {
      effort = e2;
      reasons.push('a repeated failure raises the effort to ' + effort);
    }
    if (fails >= T.signals.repeatFail.modelAt) {
      const m2 = bumpModel(model);
      if (m2 !== model) {
        model = m2;
        reasons.push('the failure survived the effort raise, so the model goes to ' + model);
      }
    }
  }

  const round = Number(o.round || 0);
  if (round >= T.signals.roundModelBump && T.riskExempt.indexOf(row) >= 0) {
    signals.push('round ' + round);
    raisedBySignal = true;
    const m2 = bumpModel(model);
    if (m2 !== model) {
      model = m2;
      reasons.push('round >= ' + T.signals.roundModelBump + ' raises the model to ' + model);
    }
  }

  const advisorRequired = round >= T.signals.roundAdvisorRequired;
  if (advisorRequired)
    notes.push('round >= ' + T.signals.roundAdvisorRequired + ' - the advisor opens before the next attempt');

  const irreversible = !!o.irreversible;
  if (irreversible)
    notes.push('irreversible operation - the auditor opens whatever the profile says');

  const askedModel = String(o.model || '').toLowerCase();
  if (MODEL_RANK[askedModel] !== undefined) {
    if (MODEL_RANK[askedModel] > MODEL_RANK[model]) {
      model = askedModel;
      reasons.push('the caller raised the model');
    } else if (MODEL_RANK[askedModel] < MODEL_RANK[model]) {
      reasons.push('the caller asked for ' + askedModel + ' - refused, no route goes below the cell');
    }
  }

  const askedEffort = String(o.effort || '').toLowerCase();
  if (EFFORT_RANK[askedEffort] !== undefined && effort) {
    if (EFFORT_RANK[askedEffort] > EFFORT_RANK[AUTO_EFFORT_CAP] && !o.userAsked) {
      reasons.push(askedEffort + ' is never granted automatically - only on an explicit user request');
    } else if (EFFORT_RANK[askedEffort] > EFFORT_RANK[effort]) {
      effort = askedEffort;
      reasons.push('the caller raised the effort');
    } else if (EFFORT_RANK[askedEffort] < EFFORT_RANK[effort]) {
      reasons.push('the caller asked for ' + askedEffort + ' - refused, no route goes below the cell');
    }
  }

  const ceiling = T.ceiling[profile] || 'opus';
  const exemptRole = T.ceilingExempt.indexOf(row) >= 0;
  const exemptRisk = T.riskExempt.indexOf(row) >= 0 && raisedBySignal;
  let pierced = false;
  if (MODEL_RANK[model] > MODEL_RANK[ceiling]) {
    if (exemptRole || exemptRisk) {
      pierced = true;
      reasons.push(
        exemptRole
          ? row + ' is exempt from the profile ceiling'
          : 'a signal raised ' + row + ', and a signal-raised role is exempt from the ceiling'
      );
    } else {
      model = ceiling;
      reasons.push('profile ' + profile + ' caps the model at ' + ceiling);
    }
  }

  const ad = T.advisorDefault && T.advisorDefault[profile];
  if (ad && ad.onContractOpen.indexOf(row) >= 0)
    notes.push(
      'profile ' + profile + ' opens the advisor alongside this contract, in the same message - ' +
        ad.perContract + ' per contract'
    );

  const asker = askerModel;
  let blocked = '';
  if (closed)
    blocked =
      'the ' + profile + ' profile runs no advisor - the step above its own model is not in its budget' +
      ' - raise the profile or ask the user';
  else if (row === 'advisor' && T.advisorModelGap && asker && asker === model)
    blocked =
      'the asker already runs ' + asker + ' and no other model is paired to it' +
      ' - the same model cannot give itself a second opinion';

  return {
    role: String(role),
    row,
    model,
    effort,
    cell: cellText,
    base,
    profile,
    ceiling,
    pierced,
    advisory: T.advisory.indexOf(row) >= 0,
    signals,
    reasons,
    notes,
    advisorRequired,
    irreversible,
    asker: asker || null,
    blocked,
  };
}

function tallyFails(relay, agent) {
  if (!relay) return 0;
  try {
    const t = JSON.parse(fs.readFileSync(path.join(liveDir(relay), '_tally.json'), 'utf8'));
    const by = t.byAgent || {};
    if (agent && by[agent]) return Number(by[agent].fails || 0);
    if (agent) return 0;
    return Number(t.fails || 0);
  } catch {
    return 0;
  }
}

function advisorQuota(relay, profile, id) {
  const T = tiers();
  const q = T.quota[profile] && T.quota[profile].advisor;
  if (!q) return null;
  let files = [];
  try {
    files = fs.readdirSync(liveDir(relay)).filter((f) => f.endsWith('.json'));
  } catch {
    files = [];
  }
  let inRelay = 0;
  let onContract = 0;
  for (const f of files) {
    const r = read(path.join(liveDir(relay), f));
    if (!r || String(r.role || '').toLowerCase() !== 'advisor') continue;
    inRelay += 1;
    if (id && r.contract === id) onContract += 1;
  }
  return {
    perRelay: q.perRelay,
    perContract: q.perContract,
    relay: inRelay,
    contract: onContract,
    blocked: inRelay >= q.perRelay || (!!id && onContract >= q.perContract),
  };
}

function tierCmd() {
  const role = arg('role');
  const row = roleRow(role);
  if (!row)
    return stop([
      'Unknown role: ' + (role || '(none)'),
      'A role resolves through its file tier: field, or through a row name in core/tiers.json.',
      '',
      'Usage: contract.js tier --role builder [--profile eco] [--id T7] [--risk high]',
      '       [--round N] [--repeat-fail N] [--model M] [--effort E] [--asker opus] [--user]',
    ]);

  const id = arg('id');
  let level = null;
  let irrev = null;
  let round = arg('round');
  let relay = null;

  if (id) {
    const c = load(id);
    if (c.error) return stop([c.error]);
    relay = c.relay;
    const owns = owned(c.body);
    level = risk.resolve(c.root, owns, field('risk', c.body));
    irrev = risk.irreversible(owns, verifySteps(c.body));
    if (!round) round = field('round', c.body);
  } else {
    const where = locate();
    relay = where ? where.relay : null;
  }

  const declaredHigh = String(arg('risk') || '').toLowerCase() === 'high';
  const riskLevel = declaredHigh || (level && level.level === 'high') ? 'high' : level ? level.level : null;

  const t = tier(role, {
    profile: arg('profile'),
    risk: riskLevel,
    round,
    repeatFail: arg('repeat-fail') || tallyFails(relay, arg('run-id') || arg('agent')),
    irreversible: (irrev && irrev.hit) || has('irreversible'),
    model: arg('model'),
    effort: arg('effort'),
    asker: arg('asker'),
    userAsked: has('user'),
  });

  const quota = t.row === 'advisor' && relay ? advisorQuota(relay, t.profile, id) : null;

  const lines = [
    t.role + ' ' + t.model + (t.effort ? '/' + t.effort : ''),
    '  cell     ' + t.row + ' x ' + t.profile + ' = ' + t.cell,
    '  profile  ' + t.profile + ' (ceiling ' + t.ceiling + ')',
  ];
  if (t.role !== t.row) lines.push('  row      ' + t.role + ' resolves to ' + t.row);
  if (riskLevel)
    lines.push('  risk     ' + riskLevel + (level && level.reasons.length ? ' (' + level.reasons.join('; ') + ')' : ''));
  if (t.asker) lines.push('  asker    ' + t.asker);
  lines.push('  signals  ' + (t.signals.length ? t.signals.join(', ') : 'none'));
  lines.push('  ceiling  ' + (t.pierced ? 'pierced' : 'held'));
  for (const r of t.reasons) lines.push('  reason   ' + r);
  for (const n of t.notes) lines.push('  note     ' + n);
  if (t.advisory) lines.push('  note     this row is advice to T0, not a forced model');
  if (quota)
    lines.push(
      '  quota    ' + quota.relay + '/' + quota.perRelay + ' advisor openings in this relay, ' +
        quota.contract + '/' + quota.perContract + ' on this contract'
    );

  if (t.blocked) {
    lines[0] = t.role + ' does not open';
    return stop(
      lines.concat([
        '',
        'Blocked - ' + t.blocked + '.',
        'The advisor does not open. Ask the user, or raise the profile so the cell lands on another model.',
      ])
    );
  }

  if (quota && quota.blocked)
    return stop(
      lines.concat([
        '',
        'Blocked - the ' + t.profile + ' advisor quota is spent. Decide without a second opinion, or ask the user.',
      ])
    );

  return out(lines);
}
const RELAY_PATH = /(^|\/)[.]claude\/relay\//;

const NEVER_ASKED = [
  /(^|\/)tests?\//i,
  /(^|\/)docs\/.+\.md$/i,
  /\.(test|spec|tests)\.[a-z]+$/i,
  /(^|\/)(readme|license|changelog|package\.json|install\.)/i,
];

const CODE_FILE = /\.(js|jsx|mjs|cjs|ts|tsx|py|cs|go|rs|java|rb|php|swift|kt|c|h|cpp|hpp|scala)$/i;

function callers(root, rel) {
  const base = rel.split('/').pop();
  if (!CODE_FILE.test(base)) return named(root, base);
  const stem = base.replace(/\.[a-z0-9]+$/i, '');
  const pattern = '(import|require|using|include|from)[^' + NL + ']*' + stem;
  return lines(git(root, ['grep', '-l', '-i', '-E', '--', pattern]));
}

function named(root, base) {
  return lines(git(root, ['grep', '-l', '--fixed-strings', '--', base]));
}

function lines(raw) {
  return String(raw || '')
    .split(NL)
    .map((x) => x.trim())
    .filter(Boolean);
}

function orphans(root, owns) {
  const held = owns.map((p) => p.replace(/\\/g, '/'));
  const found = [];
  for (const rel of held) {
    if (NEVER_ASKED.some((re) => re.test(rel))) continue;
    const others = callers(root, rel).filter(
      (f) => !held.includes(f) && !f.startsWith('trash/') && !RELAY_PATH.test(f)
    );
    if (!others.length) found.push(rel);
  }
  return found;
}

function siblings(relay, id) {
  const dir = path.join(relay, 'contracts');
  let files = [];
  try {
    files = fs.readdirSync(dir).filter((f) => /\.md$/i.test(f) && f !== id + '.md');
  } catch {
    return [];
  }
  const rows = [];
  for (const f of files.sort()) {
    let body = '';
    try {
      body = fs.readFileSync(path.join(dir, f), 'utf8');
    } catch {
      continue;
    }
    rows.push({ id: f.replace(/\.md$/i, ''), body, status: statusOf(body) || 'open' });
  }
  return rows;
}

function keyOf(p) {
  return String(p).replace(/\\/g, '/').replace(/^\.\//, '').toLowerCase();
}

function changedSet(root, owns) {
  const base = risk.baseRef(root);
  const raw = git(root, ['diff', '--name-only', base, '--'].concat(owns));
  const set = new Set();
  for (const row of String(raw || '').split('\n')) if (row.trim()) set.add(keyOf(row.trim()));
  return set;
}

function overlaps(relay, id, owns, root) {
  const changed = root ? changedSet(root, owns) : null;
  const mine = new Set(owns.map(keyOf));
  const hits = [];
  for (const s of siblings(relay, id)) {
    if (s.status === 'done') continue;
    const shared = owned(s.body)
      .filter((p) => mine.has(keyOf(p)))
      .filter((p) => !changed || changed.has(keyOf(p)));
    if (shared.length) hits.push({ id: s.id, status: s.status, shared });
  }
  return hits;
}

function blockedBy(body) {
  return entries('blocked-by', body).filter((v) => isContractName(v + '.md'));
}

function blockers(relay, id, body) {
  const want = blockedBy(body);
  if (!want.length) return [];
  const known = new Map();
  for (const s of siblings(relay, id)) known.set(s.id.toLowerCase(), s.status);
  const open = [];
  for (const b of want) {
    const st = known.get(b.toLowerCase());
    if (st === undefined) {
      if (!fs.existsSync(path.join(relay, 'contracts', 'done', b + '.md')))
        open.push({ id: b, status: 'missing' });
      continue;
    }
    if (st !== 'done') open.push({ id: b, status: st });
  }
  return open;
}

const EXECUTABLE = /\.(js|jsx|mjs|cjs|ts|tsx|py|cs|go|rs|java|rb|php|sh|ps1|bat|sql|json|ya?ml|toml|lock|csproj|sln|gradle)$|(^|\/)(Dockerfile|Makefile|[^/]*\.lock)$/i;

function dirtyOutside(root, owns) {
  const raw = git(root, ['status', '--porcelain', '--untracked-files=no']);
  if (raw === null) return [];
  const mine = new Set(owns.map(keyOf));
  const dirty = [];
  for (const row of String(raw).split('\n')) {
    if (!row.trim()) continue;
    const p = row
      .trimStart()
      .replace(/^[MADRCU]{1,2}\s+/, '')
      .split(' -> ')
      .pop()
      .replace(/^"|"$/g, '');
    const k = keyOf(p);
    if (/^\.claude\/relay\//i.test(k)) continue;
    if (mine.has(k)) continue;
    if (!EXECUTABLE.test(k)) continue;
    dirty.push(p);
  }
  return dirty;
}

const MANSET = path.join(__dirname, 'manset.js');

function prose(root, body, owns) {
  if (/^manset:[ \t]*(off|no|false)/im.test(body)) return [];
  const docs = owns
    .map(String)
    .filter((p) => /\.md$/i.test(p))
    .filter((p) => {
      try {
        return fs.statSync(path.join(root, p)).isFile();
      } catch {
        return false;
      }
    });
  if (!docs.length) return [];
  return ['node "' + MANSET + '" ' + docs.map((p) => '"' + p + '"').join(' ')];
}

function complete() {
  const c = load(arg('id'));
  if (c.error) return stop([c.error, '', 'Usage: contract.js complete --id T7']);

  const owns = owned(c.body);
  if (!owns.length) return stop([c.id + ' has an empty owns set - cannot complete.']);

  const ownsFault = seal.ownsFault(c.root, owns);
  if (ownsFault)
    return stop([
      c.id + ' cannot complete - ' + ownsFault,
      '',
      'A directory digest does not change when its contents do; the seal would lie.',
      'List the files the contract touches, one by one.',
    ]);

  const missing = seal.ownsMissing(c.root, owns);
  if (missing.length)
    return stop([
      c.id + ' cannot complete - owns names files that do not exist:',
      '',
      ...missing.map((p) => '  ' + p),
      '',
      'A contract closes on work that landed. Write the files, or correct owns.',
    ]);

  const ladder = statusFault(c.body);
  if (ladder) return stop([c.id + ' cannot complete - ' + ladder]);

  const held = blockers(c.relay, c.id, c.body);
  if (held.length)
    return stop([
      c.id + ' cannot complete - it is blocked by work that has not landed:',
      '',
      ...held.map((b) => '  ' + b.id + '  ' + b.status),
      '',
      'Close the blocker first, or take it out of blocked-by if it no longer holds.',
    ]);

  const clash = overlaps(c.relay, c.id, owns, c.root);
  if (clash.length)
    return stop(
      [c.id + ' cannot complete - another open contract owns the same files:', ''].concat(
        clash.map((h) => '  ' + h.id + ' (' + h.status + ')  ' + h.shared.join(', ')),
        [
          '',
          'The seal digests these files, so whoever closes first seals work it never did.',
          'Split the owns sets, or close both in one contract.',
        ]
      )
    );

  const dirty = dirtyOutside(c.root, owns);
  if (dirty.length)
    return stop(
      [c.id + ' cannot complete - tracked files outside owns are modified:', ''].concat(
        dirty.slice(0, 20).map((p) => '  ' + p),
        dirty.length > 20 ? ['  ... and ' + (dirty.length - 20) + ' more'] : [],
        [
          '',
          'These can change what verify returns, and the contract never claimed them.',
          'Commit them, stash them, or add them to owns.',
        ]
      )
    );

  const loose = looseVerify(c.body);
  if (loose)
    return stop([
      c.id + ' writes its verify as one plain line, so it has zero steps:',
      '  verify: ' + loose,
      '',
      'That parses to an empty list and the seal would run nothing at all. Write it as a',
      'list, `verify: [' + loose + ']`, or as a block of `  - ' + loose + '` lines.',
    ]);

  const steps = verifySteps(c.body).concat(prose(c.root, c.body, owns));
  if (!steps.length && !/^verify:[ \t]*\[[ \t]*\]/im.test(c.body))
    return stop([
      c.id + ' has no verify steps.',
      'Add a `verify:` block, or `verify: []` with a written reason under ## Acceptance.',
    ]);

  const hollow = hollowVerify(steps);
  if (hollow.length)
    return stop(
      [
        c.id + ' cannot complete - nothing here is acceptance.',
        '',
      ]
        .concat(hollow.map(([s, why]) => '  ' + s + '  (' + why + ')'))
        .concat([
          '',
          'A verify step has to be able to fail. Give one command that would exit non-zero',
          'if the work were undone - a test, a build, a lint, a grep for what you promised.',
        ])
    );

  const unsafe = steps.map((s) => [s, unsafeStep(s)]).filter(([, why]) => why);
  if (unsafe.length)
    return stop(
      [c.id + ' cannot complete - a verify step reaches into the gate.', ''].concat(
        unsafe.map(([s, why]) => '  ' + s + '  (' + why + ')')
      )
    );

  const busy = takeLock(c.relay, c.id);
  if (busy)
    return stop([
      c.id + ' cannot complete - ' + busy.id + ' is running its verify steps right now (pid ' + busy.pid + ').',
      '',
      'Two verify runs in one checkout share a build output and a test host, so whichever',
      'finishes second measures the other one. Wait for it, or run this in a worktree.',
    ]);
  let results;
  try {
    results = runVerify(c.root, steps);
  } finally {
    dropLock(c.relay);
  }
  const failed = results.filter((r) => !r.ok);
  if (failed.length)
    return stop([c.id + ' cannot complete - verification failed.', ''].concat(reportVerify(results)));

  const hollowRun = results.filter((r) => emptyRun(r.tail));
  if (hollowRun.length)
    return stop(
      [c.id + ' cannot complete - a verify step passed without running anything:', ''].concat(
        hollowRun.map((r) => '  ' + r.step),
        [
          '',
          'Exit 0 on zero collected tests is not acceptance, it is a filter that matches',
          'nothing. Fix the filter, or name a step that would fail if the work were undone.',
        ]
      )
    );

  const level = risk.resolve(c.root, owns, field('risk', c.body));

  const headSha = git(c.root, ['rev-parse', 'HEAD']);
  if (!headSha) return stop(['Cannot read HEAD - not a git repository, or no commit yet.']);

  const round = field('round', c.body) || '1';
  let record = null;
  let recordFile = null;

  if (level.level === 'high') {
    recordFile = seal.recordPath(c.relay, c.id, round);
    record = require('../hooks/lib.js').read(recordFile);
    if (!record)
      return stop([
        c.id + ' is high risk and has no audit record: ' + path.relative(c.root, recordFile),
        '',
        'Why high risk: ' + level.reasons.join('; '),
        ...(level.spots && level.spots.length
          ? ['', 'What changed, by hunk:'].concat(risk.spotLines(level.spots))
          : []),
        '',
        'Run the auditor role. It writes the record with fields:',
        '  ' + seal.RECORD_FIELDS.join(', '),
      ]);
    const why = seal.checkRecord(record, {
      id: c.id,
      headSha,
      owns,
      diffHash: seal.ownsDigest(c.root, owns),
    });
    if (why) return stop([c.id + ' cannot complete - ' + why]);
    const who = seal.checkAuditor(c.relay, record.auditorRunId);
    if (who) return stop([c.id + ' cannot complete - ' + who]);
  }

  fs.mkdirSync(path.dirname(c.dst), { recursive: true });
  fs.writeFileSync(c.src, stampStatus(c.body, 'done'), 'utf8');
  fs.renameSync(c.src, c.dst);
  setNotice(c.relay, c.id + ' ' + t('notice.closed'));
  const dropped = dropSnapshot(c.root, c.id);
  if (recordFile) seal.consume(recordFile, headSha);
  seal.ledgerInit(c.relay);
  seal.ledgerAppend(c.relay, {
    id: c.id,
    round,
    risk: level.level,
    verify: results.map((r) => ({ step: r.step, code: r.code })),
    auditorRunId: record ? record.auditorRunId : null,
    headSha,
    at: new Date().toISOString(),
  });

  const dead = orphans(c.root, owns);

  return out(
    [c.id + ' complete -> contracts/done/' + c.id + '.md', ''].concat(
      reportVerify(results),
      [
        '',
        'risk ' + level.level + (level.reasons.length ? ' (' + level.reasons.join('; ') + ')' : ''),
        'ledger written at HEAD ' + headSha.slice(0, 8) + (record ? ', audit record consumed' : ''),
      ],
      record
        ? []
        : ['', 'Sealed with no audit record: nobody but the builder read this work.'],
      dropped
        ? []
        : [
            '',
            'The snapshot ref is still there. Take it off by hand, or the next contract',
            'with this id reverts to a tree that is no longer the one it pinned:',
            '  git update-ref -d ' + snapRef(c.id),
          ],
      dead.length
        ? ['', 'Nothing in the tree imports these files. Is that right?']
            .concat(dead.map((p) => '  ' + p))
            .concat(['', 'If their work is done, move them under trash/. Do not delete them.'])
        : []
    )
  );
}

const LADDER = ['open', 'active', 'submitted', 'done'];

const SNAP_NS = 'refs/teknesyum/';

function snapRef(id) {
  return SNAP_NS + id;
}

function snapshotOf(root, id) {
  return git(root, ['rev-parse', '--verify', '--quiet', snapRef(id)]) || null;
}

function takeSnapshot(root, id) {
  const held = snapshotOf(root, id);
  if (held) return held;
  const dirty = git(root, ['stash', 'create']);
  if (dirty === null) return null;
  const sha = dirty || git(root, ['rev-parse', 'HEAD']);
  if (!sha) return null;
  return git(root, ['update-ref', snapRef(id), sha]) === null ? null : sha;
}

function dropSnapshot(root, id) {
  if (!snapshotOf(root, id)) return true;
  if (git(root, ['update-ref', '-d', snapRef(id)]) === null) return false;
  return !snapshotOf(root, id);
}

function snapshotCmd() {
  const c = load(arg('id'));
  if (c.error) return stop([c.error]);
  const sha = takeSnapshot(c.root, c.id);
  if (!sha) return stop(['Cannot snapshot - not a git repository, or no commit yet.']);
  return out([
    c.id + ' pinned at ' + sha.slice(0, 8) + ' as ' + snapRef(c.id),
    '',
    'A real ref, not a dangling object, so gc cannot take it. It holds the tracked',
    'files as they were; anything untracked is not in it.',
  ]);
}

function revert() {
  const c = load(arg('id'));
  if (c.error) return stop([c.error]);
  const sha = snapshotOf(c.root, c.id);
  if (!sha)
    return stop([
      'No snapshot for ' + c.id + '.',
      'One is taken by: contract.js precheck --id ' + c.id + ' (or snapshot --id ' + c.id + ')',
    ]);
  const owns = owned(c.body);
  if (!owns.length) return stop([c.id + ' owns nothing, so there is nothing to put back.']);
  if (!has('yes'))
    return out(
      [
        'revert would overwrite these with ' + sha.slice(0, 8) + ':',
        '',
      ]
        .concat(owns.map((o) => '  ' + o))
        .concat(['', 'Run it again with --yes.']),
      1
    );
  const done = [];
  const missed = [];
  for (const o of owns) {
    if (git(c.root, ['checkout', sha, '--', o]) === null) missed.push(o);
    else done.push(o);
  }
  return out(
    [c.id + ' reverted to ' + sha.slice(0, 8)]
      .concat(done.map((o) => '  put back ' + o))
      .concat(missed.length ? [''].concat(missed.map((o) => '  not in the snapshot: ' + o)) : []),
    missed.length ? 1 : 0
  );
}

function precheck() {
  const c = load(arg('id'));
  if (c.error) return stop([c.error]);
  const steps = verifySteps(c.body).concat(prose(c.root, c.body, owned(c.body)));
  if (!steps.length)
    return out([
      c.id + ' carries no verify steps, so there is nothing to check before the work starts.',
      'Add a ## verify section, or run the contract as it is.',
    ], 1);
  const pin = takeSnapshot(c.root, c.id);
  const results = runVerify(c.root, steps);
  const met = results.every((r) => r.code === 0);
  return out(
    [c.id + ': ' + steps.length + ' verify step' + (steps.length > 1 ? 's' : '')]
      .concat(reportVerify(results))
      .concat([
        '',
        met
          ? 'Every step already passes. The work is done - close it instead of spawning an agent:'
          : 'The work is genuinely open. Spawning an agent is worth it.',
        met ? '  node <plugin>/scripts/contract.js submit --id ' + c.id : '',
        pin ? 'The tree is pinned at ' + pin.slice(0, 8) + '; revert --id ' + c.id + ' puts it back.' : '',
      ])
      .filter((x) => x !== ''),
    met ? 0 : 1
  );
}

function statusOf(body) {
  return String(field('status', body) || '').toLowerCase().trim();
}

function statusFault(body) {
  const now = statusOf(body);
  if (!now) return 'the contract carries no status: line - the ladder is open, active, submitted, done';
  if (now === 'submitted') return '';
  if (now === 'done') return 'the contract already says status: done';
  if (!LADDER.includes(now)) return 'unknown status: ' + now;
  return (
    'status is ' +
    now +
    ', and only a submitted contract closes - run: contract.js submit --id <ID>'
  );
}

function stampStatus(body, want) {
  if (/^status:.*$/im.test(body)) return body.replace(/^status:.*$/im, 'status: ' + want);
  return body.replace(/^(#.*\n)/, '$1status: ' + want + '\n');
}

function globRe(pattern) {
  const s = String(pattern).split(path.sep).join('/');
  let re = '';
  for (let i = 0; i < s.length; i += 1) {
    const ch = s[i];
    if (ch === '*') {
      if (s[i + 1] === '*') {
        re += '.*';
        i += 1;
        if (s[i + 1] === '/') i += 1;
      } else re += '[^/]*';
    } else if (ch === '?') re += '[^/]';
    else if ('.+^${}()|[]'.indexOf(ch) >= 0) re += '[' + ch + ']';
    else re += ch;
  }
  return new RegExp('^' + re + '$', 'i');
}

function expandOwns(root, owns) {
  const globs = owns.filter((p) => /[*?]/.test(String(p)));
  if (!globs.length) return null;
  const tracked = lines(git(root, ['ls-files']));
  const out = [];
  const seen = new Set();
  for (const p of owns) {
    if (!/[*?]/.test(String(p))) {
      if (!seen.has(p)) seen.add(p), out.push(p);
      continue;
    }
    const re = globRe(p);
    const hits = tracked.filter((f) => re.test(f)).sort();
    if (!hits.length) return { pattern: p, error: true };
    for (const h of hits) if (!seen.has(h)) seen.add(h), out.push(h);
  }
  return { files: out, globs };
}

function rewriteOwns(body, files) {
  const block = 'owns:' + NL + files.map((f) => '  - ' + f).join(NL);
  if (/^owns:[ \t]*\[[^\]]*\]/im.test(body)) return body.replace(/^owns:[ \t]*\[[^\]]*\]/im, block);
  return body.replace(/^owns:[ \t]*\n(?:[ \t]+-[ \t]*.+\n?)+/im, block + NL);
}

function submit() {
  const c = load(arg('id'));
  if (c.error) return stop([c.error, '', 'Usage: contract.js submit --id T7']);
  const loose = looseVerify(c.body);
  if (loose)
    return stop([
      c.id + ' writes its verify as one plain line, so it has zero steps:',
      '  verify: ' + loose,
      '',
      'Submitting it now would hand the gate a contract that runs nothing. Write it as a',
      'list or a block of `  - ` lines first.',
    ]);
  let body = c.body;
  let widened = null;
  const grown = expandOwns(c.root, owned(c.body));
  if (grown && grown.error)
    return stop([
      c.id + ' owns a pattern that matches nothing tracked: ' + grown.pattern,
      '',
      'A glob is expanded here, at delivery, not at the seal. Correct the pattern, or',
      'name the files.',
    ]);
  if (grown) {
    body = rewriteOwns(body, grown.files);
    widened = grown;
  }

  const now = statusOf(c.body);
  if (now === 'submitted') return out([c.id + ' is already submitted.']);
  if (now && !['open', 'active'].includes(now))
    return stop([c.id + ' cannot be submitted from status ' + now + '.']);
  fs.writeFileSync(c.src, stampStatus(body, 'submitted'), 'utf8');
  return out(
    [c.id + ' submitted.'].concat(
      widened
        ? [
            widened.globs.join(', ') +
              ' expanded to ' +
              widened.files.length +
              ' file' +
              (widened.files.length > 1 ? 's' : '') +
              ', written into the contract.',
          ]
        : [],
      ['Next: contract.js complete --id ' + c.id + ' runs the verify steps and decides.']
    )
  );
}

const ADVISOR_FROM = 3;

function roleRecord(relay, runId, want) {
  const rec = read(path.join(liveDir(relay), String(runId).replace(/[^A-Za-z0-9_.-]/g, '_') + '.json'));
  if (!rec) return 'no live record for ' + runId + ' - an advisor is an agent that ran, not a name';
  const role = String(rec.role || rec.agent_type || '?').replace(/^teknesyum(-core)?:/, '');
  if (role !== want) return runId + ' is a ' + role + ' record, not an ' + want;
  return '';
}

function secondOpinion(relay, round, advisor) {
  if (round < ADVISOR_FROM) return null;
  if (!advisor)
    return [
      'Round ' + round + ' means the contract has been misread twice already. That is where a',
      'second mind is worth more than a third attempt by the same one.',
      '',
      'Open the advisor role, then name its agent id: --advisor <agent-id>',
      '',
      'The rule was written down for a long time and never once fired, because nothing',
      'asked for it. Now the gate asks.',
    ];
  const why = roleRecord(relay, advisor, 'advisor');
  if (why) return ['Refused - ' + why + '.'];
  return null;
}

function reopen() {
  const id = arg('id');
  const reason = arg('reason');
  if (!id || !isContractName(id + '.md'))
    return stop(['Missing or malformed contract id.', '', 'Usage: contract.js reopen --id T7 --reason "..."']);
  if (!reason || reason.trim().length < 10)
    return stop(['--reason is required: one line saying why the close was wrong.']);
  const advisor = arg('advisor');
  const critical = arg('critical');
  if (!critical || critical.trim().length < 20)
    return stop([
      'A round costs a builder and an auditor. It opens for one thing only: something',
      'critical that the seal let through.',
      '',
      'Name it: --critical "<what is broken, in 20 characters or more>"',
      '',
      'Everything else - style, a nicer name, a test you would also like - is debt.',
      'Write it under ## Checkpoint and leave the contract closed.',
    ]);
  const where = locate();
  if (!where) return stop(['No relay root - .claude/relay does not exist.']);
  const done = path.join(where.relay, 'contracts', 'done', id + '.md');
  const back = path.join(where.relay, 'contracts', id + '.md');
  let body;
  try {
    body = fs.readFileSync(done, 'utf8');
  } catch {
    return stop([id + ' is not under done/ - nothing to reopen.']);
  }
  if (fs.existsSync(back)) return stop([id + ' is already open under contracts/.']);
  const round = String(Number(field('round', body) || '1') + 1);
  const cap = Number((tiers().signals || {}).roundCap || 0);
  if (cap && Number(round) > cap && !has('force'))
    return stop([
      id + ' has been round ' + cap + ' already, and a round ' + round + ' is a sign the contract is wrong,',
      'not that the agent is unlucky. Split it, or narrow what it owns, and open a new one.',
      '',
      'If you really mean it: add --force.',
    ]);
  const second = secondOpinion(where.relay, Number(round), advisor);
  if (second) return stop(second);
  let next = stampStatus(body, 'active');
  next = /^round:.*$/im.test(next)
    ? next.replace(/^round:.*$/im, 'round: ' + round)
    : next.replace(/^(status:.*\n)/im, '$1round: ' + round + '\n');
  fs.writeFileSync(done, next, 'utf8');
  fs.renameSync(done, back);
  seal.ledgerInit(where.relay);
  seal.ledgerAppend(where.relay, {
    id,
    result: 'reopened',
    round,
    reason: reason.trim(),
    critical: critical.trim(),
    advisor: advisor ? advisor.trim() : null,
    at: new Date().toISOString(),
  });
  return out([
    id + ' reopened -> contracts/' + id + '.md',
    'round ' + round + ', status active, the ledger keeps the closed round and what was critical.',
  ]);
}

function close() {
  const c = load(arg('id'));
  if (c.error) return stop([c.error, '', 'Usage: contract.js close --id Y2 --reason "..."']);

  const reason = arg('reason');
  if (!reason || reason.trim().length < 40)
    return stop([
      'No silent closure - --reason must be at least 40 characters.',
      'An unmet contract does not close without saying why.',
    ]);

  const headSha = git(c.root, ['rev-parse', 'HEAD']);
  if (!headSha) return stop(['Cannot read HEAD - not a git repository, or no commit yet.']);

  const at = new Date().toISOString();
  const archived =
    stampStatus(c.body, 'done').replace(/\s*$/, '') +
    '\n\n## Closed - unmet (' +
    at.slice(0, 10) +
    ')\n\n' +
    reason.trim() +
    '\n\nNot sealed. Acceptance was not met; the work stays in the tree.\n';
  fs.mkdirSync(path.dirname(c.dst), { recursive: true });
  fs.writeFileSync(c.src, archived, 'utf8');
  fs.renameSync(c.src, c.dst);
  setNotice(c.relay, c.id + ' ' + t('notice.closed'));
  dropSnapshot(c.root, c.id);
  seal.ledgerInit(c.relay);
  seal.ledgerAppend(c.relay, { id: c.id, result: 'unmet', reason: reason.trim(), headSha, at });

  return out([c.id + ' closed as unmet -> contracts/done/' + c.id + '.md']);
}

function pathish(step) {
  const out = [];
  const re = /(?:^|[\s"'(=])((?:\.{1,2}[\\/])?[\w.-]+(?:[\\/][\w.-]+)+)/g;
  let m;
  while ((m = re.exec(String(step)))) {
    const p = m[1].replace(/["')]+$/, '');
    if (/\.[A-Za-z0-9]{1,5}$/.test(p) && !/^https?:/.test(p)) out.push(p);
  }
  return out;
}

function unresolved(root, owns, steps) {
  const missingOwns = owns.filter((p) => {
    try {
      fs.statSync(path.join(root, String(p)));
      return false;
    } catch {
      return true;
    }
  });
  const seen = new Set();
  const missingSteps = [];
  for (const step of steps)
    for (const p of pathish(step)) {
      if (seen.has(p)) continue;
      seen.add(p);
      if (owns.some((o) => String(o).replace(/\\/g, '/') === p.replace(/\\/g, '/'))) continue;
      try {
        fs.statSync(path.join(root, p));
      } catch {
        missingSteps.push({ step: step, target: p });
      }
    }
  return { owns: missingOwns, steps: missingSteps };
}

function listCmd() {
  const where = locate();
  if (!where) return stop(['No relay root - .claude/relay does not exist.']);
  const dir = path.join(where.relay, 'contracts');
  let files = [];
  try {
    files = fs.readdirSync(dir).filter((f) => /\.md$/i.test(f));
  } catch {
    return out(['No contracts are open.']);
  }
  const want = arg('owns');
  const target = want ? String(want).replace(/\\/g, '/').replace(/^\.\//, '').toLowerCase() : '';
  const rows = [];
  for (const f of files.sort()) {
    let body = '';
    try {
      body = fs.readFileSync(path.join(dir, f), 'utf8');
    } catch {
      continue;
    }
    const id = f.replace(/\.md$/i, '');
    const owns = owned(body).map((o) => String(o).replace(/\\/g, '/'));
    if (target && !owns.some((o) => o.toLowerCase() === target || o.toLowerCase().endsWith('/' + target)))
      continue;
    const st = statusOf(body) || 'open';
    if (has('open') && st === 'done') continue;
    const held = blockers(where.relay, id, body);
    if (has('ready') && (st === 'done' || held.length)) continue;
    const title = (body.match(/^#[ \t]+(.+)$/m) || [])[1] || '';
    rows.push(
      id + '  ' + st + '  round ' + (field('round', body) || '1') +
        (title ? '  ' + title.trim() : '') +
        (target ? '' : '\n    owns: ' + (owns.join(', ') || 'nothing')) +
        (!target && held.length ? '\n    blocked by: ' + held.map((b) => b.id).join(', ') : '')
    );
  }
  if (!rows.length)
    return out(
      [
        target
          ? 'No open contract owns ' + want + '.'
          : has('ready')
            ? 'Nothing is ready - every open contract is waiting on another.'
            : 'No contracts are open.',
      ],
      target ? 1 : 0
    );
  return out(rows);
}

function check() {
  const c = load(arg('id'));
  if (c.error) return stop([c.error, '', 'Usage: contract.js check --id T7']);
  const owns = owned(c.body);
  const level = risk.resolve(c.root, owns, field('risk', c.body));
  const steps = verifySteps(c.body);
  let diffHash = '';
  try {
    diffHash = owns.length ? seal.ownsDigest(c.root, owns) : '';
  } catch (e) {
    diffHash = 'unavailable - ' + String((e && e.message) || e);
  }
  const lines = [
    c.id + ' - risk ' + level.level,
    ...(level.reasons.length ? level.reasons.map((r) => '  ' + r) : ['  no risk signal']),
    ...(level.stat
      ? [
          '  diff ' + level.stat.lines + ' lines in ' + level.stat.files + ' file(s)' +
            ' (+' + level.stat.classes.A + ' ~' + level.stat.classes.M +
            ' -' + level.stat.classes.D + ' r' + level.stat.classes.R + ')' +
            ' since ' + (level.stat.base === 'HEAD' ? 'HEAD' : level.stat.base.slice(0, 8) + ' (merge-base)'),
        ]
      : []),
    ...(level.spots && level.spots.length
      ? ['', 'changed hunks:'].concat(risk.spotLines(level.spots))
      : []),
    '',
    'verify steps: ' + (steps.length || 'none declared'),
    ...steps.map((s) => '  - ' + s),
    '',
    'headSha:  ' + (git(c.root, ['rev-parse', 'HEAD']) || 'unavailable'),
    'diffHash: ' + (diffHash || 'owns is empty'),
    '',
    level.level === 'high'
      ? 'An auditor record is required before complete.'
      : 'Verification alone completes this contract.',
  ];
  const hollowSeen = hollowVerify(steps);
  if (hollowSeen.length) {
    lines.push('');
    lines.push('nothing here can fail, so nothing here is acceptance:');
    for (const [s, why] of hollowSeen) lines.push('  ' + s + '  (' + why + ')');
  }
  const gone = unresolved(c.root, owns, steps);
  if (gone.steps.length) {
    lines.push('');
    lines.push('verify names something that is not there:');
    for (const g of gone.steps) lines.push('  ' + g.target + '  (' + g.step + ')');
    lines.push('  a step that cannot run is not acceptance - fix it before the work starts.');
  }
  if (gone.owns.length) {
    lines.push('');
    lines.push('owns names files that do not exist yet: ' + gone.owns.join(', '));
    lines.push('  that is the work, unless it is a typo.');
  }
  const held = blockers(c.relay, c.id, c.body);
  if (held.length) {
    lines.push('');
    lines.push('blocked by work that has not landed:');
    for (const b of held) lines.push('  ' + b.id + '  ' + b.status);
  }
  const clash = overlaps(c.relay, c.id, owns, c.root);
  if (clash.length) {
    lines.push('');
    lines.push('another open contract owns the same files:');
    for (const h of clash) lines.push('  ' + h.id + ' (' + h.status + ')  ' + h.shared.join(', '));
    lines.push('  the gate refuses to close either of them until this is split.');
  }
  const outside = dirtyOutside(c.root, owns);
  if (outside.length) {
    lines.push('');
    lines.push(
      'tracked files outside owns are modified: ' +
        outside.slice(0, 8).join(', ') +
        (outside.length > 8 ? ' and ' + (outside.length - 8) + ' more' : '')
    );
    lines.push('  verify would run against changes this contract never claimed.');
  }
  if (!has('run')) return out(lines);
  const results = runVerify(c.root, steps);
  return out(
    lines.concat(['', 'verification run:'], reportVerify(results)),
    results.some((r) => !r.ok) ? 2 : 0
  );
}

function audit() {
  const c = load(arg('id'));
  if (c.error)
    return stop([
      c.error,
      '',
      'Usage: contract.js audit --id T7 --run-id <agent id> --verification "<cmd> -> exit 0" [--verification "..."]',
    ]);

  const runId = arg('run-id');
  if (!runId) return stop(['--run-id is required: the auditor agent id from live/.']);

  if (has('dry-run')) {
    const why = seal.checkAuditor(c.relay, runId);
    if (why)
      return stop([
        'This agent cannot sign the audit of ' + c.id + ' - ' + why + '.',
        '',
        'Asked before the audit ran, so nothing is spent. Open the auditor role itself,',
        'or name the agent that will do the reading.',
      ]);
    return out([runId + ' can sign the audit of ' + c.id + '. Nothing written; this was a dry run.']);
  }

  const evidence = [];
  for (let i = 0; i < argv.length; i += 1)
    if (argv[i] === '--verification' && argv[i + 1]) evidence.push(argv[i + 1]);
  if (!evidence.length)
    return stop(['At least one --verification line is required; each states what you ran and got.']);

  const owns = owned(c.body);
  if (!owns.length) return stop([c.id + ' has an empty owns set.']);

  const who = seal.checkAuditor(c.relay, runId);
  if (who) return stop(['Refused - ' + who]);

  const headSha = git(c.root, ['rev-parse', 'HEAD']);
  if (!headSha) return stop(['Cannot read HEAD - not a git repository, or no commit yet.']);

  let diffHash;
  try {
    diffHash = seal.ownsDigest(c.root, owns);
  } catch (e) {
    return stop(['Refused - ' + String((e && e.message) || e)]);
  }

  const file = seal.recordPath(c.relay, c.id, field('round', c.body) || '1');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(
    file,
    JSON.stringify(
      {
        contractId: c.id,
        auditorRunId: runId,
        headSha,
        diffHash,
        owns,
        verification: evidence,
        result: 'passed',
        createdAt: new Date().toISOString(),
      },
      null,
      2
    ) + '\n',
    'utf8'
  );

  return out([
    'Audit record written: ' + path.relative(c.root, file),
    'headSha and diffHash were computed here, not supplied.',
  ]);
}

function ledger() {
  const where = locate();
  if (!where) return stop(['No relay root - .claude/relay does not exist.']);
  const stray = seal.auditDone(where.root, where.relay);
  if (!stray.length) return out(['Every contract under done/ has a ledger entry.']);
  return out(
    [
      'Contracts under done/ with no ledger entry: ' + stray.join(', '),
      '',
      'These arrived by some route other than contract.js complete.',
    ],
    3
  );
}

function help() {
  return out([
    'contract.js - the only legitimate way to close a contract',
    '',
    '  list [--open] [--ready] [--owns <path>]',
    '                            what is open, what nothing blocks, who owns a file',
    '  precheck --id <ID>        run verify before the work starts; 0 means it is already done',
    '  snapshot --id <ID>        pin the tracked tree as refs/teknesyum/<ID>',
    '  revert --id <ID> --yes    put the owned files back to that pin',
    '  check --id <ID> [--run]   report risk and verify steps; --run executes them',
    '  submit --id <ID>          mark the work finished and ready for the gate',
    '  complete --id <ID>        run verify, check risk, record, move to done/',
    '  reopen --id <ID> --reason "..." --critical "..." [--advisor <agent>] [--force]',
    '                            take a closed contract back, round + 1; capped at round 5,',
    '                            an advisor record required from round 3 on',
    '  close --id <ID> --reason "..."',
    '                            close an unmet contract without a seal',
    '  audit --id <ID> --run-id <agent> --verification "..."',
    '                            write the audit record; hashes are computed here',
    '  ledger                    compare done/ against the ledger',
    '  tier --role <role> [--profile P] [--id <ID>] [--risk high] [--round N]',
    '       [--repeat-fail N] [--model M] [--effort E] [--asker opus] [--user]',
    '                            resolve the cell, the signals and the ceiling in one place',
    ]);
}

function main() {
  const cmd = argv[0];
  if (cmd === 'complete') return complete();
  if (cmd === 'close') return close();
  if (cmd === 'check') return check();
  if (cmd === 'submit') return submit();
  if (cmd === 'precheck') return precheck();
  if (cmd === 'snapshot') return snapshotCmd();
  if (cmd === 'revert') return revert();
  if (cmd === 'list') return listCmd();
  if (cmd === 'reopen') return reopen();
  if (cmd === 'audit') return audit();
  if (cmd === 'ledger') return ledger();
  if (cmd === 'tier') return tierCmd();
  return help();
}

if (require.main === module) main();
module.exports = {
  snapRef,
  snapshotOf,
  takeSnapshot,
  dropSnapshot,
  revert,
  orphans,
  hollowStep,
  hollowVerify,
  listCmd,
  unresolved,
  precheck,
  complete,
  close,
  check,
  audit,
  submit,
  reopen,
  ledger,
  runVerify,
  unsafeStep,
  tier,
  tiers,
  roleBase,
  roleRow,
  advisorQuota,
  MODEL_RANK,
  EFFORT_RANK,
  PROFILE_CEILING,
};
