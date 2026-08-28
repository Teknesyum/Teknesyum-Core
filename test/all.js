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

function testTitle(root) {
  const TITLE = path.join(CORE, 'hooks', 'title.js');
  const call = (j) => run(process.execPath, [TITLE], { cwd: root, input: JSON.stringify(j), env: { ...process.env, NO_COLOR: '1' } });

  const clean = call({ hook_event_name: 'SessionStart', cwd: os.tmpdir() });
  ok('the title is silent outside a relay', clean.stdout.trim() === '', clean.stdout);
  ok('a silent title still exits 0', clean.status === 0);

  const r = call({ hook_event_name: 'SessionStart', cwd: root });
  let payload = null;
  try {
    payload = JSON.parse(r.stdout);
  } catch {}
  ok('the title emits parsable JSON', payload !== null, r.stdout);
  ok('the title uses terminalSequence', payload && typeof payload.terminalSequence === 'string');
  ok('the title writes no model context', r.stdout.indexOf('additionalContext') === -1 && r.stdout.indexOf('systemMessage') === -1, r.stdout);
  const seq = (payload && payload.terminalSequence) || '';
  ok('the sequence is an OSC title', seq.startsWith(']0;') && seq.endsWith(''), JSON.stringify(seq));
  ok('the title names the plugin', seq.includes('Teknesyum'), seq);
  ok('the title carries no ANSI colour', !/\[/.test(seq), JSON.stringify(seq));
  ok('the title stays short', seq.length <= 130, String(seq.length));

  const hooks = JSON.parse(fs.readFileSync(path.join(CORE, 'hooks', 'hooks.json'), 'utf8')).hooks;
  const wired = Object.keys(hooks).filter((ev) =>
    hooks[ev].some((g) => g.hooks.some((x) => /title\.js/.test(x.command)))
  );
  ok('the title is wired to the events that change state', wired.includes('SessionStart') && wired.includes('Stop') && wired.includes('SubagentStart') && wired.includes('SubagentStop'), wired.join(','));
  ok('the title never runs on PreToolUse', !wired.includes('PreToolUse'), wired.join(','));
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
  advisor: { eco: 'opus/high', normal: 'opus/high', premium: 'fable/high' },
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
      ok('cell ' + row + ' x ' + p + ' is ' + TABLE[row][p], t && cellOf(t) === TABLE[row][p], t && cellOf(t));
      ok('cell ' + row + ' x ' + p + ' names its own cell', t && t.cell === TABLE[row][p], t && t.cell);
    }
  }
  ok('all 24 cells were asserted', cells === 24, String(cells));

  ok('a search subagent is haiku/low in every profile', T.subagent.model === 'haiku' && T.subagent.effort === 'low');
  ok('the council is 1 on eco, 2 on normal, 3 on premium', T.council.eco === 1 && T.council.normal === 2 && T.council.premium === 3);
  ok('the fable pass is gone', T.councilFablePass === undefined && !/councilFablePass/.test(fs.readFileSync(path.join(CORE, 'tiers.json'), 'utf8')));
  ok('the second-opinion rewrite is gone', T.secondOpinion === undefined && !/secondOpinion/.test(fs.readFileSync(path.join(CORE, 'tiers.json'), 'utf8')));
  ok('the model gap is on', T.advisorModelGap === true);
  ok(
    'the premium advisor default names the two builder rows',
    T.advisorDefault.premium.perContract === 1 &&
      T.advisorDefault.premium.onContractOpen.join(',') === 'builder,ui-builder',
    JSON.stringify(T.advisorDefault)
  );

  const { council } = require(CONTRACT);
  const prem = council('premium');
  ok('the premium council returns 3 members', prem.size === 3 && prem.members.length === 3, JSON.stringify(prem));
  ok('the third premium member is fable/high', prem.members[2] === 'fable/high', JSON.stringify(prem.members));
  ok('the first two premium members are opus/high', prem.members[0] === 'opus/high' && prem.members[1] === 'opus/high');
  ok('the eco council is a single planner', council('eco').members.join(',') === 'sonnet/medium');
  ok('the normal council is two planners', council('normal').members.join(',') === 'opus/medium,opus/medium');

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

  ok('signal 1: two identical failures raise the effort', cellOf(tier('builder', { profile: 'normal', repeatFail: 2 })) === 'sonnet/high');
  ok('signal 1: a third failure raises the model', tier('builder', { profile: 'normal', repeatFail: 3 }).model === 'opus');
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

  ok('an opus asker on premium gets fable', cellOf(tier('advisor', { profile: 'premium', asker: 'opus' })) === 'fable/high');
  ok('an opus asker on premium is not blocked', !tier('advisor', { profile: 'premium', asker: 'opus' }).blocked);
  ok('a sonnet asker still gets opus', tier('advisor', { profile: 'normal', asker: 'sonnet' }).model === 'opus');
  ok('a sonnet asker is not blocked', !tier('advisor', { profile: 'normal', asker: 'sonnet' }).blocked);
  ok('an opus asker on normal is blocked', !!tier('advisor', { profile: 'normal', asker: 'opus' }).blocked);
  ok('the block says why', /same model cannot give itself/.test(tier('advisor', { profile: 'normal', asker: 'opus' }).blocked));
  ok('an opus asker on eco is blocked too', !!tier('advisor', { profile: 'eco', asker: 'opus' }).blocked);
  ok('a premium builder is told the advisor opens with it', tier('builder', { profile: 'premium' }).notes.join(' ').includes('opens the advisor alongside'));
  ok('a premium scribe is not', !tier('scribe', { profile: 'premium' }).notes.join(' ').includes('advisor'));

  ok('xhigh is not granted automatically', tier('builder', { profile: 'premium', effort: 'xhigh' }).effort === 'medium');
  ok('xhigh is granted on an explicit user request', tier('builder', { profile: 'premium', effort: 'xhigh', userAsked: true }).effort === 'xhigh');

  for (const row of Object.keys(TABLE)) {
    for (const p of PROFILES) {
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
    'acceptance 3: eco advisor is opus/high and exempt',
    cliAdv.status === 0 && /^advisor opus\/high$/m.test(cliAdv.stdout) && /exempt from the profile ceiling/.test(cliAdv.stdout),
    cliAdv.stdout
  );

  const gapNormal = contract(['tier', '--role', 'advisor', '--profile', 'normal', '--asker', 'opus'], root);
  ok(
    'acceptance: a normal opus asker gets no advisor, with the reason',
    gapNormal.status === 2 && /does not open/.test(gapNormal.stdout) && /same model cannot give itself/.test(gapNormal.stdout),
    gapNormal.stdout
  );

  const gapSonnet = contract(['tier', '--role', 'advisor', '--profile', 'normal', '--asker', 'sonnet'], root);
  ok(
    'acceptance: a normal sonnet asker gets opus/high',
    gapSonnet.status === 0 && /^advisor opus\/high$/m.test(gapSonnet.stdout),
    gapSonnet.stdout
  );

  const gapPrem = contract(['tier', '--role', 'advisor', '--profile', 'premium', '--asker', 'opus'], root);
  ok(
    'acceptance: a premium opus asker gets fable/high',
    gapPrem.status === 0 && /^advisor fable\/high$/m.test(gapPrem.stdout),
    gapPrem.stdout
  );

  const gapEco = contract(['tier', '--role', 'advisor', '--profile', 'eco', '--asker', 'sonnet'], root);
  ok(
    'acceptance: an eco sonnet asker gets opus/high with the exemption note',
    gapEco.status === 0 && /^advisor opus\/high$/m.test(gapEco.stdout) && /exempt from the profile ceiling/.test(gapEco.stdout),
    gapEco.stdout
  );

  const cliCouncil = contract(['council', '--profile', 'premium'], root);
  ok(
    'acceptance: the premium council is 3 members and the third is fable/high',
    cliCouncil.status === 0 && /premium council - 3 members/.test(cliCouncil.stdout) && /3 {2}fable\/high/.test(cliCouncil.stdout),
    cliCouncil.stdout
  );

  const cliScribe = contract(['tier', '--role', 'scribe', '--profile', 'normal'], root);
  ok('acceptance 4: normal scribe is haiku/low', cliScribe.status === 0 && /^scribe haiku\/low$/m.test(cliScribe.stdout), cliScribe.stdout);

  const cliCell = contract(['tier', '--role', 'ui-builder', '--profile', 'premium'], root);
  ok('the command names the cell it came from', /cell +ui-builder x premium = opus\/medium/.test(cliCell.stdout), cliCell.stdout);

  const cliLow = contract(['tier', '--role', 'advisor', '--profile', 'normal', '--model', 'haiku'], root);
  ok('the command refuses to lower a cell', /^advisor opus\/high$/m.test(cliLow.stdout) && /below the cell/.test(cliLow.stdout), cliLow.stdout);

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
  ok('normal has no advisor quota', normal.status === 0 && !/quota/.test(normal.stdout), normal.stdout);

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

  const langPara = skill.split(/\n\s*\n/).filter((p) => /^Everything an agent reads or writes is English/.test(p.trim()));
  ok('SKILL.md carries the language rule', langPara.length === 1, String(langPara.length));
  ok('the language rule is at most three lines', langPara.length === 1 && langPara[0].trim().split('\n').length <= 3, langPara[0]);
  ok(
    'SKILL.md binds the summary to the acceptance items',
    /## Acceptance` items one for one/.test(skill) && /Turkish is only your chat with the user/.test(skill)
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
  ok('D8 records the model gap', /advisorModelGap/.test(d8) && /does not open/.test(d8));
  ok('D8 records the blinding rule', /Blinding/.test(d8) && /draft decision/.test(d8));
  ok('D8 records the frequency rule', /Frequency, in force now/.test(d8) && /same message/.test(d8));
  ok('D8 records the three-member premium council', /3 on premium/.test(d8) && /no fable \*pass\*/.test(d8));
  ok('D8 records the unarbitrated divergence', /unarbitrated/.test(d8) && /exit code/.test(d8));

  const d9 = decisions.slice(decisions.indexOf('## D9'), decisions.indexOf('## Standing law'));
  ok('the agent language decision is recorded', /Agent language/.test(d9));
  ok('D9 records the cost estimate', /2,500/.test(d9) && /1,700/.test(d9) && /5×/.test(d9));
  ok('D9 records the approval fidelity rule', /one for one, unabridged/.test(d9));
  ok('D9 marks the numbers as unmeasured', /unmeasured estimates/.test(d9));
  ok('D8 records the three locks', /Tool set/.test(d8) && /Output ceiling/.test(d8) && /Quota/.test(d8));
  ok('D8 records the two open points', /Settled by the user: opus/.test(d8) && /cost ratios/.test(d8));
}

function main() {
  const root = fixture();
  testGuard(root);
  testGate(root);
  testBypass(root);
  testPrefs(root);
  testScaffold();
  testStatusline(root);
  testTitle(root);
  testLanguage(root);
  testTier(root);
  testQuota(root);
  testTierVisible(root);
  testNoContextWrites();

  process.stdout.write('\n' + pass + ' passed, ' + fail + ' failed\n');
  if (failures.length) {
    process.stdout.write('\n' + failures.map((f) => '  FAIL  ' + f).join('\n') + '\n');
  }
  process.stdout.write('\nfixture: ' + root + '\n');
  process.exitCode = fail ? 1 : 0;
}

main();
