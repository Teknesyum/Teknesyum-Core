'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const cp = require('child_process');
const args = process.argv.slice(2);
const base = path.resolve(args.find((x) => !x.startsWith('--')) || path.join(__dirname, '..'));
const core = path.join(base, 'core');
if (!fs.existsSync(path.join(core, 'scripts', 'contract.js'))) throw Error('Invalid Core root: ' + base);
const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-review-probes-'));
const config = path.join(fixtureRoot, 'config');
fs.mkdirSync(config);
const env = { ...process.env, CLAUDE_CONFIG_DIR: config, TEKNESYUM_GATE_OPEN: '', TEKNESYUM_BEEP_SESSIZ: '1' };
delete env.CLAUDE_CODE_SESSION_ID;
delete env.CLAUDE_SESSION_ID;
const results = [];

function put(root, file, body) {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, typeof body === 'string' ? body : JSON.stringify(body));
  return target;
}
function git(root, ...argv) {
  const r = cp.spawnSync('git', argv, { cwd: root, encoding: 'utf8', windowsHide: true, timeout: 10000 });
  if (r.error || r.status !== 0) throw Error(String(r.error || r.stderr));
  return r.stdout.trim();
}
function fixture(name) {
  const root = path.join(fixtureRoot, name);
  fs.mkdirSync(root);
  put(root, 'src/value.js', 'module.exports=1;\n');
  put(root, '.gitignore', '.claude/\n');
  fs.mkdirSync(path.join(root, '.claude/relay/contracts'), { recursive: true });
  git(root, 'init', '-q', '-b', 'main');
  git(root, 'config', 'user.email', 'review@example.invalid');
  git(root, 'config', 'user.name', 'Review fixture');
  git(root, 'add', '.');
  git(root, 'commit', '-qm', 'fixture');
  return root;
}
function run(root, script, argv = [], payload) {
  const r = cp.spawnSync(process.execPath, [path.join(core, script), ...argv], {
    cwd: root, env, encoding: 'utf8', windowsHide: true, timeout: 15000,
    input: payload ? JSON.stringify({ cwd: root, ...payload }) : undefined,
  });
  if (r.error) throw r.error;
  return { status: r.status, out: r.stdout, err: r.stderr };
}
const basicStep = '  - node -e "if(require(\'./src/value.js\')!==1) process.exit(4)"';
function contract(root, id, extra = '', steps = basicStep) {
  return put(root, '.claude/relay/contracts/' + id + '.md',
    '# ' + id + '\nstatus: submitted\nround: 1\nowns: [src/value.js]\nverify:\n' + steps + '\n' + extra);
}
function probe(name, fn) {
  try { results.push({ name, ...fn() }); }
  catch (error) { results.push({ name, error: String(error.stack) }); }
}

probe('worktree verifier runs main checkout', () => {
  const root = fixture('worktree');
  const worktree = path.join(fixtureRoot, 'linked');
  git(root, 'worktree', 'add', '-qb', 'review-wt', worktree);
  put(worktree, 'src/value.js', 'module.exports=999;\n');
  contract(root, 'W1');
  const r = run(worktree, 'scripts/contract.js', ['complete', '--id', 'W1']);
  return { issueReproduced: r.status === 0, mainValue: 1, worktreeValue: 999, ...r };
});

probe('unrelated historical auditor can sign', () => {
  const root = fixture('old-auditor');
  contract(root, 'A1', 'risk: high\n');
  put(root, '.claude/relay/live/old.json', {
    id: 'old', role: 'auditor', contract: 'Z999', round: 8, ended: '2020-01-01', files: [],
  });
  const r = run(root, 'scripts/contract.js',
    ['audit', '--id', 'A1', '--run-id', 'old', '--verification', 'not executed for this contract']);
  return { issueReproduced: r.status === 0, ...r };
});

probe('audited files change during verification yet seal passes', () => {
  const root = fixture('stale-seal');
  contract(root, 'S1', 'risk: high\n',
    '  - node -e "require(\'fs\').writeFileSync(\'src/value.js\',\'module.exports=999;\')"');
  require(path.join(base, 'test', 'host-fixture.js')).issueAudit(root, 'S1', 'a');
  const r = run(root, 'scripts/contract.js', ['complete', '--id', 'S1']);
  return { issueReproduced: r.status === 0 &&
    fs.readFileSync(path.join(root, 'src/value.js'), 'utf8').includes('999'), ...r };
});

probe('empty verify without acceptance reason closes', () => {
  const root = fixture('empty');
  put(root, '.claude/relay/contracts/E1.md',
    '# E1\nstatus: submitted\nowns: [src/value.js]\nverify: []\n');
  const r = run(root, 'scripts/contract.js', ['complete', '--id', 'E1']);
  return { issueReproduced: r.status === 0, ...r };
});

probe('unmet dependency is treated as satisfied', () => {
  const root = fixture('unmet');
  contract(root, 'D1');
  const prerequisite = run(root, 'scripts/contract.js', ['close', '--id', 'D1', '--reason',
    'This prerequisite is deliberately not implemented and acceptance was never satisfied.']);
  contract(root, 'D2', 'depends: [D1]\n');
  const r = run(root, 'scripts/contract.js', ['complete', '--id', 'D2']);
  return { issueReproduced: prerequisite.status === 0 && r.status === 0, ...r };
});

probe('closed debt evidence disappears on handoff refresh', () => {
  const root = fixture('debt');
  run(root, 'scripts/handoff.js', ['owe', '--add', 'ask the advisor']);
  run(root, 'scripts/handoff.js', ['owe', '--done', '1', '--because', 'the advisor answered']);
  const file = path.join(root, '.claude/relay/HANDOFF.md');
  const before = fs.readFileSync(file, 'utf8');
  run(root, 'scripts/handoff.js', ['write']);
  const after = fs.readFileSync(file, 'utf8');
  return { issueReproduced: before.includes('Closed debts') && !after.includes('Closed debts'), before, after };
});

probe('dirty import graph still called fresh', () => {
  const root = fixture('map');
  const map = require(path.join(core, 'scripts/map.js'));
  map.emit(root, map.build(root), {});
  put(root, 'src/new.js', 'require(\'./value.js\');\n');
  const state = map.staleness(root, path.join(root, '.claude/relay'));
  const fanIn = map.fanIn(root, ['src/value.js']);
  return { issueReproduced: state.state === 'fresh' && fanIn.max === 0, state, fanIn, actualImporters: 1 };
});

probe('session end closes another session when only payload has session id', () => {
  const root = fixture('session');
  put(root, '.claude/relay/live/other.json',
    { id: 'other', sessionId: 'other-session', role: 'builder', files: [] });
  const r = run(root, 'hooks/watch.js', [], { hook_event_name: 'SessionEnd', session_id: 'this-session' });
  const record = JSON.parse(fs.readFileSync(path.join(root, '.claude/relay/live/other.json'), 'utf8'));
  return { issueReproduced: !!record.ended, record, ...r };
});

probe('bound agent can write outside repository through Write', () => {
  const root = fixture('outside');
  contract(root, 'B1');
  put(root, '.claude/relay/live/b.json', { id: 'b', role: 'builder', contract: 'B1', files: [] });
  const r = run(root, 'hooks/guard.js', [], {
    hook_event_name: 'PreToolUse', agent_id: 'b', tool_name: 'Write',
    tool_input: { file_path: path.join(fixtureRoot, 'outside.txt'), content: 'probe' },
  });
  return { issueReproduced: r.status === 0, ...r };
});

probe('first known-role dispatch inherits model without existing relay', () => {
  const root = path.join(fixtureRoot, 'no-relay');
  fs.mkdirSync(root);
  const r = run(root, 'hooks/watch.js', [], {
    hook_event_name: 'PreToolUse', tool_name: 'Agent',
    tool_input: { subagent_type: 'teknesyum-core:worker', prompt: 'Read core/roles/builder.md' },
  });
  return { issueReproduced: r.status === 0, ...r };
});

probe('suffix contract is invisible in statusline count', () => {
  const root = fixture('suffix');
  contract(root, 'T2b');
  const r = run(root, 'scripts/statusline.js', [], { workspace: { current_dir: root } });
  const schema = require(path.join(core, 'hooks/schema.js'));
  return { issueReproduced: schema.isContractName('T2b.md') &&
    !/waiting at the gate|onay bekliyor/.test(r.out), ...r };
});

probe('forged complete audit and live record are accepted', () => {
  const root = fixture('forgery');
  contract(root, 'F1', 'risk: high\n');
  const seal = require(path.join(core, 'hooks/seal.js'));
  put(root, '.claude/relay/live/fake.json', { id: 'fake', role: 'auditor', files: [] });
  put(root, '.claude/relay/audits/F1-1.json', {
    contractId: 'F1', auditorRunId: 'fake', headSha: git(root, 'rev-parse', 'HEAD'),
    diffHash: seal.ownsDigest(root, ['src/value.js']), owns: ['src/value.js'],
    verification: ['never ran'], result: 'passed', createdAt: new Date().toISOString(),
  });
  const r = run(root, 'scripts/contract.js', ['complete', '--id', 'F1']);
  return { issueReproduced: r.status === 0, ...r };
});

console.log(JSON.stringify({ at: new Date().toISOString(), snapshot: base, fixture: fixtureRoot, results }, null, 2));
if (results.some((r) => r.error)) process.exitCode = 2;
else if (args.includes('--expect-fixed') && results.some((r) => r.issueReproduced)) process.exitCode = 1;
