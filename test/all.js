#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const CORE = path.resolve(__dirname, '..', 'core');
const GUARD = path.join(CORE, 'hooks', 'guard.js');
const CONTRACT = path.join(CORE, 'scripts', 'contract.js');
const STATUSLINE = path.join(CORE, 'scripts', 'statusline.js');

let pass = 0;
let fail = 0;
const failures = [];

function ok(name, cond, detail) {
  if (cond) {
    pass += 1;
    return;
  }
  fail += 1;
  failures.push(name + (detail ? '\n    ' + String(detail).split('\n').join('\n    ') : ''));
}

function run(cmd, args, opts) {
  return spawnSync(cmd, args, {
    encoding: 'utf8',
    windowsHide: true,
    timeout: 120000,
    maxBuffer: 8 * 1024 * 1024,
    ...opts,
  });
}

function hook(payload, cwd) {
  return run(process.execPath, [GUARD], { cwd, input: JSON.stringify(payload) });
}

function contract(args, cwd, env) {
  return run(process.execPath, [CONTRACT].concat(args), { cwd, env: env ? { ...process.env, ...env } : process.env });
}

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-'));
  fs.mkdirSync(path.join(root, 'src', 'auth'), { recursive: true });
  fs.mkdirSync(path.join(root, '.claude', 'relay', 'contracts'), { recursive: true });
  fs.writeFileSync(path.join(root, 'src', 'ok.js'), 'module.exports = 1;\n');
  fs.writeFileSync(path.join(root, 'src', 'auth', 'token.js'), 'module.exports = 2;\n');
  run('git', ['init', '-q', '.'], { cwd: root });
  run('git', ['config', 'user.email', 't@t.t'], { cwd: root });
  run('git', ['config', 'user.name', 't'], { cwd: root });
  run('git', ['add', '-A'], { cwd: root });
  run('git', ['commit', '-qm', 'init'], { cwd: root });
  return root;
}

function writeContract(root, id, body) {
  const p = path.join(root, '.claude', 'relay', 'contracts', id + '.md');
  fs.writeFileSync(p, body);
  return p;
}

const CONTRACTS = path.join('.claude', 'relay', 'contracts');
const FINISHED = path.join(CONTRACTS, 'd' + 'one');

function testGuard(root) {
  const c = (id) => path.join(root, CONTRACTS, id + '.md');

  ok(
    'write into the finished directory is blocked',
    hook({ tool_name: 'Write', tool_input: { file_path: path.join(root, FINISHED, 'T1.md'), content: 'x' } }, root)
      .status === 2
  );

  ok(
    'owns with a directory is blocked',
    hook({ tool_name: 'Write', tool_input: { file_path: c('T9'), content: 'owns: [src/]\nverify:\n  - node -e \"process.exit(0)\"\n' } }, root)
      .status === 2
  );

  ok(
    'contract without verify is blocked',
    hook({ tool_name: 'Write', tool_input: { file_path: c('T9'), content: 'owns: [src/ok.js]\n' } }, root).status === 2
  );

  const valid = {
    tool_name: 'Write',
    tool_input: { file_path: c('T9'), content: 'owns: [src/ok.js]\nverify:\n  - node -e \"process.exit(0)\"\nstatus: open\n' },
  };
  ok('first contract of a new project needs prior art', hook(valid, root).status === 2);

  fs.mkdirSync(path.join(root, 'docs', 'scans'), { recursive: true });
  fs.writeFileSync(path.join(root, 'docs', 'scans', 'read.md'), '# read\n');
  ok('valid contract passes once prior art exists', hook(valid, root).status === 0);

  ok(
    'CLAUDE.md with a body is blocked',
    hook({ tool_name: 'Write', tool_input: { file_path: path.join(root, 'CLAUDE.md'), content: '# rules\ntext\n' } }, root)
      .status === 2
  );

  ok(
    'CLAUDE.md pointer passes',
    hook({ tool_name: 'Write', tool_input: { file_path: path.join(root, 'CLAUDE.md'), content: '@AGENTS.md\n' } }, root)
      .status === 0
  );

  const finishedFile = path.join(root, FINISHED, 'T1.md').split(path.sep).join('/');
  ok(
    'the gate no longer reads shell commands at all',
    hook({ tool_name: 'Bash', tool_input: { command: 'rm ' + finishedFile } }, root).status === 0
  );

  writeContract(root, 'R1', '---\nid: R1\nstatus: submitted\nowns: [src/ok.js]\nverify:\n  - node -e \"process.exit(0)\"\n---\n');
  ok(
    'status regression is blocked',
    hook(
      { tool_name: 'Edit', tool_input: { file_path: c('R1'), old_string: 'status: submitted', new_string: 'status: open' } },
      root
    ).status === 2
  );
  ok(
    'unknown status is blocked',
    hook(
      { tool_name: 'Edit', tool_input: { file_path: c('R1'), old_string: 'status: submitted', new_string: 'status: nope' } },
      root
    ).status === 2
  );
  ok(
    'forward transition passes',
    hook(
      { tool_name: 'Edit', tool_input: { file_path: c('R1'), old_string: 'status: submitted', new_string: 'status: accepted' } },
      root
    ).status === 0
  );

  writeContract(root, 'R2', '---\nid: R2\nstatus: open\nowns: [src/ok.js]\nverify:\n  - node -e \"process.exit(0)\"\n---\n');
  ok(
    'open cannot skip active',
    hook(
      { tool_name: 'Edit', tool_input: { file_path: c('R2'), old_string: 'status: open', new_string: 'status: submitted' } },
      root
    ).status === 2
  );
  ok(
    'open to active passes',
    hook(
      { tool_name: 'Edit', tool_input: { file_path: c('R2'), old_string: 'status: open', new_string: 'status: active' } },
      root
    ).status === 0
  );
}

function testGate(root) {
  writeContract(
    root,
    'T1',
    '---\nid: T1\nstatus: submitted\nround: 1\nowns: [src/ok.js]\nverify:\n  - node -e "require(\'./src/ok.js\')"\n---\n'
  );
  writeContract(
    root,
    'T2',
    '---\nid: T2\nstatus: submitted\nround: 1\nowns: [src/ok.js]\nverify:\n  - node -e "process.exit(3)"\n---\n'
  );
  writeContract(
    root,
    'T3',
    '---\nid: T3\nstatus: submitted\nround: 1\nowns: [src/auth/token.js]\nverify:\n  - node -e "require(\'./src/auth/token.js\')"\n---\n'
  );

  const c1 = contract(['check', '--id', 'T1'], root);
  ok('plain path is low risk', /risk low/.test(c1.stdout), c1.stdout);

  const c3 = contract(['check', '--id', 'T3'], root);
  ok('auth path is high risk', /risk high/.test(c3.stdout), c3.stdout);
  ok('check reports a diffHash', /diffHash: [0-9a-f]{64}/.test(c3.stdout), c3.stdout);

  const t2 = contract(['complete', '--id', 'T2'], root);
  ok('failing verify blocks completion', t2.status === 2 && /verification failed/.test(t2.stdout), t2.stdout);
  ok('failed contract stays open', fs.existsSync(path.join(root, CONTRACTS, 'T2.md')));

  const t1 = contract(['complete', '--id', 'T1'], root);
  ok('passing verify completes a low-risk contract', t1.status === 0, t1.stdout);
  ok('completed contract moved', fs.existsSync(path.join(root, FINISHED, 'T1.md')));

  fs.mkdirSync(path.join(root, 'notes'), { recursive: true });
  fs.writeFileSync(path.join(root, 'notes', 'dead.md'), 'a measurement, already used\n');
  fs.writeFileSync(path.join(root, 'notes', 'kept.md'), 'still in the route\n');
  fs.writeFileSync(path.join(root, 'notes', 'index.md'), 'the route runs through kept.md\n');
  run('git', ['add', '-A'], { cwd: root });
  writeContract(
    root,
    'T8',
    '---\nid: T8\nstatus: submitted\nround: 1\nowns: [notes/dead.md, notes/kept.md]\nverify:\n  - node -e "process.exit(0)"\n---\n'
  );
  const t8 = contract(['complete', '--id', 'T8'], root);
  ok('a closed contract names the file nothing references', /notes\/dead[.]md/.test(t8.stdout), t8.stdout);
  ok('a file the tree still names is left alone', !/notes\/kept[.]md/.test(t8.stdout), t8.stdout);
  ok('the gate points at trash, not at deletion', /trash\//.test(t8.stdout) && !/rm /.test(t8.stdout), t8.stdout);

  const t3a = contract(['complete', '--id', 'T3'], root);
  ok('high risk without a record is blocked', t3a.status === 2 && /audit record/.test(t3a.stdout), t3a.stdout);

  const head = run('git', ['rev-parse', 'HEAD'], { cwd: root }).stdout.trim();
  const diffHash = (contract(['check', '--id', 'T3'], root).stdout.match(/diffHash: ([0-9a-f]{64})/) || [])[1];
  const live = path.join(root, '.claude', 'relay', 'live');
  const audits = path.join(root, '.claude', 'relay', 'audits');
  fs.mkdirSync(live, { recursive: true });
  fs.mkdirSync(audits, { recursive: true });
  fs.writeFileSync(path.join(live, 'aud1.json'), JSON.stringify({ id: 'aud1', role: 'auditor', files: [] }));

  const record = {
    contractId: 'T3',
    auditorRunId: 'aud1',
    headSha: head,
    diffHash,
    owns: ['src/auth/token.js'],
    verification: ['node -e require -> exit 0'],
    result: 'passed',
    createdAt: new Date().toISOString(),
  };

  fs.writeFileSync(path.join(audits, 'T3-1.json'), JSON.stringify({ ...record, owns: ['src/other.js'] }));
  const t3b = contract(['complete', '--id', 'T3'], root);
  ok('record with a different owns set is rejected', t3b.status === 2 && /owns set differs/.test(t3b.stdout), t3b.stdout);

  fs.writeFileSync(path.join(live, 'aud2.json'), JSON.stringify({ id: 'aud2', role: 'builder', files: [] }));
  fs.writeFileSync(path.join(audits, 'T3-1.json'), JSON.stringify({ ...record, auditorRunId: 'aud2' }));
  const t3c = contract(['complete', '--id', 'T3'], root);
  ok('record from a non-auditor is rejected', t3c.status === 2 && /non-auditor/.test(t3c.stdout), t3c.stdout);

  fs.writeFileSync(path.join(live, 'aud3.json'), JSON.stringify({ id: 'aud3', role: 'auditor', files: ['src/auth/token.js'] }));
  fs.writeFileSync(path.join(audits, 'T3-1.json'), JSON.stringify({ ...record, auditorRunId: 'aud3' }));
  const t3d = contract(['complete', '--id', 'T3'], root);
  ok('auditor that wrote files is rejected', t3d.status === 2 && /wrote files/.test(t3d.stdout), t3d.stdout);

  fs.writeFileSync(path.join(audits, 'T3-1.json'), JSON.stringify(record));
  const t3e = contract(['complete', '--id', 'T3'], root);
  ok('valid record completes a high-risk contract', t3e.status === 0, t3e.stdout);
  ok('audit record is consumed', fs.existsSync(path.join(audits, 'T3-1.used.json')));
  ok('audit record is gone', !fs.existsSync(path.join(audits, 'T3-1.json')));

  const ledger = contract(['ledger'], root);
  ok('ledger matches the finished directory', ledger.status === 0, ledger.stdout);

  fs.writeFileSync(path.join(root, FINISHED, 'X9.md'), 'smuggled\n');
  const ledger2 = contract(['ledger'], root);
  ok('a smuggled contract is detected', ledger2.status === 3 && /X9/.test(ledger2.stdout), ledger2.stdout);
  fs.unlinkSync(path.join(root, FINISHED, 'X9.md'));

  const closed = contract(['close', '--id', 'T2', '--reason', 'short'], root);
  ok('close without a real reason is rejected', closed.status === 2, closed.stdout);

  const closed2 = contract(
    ['close', '--id', 'T2', '--reason', 'The upstream API never shipped the endpoint this contract depends on.'],
    root
  );
  ok('close with a reason works', closed2.status === 0, closed2.stdout);
}

function testBypass(root) {
  const relay = path.join(root, '.claude', 'relay');
  const live = path.join(relay, 'live');
  const audits = path.join(relay, 'audits');
  fs.mkdirSync(live, { recursive: true });
  fs.mkdirSync(audits, { recursive: true });

  ok(
    'Write into audits/ is blocked',
    hook({ tool_name: 'Write', tool_input: { file_path: path.join(audits, 'Z1-1.json'), content: '{}' } }, root)
      .status === 2
  );
  ok(
    'Write into live/ is blocked',
    hook({ tool_name: 'Write', tool_input: { file_path: path.join(live, 'fake.json'), content: '{}' } }, root)
      .status === 2
  );
  const auditsUnix = audits.split(path.sep).join('/');
  ok(
    'the shell is not policed either - the record itself is the guarantee',
    hook({ tool_name: 'Bash', tool_input: { command: 'echo {} > ' + auditsUnix + '/Z1-1.json' } }, root).status === 0
  );
  ok(
    'and a hand written record still cannot close a contract',
    typeof require(path.join(CORE, 'hooks', 'seal.js')).checkRecord({}, { id: 'Z1' }) === 'string'
  );

  writeContract(
    root,
    'B1',
    '---\nid: B1\nstatus: open\nround: 1\nowns: [src/ok.js]\nverify:\n  - node -e \"process.exit(0)\"\n---\n'
  );
  const contractPath = path.join(root, CONTRACTS, 'B1.md');
  const agent = 'agent-b1';

  ok(
    'an agent binds itself by touching its contract',
    hook(
      { tool_name: 'Edit', agent_id: agent, tool_input: { file_path: contractPath, old_string: 'status: open', new_string: 'status: active' } },
      root
    ).status === 0
  );
  ok('binding is recorded', (JSON.parse(fs.readFileSync(path.join(live, agent + '.json'), 'utf8')) || {}).contract === 'B1');

  ok(
    'a bound agent may write inside owns',
    hook(
      { tool_name: 'Write', agent_id: agent, tool_input: { file_path: path.join(root, 'src', 'ok.js'), content: 'module.exports = 1;\n' } },
      root
    ).status === 0
  );
  const outside = hook(
    { tool_name: 'Write', agent_id: agent, tool_input: { file_path: path.join(root, 'src', 'auth', 'token.js'), content: 'x' } },
    root
  );
  ok('a bound agent may not write outside owns', outside.status === 2 && /outside the owns set/.test(outside.stderr), outside.stderr);

  ok(
    'an unbound session is not restricted',
    hook({ tool_name: 'Write', tool_input: { file_path: path.join(root, 'src', 'auth', 'token.js'), content: 'x' } }, root)
      .status === 0
  );

  writeContract(
    root,
    'V1',
    '---\nid: V1\nstatus: submitted\nround: 1\nowns: [src/ok.js]\nverify:\n  - node -e "1" && mv x .claude/relay/contracts/done/\n---\n'
  );
  const v1 = contract(['complete', '--id', 'V1'], root);
  ok('a verify step reaching into the gate is rejected', v1.status === 2 && /reaches into the gate/.test(v1.stdout), v1.stdout);

  writeContract(
    root,
    'D1',
    '---\nid: D1\nstatus: submitted\nround: 1\nrisk: high\nowns: [src/ok.js]\nverify:\n  - node -e "1"\n---\n'
  );
  const d1 = contract(['complete', '--id', 'D1'], root);
  ok('a contract may escalate its own risk', d1.status === 2 && /audit record/.test(d1.stdout), d1.stdout);

  const wide = [];
  for (let i = 0; i < 9; i += 1) {
    fs.writeFileSync(path.join(root, 'src', 'w' + i + '.js'), 'module.exports = ' + i + ';\n');
    wide.push('src/w' + i + '.js');
  }
  writeContract(
    root,
    'W1',
    '---\nid: W1\nstatus: submitted\nround: 1\nowns: [' + wide.join(', ') + ']\nverify:\n  - node -e "1"\n---\n'
  );
  const w1 = contract(['check', '--id', 'W1'], root);
  ok('more than eight owned files is high risk', /risk high/.test(w1.stdout) && /owns 9 files/.test(w1.stdout), w1.stdout);

  const auditCmd = contract(
    ['audit', '--id', 'D1', '--run-id', 'notauditor', '--verification', 'ran the tests'],
    root
  );
  fs.writeFileSync(path.join(live, 'notauditor.json'), JSON.stringify({ id: 'notauditor', role: 'builder', files: [] }));
  const auditCmd2 = contract(
    ['audit', '--id', 'D1', '--run-id', 'notauditor', '--verification', 'ran the tests'],
    root
  );
  ok('audit command needs evidence and an auditor', auditCmd.status === 2 || auditCmd2.status === 2, auditCmd2.stdout);

  fs.writeFileSync(path.join(live, 'realaud.json'), JSON.stringify({ id: 'realaud', role: 'auditor', files: [] }));
  const auditCmd3 = contract(
    ['audit', '--id', 'D1', '--run-id', 'realaud', '--verification', 'node -e "1" -> exit 0'],
    root
  );
  ok('audit command writes the record', auditCmd3.status === 0, auditCmd3.stdout);
  const written = JSON.parse(fs.readFileSync(path.join(audits, 'D1-1.json'), 'utf8'));
  ok('the record carries a computed diffHash', /^[0-9a-f]{64}$/.test(written.diffHash), written.diffHash);

  const d1b = contract(['complete', '--id', 'D1'], root);
  ok('a declared-high contract completes with a real record', d1b.status === 0, d1b.stdout);
}

function testPrefs(root) {
  const PREFS = path.join(CORE, 'hooks', 'prefs.js');
  const cfg = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-cfg-'));
  const call = (payload, env) =>
    run(process.execPath, [PREFS], {
      cwd: root,
      input: JSON.stringify(payload),
      env: { ...process.env, CLAUDE_CONFIG_DIR: cfg, CLAUDE_CODE_SESSION_ID: 'prefs-test', ...env },
    });

  const readme = { tool_name: 'Write', tool_input: { file_path: path.join(root, 'README.md'), content: '# x\n' } };
  ok('with no prefs file the hook does nothing', call(readme).status === 0);

  fs.mkdirSync(path.join(cfg, 'teknesyum'), { recursive: true });
  fs.writeFileSync(
    path.join(cfg, 'teknesyum', 'prefs.json'),
    JSON.stringify({ rules: [{ match: '^README\\.md$', doc: 'prefs/readme.md', require: ['SIGNATURE-MARK'], ask: { when: 'docs/diagram.md', line: 'DIAGRAM-QUESTION' } }] })
  );

  const blocked = call(readme);
  ok('a README missing a convention is blocked', blocked.status === 2 && /SIGNATURE-MARK/.test(blocked.stderr), blocked.stderr);

  ok('the block names the file to read', /readme[.]md/.test(blocked.stderr), blocked.stderr);
  ok('the block asks the recorded question', /DIAGRAM-QUESTION/.test(blocked.stderr), blocked.stderr);

  const askOnly = call({ tool_name: 'Write', tool_input: { file_path: path.join(root, 'README.md'), content: 'SIGNATURE-MARK' } });
  ok('the question alone still blocks', askOnly.status === 2 && /DIAGRAM-QUESTION/.test(askOnly.stderr), askOnly.stderr);

  fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
  fs.writeFileSync(path.join(root, 'docs', 'diagram.md'), 'banner only');

  ok(
    'a README carrying the convention passes',
    call({ tool_name: 'Write', tool_input: { file_path: path.join(root, 'README.md'), content: '# x\nSIGNATURE-MARK\n' } })
      .status === 0
  );

  ok('an unrelated file is untouched', call({ tool_name: 'Write', tool_input: { file_path: path.join(root, 'src', 'ok.js'), content: 'x' } }).status === 0);

  call(readme);
  ok('the gate stops repeating itself', call(readme).status === 0);
}

function testStatusline(root) {
  const r = run(process.execPath, [STATUSLINE], {
    cwd: root,
    input: JSON.stringify({ workspace: { current_dir: root } }),
    env: { ...process.env, NO_COLOR: '1' },
  });
  ok('statusline renders', r.status === 0 && r.stdout.length > 0, r.stdout);
  ok('statusline names the project', r.stdout.includes(path.basename(root)), r.stdout);

  const BRIDGE = path.join(CORE, 'scripts', 'bridge.js');
  const cache = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-brg-'));
  const home = path.join(cache, 'plugins', 'cache', 'teknesyum', 'teknesyum-core', '9.9.9', 'scripts');
  fs.mkdirSync(home, { recursive: true });
  fs.cpSync(path.join(CORE, 'scripts'), home, { recursive: true });
  fs.cpSync(path.join(CORE, 'hooks'), path.join(path.dirname(home), 'hooks'), { recursive: true });
  const viaBridge = run(process.execPath, [BRIDGE], {
    cwd: root,
    input: JSON.stringify({ workspace: { current_dir: root } }),
    env: { ...process.env, NO_COLOR: '1', CLAUDE_CONFIG_DIR: cache },
  });
  ok('the bridge renders the statusline it resolves', viaBridge.stdout.trim().length > 0, viaBridge.stdout + viaBridge.stderr);
  ok('the bridge names the project', viaBridge.stdout.includes(path.basename(root)), viaBridge.stdout);

  const logHome = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-log-'));
  const logEnv = { ...process.env, NO_COLOR: '1', CLAUDE_CONFIG_DIR: logHome, TEKNESYUM_CORE: logHome };
  const line = () =>
    run(process.execPath, [STATUSLINE], {
      cwd: root,
      input: JSON.stringify({ workspace: { current_dir: root } }),
      env: logEnv,
    }).stdout;
  ok('a clean tree shows no log count', !/logs/.test(line()), line());

  const openlogs = path.join(logHome, 'logs', 'openlogs');
  fs.mkdirSync(openlogs, { recursive: true });
  fs.mkdirSync(path.join(logHome, 'core', '.claude-plugin'), { recursive: true });
  fs.writeFileSync(path.join(logHome, 'core', '.claude-plugin', 'plugin.json'), '{"name":"teknesyum-core"}');
  fs.writeFileSync(path.join(openlogs, 'BUG-one.md'), '# one');
  fs.writeFileSync(path.join(openlogs, 'BUG-two.md'), '# two');
  ok('the statusline counts open bug logs', /2 logs/.test(line()), line());
  fs.writeFileSync(path.join(openlogs, 'notes.txt'), 'x');
  ok('only markdown logs are counted', /2 logs/.test(line()), line());
}

function testBanner(root) {
  const lib = require(path.join(CORE, 'hooks', 'lib.js'));
  const { banner, plain } = require(path.join(CORE, 'scripts', 'statusline.js'));
  const line = banner(root);

  ok('the banner opens with the plugin mark', plain(line).startsWith('**Teknesyum** ▸ '), line);
  ok('the banner stays quiet while the gate holds', !/KAPI|GATE OFF/.test(line), line);
  ok('the banner carries no escape the client would print raw', plain(line) === line, JSON.stringify(line));
  ok('the banner stays within three lines', line.split(String.fromCharCode(10)).length <= 3, line);

  ok('Turkish uppercase keeps the dot', !/Izlendi/.test(line), line);

  ok('the banner is silent outside a relay', banner(os.tmpdir()) === '');

  ok('the banner stays inside its cap', plain(line).split(String.fromCharCode(10)).every((l) => l.length <= 120), String(plain(line).length));
  ok('the banner never cuts mid-word', !/·\s*$/.test(plain(line)), line);

  const tally = path.join(lib.liveDir(path.join(root, '.claude', 'relay')), '_tally.json');
  fs.writeFileSync(tally, JSON.stringify({ steps: 41 }));
  ok('the step tally is off the banner for good', !/41/.test(banner(root)), banner(root));
  fs.rmSync(tally, { force: true });
  ok('the shared step tally never reaches the banner', !/41/.test(banner(root)), banner(root));

  const WATCH = path.join(CORE, 'hooks', 'watch.js');
  const fire = (ev, tool) =>
    run(process.execPath, [WATCH], {
      cwd: root,
      input: JSON.stringify({ hook_event_name: ev, tool_name: tool, agent_id: 'failer', cwd: root }),
    });
  fs.rmSync(tally, { force: true });
  fire('PostToolUseFailure', 'Bash');
  fire('PostToolUseFailure', 'Bash');
  ok('the hook counts a run of failures', (JSON.parse(fs.readFileSync(tally, 'utf8')).fails || 0) === 2, fs.readFileSync(tally, 'utf8'));
  ok('a failure is not counted as a step', (JSON.parse(fs.readFileSync(tally, 'utf8')).steps || 0) === 0, fs.readFileSync(tally, 'utf8'));
  fire('PostToolUse', 'Bash');
  ok('one success clears the run', (JSON.parse(fs.readFileSync(tally, 'utf8')).fails || 0) === 0, fs.readFileSync(tally, 'utf8'));
  fs.rmSync(path.join(lib.liveDir(path.join(root, '.claude', 'relay')), 'failer.json'), { force: true });

  fs.writeFileSync(tally, JSON.stringify({ steps: 3, fails: 1 }));
  ok('a single failure stays off the banner', !/Dikkat|Heads/i.test(plain(banner(root))), plain(banner(root)));
  fs.writeFileSync(tally, JSON.stringify({ steps: 3, fails: 2 }));
  ok('two failures in a row take over the banner', /Dikkat|Heads/i.test(plain(banner(root))) && /2 /.test(plain(banner(root))), plain(banner(root)));
  fs.rmSync(tally, { force: true });

  const liveB = lib.liveDir(path.join(root, '.claude', 'relay'));
  const parked = fs.readdirSync(liveB).filter((x) => x.endsWith('.json'));
  for (const x of parked) fs.renameSync(path.join(liveB, x), path.join(liveB, x + '.parked'));
  fs.writeFileSync(path.join(liveB, 'a1.json'), JSON.stringify({ id: 'a1', role: 'advisor', model: 'fable', effort: 'medium' }));
  fs.writeFileSync(path.join(liveB, '_calls.json'), JSON.stringify([{ role: 'advisor', model: 'fable', task: 'banner tasarimi soruldu', at: Date.now() }]));
  const crewLine = plain(banner(root));
  ok('the banner names the role in the user language', /Dan\u0131\u015fman|Advisor/.test(crewLine), crewLine);
  ok('no English role name survives', !/Worker|Builder|Auditor|Scout|Scribe/.test(crewLine), crewLine);
  ok('the banner names the model and effort', /Fable-Medium/.test(crewLine), crewLine);
  ok('the banner says what the agent was asked, in its own words', /banner tasarimi soruldu/.test(crewLine), crewLine);
  ok('a working agent pushes the profile off the line', !/Premium|Normal|Eco/.test(crewLine), crewLine);
  ok('the work reads on a line of its own', /└ banner tasarimi soruldu/.test(crewLine), crewLine);

  fs.writeFileSync(path.join(liveB, '_duyuru.json'), JSON.stringify({ text: 'T7 kapandi', at: Date.now() }));
  ok('the closing band reports what finished', /T7 Kapandi/.test(plain(banner(root, 'foot'))), plain(banner(root, 'foot')));
  ok('the opening band still reports what is running', /Danışman|Advisor/.test(plain(banner(root, 'head'))), plain(banner(root, 'head')));
  fs.rmSync(path.join(liveB, '_duyuru.json'), { force: true });
  fs.rmSync(path.join(liveB, 'a1.json'), { force: true });
  fs.rmSync(path.join(liveB, '_calls.json'), { force: true });
  ok('with nothing running the banner reports the work, not the profile again', !/Premium|Normal|Eco/.test(plain(banner(root))), plain(banner(root)));
  const quiet = fixture();
  ok('and with nothing to say at all it says nothing', banner(quiet) === '', banner(quiet));
  try {
    fs.rmSync(quiet, { recursive: true, force: true, maxRetries: 3 });
  } catch {}
  ok('bookkeeping files are not counted as agents', !/1 Ajan|2 Ajan/.test(plain(banner(root))), plain(banner(root)));
  fs.writeFileSync(path.join(liveB, 'a9.json'), JSON.stringify({ id: 'a9', role: 'scout', updated: new Date().toISOString(), files: [] }));
  ok('a seat with no model of its own is named from the tier table', /Sonnet|Opus|Haiku/.test(plain(banner(root))), plain(banner(root)));
  ok('no verb filler pads the seat', !/Atandı|Assigned|Yapılıyor|In Progress/i.test(plain(banner(root))), plain(banner(root)));
  fs.writeFileSync(path.join(liveB, 'a8.json'), JSON.stringify({ id: 'a8', role: 'scout', updated: new Date().toISOString(), files: [] }));
  ok('two of the same seat are counted, not listed twice', /2×/.test(plain(banner(root))), plain(banner(root)));
  fs.writeFileSync(path.join(liveB, 'a7.json'), JSON.stringify({ id: 'a7', role: 'Explore', updated: new Date().toISOString(), files: [] }));
  ok('a built-in agent with no row of its own is named from the session cell', /Kâşif|Explorer/i.test(plain(banner(root))) && /Opus|Sonnet|Haiku/.test(plain(banner(root))), plain(banner(root)));

  fs.writeFileSync(path.join(liveB, '_calls.json'), JSON.stringify([
    { role: 'scout', model: '', task: 'lisans dosyalari tarandi', at: Date.now() - 1000 },
    { role: 'Explore', model: '', task: 'rozet metni arandi', at: Date.now() },
  ]));
  const busy = plain(banner(root));
  ok('with several seats the banner still says what for', /rozet metni arandi/.test(busy), busy);
  ok('each distinct task is named once', /lisans dosyalari tarandi/.test(busy), busy);
  ok('every job gets a branch line of its own', busy.split(String.fromCharCode(10)).filter((l) => l.startsWith('└')).length === 2, busy);
  ok('the seat is named before the work, in that order', busy.indexOf(String.fromCharCode(10)) < busy.indexOf('rozet metni arandi'), busy);
  ok('the seat line carries the mark, the work lines do not', busy.split(String.fromCharCode(10))[0].startsWith('**Teknesyum** ▸ '), busy);
  fs.writeFileSync(path.join(liveB, '_calls.json'), JSON.stringify([{ role: 'scout', model: 'sonnet', task: 'tier effort probe', at: Date.now() }]));
  fs.writeFileSync(path.join(liveB, 'a6.json'), JSON.stringify({ id: 'a6', role: 'scout', updated: new Date().toISOString(), files: [] }));
  const tiered = plain(banner(root));
  ok('a model with no effort beside it borrows the effort its own row says', /Sonnet-Medium/.test(tiered), tiered);
  fs.writeFileSync(path.join(liveB, '_calls.json'), JSON.stringify([{ role: 'scout', model: 'haiku', task: 'tier effort probe', at: Date.now() }]));
  const odd = plain(banner(root));
  ok('a model the row does not name gets no invented effort', /Haiku(?!-)/.test(odd) && !/Haiku-/.test(odd), odd);
  fs.rmSync(path.join(liveB, 'a6.json'), { force: true });

  writeContract(root, 'K3', '# K3 rozet metni duzeni\nstatus: active\nowns: [src/ok.js]\nverify:\n  - node -e "process.exit(0)"\n');
  fs.rmSync(path.join(liveB, 'a8.json'), { force: true });
  fs.writeFileSync(path.join(liveB, 'a9.json'), JSON.stringify({ id: 'a9', role: 'scout', contract: 'K3', updated: new Date().toISOString(), files: [] }));
  const bound = plain(banner(root));
  ok('a contract-bound seat answers with the contract goal', /K3 rozet metni duzeni/.test(bound), bound);
  ok('the contract goal outranks the spawn description', !/lisans dosyalari/.test(bound), bound);
  ok('the seat line names the contract it is bound to', bound.split(String.fromCharCode(10))[0].indexOf('K3') > 0, bound);

  run(process.execPath, [WATCH], {
    cwd: root,
    input: JSON.stringify({
      hook_event_name: 'PreToolUse', tool_name: 'Agent', agent_id: 'spawner', cwd: root,
      tool_input: { subagent_type: 'scout', description: 'goal probe', prompt: 'Contract: .claude/relay/contracts/K3.md\nread it first' },
    }),
  });
  const logged = JSON.parse(fs.readFileSync(path.join(liveB, '_calls.json'), 'utf8'));
  ok('the spawn log carries the contract named in the prompt', logged.some((c) => c.contract === 'K3'), JSON.stringify(logged));
  fs.writeFileSync(path.join(liveB, 'a9.json'), JSON.stringify({ id: 'a9', role: 'scout', updated: new Date().toISOString(), files: [] }));
  const viaCall = plain(banner(root));
  ok('an unbound seat still gets the goal through the spawn log', /K3 rozet metni duzeni/.test(viaCall), viaCall);
  fs.rmSync(path.join(liveB, 'spawner.json'), { force: true });
  fs.rmSync(path.join(root, '.claude', 'relay', 'contracts', 'K3.md'), { force: true });

  fs.writeFileSync(path.join(liveB, 'a8.json'), JSON.stringify({ id: 'a8', role: 'scout', updated: new Date().toISOString(), files: [] }));
  fs.writeFileSync(path.join(liveB, '_calls.json'), JSON.stringify([
    { role: 'scout', model: '', task: 'x'.repeat(60), at: Date.now() - 2000 },
    { role: 'scout', model: '', task: 'y'.repeat(60), at: Date.now() - 1000 },
    { role: 'Explore', model: '', task: 'z'.repeat(60), at: Date.now() },
  ]));
  const crowded = plain(banner(root));
  ok('a crowded banner stays inside the cap', crowded.split(String.fromCharCode(10)).every((l) => l.length <= 120), crowded);
  ok('a crowded banner still stops at three lines', crowded.split(String.fromCharCode(10)).length <= 3, crowded);
  ok('the seats survive the trim, the tasks give way', /Kâşif|Explorer|Gözcü|Scout|İzci/i.test(crowded.split(String.fromCharCode(10))[0]), crowded);
  fs.rmSync(path.join(liveB, '_calls.json'), { force: true });
  for (const x of ['a7', 'a8', 'a9']) fs.rmSync(path.join(liveB, x + '.json'), { force: true });
  for (const x of parked) fs.renameSync(path.join(liveB, x + '.parked'), path.join(liveB, x));

  const detail = lib.liveDir(path.join(root, '.claude', 'relay'));
  const parked2 = fs.readdirSync(detail).filter((x) => x.endsWith('.json'));
  for (const x of parked2) fs.renameSync(path.join(detail, x), path.join(detail, x + '.parked'));
  writeContract(root, 'K4', '# K4 ikinci tur' + String.fromCharCode(10) + 'status: active' + String.fromCharCode(10) + 'round: 2' + String.fromCharCode(10) + 'owns: [src/ok.js]' + String.fromCharCode(10) + 'verify:' + String.fromCharCode(10) + '  - node -e "process.exit(0)"' + String.fromCharCode(10));
  fs.writeFileSync(path.join(detail, 'd1.json'), JSON.stringify({ id: 'd1', role: 'builder', contract: 'K4', steps: 12, files: ['core/scripts/statusline.js'], updated: new Date().toISOString() }));
  const deep = plain(banner(root));
  ok('a second round is named on the seat line', / R2/.test(deep.split(String.fromCharCode(10))[0]), deep);
  ok('the work line counts the steps that seat took', /12/.test(deep), deep);
  ok('the work line names the file last touched, bare', /statusline\.js/.test(deep) && !/core\/scripts\/statusline/.test(deep), deep);
  ok('a working seat is not flagged as quiet', !/sessiz|quiet/i.test(deep), deep);

  fs.writeFileSync(path.join(detail, 'd1.json'), JSON.stringify({ id: 'd1', role: 'builder', contract: 'K4', steps: 12, files: [], updated: new Date(Date.now() - 4 * 60 * 1000).toISOString() }));
  const hush = plain(banner(root));
  ok('a seat that has gone quiet says how long', /4 dk sessiz|4 min quiet/.test(hush), hush);
  fs.rmSync(path.join(detail, 'd1.json'), { force: true });
  fs.rmSync(path.join(root, '.claude', 'relay', 'contracts', 'K4.md'), { force: true });
  for (const x of parked2) fs.renameSync(path.join(detail, x + '.parked'), path.join(detail, x));

  const many = lib.liveDir(path.join(root, '.claude', 'relay'));
  for (let i = 0; i < 60; i++) fs.writeFileSync(path.join(many, 'bulk' + i + '.json'), JSON.stringify({ id: 'b' + i, role: 'builder', ended: '2020-01-01' }));
  const t0 = Date.now();
  banner(root);
  const spent = Date.now() - t0;
  for (let i = 0; i < 60; i++) fs.rmSync(path.join(many, 'bulk' + i + '.json'), { force: true });
  ok('the banner does not scan every record', spent < 40, spent + 'ms');
}

function testMessageDisplay(root) {
  const HOOK = path.join(CORE, 'hooks', 'notice.js');
  const call = (j) => run(process.execPath, [HOOK], { cwd: root, input: JSON.stringify(j), env: { ...process.env, NO_COLOR: '1' } });
  const ev = (over) => Object.assign({ hook_event_name: 'MessageDisplay', turn_id: 't1', message_id: 'm1', index: 0, final: true, delta: 'son satir.', cwd: root }, over);

  const mid = call(ev({ final: false, index: 2 }));
  ok('a non-final flush says nothing', mid.stdout.trim() === '', mid.stdout);
  ok('a non-final flush still exits 0', mid.status === 0);

  const other = call(ev({ hook_event_name: 'Stop' }));
  ok('another event says nothing', other.stdout.trim() === '', other.stdout);

  const out = call(ev({}));
  let p2 = null;
  try {
    p2 = JSON.parse(out.stdout);
  } catch {}
  ok('the final flush emits parsable JSON', p2 !== null, out.stdout);
  const spec = p2 && p2.hookSpecificOutput;
  ok('it names the MessageDisplay event', spec && spec.hookEventName === 'MessageDisplay');
  ok('it answers with displayContent', spec && typeof spec.displayContent === 'string');
  ok('it writes no model context', out.stdout.indexOf('additionalContext') === -1 && out.stdout.indexOf('systemMessage') === -1, out.stdout);

  const body = (spec && spec.displayContent) || '';
  ok('the delta is kept', body.indexOf('son satir.') !== -1, body);
  ok('the notice is added, not substituted', body.indexOf('son satir.') !== -1 && body.indexOf('Teknesyum') !== -1, body);
  const NL = String.fromCharCode(10);
  ok('a blank line separates the notice', body.indexOf('son satir.' + NL + NL + '**Teknesyum**') > 0, JSON.stringify(body));
  ok('a single flush is framed above and below', body.split('**Teknesyum**').length === 3, body);
  const first = JSON.parse(call(ev({ index: 0, final: false, delta: 'ilk parca.' })).stdout).hookSpecificOutput.displayContent;
  ok('the first flush carries the notice on top', first.startsWith('**Teknesyum**'), first);
  ok('the first flush keeps its delta below', first.trim().endsWith('ilk parca.'), first);
  const last = JSON.parse(call(ev({ index: 4, final: true, delta: 'son parca.' })).stdout).hookSpecificOutput.displayContent;
  ok('a later final flush carries it below only', last.startsWith('son parca.') && last.split('**Teknesyum**').length === 2, last);
  ok('the notice is the last line', body.trim().split(String.fromCharCode(10)).pop().startsWith('**Teknesyum**'), body);
  ok('the notice is also the first line', body.split(String.fromCharCode(10))[0].startsWith('**Teknesyum**'), body);

  const empty = call(ev({ delta: '' }));
  const eb = JSON.parse(empty.stdout).hookSpecificOutput.displayContent;
  ok('an empty delta yields no leading blank line', eb.startsWith('**Teknesyum**'), JSON.stringify(eb));
  ok('an empty delta is not doubled', eb.split('**Teknesyum**').length === 2, JSON.stringify(eb));

  const outside = call(ev({ cwd: os.tmpdir() }));
  ok('the notice is silent outside a relay', outside.stdout.trim() === '', outside.stdout);

  const junk = run(process.execPath, [HOOK], { cwd: root, input: 'not json' });
  ok('malformed input is survived', junk.status === 0 && junk.stdout.trim() === '', junk.stdout);

  const NLc = String.fromCharCode(10);
  const kept = JSON.parse(call(ev({ index: 0, final: false, delta: 'yarim kelime ' })).stdout).hookSpecificOutput.displayContent;
  ok('a head flush keeps its trailing space', kept.endsWith('yarim kelime '), JSON.stringify(kept));
  const wrapped = JSON.parse(call(ev({ index: 0, final: false, delta: 'satir' + NLc })).stdout).hookSpecificOutput.displayContent;
  ok('a head flush keeps its trailing newline', wrapped.endsWith('satir' + NLc), JSON.stringify(wrapped));

  const lateEmpty = JSON.parse(call(ev({ index: 4, final: true, delta: '' })).stdout).hookSpecificOutput.displayContent;
  ok('a late empty final flush leads with the notice', lateEmpty.startsWith('**Teknesyum**'), JSON.stringify(lateEmpty));
  ok('a late empty final flush is one line', lateEmpty.indexOf(NLc) === -1, JSON.stringify(lateEmpty));

  const framed = JSON.parse(call(ev({ index: 0, final: true, delta: 'x' })).stdout).hookSpecificOutput.displayContent;
  const bands = framed.split(NLc).filter((l) => l.startsWith('**Teknesyum**'));
  ok('both bands read the same', bands.length === 2 && bands[0] === bands[1], bands.join(' | '));

  const src = fs.readFileSync(HOOK, 'utf8');
  ok('the notice hook delegates its line', /banner\(cwd, phase\)/.test(src));
  ok('the notice hook tells the two bands apart', /'head'/.test(src) && /'foot'/.test(src));
  ok('the notice hook keeps no debug log', !/TKNSYM|appendFileSync/.test(src), 'instrumentation left behind');

  const hooks = JSON.parse(fs.readFileSync(path.join(CORE, 'hooks', 'hooks.json'), 'utf8')).hooks;
  ok('the notice is wired to MessageDisplay', Array.isArray(hooks.MessageDisplay) && /notice\.js/.test(hooks.MessageDisplay[0].hooks[0].command));
  const elsewhere = Object.keys(hooks).filter((e) => e !== 'MessageDisplay' && hooks[e].some((g) => g.hooks.some((x) => /notice\.js/.test(x.command))));
  ok('the notice runs on no other event', elsewhere.length === 0, elsewhere.join(','));
}

function testNotice(root) {
  const lib = require(path.join(CORE, 'hooks', 'lib.js'));
  const relay = path.join(root, '.claude', 'relay');
  const live = lib.liveDir(relay);
  fs.mkdirSync(live, { recursive: true });
  const file = path.join(live, '_duyuru.json');

  fs.rmSync(file, { force: true });
  ok('an empty notice reads as nothing', lib.getNotice(relay) === '');

  ok('a notice is written', lib.setNotice(relay, 'builder bitti') === true);
  ok('the notice lands in live/', fs.existsSync(file));
  ok('the notice reads back', lib.getNotice(relay) === 'builder bitti');

  ok('the same notice is not rewritten', lib.setNotice(relay, 'builder bitti') === false);
  ok('a changed notice is written', lib.setNotice(relay, 'T7 kapandi') === true);
  ok('the newest notice wins', lib.getNotice(relay) === 'T7 kapandi');

  const long = 'x'.repeat(200);
  lib.setNotice(relay, long);
  ok('a notice is capped at 80 chars', lib.getNotice(relay).length === 80);

  const stale = JSON.parse(fs.readFileSync(file, 'utf8'));
  stale.at = Date.now() - 10 * 60 * 1000;
  fs.writeFileSync(file, JSON.stringify(stale));
  ok('a stale notice expires', lib.getNotice(relay) === '');

  lib.setNotice(relay, 'builder bitti');
  const line = require(path.join(CORE, 'scripts', 'statusline.js'))
    .summary(root);
  ok('the statusline prints the notice', line.includes('builder bitti'), line);
  ok('the statusline carries the brand mark', line.startsWith('Teknesyum'), line);

  const notice = fs.readFileSync(file, 'utf8');
  ok('the notice file is not a hook payload', !/systemMessage|additionalContext/.test(notice));

  const watch = fs.readFileSync(path.join(CORE, 'hooks', 'watch.js'), 'utf8');
  ok('watch.js announces a finished agent', /SubagentStop' && rec\.role\) setNotice/.test(watch));

  const HOOKS = JSON.parse(fs.readFileSync(path.join(CORE, 'hooks', 'hooks.json'), 'utf8')).hooks;
  ok('the failure event is hooked', !!HOOKS.PostToolUseFailure, Object.keys(HOOKS).join(', '));
  ok('the failure event goes to the watcher', JSON.stringify(HOOKS.PostToolUseFailure).includes('watch.js'));
  const contract = fs.readFileSync(path.join(CORE, 'scripts', 'contract.js'), 'utf8');
  ok('contract.js announces a closed contract', contract.split('setNotice(').length - 1 === 2, contract.split('setNotice(').length - 1);

  fs.rmSync(file, { force: true });
}

function testTitle() {
  const hooks = JSON.parse(fs.readFileSync(path.join(CORE, 'hooks', 'hooks.json'), 'utf8')).hooks;
  const wired = Object.keys(hooks).filter((ev) =>
    hooks[ev].some((g) => g.hooks.some((x) => /title\.js/.test(x.command)))
  );
  ok('the retired title hook is wired nowhere', wired.length === 0, wired.join(','));
  ok('the retired title hook is out of the tree', !fs.existsSync(path.join(CORE, 'hooks', 'title.js')));
}

function testLanguage(root) {
  const { t } = require(path.join(CORE, 'hooks', 'lib.js'));
  ok('an unknown key returns itself', t('no.such.key') === 'no.such.key');

  const table = JSON.parse(fs.readFileSync(path.join(CORE, 'strings.json'), 'utf8'));
  const keys = Object.keys(table);
  ok('every string has an English original', keys.every((k) => typeof table[k].en === 'string' && table[k].en.length));
  ok('the table is small', JSON.stringify(table).length < 8000, String(JSON.stringify(table).length));

  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-lang-'));
  fs.mkdirSync(path.join(home, 'teknesyum'), { recursive: true });
  const setLang = (v) =>
    fs.writeFileSync(path.join(home, 'teknesyum', 'config.json'), JSON.stringify(v === null ? {} : { lang: v }));
  const env = (extra) => ({ ...process.env, CLAUDE_CONFIG_DIR: home, NO_COLOR: '1', ...extra });
  const statusline = () =>
    run(process.execPath, [STATUSLINE], { cwd: root, input: JSON.stringify({ workspace: { current_dir: root } }), env: env() }).stdout;
  const ask = () =>
    JSON.parse(run(process.execPath, [path.join(CORE, 'scripts', 'setup.js'), '--check'], { cwd: root, env: env() }).stdout)
      .missing.map((m) => m.ask)
      .join(' | ');

  setLang(null);
  ok('English is the default', /open|agents|contracts/.test(statusline()), statusline());

  setLang('tr');
  ok('the statusline follows the language', /açık|ajan|sözleşme/.test(statusline()), statusline());
  ok('setup asks in the chosen language', /çalsın|bekletilsin/.test(ask()), ask());

  setLang('tr');
  const applied = run(process.execPath, [path.join(CORE, 'scripts', 'setup.js'), '--apply', '--lang', 'tr', '--notify', 'no', '--research', 'no'], { cwd: root, env: env() }).stdout;
  const rows = applied.split(String.fromCharCode(10)).filter((l) => l.startsWith('  ') && l.trim());
  ok('every summary label is padded clear of its value', rows.every((l) => /^ {2}\S.*\s{2,}\S/.test(l)), JSON.stringify(rows));
  ok('the summary is translated', /kuruldu/.test(applied), applied);

  const cfgPath = path.join(home, 'teknesyum', 'config.json');
  ok('with no repo in sight the core row stays empty', !(JSON.parse(fs.readFileSync(cfgPath, 'utf8')).coreRepo), applied);
  const repoRoot = path.resolve(CORE, '..');
  run(process.execPath, [path.join(CORE, 'scripts', 'setup.js'), '--apply'], { cwd: root, env: env({ TEKNESYUM_CORE: repoRoot }) });
  ok('setup records the core repo it found', JSON.parse(fs.readFileSync(cfgPath, 'utf8')).coreRepo === repoRoot.replace(/\\/g, '/'), fs.readFileSync(cfgPath, 'utf8'));

  setLang(null);
  const lone = path.join(root, 'lone-core');
  fs.cpSync(CORE, lone, { recursive: true });
  const spool = run(process.execPath, [path.join(lone, 'scripts', 'log.js'), 'write', '--title', 'silent fall', '--symptom', 's'], { cwd: root, env: env() }).stdout;
  ok('a log with no repo says where it landed', /fallback spool/.test(spool), spool);

  setLang('zz');
  ok('an unknown language falls back to English', /open|agents|contracts/.test(statusline()), statusline());

  const skill = fs.readFileSync(path.join(CORE, 'skills', 'relay', 'SKILL.md'), 'utf8');
  ok('the contract language is a setting, not a constant', /contractLang/.test(skill), 'SKILL.md');
  ok('the skill tells T0 to stamp the contract', /lang: <code>/.test(skill), 'SKILL.md');
  for (const f of fs.readdirSync(path.join(CORE, 'roles'))) {
    const body = fs.readFileSync(path.join(CORE, 'roles', f), 'utf8');
    ok(f + ' follows the contract language', /contract's `lang:` field/.test(body), f);
  }

  const modelFacing = ['guard.js', 'cue.js', 'seal.js', 'schema.js', 'watch.js'];
  for (const f of modelFacing) {
    const body = fs.readFileSync(path.join(CORE, 'hooks', f), 'utf8');
    ok(f + ' stays English - it is read by the model', !/t\(/.test(body.replace(/\w+t\(/g, '')), f);
  }
}

function testNoContextWrites() {
  const watch = path.join(CORE, 'hooks', 'watch.js');
  const r = run(process.execPath, [watch], {
    cwd: process.cwd(),
    input: JSON.stringify({ hook_event_name: 'PostToolUse', tool_name: 'Read', cwd: process.cwd() }),
  });
  ok('the watcher writes nothing to context', r.stdout.trim() === '', r.stdout);

  const rf = run(process.execPath, [watch], {
    cwd: process.cwd(),
    input: JSON.stringify({ hook_event_name: 'PostToolUseFailure', tool_name: 'Bash', error: 'exit 1', cwd: process.cwd() }),
  });
  ok('a failed tool writes nothing to context either', rf.stdout.trim() === '', rf.stdout);

  const files = fs
    .readdirSync(path.join(CORE, 'hooks'))
    .filter((f) => f.endsWith('.js'))
    .map((f) => path.join(CORE, 'hooks', f));
  for (const f of files) {
    if (path.basename(f) === 'notify.js') continue;
    const body = fs.readFileSync(f, 'utf8');
    ok('no additionalContext in ' + path.basename(f), !body.includes('additionalContext'));
    ok('no systemMessage in ' + path.basename(f), !body.includes('systemMessage'));
  }

  const CUE = path.join(CORE, 'hooks', 'cue.js');
  const cue = (j) => run('node', [CUE], { input: JSON.stringify(j) }).stdout;

  for (const ev of ['PreToolUse', 'PostToolUse', 'Stop', 'SubagentStop', 'Notification']) {
    ok('cue is silent on ' + ev, cue({ hook_event_name: ev, cwd: os.tmpdir() }) === '');
  }
  ok(
    'cue is silent on an ordinary prompt',
    cue({ hook_event_name: 'UserPromptSubmit', prompt: 'blog yazalim mi' }) === ''
  );
  const asked = cue({ hook_event_name: 'UserPromptSubmit', prompt: 'tamam log yaz' });
  ok('cue answers the log phrase', asked.includes('log.js'));
  ok('cue stays under 200 chars', asked.length > 0 && asked.length <= 200, String(asked.length));
  ok(
    'cue is silent when there is no relay',
    cue({ hook_event_name: 'SessionStart', cwd: os.tmpdir() }) === ''
  );
  ok(
    'cue no longer answers PostCompact, whose stdout never reaches the model',
    cue({ hook_event_name: 'PostCompact', cwd: process.cwd() }) === ''
  );
  ok('the log phrase survives Turkish inflection', cue({ hook_event_name: 'UserPromptSubmit', prompt: 'bunu log yazalim' }).includes('log.js'));

  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-cue-'));
  const relay = path.join(home, '.claude', 'relay');
  const live = path.join(relay, 'live');
  fs.mkdirSync(path.join(relay, 'contracts'), { recursive: true });
  fs.mkdirSync(live, { recursive: true });
  const start = { hook_event_name: 'SessionStart', cwd: home };

  ok('cue is silent while the relay is empty', cue(start) === '');

  fs.writeFileSync(path.join(relay, 'contracts', 'T7.md'), 'goal: rebuild the token store');
  const one = cue(start);
  ok('cue names the open contract', one.includes('T7'), one);
  ok('cue points at the relay first', one.startsWith('read .claude/relay/'), one);
  ok('cue carries no contract body', !one.includes('token store'), one);

  fs.writeFileSync(path.join(live, 'a.json'), JSON.stringify({ role: 'builder', updated: new Date().toISOString() }));
  ok('cue names the live role', cue(start).includes('builder'));

  fs.writeFileSync(path.join(live, 'b.json'), JSON.stringify({ role: 'auditor', ended: '2026-01-01T00:00:00.000Z' }));
  ok('an ended agent is not called live', !cue(start).includes('auditor'));

  const old = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
  fs.writeFileSync(path.join(live, 'c.json'), JSON.stringify({ role: 'planner', updated: old }));
  ok('a stale record does not speak forever', !cue(start).includes('planner'));

  for (let i = 0; i < 12; i++) {
    fs.writeFileSync(path.join(relay, 'contracts', 'LONG' + i + '.md'), 'x');
    fs.writeFileSync(path.join(live, 'r' + i + '.json'), JSON.stringify({ role: 'ui-builder-' + i, updated: new Date().toISOString() }));
  }
  const full = cue(start);
  ok('a crowded relay stays under the cap', full.length <= 200, String(full.length));
  ok('the instruction survives truncation', full.startsWith('read .claude/relay/'), full);
}

function testScaffold() {
  const SCAFFOLD = path.join(CORE, 'scripts', 'scaffold.js');
  const cfg = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-pref-'));
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-repo-'));
  const prefs = path.join(cfg, 'teknesyum', 'prefs');
  fs.mkdirSync(path.join(prefs, 'assets'), { recursive: true });
  fs.writeFileSync(path.join(prefs, 'signature.html'), '<div>SIGNED <img src="assets/mark.svg"></div>');
  fs.writeFileSync(path.join(prefs, 'assets', 'mark.svg'), '<svg/>');
  fs.writeFileSync(path.join(repo, 'package.json'), JSON.stringify({ name: 'x' }, null, 2));
  fs.writeFileSync(path.join(repo, 'README.md'), '# x');
  fs.writeFileSync(path.join(repo, 'README.tr.md'), '# x');

  const env = { ...process.env, CLAUDE_CONFIG_DIR: cfg };
  const call = (args) => run(process.execPath, [SCAFFOLD, ...args], { cwd: repo, env });

  const lic = call(['license']);
  const licFile = path.join(repo, 'LICENSE');
  const text = fs.existsSync(licFile) ? fs.readFileSync(licFile, 'utf8') : '';
  ok('scaffold writes the license text', lic.status === 0 && text.includes('GNU AFFERO GENERAL PUBLIC LICENSE'), lic.stderr);
  ok('the license text is not summarised', text.length > 30000);
  ok(
    'scaffold sets the license field',
    JSON.parse(fs.readFileSync(path.join(repo, 'package.json'), 'utf8')).license === 'AGPL-3.0-or-later'
  );
  ok('scaffold refuses to overwrite a license', call(['license']).status !== 0);

  const sig = call(['signature']);
  ok('scaffold writes the signature block', sig.status === 0 && fs.readFileSync(path.join(repo, 'README.md'), 'utf8').includes('SIGNED'), sig.stderr);
  ok('scaffold copies the signature assets', fs.existsSync(path.join(repo, 'assets', 'mark.svg')));
  call(['signature']);
  ok('the signature is written once', fs.readFileSync(path.join(repo, 'README.md'), 'utf8').split('SIGNED').length === 2);

  const link = call(['langlink']);
  const en = fs.readFileSync(path.join(repo, 'README.md'), 'utf8');
  const tr = fs.readFileSync(path.join(repo, 'README.tr.md'), 'utf8');
  ok('scaffold links the two languages', link.status === 0 && en.includes('README.tr.md') && tr.includes('README.md'), link.stderr);
  ok('the language line comes first', en.trimStart().startsWith('<!-- lang -->'));
}

const ROLES = path.join(CORE, 'roles');
const MODELS = ['haiku', 'sonnet', 'opus'];
const EFFORTS = ['low', 'medium', 'high'];

const TABLE = {
  t0: { eco: 'sonnet', normal: 'opus', premium: 'opus' },
  planner: { eco: 'sonnet/medium', normal: 'opus/medium', premium: 'opus/high' },
  builder: { eco: 'sonnet/low', normal: 'sonnet/medium', premium: 'opus/medium' },
  'ui-builder': { eco: 'sonnet/low', normal: 'sonnet/medium', premium: 'opus/medium' },
  scribe: { eco: 'haiku/low', normal: 'haiku/low', premium: 'sonnet/low' },
  scout: { eco: 'haiku/low', normal: 'sonnet/low', premium: 'sonnet/medium' },
  auditor: { eco: 'opus/medium', normal: 'opus/medium', premium: 'opus/high' },
  advisor: { eco: 'opus/medium', normal: 'off', premium: 'fable/medium' },
};

const PROFILES = ['eco', 'normal', 'premium'];

function cellOf(t) {
  return t.model + (t.effort ? '/' + t.effort : '');
}

function testTier(root) {
  const { tier, tiers, roleBase, roleRow, MODEL_RANK, EFFORT_RANK } = require(CONTRACT);
  const T = tiers();

  ok('the table lives in tiers.json, not in prose', fs.existsSync(path.join(CORE, 'tiers.json')));
  ok('every approved row is in the data file', Object.keys(TABLE).every((r) => !!T.cells[r]), Object.keys(T.cells).join(', '));
  ok('the data file adds no row of its own', Object.keys(T.cells).every((r) => !!TABLE[r]), Object.keys(T.cells).join(', '));

  let cells = 0;
  for (const row of Object.keys(TABLE)) {
    for (const p of PROFILES) {
      cells += 1;
      const t = tier(row, { profile: p });
      if (TABLE[row][p] === 'off') {
        ok('cell ' + row + ' x ' + p + ' does not open', t && !!t.blocked && !t.model, t && t.blocked);
        ok('cell ' + row + ' x ' + p + ' names itself off', t && t.cell === 'off', t && t.cell);
        continue;
      }
      ok('cell ' + row + ' x ' + p + ' is ' + TABLE[row][p], t && cellOf(t) === TABLE[row][p], t && cellOf(t));
      ok('cell ' + row + ' x ' + p + ' names its own cell', t && t.cell === TABLE[row][p], t && t.cell);
    }
  }
  ok('all 24 cells were asserted', cells === 24, String(cells));

  ok('a search subagent is haiku/low in every profile', T.subagent.model === 'haiku' && T.subagent.effort === 'low');
  const tiersRaw = fs.readFileSync(path.join(CORE, 'tiers.json'), 'utf8');
  ok('the council is gone from the table', T.council === undefined && T.councilMemberOverride === undefined && !/council/i.test(tiersRaw));
  ok('the fable pass is gone', T.councilFablePass === undefined && !/councilFablePass/.test(tiersRaw));
  ok('the second-opinion rewrite is gone', T.secondOpinion === undefined && !/secondOpinion/.test(tiersRaw));
  ok(
    'every model in the table has a rung above it',
    T.models.every((m) => !!T.advisorLadder[m]),
    JSON.stringify(T.advisorLadder)
  );
  ok('the ladder climbs one rung', T.advisorLadder.sonnet === 'opus/medium' && T.advisorLadder.opus === 'fable/medium');
  ok('the ladder defaults to medium effort', Object.values(T.advisorLadder).filter((c) => /\/medium$/.test(c)).length >= 3, JSON.stringify(T.advisorLadder));
  ok('the normal profile runs no advisor', T.cells.advisor.normal === 'off');
  ok('the model gap is on', T.advisorModelGap === true);
  ok(
    'the premium advisor default names the two builder rows',
    T.advisorDefault.premium.perContract === 1 &&
      T.advisorDefault.premium.onContractOpen.join(',') === 'builder,ui-builder',
    JSON.stringify(T.advisorDefault)
  );

  const { tier: tierOf, council: goneCouncil } = require(CONTRACT);
  ok('contract.js no longer exports a council', goneCouncil === undefined);
  for (const prof of T.profiles) {
    for (const askerModel of T.models) {
      const r = tierOf('advisor', { profile: prof, asker: askerModel });
      if (T.cells.advisor[prof] === 'off') {
        ok('on ' + prof + ' the advisor does not open at all', !!r.blocked && !r.model, JSON.stringify(r.blocked));
        continue;
      }
      ok(
        'on ' + prof + ' a ' + askerModel + ' asker climbs above ' + askerModel,
        askerModel === 'fable' ? r.model === 'fable' : r.model !== askerModel,
        JSON.stringify({ model: r.model, blocked: r.blocked })
      );
    }
  }
  ok('an opus asker climbs to fable where the advisor runs', tierOf('advisor', { profile: 'premium', asker: 'opus' }).model === 'fable' && tierOf('advisor', { profile: 'eco', asker: 'opus' }).model === 'fable');
  ok('the step states its reason', /the asker runs opus/.test(tierOf('advisor', { profile: 'eco', asker: 'opus' }).reasons.join(' ')));
  ok('with no asker the advisor falls back to the cell', tierOf('advisor', { profile: 'eco' }).model === 'opus');
  ok('the advisor defaults to medium effort', tierOf('advisor', { profile: 'premium', asker: 'opus' }).effort === 'medium');
  ok('t0 may lift the effort to high', tierOf('advisor', { profile: 'premium', asker: 'opus', effort: 'high' }).effort === 'high');

  const files = fs.readdirSync(ROLES).filter((f) => f.endsWith('.md'));
  ok('the scribe role file exists', files.includes('scribe.md'), files.join(', '));
  for (const f of files) {
    const role = f.replace(/\.md$/, '');
    const body = fs.readFileSync(path.join(ROLES, f), 'utf8');
    const declared = (body.match(/^tier:[ \t]*(\S+)/im) || [])[1];
    ok(role + ' declares a tier row', !!declared, body.slice(0, 80));
    ok(role + ' names a row that exists', !!TABLE[declared], String(declared));
    ok(role + ' carries no stale model line', !/^model:/im.test(body));
    ok(role + ' carries no stale effort line', !/^effort:/im.test(body));
    ok(role + ' resolves through the row it declares', roleRow(role) === declared, roleRow(role));
  }

  ok('ui-builder resolves without a role file in core', roleRow('ui-builder') === 'ui-builder');
  ok('roleBase reports the cell it read', JSON.stringify(roleBase('builder', 'premium')) === JSON.stringify({ row: 'builder', profile: 'premium', model: 'opus', effort: 'medium' }));
  ok('an unknown role resolves to nothing', tier('worker-lite', { profile: 'normal' }) === null);

  ok('signal 1: one failure changes nothing', cellOf(tier('builder', { profile: 'normal', repeatFail: 1 })) === 'sonnet/medium');
  ok('signal 1: the second failure raises the model, we do not wait for a third', tier('builder', { profile: 'normal', repeatFail: 2 }).model === 'opus');
  ok('signal 2: round 3 raises the builder model', tier('builder', { profile: 'normal', round: 3 }).model === 'opus');
  ok('signal 2: round 2 does not', tier('builder', { profile: 'normal', round: 2 }).model === 'sonnet');
  ok('signal 2 applies to ui-builder too', tier('ui-builder', { profile: 'eco', round: 3 }).model === 'opus');
  ok('signal 3: round 4 requires the advisor', tier('builder', { profile: 'normal', round: 4 }).advisorRequired === true);
  ok('signal 3: round 3 does not require it', tier('builder', { profile: 'normal', round: 3 }).advisorRequired === false);

  const irr = require(path.join(CORE, 'scripts', 'risk.js')).irreversible;
  ok('signal 4: a migration path is irreversible', irr(['db/migrations/003.sql'], []).hit);
  ok('signal 4: a history rewrite command is irreversible', irr([], ['git push --force origin main']).hit);
  ok('signal 4: ordinary work is not', !irr(['src/ok.js'], ['node --test']).hit);
  ok('signal 4: the tier records it', tier('builder', { profile: 'eco', irreversible: true }).notes.join(' ').includes('auditor'));

  ok('risk high raises an eco builder to opus, not to sonnet/high', cellOf(tier('builder', { profile: 'eco', risk: 'high' })) === 'opus/medium');
  ok('a risk-raised builder pierces the eco ceiling', tier('builder', { profile: 'eco', risk: 'high' }).pierced === true);
  ok('the auditor pierces the eco ceiling', tier('auditor', { profile: 'eco' }).pierced === true && tier('auditor', { profile: 'eco' }).model === 'opus');
  ok('the advisor pierces the eco ceiling', tier('advisor', { profile: 'eco' }).pierced === true && tier('advisor', { profile: 'eco' }).model === 'opus');
  ok('an unraised role does not pierce it', tier('planner', { profile: 'eco', model: 'opus' }).model === 'sonnet');
  ok('the capped role says why', /caps the model/.test(tier('planner', { profile: 'eco', model: 'opus' }).reasons.join(' ')));
  ok('normal and premium leave the grid alone', tier('planner', { profile: 'normal' }).pierced === false);

  ok('an opus asker on premium gets fable', cellOf(tier('advisor', { profile: 'premium', asker: 'opus' })) === 'fable/medium');
  ok('an opus asker on premium is not blocked', !tier('advisor', { profile: 'premium', asker: 'opus' }).blocked);
  ok('a sonnet asker still gets opus', tier('advisor', { profile: 'eco', asker: 'sonnet' }).model === 'opus');
  ok('a sonnet asker is not blocked', !tier('advisor', { profile: 'eco', asker: 'sonnet' }).blocked);
  ok('a normal opus asker is told the profile runs no advisor', /runs no advisor/.test(String(tier('advisor', { profile: 'normal', asker: 'opus' }).blocked)));
  ok('an eco opus asker climbs to fable/medium', cellOf(tier('advisor', { profile: 'eco', asker: 'opus' })) === 'fable/medium');
  ok('a premium opus asker climbs to fable/medium', cellOf(tier('advisor', { profile: 'premium', asker: 'opus' })) === 'fable/medium');
  ok('a premium builder is told the advisor opens with it', tier('builder', { profile: 'premium' }).notes.join(' ').includes('opens the advisor alongside'));
  ok('a premium scribe is not', !tier('scribe', { profile: 'premium' }).notes.join(' ').includes('advisor'));

  ok('xhigh is not granted automatically', tier('builder', { profile: 'premium', effort: 'xhigh' }).effort === 'medium');
  ok('xhigh is granted on an explicit user request', tier('builder', { profile: 'premium', effort: 'xhigh', userAsked: true }).effort === 'xhigh');

  for (const row of Object.keys(TABLE)) {
    for (const p of PROFILES) {
      if (TABLE[row][p] === 'off') continue;
      const [bm, be] = TABLE[row][p].split('/');
      for (const m of MODELS) {
        for (const e of EFFORTS) {
          for (const r of ['low', 'high', '']) {
            for (const rd of [0, 3, 4]) {
              const t = tier(row, { model: m, effort: e, risk: r, round: rd, profile: p });
              const floorModel = MODEL_RANK[t.model] >= MODEL_RANK[bm];
              const floorEffort = !be || EFFORT_RANK[t.effort] >= EFFORT_RANK[be];
              ok(
                'no route goes below the cell: ' + row + ' x ' + p + ' asked ' + m + '/' + e + ' risk ' + (r || 'none') + ' round ' + rd,
                floorModel && floorEffort,
                cellOf(t)
              );
            }
          }
        }
      }
    }
  }

  const cli = contract(['tier', '--role', 'builder', '--profile', 'eco'], root);
  ok('acceptance 1: eco builder is sonnet/low', cli.status === 0 && /^builder sonnet\/low$/m.test(cli.stdout), cli.stdout);

  const cliRisk = contract(['tier', '--role', 'builder', '--profile', 'eco', '--risk', 'high'], root);
  ok(
    'acceptance 2: risk high gives opus/medium and says the ceiling was pierced',
    cliRisk.status === 0 && /^builder opus\/medium$/m.test(cliRisk.stdout) && /ceiling +pierced/.test(cliRisk.stdout),
    cliRisk.stdout
  );

  const cliAdv = contract(['tier', '--role', 'advisor', '--profile', 'eco'], root);
  ok(
    'acceptance 3: eco advisor is opus/medium and exempt',
    cliAdv.status === 0 && /^advisor opus\/medium$/m.test(cliAdv.stdout) && /exempt from the profile ceiling/.test(cliAdv.stdout),
    cliAdv.stdout
  );

  const gapNormal = contract(['tier', '--role', 'advisor', '--profile', 'normal', '--asker', 'opus'], root);
  ok(
    'acceptance: a normal opus asker is told the profile runs no advisor',
    gapNormal.status === 2 && /runs no advisor/.test(gapNormal.stdout),
    gapNormal.stdout
  );

  const gapSonnet = contract(['tier', '--role', 'advisor', '--profile', 'eco', '--asker', 'sonnet'], root);
  ok(
    'acceptance: an eco sonnet asker climbs to opus/medium',
    gapSonnet.status === 0 && /^advisor opus\/medium$/m.test(gapSonnet.stdout),
    gapSonnet.stdout
  );

  const gapPrem = contract(['tier', '--role', 'advisor', '--profile', 'premium', '--asker', 'opus'], root);
  ok(
    'acceptance: a premium opus asker climbs to fable/medium',
    gapPrem.status === 0 && /^advisor fable\/medium$/m.test(gapPrem.stdout),
    gapPrem.stdout
  );

  const gapEco = contract(['tier', '--role', 'advisor', '--profile', 'eco', '--asker', 'sonnet'], root);
  ok(
    'acceptance: an eco sonnet asker climbs with the exemption note',
    gapEco.status === 0 && /^advisor opus\/medium$/m.test(gapEco.stdout) && /exempt from the profile ceiling/.test(gapEco.stdout),
    gapEco.stdout
  );

  const cliCouncil = contract(['council', '--profile', 'premium'], root);
  ok('acceptance: the council command is retired', cliCouncil.status !== 0 || !/member/.test(cliCouncil.stdout), cliCouncil.stdout);

  const cliScribe = contract(['tier', '--role', 'scribe', '--profile', 'normal'], root);
  ok('acceptance 4: normal scribe is haiku/low', cliScribe.status === 0 && /^scribe haiku\/low$/m.test(cliScribe.stdout), cliScribe.stdout);

  const cliCell = contract(['tier', '--role', 'ui-builder', '--profile', 'premium'], root);
  ok('the command names the cell it came from', /cell +ui-builder x premium = opus\/medium/.test(cliCell.stdout), cliCell.stdout);

  const cliLow = contract(['tier', '--role', 'advisor', '--profile', 'eco', '--model', 'haiku'], root);
  ok('the command refuses to lower a cell', /^advisor opus\/medium$/m.test(cliLow.stdout) && /below the cell/.test(cliLow.stdout), cliLow.stdout);

  writeContract(
    root,
    'M1',
    ['---', 'id: M1', 'status: active', 'round: 1', 'owns: [src/auth/token.js]', 'verify:', '  - node -e "1"', '---', ''].join('\n')
  );
  const cliContract = contract(['tier', '--role', 'builder', '--id', 'M1', '--profile', 'eco'], root);
  ok('a high-risk contract raises the builder from the command', /^builder opus/m.test(cliContract.stdout), cliContract.stdout);
  ok('the risk comes from the contract, not a flag', /risk +high/.test(cliContract.stdout), cliContract.stdout);

  const cfg = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-tier-'));
  fs.mkdirSync(path.join(cfg, 'teknesyum'), { recursive: true });
  fs.writeFileSync(path.join(cfg, 'teknesyum', 'config.json'), JSON.stringify({ profile: 'eco' }));
  const cliEco = contract(['tier', '--role', 'planner'], root, { CLAUDE_CONFIG_DIR: cfg });
  ok('the profile on disk picks the column', /^planner sonnet\/medium$/m.test(cliEco.stdout), cliEco.stdout);
}

function testQuota(root) {
  const live = path.join(root, '.claude', 'relay', 'live');
  fs.mkdirSync(live, { recursive: true });
  const open = (id, forContract) =>
    fs.writeFileSync(path.join(live, id + '.json'), JSON.stringify({ id, role: 'advisor', contract: forContract || null, files: [] }));

  const none = contract(['tier', '--role', 'advisor', '--profile', 'eco'], root);
  ok('the first eco advisor opening passes', none.status === 0 && /0\/3 advisor openings/.test(none.stdout), none.stdout);

  writeContract(root, 'Q1', ['---', 'id: Q1', 'status: active', 'round: 1', 'owns: [src/ok.js]', 'verify:', '  - node -e "1"', '---', ''].join('\n'));
  open('adv1', 'Q1');
  const second = contract(['tier', '--role', 'advisor', '--profile', 'eco', '--id', 'Q1'], root);
  ok('a second advisor on the same eco contract is blocked', second.status === 2 && /quota is spent/.test(second.stdout), second.stdout);

  const third = contract(['tier', '--role', 'advisor', '--profile', 'eco'], root);
  ok('a second opening elsewhere in the relay passes', third.status === 0, third.stdout);

  open('adv2');
  const thirdOpen = contract(['tier', '--role', 'advisor', '--profile', 'eco'], root);
  ok('the third eco advisor opening passes', thirdOpen.status === 0 && /2\/3 advisor openings/.test(thirdOpen.stdout), thirdOpen.stdout);

  open('adv3');
  const fourth = contract(['tier', '--role', 'advisor', '--profile', 'eco'], root);
  ok('the fourth eco advisor opening is blocked', fourth.status === 2 && /quota is spent/.test(fourth.stdout), fourth.stdout);

  const normal = contract(['tier', '--role', 'advisor', '--profile', 'normal'], root);
  ok('normal has no advisor at all, so no quota', normal.status === 2 && !/quota/.test(normal.stdout), normal.stdout);

  for (const f of ['adv1', 'adv2', 'adv3']) fs.unlinkSync(path.join(live, f + '.json'));
}

function testTierVisible(root) {
  const live = path.join(root, '.claude', 'relay', 'live');
  fs.mkdirSync(live, { recursive: true });
  fs.writeFileSync(
    path.join(live, 'shown.json'),
    JSON.stringify({ id: 'shown', role: 'builder', model: 'sonnet', effort: 'low', files: [] })
  );
  const r = run(process.execPath, [STATUSLINE], {
    cwd: root,
    input: JSON.stringify({ workspace: { current_dir: root } }),
    env: { ...process.env, NO_COLOR: '1' },
  });
  ok('the statusline shows the tier of a running agent', /builder·sonnet\/low/.test(r.stdout), r.stdout);

  const cfg = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-sl-'));
  fs.mkdirSync(path.join(cfg, 'teknesyum'), { recursive: true });
  fs.writeFileSync(path.join(cfg, 'teknesyum', 'config.json'), JSON.stringify({ profile: 'eco' }));
  const eco = run(process.execPath, [STATUSLINE], {
    cwd: root,
    input: JSON.stringify({ workspace: { current_dir: root } }),
    env: { ...process.env, NO_COLOR: '1', CLAUDE_CONFIG_DIR: cfg },
  });
  ok('the statusline shows the profile', /\beco\b/.test(eco.stdout), eco.stdout);

  const bare = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-sl2-'));
  const dflt = run(process.execPath, [STATUSLINE], {
    cwd: root,
    input: JSON.stringify({ workspace: { current_dir: root } }),
    env: { ...process.env, NO_COLOR: '1', CLAUDE_CONFIG_DIR: bare },
  });
  ok('with no profile on disk the statusline says normal', /\bnormal\b/.test(dflt.stdout), dflt.stdout);
  fs.unlinkSync(path.join(live, 'shown.json'));

  const skill = fs.readFileSync(path.join(CORE, 'skills', 'relay', 'SKILL.md'), 'utf8');
  const lines = skill.split('\n');
  ok('SKILL.md stays under 150 lines', lines.length <= 150, lines.length + ' lines');
  const para = skill.split(/\n\s*\n/).filter((p) => /contract\.js tier/.test(p));
  ok('the tier rule is one paragraph', para.length === 1, String(para.length));
  ok('the tier rule is at most six lines', para[0].trim().split('\n').length <= 6, para[0]);
  ok('SKILL.md does not copy the table', !/\|\s*eco\s*\|/.test(skill));

  const langPara = skill.split(/\n\s*\n/).filter((p) => /^Read `contractLang`/.test(p.trim()));
  ok('SKILL.md carries the language rule', langPara.length === 1, String(langPara.length));
  ok('the language rule is at most five lines', langPara.length === 1 && langPara[0].trim().split('\n').length <= 5, langPara[0]);
  ok(
    'SKILL.md binds the summary to the acceptance items',
    /## Acceptance` items one for one/.test(skill) && /chat with the user is always the user's language/.test(skill)
  );
  ok('SKILL.md carries the _issues.log template', /`<contract> \| <role> \| <what was sought> \| <what was missing> \| <what was done>`/.test(skill));

  const decisions = fs.readFileSync(path.join(__dirname, '..', 'docs', 'DECISIONS.md'), 'utf8');
  const d8 = decisions.slice(decisions.indexOf('## D8'), decisions.indexOf('## Standing law'));
  ok('the tiering decision is recorded', /Model tiering/.test(d8));
  const d8rows = d8.toLowerCase();
  ok(
    'D8 carries the full table',
    PROFILES.every((p) => new RegExp('\\| ' + p + ' ').test(d8)) &&
      Object.keys(TABLE).every((r) => d8rows.includes('| ' + r)) &&
      Object.keys(TABLE).every((r) => PROFILES.every((p) => d8rows.includes(TABLE[r][p]))),
    d8rows.slice(0, 200)
  );
  ok('D8 records the four signals', /round >= 3/.test(d8) && /round >= 4/.test(d8) && /same signature/.test(d8) && /irreversible operation/.test(d8));
  ok('D8 justifies the pierced ceiling', /exempt from the ceiling/.test(d8));
  ok('D8 records the advisor exemption', /Advisor is exempt/.test(d8));
  ok('D8 records the advisor pairing', /advisorLadder/.test(d8) && /opus asks, fable answers/.test(d8));
  ok('D8 records that the advisor has no gate', /No gate on the advisor/.test(d8));
  ok('D8 records the blinding rule', /Blinding/.test(d8) && /draft decision/.test(d8));
  ok('D8 records the frequency rule', /Frequency, in force now/.test(d8) && /same message/.test(d8));
  ok('D8 records the retired council and the advisor pairing', /council/i.test(d8) && /advisorLadder/.test(d8));
  ok('D8 records the unarbitrated divergence', /unarbitrated/.test(d8) && /exit code/.test(d8));

  const d9 = decisions.slice(decisions.indexOf('## D9'), decisions.indexOf('## Standing law'));
  ok('the agent language decision is recorded', /Agent language/.test(d9));
  ok('D9 records the cost estimate', /2,500/.test(d9) && /1,700/.test(d9) && /5×/.test(d9));
  ok('D9 records the approval fidelity rule', /one for one, unabridged/.test(d9));
  ok('D9 marks the numbers as unmeasured', /unmeasured estimates/.test(d9));
  ok('D8 records the three locks', /Tool set/.test(d8) && /Output ceiling/.test(d8) && /Quota/.test(d8));
  ok('D8 records the two open points', /Settled by the user: opus/.test(d8) && /cost ratios/.test(d8));
}

const REPO = path.resolve(__dirname, '..');
function testFigures() {
  const dir = path.join(REPO, 'assets');
  let files = [];
  try {
    files = fs.readdirSync(dir).filter((x) => x.endsWith('.svg') && !x.startsWith('badge-'));
  } catch {}
  ok('the figures are where the READMEs point', files.length > 0, dir);

  const TR = /[\u00e7\u011f\u0131\u015f\u00f6\u00fc\u00c7\u011e\u0130\u015e\u00d6\u00dc]/;
  const CODE = /[./_<>&]|^t0$|^\d/;
  const text = (body) =>
    (body.match(/>[^<>]+</g) || [])
      .map((x) => x.slice(1, -1).trim())
      .filter(Boolean)
      .filter((x) => !/^&#\d+;$/.test(x));

  const pairs = new Set();
  for (const file of files) {
    const body = fs.readFileSync(path.join(dir, file), 'utf8');
    const tr = file.endsWith('.tr.svg');
    const lines = text(body);
    const alt = (/aria-label="([^"]*)"/.exec(body) || [])[1] || '';

    ok(file + ' carries alt text that is a sentence, not a label', alt.length > 80, alt.slice(0, 40));

    if (!tr) {
      pairs.add(file.replace(/\.svg$/, '.tr.svg'));
      const leaked = lines.filter((x) => TR.test(x));
      ok(file + ' has no Turkish text in an English figure', leaked.length === 0, leaked.join(' | '));
      const leakedAlt = TR.test(alt);
      ok(file + ' has no Turkish in its alt text', !leakedAlt, alt.slice(0, 60));
    }

    const lower = [];
    for (const line of lines) {
      if (/[.][a-z]+/.test(line)) continue;
      for (const word of line.split(/[\s\u00b7\u2014\u2192\u2022]+/)) {
        if (!word || CODE.test(word)) continue;
        const first = word[0];
        if (first !== first.toLocaleUpperCase('tr') && /\p{L}/u.test(first)) lower.push(word);
      }
    }
    ok(file + ' capitalises every word of its signage', lower.length === 0, lower.join(', '));
  }

  for (const want of pairs) {
    ok('the Turkish twin of ' + want.replace('.tr.svg', '.svg') + ' exists', files.includes(want), files.join(', '));
  }

  for (const readme of ['README.md', 'README.tr.md']) {
    const body = fs.readFileSync(path.join(REPO, readme), 'utf8');
    const used = (body.match(/assets\/[a-z-]+(?:\.tr)?\.svg/g) || []).filter((x) => !/badge-/.test(x));
    ok(readme + ' shows at least one figure', used.length > 0);
    const wrong = used.filter((x) => (readme === 'README.tr.md') !== /\.tr\.svg$/.test(x));
    ok(readme + ' shows only figures in its own language', wrong.length === 0, wrong.join(', '));
  }
}

function testLadder() {
  const root = fixture();
  const live = path.join(root, '.claude', 'relay', 'live');
  const done = path.join(root, FINISHED);
  const body = [
    '# L1',
    'status: active',
    'round: 1',
    '',
    '## owns',
    'src/ok.js',
    '',
    '## verify',
    'node -e "process.exit(0)"',
    '',
  ].join('\n');
  writeContract(root, 'L1', body);

  const parsed = require(path.join(CORE, 'hooks', 'schema.js'));
  ok('the heading form of owns is read, the one the README shows', parsed.owned(body).length === 1, JSON.stringify(parsed.owned(body)));
  ok('the heading form of verify is read too', parsed.verifySteps(body).length === 1, JSON.stringify(parsed.verifySteps(body)));

  const early = contract(['complete', '--id', 'L1'], root);
  ok('an active contract cannot close', early.status === 2, early.stdout + early.stderr);
  ok('and the refusal names the command that fixes it', /submit --id/.test(early.stdout + early.stderr), early.stdout);

  const sub = contract(['submit', '--id', 'L1'], root);
  ok('submit moves it up the ladder', sub.status === 0, sub.stdout + sub.stderr);
  ok('and the file now says submitted', /status: submitted/.test(fs.readFileSync(path.join(root, CONTRACTS, 'L1.md'), 'utf8')));

  const shut = contract(['complete', '--id', 'L1'], root);
  ok('a submitted contract closes', shut.status === 0, shut.stdout + shut.stderr);
  const archived = fs.readFileSync(path.join(done, 'L1.md'), 'utf8');
  ok('the archived contract carries a terminal status', /status: done/.test(archived), archived.slice(0, 60));

  const back = contract(['reopen', '--id', 'L1', '--reason', 'the verify step was wrong'], root);
  ok('a closed contract can be reopened', back.status === 0, back.stdout + back.stderr);
  const reopened = fs.readFileSync(path.join(root, CONTRACTS, 'L1.md'), 'utf8');
  ok('reopening returns it to active', /status: active/.test(reopened), reopened.slice(0, 60));
  ok('reopening raises the round', /round: 2/.test(reopened), reopened.slice(0, 80));
  ok('the closed round stays in the ledger', /reopened/.test(fs.readFileSync(path.join(root, '.claude', 'relay', 'audits', 'ledger.jsonl'), 'utf8')));
  ok('reopen refuses without a reason', contract(['reopen', '--id', 'L1'], root).status === 2);

  writeContract(root, 'L9', '# L9\nstatus: submitted\nround: 6\nowns: [src/ok.js]\nverify:\n  - node -e \"process.exit(0)\"\n');
  contract(['complete', '--id', 'L9'], root);
  const capped = contract(['reopen', '--id', 'L9', '--reason', 'this one will not converge'], root);
  ok('a seventh round is refused - the contract is wrong, not the agent', capped.status === 2, capped.stdout + capped.stderr);
  ok('and the refusal says to split it instead', /Split it/.test(capped.stdout + capped.stderr), capped.stdout);
  const forced = contract(['reopen', '--id', 'L9', '--reason', 'this one will not converge', '--force'], root);
  ok('the cap can still be overridden on purpose', forced.status === 0, forced.stdout + forced.stderr);

  writeContract(root, 'L2', '# L2\nstatus: submitted\nowns: [src/gone.js]\nverify:\n  - node -e \"process.exit(0)\"\n');
  const gone = contract(['complete', '--id', 'L2'], root);
  ok('a contract that owns a file nobody wrote cannot close', gone.status === 2, gone.stdout + gone.stderr);

  writeContract(root, 'L3', '# L3\nstatus: submitted\nowns: [../outside.js]\nverify:\n  - node -e \"process.exit(0)\"\n');
  const out3 = contract(['complete', '--id', 'L3'], root);
  ok('owns cannot reach outside the project', out3.status === 2 && /outside the project/.test(out3.stdout + out3.stderr), out3.stdout);

  const sealMod = require(path.join(CORE, 'hooks', 'seal.js'));
  fs.mkdirSync(live, { recursive: true });
  ok(
    'a run-id with no live record is refused, not waved through',
    typeof sealMod.checkAuditor(path.join(root, '.claude', 'relay'), 'made-up-agent') === 'string',
    String(sealMod.checkAuditor(path.join(root, '.claude', 'relay'), 'made-up-agent'))
  );

  try {
    fs.rmSync(root, { recursive: true, force: true, maxRetries: 3 });
  } catch {}
}

function testSafety() {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-cfg-'));
  const settings = path.join(home, 'settings.json');
  const SETUP = path.join(CORE, 'scripts', 'setup.js');

  const mine = '{ "model": "opus", // yorum\n  "permissions": {} }';
  fs.writeFileSync(settings, mine, 'utf8');
  const broke = run(process.execPath, [SETUP, '--apply', '--lang', 'tr'], {
    env: { ...process.env, CLAUDE_CONFIG_DIR: home },
  });
  ok('setup refuses a settings.json it cannot parse', broke.status !== 0, broke.stdout + broke.stderr);
  ok(
    'and leaves every one of the user settings where they were',
    fs.readFileSync(settings, 'utf8') === mine,
    fs.readFileSync(settings, 'utf8')
  );

  fs.writeFileSync(settings, JSON.stringify({ model: 'opus', env: { A: '1' } }, null, 2), 'utf8');
  const fine = run(process.execPath, [SETUP, '--apply', '--lang', 'tr'], {
    env: { ...process.env, CLAUDE_CONFIG_DIR: home },
  });
  ok('setup writes when the file is readable', fine.status === 0, fine.stdout + fine.stderr);
  const after = JSON.parse(fs.readFileSync(settings, 'utf8'));
  ok('the settings it did not come for survive', after.model === 'opus' && after.env && after.env.A === '1', JSON.stringify(after));
  ok('the statusline is wired', !!(after.statusLine && after.statusLine.command), JSON.stringify(after.statusLine));
  ok('and the previous file is kept as a backup', fs.existsSync(settings + '.bak'));

  const plain = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-plain-'));
  const thrown = run(process.execPath, [GUARD], { cwd: plain, input: 'not json at all' });
  ok('the gate stays out of the way in a project that has no relay', thrown.status === 0, thrown.stdout + thrown.stderr);

  try {
    fs.rmSync(home, { recursive: true, force: true, maxRetries: 3 });
    fs.rmSync(plain, { recursive: true, force: true, maxRetries: 3 });
  } catch {}
}

function testRaces() {
  const root = fixture();
  const relay = path.join(root, '.claude', 'relay');
  const lib = require(path.join(CORE, 'hooks', 'lib.js'));
  const live = lib.liveDir(relay);
  const WATCH = path.join(CORE, 'hooks', 'watch.js');
  const tally = path.join(live, '_tally.json');
  fs.mkdirSync(live, { recursive: true });

  const fire = (ev, tool, agent) =>
    run(process.execPath, [WATCH], {
      cwd: root,
      input: JSON.stringify({ hook_event_name: ev, tool_name: tool, agent_id: agent, cwd: root }),
    });

  fs.rmSync(tally, { force: true });
  fire('PostToolUseFailure', 'Bash', 'a1');
  fire('PostToolUseFailure', 'Bash', 'a1');
  fire('PostToolUse', 'Bash', 'a2');
  const t1 = JSON.parse(fs.readFileSync(tally, 'utf8'));
  ok('the failing agent is named, not just counted', (t1.byAgent && t1.byAgent.a1 && t1.byAgent.a1.fails) === 2, JSON.stringify(t1));
  ok('a working agent leaves no failure behind it', !(t1.byAgent && t1.byAgent.a2), JSON.stringify(t1));

  const shown = require(path.join(CORE, 'scripts', 'statusline.js'));
  ok('the banner still reports the worst run it can see', /Dikkat|Heads/i.test(shown.banner(root)), shown.banner(root));

  fire('PostToolUse', 'Bash', 'a1');
  const t2 = JSON.parse(fs.readFileSync(tally, 'utf8'));
  ok('a clean step wipes that agent off the failure list', !(t2.byAgent && t2.byAgent.a1), JSON.stringify(t2));
  ok('and the relay figure falls with it', (t2.fails || 0) === 0, JSON.stringify(t2));

  writeContract(root, 'R1', '# R1\nstatus: active\nowns: [src/ok.js]\nverify:\n  - node -e \"process.exit(0)\"\n');
  const mine = path.join(live, 'a3.json');
  fs.writeFileSync(mine, JSON.stringify({ id: 'a3', files: [], contract: 'R1' }));
  fire('PostToolUse', 'Bash', 'a3');
  const kept = JSON.parse(fs.readFileSync(mine, 'utf8'));
  ok('the tool hook does not wipe the contract the gate bound', kept.contract === 'R1', JSON.stringify(kept));

  const merged = path.join(live, '_m.json');
  lib.write(merged, { a: 1, files: ['x'] });
  lib.merge(merged, (cur) => Object.assign({}, cur, { b: 2 }));
  const m = JSON.parse(fs.readFileSync(merged, 'utf8'));
  ok('a merge keeps the field it did not come for', m.a === 1 && m.b === 2, JSON.stringify(m));
  const shared = path.join(live, '_shared.json');
  fs.rmSync(shared, { force: true });
  const LIBP = path.join(CORE, 'hooks', 'lib.js');
  const runner = path.join(root, 'bumper.js');
  fs.writeFileSync(runner, "const path = require('path'); const { merge } = require(process.argv[2]); merge(process.argv[3], (c) => Object.assign({}, c, { n: (c.n || 0) + 1 }));");
  const herd = path.join(root, 'herd.js');
  fs.writeFileSync(herd, [
    "const { spawn } = require('child_process');",
    "let left = 12;",
    "for (let i = 0; i < 12; i += 1) {",
    "  const p = spawn(process.execPath, [process.argv[2], process.argv[3], process.argv[4]], { stdio: 'ignore' });",
    "  p.on('exit', () => { left -= 1; });",
    "}",
  ].join(String.fromCharCode(10)));
  run(process.execPath, [herd, runner, LIBP, shared], { cwd: root });
  const counted = JSON.parse(fs.readFileSync(shared, 'utf8'));
  ok('twelve hands on one file lose no count', counted.n === 12, JSON.stringify(counted));

  ok('a write that lands says so', lib.write(path.join(live, '_w.json'), { a: 1 }) === true);
  ok('a write that cannot land says that too', lib.write(path.join(live, 'no', 'such', 'dir', String.fromCharCode(0) + '.json'), { a: 1 }) === false);

  const gone = path.join(live, 'sub1.json');
  fire('SubagentStop', 'Bash', 'sub1');
  ok('a subagent that stopped is marked ended', !!JSON.parse(fs.readFileSync(gone, 'utf8')).ended, fs.readFileSync(gone, 'utf8'));
  fire('PostToolUse', 'Bash', 'sub1');
  ok('a late tool call does not raise the dead', !!JSON.parse(fs.readFileSync(gone, 'utf8')).ended, fs.readFileSync(gone, 'utf8'));
  fire('Stop', 'Bash', 'main1');
  fire('PostToolUse', 'Bash', 'main1');
  ok('but a session that stopped and went on is running again', !JSON.parse(fs.readFileSync(path.join(live, 'main1.json'), 'utf8')).ended, fs.readFileSync(path.join(live, 'main1.json'), 'utf8'));

  const risk = require(path.join(CORE, 'scripts', 'risk.js'));
  const blind = risk.assess(path.join(root, 'nowhere'), ['src/ok.js']);
  ok('a diff that cannot be read is not read as small', blind.level === 'high', JSON.stringify(blind));

  const cfgHome = path.join(root, 'wire-home');
  fs.mkdirSync(path.join(cfgHome, 'teknesyum'), { recursive: true });
  const wired = path.join(cfgHome, 'settings.json');
  fs.writeFileSync(wired, JSON.stringify({ statusLine: { type: 'command', command: 'node "C:/x/teknesyum-core/0.1.12/scripts/bridge.js"' } }));
  const rewired = run(process.execPath, ['-e', "console.log(require(process.argv[1]).rewire())", path.join(CORE, 'hooks', 'lib.js').split(String.fromCharCode(92)).join('/')], { cwd: root, env: Object.assign({}, process.env, { CLAUDE_CONFIG_DIR: cfgHome }) });
  const after = JSON.parse(fs.readFileSync(wired, 'utf8'));
  ok('a statusline left on an old copy is repointed', after.statusLine.command.indexOf('0.1.12') < 0 && after.statusLine.command.indexOf('bridge.js') > 0, rewired.stdout + ' ' + after.statusLine.command);
  const twice = fs.readFileSync(wired, 'utf8');
  run(process.execPath, ['-e', "require(process.argv[1]).rewire()", path.join(CORE, 'hooks', 'lib.js').split(String.fromCharCode(92)).join('/')], { cwd: root, env: Object.assign({}, process.env, { CLAUDE_CONFIG_DIR: cfgHome }) });
  ok('a statusline already on this copy is left alone', fs.readFileSync(wired, 'utf8') === twice);




  const hooks = JSON.parse(fs.readFileSync(path.join(CORE, 'hooks', 'hooks.json'), 'utf8')).hooks;
  ok('the tool hook no longer runs on every read', /Write\|Edit/.test(hooks.PostToolUse[0].matcher || ''), String(hooks.PostToolUse[0].matcher));
  ok('nor does the failure hook', /Write\|Edit/.test(hooks.PostToolUseFailure[0].matcher || ''), String(hooks.PostToolUseFailure[0].matcher));

  try {
    fs.rmSync(root, { recursive: true, force: true, maxRetries: 3 });
  } catch {}
}

function testTools() {
  const root = fixture();
  const relay = path.join(root, '.claude', 'relay');
  const HANDOFF = path.join(CORE, 'scripts', 'handoff.js');
  const DOCTOR = path.join(CORE, 'scripts', 'doctor.js');

  writeContract(root, 'H1', '# H1 the banner cost\nstatus: active\nround: 2\nowns: [src/ok.js]\nverify:\n  - node -e \"process.exit(0)\"\n');
  const made = run(process.execPath, [HANDOFF, 'show', '--root', root], { cwd: root });
  const note = made.stdout;
  ok('the handoff note names the open contract', /H1/.test(note), note);
  ok('and says where that contract stands', /active, round 2/.test(note), note);
  ok('and carries the title so a stranger knows the subject', /the banner cost/.test(note), note);
  ok('it reports the branch and head', /branch:/.test(note) && /head:/.test(note), note);
  ok('it leaves a place for the one paragraph a model writes', /## Intent/.test(note), note);
  ok('the note is a file, not something printed into a context', fs.existsSync(path.join(relay, 'HANDOFF.md')));

  run(process.execPath, [HANDOFF, 'intent', 'Kapinin maliyetini olcuyoruz.', '--root', root], { cwd: root });
  const kept = fs.readFileSync(path.join(relay, 'HANDOFF.md'), 'utf8');
  ok('the intent is stored', /Kapinin maliyetini olcuyoruz/.test(kept), kept);
  run(process.execPath, [HANDOFF, 'write', '--root', root], { cwd: root });
  const again = fs.readFileSync(path.join(relay, 'HANDOFF.md'), 'utf8');
  ok('and a refresh does not wipe what the model wrote', /Kapinin maliyetini olcuyoruz/.test(again), again);

  writeContract(root, 'P1', '# P1\nstatus: open\nowns: [src/ok.js]\nverify:\n  - node -e "process.exit(0)"\n');
  const met = contract(['precheck', '--id', 'P1'], root);
  ok('precheck says so when the work is already done', met.status === 0, met.stdout + met.stderr);
  ok('and points at the command that closes it instead of an agent', /submit --id P1/.test(met.stdout), met.stdout);

  writeContract(root, 'P2', '# P2\nstatus: open\nowns: [src/ok.js]\nverify:\n  - node -e "process.exit(1)"\n');
  const openWork = contract(['precheck', '--id', 'P2'], root);
  ok('precheck sends real work to an agent', openWork.status === 1, openWork.stdout + openWork.stderr);

  const machine = contract(['tier', '--role', 'builder'], root);
  fs.writeFileSync(path.join(relay, 'config.json'), JSON.stringify({ profile: 'eco' }), 'utf8');
  const project = contract(['tier', '--role', 'builder'], root);
  ok('a project can hold its own profile', project.stdout !== machine.stdout, project.stdout);
  ok('and the project profile is the one that answers', /eco/.test(project.stdout), project.stdout);
  const asked = contract(['tier', '--role', 'builder', '--profile', 'premium'], root);
  ok('an explicit profile still wins over the project file', /premium/.test(asked.stdout), asked.stdout);
  fs.rmSync(path.join(relay, 'config.json'), { force: true });

  const RELEASE = path.join(CORE, 'scripts', 'release.js');
  run(process.execPath, [RELEASE, 'note', '--bump', 'minor', 'the gate stops reading shell'], { cwd: root });
  const waiting = run(process.execPath, [RELEASE, 'status'], { cwd: root });
  ok('a note decides the next version, memory does not', /→ v/.test(waiting.stdout), waiting.stdout);
  ok('and a minor note makes it a minor release', /\(minor\)/.test(waiting.stdout), waiting.stdout);
  ok('the note text is what ships', /stops reading shell/.test(waiting.stdout), waiting.stdout);
  for (const f of fs.readdirSync(path.join(CORE, '..', '.changes'))) {
    if (/stops-reading-shell/.test(f)) fs.rmSync(path.join(CORE, '..', '.changes', f), { force: true });
  }

  const rel = require(path.join(CORE, 'scripts', 'release.js'));
  ok('a patch note moves the last figure', rel.next('0.1.12', 'patch') === '0.1.13');
  ok('a minor note zeroes the one below it', rel.next('0.1.12', 'minor') === '0.2.0');
  ok('a major note zeroes both', rel.next('0.1.12', 'major') === '1.0.0');

  const doc = run(process.execPath, [DOCTOR, '--json'], { cwd: root });
  let rows = [];
  try {
    rows = JSON.parse(doc.stdout);
  } catch {}
  ok('doctor answers in a shape a script can read', Array.isArray(rows) && rows.length >= 8, doc.stdout.slice(0, 120));
  ok('every check names itself and says yes or no', rows.every((r) => r.name && typeof r.ok === 'boolean'), JSON.stringify(rows[0] || {}));
  ok('doctor sees the tier table', rows.some((r) => r.name === 'tier table' && r.ok), JSON.stringify(rows));
  ok('doctor sees the two versions agree', rows.some((r) => r.name === 'version' && r.ok), JSON.stringify(rows.filter((r) => r.name === 'version')));

  try {
    fs.rmSync(root, { recursive: true, force: true, maxRetries: 3 });
  } catch {}
}

function testIndex() {
  const root = fixture();
  const MAP = path.join(CORE, 'scripts', 'map.js');
  const DOCTOR = path.join(CORE, 'scripts', 'doctor.js');
  const src = path.join(root, 'src');
  fs.mkdirSync(src, { recursive: true });
  fs.writeFileSync(path.join(src, 'a.js'), "const b = require('./b.js');\nmodule.exports = b;\n");
  fs.writeFileSync(path.join(src, 'b.js'), 'module.exports = 1;\n');
  fs.writeFileSync(path.join(src, 'lonely.js'), 'module.exports = 2;\n');
  run('git', ['add', '-A'], { cwd: root });
  run('git', ['commit', '-m', 'files'], { cwd: root });
  run(process.execPath, [MAP, root], { cwd: root });

  const mapDir = path.join(root, '.claude', 'relay');
  const md = fs.readFileSync(path.join(mapDir, 'map.md'), 'utf8');
  ok('the map says which commit it was built from', /HEAD [0-9a-f]{8}/.test(md), md.split('\n').slice(0, 4).join(' | '));
  const json = JSON.parse(fs.readFileSync(path.join(mapDir, 'map.json'), 'utf8'));
  ok('and the machine copy carries the same seal', /^[0-9a-f]{40}$/.test((json._map || {}).head || ''), JSON.stringify(json._map));

  const mapMod = require(path.join(CORE, 'scripts', 'map.js'));
  ok('a map built at HEAD reads as fresh', mapMod.staleness(root, mapDir).state === 'fresh', JSON.stringify(mapMod.staleness(root, mapDir)));

  const asked = run(process.execPath, [MAP, 'who', 'src/b.js'], { cwd: root });
  ok('the map answers who imports a file', /src\/a\.js/.test(asked.stdout), asked.stdout);
  ok('and says so plainly when nobody does', /nothing imports it/.test(run(process.execPath, [MAP, 'who', 'src/lonely.js'], { cwd: root }).stdout));
  ok('asking about a file it never saw is not a crash', run(process.execPath, [MAP, 'who', 'src/ghost.js'], { cwd: root }).status === 1);

  fs.writeFileSync(path.join(src, 'c.js'), 'module.exports = 3;\n');
  run('git', ['add', '-A'], { cwd: root });
  run('git', ['commit', '-m', 'one more'], { cwd: root });
  const st = mapMod.staleness(root, mapDir);
  ok('a commit later the map knows it is behind', st.state === 'stale', JSON.stringify(st));
  ok('and it counts how far behind', st.behind === 1, JSON.stringify(st));
  const doc = JSON.parse(run(process.execPath, [DOCTOR, '--json'], { cwd: root }).stdout || '[]');
  const mapRow = doc.find((r) => r.name === 'map') || {};
  ok('doctor turns the silent lie into a visible one', mapRow.ok === false && /behind/.test(mapRow.message || ''), JSON.stringify(mapRow));

  writeContract(root, 'U1', '# U1\nstatus: open\nowns: [src/new.js]\nverify:\n  - node tools/ghost.js\n');
  const seen = contract(['check', '--id', 'U1'], root);
  ok('check names the verify target that is not there', /tools\/ghost\.js/.test(seen.stdout), seen.stdout);
  ok('and says a step that cannot run is not acceptance', /not acceptance/.test(seen.stdout), seen.stdout);
  ok('an owns entry for work not done yet is information, not a fault', /do not exist yet/.test(seen.stdout), seen.stdout);

  writeContract(root, 'U2', '# U2 the banner\nstatus: active\nowns: [src/a.js]\nverify:\n  - node -e \"process.exit(0)\"\n');
  const all = contract(['list'], root);
  ok('list reports what is open', /U1/.test(all.stdout) && /U2/.test(all.stdout), all.stdout);
  ok('and what each one owns', /src\/a\.js/.test(all.stdout), all.stdout);
  const owner = contract(['list', '--owns', 'src/a.js'], root);
  ok('one question answers who owns a file', /U2/.test(owner.stdout) && !/U1/.test(owner.stdout), owner.stdout);
  const nobody = contract(['list', '--owns', 'src/b.js'], root);
  ok('and it says so when nobody owns it', nobody.status === 1, nobody.stdout);

  try {
    fs.rmSync(root, { recursive: true, force: true, maxRetries: 3 });
  } catch {}
}

function testUpdate() {
  const up = require(path.join(CORE, 'scripts', 'update.js'));
  ok('0.2.0 is newer than 0.1.12, not older', up.newer('0.2.0', '0.1.12') === true);
  ok('0.1.12 is newer than 0.1.9 - these are numbers, not text', up.newer('0.1.12', '0.1.9') === true);
  ok('the same version is not newer than itself', up.newer('1.0.0', '1.0.0') === false);
  ok('1.0.0 beats 0.99.99', up.newer('1.0.0', '0.99.99') === true);
  ok('a v prefix is read', up.newer('v0.3.0', '0.2.9') === true);
  ok('nonsense is not newer than anything', up.newer('', '1.0.0') === false && up.newer('latest', '1.0.0') === false);

  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-up-'));
  const state = path.join(home, 'teknesyum');
  fs.mkdirSync(state, { recursive: true });
  const held = process.env.CLAUDE_CONFIG_DIR;
  process.env.CLAUDE_CONFIG_DIR = home;
  delete require.cache[require.resolve(path.join(CORE, 'scripts', 'update.js'))];
  delete require.cache[require.resolve(path.join(CORE, 'hooks', 'lib.js'))];
  const fresh = require(path.join(CORE, 'scripts', 'update.js'));

  ok('with no cache at all, nothing is claimed', fresh.known() === '');
  ok('and the check is due', fresh.due() === true);
  fs.writeFileSync(path.join(state, 'version.json'), JSON.stringify({ latest: '99.0.0', checkedAt: Date.now() }));
  ok('a fresh answer is used', fresh.known() === '99.0.0', fresh.known());
  ok('and it is not asked for again within the week', fresh.due() === false);
  ok('a newer release becomes a hint', /^99\.0\.0$/.test(fresh.hint()), fresh.hint());
  fs.writeFileSync(path.join(state, 'version.json'), JSON.stringify({ latest: '0.0.1', checkedAt: Date.now() }));
  ok('and an older one says nothing at all', fresh.hint() === '', fresh.hint());

  process.env.CLAUDE_CONFIG_DIR = held === undefined ? '' : held;
  if (held === undefined) delete process.env.CLAUDE_CONFIG_DIR;
  delete require.cache[require.resolve(path.join(CORE, 'scripts', 'update.js'))];
  delete require.cache[require.resolve(path.join(CORE, 'hooks', 'lib.js'))];
  try {
    fs.rmSync(home, { recursive: true, force: true, maxRetries: 3 });
  } catch {}

  const hooks = fs.readFileSync(path.join(CORE, 'hooks', 'hooks.json'), 'utf8');
  ok('nothing about updates runs on an ordinary turn', !/update\.js/.test(hooks), 'update.js is wired into hooks.json');
  const line = fs.readFileSync(path.join(CORE, 'scripts', 'statusline.js'), 'utf8');
  ok('the hint lives on the statusline, which is outside the context', /update\(\)/.test(line));
  const notice = fs.readFileSync(path.join(CORE, 'hooks', 'notice.js'), 'utf8');
  ok('and never on the chat banner, which the user has to read', !/update\.js/.test(notice));
}

function testAcceptance() {
  const mod = require(path.join(CORE, 'scripts', 'contract.js'));
  ok('an empty step measures nothing', mod.hollowStep('  ') === 'is empty');
  ok('true always passes', mod.hollowStep('true') === 'always passes');
  ok('a bare colon does nothing', mod.hollowStep(':') === 'does nothing');
  ok('exit 0 always passes', mod.hollowStep('exit 0') === 'always passes');
  ok('ls always passes', mod.hollowStep('ls') === 'always passes');
  ok('echo prints instead of testing', mod.hollowStep('echo done') === 'prints instead of testing');
  ok('a comment is not a test', mod.hollowStep('# ran the tests') === 'is a comment');
  ok('a real command is not hollow', mod.hollowStep('npm test') === '');
  ok('a command that merely starts with true is not hollow', mod.hollowStep('truffle test') === '');
  ok('no verify at all is a different complaint, not this one', mod.hollowVerify([]).length === 0);
  ok('one real step among hollow ones is enough', mod.hollowVerify(['echo hi', 'npm test']).length === 0);
  ok('all hollow is caught', mod.hollowVerify(['echo hi', 'true']).length === 2);

  const root = fixture();
  writeContract(root, 'V1', '# V1\nstatus: submitted\nowns: [src/ok.js]\nverify:\n  - true\n');
  const dud = contract(['complete', '--id', 'V1'], root);
  ok('a contract whose acceptance cannot fail does not close', dud.status === 2, dud.stdout + dud.stderr);
  ok('and the refusal says so plainly', /nothing here is acceptance/.test(dud.stdout + dud.stderr), dud.stdout);
  ok('it names the step and why', /always passes/.test(dud.stdout + dud.stderr), dud.stdout);
  const seen = contract(['check', '--id', 'V1'], root);
  ok('check reports it before anyone submits', /nothing here can fail/.test(seen.stdout + seen.stderr), seen.stdout);

  writeContract(root, 'V2', '# V2\nstatus: submitted\nowns: [src/ok.js]\nverify:\n  - echo built\n  - node -e \"process.exit(0)\"\n');
  const mixed = contract(['complete', '--id', 'V2'], root);
  ok('one command that can fail is enough to close', mixed.status === 0, mixed.stdout + mixed.stderr);

  try {
    fs.rmSync(root, { recursive: true, force: true, maxRetries: 3 });
  } catch {}
}

function testLifetime() {
  const lib = require(path.join(CORE, 'hooks', 'lib.js'));
  const WATCH = path.join(CORE, 'hooks', 'watch.js');
  const root = fixture();
  const relay = path.join(root, '.claude', 'relay');
  const live = lib.liveDir(relay);
  const fire = (ev, tool, agent) =>
    run(process.execPath, [WATCH], {
      cwd: root,
      input: JSON.stringify({ hook_event_name: ev, tool_name: tool, agent_id: agent, cwd: root }),
    });

  writeContract(root, 'W1', '# W1\nstatus: active\nowns: [src/ok.js]\nverify:\n  - node -e \"process.exit(0)\"\n');
  fire('Stop', '', 'w-a');
  const marks = path.join(live, '_stale.json');
  ok('an active contract nobody is holding is recorded as abandoned', JSON.parse(fs.readFileSync(marks, 'utf8')).ids.indexOf('W1') !== -1, fs.readFileSync(marks, 'utf8'));
  const led = fs.readFileSync(path.join(relay, 'audits', 'ledger.jsonl'), 'utf8');
  ok('and it lands in the ledger, not in anybody context', /"result":"stale"/.test(led.split(' ').join('')) || /stale/.test(led), led.slice(-200));
  const before = fs.readFileSync(path.join(relay, 'audits', 'ledger.jsonl'), 'utf8').split(String.fromCharCode(10)).length;
  fire('Stop', '', 'w-a');
  const after = fs.readFileSync(path.join(relay, 'audits', 'ledger.jsonl'), 'utf8').split(String.fromCharCode(10)).length;
  ok('the same abandonment is not logged twice', before === after, before + ' -> ' + after);
  ok('the statusline says it, since the statusline costs nothing', /abandoned|sahipsiz/.test(require(path.join(CORE, 'scripts', 'statusline.js')).summary(root)));

  const held = path.join(live, 'w-b.json');
  fs.writeFileSync(held, JSON.stringify({ id: 'w-b', contract: 'W1', files: [] }));
  fire('Stop', '', 'w-c');
  ok('a contract an agent is still holding is not abandoned', JSON.parse(fs.readFileSync(marks, 'utf8')).ids.indexOf('W1') === -1, fs.readFileSync(marks, 'utf8'));

  const bash = (cmd, env) =>
    run(process.execPath, [path.join(CORE, 'hooks', 'guard.js')], {
      cwd: root,
      input: JSON.stringify({ tool_name: 'Bash', tool_input: { command: cmd }, cwd: root }),
      env: Object.assign({}, process.env, env || {}),
    });
  ok('work does not reach main around the gate', bash('git push origin main').status === 2, bash('git push origin main').stderr);
  ok('the block names the contract that is still open', /W1/.test(bash('git merge feature').stderr), bash('git merge feature').stderr);
  ok('an ordinary command is not touched', bash('git status').status === 0, bash('git status').stderr);
  ok('the gate can be opened on purpose', bash('git push origin main', { TEKNESYUM_GATE_OPEN: '1' }).status === 0);

  const stop = (extra) =>
    run(process.execPath, [WATCH], {
      cwd: root,
      input: JSON.stringify(Object.assign({ hook_event_name: 'Stop', cwd: root }, extra)),
    }).stdout;

  writeContract(root, 'W9', '# W9\nstatus: submitted\nowns: [src/ok.js]\nverify:\n  - node -e "process.exit(0)"\n');
  ok('a turn does not close on a delivery nobody answered', /"decision":"block"/.test(stop({})), stop({}));
  ok('the halt names the contract', /W9/.test(stop({})), stop({}));
  ok('the second stop of the same turn goes through', stop({ stop_hook_active: true }) === '', stop({ stop_hook_active: true }));
  fs.unlinkSync(path.join(relay, 'contracts', 'W9.md'));

  const tape = path.join(root, 'tape.jsonl');
  const said = (text) =>
    fs.writeFileSync(tape, JSON.stringify({ message: { role: 'assistant', content: [{ type: 'text', text: text }] } }) + '\n');
  writeContract(root, 'W8', '# W8\nstatus: open\nowns: [src/ok.js]\nverify:\n  - node -e "process.exit(0)"\n');
  said('Faz 2 paketini yazayim mi, yoksa denetimleri mi kapatayim?');
  ok('a turn that asks while work waits unassigned is held', /"decision":"block"/.test(stop({ transcript_path: tape })), stop({ transcript_path: tape }));
  said('T8 ajana verildi, denetim kosuyor.');
  ok('a turn that only says so is held too', /"decision":"block"/.test(stop({ transcript_path: tape })), stop({ transcript_path: tape }));
  fs.writeFileSync(path.join(require(path.join(CORE, 'hooks', 'lib.js')).liveDir(relay), 'w8.json'), JSON.stringify({ id: 'w8', role: 'builder', contract: 'W8', updated: new Date().toISOString() }));
  ok('a turn whose work is really on an agent closes', stop({ transcript_path: tape }) === '', stop({ transcript_path: tape }));
  fs.unlinkSync(path.join(require(path.join(CORE, 'hooks', 'lib.js')).liveDir(relay), 'w8.json'));

  writeContract(root, 'W2', '# W2\nstatus: active\nceiling: 2\nowns: [src/ok.js]\nverify:\n  - node -e \"process.exit(0)\"\n');
  const edit = (n) => ({
    hook_event_name: 'PreToolUse',
    tool_name: 'Write',
    agent_id: 'w-d',
    cwd: root,
    tool_input: { file_path: path.join(root, n), content: 'x' },
  });
  hook({ ...edit('.claude/relay/contracts/W2.md'), tool_input: { file_path: path.join(root, CONTRACTS, 'W2.md'), content: fs.readFileSync(path.join(root, CONTRACTS, 'W2.md'), 'utf8') } }, root);
  const bound = path.join(live, 'w-d.json');
  ok('touching a contract binds the agent to it', JSON.parse(fs.readFileSync(bound, 'utf8')).contract === 'W2', fs.readFileSync(bound, 'utf8'));
  const first = hook(edit('src/ok.js'), root);
  ok('inside the ceiling the write goes through', first.status === 0, first.stderr);
  fire('PostToolUse', 'Write', 'w-d');
  fire('PostToolUse', 'Write', 'w-d');
  const spent = hook(edit('src/ok.js'), root);
  ok('once the ceiling is spent the contract stops being writable', spent.status === 2, spent.stdout + spent.stderr);
  ok('and the refusal names the ceiling', /ceiling/.test(spent.stderr), spent.stderr);
  ok('it points at the checkpoint rather than at a wider contract', /Checkpoint/.test(spent.stderr), spent.stderr);

  writeContract(root, 'W3', '# W3\nstatus: active\nowns: [src/ok.js]\nverify:\n  - node -e \"process.exit(0)\"\n');
  fs.writeFileSync(path.join(live, 'w-e.json'), JSON.stringify({ id: 'w-e', contract: 'W3', contractSteps: 40, files: [] }));
  const roomy = hook({ ...edit('src/ok.js'), agent_id: 'w-e' }, root);
  ok('a contract with no ceiling line still has a generous one', roomy.status === 0, roomy.stderr);

  try {
    fs.rmSync(root, { recursive: true, force: true, maxRetries: 3 });
  } catch {}
}

function testSnapshot() {
  const root = fixture();
  writeContract(root, 'S1', '# S1\nstatus: active\nowns: [src/ok.js]\nverify:\n  - node -e \"process.exit(1)\"\n');
  const target = path.join(root, 'src', 'ok.js');
  const original = fs.readFileSync(target, 'utf8');

  const pre = contract(['precheck', '--id', 'S1'], root);
  ok('precheck pins the tree before the work starts', /pinned at|is pinned at/.test(pre.stdout + pre.stderr), pre.stdout);
  const ref = run('git', ['-C', root, 'rev-parse', '--verify', '--quiet', 'refs/teknesyum/S1']);
  ok('the pin is a real ref, not a dangling object gc can take', ref.status === 0 && ref.stdout.trim().length === 40, ref.stdout + ref.stderr);

  fs.writeFileSync(target, 'module.exports = 999;\n');
  const dry = contract(['revert', '--id', 'S1'], root);
  ok('revert does not overwrite anything until it is told to', dry.status === 1 && fs.readFileSync(target, 'utf8') !== original, dry.stdout);
  ok('and it says exactly which files it would overwrite', /src\/ok\.js/.test(dry.stdout), dry.stdout);
  const undo = contract(['revert', '--id', 'S1', '--yes'], root);
  const back = fs.readFileSync(target, 'utf8').split(String.fromCharCode(13)).join('');
  ok('with --yes the owned file goes back to the pin', undo.status === 0 && back === original, undo.stdout + undo.stderr + ' :: ' + back);

  const other = path.join(root, 'src', 'auth', 'token.js');
  fs.writeFileSync(other, 'module.exports = 999;\n');
  contract(['revert', '--id', 'S1', '--yes'], root);
  ok('revert stays inside the owns set', fs.readFileSync(other, 'utf8') === 'module.exports = 999;\n');

  writeContract(root, 'S2', '# S2\nstatus: submitted\nowns: [src/ok.js]\nverify:\n  - node -e \"process.exit(0)\"\n');
  contract(['snapshot', '--id', 'S2'], root);
  const held = run('git', ['-C', root, 'rev-parse', '--verify', '--quiet', 'refs/teknesyum/S2']);
  ok('a snapshot can also be taken by hand', held.status === 0, held.stdout + held.stderr);
  contract(['complete', '--id', 'S2'], root);
  const gone = run('git', ['-C', root, 'rev-parse', '--verify', '--quiet', 'refs/teknesyum/S2']);
  ok('closing a contract takes its pin down again', gone.status !== 0, gone.stdout);

  const none = contract(['revert', '--id', 'S2', '--yes'], root);
  ok('reverting to a pin that was never taken refuses instead of guessing', none.status === 2, none.stdout + none.stderr);

  try {
    fs.rmSync(root, { recursive: true, force: true, maxRetries: 3 });
  } catch {}
}

function main() {
  const root = fixture();
  testGuard(root);
  testGate(root);
  testBypass(root);
  testPrefs(root);
  testScaffold();
  testStatusline(root);
  testTitle();
  testNotice(root);
  testBanner(root);
  testMessageDisplay(root);
  testLanguage(root);
  testTier(root);
  testQuota(root);
  testTierVisible(root);
  testLadder();
  testSafety();
  testRaces();
  testTools();
  testIndex();
  testUpdate();
  testAcceptance();
  testLifetime();
  testSnapshot();
  testFigures();
  testNoContextWrites();

  process.stdout.write('\n' + pass + ' passed, ' + fail + ' failed\n');
  if (failures.length) {
    process.stdout.write('\n' + failures.map((f) => '  FAIL  ' + f).join('\n') + '\n');
  }
  process.stdout.write('\nfixture: ' + root + '\n');
  process.exitCode = fail ? 1 : 0;
}

main();
