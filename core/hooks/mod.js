const fs = require('fs');
const path = require('path');
const { configRoot, stateFile, t } = require('./lib.js');
const lib = require('../scripts/kutuphane.js');

const PREFIX = /^\s*(\?\?|\+\+|pp)(?=\s|$)/i;
const MAX_HITS = 8;
const MAX_WORDS = 8;

function plugin() {
  return process.env.CLAUDE_PLUGIN_ROOT || path.join(__dirname, '..');
}

function cmd(rest) {
  return 'node "' + path.join(plugin(), 'scripts', 'kutuphane.js') + '" ' + rest;
}

function words(text) {
  return text
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1)
    .slice(0, MAX_WORDS);
}

function library(text) {
  const hits = lib.catalog().books.length ? lib.find(words(text)).slice(0, MAX_HITS) : [];
  const head = t('mod.library').replace('%C', cmd('show <slug> --lean'));
  if (!hits.length) return head + '\n' + t('mod.none');
  return head + '\n' + hits.join('\n');
}

function seat(books, bytes) {
  try {
    fs.mkdirSync(path.dirname(lib.seatFile()), { recursive: true });
    fs.writeFileSync(lib.seatFile(), JSON.stringify({ slugs: books, bytes, at: new Date().toISOString(), private: true }));
  } catch {}
}

function privateShelf() {
  if (!lib.owner()) return t('mod.notOwner');
  const books = lib.privateBooks();
  if (!books.length) return t('mod.empty').replace('%D', lib.privateDir());
  const total = books.reduce((n, b) => n + b.bytes, 0);
  seat(books.map((b) => b.slug), total);
  const head = t('mod.private').replace('%C', cmd('push private')).replace('%D', lib.privateDir());
  if (!books[0].text) return head + '\n' + t('mod.big').replace('%K', String(Math.round(total / 1024))) + '\n' + books.map((b) => '- ' + b.slug + ' (' + b.bytes + ' B)').join('\n');
  return head + '\n\n' + books.map((b) => '### ' + b.file + '\n' + b.text.trim()).join('\n\n');
}

function handle(j) {
  if (j.hook_event_name !== 'UserPromptSubmit') return '';
  const prompt = String(j.prompt || '');
  const m = PREFIX.exec(prompt);
  if (!m) return '';
  const rest = prompt.slice(m[0].length);
  const key = m[1].toLowerCase();
  const text = key === 'pp' ? privateShelf() : library(rest);
  return JSON.stringify({ hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: text } });
}

if (require.main === module) {
  let raw = '';
  process.stdin.on('data', (d) => (raw += d));
  process.stdin.on('end', () => {
    let out = '';
    try { out = handle(JSON.parse(raw)); } catch (e) {
      try { fs.appendFileSync(stateFile('hook-errors').replace(/\.json$/, '.log'), new Date().toISOString() + ' mod.js ' + String((e && e.stack) || e) + '\n'); } catch {}
    }
    if (out) process.stdout.write(out);
    process.exit(0);
  });
}

module.exports = { handle, words, PREFIX, configRoot };
