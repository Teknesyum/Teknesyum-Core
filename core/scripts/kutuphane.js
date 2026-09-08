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

function home() {
  return process.env.TEKNESYUM_KUTUPHANE || path.join(configRoot(), 'teknesyum', 'kutuphane');
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
  const out = [];
  for (const r of base.concat(mine)) {
    const i = out.findIndex((x) => x.slug === r.slug);
    if (i === -1) out.push(r);
    else out[i] = r;
  }
  return out;
}

function shelfDir(slug) {
  return path.join(home(), slug);
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

function fetchOne(r) {
  const at = shelfDir(r.slug);
  if (fs.existsSync(path.join(at, '.git'))) {
    const p = git(['pull', '-q', '--ff-only'], at);
    return r.slug + ': ' + (p.ok ? 'updated' : 'pull failed: ' + p.out.trim());
  }
  fs.mkdirSync(home(), { recursive: true });
  const c = git(['clone', '-q', '--depth', '1', r.url, at]);
  return r.slug + ': ' + (c.ok ? 'fetched' : 'clone failed: ' + c.out.trim());
}

function fetch(which) {
  migrate();
  const all = shelves();
  const pick = !which || which === 'all' ? all : all.filter((r) => r.slug === which);
  if (!pick.length) return ['no shelf ' + which];
  const lines = pick.map(fetchOne);
  const cat = build();
  lines.push(cat.books.length + ' books in ' + cat.shelves + ' shelves -> ' + catalogFile());
  return lines;
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

function find(words) {
  const terms = words.map((w) => w.toLowerCase()).filter((w) => w.length > 1);
  if (!terms.length) return [];
  const scored = catalog().books.map((b) => {
    const hay = (b.slug + ' ' + b.name).toLowerCase();
    const soft = (b.description + ' ' + b.tags).toLowerCase();
    let score = 0;
    for (const t of terms) {
      if (hay.includes(t)) score += 3;
      if (soft.includes(t)) score += 1;
    }
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

function usage() {
  return 'kutuphane.js fetch [raf|all] | raf list | raf add <slug> <url> [--kind agents|skills|prompts|docs] [--scan a,b] [--skip a,b] | list [raf] | find <words> | show <slug...> [--lean] | record --topic T --books a,b --ask f --reply f [--cost c]';
}

function main(argv) {
  const cmd = argv[0];
  if (cmd === 'fetch') {
    console.log(fetch(argv[1]).join('\n'));
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
module.exports = { home, shelves, shelfDir, fetch, build, catalog, list, find, show, lean, record, addShelf, seatFile, MAX_BOOKS, MAX_BYTES };
