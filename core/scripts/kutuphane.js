const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { configRoot } = require('../hooks/lib.js');
const { slugOf } = require('./advice.js');

const RECORDS = 'docs/danisma';
const SKIP = ['.git', 'node_modules', '.github'];
const DROP = /identity & memory|communication style|learning & memory|success metrics|advanced capabilities/i;
const MAX_BOOKS = 3;
const MAX_BYTES = 48 * 1024;
const KINDS = ['agents', 'skills', 'prompts', 'docs'];
const PRIVATE = 'private';
const PRIVATE_REMOTE = /teknesyum-ozel|teknesyum-private/i;
const PRIVATE_MAX = 8 * 1024;
const SYN = {
  tasarim: 'design ui',
  arayuz: 'ui interface',
  denet: 'review audit',
  incele: 'review',
  gozden: 'review',
  gorsel: 'visual design',
  yazi: 'writing',
  yazim: 'writing',
  metin: 'writing copy',
  test: 'test testing',
  guvenlik: 'security',
  veri: 'data',
  hata: 'bug debug',
  performans: 'performance',
  belge: 'docs documentation',
  dagit: 'deploy',
  pazarlama: 'marketing',
  satis: 'sales',
  urun: 'product',
  musteri: 'customer',
  fiyat: 'pricing',
  ucret: 'pricing',
  mimari: 'architecture',
  sunum: 'slides presentation',
  isim: 'naming',
  adlandir: 'naming',
  erisilebilir: 'accessibility',
  mobil: 'mobile',
  onyuz: 'frontend',
  arkayuz: 'backend',
  komut: 'cli command',
  betik: 'script',
  planla: 'plan planning',
  strateji: 'strategy',
  hukuk: 'legal',
  finans: 'finance',
  arastir: 'research',
  yapay: 'ai llm',
  ajan: 'agent',
};

function home() {
  return process.env.TEKNESYUM_KUTUPHANE || path.join(configRoot(), 'teknesyum', 'kutuphane');
}

function privateRoot() {
  return process.env.TEKNESYUM_PRIVATE || path.join(configRoot(), 'teknesyum-private');
}

function privateDir() {
  return path.join(privateRoot(), PRIVATE);
}

function owner() {
  let cfg = '';
  try {
    cfg = fs.readFileSync(path.join(privateRoot(), '.git', 'config'), 'utf8');
  } catch {
    return false;
  }
  return PRIVATE_REMOTE.test(cfg) && fs.existsSync(privateDir());
}

function privateShelf() {
  return { slug: PRIVATE, url: '(private)', kind: 'docs' };
}

function userFile() {
  return path.join(home(), 'raflar.json');
}

function catalogFile() {
  return path.join(home(), 'katalog.json');
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function shelves() {
  const base = readJson(path.join(__dirname, '..', 'kutuphane.json'), { raflar: [] }).raflar || [];
  const mine = readJson(userFile(), { raflar: [] }).raflar || [];
  const out = owner() ? [privateShelf()] : [];
  for (const r of base.concat(mine)) {
    if (r.slug === PRIVATE) continue;
    const i = out.findIndex((x) => x.slug === r.slug);
    if (i === -1) out.push(r);
    else out[i] = r;
  }
  return out;
}

function shelfDir(slug) {
  return slug === PRIVATE ? privateDir() : path.join(home(), slug);
}

function migrate() {
  const old = path.join(configRoot(), 'teknesyum', 'agency');
  const now = shelfDir('agency');
  if (fs.existsSync(path.join(old, '.git')) && !fs.existsSync(now)) {
    try {
      fs.mkdirSync(home(), { recursive: true });
      fs.renameSync(old, now);
    } catch {}
  }
}

function git(args, cwd) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', windowsHide: true });
  return { ok: r.status === 0, out: (r.stdout || '') + (r.stderr || '') };
}

const DAY = 24 * 60 * 60 * 1000;
const STALE_DAYS = 7;

function ageDays(dir) {
  for (const f of ['FETCH_HEAD', 'ORIG_HEAD', 'HEAD']) {
    try { return (Date.now() - fs.statSync(path.join(dir, '.git', f)).mtimeMs) / DAY; } catch {}
  }
  return Infinity;
}

function stale(days) {
  return shelves().map((r) => {
    const age = ageDays(r.slug === PRIVATE ? privateRoot() : shelfDir(r.slug));
    return { slug: r.slug, age, stale: age > days };
  });
}

function fetchOne(r) {
  if (r.slug === PRIVATE) {
    const p = git(['pull', '-q', '--ff-only'], privateRoot());
    return PRIVATE + ': ' + (p.ok ? 'updated' : 'pull failed: ' + p.out.trim());
  }
  const at = shelfDir(r.slug);
  if (fs.existsSync(path.join(at, '.git'))) {
    const p = git(['pull', '-q', '--ff-only'], at);
    return r.slug + ': ' + (p.ok ? 'updated' : 'pull failed: ' + p.out.trim());
  }
  fs.mkdirSync(home(), { recursive: true });
  const c = git(['clone', '-q', '--depth', '1', r.url, at]);
  return r.slug + ': ' + (c.ok ? 'fetched' : 'clone failed: ' + c.out.trim());
}

function fetch(which, days) {
  migrate();
  const all = shelves();
  let pick = !which || which === 'all' ? all : all.filter((r) => r.slug === which);
  if (!pick.length) return ['no shelf ' + which];
  if (days != null) {
    const old = new Set(stale(days).filter((x) => x.stale).map((x) => x.slug));
    pick = pick.filter((r) => old.has(r.slug));
    if (!pick.length) return ['all shelves fetched within ' + days + ' days'];
  }
  const lines = pick.map(fetchOne);
  const cat = build();
  lines.push(cat.books.length + ' books in ' + cat.shelves + ' shelves -> ' + catalogFile());
  return lines;
}

function push() {
  if (!owner()) return ['no private shelf on this machine'];
  const root = privateRoot();
  git(['add', '-A', PRIVATE], root);
  const st = git(['status', '--porcelain', '--', PRIVATE], root);
  if (!st.out.trim()) return [PRIVATE + ': nothing to push'];
  const c = git(['commit', '-q', '-m', 'Private shelf ' + new Date().toISOString().slice(0, 16).replace('T', ' ')], root);
  if (!c.ok) return [PRIVATE + ': commit failed: ' + c.out.trim()];
  const p = git(['push', '-q'], root);
  build();
  return [PRIVATE + ': ' + (p.ok ? 'pushed' : 'push failed: ' + p.out.trim())];
}

function privateBooks() {
  if (!owner()) return [];
  const out = [];
  let bytes = 0;
  for (const f of walk(privateDir(), [], []).sort()) {
    const rel = path.relative(privateDir(), f).split(path.sep).join('/');
    const text = fs.readFileSync(f, 'utf8');
    bytes += Buffer.byteLength(text);
    out.push({ slug: PRIVATE + '/' + rel.replace(/\.md$/i, ''), file: rel, text, bytes: Buffer.byteLength(text) });
  }
  return bytes > PRIVATE_MAX ? out.map((b) => ({ ...b, text: '' })) : out;
}

function front(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  const meta = {};
  if (!m) return meta;
  for (const line of m[1].split(/\r?\n/)) {
    const k = /^(\w+):\s*(.*)$/.exec(line);
    if (k) meta[k[1]] = k[2].trim().replace(/^["']|["']$/g, '');
  }
  return meta;
}

function body(text) {
  return text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}

function firstHeading(text) {
  const m = /^#{1,3}\s+(.+)$/m.exec(text);
  return m ? m[1].trim() : '';
}

function firstParagraph(text) {
  for (const line of text.split(/\r?\n/)) {
    const s = line.trim();
    if (!s || /^[#>|`\-*!\[]/.test(s) || /^<!--/.test(s)) continue;
    return s.slice(0, 160);
  }
  return '';
}

function walk(dir, skip, out) {
  let names = [];
  try {
    names = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const d of names) {
    if (SKIP.includes(d.name) || skip.includes(d.name)) continue;
    const p = path.join(dir, d.name);
    if (d.isDirectory()) walk(p, skip, out);
    else if (/\.md$/i.test(d.name)) out.push(p);
  }
  return out;
}

function bookOf(r, file) {
  const rel = path.relative(shelfDir(r.slug), file).split(path.sep).join('/');
  const text = fs.readFileSync(file, 'utf8');
  const meta = front(text);
  const kind = r.kind || 'docs';
  if (kind === 'agents' && !meta.name) return null;
  if (kind === 'skills' && !/(^|\/)SKILL\.md$/i.test(rel)) return null;
  if (kind === 'docs' || kind === 'prompts') {
    if (!rel.includes('/') && /^(README|LICENSE|CONTRIBUTING|SECURITY|CHANGELOG|CODE_OF_CONDUCT)/i.test(rel)) return null;
  }
  const plain = body(text);
  const name = meta.name || firstHeading(plain) || path.basename(rel, '.md');
  const description = meta.description || firstParagraph(plain);
  if (!name) return null;
  let slug = r.slug + '/' + rel.replace(/\.md$/i, '');
  if (kind === 'skills') slug = slug.replace(/\/SKILL$/i, '');
  return { slug, raf: r.slug, kind, name, description, tags: meta.tags || '', bytes: Buffer.byteLength(text), file: rel };
}

function build() {
  migrate();
  const books = [];
  let count = 0;
  for (const r of shelves()) {
    const dir = shelfDir(r.slug);
    if (!fs.existsSync(dir)) continue;
    count += 1;
    const roots = r.scan && r.scan.length ? r.scan.map((s) => path.join(dir, s)) : [dir];
    for (const root of roots) {
      for (const f of walk(root, r.skip || [], [])) {
        const b = bookOf(r, f);
        if (b) books.push(b);
      }
    }
  }
  books.sort((a, b) => a.slug.localeCompare(b.slug));
  const cat = { at: new Date().toISOString(), shelves: count, books };
  try {
    fs.mkdirSync(home(), { recursive: true });
    fs.writeFileSync(catalogFile(), JSON.stringify(cat));
  } catch {}
  return cat;
}

function catalog() {
  const c = readJson(catalogFile(), null);
  if (c && c.books) return c;
  return build();
}

function row(b) {
  return b.slug + '  ' + b.name + ' - ' + b.description.slice(0, 110);
}

function list(raf) {
  return catalog().books.filter((b) => !raf || b.raf === raf).map(row);
}

function ascii(s) {
  return String(s).toLowerCase().replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/İ/g, 'i');
}

function expand(words) {
  const out = new Set();
  for (const w of words) {
    const a = ascii(w).replace(/[^a-z0-9]/g, '');
    if (a.length < 2) continue;
    out.add(a);
    for (const k of Object.keys(SYN)) if (a.startsWith(k)) for (const s of SYN[k].split(' ')) out.add(s);
  }
  return [...out];
}

function hit(text, term) {
  return new RegExp('(^|[^a-z0-9])' + term + '(?![a-z0-9])').test(text);
}

function find(words) {
  const terms = expand(words);
  if (!terms.length) return [];
  const scored = catalog().books.map((b) => {
    const hay = ascii(b.slug.replace(/[-_/]/g, ' ') + ' ' + b.name);
    const soft = ascii(b.description + ' ' + b.tags);
    let score = 0;
    for (const t of terms) {
      if (hit(hay, t)) score += 3;
      if (hit(soft, t)) score += 1;
    }
    if (score && b.raf === PRIVATE) score += 2;
    return { b, score };
  });
  return scored.filter((x) => x.score > 0).sort((x, y) => y.score - x.score || x.b.bytes - y.b.bytes).slice(0, 10).map((x) => row(x.b));
}

function lean(text) {
  const out = [];
  let dropping = false;
  for (const line of body(text).split(/\r?\n/)) {
    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    if (h) {
      dropping = h[1].length === 2 && DROP.test(h[2]);
      if (dropping) continue;
      out.push(h[1] + ' ' + h[2].replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}️]/gu, '').trim());
      continue;
    }
    if (!dropping) out.push(line);
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

function seatFile() {
  return path.join(configRoot(), 'teknesyum', 'seat.json');
}

function locate(books, s) {
  const q = s.toLowerCase();
  return (
    books.find((b) => b.slug.toLowerCase() === q) ||
    books.find((b) => b.slug.toLowerCase().endsWith('/' + q)) ||
    books.find((b) => path.basename(b.slug).toLowerCase() === q) ||
    books.find((b) => b.slug.toLowerCase().endsWith('-' + q)) ||
    books.find((b) => b.name.toLowerCase() === q)
  );
}

function show(slugs, opts) {
  if (slugs.length > MAX_BOOKS) return 'cap: ' + MAX_BOOKS + ' books per show, ' + slugs.length + ' asked - narrow with find\n';
  const books = catalog().books;
  const parts = [];
  const seated = [];
  let bytes = 0;
  for (const s of slugs) {
    const b = locate(books, s);
    if (!b) {
      parts.push('not found: ' + s);
      continue;
    }
    const text = fs.readFileSync(path.join(shelfDir(b.raf), b.file), 'utf8');
    const piece = opts.lean ? lean(text) : text;
    bytes += Buffer.byteLength(piece);
    if (bytes > MAX_BYTES) return 'cap: ' + Math.round(MAX_BYTES / 1024) + ' KB per show, ' + b.slug + ' pushes it over - fewer books or --lean\n';
    parts.push(piece);
    seated.push(b.slug);
  }
  const out = parts.join('\n---\n');
  if (seated.length) {
    try {
      fs.mkdirSync(path.dirname(seatFile()), { recursive: true });
      fs.writeFileSync(seatFile(), JSON.stringify({ slugs: seated, bytes, at: new Date().toISOString() }));
    } catch {}
  }
  return out;
}

function addShelf(o) {
  if (!o.slug || !o.url) throw new Error('raf add <slug> <url>');
  if (o.kind && !KINDS.includes(o.kind)) throw new Error('kind: ' + KINDS.join('|'));
  const mine = readJson(userFile(), { raflar: [] });
  mine.raflar = (mine.raflar || []).filter((r) => r.slug !== o.slug);
  const r = { slug: o.slug, url: o.url, kind: o.kind || 'docs' };
  if (o.scan) r.scan = o.scan.split(',').filter(Boolean);
  if (o.skip) r.skip = o.skip.split(',').filter(Boolean);
  mine.raflar.push(r);
  fs.mkdirSync(home(), { recursive: true });
  fs.writeFileSync(userFile(), JSON.stringify(mine, null, 2));
  return r;
}

function nextNumber(at) {
  let top = 0;
  let names = [];
  try {
    names = fs.readdirSync(at);
  } catch {
    return 1;
  }
  for (const n of names) {
    const m = /^(\d{3})-/.exec(n);
    if (m) top = Math.max(top, Number(m[1]));
  }
  return top + 1;
}

function record(root, o) {
  const dir = path.join(root, RECORDS);
  fs.mkdirSync(dir, { recursive: true });
  const name = String(nextNumber(dir)).padStart(3, '0') + '-' + slugOf(o.topic) + '.md';
  const read = (f) => (f ? fs.readFileSync(f, 'utf8').trim() : '');
  const text = [
    '# ' + (o.topic || 'danisma'),
    '',
    '- tarih: ' + new Date().toISOString().slice(0, 10),
    '- danisilan: kutuphane/' + (o.books || ''),
    '- maliyet: ' + (o.cost || '-'),
    '',
    '## Girdi',
    '',
    read(o.ask),
    '',
    '## Donen',
    '',
    read(o.reply),
    '',
  ].join('\n');
  fs.writeFileSync(path.join(dir, name), text);
  return path.join(RECORDS, name);
}

function arg(argv, flag) {
  const i = argv.indexOf(flag);
  return i === -1 || i === argv.length - 1 ? '' : argv[i + 1];
}

function refresh(root, dry) {
  const at = home();
  if (!fs.existsSync(at)) return false;
  const stamp = path.join(at, '.refresh');
  try { if (Date.now() - fs.statSync(stamp).mtimeMs < DAY) return false; } catch {}
  fs.writeFileSync(stamp, new Date().toISOString());
  if (dry) return true;
  const child = require('child_process').spawn(process.execPath, [__filename, 'fetch', 'all', '--stale', String(STALE_DAYS)], { cwd: root || process.cwd(), detached: true, stdio: 'ignore', windowsHide: true });
  child.unref();
  return true;
}

function usage() {
  return 'kutuphane.js fetch [raf|all] [--stale <days>] | stale [days] | push private | raf list | raf add <slug> <url> [--kind agents|skills|prompts|docs] [--scan a,b] [--skip a,b] | list [raf] | find <words> | show <slug...> [--lean] | record --topic T --books a,b --ask f --reply f [--cost c]';
}

function main(argv) {
  const cmd = argv[0];
  if (cmd === 'fetch') {
    const days = arg(argv, '--stale');
    console.log(fetch(argv[1] && !argv[1].startsWith('--') ? argv[1] : 'all', days === '' ? null : Number(days)).join('\n'));
    return 0;
  }
  if (cmd === 'stale') {
    const days = Number(argv[1] || STALE_DAYS);
    console.log(stale(days).map((x) => x.slug.padEnd(24) + (x.age === Infinity ? 'never' : x.age.toFixed(1) + ' days') + (x.stale ? '  stale' : '')).join('\n'));
    return 0;
  }
  if (cmd === 'push') {
    console.log(push().join('\n'));
    return 0;
  }
  if (cmd === 'raf') {
    if (argv[1] === 'add') {
      const r = addShelf({ slug: argv[2], url: argv[3], kind: arg(argv, '--kind'), scan: arg(argv, '--scan'), skip: arg(argv, '--skip') });
      console.log('added ' + r.slug + ' (' + r.kind + ') - run: kutuphane.js fetch ' + r.slug);
      return 0;
    }
    for (const r of shelves()) console.log(r.slug + '  ' + (r.kind || 'docs') + '  ' + r.url + (fs.existsSync(shelfDir(r.slug)) ? '' : '  (not fetched)'));
    return 0;
  }
  if (!catalog().books.length) {
    console.log('no books at ' + home() + ' - run: kutuphane.js fetch');
    return 1;
  }
  if (cmd === 'list') {
    console.log(list(argv[1]).join('\n'));
    return 0;
  }
  if (cmd === 'find') {
    const hits = find(argv.slice(1));
    console.log(hits.length ? hits.join('\n') : 'nothing matches');
    return 0;
  }
  if (cmd === 'show') {
    const slugs = argv.slice(1).filter((x) => x !== '--lean');
    process.stdout.write(show(slugs, { lean: argv.includes('--lean') }));
    return 0;
  }
  if (cmd === 'record') {
    console.log(record(process.cwd(), { topic: arg(argv, '--topic'), books: arg(argv, '--books'), ask: arg(argv, '--ask'), reply: arg(argv, '--reply'), cost: arg(argv, '--cost') }));
    return 0;
  }
  console.log(usage());
  return 1;
}

if (require.main === module) process.exit(main(process.argv.slice(2)));
module.exports = { home, shelves, shelfDir, fetch, push, stale, refresh, ageDays, STALE_DAYS, build, catalog, list, find, show, lean, record, addShelf, seatFile, owner, privateRoot, privateDir, privateBooks, expand, PRIVATE, PRIVATE_MAX, MAX_BOOKS, MAX_BYTES };
