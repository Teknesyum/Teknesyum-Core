const fs = require('fs');
const path = require('path');
const { configRoot, read, write, sessionId, safe, stateFile } = require('./lib.js');

const MAX_BLOCKS = 2;

let raw = '';
process.stdin.on('data', (d) => (raw += d));
process.stdin.on('end', () => {
  try {
    decide(JSON.parse(raw));
  } catch {}
  process.exit(0);
});

function prefsDir() {
  return path.join(configRoot(), 'teknesyum');
}

function rules() {
  const j = read(path.join(prefsDir(), 'prefs.json'));
  return j && Array.isArray(j.rules) ? j.rules : null;
}

function body(target, t, tool) {
  if (tool === 'Write') return String(t.content || '');
  let current = '';
  try {
    current = fs.readFileSync(target, 'utf8');
  } catch {
    return String(t.new_string || '');
  }
  const prev = String(t.old_string || '');
  const next = String(t.new_string || '');
  if (!prev) return current + next;
  if (t.replace_all) return current.split(prev).join(next);
  const i = current.indexOf(prev);
  return i === -1 ? current : current.slice(0, i) + next + current.slice(i + prev.length);
}

function counterFile() {
  return stateFile('prefs-' + safe(sessionId() || 'main'));
}

function blocksFor(key) {
  return (read(counterFile()) || {})[key] || 0;
}

function noteBlock(key) {
  const c = read(counterFile()) || {};
  c[key] = (c[key] || 0) + 1;
  write(counterFile(), c);
}

function decide(j) {
  const tool = j.tool_name || '';
  if (!/^(Write|Edit)$/.test(tool)) return;
  const set = rules();
  if (!set) return;

  const target = (j.tool_input || {}).file_path || '';
  if (!target) return;
  const name = path.basename(target);
  const here = path.dirname(path.resolve(target));

  const hits = set.filter((r) => {
    try {
      return new RegExp(r.match, 'i').test(name);
    } catch {
      return false;
    }
  });
  if (!hits.length) return;

  const text = body(target, j.tool_input || {}, tool);
  const missing = [];
  const asks = [];
  const docs = [];

  for (const r of hits) {
    for (const need of r.require || [])
      if (!text.toLowerCase().includes(String(need).toLowerCase())) missing.push(need);
    if (r.ask && r.ask.when && !fs.existsSync(path.join(here, r.ask.when))) asks.push(r.ask.line);
    if (r.doc) docs.push(path.join(prefsDir(), r.doc));
  }
  if (!missing.length && !asks.length) return;

  const key = safe(path.resolve(target));
  if (blocksFor(key) >= MAX_BLOCKS) return;
  noteBlock(key);

  const lines = [name + ' does not match this author\'s standing conventions.'];
  if (missing.length) lines.push('Missing: ' + Array.from(new Set(missing)).join(', '));
  for (const a of asks) lines.push(a);
  lines.push('', 'Read ' + Array.from(new Set(docs)).join(' and ') + ', then write again.');

  process.stderr.write('BLOCKED: ' + lines.join('\n'));
  process.exit(2);
}
