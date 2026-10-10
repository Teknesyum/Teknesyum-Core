#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DIR = '.teknesyum';
const FILES = ['teknesyum.json', 'icon.png', 'shot.jpg', 'full.jpg'];
const SHARED = ['name', 'category', 'asset', 'method', 'run'];
const OUT = ['', 'dist', 'out', 'release', 'build', 'bin', 'tmp'];
const ICONS = [
  'assets/icon/icon-256.png',
  'assets/icon/icon.png',
  'assets/icon.png',
  'icon.png',
  'src-tauri/icons/icon.png',
  'src-tauri/icons/128x128@2x.png',
  'build/icon.png',
  'public/icon.png',
];
const SHOTS = ['scripts/shot.ps1', 'scripts/kare.ps1', 'scripts/shot.mjs', 'scripts/shot.js'];

function read(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^﻿/, '')); } catch { return null; }
}

function top(from) {
  let dir = path.resolve(from || process.cwd());
  for (;;) {
    if (fs.existsSync(path.join(dir, DIR)) || fs.existsSync(path.join(dir, 'teknesyum.json')) || fs.existsSync(path.join(dir, '.git'))) return dir;
    const up = path.dirname(dir);
    if (up === dir) return path.resolve(from || process.cwd());
    dir = up;
  }
}

function manifests(root) {
  return { dir: read(path.join(root, DIR, 'teknesyum.json')), root: read(path.join(root, 'teknesyum.json')) };
}

function installable(root) {
  const m = manifests(root);
  return [m.dir, m.root].some((x) => x && (x.asset || x.run));
}

function names(zip) {
  const buf = fs.readFileSync(zip);
  let end = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 66000); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { end = i; break; }
  }
  if (end < 0) return null;
  const count = buf.readUInt16LE(end + 10);
  let at = buf.readUInt32LE(end + 16);
  const out = [];
  for (let n = 0; n < count && at + 46 <= buf.length; n++) {
    if (buf.readUInt32LE(at) !== 0x02014b50) break;
    const len = buf.readUInt16LE(at + 28);
    out.push(buf.toString('utf8', at + 46, at + 46 + len).replace(/\\/g, '/'));
    at += 46 + len + buf.readUInt16LE(at + 30) + buf.readUInt16LE(at + 32);
  }
  return out;
}

function glob(pattern) {
  return new RegExp('^' + String(pattern).replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$', 'i');
}

function zips(root, asset) {
  if (!asset || !/\.zip$/i.test(asset)) return [];
  const re = glob(asset);
  const found = [];
  for (const d of OUT) {
    let list = [];
    try { list = fs.readdirSync(path.join(root, d)); } catch { continue; }
    for (const n of list) {
      if (!re.test(n)) continue;
      const f = path.join(root, d, n);
      try { found.push([fs.statSync(f).mtimeMs, f]); } catch {}
    }
  }
  return found.sort((a, b) => b[0] - a[0]).slice(0, 1).map((x) => x[1]);
}

function check(root, given) {
  const miss = [];
  const notes = [];
  const m = manifests(root);
  for (const f of FILES) if (!fs.existsSync(path.join(root, DIR, f))) miss.push(DIR + '/' + f + ' is missing');
  if (m.dir && m.root) {
    for (const k of SHARED) {
      if (m.root[k] !== undefined && JSON.stringify(m.root[k]) !== JSON.stringify(m.dir[k])) {
        miss.push('root teknesyum.json says ' + k + '=' + JSON.stringify(m.root[k]) + ', ' + DIR + '/teknesyum.json says ' + JSON.stringify(m.dir[k]));
      }
    }
  }
  const use = m.dir || m.root || {};
  const list = (given && given.length ? given : zips(root, use.asset)).filter((z) => /\.zip$/i.test(z) && fs.existsSync(z));
  if (use.run && String(use.method || 'zip') === 'zip') {
    if (!list.length) notes.push('run "' + use.run + '" was not checked: no zip matching ' + (use.asset || 'the asset') + ' here; pass --zip');
    for (const z of list) {
      const inside = names(z);
      const want = String(use.run).replace(/\\/g, '/').toLowerCase();
      if (!inside) notes.push(path.basename(z) + ' could not be read as a zip');
      else if (!inside.some((n) => n.toLowerCase() === want || n.toLowerCase().endsWith('/' + want))) miss.push('run "' + use.run + '" is not inside ' + path.basename(z));
    }
  }
  return { ok: !miss.length, miss, notes };
}

function init(root) {
  const did = [];
  const dir = path.join(root, DIR);
  fs.mkdirSync(dir, { recursive: true });
  const m = manifests(root);
  if (!m.dir) {
    const name = path.basename(root);
    const body = m.root || { name, category: '', asset: name + '-*-win-x64.zip', method: 'zip', run: name + '.exe' };
    fs.writeFileSync(path.join(dir, 'teknesyum.json'), JSON.stringify(body, null, 2) + '\n', 'utf8');
    did.push(m.root ? 'Wrote ' + DIR + '/teknesyum.json from the root copy.' : 'Wrote a draft ' + DIR + '/teknesyum.json: fill category, asset and run from the real release.');
  }
  const icon = path.join(dir, 'icon.png');
  if (!fs.existsSync(icon)) {
    const own = (m.dir || m.root || {}).icon;
    const from = [own].concat(ICONS).filter(Boolean).map((p) => path.join(root, p)).find((p) => /\.png$/i.test(p) && path.resolve(p) !== path.resolve(icon) && fs.existsSync(p));
    if (from) {
      fs.copyFileSync(from, icon);
      did.push('Copied ' + path.relative(root, from).split(path.sep).join('/') + ' to ' + DIR + '/icon.png.');
    } else did.push('No PNG icon found: make a 256 px ' + DIR + '/icon.png.');
  }
  if (['shot.jpg', 'full.jpg'].some((f) => !fs.existsSync(path.join(dir, f)))) {
    const tool = SHOTS.find((p) => fs.existsSync(path.join(root, p)));
    if (tool) did.push('Screenshots are missing: run ' + tool + ' and check both files land in ' + DIR + '/.');
    else {
      let n = 0;
      try {
        const defter = require('../hooks/defter.js');
        n = defter.append(root, [defter.entry('- [ ] ' + DIR + '/shot.jpg ve full.jpg: çalışan programın ekran görüntüsünü çek', 'base.js init')]);
      } catch {}
      did.push('Screenshots are missing and the repo has no capture script: take ' + DIR + '/shot.jpg (card size) and ' + DIR + '/full.jpg (full size) of the running program' + (n ? '; noted in .claude/acik.md.' : '.'));
    }
  }
  return did;
}

function report(r) {
  const lines = r.ok ? ['Base can install this repo: the four files are there and the manifests agree.'] : ['Base cannot install this repo yet:'].concat(r.miss.map((x) => '  - ' + x));
  return lines.concat(r.notes.map((x) => '  note: ' + x));
}

if (require.main === module) {
  const argv = process.argv.slice(2);
  const arg = (name) => {
    const i = argv.indexOf('--' + name);
    return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : null;
  };
  const root = top(arg('dir'));
  const zip = arg('zip');
  let lines;
  if (argv[0] === 'init') lines = init(root);
  else if (argv[0] === 'check') lines = [];
  else {
    process.stdout.write('usage: base.js init|check [--dir D] [--zip Z]\n  init   sets up .teknesyum/ (manifest, icon, screenshots to do)\n  check  the four files, both manifests agree, run is inside the zip\n');
    process.exit(2);
  }
  if (argv[0] === 'check' && !installable(root)) {
    process.stdout.write('No asset or run in the manifest: Base lists this repo but does not install it. Nothing to check.\n');
    process.exit(0);
  }
  const r = check(root, zip ? [path.resolve(zip)] : []);
  process.stdout.write(lines.concat(report(r)).join('\n') + '\n');
  process.exitCode = r.ok ? 0 : 1;
}

module.exports = { top, manifests, installable, names, zips, check, init, report, DIR, FILES };
