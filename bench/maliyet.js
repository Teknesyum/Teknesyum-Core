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

const KALEMLER = [
  'input_tokens',
  'output_tokens',
  'cache_creation_input_tokens',
  'cache_read_input_tokens',
];

// Ayni message.id iki satirda dusebilir: biri thinking blogu, digeri metin.
// Ikisinin usage alani ayni degil - metin kaydi mesajin tamamini tasir.
// Ilk kaydi tutup digerini atmak, dusunen kollari yuzlerce kat eksik sayar.
// Bu yuzden kimlik basina her kalemin en buyugu tutulur.
function kayitlariIsle(kayitlar, sepet, gorulen) {
  for (const kayit of kayitlar) {
    if (kayit.type !== 'assistant' || !kayit.message || !kayit.message.usage) continue;
    const usage = kayit.message.usage;
    const model = kayit.message.model || 'bilinmiyor';
    const id = kayit.message.id;
    if (!id) {
      kalemEkle(sepet, model, usage);
      continue;
    }
    const onceki = gorulen.get(id);
    if (!onceki) {
      const kopya = { model: model };
      for (const k of KALEMLER) kopya[k] = usage[k] || 0;
      gorulen.set(id, kopya);
      continue;
    }
    for (const k of KALEMLER) {
      const v = usage[k] || 0;
      if (v > onceki[k]) onceki[k] = v;
    }
  }
}

function kimlikleriBosalt(sepet, gorulen) {
  for (const kayit of gorulen.values()) kalemEkle(sepet, kayit.model, kayit);
  gorulen.clear();
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
  const gorulen = new Map();
  kayitlariIsle(jsonlOku(oturumDizini + '.jsonl'), sepet, gorulen);
  const altAjanDizini = path.join(oturumDizini, 'subagents');
  if (fs.existsSync(altAjanDizini)) {
    for (const dosya of fs.readdirSync(altAjanDizini)) {
      if (!/^agent-.*\.jsonl$/.test(dosya)) continue;
      kayitlariIsle(jsonlOku(path.join(altAjanDizini, dosya)), sepet, gorulen);
    }
  }
  kimlikleriBosalt(sepet, gorulen);
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
