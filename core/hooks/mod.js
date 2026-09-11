const fs = require('fs');
const path = require('path');
const { configRoot, stateFile, t, banner, say } = require('./lib.js');
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

const FOLD = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' };

let SOZLUK = null;
function sozluk() {
  if (SOZLUK) return SOZLUK;
  try { SOZLUK = JSON.parse(fs.readFileSync(path.join(plugin(), 'sozluk.json'), 'utf8')); } catch { SOZLUK = {}; }
  return SOZLUK;
}

function fold(w) {
  return w.toLowerCase().replace(/[çğıöşüâîû]/g, (c) => FOLD[c] || c);
}

function bridge(w) {
  const s = sozluk();
  if (s[w]) return s[w];
  let best = '';
  for (const key of Object.keys(s)) {
    if (key.length >= 4 && w.startsWith(key) && key.length > best.length) best = key;
  }
  return best ? s[best] : [];
}

function words(text) {
  const raw = text
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1)
    .slice(0, MAX_WORDS)
    .map(fold);
  const out = raw.slice();
  for (const w of raw) for (const e of bridge(w)) if (!out.includes(e)) out.push(e);
  return out;
}

let shown = [];

function seats(text) {
  let rows = [];
  try { rows = ag.find(words(text)).slice(0, MAX_SEATS); } catch {}
  if (!rows.length) return '';
  shown[shown.length - 1] += ' · ' + t('banner.seats').replace('%N', String(rows.length));
  return '\n' + t('mod.noneSeat') + '\n' + rows.join('\n');
}

function library(text) {
  const hits = lib.catalog().books.length ? lib.find(words(text)).slice(0, MAX_HITS) : [];
  const head = t('mod.library').replace('%C', cmd('show <slug> --lean'));
  if (!hits.length) {
    shown.push(banner('banner.libraryNone'));
    return head + '\n' + t('mod.none') + seats(text);
  }
  shown.push(banner('banner.library', { '%N': hits.length }));
  return head + '\n' + hits.join('\n');
}

function help() {
  shown.push(banner('banner.help'));
  return t('mod.help');
}

function fable(text) {
  shown.push(banner('banner.fable'));
  const q = text.trim();
  const head = t('mod.fable').replace('%C', cmd('ask "<soru>" --facts <olgu dosyasi>', 'advice.js')).replace('%R', cmd('record --reply <dosya> --cost "<token, sure>"', 'advice.js'));
  return q ? head + '\n' + t('mod.fableAsk').replace('%Q', q) : head;
}

function agency(text) {
  let rows = [];
  try { rows = ag.find(words(text)).slice(0, MAX_SEATS); } catch {}
  const head = t('mod.agency').replace('%C', cmd('show <slug> --lean', 'agency.js')).replace('%R', cmd('record --topic T --agents a,b --ask f --reply f --cost c', 'agency.js'));
  if (!rows.length) {
    shown.push(banner('banner.agencyNone'));
    return head + '\n' + t('mod.agencyNone');
  }
  shown.push(banner('banner.agency', { '%N': rows.length }));
  return head + '\n' + rows.join('\n');
}

function seat(books, bytes) {
  try {
    fs.mkdirSync(path.dirname(lib.seatFile()), { recursive: true });
    fs.writeFileSync(lib.seatFile(), JSON.stringify({ slugs: books, bytes, at: new Date().toISOString(), private: true, shown: true }));
  } catch {}
}

function privateShelf() {
  if (!lib.owner()) {
    shown.push(banner('banner.shelfNone'));
    return t('mod.notOwner');
  }
  const books = lib.privateBooks();
  if (!books.length) {
    shown.push(banner('banner.shelfEmpty'));
    return t('mod.empty').replace('%D', lib.privateDir());
  }
  const total = books.reduce((n, b) => n + b.bytes, 0);
  seat(books.map((b) => b.slug), total);
  shown.push(banner('banner.shelf', { '%N': books.length, '%K': (total / 1024).toFixed(1) }));
  const head = t('mod.private').replace('%C', cmd('push private')).replace('%D', lib.privateDir());
  if (!books[0].text) return head + '\n' + t('mod.big').replace('%K', String(Math.round(total / 1024))) + '\n' + books.map((b) => '- ' + b.slug + ' (' + b.bytes + ' B)').join('\n');
  return head + '\n\n' + books.map((b) => '### ' + b.file + '\n' + b.text.trim()).join('\n\n');
}

const JOBS = path.join('.claude', 'jobs.md');
const ITEM = /^\s*[-*]\s+\S/;
const DONE = /^\s*[-*]\s+\[[xX]\]/;

function open(body) {
  return String(body || '').split(/\r?\n/).filter((l) => ITEM.test(l) && !DONE.test(l)).map((l) => l.trim());
}

function later(cwd) {
  const file = path.join(cwd, JOBS);
  let body = '';
  try { body = fs.readFileSync(file, 'utf8').trim(); } catch { return ''; }
  try {
    const bin = path.join(cwd, 'trash');
    fs.mkdirSync(bin, { recursive: true });
    fs.renameSync(file, path.join(bin, 'jobs-' + new Date().toISOString().replace(/[:.]/g, '-') + '.md'));
  } catch {}
  const left = open(body);
  if (!left.length) return '';
  shown.push(banner('banner.jobs', { '%N': left.length }));
  return t('mod.jobs') + '\n' + left.join('\n');
}

const LIST = /^\s*(\d+[.)]|[-*•])\s+\S/;
const RAW = /^\s|^(at |File "|Traceback|PS |\$ |[{}<>\[\]#])|```/;
const EVENT = /<(task-notification|system-reminder|ci-monitor-event)\b/;

function items(prompt) {
  if (EVENT.test(String(prompt || ''))) return 0;
  const lines = String(prompt || '').split(/\r?\n/).filter((l) => l.trim());
  const listed = lines.filter((l) => LIST.test(l)).length;
  if (listed >= 2) return listed;
  if (lines.length >= 2 && lines.length <= 8 && lines.every((l) => l.length <= 300 && !RAW.test(l))) return lines.length;
  return 0;
}

function expect(session, prompt) {
  const f = stateFile('jobs-' + String(session || 'none'));
  const n = items(prompt);
  try {
    if (!n) { fs.unlinkSync(f); return; }
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, JSON.stringify({ n, at: new Date().toISOString() }));
  } catch {}
}

function handle(j) {
  if (j.hook_event_name !== 'UserPromptSubmit') return '';
  const prompt = String(j.prompt || '');
  shown = [];
  const pre = later(j.cwd || process.cwd());
  expect(j.session_id, mark(prompt) ? mark(prompt).rest : prompt);
  const m = mark(prompt);
  let text = '';
  if (m) {
    const { rest, key } = m;
    text = key === 'hh' ? help() : key === 'pp' ? privateShelf() : key === 'ff' ? fable(rest) : key === 'aa' ? agency(rest) : library(rest);
  }
  say(j.session_id, shown);
  const all = [pre, text].filter(Boolean).join('\n\n');
  if (!all) return '';
  return JSON.stringify({ hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: all } });
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

module.exports = { handle, words, mark, later, open, items, JOBS, PREFIX, SUFFIX, configRoot };
