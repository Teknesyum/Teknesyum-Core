const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const SKIP = new Set([
  'node_modules','.git','dist','build','out','bin','obj','coverage','target','vendor',
  '__pycache__','.venv','venv','graphify-out','.next','.claude','Debug','Release',
]);
const SOURCE = new Set(['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.py', '.cs']);
const TRY = ['', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '/index.ts', '/index.tsx', '/index.js'];

const JS_IMPORT = /(?:^|[^\w.])(?:import|export)\s+(?:[^'"\n;]*?\sfrom\s*)?['"]([^'"]+)['"]/g;
const JS_REQUIRE = /(?:^|[^\w.])(?:require|import)\s*\(\s*['"]([^'"]+)['"]/g;
const PY_IMPORT = /^\s*(?:from\s+([\w.]+)\s+import|import\s+([\w.]+))/gm;
const CS_USING = /^\s*using\s+(?:static\s+)?([\w.]+)\s*;/gm;
const CS_NS = /^\s*namespace\s+([\w.]+)/m;

function scan(root) {
  const out = [];
  const stack = [root];
  while (stack.length) {
    const d = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(d, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      if (e.name.startsWith('.')) continue;
      const full = path.join(d, e.name);
      if (e.isDirectory()) {
        if (!SKIP.has(e.name)) stack.push(full);
      } else if (SOURCE.has(path.extname(e.name).toLowerCase())) {
        out.push(full);
      }
    }
  }
  return out.sort();
}

function matches(re, text) {
  const out = [];
  re.lastIndex = 0;
  let m;
  while ((m = re.exec(text))) {
    const v = m[1] || m[2];
    if (v) out.push(v);
  }
  return out;
}

function resolveSpec(from, spec, present) {
  if (!spec.startsWith('.')) return null;
  const base = path.resolve(path.dirname(from), spec);
  for (const ext of TRY) {
    const cand = path.normalize(base + ext);
    if (present.has(cand)) return cand;
  }
  return null;
}

function build(root) {
  const files = scan(root);
  const present = new Set(files);
  const namespaces = new Map();
  const bodies = new Map();

  for (const f of files) {
    let s = '';
    try {
      s = fs.readFileSync(f, 'utf8');
    } catch {
      continue;
    }
    bodies.set(f, s);
    if (path.extname(f).toLowerCase() === '.cs') {
      const m = s.match(CS_NS);
      if (m) namespaces.set(m[1], (namespaces.get(m[1]) || []).concat(f));
    }
  }

  const nodes = new Map();
  for (const f of files)
    nodes.set(f, { to: [], ns: [], ext: [], from: [], lines: (bodies.get(f) || '').split('\n').length });

  for (const f of files) {
    const s = bodies.get(f) || '';
    const ext = path.extname(f).toLowerCase();
    let specs;
    if (ext === '.py') specs = matches(PY_IMPORT, s);
    else if (ext === '.cs') specs = matches(CS_USING, s);
    else specs = matches(JS_IMPORT, s).concat(matches(JS_REQUIRE, s));

    const n = nodes.get(f);
    for (const sp of specs) {
      const target = resolveSpec(f, sp, present);
      if (target && target !== f) {
        if (!n.to.includes(target)) n.to.push(target);
      } else if (!target && ext === '.cs' && namespaces.has(sp)) {
        if (!n.ns.includes(sp)) n.ns.push(sp);
      } else if (!target && !sp.startsWith('.')) {
        const d = sp.split('/')[0].split('.')[0];
        if (d && !n.ext.includes(d)) n.ext.push(d);
      }
    }
  }

  for (const [f, n] of nodes) for (const t of n.to) nodes.get(t).from.push(f);
  return { nodes, namespaces };
}

function cycles(nodes) {
  const state = new Map();
  const stack = [];
  const found = [];
  function walk(f) {
    state.set(f, 1);
    stack.push(f);
    for (const t of nodes.get(f).to) {
      const s = state.get(t) || 0;
      if (s === 1) {
        const i = stack.indexOf(t);
        if (i >= 0) found.push(stack.slice(i).concat(t));
      } else if (s === 0) walk(t);
    }
    stack.pop();
    state.set(f, 2);
  }
  for (const f of nodes.keys()) if (!state.get(f)) walk(f);
  return found.slice(0, 20);
}

function headOf(root) {
  const r = spawnSync('git', ['-C', root, 'rev-parse', 'HEAD'], {
    encoding: 'utf8',
    windowsHide: true,
    timeout: 10000,
  });
  if (r.error || r.status !== 0) return '';
  return String(r.stdout || '').trim();
}

function staleness(root, dir) {
  const head = headOf(root);
  let json = null;
  try {
    json = JSON.parse(fs.readFileSync(path.join(dir, 'map.json'), 'utf8'));
  } catch {
    return { state: 'missing' };
  }
  const at = json && json._map && json._map.head;
  if (!at) return { state: 'unsealed' };
  if (!head) return { state: 'unknown', at: at };
  if (at === head) return { state: 'fresh', at: at };
  const r = spawnSync('git', ['-C', root, 'rev-list', '--count', at + '..HEAD'], {
    encoding: 'utf8',
    windowsHide: true,
    timeout: 10000,
  });
  const behind = r.error || r.status !== 0 ? null : Number(String(r.stdout || '').trim());
  return { state: 'stale', at: at, behind: Number.isFinite(behind) ? behind : null };
}

const SCHEMA = 2;
const MD_BUDGET = 64 * 1024;

function previous(dir) {
  try {
    return JSON.parse(fs.readFileSync(path.join(dir, 'map.json'), 'utf8'));
  } catch {
    return null;
  }
}

function shrinkFault(old, count) {
  if (!old || !old._map) return null;
  const was = Number(old._map.files);
  if (!Number.isFinite(was) || was < 8) return null;
  if (count >= was / 2) return null;
  return (
    'the scan found ' + count + ' files where the last map had ' + was + '.\n' +
    'That is a shrink of more than half, which is what a wrong root or a broken\n' +
    'scan looks like. Nothing was written. Run it again with --force if the tree\n' +
    'really did lose that much.'
  );
}

function emit(root, graph, opt) {
  const force = !!(opt && opt.force);
  const budget = (opt && Number(opt.budget)) || MD_BUDGET;
  const { nodes, namespaces } = graph;
  const rel = (f) => path.relative(root, f).replace(/\\/g, '/');
  const all = [...nodes.entries()];
  const edges = all.reduce((a, [, n]) => a + n.to.length + n.ns.length, 0);

  const hubsAll = all
    .filter(([, n]) => n.from.length > 1)
    .sort((a, b) => b[1].from.length - a[1].from.length);
  const hubs = hubsAll.slice(0, 12);
  const orphans = all.filter(([, n]) => !n.from.length && !n.to.length && !n.ns.length);
  const nsCount = new Map();
  for (const [, n] of all) for (const a of n.ns) nsCount.set(a, (nsCount.get(a) || 0) + 1);
  const nsAll = [...nsCount.entries()].sort((a, b) => b[1] - a[1]);
  const nsTop = nsAll.slice(0, 12);
  const loops = cycles(nodes);

  const relay = path.join(root, '.claude', 'relay');
  const dir = fs.existsSync(relay) ? relay : path.join(root, '.claude');
  const old = previous(dir);
  const fault = force ? null : shrinkFault(old, all.length);
  if (fault) return { dir, refused: fault };

  const cut = (shown, total, what) =>
    total > shown ? ['', '_Showing ' + shown + ' of ' + total + ' ' + what + '._'] : [];

  const L = [];
  L.push('# Map - ' + path.basename(root));
  L.push('');
  const head = headOf(root);
  L.push(
    all.length + ' files - ' + edges + ' edges - ' + new Date().toISOString().slice(0, 10) +
      (head ? ' - HEAD ' + head.slice(0, 8) : '')
  );
  L.push('');
  L.push('Generated by map.js. Do not edit. Read this before opening files.');
  if (head)
    L.push(
      'Built at HEAD ' + head.slice(0, 8) + '. If `git rev-parse HEAD` says anything else, this' +
        ' file is stale and its line numbers and edges are guesses - regenerate before trusting it.'
    );
  if (hubs.length) {
    L.push('');
    L.push('## Hubs');
    for (const [f, n] of hubs) L.push('- `' + rel(f) + '` <- ' + n.from.length);
    L.push(...cut(hubs.length, hubsAll.length, 'hubs'));
  }
  if (loops.length) {
    L.push('');
    L.push('## Cycles');
    for (const c of loops) L.push('- ' + c.map(rel).join(' -> '));
  }
  if (orphans.length) {
    L.push('');
    L.push('## Orphans');
    for (const [f] of orphans.slice(0, 40)) L.push('- `' + rel(f) + '`');
    L.push(...cut(Math.min(40, orphans.length), orphans.length, 'orphans'));
  }
  if (nsTop.length) {
    L.push('');
    L.push('## Namespaces');
    for (const [a, c] of nsTop) {
      const d = (namespaces.get(a) || []).map(rel);
      L.push('- `' + a + '` <- ' + c + '  ' + d.slice(0, 4).join(', ') + (d.length > 4 ? ' ...' : ''));
    }
    L.push(...cut(nsTop.length, nsAll.length, 'namespaces'));
  }

  const rows = [];
  for (const [f, n] of all) {
    const targets = n.to.map(rel).concat(n.ns.map((a) => 'ns:' + a));
    if (!targets.length) continue;
    rows.push({
      text: '`' + rel(f) + '` (' + n.lines + 'L) -> ' + targets.join(', '),
      weight: n.from.length,
      edges: targets.length,
    });
  }
  rows.sort((a, b) => b.weight - a.weight);
  const spent = L.join('\n').length + 32;
  const kept = [];
  let used = spent;
  for (const r of rows) {
    if (used + r.text.length + 1 > budget) break;
    used += r.text.length + 1;
    kept.push(r);
  }
  const droppedEdges = rows.slice(kept.length).reduce((a, r) => a + r.edges, 0);
  L.push('');
  L.push('## Edges');
  for (const r of kept) L.push(r.text);
  if (kept.length < rows.length) {
    L.push('');
    L.push(
      '_Showing ' + kept.length + ' of ' + rows.length + ' importing files (' + droppedEdges +
        ' edges dropped) to stay under the ' + Math.round(budget / 1024) + ' KB budget. Files with' +
        ' the most importers come first; the rest are in map.json. Raise it with --budget=<bytes>._'
    );
  }
  L.push('');

  const json = {
    _map: { schema: SCHEMA, head: head, at: new Date().toISOString(), files: all.length, edges },
  };
  for (const [f, n] of all)
    json[rel(f)] = { lines: n.lines, to: n.to.map(rel), ns: n.ns, from: n.from.map(rel), ext: n.ext.sort() };

  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'map.md'), L.join('\n'), 'utf8');
  fs.writeFileSync(path.join(dir, 'map.json'), JSON.stringify(json, null, 1), 'utf8');
  return {
    dir,
    files: all.length,
    edges,
    cycles: loops.length,
    orphans: orphans.length,
    truncated: rows.length - kept.length,
  };
}

function liveNodes(root) {
  const rel = (f) => path.relative(root, f).replace(/\\/g, '/');
  const json = {};
  const { nodes } = build(root);
  for (const [f, n] of nodes.entries())
    json[rel(f)] = { lines: n.lines, to: n.to.map(rel), ns: n.ns, from: n.from.map(rel) };
  return json;
}

function report(key, node, note) {
  const from = node.from || [];
  process.stdout.write(
    key + ' (' + node.lines + 'L)\n' +
      (from.length ? 'imported by:\n' + from.map((f) => '  ' + f).join('\n') + '\n' : 'nothing imports it\n') +
      (node.to && node.to.length ? 'imports:\n' + node.to.map((f) => '  ' + f).join('\n') + '\n' : '') +
      (note ? '\n' + note + '\n' : '')
  );
  return 0;
}

function fanIn(root, owns) {
  const relay = path.join(root, '.claude', 'relay');
  const dir = fs.existsSync(path.join(relay, 'map.json')) ? relay : path.join(root, '.claude');
  const json = previous(dir);
  if (!json || Number(json._map && json._map.schema) !== SCHEMA) return { max: 0, file: '', read: false };
  let max = 0;
  let file = '';
  for (const own of owns || []) {
    const want = String(own).replace(/\\/g, '/').replace(/^\.\//, '');
    const key = Object.keys(json).find((k) => k[0] !== '_' && (k === want || k.endsWith('/' + want)));
    if (!key) continue;
    const n = (json[key].from || []).length;
    if (n > max) {
      max = n;
      file = key;
    }
  }
  return { max, file, read: true };
}

function who(root, target) {
  const relay = path.join(root, '.claude', 'relay');
  const dir = fs.existsSync(path.join(relay, 'map.json')) ? relay : path.join(root, '.claude');
  const want = String(target).replace(/\\/g, '/').replace(/^\.\//, '');
  const find = (json) => Object.keys(json).find((k) => k[0] !== '_' && (k === want || k.endsWith('/' + want)));

  let json = previous(dir);
  let why = json ? '' : 'there was no map';
  if (json && Number(json._map && json._map.schema) !== SCHEMA)
    why = 'the map on disk is an older schema';
  else if (json && staleness(root, dir).state === 'stale') why = 'the map was stale';
  else if (json && !find(json)) why = want + ' was not in the map';

  if (!why) return report(find(json), json[find(json)], '');

  json = liveNodes(root);
  const key = find(json);
  if (!key) {
    process.stdout.write(
      want + ' is not there.\n' + why + ', so the tree was scanned live and it is not in it either.\n'
    );
    return 1;
  }
  return report(key, json[key], 'answered from a live scan, not the map, because ' + why + '.');
}

function main() {
  const argv = process.argv.slice(2);
  if (argv[0] === 'who') return process.exit(who(process.cwd(), argv[1] || ''));
  const arg = argv.filter((x) => !x.startsWith('--'));
  const root = path.resolve(arg[0] || process.cwd());
  const budget = (argv.find((x) => x.startsWith('--budget=')) || '').split('=')[1];
  const r = emit(root, build(root), { force: argv.includes('--force'), budget });
  if (r.refused) {
    process.stdout.write('Refused - ' + r.refused + '\n');
    return process.exit(1);
  }
  process.stdout.write(
    r.files + ' files - ' + r.edges + ' edges - ' + r.cycles + ' cycles - ' + r.orphans +
      ' orphans -> ' + path.relative(root, r.dir).replace(/\\/g, '/') + '/map.md' +
      (r.truncated ? ' (' + r.truncated + ' files left out of map.md, all of them in map.json)' : '') + '\n'
  );
}

if (require.main === module) main();
module.exports = { build, emit, scan, cycles, staleness, headOf, who, fanIn, shrinkFault, SCHEMA, MD_BUDGET };
