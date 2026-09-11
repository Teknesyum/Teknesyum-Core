const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { read, stateFile, safe, t } = require('./lib.js');

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

function prompts(transcript) {
  let raw = '';
  try { raw = fs.readFileSync(String(transcript || ''), 'utf8'); } catch { return []; }
  const out = [];
  for (const line of raw.split('\n')) {
    if (!line.includes('"user"')) continue;
    let j;
    try { j = JSON.parse(line); } catch { continue; }
    if (j.type !== 'user' || j.isMeta || !j.message) continue;
    const c = j.message.content;
    const text = typeof c === 'string' ? c : Array.isArray(c) ? c.filter((x) => x && x.type === 'text').map((x) => x.text).join('\n') : '';
    const clean = text.replace(/<[^>]+>[\s\S]*?<\/[^>]+>/g, '').trim();
    if (!clean) continue;
    out.push(clean.length > 2000 ? clean.slice(0, 2000) + '…' : clean);
  }
  return out;
}

function firstPrompt(transcript) {
  return prompts(transcript)[0] || '';
}

function steer(transcript) {
  return prompts(transcript).slice(1).slice(-3).map((p) => '- ' + p.replace(/\n+/g, ' ').slice(0, 300)).join('\n');
}

function render(cwd, st, old) {
  const stat = git(cwd, ['diff', '--stat', 'HEAD']) || '(no diff)';
  const untracked = git(cwd, ['ls-files', '--others', '--exclude-standard']);
  const tests = (st.tests || []).map((x) => '- `' + x.cmd + '` — ' + (x.ok === true ? 'pass' : x.ok === false ? 'fail' : 'unknown') + ' ' + String(x.at).slice(0, 16) + (x.tree ? ' tree ' + x.tree : '')).join('\n') || '- none';
  let later = '';
  try { later = fs.readFileSync(path.join(cwd, '.claude', 'jobs.md'), 'utf8').split(/\r?\n/).filter((l) => /^\s*[-*]\s+\S/.test(l) && !/^\s*[-*]\s+\[[xX]\]/.test(l)).join('\n'); } catch {}
  const plan = (fs.existsSync(path.join(cwd, 'docs', 'plan.md')) ? 'docs/plan.md' : 'none') + (later ? '\n.claude/jobs.md: ' + later.split('\n').length + ' open' : '');
  return [
    '# Handoff — ' + new Date().toISOString().slice(0, 16).replace('T', ' '),
    '',
    t('handoff.rule'),
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
    '## task',
    section(old, 'task') || firstPrompt(st.transcript) || FILL,
    '',
    '## steer',
    steer(st.transcript) || section(old, 'steer') || '- none',
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
  const st = read(stateFile('state-' + safe(String(j.session_id || 'none')))) || {};
  if (j.transcript_path) st.transcript = j.transcript_path;
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

module.exports = { generate, render, section, firstPrompt, steer, handle, FILE, FILL };
