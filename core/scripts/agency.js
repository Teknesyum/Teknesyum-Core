const fs = require('fs');
const path = require('path');
const { configRoot, arg } = require('../hooks/lib.js');
const lib = require('./kutuphane.js');

const REPO = 'https://github.com/msitarzewski/agency-agents.git';
const SKIP = ['.git', 'integrations', 'strategy', 'examples', 'scripts'];

function home() {
  return process.env.TEKNESYUM_AGENCY || path.join(lib.home(), 'agency');
}

function fetch() {
  const at = home();
  const old = path.join(configRoot(), 'teknesyum', 'agency');
  if (!fs.existsSync(at) && fs.existsSync(path.join(old, '.git'))) {
    fs.mkdirSync(path.dirname(at), { recursive: true });
    fs.renameSync(old, at);
  }
  if (fs.existsSync(path.join(at, '.git'))) {
    const r = lib.git(['pull', '-q', '--ff-only'], at);
    return r.ok ? 'updated ' + at : 'pull failed: ' + r.out.trim();
  }
  fs.mkdirSync(path.dirname(at), { recursive: true });
  const r = lib.git(['clone', '-q', '--depth', '1', REPO, at]);
  return r.ok ? 'fetched ' + at : 'clone failed: ' + r.out.trim();
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
      const meta = lib.front(fs.readFileSync(path.join(at, division, f), 'utf8'));
      if (!meta.name) continue;
      out.push({ slug: f.replace(/\.md$/, ''), raf: 'agency', division, name: meta.name, description: meta.description || '', file: path.join(division, f) });
    }
  }
  return out.sort((a, b) => a.slug.localeCompare(b.slug));
}

function list(division) {
  return agents().filter((a) => !division || a.division === division).map(lib.row);
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
  return scored.filter((x) => x.score > 0).sort((x, y) => y.score - x.score).slice(0, 10).map((x) => lib.row(x.a));
}

function show(slugs, opts) {
  return lib.show(slugs, { lean: opts.lean, books: agents(), dir: home, cap: false });
}

function record(root, o) {
  return lib.record(root, { ...o, shelf: 'agency', books: o.agents });
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
module.exports = { agents, list, find, show, lean: lib.lean, record, fetch, home, seatFile: lib.seatFile };
