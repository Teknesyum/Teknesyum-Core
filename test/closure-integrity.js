const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert/strict');
const { spawnSync } = require('child_process');
const { run, issueAudit, observeAuditor, core } = require('./host-fixture');
const schema = require('../core/hooks/schema');
const seal = require('../core/hooks/seal');
const closure = require('../core/hooks/closure');
let passed = 0, failed = 0;
const results = [];
function test(name, fn) {
  try { fn(); passed++; results.push({ name, passed: true }); console.log('PASS ' + name); }
  catch (e) { failed++; results.push({ name, passed: false, error: e.message }); console.error('FAIL ' + name + ': ' + e.stack); }
}
function git(root, ...args) {
  const r = spawnSync('git', args, { cwd: root, encoding: 'utf8', windowsHide: true, timeout: 15000 });
  assert.equal(r.status, 0, r.stderr); return r.stdout.trim();
}
function put(root, file, value) {
  const p = path.join(root, file);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, typeof value === 'string' ? value : JSON.stringify(value));
  return p;
}
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-closure-test-'));
  put(root, '.gitignore', '.claude/\n');
  put(root, 'src/value.js', 'module.exports=1;\n');
  fs.mkdirSync(path.join(root, '.claude/relay/contracts'), { recursive: true });
  git(root, 'init', '-q', '-b', 'main'); git(root, 'config', 'user.email', 'test@example.invalid');
  git(root, 'config', 'user.name', 'Closure fixture'); git(root, 'add', '.'); git(root, 'commit', '-qm', 'fixture');
  return root;
}
const ordinary = 'node -e "if(require(\'./src/value.js\')!==1) process.exit(4)"';
function body(id, extra = '', step = ordinary) {
  return '# ' + id + '\nstatus: submitted\nround: 1\nowns: [src/value.js]\nverify:\n  - ' + step + '\n' + extra;
}
function contract(root, id, extra, step) { return put(root, '.claude/relay/contracts/' + id + '.md', body(id, extra, step)); }
function complete(root, id) { return run(root, 'scripts/contract.js', ['complete', '--id', id]); }
function guard(root, payload) { return run(root, 'hooks/guard.js', [], { hook_event_name: 'PreToolUse', ...payload }); }
function relay(root) { return require('../core/hooks/lib').relayRoot(root).relay; }

test('schema ignores fenced and section-scoped metadata', () => {
  assert.equal(schema.field('status', '# X\nstatus: active\n\n\u0060\u0060\u0060\nstatus: done\n\u0060\u0060\u0060\n## Notes\nstatus: done'), 'active');
  assert.equal(schema.field('status', '# X\n\u0060\u0060\u0060\nstatus: done\n\u0060\u0060\u0060'), '');
});
test('schema rejects duplicates and invalid rounds', () => {
  assert.match(schema.fault('status: active\nstatus: done\n'), /duplicate/);
  for (const r of ['0', '-1', '1.5', 'NaN']) assert.match(schema.fault('round: ' + r), /positive integer/);
});
test('explicit empty list does not fall back to a prose section', () => {
  assert.deepEqual(schema.verifySteps('verify: []\n## Verify\n- dangerous command'), []);
});
test('quoted commas and brackets preserve one executable step', () => {
  assert.deepEqual(schema.verifySteps('verify: [node -e "console.log([1,2])", npm test]'), ['node -e "console.log([1,2])"', 'npm test']);
});
test('normal closure succeeds and retry does not duplicate its ledger', () => {
  const root = fixture(); contract(root, 'A1');
  const r = complete(root, 'A1'); assert.equal(r.status, 0, r.stdout + r.stderr);
  const tx = closure.readJournal(relay(root), 'A1'); assert.equal(tx.state, 'committed');
  assert.equal(complete(root, 'A1').status, 0);
  assert.equal(seal.ledgerRead(relay(root)).filter((x) => x.id === 'A1').length, 1);
});
test('linked worktree tests its own code and preserves a valid path', () => {
  const root = fixture(), wt = path.join(path.dirname(root), path.basename(root) + '-wt');
  git(root, 'worktree', 'add', '-qb', 'fixture-worktree', wt); contract(root, 'W1');
  put(wt, 'src/value.js', 'module.exports=999;\n');
  const bad = complete(wt, 'W1'); assert.equal(bad.status, 2); assert.match(bad.stdout, /verification failed/);
  put(wt, 'src/value.js', 'module.exports=1;\n');
  const good = complete(wt, 'W1'); assert.equal(good.status, 0, good.stdout);
  assert.equal(seal.ledgerRead(relay(root)).at(-1).checkoutRoot, wt);
});
test('completed host-bound auditor permits a valid high-risk seal', () => {
  const root = fixture(); contract(root, 'A1', 'risk: high\n');
  const rec = issueAudit(root, 'A1', 'auditor-one'); assert.equal(rec.schemaVersion, 2);
  const r = complete(root, 'A1'); assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(fs.existsSync(seal.recordPath(relay(root), 'A1', 1).replace('.json', '.used.json')));
});
test('legacy missing round binds consistently to round one', () => {
  const root = fixture();
  put(root, '.claude/relay/contracts/A1.md', body('A1', 'risk: high\n').replace('round: 1\n', ''));
  const rec = issueAudit(root, 'A1', 'legacy-auditor'); assert.equal(String(rec.round), '1');
  const r = complete(root, 'A1'); assert.equal(r.status, 0, r.stdout + r.stderr);
});
test('audit cannot run before its child finishes or use another contract', () => {
  const root = fixture(); contract(root, 'A1', 'risk: high\n');
  const rec = observeAuditor(root, 'A1', 'auditor-one'), file = path.join(relay(root), 'live/auditor-one.json');
  delete rec.ended; put(root, path.relative(root, file), rec);
  let r = run(root, 'scripts/contract.js', ['audit', '--id', 'A1', '--run-id', 'auditor-one', '--verification', 'check']);
  assert.equal(r.status, 2); assert.match(r.stdout, /finish/);
  rec.ended = new Date().toISOString(); rec.contract = 'Z9'; put(root, path.relative(root, file), rec);
  r = run(root, 'scripts/contract.js', ['audit', '--id', 'A1', '--run-id', 'auditor-one', '--verification', 'check']);
  assert.equal(r.status, 2); assert.match(r.stdout, /another contract/);
});
test('failed auditor verdict cannot be replaced by a passing CLI claim', () => {
  const root = fixture(); contract(root, 'A1', 'risk: high\n');
  observeAuditor(root, 'A1', 'auditor-one', { reply: 'verdict: failed\nfindings: implementation broken' });
  const r = run(root, 'scripts/contract.js', ['audit', '--id', 'A1', '--run-id', 'auditor-one', '--verification', 'everything passed']);
  assert.equal(r.status, 2); assert.match(r.stdout, /completed auditor reply/);
});
test('ambiguous verdicts and fenced passing examples cannot issue an audit', () => {
  for (const reply of ['verdict: failed\nverdict: passed\nfindings: none',
    '\u0060\u0060\u0060\nverdict: passed\nfindings: none\n\u0060\u0060\u0060']) {
    const root = fixture(); contract(root, 'A1', 'risk: high\n');
    observeAuditor(root, 'A1', 'auditor-one', { reply });
    const r = run(root, 'scripts/contract.js', ['audit', '--id', 'A1', '--run-id', 'auditor-one', '--verification', 'claim']);
    assert.equal(r.status, 2, r.stdout);
  }
});
test('missing auditor correlation is rejected before dispatch', () => {
  const root = fixture(); contract(root, 'A1');
  const r = run(root, 'hooks/watch.js', [], { hook_event_name: 'PreToolUse', tool_name: 'Agent',
    tool_input: { model: 'opus', prompt: 'Read roles/auditor.md and contracts/A1.md' } });
  assert.equal(r.status, 2); assert.match(r.stderr, /tool_use_id before launch/);
});
test('source mutation during verify is rejected after a valid audit', () => {
  const root = fixture();
  contract(root, 'A1', 'risk: high\n', 'node -e "require(\'fs\').writeFileSync(\'src/value.js\',\'module.exports=999;\')"');
  issueAudit(root, 'A1', 'auditor-one');
  const r = complete(root, 'A1'); assert.equal(r.status, 2); assert.match(r.stdout, /inputs changed/);
  assert.ok(!fs.existsSync(path.join(relay(root), 'contracts/done/A1.md')));
});
test('HEAD mutation during verify is rejected after a valid audit', () => {
  const root = fixture();
  contract(root, 'A1', 'risk: high\n', 'git commit --allow-empty -qm verification-must-not-commit');
  issueAudit(root, 'A1', 'auditor-one');
  const r = complete(root, 'A1'); assert.equal(r.status, 2); assert.match(r.stdout, /inputs changed/);
});
test('contract mutation during verify cannot overwrite a concurrent edit', () => {
  const root = fixture();
  const step = 'node -e "require(\'fs\').appendFileSync(\'.claude/relay/contracts/A1.md\',\'\\n## Checkpoint\\nConcurrent edit\\n\')"';
  const file = contract(root, 'A1', 'risk: high\n', step); issueAudit(root, 'A1', 'auditor-one');
  const r = complete(root, 'A1'); assert.equal(r.status, 2); assert.match(r.stdout, /inputs changed/);
  assert.match(fs.readFileSync(file, 'utf8'), /Concurrent edit/);
});
test('audit binding rejects wrong round, checkout, dispatch and builder identity', () => {
  const root = fixture(); contract(root, 'A1', 'risk: high\n');
  const record = issueAudit(root, 'A1', 'auditor-one');
  const expected = { id: 'A1', round: 1, root, headSha: record.headSha, diffHash: record.diffHash,
    contractHash: record.contractHash, dispatchId: record.dispatchId, transcriptHash: record.transcriptHash };
  assert.equal(seal.checkAuditor(relay(root), 'auditor-one', expected), null);
  for (const patch of [{ round: 2 }, { root: path.dirname(root) }, { dispatchId: 'another-dispatch' }, { builder: 'auditor-one' }])
    assert.ok(seal.checkAuditor(relay(root), 'auditor-one', { ...expected, ...patch }));
});
test('index mutation during verify is rejected', () => {
  const root = fixture(); contract(root, 'I1', '', 'git update-index --chmod=+x src/value.js');
  const r = complete(root, 'I1'); assert.equal(r.status, 2); assert.match(r.stdout, /inputs changed/);
});
test('untracked and documentation changes outside owns block sealing', () => {
  for (const name of ['src/untracked.js', 'notes.md']) {
    const root = fixture(); contract(root, 'A1'); put(root, name, 'unexpected input');
    const r = complete(root, 'A1'); assert.equal(r.status, 2); assert.match(r.stdout, /outside owns/);
  }
});
test('empty verification requires explicit manual review, not prose lint', () => {
  const root = fixture(); put(root, '.claude/relay/contracts/E1.md', '# E1\nstatus: submitted\nowns: [src/value.js]\nverify: []\n');
  const r = complete(root, 'E1'); assert.equal(r.status, 2); assert.match(r.stdout, /no executable acceptance/);
});
test('manual exception requires an independent audit and records its reason', () => {
  const root = fixture();
  put(root, '.claude/relay/contracts/E1.md', '# E1\nstatus: submitted\nround: 1\nowns: [src/value.js]\nverify: []\nverification-mode: manual\nmanual-reason: This fixture deliberately requires independent manual inspection of the source.\n## Acceptance\nA reviewer must inspect the literal exported value and confirm it is exactly one.\n');
  assert.equal(complete(root, 'E1').status, 2);
  issueAudit(root, 'E1', 'manual-auditor');
  const r = complete(root, 'E1'); assert.equal(r.status, 0, r.stdout);
  const entry = seal.ledgerRead(relay(root)).at(-1);
  assert.equal(entry.verificationMode, 'manual'); assert.match(entry.manualReason, /independent manual inspection/);
});
test('unmet prerequisite blocks its dependent; a passed prerequisite permits it', () => {
  const root = fixture(); contract(root, 'D1');
  let r = run(root, 'scripts/contract.js', ['close', '--id', 'D1', '--reason', 'This prerequisite was deliberately not implemented and its acceptance was not met.']);
  assert.equal(r.status, 0, r.stdout); contract(root, 'D2', 'depends: [D1]\n');
  r = complete(root, 'D2'); assert.equal(r.status, 2); assert.match(r.stdout, /unmet/);
  const other = fixture(); contract(other, 'P1'); assert.equal(complete(other, 'P1').status, 0);
  contract(other, 'P2', 'depends: [P1]\n'); r = complete(other, 'P2'); assert.equal(r.status, 0, r.stdout);
});
test('outside repository and junction writes are denied for bound agents', () => {
  const root = fixture(); contract(root, 'B1');
  put(root, '.claude/relay/live/b.json', { id: 'b', role: 'builder', contract: 'B1', files: [] });
  const outside = path.join(path.dirname(root), path.basename(root) + '-external');
  fs.mkdirSync(outside);
  let r = guard(root, { agent_id: 'b', tool_name: 'Write', tool_input: { file_path: path.join(outside, 'x.js'), content: 'x' } });
  assert.equal(r.status, 2); assert.match(r.stderr, /outside the owns/);
  fs.symlinkSync(outside, path.join(root, 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
  assert.match(seal.ownsFault(root, ['linked/x.js']), /outside/);
});
test('full Edit validation prevents field erasure and blocked-to-done', () => {
  const root = fixture(), file = contract(root, 'B1');
  for (const [old_string, new_string] of [['status: submitted', ''], ['owns: [src/value.js]', ''], ['status: submitted', 'status: done']]) {
    const r = guard(root, { tool_name: 'Edit', tool_input: { file_path: file, old_string, new_string } });
    assert.equal(r.status, 2, r.stderr);
  }
  put(root, '.claude/relay/contracts/B1.md', body('B1').replace('submitted', 'blocked'));
  const r = guard(root, { tool_name: 'Edit', tool_input: { file_path: file, old_string: 'status: blocked', new_string: 'status: done' } });
  assert.equal(r.status, 2);
});
test('failed writes do not bind agents; successful writes do', () => {
  const root = fixture(), file = contract(root, 'B1');
  const payload = { agent_id: 'b', tool_name: 'Edit', tool_input: { file_path: file, old_string: 'status: submitted', new_string: 'status: submitted' } };
  assert.equal(guard(root, payload).status, 0);
  assert.ok(!fs.existsSync(path.join(relay(root), 'live/b.json')));
  run(root, 'hooks/watch.js', [], { ...payload, hook_event_name: 'PostToolUseFailure' });
  assert.ok(!JSON.parse(fs.readFileSync(path.join(relay(root), 'live/b.json'))).contract);
  run(root, 'hooks/watch.js', [], { ...payload, hook_event_name: 'PostToolUse' });
  assert.equal(JSON.parse(fs.readFileSync(path.join(relay(root), 'live/b.json'))).contract, 'B1');
  const allowed = guard(root, { agent_id: 'b', tool_name: 'Write', tool_input: { file_path: path.join(root, 'src/value.js'), content: 'module.exports=1;' } });
  assert.equal(allowed.status, 0, allowed.stderr);
});
test('bound workers cannot change contracts or ownership metadata', () => {
  const root = fixture(), first = contract(root, 'B1'), second = contract(root, 'B2');
  put(root, '.claude/relay/live/b.json', { id: 'b', role: 'builder', contract: 'B1', files: [] });
  const wrongContract = guard(root, { agent_id: 'b', tool_name: 'Edit', tool_input: {
    file_path: second, old_string: 'status: submitted', new_string: 'status: submitted' } });
  assert.equal(wrongContract.status, 2, wrongContract.stderr);
  const wider = guard(root, { agent_id: 'b', tool_name: 'Edit', tool_input: {
    file_path: first, old_string: 'owns: [src/value.js]', new_string: 'owns: [src/value.js, new.js]' } });
  assert.equal(wider.status, 2, wider.stderr);
});
test('a nested independent repository does not borrow its parent relay', () => {
  const root = fixture(), nested = path.join(root, 'nested'); fs.mkdirSync(nested);
  git(nested, 'init', '-q');
  assert.equal(require('../core/hooks/lib').relayRoot(nested), null);
});
test('a stale timestamp does not steal a lock from a living process', () => {
  const root = fixture(), f = path.join(relay(root), 'live/lock-test.json');
  const owner = put(root, path.relative(root, f + '.lock/owner.json'), { pid: process.pid });
  fs.utimesSync(path.dirname(owner), new Date(0), new Date(0));
  let entered = false;
  assert.throws(() => require('../core/hooks/lib').lock(f, () => { entered = true; }), /Lock timeout/);
  assert.equal(entered, false); assert.ok(fs.existsSync(owner));
});

for (const phase of ['used-write', 'original-unlink']) test('audit consumption retries after ' + phase + ' failure', () => {
  const root = fixture(), src = contract(root, 'A1', 'risk: high\n'), r = relay(root);
  const record = issueAudit(root, 'A1', 'retry-auditor'), b = fs.readFileSync(src, 'utf8');
  const c = { root, relay: r, id: 'A1', body: b };
  const entry = { id: 'A1', round: 1, result: 'passed', headSha: git(root, 'rev-parse', 'HEAD'),
    diffHash: seal.ownsDigest(root, ['src/value.js']), verify: [] };
  const originalRename = fs.renameSync, originalUnlink = fs.unlinkSync;
  let injected = false;
  if (phase === 'used-write') fs.renameSync = (a, b) => {
    if (String(b).endsWith('A1-1.used.json')) { injected = true; throw new Error('injected'); }
    return originalRename(a, b);
  };
  else fs.unlinkSync = (f) => {
    if (String(f).endsWith('A1-1.json')) { injected = true; throw new Error('injected'); }
    return originalUnlink(f);
  };
  try { assert.throws(() => closure.commit(c, schema.replaceField(b, 'status', 'done'), entry, record), /consumption failed/); }
  finally { fs.renameSync = originalRename; fs.unlinkSync = originalUnlink; }
  assert.ok(injected); assert.ok(!fs.existsSync(path.join(r, 'contracts/done/A1.md')));
  closure.resume(c, closure.readJournal(r, 'A1'));
  assert.equal(closure.readJournal(r, 'A1').state, 'committed');
  assert.ok(!fs.existsSync(seal.recordPath(r, 'A1', 1)));
  assert.equal(seal.ledgerRead(r).filter((e) => e.id === 'A1').length, 1);
});

for (const phase of ['ledger', 'rename', 'journal-commit']) test('closure recovers without duplicate ledger after ' + phase + ' failure', () => {
  const root = fixture(), src = contract(root, 'A1'), r = relay(root), b = fs.readFileSync(src, 'utf8');
  const context = { root, relay: r, id: 'A1', body: b };
  const done = schema.replaceField(schema.replaceField(b, 'status', 'done'), 'result', 'passed');
  const entry = { id: 'A1', round: 1, result: 'passed', headSha: git(root, 'rev-parse', 'HEAD'), diffHash: seal.ownsDigest(root, ['src/value.js']), verify: [] };
  const oldAppend = seal.ledgerAppend, oldRename = fs.renameSync;
  let tripped = false;
  if (phase === 'ledger') seal.ledgerAppend = () => { tripped = true; throw new Error('injected ledger failure'); };
  else fs.renameSync = (a, b) => {
    if ((phase !== 'rename' || !tripped) && (phase === 'rename' ? String(b).endsWith(path.join('done', 'A1.md')) :
      String(b).endsWith(path.join('closures', 'A1.json')) && fs.existsSync(path.join(r, 'contracts/done/A1.md')))) {
      tripped = true; throw new Error('injected ' + phase + ' failure');
    }
    return oldRename(a, b);
  };
  try { assert.throws(() => closure.commit(context, done, entry, null), /injected|persist/); }
  finally { seal.ledgerAppend = oldAppend; fs.renameSync = oldRename; }
  assert.ok(tripped); assert.equal(closure.readJournal(r, 'A1').state, 'prepared');
  const recovered = closure.resume(context, closure.readJournal(r, 'A1'));
  assert.equal(recovered.state, 'committed');
  closure.resume(context, recovered);
  assert.equal(seal.ledgerRead(r).filter((x) => x.id === 'A1').length, 1);
});
test('pending closure will not overwrite a concurrent contract edit', () => {
  const root = fixture(), src = contract(root, 'A1'), r = relay(root), b = fs.readFileSync(src, 'utf8');
  const c = { root, relay: r, id: 'A1', body: b }, old = seal.ledgerAppend;
  seal.ledgerAppend = () => { throw new Error('injected'); };
  try { assert.throws(() => closure.commit(c, schema.replaceField(b, 'status', 'done'),
    { id: 'A1', round: 1, result: 'passed', headSha: git(root, 'rev-parse', 'HEAD'), verify: [] }, null)); }
  finally { seal.ledgerAppend = old; }
  fs.appendFileSync(src, '\n## Checkpoint\nUser changed this contract.\n');
  assert.throws(() => closure.resume(c, closure.readJournal(r, 'A1')), /Contract changed/);
  assert.match(fs.readFileSync(src, 'utf8'), /User changed/);
});
console.log(JSON.stringify({ passed, failed, results }));
process.exitCode = failed ? 1 : 0;
