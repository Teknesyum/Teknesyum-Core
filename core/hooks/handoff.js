const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { read, stateFile, safe } = require('./lib.js');

const FILE = path.join('.claude', 'handoff.md');
const FILL = '(fill)';

function git(cwd, args) {
  const r = spawnSync('git', ['-C', cwd].concat(args), { encoding: 'utf8', windowsHide: true, timeout: 10000 });
  return r.error || r.status !== 0 ? '' : String(r.stdout).trim();
}

function section(body, name) {
  const m = new RegExp('^## ' + name + '\\n([\\s\\S]*?)(?=^## |\\s*$)', 'm').exec(body || '');
  const text = m ? m[1].trim() : '';
  return text && text !== FILL ? text : '';
}

function render(cwd, st, old) {
  const stat = git(cwd, ['diff', '--stat', 'HEAD']) || '(no diff)';
  const untracked = git(cwd, ['ls-files', '--others', '--exclude-standard']);
  const tests = (st.tests || []).map((x) => '- `' + x.cmd + '` — ' + (x.ok ? 'ok' : 'fail') + ' ' + String(x.at).slice(0, 16)).join('\n') || '- none';
  const plan = fs.existsSync(path.join(cwd, 'docs', 'plan.md')) ? 'docs/plan.md' : 'none';
  return [
    '# Handoff — ' + new Date().toISOString().slice(0, 16).replace('T', ' '),
    '',
    '## changed_files',
    stat + (untracked ? '\nuntracked:\n' + untracked : ''),
    '',
    '## tests_run',
    tests,
    '',
    '## plan',
    plan,
    '',
    '## decisions',
    section(old, 'decisions') || FILL,
    '',
    '## next_action',
    section(old, 'next_action') || FILL,
    '',
  ].join('\n');
}

function generate(cwd, st) {
  const target = path.join(cwd, FILE);
  let old = '';
  try { old = fs.readFileSync(target, 'utf8'); } catch {}
  if (!old && !Object.keys((st && st.files) || {}).length) return false;
  try {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, render(cwd, st || {}, old));
    return true;
  } catch {
    return false;
  }
}

function handle(j) {
  if (j.hook_event_name !== 'SessionEnd') return false;
  const cwd = j.cwd || process.cwd();
  const st = read(stateFile('state-' + safe(String(j.session_id || 'none'))));
  return generate(cwd, st);
}

if (require.main === module) {
  let raw = '';
  process.stdin.on('data', (d) => (raw += d));
  process.stdin.on('end', () => {
    try { handle(JSON.parse(raw)); } catch (e) {
      try { fs.appendFileSync(stateFile('hook-errors').replace(/\.json$/, '.log'), new Date().toISOString() + ' handoff.js ' + String((e && e.stack) || e) + '\n'); } catch {}
    }
    process.exit(0);
  });
}

module.exports = { generate, render, section, handle, FILE, FILL };
