#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { relayRoot, projectRoot } = require('../hooks/lib.js');
const { isContractName, field, list, verifySteps } = require('../hooks/schema.js');
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

function complete() {
  const c = load(arg('id'));
  if (c.error) return stop([c.error, '', 'Usage: contract.js complete --id T7']);

  const owns = list('owns', c.body);
  if (!owns.length) return stop([c.id + ' has an empty owns set - cannot complete.']);

  const ownsFault = seal.ownsFault(c.root, owns);
  if (ownsFault)
    return stop([
      c.id + ' cannot complete - ' + ownsFault,
      '',
      'A directory digest does not change when its contents do; the seal would lie.',
      'List the files the contract touches, one by one.',
    ]);

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
  fs.renameSync(c.src, c.dst);
  if (recordFile) seal.consume(recordFile, headSha);
  seal.ledgerInit(c.relay);
  seal.ledgerAppend(c.relay, {
    id: c.id,
    round,
    risk: level.level,
    verify: results.map((r) => r.step),
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
  fs.writeFileSync(
    c.src,
    c.body.replace(/\s*$/, '') +
      '\n\n## Closed - unmet (' +
      at.slice(0, 10) +
      ')\n\n' +
      reason.trim() +
      '\n\nNot sealed. Acceptance was not met; the work stays in the tree.\n',
    'utf8'
  );
  fs.mkdirSync(path.dirname(c.dst), { recursive: true });
  fs.renameSync(c.src, c.dst);
  seal.ledgerInit(c.relay);
  seal.ledgerAppend(c.relay, { id: c.id, result: 'unmet', reason: reason.trim(), headSha, at });

  return out([c.id + ' closed as unmet -> contracts/done/' + c.id + '.md']);
}

function check() {
  const c = load(arg('id'));
  if (c.error) return stop([c.error, '', 'Usage: contract.js check --id T7']);
  const owns = list('owns', c.body);
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

  const owns = list('owns', c.body);
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
    '  check --id <ID> [--run]   report risk and verify steps; --run executes them',
    '  complete --id <ID>        run verify, check risk, seal, move to done/',
    '  close --id <ID> --reason "..."',
    '                            close an unmet contract without a seal',
    '  audit --id <ID> --run-id <agent> --verification "..."',
    '                            write the audit record; hashes are computed here',
    '  ledger                    compare done/ against the ledger',
  ]);
}

function main() {
  const cmd = argv[0];
  if (cmd === 'complete') return complete();
  if (cmd === 'close') return close();
  if (cmd === 'check') return check();
  if (cmd === 'audit') return audit();
  if (cmd === 'ledger') return ledger();
  return help();
}

if (require.main === module) main();
module.exports = { complete, close, check, audit, ledger, runVerify, unsafeStep };
