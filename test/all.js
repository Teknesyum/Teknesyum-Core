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
    hook({ tool_name: 'Write', tool_input: { file_path: c('T9'), content: 'owns: [src/]\nverify:\n  - true\n' } }, root)
      .status === 2
  );

  ok(
    'contract without verify is blocked',
    hook({ tool_name: 'Write', tool_input: { file_path: c('T9'), content: 'owns: [src/ok.js]\n' } }, root).status === 2
  );

  const valid = {
    tool_name: 'Write',
    tool_input: { file_path: c('T9'), content: 'owns: [src/ok.js]\nverify:\n  - true\nstatus: open\n' },
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
    'shell delete in the finished directory is blocked',
    hook({ tool_name: 'Bash', tool_input: { command: 'rm ' + finishedFile } }, root).status === 2
  );
  ok(
    'shell read in the finished directory passes',
    hook({ tool_name: 'Bash', tool_input: { command: 'cat ' + finishedFile } }, root).status === 0
  );

  writeContract(root, 'R1', '---\nid: R1\nstatus: submitted\nowns: [src/ok.js]\nverify:\n  - true\n---\n');
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

  writeContract(root, 'R2', '---\nid: R2\nstatus: open\nowns: [src/ok.js]\nverify:\n  - true\n---\n');
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
    'shell write into audits/ is blocked',
    hook({ tool_name: 'Bash', tool_input: { command: 'echo {} > ' + auditsUnix + '/Z1-1.json' } }, root).status === 2
  );
  ok(
    'shell read of audits/ passes',
    hook({ tool_name: 'Bash', tool_input: { command: 'cat ' + auditsUnix + '/ledger.jsonl' } }, root).status === 0
  );

  writeContract(
    root,
    'B1',
    '---\nid: B1\nstatus: open\nround: 1\nowns: [src/ok.js]\nverify:\n  - true\n---\n'
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
  const { banner } = require(path.join(CORE, 'scripts', 'statusline.js'));
  const line = banner(root);

  ok('the banner opens with the plugin mark', line.startsWith('Teknesyum ▸ '), line);
  ok('the banner stays quiet while the gate holds', !/KAPI|GATE OFF/.test(line), line);
  ok('the banner carries no ANSI colour', !/\[/.test(line), JSON.stringify(line));
  ok('the banner is one line', line.indexOf(String.fromCharCode(10)) === -1, line);

  const words = line.replace('Teknesyum ▸ ', '').split(' · ').join(' ').split(' ');
  const lower = words.filter((w) => /^\p{Ll}/u.test(w));
  ok('every word is capitalised', lower.length === 0, lower.join(','));

  ok('Turkish uppercase keeps the dot', !/Izlendi/.test(line), line);

  ok('the banner is silent outside a relay', banner(os.tmpdir()) === '');

  ok('the banner stays inside its cap', line.length <= 120, String(line.length));
  ok('the banner never cuts mid-word', !/·\s*$/.test(line), line);

  const tally = path.join(lib.liveDir(path.join(root, '.claude', 'relay')), '_tally.json');
  fs.writeFileSync(tally, JSON.stringify({ steps: 41 }));
  ok('the step tally is off the banner for good', !/41/.test(banner(root)), banner(root));
  fs.rmSync(tally, { force: true });
  ok('no step segment is left on the banner', !/Adım|Step/i.test(banner(root)), banner(root));

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
  ok('a single failure stays off the banner', !/Dikkat|Heads/i.test(banner(root)), banner(root));
  fs.writeFileSync(tally, JSON.stringify({ steps: 3, fails: 2 }));
  ok('two failures in a row take over the banner', /Dikkat|Heads/i.test(banner(root)) && /2 /.test(banner(root)), banner(root));
  fs.rmSync(tally, { force: true });

  const liveB = lib.liveDir(path.join(root, '.claude', 'relay'));
  const parked = fs.readdirSync(liveB).filter((x) => x.endsWith('.json'));
  for (const x of parked) fs.renameSync(path.join(liveB, x), path.join(liveB, x + '.parked'));
  fs.writeFileSync(path.join(liveB, 'a1.json'), JSON.stringify({ id: 'a1', role: 'advisor', model: 'fable', effort: 'medium' }));
  fs.writeFileSync(path.join(liveB, '_calls.json'), JSON.stringify([{ role: 'advisor', model: 'fable', task: 'banner tasarimi soruldu', at: Date.now() }]));
  const crewLine = banner(root);
  ok('the banner names the role in the user language', /Dan\u0131\u015fman|Advisor/.test(crewLine), crewLine);
  ok('no English role name survives', !/Worker|Builder|Auditor|Scout|Scribe/.test(crewLine), crewLine);
  ok('the banner names the model and effort', /Fable-Medium/.test(crewLine), crewLine);
  ok('the banner says what the agent was asked', /Banner Tasarimi Soruldu/.test(crewLine), crewLine);
  ok('a working agent pushes the profile off the line', !/Premium|Normal|Eco/.test(crewLine), crewLine);
  ok('the counters are gone from the busy line', !/Ad\u0131m|G\u00fcnl\u00fck/i.test(crewLine), crewLine);

  fs.writeFileSync(path.join(liveB, '_duyuru.json'), JSON.stringify({ text: 'T7 kapandi', at: Date.now() }));
  ok('the closing band reports what finished', /T7 Kapandi/.test(banner(root, 'foot')), banner(root, 'foot'));
  ok('the opening band still reports what is running', /Dan\u0131\u015fman|Advisor/.test(banner(root, 'head')), banner(root, 'head'));
  fs.rmSync(path.join(liveB, '_duyuru.json'), { force: true });
  fs.rmSync(path.join(liveB, 'a1.json'), { force: true });
  fs.rmSync(path.join(liveB, '_calls.json'), { force: true });
  ok('with nothing running the banner falls back to the profile', /Premium|Normal|Eco/.test(banner(root)), banner(root));
  ok('bookkeeping files are not counted as agents', !/1 Ajan|2 Ajan/.test(banner(root)), banner(root));
  for (const x of parked) fs.renameSync(path.join(liveB, x + '.parked'), path.join(liveB, x));

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
  ok('a blank line separates the notice', body.indexOf('son satir.' + NL + NL + 'Teknesyum') > 0, JSON.stringify(body));
  ok('a single flush is framed above and below', body.split('Teknesyum').length === 3, body);
  const first = JSON.parse(call(ev({ index: 0, final: false, delta: 'ilk parca.' })).stdout).hookSpecificOutput.displayContent;
  ok('the first flush carries the notice on top', first.startsWith('Teknesyum'), first);
  ok('the first flush keeps its delta below', first.trim().endsWith('ilk parca.'), first);
  const last = JSON.parse(call(ev({ index: 4, final: true, delta: 'son parca.' })).stdout).hookSpecificOutput.displayContent;
  ok('a later final flush carries it below only', last.startsWith('son parca.') && last.split('Teknesyum').length === 2, last);
  ok('the notice is the last line', body.trim().split(String.fromCharCode(10)).pop().startsWith('Teknesyum'), body);
  ok('the notice is also the first line', body.split(String.fromCharCode(10))[0].startsWith('Teknesyum'), body);

  const empty = call(ev({ delta: '' }));
  const eb = JSON.parse(empty.stdout).hookSpecificOutput.displayContent;
  ok('an empty delta yields no leading blank line', eb.startsWith('Teknesyum'), JSON.stringify(eb));
  ok('an empty delta is not doubled', eb.split('Teknesyum').length === 2, JSON.stringify(eb));

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
  ok('a late empty final flush leads with the notice', lateEmpty.startsWith('Teknesyum'), JSON.stringify(lateEmpty));
  ok('a late empty final flush is one line', lateEmpty.indexOf(NLc) === -1, JSON.stringify(lateEmpty));

  const framed = JSON.parse(call(ev({ index: 0, final: true, delta: 'x' })).stdout).hookSpecificOutput.displayContent;
  const bands = framed.split(NLc).filter((l) => l.startsWith('Teknesyum'));
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

  writeContract(root, 'L2', '# L2\nstatus: submitted\nowns: [src/gone.js]\nverify:\n  - true\n');
  const gone = contract(['complete', '--id', 'L2'], root);
  ok('a contract that owns a file nobody wrote cannot close', gone.status === 2, gone.stdout + gone.stderr);

  writeContract(root, 'L3', '# L3\nstatus: submitted\nowns: [../outside.js]\nverify:\n  - true\n');
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

  writeContract(root, 'R1', '# R1\nstatus: active\nowns: [src/ok.js]\nverify:\n  - true\n');
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

  const hooks = JSON.parse(fs.readFileSync(path.join(CORE, 'hooks', 'hooks.json'), 'utf8')).hooks;
  ok('the tool hook no longer runs on every read', /Write\|Edit/.test(hooks.PostToolUse[0].matcher || ''), String(hooks.PostToolUse[0].matcher));
  ok('nor does the failure hook', /Write\|Edit/.test(hooks.PostToolUseFailure[0].matcher || ''), String(hooks.PostToolUseFailure[0].matcher));

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
