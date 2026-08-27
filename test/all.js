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

function contract(args, cwd) {
  return run(process.execPath, [CONTRACT].concat(args), { cwd });
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
    JSON.stringify({ rules: [{ match: '^README\\.md$', require: ['SIGNATURE-MARK'] }] })
  );

  const blocked = call(readme);
  ok('a README missing a convention is blocked', blocked.status === 2 && /SIGNATURE-MARK/.test(blocked.stderr), blocked.stderr);

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
}

function testNoContextWrites() {
  const watch = path.join(CORE, 'hooks', 'watch.js');
  const r = run(process.execPath, [watch], {
    cwd: process.cwd(),
    input: JSON.stringify({ hook_event_name: 'PostToolUse', tool_name: 'Read', cwd: process.cwd() }),
  });
  ok('the watcher writes nothing to context', r.stdout.trim() === '', r.stdout);

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
}

function main() {
  const root = fixture();
  testGuard(root);
  testGate(root);
  testBypass(root);
  testPrefs(root);
  testStatusline(root);
  testNoContextWrites();

  process.stdout.write('\n' + pass + ' passed, ' + fail + ' failed\n');
  if (failures.length) {
    process.stdout.write('\n' + failures.map((f) => '  FAIL  ' + f).join('\n') + '\n');
  }
  process.stdout.write('\nfixture: ' + root + '\n');
  process.exitCode = fail ? 1 : 0;
}

main();
