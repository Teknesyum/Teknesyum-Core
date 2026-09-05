const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert/strict');
const {
  onKontrolYap, onKontrolluCalistir, configSablonundanKopyala, IZIN_VERILEN_CONFIG_GIRDILERI,
} = require('../bench/run');

let passed = 0, failed = 0;
const bekleyenler = [];
function test(name, fn) {
  const p = Promise.resolve().then(fn).then(() => { passed++; console.log('PASS ' + name); })
    .catch((e) => { failed++; console.error('FAIL ' + name + ': ' + e.stack); });
  bekleyenler.push(p);
}

function mkdtempSahte() {
  const dizinler = [];
  return { mkdtemp: (onEk) => { const d = fs.mkdtempSync(path.join(os.tmpdir(), onEk)); dizinler.push(d); return d; }, dizinler };
}

function gorevKokHazirla() {
  const gorevKok = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-onkontrol-gorevler-'));
  for (const taskId of ['01-slugify', '02-click']) {
    fs.writeFileSync(path.join(gorevKok, taskId + '.md'), [
      '---',
      'repo: https://example.invalid/sahte.git',
      'sha: deadbeef',
      '---',
      '',
      'Sahte görev metni.',
    ].join('\n'));
  }
  return gorevKok;
}
const GOREV_KOK = gorevKokHazirla();

function basariliGit() {
  return { klonla: () => ({ status: 0 }), checkoutYap: () => ({ status: 0 }) };
}

test('ön kontrol geçince gerçek koşu başlar', async () => {
  const { mkdtemp } = mkdtempSahte();
  let calistiriciCagriSayisi = 0;
  const onKontrolCalistirici = () => ({ kod: 0, cikti: '' });
  const kosuCalistirici = async () => { calistiriciCagriSayisi++; return { kod: 0, zamanAsimi: false }; };
  const sonucYolu = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-onkontrol-sonuc-')), 'sonuc.jsonl');
  const sonuc = await onKontrolluCalistir('pilot', 1, {
    env: {},
    onKontrolCalistirici,
    onKontrolMkdtemp: mkdtemp,
    git: basariliGit(),
    calistirici: kosuCalistirici,
    mkdtemp,
    gorevKok: GOREV_KOK,
    sonucYolu,
    ccVersion: 'cc-test',
  });
  assert.equal(sonuc.basladi, true);
  assert.ok(calistiriciCagriSayisi > 0);
  assert.ok(fs.existsSync(sonucYolu));
});

test('ön kontrol geçmeyince hiçbir koşu başlamaz ve sonuc.jsonl yazılmaz', async () => {
  const { mkdtemp } = mkdtempSahte();
  let calistiriciCagrildi = false;
  const onKontrolCalistirici = () => ({ kod: 1, cikti: 'Not logged in · Please run /login' });
  const kosuCalistirici = async () => { calistiriciCagrildi = true; return { kod: 0, zamanAsimi: false }; };
  const sonucDizini = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-onkontrol-sonuc-'));
  const sonucYolu = path.join(sonucDizini, 'sonuc.jsonl');
  const sonuc = await onKontrolluCalistir('pilot', 1, {
    env: {},
    onKontrolCalistirici,
    onKontrolMkdtemp: mkdtemp,
    git: basariliGit(),
    calistirici: kosuCalistirici,
    mkdtemp,
    gorevKok: GOREV_KOK,
    sonucYolu,
    ccVersion: 'cc-test',
  });
  assert.equal(sonuc.basladi, false);
  assert.ok(sonuc.mesaj && sonuc.mesaj.length > 0);
  assert.equal(calistiriciCagrildi, false);
  assert.equal(fs.existsSync(sonucYolu), false);
});

test('yalnız izin listesindeki girdiler kopyalanır, listede olmayan uydurma dosya atlanır', () => {
  const sablonDizini = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-onkontrol-sablon-'));
  const hedefDizini = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-onkontrol-hedef-'));
  const bilinenKirleticiler = ['CLAUDE.md', 'RULES.md', 'RTK.md', 'projects', 'memory', 'teknesyum', 'plugins', 'settings.json'];
  for (const ad of [...IZIN_VERILEN_CONFIG_GIRDILERI, ...bilinenKirleticiler, 'sizinti-denemesi.md']) {
    const tamYol = path.join(sablonDizini, ad);
    if (['projects', 'memory', 'teknesyum', 'plugins'].includes(ad)) {
      fs.mkdirSync(tamYol, { recursive: true });
      fs.writeFileSync(path.join(tamYol, 'icerik.txt'), 'x');
    } else {
      fs.writeFileSync(tamYol, 'x');
    }
  }
  configSablonundanKopyala(sablonDizini, hedefDizini);
  const kopyalanan = fs.readdirSync(hedefDizini);
  assert.deepEqual(kopyalanan.sort(), [...IZIN_VERILEN_CONFIG_GIRDILERI].sort());
  for (const kirletici of bilinenKirleticiler) {
    assert.ok(!kopyalanan.includes(kirletici), 'bilinen kirletici kopyalanmış: ' + kirletici);
  }
  assert.ok(!kopyalanan.includes('sizinti-denemesi.md'), 'listede olmayan uydurma dosya kopyalanmış');
});

test('izin listesinde olmayan girdi hata değil sessiz atlama üretir', () => {
  const sablonDizini = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-onkontrol-bos-sablon-'));
  const hedefDizini = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-onkontrol-bos-hedef-'));
  assert.doesNotThrow(() => configSablonundanKopyala(sablonDizini, hedefDizini));
  assert.deepEqual(fs.readdirSync(hedefDizini), []);
});

test('ANTHROPIC_API_KEY varken --configTemplate istenmez', () => {
  const { mkdtemp } = mkdtempSahte();
  let kopyalaCagrildi = false;
  const onKontrolCalistirici = (argumanlar, secenekler) => {
    assert.equal(secenekler.env.ANTHROPIC_API_KEY, 'sk-test');
    return { kod: 0, cikti: '' };
  };
  const sonuc = onKontrolYap({
    env: { ANTHROPIC_API_KEY: 'sk-test' },
    configTemplate: '/yasaklı/hiç-var-olmayan-dizin',
    mkdtemp,
    calistirici: onKontrolCalistirici,
    kopyala: () => { kopyalaCagrildi = true; },
  });
  assert.equal(sonuc.basarili, true);
  assert.equal(sonuc.apiKeyVar, true);
  assert.equal(kopyalaCagrildi, false);
});

Promise.all(bekleyenler).then(() => {
  fs.rmSync(GOREV_KOK, { recursive: true, force: true });
  console.log(JSON.stringify({ passed, failed }));
  process.exitCode = failed > 0 ? 1 : 0;
});
