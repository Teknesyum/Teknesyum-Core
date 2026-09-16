#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

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

function asar(root, ceiling) {
  const s = olc(root);
  return s.var && s.bytes >= (ceiling || CEILING) ? s : null;
}

function mb(bytes) {
  return Math.round(bytes / 1048576);
}

function recycle(base) {
  if (process.platform !== 'win32') {
    fs.rmSync(base, { recursive: true, force: true });
    return { ok: true, how: 'removed' };
  }
  const cmd =
    "Add-Type -AssemblyName Microsoft.VisualBasic; " +
    "[Microsoft.VisualBasic.FileIO.FileSystem]::DeleteDirectory('" +
    base.replace(/'/g, "''") +
    "','OnlyErrorDialogs','SendToRecycleBin')";
  const r = spawnSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', cmd], {
    encoding: 'utf8',
    windowsHide: true,
    timeout: 120000,
  });
  if (r.error || r.status !== 0) return { ok: false, how: 'recycle', why: String(r.stderr || (r.error && r.error.message) || '').trim() };
  return { ok: true, how: 'recycle' };
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
      'Usage: node cop.js [project] [--sil]\n\nMeasures <project>/trash. --sil sends the whole folder to the recycle bin.\nExit: 0 under the ceiling · 1 over it · 2 no trash folder\n'
    );
    return 0;
  }
  const root = args.find((a) => !a.startsWith('-')) || process.cwd();
  const s = olc(root);
  if (!s.var) {
    process.stderr.write('no trash folder at ' + s.base + '\n');
    return 2;
  }
  if (args.includes('--sil')) {
    process.stdout.write(report(s) + '\n');
    const r = recycle(s.base);
    if (!r.ok) {
      process.stderr.write('could not empty: ' + r.why + '\n');
      return 3;
    }
    process.stdout.write(
      (r.how === 'recycle' ? 'sent to the recycle bin: ' : 'removed: ') + mb(s.bytes) + ' MB, ' + s.count + ' file(s)\n'
    );
    return 0;
  }
  process.stdout.write(report(s) + '\n');
  return s.bytes >= CEILING ? 1 : 0;
}

module.exports = { CEILING, WEEK, dir, olc, asar, mb, report, sweepState, pruneCache, newer };

if (require.main === module) process.exitCode = main(process.argv);
