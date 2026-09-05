'use strict';

const fs = require('fs');
const path = require('path');
const O = require('./olcum');

const B = path.join(O.KOK, 'bench');
const KOLLAR = ['native', 'core'];

function f2(x) { return x == null ? '-' : Number(x).toFixed(2); }
function f4(x) { return x == null ? '-' : Number(x).toFixed(4); }
function k(x) { return x == null ? '-' : Math.round(x).toLocaleString('en-US'); }
function yuzde(a, b) { return a == null || b == null || b === 0 ? '-' : ((a - b) / b * 100).toFixed(1) + '%'; }
function tokenToplam(t) { return t ? (t.girdi || 0) + (t.cikti || 0) + (t.cacheYazma || 0) + (t.cacheOkuma || 0) : null; }
function tablo(baslik, satirlar) {
  const out = ['| ' + baslik.join(' | ') + ' |', '|' + baslik.map(() => '---').join('|') + '|'];
  for (const s of satirlar) out.push('| ' + s.join(' | ') + ' |');
  return out.join('\n');
}

function taban() {
  const rows = O.jsonlOku(path.join(B, 'taban.jsonl'));
  const tur = rows.filter((r) => r.turn > 0 && !r.hata);
  const ozet = rows.filter((r) => r.ozet);
  const out = ['## 1. Taban: 100 sıradan tur, eklenti açık vs kapalı', ''];
  out.push('Beş oturum, oturum başına yirmi araçsız soru-cevap turu, iki kolda aynı sorular ve aynı sıra. Koltuk sonnet/low, temiz config. Token = girdi + çıktı + cache yazma + cache okuma. Kaynak: `bench/taban.jsonl`, transcriptler `bench/oturumlar/t*/`.', '');
  const satirlar = [];
  const ozetKol = {};
  for (const kol of KOLLAR) {
    const t = tur.filter((r) => r.arm === kol);
    const t1 = t.filter((r) => r.turn === 1).map((r) => r.girdi + r.cikti + r.cacheYazma + r.cacheOkuma);
    const tn = t.filter((r) => r.turn > 1).map((r) => r.girdi + r.cikti + r.cacheYazma + r.cacheOkuma);
    const usd = t.map((r) => r.usdCli);
    const oz = ozet.filter((r) => r.arm === kol);
    const oturumToken = oz.map((r) => tokenToplam(r.tokens));
    const cue = oz.reduce((a, r) => a + (r.kanca ? r.kanca.cueBytes : 0), 0);
    const arac = oz.reduce((a, r) => a + (r.aracCagrisi || 0), 0);
    ozetKol[kol] = { t1: O.medyan(t1), tn: O.medyan(tn), usd: O.medyan(usd), oturum: O.medyan(oturumToken), toplamUsd: oz.reduce((a, r) => a + (r.usd || 0), 0) };
    satirlar.push([kol, t.length, k(O.medyan(t1)), k(O.medyan(tn)), k(O.yuzdelik(tn, 95)), k(O.medyan(oturumToken)), f4(O.medyan(usd)), f2(ozetKol[kol].toplamUsd), cue, arac]);
  }
  out.push(tablo(['kol', 'tur', 'ilk tur token (medyan)', 'sonraki tur token (medyan)', 'sonraki tur token (p95)', 'oturum token (medyan)', 'tur $ (medyan)', 'toplam $', 'kanca baytı', 'araç çağrısı'], satirlar), '');
  const farklar = [];
  const farkUsd = [];
  for (const c of tur.filter((r) => r.arm === 'core')) {
    const n = tur.find((r) => r.arm === 'native' && r.session === c.session && r.turn === c.turn);
    if (!n) continue;
    farklar.push((c.girdi + c.cikti + c.cacheYazma + c.cacheOkuma) - (n.girdi + n.cikti + n.cacheYazma + n.cacheOkuma));
    farkUsd.push(c.usdCli - n.usdCli);
  }
  const ilkFark = farklar.length ? tur.filter((r) => r.arm === 'core' && r.turn === 1).map((c) => { const n = tur.find((r) => r.arm === 'native' && r.session === c.session && r.turn === 1); return n ? (c.girdi + c.cikti + c.cacheYazma + c.cacheOkuma) - (n.girdi + n.cikti + n.cacheYazma + n.cacheOkuma) : null; }).filter((x) => x != null) : [];
  out.push('Eşleştirilmiş fark (core − native), aynı oturum ve tur:', '');
  out.push(tablo(['ölçü', 'p50', 'p95', 'n'], [
    ['tur başı token', k(O.medyan(farklar)), k(O.yuzdelik(farklar, 95)), farklar.length],
    ['tur başı $', f4(O.medyan(farkUsd)), f4(O.yuzdelik(farkUsd, 95)), farkUsd.length],
    ['oturum başı ek token (ilk tur)', k(O.medyan(ilkFark)), k(O.yuzdelik(ilkFark, 95)), ilkFark.length],
    ['oturum toplam token farkı (medyanlar)', k(ozetKol.core.oturum - ozetKol.native.oturum), '-', Math.min(ozet.filter((r) => r.arm === 'core').length, ozet.filter((r) => r.arm === 'native').length)],
  ]), '');
  const hatalar = rows.filter((r) => r.hata);
  if (hatalar.length) out.push('Hatalı tur: ' + hatalar.length + ' (' + hatalar.map((h) => h.arm + ' s' + h.session + ' t' + h.turn).join(', ') + ')', '');
  return out.join('\n');
}

function gorevler() {
  const rows = O.jsonlOku(path.join(B, 'sonuc-016.jsonl'));
  const out = ['## 2. Görev 02-06: core vs native, n=5', ''];
  out.push('Koltuk sonnet/low iki kolda. core = eklenti 0.16.0 + K0 kuralı CLAUDE.md, native = boş config. Kabul: medyan $ farkı görev başına ≤ %5. Kaynak: `bench/sonuc-016.jsonl`, transcriptler `bench/oturumlar/b*/`.', '');
  const gorevler = [...new Set(rows.map((r) => r.taskId))].sort();
  const satirlar = [];
  let gecen = 0;
  for (const g of gorevler) {
    const kol = {};
    for (const arm of KOLLAR) {
      const rs = rows.filter((r) => r.taskId === g && r.arm === arm);
      const gecerli = rs.filter((r) => !r.dropped);
      kol[arm] = {
        n: rs.length, pass: gecerli.filter((r) => r.pass).length, dropped: rs.filter((r) => r.dropped).length,
        usd: O.medyan(gecerli.map((r) => r.usd).filter((x) => x != null)),
        dk: O.medyan(gecerli.map((r) => r.wallMs / 60000)),
        cue: rs.reduce((a, r) => a + (r.kanca ? r.kanca.cueHits : 0), 0),
        alt: rs.reduce((a, r) => a + (r.kanca ? r.kanca.subagents : 0), 0),
      };
    }
    const fark = kol.core.usd != null && kol.native.usd ? (kol.core.usd - kol.native.usd) / kol.native.usd * 100 : null;
    const kabul = fark != null && fark <= 5;
    if (kabul) gecen += 1;
    satirlar.push([g, kol.native.pass + '/' + kol.native.n, kol.core.pass + '/' + kol.core.n, f2(kol.native.usd), f2(kol.core.usd), fark == null ? '-' : fark.toFixed(1) + '%', f2(kol.native.dk), f2(kol.core.dk), kol.native.dropped + '/' + kol.core.dropped, kol.core.cue, kol.native.alt + '/' + kol.core.alt, kabul ? '✓' : '✗']);
  }
  out.push(tablo(['görev', 'pass native', 'pass core', '$ native (medyan)', '$ core (medyan)', '$ farkı', 'dk native', 'dk core', 'düşen n/c', 'core ipucu', 'alt ajan n/c', '≤%5'], satirlar), '');
  out.push('Kabulü geçen görev: ' + gecen + '/' + gorevler.length + '. Toplam harcama: ' + f2(rows.reduce((a, r) => a + (r.usd || 0), 0)) + ' $ (' + rows.length + ' koşu).', '');
  return out.join('\n');
}

function uyari() {
  const rows = O.jsonlOku(path.join(B, 'uyari.jsonl'));
  const out = ['## 3. Uyarı bedeli', ''];
  out.push('Boş depoya dört dosya yazdıran tek tur. core kolunda dördüncü Write sonrası count.js tek satır söyler ("4 dosyaya dokunuldu ve plan yok. docs/plan.md yaz ya da atla de."); native aynı turu uyarısız koşar. Kaynak: `bench/uyari.jsonl`, transcriptler `bench/oturumlar/u*/`.', '');
  const satirlar = [];
  for (const arm of KOLLAR) {
    const rs = rows.filter((r) => r.arm === arm && r.usd != null);
    satirlar.push([arm, rs.length, k(O.medyan(rs.map((r) => tokenToplam(r.tokens)))), k(O.medyan(rs.map((r) => r.tokens.cikti))), f4(O.medyan(rs.map((r) => r.usd))), O.medyan(rs.map((r) => r.aracCagrisi)), k(O.medyan(rs.map((r) => r.ms))), rs.reduce((a, r) => a + r.kanca.cueHits, 0), rs.filter((r) => r.planYazildi).length, rs.filter((r) => r.dosyalar === 4).length]);
  }
  out.push(tablo(['kol', 'n', 'token (medyan)', 'çıktı token (medyan)', '$ (medyan)', 'araç çağrısı (medyan)', 'süre ms (medyan)', 'ipucu sayısı', 'plan yazdı', '4 dosya tamam'], satirlar), '');
  const c = rows.filter((r) => r.arm === 'core' && r.usd != null), n = rows.filter((r) => r.arm === 'native' && r.usd != null);
  if (c.length && n.length) {
    out.push('Uyarının bedeli (core − native, medyanlar): ' + k(O.medyan(c.map((r) => tokenToplam(r.tokens))) - O.medyan(n.map((r) => tokenToplam(r.tokens)))) + ' token, ' + f4(O.medyan(c.map((r) => r.usd)) - O.medyan(n.map((r) => r.usd))) + ' $, ' + (O.medyan(c.map((r) => r.aracCagrisi)) - O.medyan(n.map((r) => r.aracCagrisi))) + ' araç çağrısı.', '');
  }
  return out.join('\n');
}

function devam() {
  const rows = O.jsonlOku(path.join(B, 'devam.jsonl'));
  const out = ['## 4. Resume: kesilen oturum, yeni oturumda yalnız "devam et"', ''];
  out.push('Görev 06 (slugify CLI, dört parça). Birinci oturum `--max-turns 6` ile kesilir; core kolunda SessionEnd kancası `.claude/handoff.md` yazar, native kolunda hiçbir şey kalmaz. İkinci oturum aynı dizinde yalnız "devam et" der. Tekrar araç = ikinci oturumda birinci oturumla aynı imzalı (araç + hedef) çağrı. Anlamlı araç = Write/Edit/Bash. Kaynak: `bench/devam.jsonl`, transcriptler ve handoff dosyaları `bench/oturumlar/d*/`.', '');
  const satirlar = [];
  for (const arm of KOLLAR) {
    const rs = rows.filter((r) => r.arm === arm && r.s2 && r.s2.usd != null);
    satirlar.push([arm, rs.length, rs.filter((r) => r.handoffVar).length, rs.filter((r) => r.s1Kabul && r.s1Kabul.pass).length, rs.filter((r) => r.s2Kabul && r.s2Kabul.pass).length, O.medyan(rs.map((r) => r.s2.tekrarAraci)), O.medyan(rs.map((r) => r.s2.aracCagrisi)), k(O.medyan(rs.map((r) => r.s2.ilkAracMs))), k(O.medyan(rs.map((r) => r.s2.ilkAnlamliMs))), k(O.medyan(rs.map((r) => tokenToplam(r.s2.tokens)))), f4(O.medyan(rs.map((r) => r.s2.usd))), rs.reduce((a, r) => a + r.s2.kanca.cueHits, 0)]);
  }
  out.push(tablo(['kol', 'n', 'handoff var', 'kabul s1', 'kabul s2', 'tekrar araç (medyan)', 's2 araç (medyan)', 'ilk araç ms', 'ilk anlamlı araç ms', 's2 token (medyan)', 's2 $ (medyan)', 's2 ipucu'], satirlar), '');
  out.push('İkinci oturumun ilk anlamlı adımı, koşu koşu:', '');
  const adimlar = [];
  for (const r of rows) adimlar.push([r.arm, r.repeat, r.s1 ? r.s1.aracCagrisi : '-', r.s2 ? r.s2.aracCagrisi : '-', r.s2 ? r.s2.tekrarAraci : '-', r.s2 && r.s2.ilkAnlamli ? '`' + r.s2.ilkAnlamli.replace(/\\/g, '/').replace(/.*tkc-olcum-work-[^/]+\//, '').replace(/\|/g, '\\|').slice(0, 90) + '`' : '-', r.s2Kabul && r.s2Kabul.pass ? '✓' : '✗']);
  out.push(tablo(['kol', 'tekrar', 's1 araç', 's2 araç', 'tekrar araç', 's2 ilk anlamlı adım', 'kabul'], adimlar), '');
  return out.join('\n');
}

const BULGULAR = [
  '## 5. Bulgular',
  '',
  '- Sıradan tur: kancalar bağlama 0 bayt yazdı (200 turda kanca baytı 0). core yine de tur başına ~207 token (p50) / 427 (p95) fazla okur; bu K0 kuralının CLAUDE.md\'de durmasıdır (oturum başı ilk tur farkı ~190 token ile aynı büyüklük). Tamamı cache okuması: tur başına 0,0001 $.',
  '- Görev 02-05: medyan $ farkı ±%3 ile gürültü içinde; 04 ve 05\'te core daha ucuz çıktı, o da gürültü. Görev 06: +%9,3, kabul dışı. Sebep: görev tam dört dosyaya dokunuyor, eşik dört; ipucu 5/5 koşuda tetiklendi, model beşinde de "atla" dedi, plan yazmadı. Bedel ipucunun kendisi değil (madde 3), modelin ipucuya verdiği cevap ve uzayan süre.',
  '- Uyarı bedeli tek başına: ~450 token, 0,0007 $, ek araç çağrısı yok.',
  '- Resume: handoff 5/5 yazıldı ama decisions/next_action "(fill)" kaldı (altı turda bağlam eşiği dolmaz) ve dosyada görevin kendisi yok. core ikinci oturumda önce handoff\'u okuyor, native doğrudan git diff\'e bakıyor; ikisi de görevi bilmediği için çoğu koşuda "çalışıyor" deyip duruyor. Kabul core 1/5, native 0/5; core ikinci oturumda %31 daha pahalı (daha çok araç). Tekrarlanan araç çağrısı iki kolda da medyan 0.',
  '- Ölçüm sonrası karar bekleyenler (0.16\'ya girmedi): handoff\'a oturumun ilk kullanıcı istemi eklenmeli; dört dosya eşiği tam dört dosyalık meşru görevde tetikleniyor, eşik ya da bileşimi yeniden düşünülmeli.',
  '- Harcama: 18,36 $ ölçüm, ~1 $ ön kontrol ve deneme. Tekrar sayısı spec gereği 5 (bellekteki 3 tavanı kullanıcının 50 $ yetkisiyle aşıldı).',
  '',
].join('\n');

function main() {
  const parcalar = [
    '# Bench Raporu: Core 0.16.0 vs Native Claude Code',
    '',
    'Tarih: ' + new Date().toISOString().slice(0, 10) + '. Claude Code ' + (O.jsonlOku(path.join(B, 'sonuc-016.jsonl'))[0] || {}).ccVersion + ', model claude-sonnet-5, tarife `docs/tarife.json`. Spec: Core v2 yön promptu madde 8. Ölçüm betikleri: `bench/run.js`, `bench/taban.js`, `bench/uyari.js`, `bench/devam.js`; bu rapor `bench/rapor016.js` ile üretildi.',
    '',
    taban(), gorevler(), uyari(), devam(), BULGULAR,
  ];
  fs.writeFileSync(path.join(B, 'rapor.md'), parcalar.join('\n') + '\n');
  console.log('bench/rapor.md yazıldı');
}

if (require.main === module) main();
