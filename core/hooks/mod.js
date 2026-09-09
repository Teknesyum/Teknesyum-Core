const fs = require('fs');
const path = require('path');
const { configRoot, stateFile, t } = require('./lib.js');
const lib = require('../scripts/kutuphane.js');
const ag = require('../scripts/agency.js');

const PREFIX = /^\s*(\?\?|\+\+|pp|aa|ff|hh)(?=\s|$)/i;
const SUFFIX = /(^|\s)(\?\?|\+\+|pp|aa|ff|hh)\s*$/i;

function mark(prompt) {
  const head = PREFIX.exec(prompt);
  if (head) return { key: head[1].toLowerCase(), rest: prompt.slice(head[0].length) };
  const tail = SUFFIX.exec(prompt);
  if (tail) return { key: tail[2].toLowerCase(), rest: prompt.slice(0, tail.index) };
  return null;
}
const MAX_SEATS = 3;
const MAX_HITS = 8;
const MAX_WORDS = 8;

function plugin() {
  return process.env.CLAUDE_PLUGIN_ROOT || path.join(__dirname, '..');
}

function cmd(rest, script) {
  return 'node "' + path.join(plugin(), 'scripts', script || 'kutuphane.js') + '" ' + rest;
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

function help() {
  return t('mod.help');
}

function fable(text) {
  const q = text.trim();
  const head = t('mod.fable').replace('%C', cmd('ask "<soru>" --facts <olgu dosyasi>', 'advice.js')).replace('%R', cmd('record --reply <dosya> --cost "<token, sure>"', 'advice.js'));
  return q ? head + '\n' + t('mod.fableAsk').replace('%Q', q) : head;
}

function agency(text) {
  let rows = [];
  try { rows = ag.find(words(text)).slice(0, MAX_SEATS); } catch {}
  const head = t('mod.agency').replace('%C', cmd('show <slug> --lean', 'agency.js')).replace('%R', cmd('record --topic T --agents a,b --ask f --reply f --cost c', 'agency.js'));
  if (!rows.length) return head + '\n' + t('mod.agencyNone');
  return head + '\n' + rows.join('\n');
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
  const m = mark(prompt);
  if (!m) return '';
  const { rest, key } = m;
  const text = key === 'hh' ? help() : key === 'pp' ? privateShelf() : key === 'ff' ? fable(rest) : key === 'aa' ? agency(rest) : library(rest);
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

module.exports = { handle, words, mark, PREFIX, SUFFIX, configRoot };
