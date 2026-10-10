const fs = require('fs');
const path = require('path');
const { main, configRoot, settings, stateFile, t, banner, say, sayBlock, coreRepo, uiRepo } = require('./lib.js');
const lib = require('../scripts/kutuphane.js');
const ag = require('../scripts/agency.js');

const PREFIX = /^\s*(\?\?|\+\+|pp|aa|ff|hh|mc|uc|ss)(?=\s|$)/i;
const SUFFIX = /(^|\s)(\?\?|\+\+|pp|aa|ff|hh|mc|uc|ss)\s*$/i;
const WORD_MARK = /^mc$/;
const SCOPE = /^\s*(\d+\s*(sayfa|g[uü]n|hafta)\s*)?$/i;

function mark(prompt) {
  const head = PREFIX.exec(prompt);
  if (head) {
    const key = head[1].toLowerCase();
    const rest = prompt.slice(head[0].length);
    if (!WORD_MARK.test(key) || SCOPE.test(rest)) return { key, rest };
  }
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
let ahead = '';

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

function help(session) {
  shown.push(banner('banner.help'));
  sayBlock(session, t('mod.help'));
  return '';
}

function memory(rest) {
  shown.push(banner('banner.memory'));
  const k = /(\d+)\s*(sayfa|g[uü]n|hafta)/i.exec(rest || '');
  const unit = k ? k[2].toLowerCase() : '';
  const gun = unit === 'hafta' ? Number(k[1]) * 7 : unit && unit !== 'sayfa' ? Number(k[1]) : 0;
  const scope = !k ? '' : unit === 'sayfa' ? t('mod.memoryPages').replace('%N', k[1]) : t('mod.memoryDays').replace('%N', String(gun));
  return t('mod.memory')
    .replace('%C', cmd(gun ? 'topla --gun ' + gun : 'topla', 'hatirla.js'))
    .replace('%S', scope)
    .replace('%R', cmd('record --ajan <agentId> --sayfa <okunan>', 'hatirla.js'));
}

function fable(text) {
  shown.push(banner('banner.fable'));
  const q = text.trim();
  const head = t('mod.fable').replace('%C', cmd('ask --mod gorus --konu <slug> --girdi tmp/<dosya>.md', 'advice.js')).replace('%R', cmd('record --mod gorus --ajan <agentId>', 'advice.js'));
  return q ? head + '\n' + t('mod.fableAsk').replace('%Q', q) : head;
}

const REPORT = /(?:^|[^\p{L}])(core|teknesyum)(?:['’]?(?:a|e|ya|ye))?\s+(?:\S+\s+){0,2}?(raporla|logla|bildir)|\b(report|log)\s+(?:\S+\s+){0,2}?to\s+(core|teknesyum)\b/iu;

const UI_REPORT = /(?:^|[^\p{L}])(teknesyum-ui|ui)(?:['’]?(?:a|e|ya|ye|ı|i|yı|yi))?\s+(?:\S+\s+){0,2}?(raporla|logla|bildir)|\b(report|log)\s+(?:\S+\s+){0,2}?to\s+(teknesyum-)?ui\b/iu;

function report(ui) {
  shown.push(banner('banner.report'));
  const text = t('mod.report').replace('%C', cmd('write' + (ui ? ' --to ui' : '') + ' --kind hata|yontem|teklif --title T --symptom S', 'log.js'));
  return ui ? text.replace(/Teknesyum Core/g, 'teknesyum-ui') : text;
}

function uiPlugin() {
  try {
    const j = JSON.parse(fs.readFileSync(path.join(configRoot(), 'plugins', 'installed_plugins.json'), 'utf8'));
    const row = [].concat((j.plugins || {})['teknesyum-ui@teknesyum'] || [])[0];
    return row && row.installPath && fs.existsSync(row.installPath) ? row.installPath : '';
  } catch {
    return '';
  }
}

function uiCheck(rest, cwd) {
  shown.push(banner('banner.uc'));
  const root = uiPlugin();
  if (!root) return t('mod.ucNone');
  const own = path.join(root, 'scripts', 'uc.js');
  if (fs.existsSync(own))
    try {
      return require(own).metin({ cwd, kapsam: String(rest || '').trim() });
    } catch {}
  const book = path.join(lib.privateDir(), 'tercihler', 'ui-denetim.md');
  const js = (s) => 'node "' + path.join(root, 'scripts', s) + '"';
  const head = t('mod.uc').replace('%B', book).replace('%S', js('scan.js') + ' .').replace('%D', js('denetim.js') + ' --snippet').replace('%T', js('scaffold.js') + ' denetim <Ad>');
  const q = String(rest || '').trim();
  return q ? head + '\n' + t('mod.ucScope').replace('%Q', q) : head;
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

const defter = require('./defter.js');
const JOBS = defter.JOBS;
const ITEM = /^\s*[-*]\s+\S/;
const DONE = /^\s*[-*]\s+\[[xX]\]/;

function open(body) {
  return String(body || '').split(/\r?\n/).filter((l) => ITEM.test(l) && !DONE.test(l)).map((l) => l.trim());
}

function later(cwd, session) {
  const { text, moved } = defter.ledger(cwd, session);
  if (moved) shown.push(banner('banner.jobs', { '%N': moved }));
  return text;
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

function expect(session, prompt, cwd) {
  const f = stateFile('jobs-' + String(session || 'none'));
  const n = items(prompt);
  const rel = cwd ? defter.jobsFile(cwd, session, false) : JOBS;
  if (n >= 2 && cwd && !fs.existsSync(path.join(cwd, rel))) ahead = t('dur.jobsMissing').replace('%N', String(n)).replace('.claude/jobs.md', rel.split(path.sep).join('/'));
  try {
    if (!n) { fs.unlinkSync(f); return; }
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, JSON.stringify({ n, at: new Date().toISOString() }));
  } catch {}
}

const SHELVE = /(?:^|[^\p{L}])(rafta\s+(dursun|kalsın|beklesin)|rafa\s+kaldır)|\b(shelve\s+(it|this|that)|keep\s+(it|this|that)\s+on\s+the\s+shelf)\b/iu;

function stems(s) {
  return (String(s || '').toLocaleLowerCase('tr').match(/[\p{L}\d]{4,}/gu) || []).map((w) => w.slice(0, 5));
}

function shelve(prompt, cwd) {
  const raf = defter.shelf(cwd);
  if (SHELVE.test(prompt)) return t('mod.shelf').replace('%F', raf.rel);
  const said = new Set(stems(prompt));
  const hit = raf.heads.find((h) => {
    const w = [...new Set(stems(h))];
    return w.length && w.filter((x) => said.has(x)).length >= Math.min(2, w.length);
  });
  return hit ? t('mod.shelfHit').replace('%F', raf.rel).replace('%H', hit) : '';
}

const ASKED = /^\s*(?:#{1,6}\s*|\*\*)(Senden istediklerim|What I need from you)\b/im;

function asked(j) {
  const kitap = require('./kitap.js');
  const file = kitap.transcript(j);
  if (!file) return '';
  const list = kitap.entries(file);
  let at = -1;
  for (let i = list.length - 1; i >= 0; i--) if (kitap.prompt(list[i])) { at = i; break; }
  for (const o of list.slice(at + 1)) {
    if (!o || o.type !== 'assistant' || o.isSidechain || !o.message || !Array.isArray(o.message.content)) continue;
    for (const c of o.message.content) {
      const hit = c && c.type === 'text' && ASKED.exec(c.text || '');
      if (hit) return t('mod.asked').replace('%H', hit[1]);
    }
  }
  return '';
}

function openLogs(cwd, pre) {
  const here = path.resolve(cwd).toLowerCase() + path.sep;
  const root = [coreRepo(), uiRepo()].find((d) => d && here.startsWith(path.resolve(d).toLowerCase() + path.sep));
  if (!root) return '';
  let names = [];
  try { names = fs.readdirSync(path.join(root, 'logs', 'openlogs')).filter((f) => f.endsWith('.md') && !pre.includes(f)); } catch {}
  if (!names.length) return '';
  return t('mod.logs').replace('%N', String(names.length)).replace('%L', names.map((f) => f.replace(/\.md$/, '')).join(', ')).replace('%C', cmd('archive --id X', 'log.js'));
}

const TAIL = 256 * 1024;
const STALE = 30 * 60 * 1000;

function tail(file) {
  let fd;
  try {
    fd = fs.openSync(file, 'r');
    const size = fs.fstatSync(fd).size;
    const len = Math.min(size, TAIL);
    const buf = Buffer.alloc(len);
    fs.readSync(fd, buf, 0, len, size - len);
    const rows = buf.toString('utf8').split('\n');
    if (len < size) rows.shift();
    const out = [];
    for (const row of rows) try { out.push(JSON.parse(row)); } catch {}
    return out;
  } catch {
    return [];
  } finally {
    if (fd !== undefined) try { fs.closeSync(fd); } catch {}
  }
}

function busy(j, now) {
  const file = require('./kitap.js').transcript(j);
  if (!file) return false;
  const list = tail(file);
  for (let i = list.length - 1; i >= 0; i--) {
    const o = list[i];
    if (!o || o.isSidechain) continue;
    if (o.type === 'user' && /\[Request interrupted/.test(JSON.stringify((o.message && o.message.content) || ''))) return false;
    if (o.type !== 'assistant' || !o.message) continue;
    const at = Date.parse(o.timestamp || '') || 0;
    return o.message.stop_reason === 'tool_use' && (now || Date.now()) - at < STALE;
  }
  return false;
}

const SORU = /\?|(^|\s)(m[ıiuü]|m[ıiuü]s[ıiuü]n|m[ıiuü]d[ıiuü]r)(\s|$)|^(ne|nedir|nerede|nereden|nasıl|hangi|kaç|kim|what|where|which|how|who)\b|\b(nedir|nerede|hangi|kaçıncı|kaç tane|var mı)\b/i;
const BAGLAM = /(^|\s)(bu|bunu|bunun|şu|şunu|az önce|az önceki|önceki|demin|demindeki|biraz önce|neden|niye|niçin|yaptın|yaptığın|dedin|dediğin|why|you just|this|that)(\s|$|[,.?])/i;

function soru(prompt) {
  const p = String(prompt || '').trim();
  if (!p || p.length > 400 || /\n\s*[-*\d]/.test(p)) return false;
  return SORU.test(p) && !BAGLAM.test(p);
}

function devret(j, prompt) {
  const cwd = j.cwd || process.cwd();
  const what = 'Devredildi: ' + prompt.replace(/\s+/g, ' ').replace(/ — /g, ' - ').trim().slice(0, 300);
  try { defter.append(cwd, [defter.entry(what, 'okuyucuya verildi')]); } catch { return ''; }
  shown.push(banner('banner.devir'));
  return t('mod.devir');
}

function enqueue(j, prompt) {
  if (settings().araya !== false && soru(prompt)) {
    const r = devret(j, prompt);
    if (r) return r;
  }
  const cwd = j.cwd || process.cwd();
  const what = 'Sıra: ' + prompt.replace(/\s+/g, ' ').replace(/ — /g, ' - ').trim().slice(0, 300);
  try { defter.append(cwd, [defter.entry(what, 'çalışırken geldi')]); } catch { return ''; }
  const f = stateFile('sira-' + String(j.session_id || 'none'));
  let list = [];
  try { list = JSON.parse(fs.readFileSync(f, 'utf8')); } catch {}
  list.push(defter.job(what));
  try { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(list)); } catch {}
  shown.push(banner('banner.queued', { '%N': list.length }));
  return t('mod.queued');
}

function handle(j) {
  if (j.hook_event_name !== 'UserPromptSubmit') return '';
  const prompt = String(j.prompt || '');
  if (EVENT.test(prompt)) {
    const a = asked(j);
    return a ? JSON.stringify({ hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: a } }) : '';
  }
  shown = [];
  ahead = '';
  const pre = later(j.cwd || process.cwd(), j.session_id);
  const m = mark(prompt);
  expect(j.session_id, m ? m.rest : prompt, j.cwd || process.cwd());
  let text = '';
  if (m && m.key === 'ss') text = busy(j) ? t('mod.now') : '';
  else if (m) {
    const { rest, key } = m;
    text = key === 'hh' ? help(j.session_id) : key === 'mc' ? memory(rest) : key === 'pp' ? privateShelf() : key === 'ff' ? fable(rest) : key === 'aa' ? agency(rest) : key === 'uc' ? uiCheck(rest, j.cwd || process.cwd()) : library(rest);
  } else if (busy(j)) text = enqueue(j, prompt);
  else if (UI_REPORT.test(prompt)) text = report(true);
  else if (REPORT.test(prompt)) text = report(false);
  say(j.session_id, shown);
  const all = [openLogs(j.cwd || process.cwd(), pre), pre, ahead, text, shelve(prompt, j.cwd || process.cwd())].filter(Boolean).join('\n\n');
  if (!all) return '';
  return JSON.stringify({ hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: all } });
}

if (require.main === module) main(handle, { log: 'mod.js' });

module.exports = { REPORT, UI_REPORT, SHELVE, ASKED, handle, busy, soru, tail, words, mark, later, expect, open, items, JOBS, PREFIX, SUFFIX, configRoot };
