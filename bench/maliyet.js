const fs = require('fs');
const path = require('path');

function jsonlOku(dosya) {
  if (!fs.existsSync(dosya)) return [];
  return fs.readFileSync(dosya, 'utf8').split('\n').filter(Boolean).map((satir) => {
    try { return JSON.parse(satir); } catch { return null; }
  }).filter(Boolean);
}

function kalemEkle(sepet, model, usage) {
  if (!sepet[model]) {
    sepet[model] = { input_tokens: 0, output_tokens: 0, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 };
  }
  const satir = sepet[model];
  satir.input_tokens += usage.input_tokens || 0;
  satir.output_tokens += usage.output_tokens || 0;
  satir.cache_creation_input_tokens += usage.cache_creation_input_tokens || 0;
  satir.cache_read_input_tokens += usage.cache_read_input_tokens || 0;
}

function kayitlariIsle(kayitlar, sepet, gorulen) {
  for (const kayit of kayitlar) {
    if (kayit.type !== 'assistant' || !kayit.message || !kayit.message.usage) continue;
    const id = kayit.message.id;
    if (id) {
      if (gorulen.has(id)) continue;
      gorulen.add(id);
    }
    kalemEkle(sepet, kayit.message.model || 'bilinmiyor', kayit.message.usage);
  }
}

function anaModel(oturumDizini) {
  const kayitlar = jsonlOku(oturumDizini + '.jsonl');
  for (const kayit of kayitlar) {
    if (kayit.type === 'assistant' && kayit.message && kayit.message.model) return kayit.message.model;
  }
  return null;
}

function tokenlar(oturumDizini) {
  const sepet = {};
  const gorulen = new Set();
  kayitlariIsle(jsonlOku(oturumDizini + '.jsonl'), sepet, gorulen);
  const altAjanDizini = path.join(oturumDizini, 'subagents');
  if (fs.existsSync(altAjanDizini)) {
    for (const dosya of fs.readdirSync(altAjanDizini)) {
      if (!/^agent-.*\.jsonl$/.test(dosya)) continue;
      kayitlariIsle(jsonlOku(path.join(altAjanDizini, dosya)), sepet, gorulen);
    }
  }
  return sepet;
}

const KALEM_ALAN = {
  input_tokens: 'girdi',
  output_tokens: 'cikti',
  cache_creation_input_tokens: 'cacheYazma',
  cache_read_input_tokens: 'cacheOkuma',
};

function tarifeOku(tarifeYolu) {
  if (!fs.existsSync(tarifeYolu)) {
    throw new Error('tarife bulunamadi: ' + tarifeYolu + ' yok');
  }
  let veri;
  try {
    veri = JSON.parse(fs.readFileSync(tarifeYolu, 'utf8'));
  } catch (hata) {
    throw new Error('tarife bulunamadi: ' + tarifeYolu + ' gecerli json degil: ' + hata.message);
  }
  if (!veri || typeof veri.modeller !== 'object') {
    throw new Error('tarife bulunamadi: ' + tarifeYolu + ' icinde modeller yok');
  }
  const dogrulandi = veri.dogrulandi && typeof veri.dogrulandi === 'object'
    ? veri.dogrulandi
    : { girdi: true, cikti: true, cacheYazma: true, cacheOkuma: true };
  return { modeller: veri.modeller, dogrulandi };
}

function dogrulanmamisEtiketler(dogrulandi) {
  const etiketler = [];
  if (dogrulandi.girdi === false) etiketler.push('girdi-dogrulanmadi');
  if (dogrulandi.cikti === false) etiketler.push('cikti-dogrulanmadi');
  if (dogrulandi.cacheYazma === false || dogrulandi.cacheOkuma === false) etiketler.push('cache-dogrulanmadi');
  return etiketler;
}

function usdKaynagi(tarife) {
  const etiketler = dogrulanmamisEtiketler(tarife.dogrulandi);
  return etiketler.length ? 'tarife.json:' + etiketler.join(',') : 'tarife.json';
}

function usdHesapla(sepet, tarife) {
  let toplam = 0;
  const modelBasina = {};
  for (const [model, usage] of Object.entries(sepet)) {
    const fiyat = tarife.modeller[model];
    if (!fiyat) throw new Error('tarife bulunamadi: model icin satir yok: ' + model);
    let usd = 0;
    for (const [kalem, alan] of Object.entries(KALEM_ALAN)) {
      const birimFiyat = fiyat[alan];
      if (typeof birimFiyat !== 'number' || Number.isNaN(birimFiyat)) {
        throw new Error('tarife bulunamadi: ' + model + ' icin ' + alan + ' eksik');
      }
      usd += (usage[kalem] || 0) * birimFiyat;
    }
    usd /= 1000000;
    modelBasina[model] = usd;
    toplam += usd;
  }
  return { toplam, modelBasina, usdSource: usdKaynagi(tarife) };
}

module.exports = { tokenlar, tarifeOku, usdHesapla, anaModel };
