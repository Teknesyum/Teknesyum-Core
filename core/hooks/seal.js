const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const { read, safe } = require('./lib.js');

const RECORD_FIELDS = [
  'contractId',
  'auditorRunId',
  'headSha',
  'diffHash',
  'owns',
  'verification',
  'result',
  'createdAt',
];

const PASSED = /^passed$/i;

function auditDir(relay) {
  return path.join(relay, 'audits');
}

function digest(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function ownsFault(root, owns) {
  for (const p of owns) {
    const raw = String(p);
    if (/[\\/]$/.test(raw)) return 'owns contains a directory path: ' + p;
    if (path.isAbsolute(raw) || /^[A-Za-z]:/.test(raw))
      return 'owns contains an absolute path: ' + p;
    const rel = path.relative(root, path.resolve(root, raw));
    if (!rel || rel.startsWith('..') || path.isAbsolute(rel))
      return 'owns reaches outside the project: ' + p;
    let st;
    try {
      st = fs.statSync(path.join(root, p));
    } catch {
      continue;
    }
    if (st.isDirectory()) return 'owns contains a directory path: ' + p;
  }
  return '';
}

function ownsMissing(root, owns) {
  const gone = [];
  for (const p of owns) {
    try {
      fs.statSync(path.join(root, String(p)));
    } catch {
      gone.push(String(p));
    }
  }
  return gone;
}

function ownsDigest(root, owns) {
  const fault = ownsFault(root, owns);
  if (fault) throw new Error(fault);
  return digest(
    owns
      .slice()
      .sort()
      .map((p) => {
        let body;
        try {
          body = fs.readFileSync(path.join(root, p));
        } catch {
          body = Buffer.alloc(0);
        }
        return String(p).replace(/\\/g, '/') + ' ' + digest(body);
      })
      .join('\n')
  );
}

function recordPath(relay, id, round) {
  return path.join(auditDir(relay), String(id) + '-' + String(round) + '.json');
}

function set(items) {
  return items
    .map((x) => String(x).replace(/\\/g, '/').trim())
    .filter(Boolean)
    .sort()
    .join('|');
}

function checkRecord(rec, expected) {
  if (!rec || typeof rec !== 'object') return 'audit record unreadable';
  for (const f of RECORD_FIELDS) if (rec[f] === undefined) return 'audit record missing field: ' + f;
  if (rec.usedAt) return 'audit record already consumed: ' + rec.usedAt;
  if (String(rec.contractId) !== String(expected.id))
    return 'record belongs to another contract: ' + rec.contractId;
  if (!PASSED.test(String(rec.result))) return 'audit did not pass: ' + rec.result;
  if (String(rec.headSha) !== String(expected.headSha))
    return 'record written for another HEAD: ' + String(rec.headSha).slice(0, 8);
  if (!Array.isArray(rec.owns) || !rec.owns.length) return 'record owns set is empty';
  if (set(rec.owns) !== set(expected.owns)) return 'record owns set differs from the contract';
  if (!Array.isArray(rec.verification) || !rec.verification.length)
    return 'record carries no verification evidence';
  if (String(rec.diffHash) !== String(expected.diffHash))
    return 'owned files changed after the audit';
  return null;
}

function checkAuditor(relay, runId) {
  const rec = read(path.join(relay, 'live', safe(String(runId)) + '.json'));
  if (!rec)
    return (
      'no live record for run-id: ' +
      runId +
      ' - the auditor must be an agent that actually ran, not a name'
    );
  const role = String(rec.role || rec.agent_type || '?').replace(/^teknesyum(-core)?:/, '');
  if (role !== 'auditor') return 'auditorRunId points at a non-auditor agent record: ' + role;
  const written = Array.isArray(rec.files) ? rec.files : [];
  if (written.length) return 'the auditor wrote files during the audit: ' + written.join(', ');
  return null;
}

function consume(file, sha) {
  const rec = read(file);
  if (!rec) return false;
  rec.usedAt = new Date().toISOString();
  rec.completedSha = sha;
  fs.writeFileSync(file.replace(/\.json$/i, '.used.json'), JSON.stringify(rec, null, 2), 'utf8');
  try {
    fs.unlinkSync(file);
  } catch {}
  return true;
}

function ledgerPath(relay) {
  return path.join(auditDir(relay), 'ledger.jsonl');
}

function ledgerRead(relay) {
  let raw = '';
  try {
    raw = fs.readFileSync(ledgerPath(relay), 'utf8');
  } catch {
    return null;
  }
  const out = [];
  for (const line of raw.split('\n')) {
    if (!line.trim()) continue;
    try {
      out.push(JSON.parse(line));
    } catch {}
  }
  return out;
}

function ledgerAppend(relay, entry) {
  fs.mkdirSync(auditDir(relay), { recursive: true });
  fs.appendFileSync(ledgerPath(relay), JSON.stringify(entry) + '\n', 'utf8');
}

function ledgerInit(relay) {
  const existing = ledgerRead(relay);
  if (existing) return existing;
  let files = [];
  try {
    files = fs.readdirSync(path.join(relay, 'contracts', 'done')).filter((f) => /\.md$/i.test(f));
  } catch {}
  const at = new Date().toISOString();
  for (const f of files)
    ledgerAppend(relay, { id: f.replace(/\.md$/i, ''), source: 'adopted', at });
  if (!files.length) ledgerAppend(relay, { source: 'ledger-opened', at });
  return ledgerRead(relay) || [];
}

function gitMoved(root, relay) {
  const r = spawnSync('git', ['-C', root, 'diff', '--name-status', 'HEAD', '--', relay], {
    encoding: 'utf8',
    timeout: 20000,
    windowsHide: true,
    maxBuffer: 8 * 1024 * 1024,
  });
  if (r.error || r.status !== 0) return null;
  const out = [];
  for (const line of String(r.stdout || '').split('\n')) {
    const p = String(line.split('\t').pop()).replace(/\\/g, '/');
    const m = /contracts\/done\/([A-Za-z]{1,4}\d{1,4})\.md$/i.exec(p);
    if (m && !/^D/.test(line)) out.push(m[1]);
  }
  return out;
}

function auditDone(root, relay) {
  const known = new Set(
    ledgerInit(relay)
      .filter((x) => x && (x.source === 'adopted' || (x.result === 'unmet' && x.headSha && x.reason) || (!x.result && x.headSha && Array.isArray(x.verify))))
      .map((x) => x && x.id)
      .filter(Boolean)
  );
  let onDisk = [];
  try {
    onDisk = fs
      .readdirSync(path.join(relay, 'contracts', 'done'))
      .filter((f) => /\.md$/i.test(f))
      .map((f) => f.replace(/\.md$/i, ''));
  } catch {
    return [];
  }
  const fromGit = gitMoved(root, relay);
  const all = fromGit === null ? onDisk : Array.from(new Set(onDisk.concat(fromGit)));
  return all.filter((id) => !known.has(id));
}

module.exports = {
  RECORD_FIELDS,
  auditDir,
  digest,
  ownsFault,
  ownsMissing,
  ownsDigest,
  recordPath,
  checkRecord,
  checkAuditor,
  consume,
  ledgerPath,
  ledgerRead,
  ledgerAppend,
  ledgerInit,
  auditDone,
};
