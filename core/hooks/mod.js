const fs = require('fs');
const path = require('path');
const { main, configRoot, settings, stateFile, t, banner, say, sayBlock, coreRepo, uiRepo, baseRepo, read, write } = require('./lib.js');
const lib = require('../scripts/kutuphane.js');
const ag = require('../scripts/agency.js');

const PREFIX = /^\s*(\?\?|\+\+|pp|aa|ff|cc|hh|mc|uc|ss)(?=\s|$)/i;
const SUFFIX = /(^|\s)(\?\?|\+\+|pp|aa|ff|cc|hh|mc|uc|ss)\s*$/i;
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

const BASE_REPORT = /(?:^|[^\p{L}])(teknesyum-base|base)(?:['’]?(?:a|e|ya|ye))?\s+(?:\S+\s+){0,2}?(raporla|logla|bildir)|\b(report|log)\s+(?:\S+\s+){0,2}?to\s+(teknesyum-)?base\b/iu;

const QUOTED = /(raporla|logla|bildir)['’"”]?\s+(de(diğim|diğin|rsem|yince|mek|dim|r)|diye|sözü|komutu)/iu;

const BASE_READY = /(?:^|[^\p{L}])base(?:['’]?(?:a|e|ya|ye|de|den))?\s+(?:\S+\s+){0,2}?(kurulabilir|eklenebilir|yüklenebilir)|\binstallable\s+(?:\S+\s+){0,2}?(in|from|by|on)\s+(teknesyum[- ])?base\b/iu;

function wanted(prompt) {
  if (QUOTED.test(prompt)) return '';
  return UI_REPORT.test(prompt) ? 'ui' : BASE_REPORT.test(prompt) ? 'base' : REPORT.test(prompt) ? 'core' : '';
}

function report(to) {
  shown.push(banner('banner.report'));
  const text = t('mod.report').replace('%C', cmd('write' + (to === 'core' ? '' : ' --to ' + to) + ' --kind hata|yontem|teklif --title T --symptom S', 'log.js'));
  return to === 'core' ? text : text.replace(/Teknesyum Core/g, 'teknesyum-' + to);
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
  const root = [coreRepo(), uiRepo(), baseRepo()].find((d) => d && here.startsWith(path.resolve(d).toLowerCase() + path.sep));
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

function soru(prompt) {
  const p = String(prompt || '').trim();
  if (!p || p.length > 400 || /\n\s*[-*\d]/.test(p)) return false;
  return SORU.test(p);
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
  if (list.length > 1) shown.push(banner('banner.queued', { '%N': list.length }));
  return t('mod.queued');
}

const PARAZIT = /reproduce copyrighted material|never reproduce song lyrics|at most one quote per response|do(?:es)? not (?:mention|reference) this (?:automated )?reminder|automated[_ ]reminder/i;
const PARA_OURS = /openlogs|TEKLIF-oturuma|yordam\.md|strings\.json/i;

function parazit(j) {
  try {
    const kitap = require('./kitap.js');
    const file = kitap.transcript(j);
    if (!file) return '';
    const list = kitap.entries(file);
    for (const o of list.slice(-10)) {
      if (!o || !o.message || o.message.role !== 'user') continue;
      const c = o.message.content;
      const texts = [];
      if (typeof c === 'string') texts.push(c);
      else if (Array.isArray(c)) {
        for (const x of c) {
          if (!x) continue;
          if (typeof x.text === 'string') texts.push(x.text);
          if (x.type === 'tool_result') {
            const tc = x.content;
            if (typeof tc === 'string') texts.push(tc);
            else if (Array.isArray(tc)) for (const y of tc) if (y && typeof y.text === 'string') texts.push(y.text);
          }
        }
      }
      for (const s of texts) if (PARAZIT.test(s) && !PARA_OURS.test(s)) return t('mod.parazit');
    }
  } catch {}
  return '';
}

const RET = /(?:^|[^\p{L}])(?:yaz|üret|ver|paylaş|yap|çevir|aktar)\p{L}{0,6}?(?:amam|emem|amıyorum|emiyorum|mayacağım|meyeceğim|amayız|emeyiz)(?=$|[^\p{L}])|reddediyorum|kararım değişm|yardımcı olam|\bI can(?:not|['’]t)\s+(?:help|provide|write|reproduce|share|do|comply|assist)|\bI won['’]t\s+(?:write|provide|reproduce|share|do)|\bI(?:['’]m| am) (?:not able|unable) to|\bI (?:must|have to) decline/iu;
const MUZIK = /music\.youtube\.com|youtube\.com\/watch|youtu\.be\/|open\.spotify\.com|music\.apple\.com|soundcloud\.com/i;
const SOZ = /(?:^|[^\p{L}])(?:söz|sözler|sözleri|sözlerini|dize|dizeler|dizeleri|lyrics)(?=$|[^\p{L}])/iu;
const SARKI = /şarkı\s+söz|sarki\s+soz|türkü\s+söz|song\s+lyrics/i;

function kaynak(prompt) {
  if (!(SARKI.test(prompt) || (MUZIK.test(prompt) && SOZ.test(prompt)))) return '';
  shown.push(banner('banner.kaynak'));
  return t('mod.kaynak');
}

const MISS_LOG = 'BUG-ret-kalibi-kacirdi.md';
const GERI = 8;

function sonlar(j, n) {
  const out = [];
  try {
    const kitap = require('./kitap.js');
    const file = kitap.transcript(j);
    if (!file) return out;
    const list = kitap.entries(file);
    for (let i = list.length - 1; i >= 0; i--) {
      const o = list[i];
      if (!o || o.type !== 'assistant' || o.isSidechain || !o.message || !Array.isArray(o.message.content)) continue;
      const s = o.message.content.filter((x) => x && x.type === 'text' && typeof x.text === 'string').map((x) => x.text).join('\n');
      if (s.trim() && out.push(s) >= n) break;
    }
  } catch {}
  return out;
}

function lastSaid(j) {
  return sonlar(j, 1)[0] || '';
}

function kacak(said, cwd, root) {
  try {
    const repo = root || coreRepo();
    if (!repo) return '';
    const dir = path.join(repo, 'logs', 'openlogs');
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, MISS_LOG);
    if (!fs.existsSync(file)) fs.writeFileSync(file, ['# Bug: ret kalıbı kaçırdı', '', '**State:** open', '**Symptom:** the owner typed a bare cc but RET in core/hooks/mod.js matched none of the last replies. Each line below is one miss: add its wording to RET, add a test, archive.', '', '---', '', ''].join('\n'), 'utf8');
    fs.appendFileSync(file, '- ' + new Date().toISOString() + ' · ' + path.basename(cwd || '') + ' · ' + JSON.stringify(String(said).replace(/\s+/g, ' ').slice(0, 300)) + '\n', 'utf8');
    return file;
  } catch { return ''; }
}

function temiz(text) {
  shown.push(banner('banner.temiz'));
  const q = text.trim();
  return q ? t('mod.temiz') + '\n' + t('mod.fableAsk').replace('%Q', q) : t('mod.temiz');
}

function proje(cwd) {
  if (/[\\/]scratch-workspaces[\\/]/i.test(cwd)) return 'Sohbet';
  let dir = cwd;
  for (;;) {
    if (fs.existsSync(path.join(dir, '.git'))) break;
    const up = path.dirname(dir);
    if (up === dir) { dir = cwd; break; }
    dir = up;
  }
  return path.basename(dir).replace(/^!+/, '') || 'Sohbet';
}

const BOS = new Set('bu şu o bir ve ile de da mi mı mu mü ne nedir nasıl neden niye için gibi var yok çok daha en ama bana beni sen biz bunu şunu şimdi lütfen yap et olsun olur misal birde hem the a an and or of to for is are what how why please'.split(' '));

function konu(prompt) {
  const line = String(prompt).replace(/<\/?[\w-]+(\s[^>]*)?>/g, '\n').split('\n').find((l) => /\p{L}/u.test(l)) || '';
  const words = line.replace(/[^\p{L}\p{N}\s-]/gu, ' ').split(/\s+/).filter((w) => w.length > 1 && !BOS.has(w.toLocaleLowerCase('tr'))).slice(0, 4);
  let out = '';
  for (const w of words.map((x) => x.charAt(0).toLocaleUpperCase('tr') + x.slice(1))) {
    if ((out + ' ' + w).trim().length > 32) break;
    out = (out + ' ' + w).trim();
  }
  return out;
}

function ad(j, prompt, m) {
  if (!j.session_id || settings().titles === false) return '';
  const f = stateFile('ad-' + String(j.session_id || 'none'));
  const s = read(f);
  if (s) {
    if (!s.title || s.fixed || !j.session_title || j.session_title === s.title || Date.now() - s.at > 3600000) return '';
    write(f, { ...s, fixed: true });
    return s.title;
  }
  if (m || j.session_title) return '';
  const k = konu(prompt);
  const title = k ? '--- ' + proje(j.cwd || process.cwd()) + ' ' + k : '';
  write(f, { at: Date.now(), title });
  return title;
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
  const para = parazit(j);
  if (para) shown.push(banner('banner.parazit'));
  const pre = later(j.cwd || process.cwd(), j.session_id);
  const m = mark(prompt);
  expect(j.session_id, m ? m.rest : prompt, j.cwd || process.cwd());
  let text = '';
  let ret = '';
  const koken = kaynak(prompt);
  const said = lastSaid(j);
  const hit = RET.test(said);
  if (m && m.key === 'cc') {
    if (!m.rest.trim() && said && !sonlar(j, GERI).some((s) => RET.test(s)) && kacak(said, j.cwd || process.cwd(), j.missRoot)) shown.push(banner('banner.retKacak'));
  } else if (hit) {
    const zincir = sonlar(j, GERI).filter((s) => RET.test(s)).length >= 2;
    ret = t('mod.ret') + (zincir ? ' ' + t('mod.retZincir') : '');
    shown.push(banner(zincir ? 'banner.retZincir' : 'banner.ret'));
  }
  if (m && m.key === 'ss') text = busy(j) ? t('mod.now') : '';
  else if (m) {
    const { rest, key } = m;
    text = key === 'cc' ? temiz(rest) : key === 'hh' ? help(j.session_id) : key === 'mc' ? memory(rest) : key === 'pp' ? privateShelf() : key === 'ff' ? fable(rest) : key === 'aa' ? agency(rest) : key === 'uc' ? uiCheck(rest, j.cwd || process.cwd()) : library(rest);
  } else if (busy(j)) text = enqueue(j, prompt);
  else if (wanted(prompt)) text = report(wanted(prompt));
  else if (BASE_READY.test(prompt)) text = t('mod.base').replace('%C', cmd('init', 'base.js'));
  say(j.session_id, shown);
  const all = [para, ret, koken, openLogs(j.cwd || process.cwd(), pre), pre, ahead, text, shelve(prompt, j.cwd || process.cwd())].filter(Boolean).join('\n\n');
  const title = ad(j, prompt, m);
  if (!all && !title) return '';
  const out = { hookEventName: 'UserPromptSubmit' };
  if (all) out.additionalContext = all;
  if (title) out.sessionTitle = title;
  return JSON.stringify({ hookSpecificOutput: out });
}

if (require.main === module) main(handle, { log: 'mod.js' });

module.exports = { proje, konu, ad, kaynak, REPORT, UI_REPORT, BASE_REPORT, BASE_READY, PARAZIT, parazit, RET, lastSaid, kacak, MISS_LOG, wanted, SHELVE, ASKED, handle, busy, soru, tail, words, mark, later, expect, open, items, JOBS, PREFIX, SUFFIX, configRoot };
