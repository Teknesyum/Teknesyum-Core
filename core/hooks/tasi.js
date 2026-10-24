const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawn, spawnSync } = require('child_process');
const { configRoot, stateFile, read, write } = require('./lib.js');

const TEK = ['.claude/acik.md', '.claude/handoff.md'];
const KLASOR = 'logs/openlogs';
const DAMGA = 'durum.json';
const OZEL = /teknesyum-ozel|teknesyum-private/i;

function ozelKok() {
  return process.env.TEKNESYUM_PRIVATE || path.join(configRoot(), 'teknesyum-private');
}

function ozelVar(kok) {
  try { return OZEL.test(fs.readFileSync(path.join(kok, '.git', 'config'), 'utf8')); } catch { return false; }
}

function depoKoku(cwd) {
  let dir = path.resolve(cwd);
  for (;;) {
    if (fs.existsSync(path.join(dir, '.git'))) return dir;
    const up = path.dirname(dir);
    if (up === dir) return '';
    dir = up;
  }
}

function ozet(file) {
  try { return crypto.createHash('sha1').update(fs.readFileSync(file)).digest('hex'); } catch { return ''; }
}

function gez(kok, rel, out) {
  let list = [];
  try { list = fs.readdirSync(path.join(kok, rel), { withFileTypes: true }); } catch { return out; }
  for (const e of list) {
    const r = rel ? rel + '/' + e.name : e.name;
    if (e.isDirectory()) gez(kok, r, out);
    else if (e.name.endsWith('.md')) out.push(r);
  }
  return out;
}

function dosyalar(kok) {
  return TEK.filter((r) => fs.existsSync(path.join(kok, r))).concat(gez(kok, KLASOR, []));
}

function hal(kok) {
  return stateFile('tasi-' + crypto.createHash('sha1').update(kok.toLowerCase()).digest('hex').slice(0, 12));
}

function yer(cwd) {
  const kok = depoKoku(cwd);
  const ozel = ozelKok();
  if (!kok || !ozelVar(ozel)) return null;
  const slug = path.basename(kok).replace(/^!+/, '').toLowerCase();
  return { kok, ozel, slug, ayna: path.join(ozel, slug, 'durum') };
}

function gitArka(ozel, slug) {
  const rel = slug + '/durum';
  const adim = [
    ['add', '-A', '--', rel],
    ['commit', '-q', '-m', 'Durum: ' + slug + ' (' + os.hostname() + ')', '--', rel],
    ['pull', '-q', '--rebase', '--autostash'],
    ['push', '-q'],
  ];
  const kod = 'const{spawnSync:s}=require("child_process");for(const a of ' + JSON.stringify(adim) + ')s("git",["-C",' + JSON.stringify(ozel) + '].concat(a),{windowsHide:true,timeout:60000});';
  try { spawn(process.execPath, ['-e', kod], { detached: true, stdio: 'ignore', windowsHide: true }).unref(); } catch {}
}

function gonder(cwd, o = {}) {
  const y = yer(cwd);
  if (!y) return 0;
  const eski = new Set(gez(y.ayna, '', []).filter((r) => r !== DAMGA));
  const files = {};
  let n = 0;
  for (const r of dosyalar(y.kok)) {
    const h = ozet(path.join(y.kok, r));
    files[r] = h;
    eski.delete(r);
    if (ozet(path.join(y.ayna, r)) === h) continue;
    fs.mkdirSync(path.dirname(path.join(y.ayna, r)), { recursive: true });
    fs.copyFileSync(path.join(y.kok, r), path.join(y.ayna, r));
    n++;
  }
  for (const r of eski) {
    try { fs.unlinkSync(path.join(y.ayna, r)); n++; } catch {}
  }
  if (!n) return 0;
  const at = Date.now();
  write(path.join(y.ayna, DAMGA), { at, makine: os.hostname(), files });
  write(hal(y.kok), { at, files });
  if (o.git !== false) gitArka(y.ozel, y.slug);
  return n;
}

function cop(kok, r) {
  const hedef = path.join(kok, 'trash', 'durum', r);
  try {
    fs.mkdirSync(path.dirname(hedef), { recursive: true });
    fs.renameSync(path.join(kok, r), hedef);
  } catch {}
}

function getir(cwd, o = {}) {
  const out = { alinan: 0, cakisan: [] };
  const y = yer(cwd);
  if (!y) return out;
  if (o.git !== false) spawnSync('git', ['-C', y.ozel, 'pull', '-q', '--rebase', '--autostash'], { windowsHide: true, timeout: 8000 });
  const uzak = read(path.join(y.ayna, DAMGA));
  const yerel = read(hal(y.kok)) || { at: 0, files: {} };
  if (!uzak || !uzak.at || uzak.at <= (yerel.at || 0)) return out;
  const taban = yerel.files || {};
  const uzakF = uzak.files || {};
  for (const [r, h] of Object.entries(uzakF)) {
    const f = path.join(y.kok, r);
    const simdi = ozet(f);
    if (simdi === h || h === taban[r] || !fs.existsSync(path.join(y.ayna, r))) continue;
    fs.mkdirSync(path.dirname(f), { recursive: true });
    if (!simdi || simdi === taban[r]) {
      fs.copyFileSync(path.join(y.ayna, r), f);
      out.alinan++;
    } else {
      fs.copyFileSync(path.join(y.ayna, r), f + '.onceki');
      out.cakisan.push(r);
    }
  }
  for (const r of Object.keys(taban)) {
    if (uzakF[r]) continue;
    if (ozet(path.join(y.kok, r)) === taban[r]) { cop(y.kok, r); out.alinan++; }
  }
  write(hal(y.kok), { at: uzak.at, files: uzakF });
  return out;
}

module.exports = { gonder, getir, dosyalar, yer, DAMGA };
