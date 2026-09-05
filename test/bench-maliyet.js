const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert/strict');
const { tokenlar, tarifeOku, usdHesapla, anaModel } = require('../bench/maliyet');

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('PASS ' + name); }
  catch (e) { failed++; console.error('FAIL ' + name + ': ' + e.stack); }
}

function usageSatiri(model, id, usage) {
  return JSON.stringify({ type: 'assistant', message: { id, model, usage } }) + '\n';
}

function sahteOturum() {
  const kok = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-maliyet-'));
  const oturumId = 'oturum-1';
  const oturumYolu = path.join(kok, oturumId);
  fs.mkdirSync(path.join(oturumYolu, 'subagents'), { recursive: true });

  const anaUsage = { input_tokens: 10, output_tokens: 20, cache_creation_input_tokens: 100, cache_read_input_tokens: 1000 };
  let ana = usageSatiri('claude-sonnet-5', 'msg_ana_1', anaUsage);
  ana += usageSatiri('claude-sonnet-5', 'msg_ana_1', anaUsage);
  ana += usageSatiri('claude-sonnet-5', 'msg_ana_2', { input_tokens: 1, output_tokens: 2, cache_creation_input_tokens: 3, cache_read_input_tokens: 4 });
  fs.writeFileSync(oturumYolu + '.jsonl', ana);

  const altUsage1 = { input_tokens: 5, output_tokens: 6, cache_creation_input_tokens: 7, cache_read_input_tokens: 8 };
  fs.writeFileSync(path.join(oturumYolu, 'subagents', 'agent-a1.jsonl'), usageSatiri('claude-haiku-4-5', 'msg_alt_1', altUsage1));

  const altUsage2 = { input_tokens: 50, output_tokens: 60, cache_creation_input_tokens: 70, cache_read_input_tokens: 80 };
  let alt2 = usageSatiri('claude-opus-5', 'msg_alt_2', altUsage2);
  alt2 += usageSatiri('claude-opus-5', 'msg_alt_2', altUsage2);
  fs.writeFileSync(path.join(oturumYolu, 'subagents', 'agent-a2.jsonl'), alt2);

  fs.writeFileSync(path.join(oturumYolu, 'subagents', 'ilgisiz.txt'), 'agent-a1.jsonl degil, atlanmali');

  return oturumYolu;
}

test('dört kalem model başına doğru toplanıyor, tekrarlanan mesaj id çift sayılmıyor', () => {
  const oturumYolu = sahteOturum();
  const sepet = tokenlar(oturumYolu);
  assert.deepEqual(sepet['claude-sonnet-5'], { input_tokens: 11, output_tokens: 22, cache_creation_input_tokens: 103, cache_read_input_tokens: 1004 });
});

test('alt ajanlar atlanmıyor, her model kendi kovasında', () => {
  const oturumYolu = sahteOturum();
  const sepet = tokenlar(oturumYolu);
  assert.deepEqual(sepet['claude-haiku-4-5'], { input_tokens: 5, output_tokens: 6, cache_creation_input_tokens: 7, cache_read_input_tokens: 8 });
  assert.deepEqual(sepet['claude-opus-5'], { input_tokens: 50, output_tokens: 60, cache_creation_input_tokens: 70, cache_read_input_tokens: 80 });
  assert.equal(Object.keys(sepet).length, 3);
});

test('tarife dosyası yoksa hata verir, sıfır varsaymaz', () => {
  assert.throws(() => tarifeOku(path.join(os.tmpdir(), 'olmayan-tarife-' + Date.now() + '.json')), /tarife bulunamadi/);
});

test('tarifede modelin satırı yoksa usdHesapla hata verir', () => {
  const kok = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-tarife-'));
  const tarifeYolu = path.join(kok, 'tarife.json');
  fs.writeFileSync(tarifeYolu, JSON.stringify({ modeller: { 'claude-sonnet-5': { girdi: 2, cikti: 10, cacheYazma: 2.5, cacheOkuma: 0.2 } } }));
  const tarife = tarifeOku(tarifeYolu);
  assert.throws(() => usdHesapla({ 'claude-opus-5': { input_tokens: 1, output_tokens: 1, cache_creation_input_tokens: 1, cache_read_input_tokens: 1 } }, tarife), /tarife bulunamadi/);
});

test('dört kalemden biri eksikse usdHesapla hata verir', () => {
  const kok = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-tarife-'));
  const tarifeYolu = path.join(kok, 'tarife.json');
  fs.writeFileSync(tarifeYolu, JSON.stringify({ modeller: { 'claude-sonnet-5': { girdi: 2, cikti: 10, cacheOkuma: 0.2 } } }));
  const tarife = tarifeOku(tarifeYolu);
  assert.throws(() => usdHesapla({ 'claude-sonnet-5': { input_tokens: 1, output_tokens: 1, cache_creation_input_tokens: 1, cache_read_input_tokens: 1 } }, tarife), /eksik/);
});

test('usd doğru hesaplanır ve doğrulanmamış kalem usdSource\'a yansır', () => {
  const kok = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-tarife-'));
  const tarifeYolu = path.join(kok, 'tarife.json');
  fs.writeFileSync(tarifeYolu, JSON.stringify({
    dogrulandi: { girdi: true, cikti: true, cacheYazma: false, cacheOkuma: false },
    modeller: { 'claude-sonnet-5': { girdi: 2, cikti: 10, cacheYazma: 2.5, cacheOkuma: 0.2 } },
  }));
  const tarife = tarifeOku(tarifeYolu);
  const sepet = { 'claude-sonnet-5': { input_tokens: 1000000, output_tokens: 1000000, cache_creation_input_tokens: 1000000, cache_read_input_tokens: 1000000 } };
  const sonuc = usdHesapla(sepet, tarife);
  assert.equal(sonuc.modelBasina['claude-sonnet-5'], 2 + 10 + 2.5 + 0.2);
  assert.equal(sonuc.toplam, 2 + 10 + 2.5 + 0.2);
  assert.equal(sonuc.usdSource, 'tarife.json:cache-dogrulanmadi');
});

test('tüm kalemler doğrulanmışsa usdSource yalın tarife.json olur', () => {
  const kok = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-tarife-'));
  const tarifeYolu = path.join(kok, 'tarife.json');
  fs.writeFileSync(tarifeYolu, JSON.stringify({
    dogrulandi: { girdi: true, cikti: true, cacheYazma: true, cacheOkuma: true },
    modeller: { 'claude-sonnet-5': { girdi: 2, cikti: 10, cacheYazma: 2.5, cacheOkuma: 0.2 } },
  }));
  const tarife = tarifeOku(tarifeYolu);
  const sonuc = usdHesapla({ 'claude-sonnet-5': { input_tokens: 0, output_tokens: 0, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 } }, tarife);
  assert.equal(sonuc.usdSource, 'tarife.json');
});

test('anaModel yalnız ana oturumdan okur, ilk atanmış modeli döner', () => {
  const oturumYolu = sahteOturum();
  assert.equal(anaModel(oturumYolu), 'claude-sonnet-5');
});

test('anaModel ana oturum yoksa null döner', () => {
  const kok = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-maliyet-bos-'));
  assert.equal(anaModel(path.join(kok, 'yok')), null);
});

console.log(JSON.stringify({ passed, failed }));
process.exitCode = failed > 0 ? 1 : 0;
