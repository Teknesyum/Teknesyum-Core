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
  const c = read(counterFile()) || {};
  return c[key] || 0;
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
  for (const r of hits)
    for (const need of r.require || [])
      if (!text.toLowerCase().includes(String(need).toLowerCase())) missing.push(need);
  if (!missing.length) return;

  const key = safe(path.resolve(target));
  if (blocksFor(key) >= MAX_BLOCKS) return;
  noteBlock(key);

  const file = path.join(prefsDir(), 'prefs.md');
  process.stderr.write(
    'BLOCKED: ' +
      [
        name + ' is missing this author\'s standing conventions.',
        'Missing: ' + Array.from(new Set(missing)).join(', '),
        '',
        'Read ' + file + ' and apply it, then write again.',
      ].join('\n')
  );
  process.exit(2);
}
