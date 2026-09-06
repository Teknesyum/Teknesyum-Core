#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const CORE = path.resolve(__dirname, '..', 'core');
const COUNT = path.join(CORE, 'hooks', 'count.js');
const HANDOFF = path.join(CORE, 'hooks', 'handoff.js');
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

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-'));
  fs.mkdirSync(path.join(root, 'src', 'auth'), { recursive: true });
  fs.writeFileSync(path.join(root, 'src', 'ok.js'), 'module.exports = 1;\n');
  fs.writeFileSync(path.join(root, 'src', 'auth', 'token.js'), 'module.exports = 2;\n');
  run('git', ['init', '-q', '.'], { cwd: root });
  run('git', ['config', 'user.email', 't@t.t'], { cwd: root });
  run('git', ['config', 'user.name', 't'], { cwd: root });
  run('git', ['add', '-A'], { cwd: root });
  run('git', ['commit', '-qm', 'init'], { cwd: root });
  return root;
}

function home() {
  const h = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-home-'));
  fs.mkdirSync(path.join(h, 'teknesyum'), { recursive: true });
  return h;
}

function sweep(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true, maxRetries: 3 });
  } catch {}
}

function hook(script, j, cfg) {
  return run(process.execPath, [script], {
    cwd: j.cwd || process.cwd(),
    input: JSON.stringify(j),
    env: { ...process.env, CLAUDE_CONFIG_DIR: cfg, NO_COLOR: '1' },
  });
}

function edit(root, cfg, rel, sid, text) {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (text !== undefined) fs.writeFileSync(file, text);
  return hook(COUNT, { hook_event_name: 'PostToolUse', tool_name: 'Edit', session_id: sid || 's1', cwd: root, tool_input: { file_path: file } }, cfg);
}

function stateOf(cfg, sid) {
  return JSON.parse(fs.readFileSync(path.join(cfg, 'teknesyum', 'state-' + (sid || 's1') + '.json'), 'utf8'));
}

function testCountSilence() {
  const root = fixture();
  const cfg = home();
  const start = hook(COUNT, { hook_event_name: 'SessionStart', source: 'startup', session_id: 's1', cwd: root }, cfg);
  ok('a fresh session start writes nothing to context', start.stdout === '' && start.status === 0, start.stdout);
  ok('the session start leaves a state file', fs.existsSync(path.join(cfg, 'teknesyum', 'state-s1.json')));

  for (const rel of ['src/a.js', 'src/b.js', 'src/c.js']) {
    const r = edit(root, cfg, rel, 's1', 'x\n');
    ok('below the threshold the hook writes 0 bytes: ' + rel, r.stdout.length === 0 && r.status === 0, r.stdout);
  }
  const st = stateOf(cfg);
  ok('every touched file is counted', Object.keys(st.files).length === 3, JSON.stringify(st.files));
  ok('the diff is summed from git', st.diff === 3, String(st.diff));
  ok('lines in new files are counted but not as edits', st.edited === 0 && Object.values(st.files).every((f) => f.fresh), JSON.stringify(st));

  const read = hook(COUNT, { hook_event_name: 'PostToolUse', tool_name: 'Read', session_id: 's1', cwd: root, tool_input: { file_path: path.join(root, 'src', 'ok.js') } }, cfg);
  ok('a read is neither counted nor answered', read.stdout === '' && Object.keys(stateOf(cfg).files).length === 3, read.stdout);

  const outside = edit(root, cfg, '../elsewhere.js', 's1', 'x\n');
  ok('a file outside the project is ignored', outside.stdout === '' && Object.keys(stateOf(cfg).files).length === 3);
  const hidden = edit(root, cfg, '.claude/handoff.md', 's1', 'x\n');
  ok('the handoff file itself is not counted', hidden.stdout === '' && Object.keys(stateOf(cfg).files).length === 3);

  const stop = hook(COUNT, { hook_event_name: 'Stop', session_id: 's1', cwd: root }, cfg);
  ok('Stop writes nothing', stop.stdout === '' && stop.status === 0, stop.stdout);

  const bad = run(process.execPath, [COUNT], { cwd: root, input: '{not json', env: { ...process.env, CLAUDE_CONFIG_DIR: cfg } });
  ok('bad input never blocks a turn', bad.status === 0 && bad.stdout === '', bad.stderr);
  ok('and is written to the error log instead', fs.existsSync(path.join(cfg, 'teknesyum', 'hook-errors.log')));
  sweep(root);
  sweep(cfg);
}

function testCountThreshold() {
  const count = require(COUNT);
  const root = fixture();
  const cfg = home();
  hook(COUNT, { hook_event_name: 'SessionStart', source: 'startup', session_id: 's1', cwd: root }, cfg);
  for (const rel of ['src/a.js', 'src/b.js', 'src/c.js']) edit(root, cfg, rel, 's1', 'x\n');
  const fourth = edit(root, cfg, 'src/d.js', 's1', 'x\n');
  ok('the fourth file is still silent', fourth.stdout === '', fourth.stdout);
  const fifth = edit(root, cfg, 'src/e.js', 's1', 'x\n');
  let j = null;
  try {
    j = JSON.parse(fifth.stdout);
  } catch {}
  ok('the fifth file speaks once, as PostToolUse context', j && j.hookSpecificOutput && j.hookSpecificOutput.hookEventName === 'PostToolUse', fifth.stdout);
  const line = j ? j.hookSpecificOutput.additionalContext : '';
  ok('the line says how many files and asks for a plan', /5 files touched/.test(line) && /docs\/plan\.md/.test(line), line);
  ok('the line stays under 40 tokens', line.split(/\s+/).length <= 40, String(line.split(/\s+/).length));
  const sixth = edit(root, cfg, 'src/f.js', 's1', 'x\n');
  ok('the sixth file is silent again', sixth.stdout === '', sixth.stdout);

  ok('a risky path is the reason before any count', count.reason({ files: { 'src/auth/token.js': { adds: 1, dels: 0 } }, diff: 1 }) === 'src/auth/token.js');
  ok('a big diff is a reason on its own', /^200 /.test(count.reason({ files: { 'a.js': { adds: 200, dels: 0 } }, diff: 200 })));
  ok('a big diff made of new files is not', count.reason({ files: { 'a.js': { adds: 200, dels: 0, fresh: true } }, diff: 200, edited: 0 }) === '');
  ok('edited lines are what count when known', /^160 /.test(count.reason({ files: { 'a.js': { adds: 200, dels: 0, fresh: true }, 'b.js': { adds: 160, dels: 0 } }, diff: 360, edited: 160 })));
  ok('below both nothing is a reason', count.reason({ files: { 'a.js': { adds: 5, dels: 0 } }, diff: 5 }) === '');
  for (const p of ['db/migrations/001.sql', '.github/workflows/ci.yml', 'Dockerfile', 'src/config.js', 'package-lock.json', 'lib/security.js'])
    ok('risky: ' + p, count.RISK.test(p));
  for (const p of ['src/index.js', 'README.md', 'docs/plan.md']) ok('ordinary: ' + p, !count.RISK.test(p));

  const root2 = fixture();
  hook(COUNT, { hook_event_name: 'SessionStart', source: 'startup', session_id: 's2', cwd: root2 }, cfg);
  const risky = edit(root2, cfg, 'src/auth/token.js', 's2', 'module.exports = 3;\n');
  ok('one risky file speaks at once', /src\/auth\/token\.js/.test(risky.stdout), risky.stdout);

  const root3 = fixture();
  fs.mkdirSync(path.join(root3, 'docs'));
  fs.writeFileSync(path.join(root3, 'docs', 'plan.md'), '# plan\n');
  hook(COUNT, { hook_event_name: 'SessionStart', source: 'startup', session_id: 's3', cwd: root3 }, cfg);
  let noise = '';
  for (const rel of ['src/a.js', 'src/b.js', 'src/c.js', 'src/d.js', 'src/e.js', 'src/auth/x.js']) noise += edit(root3, cfg, rel, 's3', 'x\n').stdout;
  ok('with a plan on disk the hook never speaks', noise === '', noise);

  sweep(root);
  sweep(root2);
  sweep(root3);
  sweep(cfg);
}

function testCountTests() {
  const root = fixture();
  const cfg = home();
  hook(COUNT, { hook_event_name: 'SessionStart', source: 'startup', session_id: 's1', cwd: root }, cfg);
  const sh = (command, response) =>
    hook(COUNT, { hook_event_name: 'PostToolUse', tool_name: 'Bash', session_id: 's1', cwd: root, tool_input: { command }, tool_response: response }, cfg);
  ok('a plain command is silent', sh('ls', 'a b c').stdout === '');
  sh('npm test', '12 passing');
  sh('npx jest', '1 failed, 3 passed');
  sh('git status', 'clean');
  const st = stateOf(cfg);
  ok('test commands are recorded, others are not', st.tests.length === 2, JSON.stringify(st.tests));
  ok('the outcome is read from the output', st.tests[0].ok === true && st.tests[1].ok === false, JSON.stringify(st.tests));
  sweep(root);
  sweep(cfg);
}

function testHandoff() {
  const handoff = require(HANDOFF);
  const root = fixture();
  const cfg = home();
  const transcript = path.join(cfg, 's1.jsonl');
  fs.writeFileSync(transcript, [
    JSON.stringify({ type: 'user', isMeta: true, message: { role: 'user', content: 'Caveat: hidden' } }),
    JSON.stringify({ type: 'user', message: { role: 'user', content: [{ type: 'text', text: '<system-reminder>noise</system-reminder>add a --dry flag to the cli' }] } }),
    JSON.stringify({ type: 'assistant', message: { role: 'assistant', content: [{ type: 'text', text: 'ok' }] } }),
    JSON.stringify({ type: 'user', message: { role: 'user', content: [{ type: 'tool_result', content: 'x' }] } }),
    JSON.stringify({ type: 'user', message: { role: 'user', content: 'second prompt' } }),
  ].join('\n') + '\n');
  hook(COUNT, { hook_event_name: 'SessionStart', source: 'startup', session_id: 's1', cwd: root, transcript_path: transcript }, cfg);
  ok('the session start files the transcript path into state', stateOf(cfg).transcript === transcript, stateOf(cfg).transcript);

  const idle = hook(HANDOFF, { hook_event_name: 'SessionEnd', session_id: 's1', cwd: root }, cfg);
  ok('an untouched session leaves no handoff', idle.status === 0 && !fs.existsSync(path.join(root, '.claude', 'handoff.md')));

  edit(root, cfg, 'src/a.js', 's1', 'x\n');
  hook(COUNT, { hook_event_name: 'PostToolUse', tool_name: 'Bash', session_id: 's1', cwd: root, tool_input: { command: 'npm test' }, tool_response: 'ok' }, cfg);
  const end = hook(HANDOFF, { hook_event_name: 'SessionEnd', session_id: 's1', cwd: root }, cfg);
  const file = path.join(root, '.claude', 'handoff.md');
  ok('a session that touched files ends with a handoff', end.status === 0 && fs.existsSync(file), end.stderr);
  const body = fs.readFileSync(file, 'utf8');
  ok('changed files come from git', /## changed_files/.test(body) && /src\/a\.js/.test(body), body);
  ok('the handoff opens with the one-line rule for the next session', /^# Handoff[^\n]*\n\n[^\n]*unfinished part/.test(body), body);
  ok('tests run are listed', /## tests_run/.test(body) && /npm test/.test(body), body);
  ok('plan is answered', /## plan\nnone/.test(body), body);
  ok('task is the first user prompt of the session, stripped of tags', /## task\nadd a --dry flag to the cli\n/.test(body), body);
  ok('firstPrompt skips meta and tool results and cuts at 2000', handoff.firstPrompt(transcript) === 'add a --dry flag to the cli' && handoff.firstPrompt('nope') === '' && handoff.firstPrompt.length === 1);
  ok('decisions and next_action are left to the model', /## decisions\n\(fill\)/.test(body) && /## next_action\n\(fill\)/.test(body), body);

  fs.writeFileSync(file, body.replace('## decisions\n(fill)', '## decisions\nkeep the cache').replace('## next_action\n(fill)', '## next_action\nrun the bench'));
  hook(HANDOFF, { hook_event_name: 'SessionEnd', session_id: 's1', cwd: root }, cfg);
  const again = fs.readFileSync(file, 'utf8');
  ok('a regenerated handoff keeps what the model wrote', /keep the cache/.test(again) && /run the bench/.test(again) && /## task\nadd a --dry flag/.test(again), again);
  ok('section() reads a filled section and ignores the placeholder', handoff.section(again, 'decisions') === 'keep the cache' && handoff.section(body, 'decisions') === '');

  const resume = hook(COUNT, { hook_event_name: 'SessionStart', source: 'resume', session_id: 's1', cwd: root }, cfg);
  ok('the next session start points at the handoff', /handoff\.md/.test(resume.stdout), resume.stdout);
  ok('and says nothing else', resume.stdout.trim().split('\n').length === 1, resume.stdout);
  const compact = hook(COUNT, { hook_event_name: 'SessionStart', source: 'compact', session_id: 's1', cwd: root }, cfg);
  ok('a compaction is not a new session', compact.stdout === '', compact.stdout);
  ok('a resume keeps the counted files', Object.keys(stateOf(cfg).files).length === 1);
  hook(COUNT, { hook_event_name: 'SessionStart', source: 'clear', session_id: 's1', cwd: root }, cfg);
  ok('a clear starts the count over', Object.keys(stateOf(cfg).files).length === 0);

  sweep(root);
  sweep(cfg);
}

function testContextCue() {
  const root = fixture();
  const cfg = home();
  hook(COUNT, { hook_event_name: 'SessionStart', source: 'startup', session_id: 's1', cwd: root }, cfg);
  edit(root, cfg, 'src/a.js', 's1', 'x\n');
  const line = (pct) =>
    run(process.execPath, [STATUSLINE], {
      cwd: root,
      input: JSON.stringify({ session_id: 's1', workspace: { current_dir: root }, context_window: { used_percentage: pct } }),
      env: { ...process.env, CLAUDE_CONFIG_DIR: cfg, NO_COLOR: '1' },
    }).stdout;
  ok('the statusline shows the count', /1 files \+1-0/.test(line(30)), line(30));
  ok('and says there is no plan', /no plan/.test(line(30)), line(30));
  ok('and the context percentage', /context 30%/.test(line(30)), line(30));
  ok('the statusline files the percentage into state', stateOf(cfg).ctx === 30, String(stateOf(cfg).ctx));
  line(64);
  const cue = edit(root, cfg, 'src/b.js', 's1', 'y\n');
  ok('past the mark the next edit speaks once about the handoff', /64%/.test(cue.stdout) && /handoff\.md/.test(cue.stdout), cue.stdout);
  ok('and the handoff is already on disk', fs.existsSync(path.join(root, '.claude', 'handoff.md')));
  const after = edit(root, cfg, 'src/c.js', 's1', 'z\n');
  ok('it does not repeat', after.stdout === '', after.stdout);
  ok('the statusline shows the handoff', /handoff/.test(line(64)), line(64));
  fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
  fs.writeFileSync(path.join(root, 'docs', 'plan.md'), 'p');
  ok('a plan on disk shows as plan', /· plan ·/.test(line(64)), line(64));
  const quiet = run(process.execPath, [STATUSLINE], { cwd: root, input: JSON.stringify({ workspace: { current_dir: root } }), env: { ...process.env, CLAUDE_CONFIG_DIR: cfg, NO_COLOR: '1' } });
  ok('nothing is printed when the client did not send a percentage', !/%/.test(quiet.stdout), quiet.stdout);
  sweep(root);
  sweep(cfg);
}

function testWiring() {
  const hooks = JSON.parse(fs.readFileSync(path.join(CORE, 'hooks', 'hooks.json'), 'utf8')).hooks;
  const events = Object.keys(hooks).sort().join(',');
  ok('exactly the six events are wired', events === 'Notification,PostToolUse,PreToolUse,SessionEnd,SessionStart,Stop', events);
  for (const ev of Object.keys(hooks))
    for (const g of hooks[ev])
      for (const h of g.hooks) {
        const m = /hooks\/([a-z]+\.js)/.exec(h.command);
        ok(ev + ' points at a file that exists', m && fs.existsSync(path.join(CORE, 'hooks', m[1])), h.command);
      }
  for (const gone of ['guard.js', 'cue.js', 'watch.js', 'seal.js', 'closure.js', 'autoclose.js', 'embed.js', 'schema.js', 'notice.js'])
    ok('the relay hook is out of the tree: ' + gone, !fs.existsSync(path.join(CORE, 'hooks', gone)));
  for (const gone of ['contract.js', 'risk.js', 'verify-runner.js'])
    ok('the contract script is out of the tree: ' + gone, !fs.existsSync(path.join(CORE, 'scripts', gone)));
  for (const gone of ['roles', 'agents', 'skills', 'tiers.json'])
    ok('the relay folder is out of the tree: ' + gone, !fs.existsSync(path.join(CORE, gone)));
  const lib = fs.readFileSync(path.join(CORE, 'hooks', 'lib.js'), 'utf8');
  ok('lib.js no longer knows about the relay', !/relayRoot|liveDir|ensureRelay/.test(lib));
  const speakers = fs.readdirSync(path.join(CORE, 'hooks')).filter((f) => /\.js$/.test(f) && fs.readFileSync(path.join(CORE, 'hooks', f), 'utf8').includes('additionalContext'));
  ok('only count.js writes into the context', speakers.join(',') === 'count.js', speakers.join(','));
  const pkg = JSON.parse(fs.readFileSync(path.resolve(CORE, '..', 'package.json'), 'utf8'));
  const plug = JSON.parse(fs.readFileSync(path.join(CORE, '.claude-plugin', 'plugin.json'), 'utf8'));
  const market = JSON.parse(fs.readFileSync(path.resolve(CORE, '..', '.claude-plugin', 'marketplace.json'), 'utf8'));
  ok('the two version fields agree', pkg.version === plug.version, [pkg.version, plug.version].join(' '));
  ok('no description still sells a contract gate', ![pkg.description, plug.description, market.plugins[0].description, market.description].some((d) => /contract|relay/i.test(d)), plug.description);
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
    call({ tool_name: 'Write', tool_input: { file_path: path.join(root, 'README.md'), content: '# x\nSIGNATURE-MARK\n' } }).status === 0
  );
  ok('an unrelated file is untouched', call({ tool_name: 'Write', tool_input: { file_path: path.join(root, 'src', 'ok.js'), content: 'x' } }).status === 0);
  call(readme);
  ok('the gate stops repeating itself', call(readme).status === 0);
  sweep(cfg);
}

function testLanguage(root) {
  const { t } = require(path.join(CORE, 'hooks', 'lib.js'));
  ok('an unknown key returns itself', t('no.such.key') === 'no.such.key');

  const table = JSON.parse(fs.readFileSync(path.join(CORE, 'strings.json'), 'utf8'));
  const keys = Object.keys(table);
  ok('every string has an English original', keys.every((k) => typeof table[k].en === 'string' && table[k].en.length));
  ok('the table is small', JSON.stringify(table).length < 8000, String(JSON.stringify(table).length));
  ok('no relay strings are left', !keys.some((k) => /^(role\.|notice\.|line\.(contracts|agents|open|blocked))/.test(k)), keys.join(' '));

  const h = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-lang-'));
  fs.mkdirSync(path.join(h, 'teknesyum'), { recursive: true });
  const setLang = (v) => fs.writeFileSync(path.join(h, 'teknesyum', 'config.json'), JSON.stringify(v === null ? {} : { lang: v }));
  const env = (extra) => ({ ...process.env, CLAUDE_CONFIG_DIR: h, NO_COLOR: '1', ...extra });
  const statusline = () =>
    run(process.execPath, [STATUSLINE], { cwd: root, input: JSON.stringify({ workspace: { current_dir: root }, context_window: { used_percentage: 12 } }), env: env() }).stdout;
  const ask = () =>
    JSON.parse(run(process.execPath, [path.join(CORE, 'scripts', 'setup.js'), '--check'], { cwd: root, env: env() }).stdout)
      .missing.map((m) => m.ask)
      .join(' | ');

  setLang(null);
  ok('English is the default', /context 12%/.test(statusline()), statusline());
  setLang('tr');
  ok('the statusline follows the language', /bağlam 12%/.test(statusline()), statusline());
  ok('setup asks in the chosen language', /çalsın/.test(ask()), ask());
  ok('setup no longer asks about contracts or profiles', !/sözleşme|profil|araştırma/i.test(ask()), ask());

  const applied = run(process.execPath, [path.join(CORE, 'scripts', 'setup.js'), '--apply', '--lang', 'tr', '--notify', 'no'], { cwd: root, env: env() }).stdout;
  const block = applied.split(String.fromCharCode(10) + String.fromCharCode(10))[1] || '';
  const rows = block.split(String.fromCharCode(10)).filter((l) => l.startsWith('  ') && l.trim());
  ok('every summary label is padded clear of its value', rows.length > 0 && rows.every((l) => /^ {2}\S.*\s{2,}\S/.test(l)), JSON.stringify(rows));
  ok('the summary is translated', /kuruldu/.test(applied), applied);

  const cfgPath = path.join(h, 'teknesyum', 'config.json');
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
  ok('an unknown language falls back to English', /context 12%/.test(statusline()), statusline());
  sweep(h);
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
  ok('scaffold sets the license field', JSON.parse(fs.readFileSync(path.join(repo, 'package.json'), 'utf8')).license === 'AGPL-3.0-or-later');
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
  sweep(cfg);
  sweep(repo);
}

function testMapGuards() {
  const root = fixture();
  const MAP = path.join(CORE, 'scripts', 'map.js');
  const map = require(MAP);

  fs.writeFileSync(path.join(root, 'src', 'a.js'), "require('./ok.js');\n");
  fs.writeFileSync(path.join(root, 'src', 'b.js'), "require('./ok.js');\nrequire('./a.js');\n");
  run(process.execPath, [MAP, root], { cwd: root });

  const json = JSON.parse(fs.readFileSync(path.join(root, '.claude', 'map.json'), 'utf8'));
  ok('the map lands under .claude without a relay', json._map.schema === map.SCHEMA, JSON.stringify(json._map));
  ok('the map stamps how many files it saw', json._map.files > 0, JSON.stringify(json._map));

  ok('a map that lost half its files is refused', !!map.shrinkFault({ _map: { files: 100 } }, 20));
  ok('a map that grew is not refused', !map.shrinkFault({ _map: { files: 100 } }, 120));
  ok('a first map is not refused', !map.shrinkFault(null, 3));

  const tight = run(process.execPath, [MAP, root, '--budget=400'], { cwd: root });
  const md = fs.readFileSync(path.join(root, '.claude', 'map.md'), 'utf8');
  ok('a truncated map says so instead of ending quietly', /Showing \d+ of \d+ importing files/.test(md), md.slice(-400));
  ok('and the run says it too', /left out of map\.md/.test(tight.stdout), tight.stdout);

  run(process.execPath, [MAP, root], { cwd: root });
  const first = fs.readFileSync(path.join(root, '.claude', 'map.md'), 'utf8').split('\n').slice(0, 7).join('\n');
  ok('the map says which HEAD it was built at, up top', /Built at HEAD [0-9a-f]{8}/.test(first), first);

  const known = run(process.execPath, [MAP, 'who', 'src/a.js'], { cwd: root });
  ok('who answers from the map when the map is fresh', /src\/b\.js/.test(known.stdout), known.stdout);

  fs.writeFileSync(path.join(root, 'src', 'late.js'), "require('./ok.js');\n");
  run('git', ['-C', root, 'add', '-A']);
  run('git', ['-C', root, 'commit', '-qm', 'a file the map never saw']);
  const late = run(process.execPath, [MAP, 'who', 'src/late.js'], { cwd: root });
  ok('who falls back to a live scan instead of saying it is not there', late.status === 0 && /live scan/.test(late.stdout), late.stdout);
  sweep(root);
}

function testChime() {
  const root = fixture();
  const h = path.join(root, 'home');
  fs.mkdirSync(h, { recursive: true });
  const notify = path.join(CORE, 'hooks', 'notify.js');
  const n = require(notify);
  const settings = n.resolveSettings(root);
  ok('no turn is too short to announce by default', !settings.events.done.minMs);
  ok('waiting and error carry no delay either', !settings.events.waiting.minMs && !settings.events.error.minMs);

  const old = process.env.CLAUDE_CONFIG_DIR;
  process.env.CLAUDE_CONFIG_DIR = h;
  const iki = path.join(root, 'ikinci-proje');
  const beep = Date.now();
  n.stamp('done', beep, root);
  ok('a bell just rung here is not rung again', n.recently('done', beep + 1000, root));
  ok('but the next project still gets its own', !n.recently('done', beep + 1000, iki));
  n.stamp('done', beep + 1000, iki);
  ok('and each project keeps its own last bell', n.recently('done', beep + 2000, iki));
  if (old === undefined) delete process.env.CLAUDE_CONFIG_DIR;
  else process.env.CLAUDE_CONFIG_DIR = old;

  const asks = (kind) => n.wanted({ notification_type: kind, cwd: root });
  ok('a permission prompt is the user being called', asks('permission_prompt'));
  ok('so is an agent that needs an answer', asks('agent_needs_input'));
  ok('and a dialog an MCP server put up', asks('elicitation_dialog') && asks('elicitation_url_dialog'));
  ok('an idle nudge is not', !asks('idle_prompt'));
  ok('neither is a subagent finishing under a turn that goes on', !asks('agent_completed'));
  ok('a build that names no type rings', n.wanted({ cwd: root }));
  ok('the bell no longer asks the relay whether it is busy', !('busy' in n));

  const silent = run(process.execPath, [notify], {
    cwd: root,
    env: { ...process.env, CLAUDE_CONFIG_DIR: h, TEKNESYUM_BEEP_SESSIZ: '1' },
    input: JSON.stringify({ hook_event_name: 'Notification', notification_type: 'permission_prompt', cwd: root }),
  });
  ok('the bell writes nothing to context', silent.stdout.trim() === '' && silent.status === 0, silent.stdout);
  sweep(root);
}

function testLoop() {
  const LOOP = path.join(CORE, 'hooks', 'loop.js');
  const call = (tool, command) =>
    run(process.execPath, [LOOP], { cwd: CORE, input: JSON.stringify({ tool_name: tool, tool_input: { command } }), env: { ...process.env, CLAUDE_CONFIG_DIR: home() } });
  const deny = (r) => {
    try {
      return JSON.parse(r.stdout).hookSpecificOutput.permissionDecision === 'deny';
    } catch {
      return false;
    }
  };
  const forever = call('Bash', 'until grep -qE "passed|failed" out.txt; do sleep 5; done; tail -4 out.txt');
  ok('an until loop with no bound is denied', forever.status === 0 && deny(forever), forever.stdout);
  ok('the denial explains how to bound it', /timeout/.test(forever.stdout), forever.stdout);
  ok('a while true loop is denied too', deny(call('Bash', 'while true; do sleep 10; done')));
  ok('a PowerShell wait loop is denied', deny(call('PowerShell', 'while (-not (Test-Path out.txt)) { Start-Sleep 5 }')));
  ok('timeout makes it pass', !deny(call('Bash', 'timeout 5400 bash -c "until grep -q passed out.txt; do sleep 5; done"')));
  ok('a counter makes it pass', !deny(call('Bash', 'i=0; until grep -q passed out.txt || [ $i -ge 60 ]; do sleep 5; i=$((i+1)); done')));
  ok('a Get-Date deadline makes it pass', !deny(call('PowerShell', '$end = (Get-Date).AddMinutes(90); while ((Get-Date) -lt $end -and -not (Test-Path out.txt)) { Start-Sleep 5 }')));
  ok('a while read loop is not a wait', !deny(call('Bash', 'while read l; do echo $l; sleep 1; done < list.txt')));
  ok('a plain command passes', !deny(call('Bash', 'npm test --silent && git status')));
  ok('a Write is not looked at', !deny(call('Write', 'until x; do sleep 1; done')));
  const junk = run(process.execPath, [LOOP], { cwd: CORE, input: '{nope', env: { ...process.env, CLAUDE_CONFIG_DIR: home() } });
  ok('bad input exits quietly', junk.status === 0 && junk.stdout === '');
}

function testProcs() {
  const procs = require(path.join(CORE, 'scripts', 'procs.js'));
  const now = 10 * 60 * 60 * 1000;
  const h = (min) => now - min * 60000;
  const rows = [
    { pid: 1, ppid: 0, name: 'explorer.exe', start: h(600) },
    { pid: 10, ppid: 1, name: 'claude.exe', start: h(500) },
    { pid: 11, ppid: 10, name: 'node.exe', start: h(500) },
    { pid: 20, ppid: 10, name: 'bash.exe', start: h(400) },
    { pid: 21, ppid: 20, name: 'bash.exe', start: h(400) },
    { pid: 22, ppid: 21, name: 'python.exe', start: h(399) },
    { pid: 23, ppid: 21, name: 'conhost.exe', start: h(399) },
    { pid: 30, ppid: 10, name: 'bash.exe', start: h(3) },
    { pid: 40, ppid: 1, name: 'bash.exe', start: h(900) },
    { pid: 50, ppid: 10, name: 'powershell.exe', start: h(45) },
  ];
  const hits = procs.stale(rows, now);
  const pids = hits.map((x) => x.pid).sort((a, b) => a - b).join(',');
  ok('a shell under claude and what it spawned count once old', pids === '20,21,22,50', pids);
  ok('an MCP server straight under claude does not count', !hits.some((x) => x.pid === 11));
  ok('a young shell does not count', !hits.some((x) => x.pid === 30));
  ok('a shell outside claude does not count', !hits.some((x) => x.pid === 40));
  ok('the oldest comes first in minutes', hits[0].minutes === 400, JSON.stringify(hits[0]));
  ok('nothing stale gives an empty list', procs.stale([{ pid: 10, ppid: 1, name: 'claude', start: h(500) }], now).length === 0);

  const root = fixture();
  const cfg = home();
  fs.writeFileSync(path.join(cfg, 'teknesyum', 'procs.json'), JSON.stringify({ at: Date.now(), count: 3, oldest: 40, names: ['bash.exe'] }));
  const line = (extra) =>
    run(process.execPath, [STATUSLINE], { cwd: root, input: JSON.stringify({ workspace: { current_dir: root } }), env: { ...process.env, CLAUDE_CONFIG_DIR: cfg, NO_COLOR: '1', TEKNESYUM_PROCS_OFF: '', ...extra } }).stdout;
  ok('the statusline shows the stale count', /⏳ 3 processes 40 min/.test(line()), line());
  fs.writeFileSync(path.join(cfg, 'teknesyum', 'config.json'), JSON.stringify({ lang: 'tr' }));
  ok('and says it in Turkish', /⏳ 3 süreç 40 dk/.test(line()), line());
  fs.writeFileSync(path.join(cfg, 'teknesyum', 'config.json'), '{}');
  fs.writeFileSync(path.join(cfg, 'teknesyum', 'procs.json'), JSON.stringify({ at: Date.now(), count: 0, oldest: 0, names: [] }));
  ok('zero stays off the line', !/⏳/.test(line()), line());
  sweep(root);
  sweep(cfg);
}

function testAgency() {
  const AGENCY = path.join(CORE, 'scripts', 'agency.js');
  const cfg = home();
  const at = path.join(cfg, 'teknesyum', 'agency');
  fs.mkdirSync(path.join(at, 'design'), { recursive: true });
  fs.mkdirSync(path.join(at, 'strategy'), { recursive: true });
  fs.writeFileSync(path.join(at, 'design', 'design-ui-designer.md'), '---\nname: UI Designer\ndescription: Expert UI designer for interfaces\ncolor: purple\n---\n\n# UI Designer Agent Personality\n\nYou are **UI Designer**.\n\n## 🧠 Your Identity & Memory\n\nsecret memory\n\n## 🎯 Your Core Mission\n\nmake it consistent\n\n## 🎯 Your Success Metrics\n\nwishes\n');
  fs.writeFileSync(path.join(at, 'design', 'design-ux-researcher.md'), '---\nname: UX Researcher\ndescription: Interviews and usability studies\n---\n\n# UX\n\n## 🎯 Your Core Mission\n\nask users\n');
  fs.writeFileSync(path.join(at, 'strategy', 'playbook.md'), '---\nname: Not An Agent\n---\n');
  const env = { ...process.env, CLAUDE_CONFIG_DIR: cfg };
  const call = (...a) => run(process.execPath, [AGENCY, ...a], { cwd: CORE, env });
  const listed = call('list').stdout;
  ok('list names every agent once', /design-ui-designer  UI Designer/.test(listed) && /design-ux-researcher/.test(listed) && !/playbook/.test(listed), listed);
  ok('list takes a division', call('list', 'design').stdout.split('\n').filter(Boolean).length === 2);
  ok('find ranks the name hit first', /^design-ui-designer/.test(call('find', 'ui').stdout), call('find', 'ui').stdout);
  ok('find says when nothing matches', /nothing matches/.test(call('find', 'zzz').stdout));
  const leanText = call('show', 'ui-designer', '--lean').stdout;
  ok('lean keeps the mission and drops memory and metrics', /make it consistent/.test(leanText) && !/secret memory/.test(leanText) && !/wishes/.test(leanText) && !/^---/.test(leanText), leanText);
  ok('lean strips the emoji from headings', /^## Your Core Mission$/m.test(leanText), leanText);
  ok('show without lean is the file as it is', /secret memory/.test(call('show', 'design-ui-designer').stdout));
  ok('show names a missing slug', /not found: nope/.test(call('show', 'nope').stdout));
  const root = fixture();
  fs.writeFileSync(path.join(root, 'ask.md'), 'Soru?');
  fs.writeFileSync(path.join(root, 'reply.md'), 'Cevap.');
  const rec = run(process.execPath, [AGENCY, 'record', '--topic', 'Buton rengi', '--agents', 'design-ui-designer', '--ask', 'ask.md', '--reply', 'reply.md', '--cost', '0.04 $'], { cwd: root, env });
  const file = path.join(root, rec.stdout.trim());
  const body = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  ok('record writes the numbered file under docs/danisma', /docs[\\/]danisma[\\/]001-buton-rengi\.md/.test(rec.stdout), rec.stdout);
  ok('record keeps both sides verbatim', /## Girdi\n\nSoru\?/.test(body) && /## Donen\n\nCevap\./.test(body) && /danisilan: agency\/design-ui-designer/.test(body) && /maliyet: 0\.04 \$/.test(body), body);
  const empty = home();
  const none = run(process.execPath, [AGENCY, 'list'], { cwd: CORE, env: { ...process.env, CLAUDE_CONFIG_DIR: empty } });
  ok('without the repo it says how to fetch', none.status === 1 && /agency\.js fetch/.test(none.stdout), none.stdout);
  sweep(root);
  sweep(cfg);
  sweep(empty);
}

function testDoctor() {
  const r = run(process.execPath, [path.join(CORE, 'scripts', 'doctor.js'), '--json'], { cwd: path.resolve(CORE, '..') });
  let rows = [];
  try {
    rows = JSON.parse(r.stdout);
  } catch {}
  const names = rows.map((x) => x.name).join(',');
  ok('doctor runs the seven checks that are left', names === 'node,git,version,hooks,statusline,map,logs', names + ' ' + r.stderr);
}

function testScan() {
  const SCAN = path.join(CORE, 'scripts', 'scan.js');
  const root = fixture();
  const cfg = home();
  const env = { ...process.env, CLAUDE_CONFIG_DIR: cfg };
  const scan = (...args) => {
    const r = run(process.execPath, [SCAN, '--json', ...args], { cwd: root, env });
    let out = { rows: [] };
    try {
      out = JSON.parse(r.stdout);
    } catch {}
    return { status: r.status, profile: out.profile, rows: Object.fromEntries(out.rows.map((x) => [x.name, x])), raw: r.stdout + r.stderr };
  };
  let s = scan();
  ok('scan names the seven checks', Object.keys(s.rows).join(',') === 'license,plan,handoff,docs,tests,trash,map', s.raw);
  ok('scan defaults to normal when config has no profile', s.profile === 'normal', s.profile);
  ok('scan takes the profile from the argument', scan('eco').profile === 'eco');
  ok('a bare repo is short on license', s.rows.license.ok === false && /no LICENSE/.test(s.rows.license.measure), s.rows.license.measure);
  fs.writeFileSync(path.join(root, 'LICENSE'), 'GNU AFFERO GENERAL PUBLIC LICENSE\nVersion 3\n');
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ name: 'x', version: '1.2.3', license: 'MIT', scripts: { test: 'node t.js' } }));
  s = scan();
  ok('license surfaces that disagree are named', s.rows.license.ok === false && /package\.json says mit/.test(s.rows.license.measure), s.rows.license.measure);
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ name: 'x', version: '1.2.3', license: 'AGPL-3.0-or-later', scripts: { test: 'node t.js' } }));
  for (let i = 0; i < 5; i += 1) fs.writeFileSync(path.join(root, 'src', 'f' + i + '.js'), 'module.exports = ' + i + ';\n');
  run('git', ['add', '-A'], { cwd: root });
  run('git', ['commit', '-qm', 'five'], { cwd: root });
  for (let i = 0; i < 5; i += 1) fs.writeFileSync(path.join(root, 'src', 'f' + i + '.js'), 'module.exports = ' + (i + 10) + ';\n');
  s = scan();
  ok('five changed files without a plan fall short', s.rows.plan.ok === false && /5 files/.test(s.rows.plan.measure), s.rows.plan.measure);
  fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
  fs.writeFileSync(path.join(root, 'docs', 'plan.md'), '# plan\n');
  fs.mkdirSync(path.join(root, '.claude'), { recursive: true });
  fs.writeFileSync(path.join(root, '.claude', 'handoff.md'), '## decisions\n(fill)\n\n## next_action\ndone\n');
  fs.writeFileSync(path.join(root, 'README.md'), '# x\n\ncurl .../v1.2.3/install.sh\n');
  s = scan('eco');
  ok('a plan on disk clears the plan check', s.rows.plan.ok === true && /plan on disk/.test(s.rows.plan.measure), s.rows.plan.measure);
  ok('a (fill) hole in the handoff is named', s.rows.handoff.ok === false && /decisions/.test(s.rows.handoff.measure) && !/next_action/.test(s.rows.handoff.measure), s.rows.handoff.measure);
  ok('eco reads only the README', s.rows.docs.ok === true && /1 documents/.test(s.rows.docs.measure), s.rows.docs.measure);
  s = scan('normal');
  ok('normal wants a changelog too', s.rows.docs.ok === false && /CHANGELOG\.md is missing/.test(s.rows.docs.measure), s.rows.docs.measure);
  fs.writeFileSync(path.join(root, 'README.md'), '# x\n\ncurl .../v1.0.0/install.sh\n');
  s = scan('eco');
  ok('an install line on an old tag is named', s.rows.docs.ok === false && /v1\.0\.0, not v1\.2\.3/.test(s.rows.docs.measure), s.rows.docs.measure);
  ok('the license check is quiet once surfaces agree', s.rows.license.ok === true, s.rows.license.measure);
  ok('exit is 1 while anything is short', s.status === 1);
  const help = run(process.execPath, [SCAN, '--help'], { cwd: root, env });
  ok('help says nothing is written and no model runs', /Nothing is written, no model runs/.test(help.stdout), help.stdout);
  sweep(root);
  sweep(cfg);
}

function main() {
  const root = fixture();
  const suites = [
    ['count silence', testCountSilence],
    ['count threshold', testCountThreshold],
    ['count tests', testCountTests],
    ['handoff', testHandoff],
    ['context cue', testContextCue],
    ['wiring', testWiring],
    ['prefs', () => testPrefs(root)],
    ['language', () => testLanguage(root)],
    ['scaffold', testScaffold],
    ['map guards', testMapGuards],
    ['chime', testChime],
    ['loop gate', testLoop],
    ['stale processes', testProcs],
    ['agency', testAgency],
    ['doctor', testDoctor],
    ['scan', testScan],
  ];
  for (const [name, fn] of suites) {
    try {
      fn();
    } catch (e) {
      fail += 1;
      failures.push(name + ' threw: ' + ((e && e.stack) || e));
    }
  }
  sweep(root);
  process.stdout.write(pass + ' passed, ' + fail + ' failed\n');
  for (const f of failures) process.stdout.write('  FAIL ' + f + '\n');
  process.exit(fail ? 1 : 0);
}

main();
