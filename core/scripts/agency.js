const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { configRoot } = require('../hooks/lib.js');
const { slugOf } = require('./advice.js');

const REPO = 'https://github.com/msitarzewski/agency-agents.git';
const SKIP = ['.git', 'integrations', 'strategy', 'examples', 'scripts'];
const DROP = /identity & memory|communication style|learning & memory|success metrics|advanced capabilities/i;
const RECORDS = 'docs/danisma';

function home() {
  return process.env.TEKNESYUM_AGENCY || path.join(configRoot(), 'teknesyum', 'agency');
}

function git(args, cwd) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', windowsHide: true });
  return { ok: r.status === 0, out: (r.stdout || '') + (r.stderr || '') };
}

function fetch() {
  const at = home();
  if (fs.existsSync(path.join(at, '.git'))) {
    const r = git(['pull', '-q', '--ff-only'], at);
    return r.ok ? 'updated ' + at : 'pull failed: ' + r.out.trim();
  }
  fs.mkdirSync(path.dirname(at), { recursive: true });
  const r = git(['clone', '-q', '--depth', '1', REPO, at]);
  return r.ok ? 'fetched ' + at : 'clone failed: ' + r.out.trim();
}

function front(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  const meta = {};
  if (!m) return meta;
  for (const line of m[1].split(/\r?\n/)) {
    const k = /^(\w+):\s*(.*)$/.exec(line);
    if (k) meta[k[1]] = k[2].trim();
  }
  return meta;
}

function agents() {
  const at = home();
  const out = [];
  let divisions = [];
  try {
    divisions = fs.readdirSync(at).filter((d) => !SKIP.includes(d) && fs.statSync(path.join(at, d)).isDirectory());
  } catch {
    return out;
  }
  for (const division of divisions) {
    for (const f of fs.readdirSync(path.join(at, division))) {
      if (!f.endsWith('.md')) continue;
      const file = path.join(at, division, f);
      const meta = front(fs.readFileSync(file, 'utf8'));
      if (!meta.name) continue;
      out.push({ slug: f.replace(/\.md$/, ''), division, name: meta.name, description: meta.description || '', file });
    }
  }
  return out.sort((a, b) => a.slug.localeCompare(b.slug));
}

function row(a) {
  return a.slug + '  ' + a.name + ' - ' + a.description.slice(0, 110);
}

function list(division) {
  return agents().filter((a) => !division || a.division === division).map(row);
}

function find(words) {
  const terms = words.map((w) => w.toLowerCase()).filter(Boolean);
  if (!terms.length) return [];
  const scored = agents().map((a) => {
    const hay = (a.slug + ' ' + a.name + ' ' + a.division).toLowerCase();
    const desc = a.description.toLowerCase();
    let score = 0;
    for (const t of terms) {
      if (hay.includes(t)) score += 3;
      if (desc.includes(t)) score += 1;
    }
    return { a, score };
  });
  return scored.filter((x) => x.score > 0).sort((x, y) => y.score - x.score).slice(0, 10).map((x) => row(x.a));
}

function lean(text) {
  const body = text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
  const out = [];
  let dropping = false;
  for (const line of body.split(/\r?\n/)) {
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

function show(slugs, opts) {
  const all = agents();
  const parts = [];
  const seated = [];
  for (const s of slugs) {
    const a = all.find((x) => x.slug === s || x.slug.endsWith('-' + s) || x.name.toLowerCase() === s.toLowerCase());
    if (!a) {
      parts.push('not found: ' + s);
      continue;
    }
    const text = fs.readFileSync(a.file, 'utf8');
    parts.push(opts.lean ? lean(text) : text);
    seated.push(a.slug);
  }
  const out = parts.join('\n---\n');
  if (seated.length) {
    try {
      fs.mkdirSync(path.dirname(seatFile()), { recursive: true });
      fs.writeFileSync(seatFile(), JSON.stringify({ slugs: seated, bytes: Buffer.byteLength(out), at: new Date().toISOString() }));
    } catch {}
  }
  return out;
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
  const body = [
    '# ' + (o.topic || 'danisma'),
    '',
    '- tarih: ' + new Date().toISOString().slice(0, 10),
    '- danisilan: agency/' + (o.agents || ''),
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
  fs.writeFileSync(path.join(dir, name), body);
  return path.join(RECORDS, name);
}

function arg(argv, flag) {
  const i = argv.indexOf(flag);
  return i === -1 || i === argv.length - 1 ? '' : argv[i + 1];
}

function main(argv) {
  const cmd = argv[0];
  if (cmd === 'fetch') {
    console.log(fetch());
    return 0;
  }
  if (!agents().length) {
    console.log('no agents at ' + home() + ' - run: agency.js fetch');
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
    console.log(record(process.cwd(), { topic: arg(argv, '--topic'), agents: arg(argv, '--agents'), ask: arg(argv, '--ask'), reply: arg(argv, '--reply'), cost: arg(argv, '--cost') }));
    return 0;
  }
  console.log('agency.js fetch | list [division] | find <words> | show <slug...> [--lean] | record --topic T --agents a,b --ask f --reply f [--cost c]');
  return 1;
}

if (require.main === module) process.exit(main(process.argv.slice(2)));
module.exports = { agents, list, find, show, lean, record, fetch, home, seatFile };
