// Adversarial cases from the VidShrink audit. Only isolated temporary repositories.
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert/strict');
const { spawnSync } = require('child_process');
const core = path.resolve(__dirname, '../core');
const contract = require(path.join(core, 'scripts/contract.js'));
const seal = require(path.join(core, 'hooks/seal.js'));
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-audit-'));
const relay = path.join(root, '.claude/relay');
let passed = 0;
let failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('PASS ' + name); }
  catch (e) { failed++; console.error('FAIL ' + name + ': ' + e.message); }
}
function run(script, args = [], payload) {
  return spawnSync(process.execPath, [path.join(core, script), ...args], {
    cwd: root, encoding: 'utf8', windowsHide: true, timeout: 20000,
    env: { ...process.env, TEKNESYUM_GATE_OPEN: '' },
    input: payload ? JSON.stringify({ cwd: root, ...payload }) : undefined,
  });
}
function put(file, data) {
  const p = path.join(root, file);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, typeof data === 'string' ? data : JSON.stringify(data));
}
function git(...args) {
  const r = spawnSync('git', args, { cwd: root, encoding: 'utf8', windowsHide: true });
  assert.equal(r.status, 0, r.stderr); return r.stdout.trim();
}
function dispatch(model, prompt = 'Read core/roles/builder.md', extra = {}) {
  return run('hooks/watch.js', [], {
    hook_event_name: 'PreToolUse', tool_name: 'Agent', agent_id: 'parent',
    tool_input: { subagent_type: 'teknesyum-core:worker', model, prompt }, ...extra,
  });
}
function body(id, extra = '') {
  return '# ' + id + '\nstatus: submitted\nround: 1\nowns: [src/ok.js]\nverify:\n  - node -e "process.exit(0)"\n' + extra;
}
put('.claude/relay/contracts/.keep', '');
put('src/ok.js', 'module.exports = 1;\n');
git('init', '-q'); git('config', 'user.email', 'audit@example.invalid'); git('config', 'user.name', 'Audit fixture');
git('add', '.'); git('commit', '-qm', 'fixture');

test('known role cannot silently inherit expensive parent model', () => assert.equal(dispatch(undefined).status, 2));
test('legacy agents role path cannot bypass cheap-first', () => assert.equal(dispatch('opus', 'Read old/agents/builder.md').status, 2));
test('child role does not overwrite parent identity', () => {
  put('.claude/relay/live/parent.json', { id: 'parent', role: 'planner', files: [] });
  assert.equal(dispatch('sonnet').status, 0);
  assert.equal(JSON.parse(fs.readFileSync(path.join(relay, 'live/parent.json'))).role, 'planner');
});
test('third round is the single advisor threshold', () => assert.equal(contract.tier('builder', { profile: 'premium', round: 3 }).advisorRequired, true));
test('zero collected tests cannot hide above the last twelve lines', () => {
  const r = contract.runVerify(root, ['node -e "console.log(\'collected 0 items\');for(let i=0;i<20;i++)console.log(\'cleanup\')"'])[0];
  assert.equal(r.ok, false); assert.equal(r.empty, true);
});
test('a real csproj path requires high-risk review', () => {
  assert.equal(require(path.join(core, 'scripts/risk.js')).resolve(root, ['src/Video.csproj']).level, 'high');
});
test('C# namespace imports do not prove dead source files', () => {
  put('src/PlanCalculator.cs', 'class PlanCalculator {}');
  put('src/Main.cs', 'class Main { PlanCalculator calculator; }');
  git('add', 'src'); git('commit', '-qm', 'CSharp fixture');
  assert.deepEqual(contract.orphans(root, ['src/PlanCalculator.cs']), []);
});
test('low-risk completion consumes an available valid audit', () => {
  put('.claude/relay/contracts/A1.md', body('A1'));
  put('.claude/relay/live/a1.json', { id: 'a1', role: 'auditor', files: [] });
  const a = run('scripts/contract.js', ['audit', '--id', 'A1', '--run-id', 'a1', '--verification', 'fixture check -> exit 0']);
  assert.equal(a.status, 0, a.stdout);
  const r = run('scripts/contract.js', ['complete', '--id', 'A1']);
  assert.equal(r.status, 0, r.stdout);
  assert.match(r.stdout, /audit record consumed/);
  assert.equal(seal.ledgerRead(relay).at(-1).auditorRunId, 'a1');
});
test('stale bookkeeping is not a legitimate seal', () => {
  seal.ledgerAppend(relay, { id: 'S1', result: 'stale' });
  put('.claude/relay/contracts/done/S1.md', body('S1'));
  assert.ok(seal.auditDone(root, relay).includes('S1'));
});
test('Stop does not demand dispatch of blocked work', () => {
  put('.claude/relay/contracts/B1.md', body('B1', 'depends: [T999]\n').replace('submitted', 'open'));
  const r = run('hooks/watch.js', [], { hook_event_name: 'Stop', stop_hook_active: false });
  assert.equal(r.stdout, '');
  fs.unlinkSync(path.join(relay, 'contracts/B1.md'));
});
test('an unrelated subagent cannot answer a pending advisor question', () => {
  const advice = require(path.join(core, 'scripts/advice.js'));
  const name = advice.open(relay, { model: 'fable', prompt: 'Review X', topic: 'review', toolUseId: 'call-1' });
  put('reply.jsonl', JSON.stringify({ type: 'assistant', message: { content: [{ type: 'text', text: 'builder output' }] } }) + '\n');
  assert.equal(advice.close(relay, '', path.join(root, 'reply.jsonl'), 'wrong-agent'), '');
  assert.ok(advice.bind(relay, 'call-1', 'advisor-1'));
  assert.equal(advice.close(relay, '', path.join(root, 'reply.jsonl'), 'advisor-1'), name);
});
test('Fable consultation is tied to the finished agent, contract and previous round', () => {
  put('.claude/relay/contracts/done/R1.md', body('R1').replace('round: 1', 'round: 2'));
  const args = ['reopen', '--id', 'R1', '--reason', 'broken output still reproduced', '--critical', 'the output corrupts the exported file', '--advisor', 'f1'];
  const rec = { id: 'f1', role: 'advisor', model: 'opus', contract: 'R1', round: '2', files: [], ended: new Date().toISOString() };
  put('.claude/relay/live/f1.json', rec);
  assert.match(run('scripts/contract.js', args).stdout, /resolved Fable/);
  rec.model = 'claude-fable-5'; rec.contract = 'R9'; put('.claude/relay/live/f1.json', rec);
  assert.match(run('scripts/contract.js', args).stdout, /another contract or round/);
  rec.contract = 'R1'; delete rec.ended; put('.claude/relay/live/f1.json', rec);
  assert.match(run('scripts/contract.js', args).stdout, /wait for the advisor/);
  rec.ended = new Date().toISOString(); put('.claude/relay/live/f1.json', rec);
  const r = run('scripts/contract.js', args); assert.equal(r.status, 0, r.stdout);
});
test('host launch response records child identity and resolved model', () => {
  const r = run('hooks/watch.js', [], { hook_event_name: 'PostToolUse', tool_name: 'Agent', agent_id: 'parent', agent_type: 'planner',
    tool_input: { model: 'fable', subagent_type: 'teknesyum-core:worker', prompt: 'Read roles/advisor.md for contracts/R1.md' },
    tool_response: { agentId: 'real-child', resolvedModel: 'claude-fable-5' } });
  assert.equal(r.status, 0);
  const child = JSON.parse(fs.readFileSync(path.join(relay, 'live/real-child.json')));
  assert.equal(child.role, 'advisor'); assert.equal(child.model, 'claude-fable-5'); assert.equal(child.contract, 'R1');
});
test('precheck and check --run respect another verifier lock', () => {
  put('.claude/relay/contracts/V1.md', body('V1'));
  put('.claude/relay/live/_verify.lock', { pid: process.pid, id: 'another verifier' });
  for (const args of [['precheck', '--id', 'V1'], ['check', '--id', 'V1', '--run']]) {
    const r = run('scripts/contract.js', args);
    assert.equal(r.status, 2, r.stdout); assert.match(r.stdout, /locked/);
  }
  fs.unlinkSync(path.join(relay, 'live/_verify.lock'));
});
test('headline numbers preserve decimal magnitude and do not silently round five percent', () => {
  const manset = require(path.join(core, 'scripts/manset.js'));
  assert.ok(![...manset.canon('1,2')].some((n) => manset.canon('12').has(n)));
  put('figures.md', '# Figures\n\n12 s measured.\n\n| run | seconds |\n|---|---|\n| A | 1,2 |\n');
  assert.ok(manset.inspect(path.join(root, 'figures.md'), []).length > 0);
  put('figures.md', '# Figures\n\n9.6 s total.\n\n| run | seconds |\n|---|---|\n| A | 5 |\n| B | 5 |\n');
  assert.ok(manset.inspect(path.join(root, 'figures.md'), []).length > 0);
});
test('an inherited gate-open flag is not a per-command exception', () => {
  const r = spawnSync(process.execPath, [path.join(core, 'hooks/guard.js')], {
    cwd: root, encoding: 'utf8', windowsHide: true,
    env: { ...process.env, TEKNESYUM_GATE_OPEN: '1' },
    input: JSON.stringify({ cwd: root, tool_name: 'Bash', tool_input: { command: 'git push origin main' } }),
  });
  assert.equal(r.status, 2, r.stderr);
});
test('mandatory Fable remains dispatchable for a closed second round in normal profile', () => {
  put('.claude/relay/config.json', { profile: 'normal' });
  put('.claude/relay/contracts/done/F2.md', body('F2').replace('round: 1', 'round: 2'));
  const r = dispatch('fable', 'Read roles/advisor.md and contracts/done/F2.md');
  assert.equal(r.status, 0, r.stderr);
});
console.log(JSON.stringify({ passed, failed, fixture: root }));
process.exitCode = failed ? 1 : 0;
