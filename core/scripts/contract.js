#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { relayRoot, projectRoot, settings, liveDir, read, setNotice, t } = require('../hooks/lib.js');
const { isContractName, field, list, owned, verifySteps } = require('../hooks/schema.js');
const seal = require('../hooks/seal.js');
const risk = require('./risk.js');

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

const VERIFY_TIMEOUT = 15 * 60 * 1000;

const FORBIDDEN_IN_VERIFY = [
  { re: /contracts[\\/]d?one/i, why: 'touches contracts/done/' },
  { re: /contract\.js/i, why: 'calls contract.js' },
  { re: /relay[\\/](audits|live)/i, why: 'touches audits/ or live/' },
];

function unsafeStep(step) {
  for (const f of FORBIDDEN_IN_VERIFY) if (f.re.test(step)) return f.why;
  return '';
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
      maxBuffer: 16 * 1024 * 1024,
    });
    const code = r.error ? -1 : r.status;
    const text = String((r.stdout || '') + (r.stderr || ''));
    results.push({
      step,
      code,
      ok: code === 0,
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

  const steps = verifySteps(c.body);
  if (!steps.length && !/^verify:[ \t]*\[[ \t]*\]/im.test(c.body))
    return stop([
      c.id + ' has no verify steps.',
      'Add a `verify:` block, or `verify: []` with a written reason under ## Acceptance.',
    ]);

  const unsafe = steps.map((s) => [s, unsafeStep(s)]).filter(([, why]) => why);
  if (unsafe.length)
    return stop(
      [c.id + ' cannot complete - a verify step reaches into the gate.', ''].concat(
        unsafe.map(([s, why]) => '  ' + s + '  (' + why + ')')
      )
    );

  const results = runVerify(c.root, steps);
  const failed = results.filter((r) => !r.ok);
  if (failed.length)
    return stop([c.id + ' cannot complete - verification failed.', ''].concat(reportVerify(results)));

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

  return out(
    [c.id + ' complete -> contracts/done/' + c.id + '.md', ''].concat(
      reportVerify(results),
      [
        '',
        'risk ' + level.level + (level.reasons.length ? ' (' + level.reasons.join('; ') + ')' : ''),
        'ledger written at HEAD ' + headSha.slice(0, 8) + (record ? ', audit record consumed' : ''),
      ]
    )
  );
}

const LADDER = ['open', 'active', 'submitted', 'done'];

function precheck() {
  const c = load(arg('id'));
  if (c.error) return stop([c.error]);
  const steps = verifySteps(c.body);
  if (!steps.length)
    return out([
      c.id + ' carries no verify steps, so there is nothing to check before the work starts.',
      'Add a ## verify section, or run the contract as it is.',
    ], 1);
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

function submit() {
  const c = load(arg('id'));
  if (c.error) return stop([c.error, '', 'Usage: contract.js submit --id T7']);
  const now = statusOf(c.body);
  if (now === 'submitted') return out([c.id + ' is already submitted.']);
  if (now && !['open', 'active'].includes(now))
    return stop([c.id + ' cannot be submitted from status ' + now + '.']);
  fs.writeFileSync(c.src, stampStatus(c.body, 'submitted'), 'utf8');
  return out([
    c.id + ' submitted.',
    'Next: contract.js complete --id ' + c.id + ' runs the verify steps and decides.',
  ]);
}

function reopen() {
  const id = arg('id');
  const reason = arg('reason');
  if (!id || !isContractName(id + '.md'))
    return stop(['Missing or malformed contract id.', '', 'Usage: contract.js reopen --id T7 --reason "..."']);
  if (!reason || reason.trim().length < 10)
    return stop(['--reason is required: one line saying why the close was wrong.']);
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
    at: new Date().toISOString(),
  });
  return out([
    id + ' reopened -> contracts/' + id + '.md',
    'round ' + round + ', status active, the ledger keeps the closed round.',
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
    const title = (body.match(/^#[ \t]+(.+)$/m) || [])[1] || '';
    rows.push(
      id + '  ' + st + '  round ' + (field('round', body) || '1') +
        (title ? '  ' + title.trim() : '') +
        (target ? '' : '\n    owns: ' + (owns.join(', ') || 'nothing'))
    );
  }
  if (!rows.length)
    return out([target ? 'No open contract owns ' + want + '.' : 'No contracts are open.'], target ? 1 : 0);
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
    '  list [--open] [--owns <path>]',
    '                            what is open, and which contract owns a file',
    '  precheck --id <ID>        run verify before the work starts; 0 means it is already done',
    '  check --id <ID> [--run]   report risk and verify steps; --run executes them',
    '  submit --id <ID>          mark the work finished and ready for the gate',
    '  complete --id <ID>        run verify, check risk, record, move to done/',
    '  reopen --id <ID> --reason "..." [--force]',
    '                            take a closed contract back, round + 1; capped at round 6',
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
  if (cmd === 'list') return listCmd();
  if (cmd === 'reopen') return reopen();
  if (cmd === 'audit') return audit();
  if (cmd === 'ledger') return ledger();
  if (cmd === 'tier') return tierCmd();
  return help();
}

if (require.main === module) main();
module.exports = {
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
