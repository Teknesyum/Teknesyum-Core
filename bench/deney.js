#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');
const { kur } = require('./varyant');

const KOK = path.resolve(__dirname, '..');
const RUN = path.join(__dirname, 'run.js');
const BANT = 0.1;

function oku(yol) {
  return fs.existsSync(yol) ? fs.readFileSync(yol, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)) : [];
}

function medyan(a) {
  const s = [...a].sort((x, y) => x - y);
  return s.length ? s[Math.floor(s.length / 2)] : NaN;
}

function ortalama(a) {
  return a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN;
}

function yon(deger, taban) {
  const oran = deger / taban;
  return oran < 1 - BANT ? 'ucuz' : oran > 1 + BANT ? 'pahali' : 'esit';
}

function envCoz(env) {
  const out = {};
  for (const [k, v] of Object.entries(env || {})) {
    if (typeof v === 'string' && v.startsWith('@')) out[k] = kur(v.slice(1)).hedef;
    else if (k === 'BENCH_K0' && v) out[k] = path.resolve(KOK, v);
    else out[k] = v;
  }
  return out;
}

function kos(deney, k, bas, son) {
  console.log('== ' + k.ad + ' ' + k.task + ' r' + bas + '-' + son);
  const r = spawnSync(process.execPath, [
    RUN, '--scope', 'tam', '--tasks', k.task, '--arms', 'core', '--repeatFrom', String(bas), '--repeat', String(son),
    '--sonuc', deney.sonucYolu, '--configTemplate', process.env.BENCH_CONFIG || path.join(os.homedir(), '.claude'),
  ], { cwd: KOK, stdio: 'inherit', windowsHide: true, env: { ...process.env, BENCH_VARYANT: k.ad, ...envCoz(k.env) } });
  console.log('== ' + k.ad + ' bitti, kod ' + r.status);
}

function satirlar(deney, ad) {
  return oku(deney.sonucYolu).filter((r) => r.varyant === ad && !r.dropped);
}

function tabanDeger(deney, k) {
  if (typeof k.taban === 'string' && k.taban.startsWith('@')) return medyan(satirlar(deney, k.taban.slice(1)).map((r) => r.usd));
  return Number(k.taban);
}

function degerlendir(deney, k) {
  const rows = satirlar(deney, k.ad);
  const usd = rows.map((r) => r.usd);
  const taban = tabanDeger(deney, k);
  const ilk = usd.slice(0, k.n);
  const ikinci = usd.slice(k.n);
  const gozlem = yon(medyan(ilk), taban);
  const celisti = gozlem !== k.beklenti;
  const nihai = ikinci.length ? yon(ortalama(usd), taban) : gozlem;
  return { rows, usd, taban, ilk, ikinci, gozlem, celisti, nihai, kabul: rows.filter((r) => r.pass).length };
}

function calistir(deney) {
  for (const k of deney.kosullar) {
    const var_ = satirlar(deney, k.ad).length;
    if (var_ < k.n) kos(deney, k, var_ + 1, k.n);
    const d = degerlendir(deney, k);
    if (d.celisti && d.ikinci.length === 0) {
      console.log('== ' + k.ad + ' beklenti ' + k.beklenti + ', gozlem ' + d.gozlem + ': ikinci saglama');
      kos(deney, k, k.n + 1, 2 * k.n);
    }
  }
}

function rapor(deney) {
  const p = (x) => (Number.isFinite(x) ? x.toFixed(2) : '-');
  const out = ['# Deney: ' + deney.ad, '', '- soru: ' + deney.soru, '- kaynak: ' + path.relative(KOK, deney.sonucYolu).split(path.sep).join('/'), '- bant: ±' + Math.round(BANT * 100) + '%', '', '| koşul | görev | taban $ | beklenti | 1. tur $ | gözlem | 2. tur $ | ortalama $ | karar | kabul |', '|---|---|---|---|---|---|---|---|---|---|'];
  let toplam = 0;
  for (const k of deney.kosullar) {
    const d = degerlendir(deney, k);
    toplam += d.usd.reduce((x, y) => x + y, 0);
    out.push('| ' + [k.ad, k.task, p(d.taban), k.beklenti, d.ilk.map(p).join(' / ') + ' (m ' + p(medyan(d.ilk)) + ')', d.gozlem + (d.celisti ? ' ✗' : ' ✓'), d.ikinci.length ? d.ikinci.map(p).join(' / ') : '-', p(ortalama(d.usd)), d.nihai, d.kabul + '/' + d.rows.length].join(' | ') + ' |');
  }
  out.push('', 'Karar sütunu: ikinci tur koşulduysa iki turun ortalaması, koşulmadıysa ilk turun medyanı, tabana göre ' + Math.round(BANT * 100) + '% bant ile.', '', 'Toplam harcama: ' + p(toplam) + ' $ (' + deney.kosullar.reduce((s, k) => s + satirlar(deney, k.ad).length, 0) + ' koşu).', '');
  return out.join('\n');
}

function yukle(yol) {
  const deney = JSON.parse(fs.readFileSync(yol, 'utf8'));
  deney.ad = path.basename(yol, '.json');
  deney.sonucYolu = path.resolve(KOK, deney.sonuc);
  return deney;
}

function main(argv) {
  const yol = argv.find((a) => a.endsWith('.json'));
  if (!yol) {
    process.stdout.write([
      'deney.js <bench/deney/AD.json> [--rapor]   run every condition n times; when the result contradicts',
      '                                           its expectation, run a second pass of n and decide on the mean',
      '',
      'Condition: {ad, env, task, n, taban, beklenti}. taban is a dollar figure or "@<condition>" (that',
      'condition\'s median). beklenti is ucuz | esit | pahali against taban with a ±' + Math.round(BANT * 100) + '% band.',
      '--rapor only prints the table for the rows already in the result file.',
    ].join('\n') + '\n');
    return;
  }
  const deney = yukle(path.resolve(KOK, yol));
  if (!argv.includes('--rapor')) calistir(deney);
  const metin = rapor(deney);
  const raporYolu = path.join(KOK, 'bench', 'deney', deney.ad + '.karar.md');
  fs.writeFileSync(raporYolu, metin);
  process.stdout.write(metin + '\n' + path.relative(KOK, raporYolu) + '\n');
}

if (require.main === module) main(process.argv.slice(2));

module.exports = { yon, medyan, ortalama, degerlendir, BANT };
