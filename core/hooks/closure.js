const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const seal = require('./seal.js');
const { read, write, pathKey } = require('./lib.js');
const { isContractName } = require('./schema.js');

function journalPath(relay, id) {
  if (!isContractName(id + '.md')) throw new Error('Malformed closure id');
  return path.join(relay, 'audits', 'closures', id + '.json');
}
function readJournal(relay, id) {
  const file = journalPath(relay, id);
  if (!fs.existsSync(file)) return null;
  const value = read(file);
  if (!value || value.version !== 1 || value.id !== id) throw new Error('Unreadable closure journal: ' + id);
  return value;
}
function save(relay, tx) {
  if (!write(journalPath(relay, tx.id), tx)) throw new Error('Cannot persist closure journal');
}
function atomicText(file, text) {
  const tmp = file + '.' + process.pid + '.tmp';
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(tmp, text, 'utf8');
  fs.renameSync(tmp, file);
}
function head(root) {
  const r = spawnSync('git', ['-C', root, 'rev-parse', 'HEAD'], { encoding: 'utf8', windowsHide: true, timeout: 10000 });
  if (r.error || r.status !== 0) throw new Error('Cannot read closure HEAD');
  return r.stdout.trim();
}
function validate(root, tx, src, dst) {
  if (pathKey(root) !== pathKey(tx.root)) throw new Error('Closure belongs to another checkout');
  if (head(root) !== tx.entry.headSha || seal.ownsDigest(root, tx.owns) !== tx.diffHash)
    throw new Error('Closure inputs changed; pending transaction was not published');
  if (tx.entry.result === 'passed') {
    const outside = seal.outsideChanges(root, tx.owns);
    if (outside.length) throw new Error('Closure found changes outside owns: ' + outside.join(', '));
    const index = spawnSync('git', ['-C', root, 'ls-files', '--stage', '-z'], { encoding: 'utf8', windowsHide: true, timeout: 10000 });
    if (index.status !== 0 || (tx.entry.indexHash && seal.digest(index.stdout.trim()) !== tx.entry.indexHash))
      throw new Error('Verification index changed during closure');
  }
  for (const file of [src, dst]) {
    if (!fs.existsSync(file)) continue;
    const body = fs.readFileSync(file, 'utf8');
    if (file === dst ? body !== tx.doneBody : body !== tx.originalBody && body !== tx.doneBody)
      throw new Error('Contract changed during closure; refusing to overwrite it');
  }
  if (!fs.existsSync(src) && !fs.existsSync(dst)) throw new Error('Closure contract is missing');
}
function resume(context, tx) {
  const { relay, root } = context;
  if (pathKey(root) !== pathKey(tx.root)) throw new Error('Closure belongs to another checkout');
  const src = path.join(relay, 'contracts', tx.id + '.md');
  const dst = path.join(relay, 'contracts', 'done', tx.id + '.md');
  if (tx.state === 'committed') {
    if (!fs.existsSync(dst) || fs.readFileSync(dst, 'utf8') !== tx.doneBody)
      throw new Error('Committed closure no longer matches its contract');
    return tx;
  }
  validate(root, tx, src, dst);
  if (tx.audit) {
    const file = seal.recordPath(relay, tx.id, tx.entry.round);
    const used = file.replace(/\.json$/i, '.used.json');
    if (fs.existsSync(file)) {
      const record = read(file);
      if (seal.digest(JSON.stringify(record)) !== tx.audit.hash) throw new Error('Audit changed during closure');
      if (!seal.consume(file, tx.entry.headSha)) throw new Error('Audit consumption failed');
    } else {
      const record = read(used);
      if (!record) throw new Error('Consumed audit is missing');
      const { usedAt, completedSha, ...original } = record;
      if (!usedAt || completedSha !== tx.entry.headSha || seal.digest(JSON.stringify(original)) !== tx.audit.hash)
        throw new Error('Consumed audit conflicts with closure');
    }
  }
  seal.ledgerAppend(relay, tx.entry);
  validate(root, tx, src, dst);
  if (!fs.existsSync(dst)) {
    atomicText(src, tx.doneBody);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.renameSync(src, dst);
  } else if (fs.existsSync(src)) {
    throw new Error('Both active and closed contracts exist; manual reconciliation required');
  }
  tx.state = 'committed';
  save(relay, tx);
  return tx;
}
function commit(context, doneBody, entry, record) {
  const prior = readJournal(context.relay, context.id);
  if (prior && prior.state !== 'committed') return resume(context, prior);
  const transactionId = require('crypto').randomUUID();
  const tx = {
    version: 1, id: context.id, root: context.root, state: 'prepared',
    owns: require('./schema.js').owned(context.body),
    diffHash: entry.diffHash || seal.ownsDigest(context.root, require('./schema.js').owned(context.body)),
    originalBody: context.body, doneBody,
    entry: { ...entry, transactionId },
    audit: record ? { hash: seal.digest(JSON.stringify(record)) } : null,
  };
  save(context.relay, tx);
  return resume(context, tx);
}
function committed(relay, entry) {
  if (!entry.transactionId) return true; // Legacy ledger entries remain readable.
  const tx = readJournal(relay, entry.id);
  return !!tx && tx.state === 'committed' && tx.entry.transactionId === entry.transactionId;
}
module.exports = { journalPath, readJournal, commit, resume, committed };
