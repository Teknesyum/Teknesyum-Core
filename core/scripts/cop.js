#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const CEILING = 100 * 1024 * 1024;
const SKIP = /^\.git$/i;

function dir(root) {
  return path.join(path.resolve(root || process.cwd()), 'trash');
}

function walk(base, out) {
  let entries;
  try {
    entries = fs.readdirSync(base, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (SKIP.test(e.name)) continue;
    const full = path.join(base, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (e.isFile()) {
      let s;
      try {
        s = fs.statSync(full);
      } catch {
        continue;
      }
      out.push({ file: full, bytes: s.size, at: s.mtimeMs });
    }
  }
  return out;
}

function olc(root) {
  const base = dir(root);
  if (!fs.existsSync(base)) return { base, var: false, bytes: 0, count: 0, files: [] };
  const files = walk(base, []).sort((a, b) => b.bytes - a.bytes);
  return {
    base,
    var: true,
    bytes: files.reduce((n, f) => n + f.bytes, 0),
    count: files.length,
    files,
  };
}

const DAY = 24 * 60 * 60 * 1000;

function yas(root, now) {
  const base = path.join(path.resolve(root || process.cwd()), 'tmp');
  const limit = (now || Date.now()) - DAY;
  return walk(base, []).filter((f) => f.at < limit);
}

function proje(root, now) {
  const t = olc(root);
  const eski = yas(root, now);
  const tmpBytes = eski.reduce((n, f) => n + f.bytes, 0);
  return { root: path.resolve(root), bytes: t.bytes + tmpBytes, count: t.count + eski.length, trash: t, tmp: eski };
}

function projeler(top) {
  const base = path.resolve(top);
  let names = [];
  try {
    names = fs.readdirSync(base, { withFileTypes: true }).filter((e) => e.isDirectory() && !e.name.startsWith('.')).map((e) => e.name);
  } catch {}
  return names.map((n) => path.join(base, n));
}

function hepsi(top, now) {
  const list = projeler(top).map((p) => proje(p, now)).filter((p) => p.count).sort((a, b) => b.bytes - a.bytes);
  return { top: path.resolve(top), bytes: list.reduce((n, p) => n + p.bytes, 0), count: list.reduce((n, p) => n + p.count, 0), list };
}

function bosalt(p) {
  let gone = 0;
  if (p.trash.var) {
    for (const e of fs.readdirSync(p.trash.base)) {
      try { fs.rmSync(path.join(p.trash.base, e), { recursive: true, force: true }); } catch {}
    }
    gone += p.trash.bytes;
  }
  for (const f of p.tmp) {
    try { fs.unlinkSync(f.file); gone += f.bytes; } catch {}
  }
  budama(path.join(p.root, 'tmp'), true);
  return gone;
}

function budama(d, top) {
  let entries;
  try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
  for (const e of entries) if (e.isDirectory()) budama(path.join(d, e.name), false);
  if (!top) try { if (!fs.readdirSync(d).length) fs.rmdirSync(d); } catch {}
}

function asar(root, ceiling) {
  const s = olc(root);
  return s.var && s.bytes >= (ceiling || CEILING) ? s : null;
}

function mb(bytes) {
  return Math.round(bytes / 1048576);
}

function report(s) {
  const lines = [s.base + '  ' + mb(s.bytes) + ' MB  ' + s.count + ' file(s)'];
  for (const f of s.files.slice(0, 10))
    lines.push(
      '  ' +
        String(mb(f.bytes)).padStart(5) +
        ' MB  ' +
        new Date(f.at).toISOString().slice(0, 10) +
        '  ' +
        path.relative(s.base, f.file).split(path.sep).join('/')
    );
  if (s.count > 10) lines.push('  … ' + (s.count - 10) + ' more');
  return lines.join('\n');
}

const WEEK = 7 * 24 * 60 * 60 * 1000;
const LEFTOVER = /^(state|banner|advice|tree)-(.+)\.json$/;

function sweepState(dir, session, now) {
  const keep = session ? String(session).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80) : null;
  const gone = [];
  let names = [];
  try {
    names = fs.readdirSync(dir);
  } catch {
    return gone;
  }
  const limit = (now || Date.now()) - WEEK;
  for (const n of names) {
    const m = LEFTOVER.exec(n);
    if (!m || (keep && (m[2] === keep || m[2] === String(session)))) continue;
    const full = path.join(dir, n);
    try {
      const s = fs.statSync(full);
      if (!s.isFile() || s.mtimeMs >= limit) continue;
      fs.unlinkSync(full);
      gone.push(n);
    } catch {}
  }
  return gone;
}

function semver(v) {
  return String(v)
    .split(/[.+-]/)
    .slice(0, 3)
    .map((x) => Number(x) || 0);
}

function newer(a, b) {
  const x = semver(a);
  const y = semver(b);
  for (let i = 0; i < 3; i += 1) if (x[i] !== y[i]) return y[i] - x[i];
  return 0;
}

function pinned(config) {
  const out = new Set([path.resolve(__dirname, '..').toLowerCase()]);
  try {
    const j = JSON.parse(fs.readFileSync(path.join(config, 'plugins', 'installed_plugins.json'), 'utf8'));
    for (const rows of Object.values(j.plugins || {}))
      for (const r of [].concat(rows)) if (r && r.installPath) out.add(path.resolve(r.installPath).toLowerCase());
  } catch {}
  return out;
}

function list(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return [];
  }
}

function pruneCache(config, keep) {
  const cache = path.join(config, 'plugins', 'cache');
  const bin = path.join(config, 'teknesyum', 'trash', 'plugin-cache');
  const hold = pinned(config);
  const moved = [];
  for (const market of list(cache).filter((m) => /teknesyum/i.test(m)))
    for (const plugin of list(path.join(cache, market))) {
      const base = path.join(cache, market, plugin);
      const versions = list(base).sort(newer);
      for (const v of versions.slice(keep || 2)) {
        const from = path.join(base, v);
        if (hold.has(path.resolve(from).toLowerCase())) continue;
        let to = path.join(bin, market, plugin, v);
        if (fs.existsSync(to)) to += '-' + Date.now();
        try {
          fs.mkdirSync(path.dirname(to), { recursive: true });
          fs.renameSync(from, to);
          moved.push(market + '/' + plugin + '/' + v);
        } catch {}
      }
    }
  return moved;
}

function main(argv) {
  const args = argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    process.stdout.write(
      'Usage: node cop.js [project] [--sil]\n       node cop.js --hepsi [projects root] [--sil]\n\nMeasures <project>/trash and the tmp files older than a day.\n--hepsi does it for every project under the root (default: projectsRoot).\n--sil deletes them for good: the recycle bin frees no space.\nExit: 0 under the ceiling · 1 over it · 2 no trash folder\n'
    );
    return 0;
  }
  const free = args.find((a) => !a.startsWith('-'));
  if (args.includes('--hepsi')) {
    let top = free;
    if (!top) try { top = require('../hooks/lib.js').settings().projectsRoot; } catch {}
    if (!top) {
      process.stderr.write('no projects root: pass one or set projectsRoot\n');
      return 2;
    }
    const h = hepsi(top);
    for (const p of h.list) process.stdout.write(String(mb(p.bytes)).padStart(6) + ' MB  ' + String(p.count).padStart(6) + ' file(s)  ' + path.basename(p.root) + '\n');
    process.stdout.write(String(mb(h.bytes)).padStart(6) + ' MB  total\n');
    if (!args.includes('--sil')) return h.bytes >= CEILING ? 1 : 0;
    let gone = 0;
    for (const p of h.list) gone += bosalt(p);
    process.stdout.write('deleted: ' + mb(gone) + ' MB\n');
    return 0;
  }
  const root = free || process.cwd();
  const s = olc(root);
  if (!s.var) {
    process.stderr.write('no trash folder at ' + s.base + '\n');
    return 2;
  }
  if (args.includes('--sil')) {
    process.stdout.write(report(s) + '\n');
    process.stdout.write('deleted: ' + mb(bosalt(proje(root))) + ' MB\n');
    return 0;
  }
  process.stdout.write(report(s) + '\n');
  return s.bytes >= CEILING ? 1 : 0;
}

module.exports = { CEILING, WEEK, DAY, dir, olc, asar, mb, report, sweepState, pruneCache, newer, proje, hepsi, bosalt };

if (require.main === module) process.exitCode = main(process.argv);
