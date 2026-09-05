#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');

const KOK = path.resolve(__dirname, '..');
const CEKIRDEK = path.join(KOK, 'core');
const VARYANT = path.join(__dirname, 'varyant');

function liste() {
  return fs.readdirSync(VARYANT).filter((d) => fs.existsSync(path.join(VARYANT, d, 'varyant.json')));
}

function kur(ad, hedefKok) {
  const kaynak = path.join(VARYANT, ad);
  const tarif = JSON.parse(fs.readFileSync(path.join(kaynak, 'varyant.json'), 'utf8'));
  const hedef = path.join(hedefKok || fs.mkdtempSync(path.join(os.tmpdir(), 'varyant-')), ad);
  fs.rmSync(hedef, { recursive: true, force: true });
  fs.cpSync(CEKIRDEK, hedef, { recursive: true });
  for (const d of fs.readdirSync(kaynak)) {
    if (d === 'varyant.json') continue;
    fs.cpSync(path.join(kaynak, d), path.join(hedef, d), { recursive: true });
  }
  for (const k of tarif.degistir || []) {
    const f = path.join(hedef, k.dosya);
    const s = fs.readFileSync(f, 'utf8');
    if (!s.includes(k.ara)) throw new Error(ad + ': ' + k.dosya + ' icinde bulunamadi: ' + k.ara.slice(0, 50));
    fs.writeFileSync(f, s.split(k.ara).join(k.yaz));
  }
  const ek = path.join(hedef, 'hooks', 'hooks.ek.json');
  if (fs.existsSync(ek)) {
    const h = path.join(hedef, 'hooks', 'hooks.json');
    const taban = JSON.parse(fs.readFileSync(h, 'utf8'));
    const ekle = JSON.parse(fs.readFileSync(ek, 'utf8'));
    for (const [ev, arr] of Object.entries(ekle.hooks)) taban.hooks[ev] = (taban.hooks[ev] || []).concat(arr);
    fs.writeFileSync(h, JSON.stringify(taban, null, 2) + '\n');
    fs.rmSync(ek);
  }
  return { hedef, tarif };
}

if (require.main === module) {
  const ad = process.argv[2];
  if (!ad || ad === '--liste') {
    for (const v of liste()) console.log(v + '\t' + JSON.parse(fs.readFileSync(path.join(VARYANT, v, 'varyant.json'), 'utf8')).aciklama);
    process.exit(0);
  }
  const { hedef } = kur(ad, process.argv[3]);
  console.log(hedef);
}

module.exports = { kur, liste };
