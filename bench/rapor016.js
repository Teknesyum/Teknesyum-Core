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

function gorevler(dosya = 'sonuc-016.jsonl', baslik = '## 2. Görev 02-06: core vs native, n=5') {
  const rows = O.jsonlOku(path.join(B, dosya));
  const out = [baslik, ''];
  out.push('Koltuk sonnet/low iki kolda. core = eklenti 0.16.0 + K0 kuralı CLAUDE.md, native = boş config. Kabul: medyan $ farkı görev başına ≤ %5. Kaynak: `bench/' + dosya + '`, transcriptler `bench/oturumlar/b*/`.', '');
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

function devam(dosya = 'devam.jsonl', baslik = '## 4. Resume: kesilen oturum, yeni oturumda yalnız "devam et"') {
  const rows = O.jsonlOku(path.join(B, dosya));
  const out = [baslik, ''];
  out.push('Görev 06 (slugify CLI, dört parça). Birinci oturum `--max-turns 6` ile kesilir; core kolunda SessionEnd kancası `.claude/handoff.md` yazar, native kolunda hiçbir şey kalmaz. İkinci oturum aynı dizinde yalnız "devam et" der. Tekrar araç = ikinci oturumda birinci oturumla aynı imzalı (araç + hedef) çağrı. Anlamlı araç = Write/Edit/Bash. Kaynak: `bench/' + dosya + '`, transcriptler ve handoff dosyaları `bench/oturumlar/d*/`.', '');
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

function taskSayisi(rows) {
  let var_ = 0, dolu = 0;
  for (const r of rows.filter((x) => x.arm === 'core' && x.handoffVar)) {
    var_ += 1;
    const t = r.s1 && r.s1.transcript ? path.join(O.KOK, r.s1.transcript, 'handoff.md') : '';
    let h = '';
    try { h = fs.readFileSync(t, 'utf8'); } catch {}
    const m = /## task\n([\s\S]*?)(?=\n## |\s*$)/.exec(h);
    if (m && m[1].trim() && m[1].trim() !== '(fill)') dolu += 1;
  }
  return { var_, dolu };
}

function sonra(ek = 'b', no = 6, baslik = 'Değişiklik sonrası: eşik 5 dosya, handoff\'ta task', giris = 'Bölüm 5\'teki iki karar uygulandı (count.js FILE_MAX 4→5; handoff.js oturumun ilk istemini transkriptten `## task` olarak yazar) ve yalnız etkilenen iki ölçüm üç tekrarla yeniden koşuldu. Aynı koltuk, aynı yöntem.') {
  const g = O.jsonlOku(path.join(B, 'sonuc-016' + ek + '.jsonl'));
  const d = O.jsonlOku(path.join(B, 'devam-' + ek + '.jsonl'));
  const out = ['## ' + no + '. ' + baslik, ''];
  out.push(giris, '');
  out.push(gorevler('sonuc-016' + ek + '.jsonl', '### ' + no + 'a. Görev 06, n=3').split('\n').slice(2).join('\n'));
  out.push(devam('devam-' + ek + '.jsonl', '### ' + no + 'b. Resume, n=3').split('\n').slice(2).join('\n'));
  if (ek === 'b') out.push('**Bu turun kabul sütunları geçersiz.** Koşu PowerShell\'den ayrık başlatıldı, devam.js kabul betiğini çıplak `bash` adıyla çağırıyordu ve bulamadı (kabul çıktısı altı satırda da boş). Handoff, araç ve maliyet sütunları geçerli; kabul s1/s2 ölçülmedi. Hata bölüm 7\'den önce yakalandı, devam.js artık run.js\'in `bashYolu()`\'nu kullanıyor.', '');
  if (d.some((r) => r.kancaHata != null)) out.push('Kanca günlüğü (core, s1): ' + d.filter((r) => r.arm === 'core').map((r) => 'r' + r.repeat + ' hata ' + (r.kancaHata ? 'var' : 'yok') + ', durum dosyası ' + (r.durumDosyasi == null ? '-' : r.durumDosyasi) + ', handoff ' + (r.handoffVar ? 'var' : 'yok')).join('; ') + '. Kopyalar `bench/oturumlar/d*/core-r*-s1/kanca/`.', '');
  const ts = taskSayisi(d);
  const c = d.filter((r) => r.arm === 'core' && r.s2 && r.s2.usd != null), n = d.filter((r) => r.arm === 'native' && r.s2 && r.s2.usd != null);
  const gc = g.filter((r) => r.arm === 'core' && !r.dropped), gn = g.filter((r) => r.arm === 'native' && !r.dropped);
  out.push('Özet: görev 06 ipucu ' + g.filter((r) => r.arm === 'core').reduce((a, r) => a + (r.kanca ? r.kanca.cueHits : 0), 0) + '/' + g.filter((r) => r.arm === 'core').length + ' koşuda tetiklendi, medyan $ farkı ' + yuzde(O.medyan(gc.map((r) => r.usd)), O.medyan(gn.map((r) => r.usd))) + ' (önce +%9,3). Handoff\'ta task dolu ' + ts.dolu + '/' + ts.var_ + '. Resume kabulü core ' + c.filter((r) => r.s2Kabul && r.s2Kabul.pass).length + '/' + c.length + ', native ' + n.filter((r) => r.s2Kabul && r.s2Kabul.pass).length + '/' + n.length + ' (önce 1/5 ve 0/5). Harcama: ' + f2(g.reduce((a, r) => a + (r.usd || 0), 0) + d.reduce((a, r) => a + ((r.s1 && r.s1.usd) || 0) + ((r.s2 && r.s2.usd) || 0), 0)) + ' $.', '');
  const sebepler = [...new Set(g.flatMap((r) => (r.kanca && r.kanca.cues) || []).map((c) => c.replace(/^\d+ /, '').split('.')[0]))];
  if (ek === 'c') {
    out.push('Yorum:', '',
      '- Görev 06: ipucu artık hiç gelmiyor (yeni dosya satırları eşiğe girmiyor); $ farkı n=3 ile gürültü sınırında, native r1 tek uç değer. Eşik mekanizması bu görevde sustu, bedel K0 kuralının ~200 tokenine indi.',
      '- Kanca günlüğü üç koşuda da temiz, handoff 3/3 yazıldı; bölüm 6\'daki kayıp handoff bu turda tekrarlanmadı.',
      '- Resume: core 3/3 bitirdi, native 0/3. Devir dosyası task + kural satırıyla ikinci oturumu işe bağlıyor; native git diff\'e bakıp "çalışıyor" deyip duruyor. core ikinci oturumda üç kat harcıyor (0,33 $ ile 0,11 $) ama native hiçbir koşuda işi bitirmediği için bitmiş iş başına maliyet karşılaştırması native lehine kurulamıyor. İlk koşu bash hatasıyla atıldı (satırları trash klasörüne gitti), tablo yeniden koşulan üç çiftten.',
      '');
    return out.join('\n');
  }
  if (ek !== 'b') return out.join('\n');
  out.push('Yorum:', '',
    '- Dosya eşiği artık görev 06\'da tetiklenmiyor; onun yerine satır eşiği tetikleniyor ("' + sebepler.join('", "') + '"): görev üç yeni dosyayla ~185 satır yazıyor, eşik 150. İpucu yine her koşuda geldi, model yine "atla" dedi. n=3 ile $ farkı gürültülü (core r1 0,73 $ tek uç değer), ama kabul yine ✗. 150 satır eşiği yeni dosyalarda kaba: karar bekleyen üçüncü madde.',
    '- Handoff\'ta task tam metinle duruyor (2000 karakter tavanı; 500 ilk denemede görevin maddelerini kesti, o koşu atıldı, satırları trash klasörüne gitti). core r3\'te handoff yazılmadı: oturum Write 1 + Edit 3 ile aynı dört dosyaya dokundu, SessionEnd sonrası dosya yok; sebep belirlenemedi, çünkü koşu sonunda config dizini ve kanca hata günlüğü siliniyor. Açık madde: devam.js hook-errors.log\'u saklamalı.',
    '- Resume kabulü bu turda ölçülemedi (yukarıdaki not). Ölçülen: core ikinci oturumda yine daha çok araç (medyan 17\'ye 7) ve iki kat maliyet; transcriptlerde handoff\'u okuyup görevi görünce işi yeniden ele alıyor, native ise git diff\'ten devam edip erken duruyor. Kabul sorusu bölüm 7\'de.',
    '');
  return out.join('\n');
}

const BULGULAR = [
  '## 5. Bulgular',
  '',
  '- Sıradan tur: kancalar bağlama 0 bayt yazdı (200 turda kanca baytı 0). core yine de tur başına ~207 token (p50) / 427 (p95) fazla okur; bu K0 kuralının CLAUDE.md\'de durmasıdır (oturum başı ilk tur farkı ~190 token ile aynı büyüklük). Tamamı cache okuması: tur başına 0,0001 $.',
  '- Görev 02-05: medyan $ farkı ±%3 ile gürültü içinde; 04 ve 05\'te core daha ucuz çıktı, o da gürültü. Görev 06: +%9,3, kabul dışı. Sebep: görev tam dört dosyaya dokunuyor, eşik dört; ipucu 5/5 koşuda tetiklendi, model beşinde de "atla" dedi, plan yazmadı. Bedel ipucunun kendisi değil (madde 3), modelin ipucuya verdiği cevap ve uzayan süre.',
  '- Uyarı bedeli tek başına: ~450 token, 0,0007 $, ek araç çağrısı yok.',
  '- Resume: handoff 5/5 yazıldı ama decisions/next_action "(fill)" kaldı (altı turda bağlam eşiği dolmaz) ve dosyada görevin kendisi yok. core ikinci oturumda önce handoff\'u okuyor, native doğrudan git diff\'e bakıyor; ikisi de görevi bilmediği için çoğu koşuda "çalışıyor" deyip duruyor. Kabul core 1/5, native 0/5; core ikinci oturumda %31 daha pahalı (daha çok araç). Tekrarlanan araç çağrısı iki kolda da medyan 0.',
  '- Ölçümden çıkan iki değişiklik bölüm 6\'da uygulanıp yeniden ölçüldü: handoff\'a oturumun ilk kullanıcı istemi, dosya eşiği 4→5.',
  '- Harcama: 18,36 $ ölçüm, ~1 $ ön kontrol ve deneme. Tekrar sayısı spec gereği 5 (bellekteki 3 tavanı kullanıcının 50 $ yetkisiyle aşıldı).',
  '',
].join('\n');


const OZELLIK_YORUM = [
  'Yorum:',
  '',
  '- u0-hepsi (0.15.0 olduğu gibi): iki görevde de kabul ✓ ama görev 06\'da 2,92 $ (taban medyanı 0,37 $, 8 kat; 13,9 dk, 7 alt ajan), görev 07\'de 2,98 $ (0.16.1 medyanı 0,74 $, 4 kat; native 0,65 $; 15 Agent çağrısı, opus ve haiku katmanları). Ret. Bölüm 1\'deki 3,4 kat bulgusu 0.16 koşullarında da tutuyor.',
  '- u1-cue (her istemde sayım satırı): 0,51 $, taban aralığının (0,26–0,38) üstünde ama 1,5 katın altında; pahalı, sinyal yok. `-p` koşusunda istem bir kez geldiği için satır bir kez girdi; çok turlu oturumdaki tur başı bedeli bu bench\'te ölçülemez, tek satır ~30 token.',
  '- u2-risk (package.json dahil geniş risk listesi): ipucu package.json\'da ateşlendi, model "atla" dedi, 0,43 $ (aralık üstü, +%18). Sinyal yok; ipucu davranışı değiştirmedi, yalnız bir tur ekledi.',
  '- u4-verify (Stop\'ta bir kez npm test): 0,55 $ (aralık üstü, +%51, 1,5 katın hemen üstünde, kural gereği ret). Kanca testi koştu, geçti, hiçbir şeyi engellemedi; bench görevlerinde iki kolun kabulü zaten 3/3 olduğu için kazanç ölçülebilir değil.',
  '- u3-guard (eşikte Write/Edit reddi): n=1\'de 0.16.1 tabanından ucuz çıktığı için kural gereği n=3\'e çıkarıldı. Görev 07 n=3: u3 0,64 / 0,71 / 0,88 $ (medyan 0,71, kabul 3/3), taban 0,52 / 0,74 / 1,00 $ (medyan 0,74, kabul 2/3; düşen koşu readme\'ye maxLength yazmadı). Medyan farkı −%4, u3\'ün üç koşusu da tabanın aralığı içinde. Kapı koşularda 2, 0, 3 kez reddetti; ama iki kolda da altı koşunun altısı docs/plan.md yazdı, yani beş dosya ipucu zaten plan yazdırıyor, kapı üstüne bir şey koymuyor. Sinyal yok.',
  '- Karar: beş üniteden hiçbiri 0.16\'ya girmiyor. Varyantlar `bench/varyant/` altında duruyor, yeniden ölçmek `bench/varyant.js` ile bir komut.',
].join('\n');

function ozellik() {
  const rows = O.jsonlOku(path.join(B, 'sonuc-ozellik.jsonl'));
  const taban06 = O.jsonlOku(path.join(B, 'sonuc-016c.jsonl')).filter((r) => r.arm === 'core' && r.taskId === '06-slugify-cli' && !r.dropped);
  const usd06 = taban06.map((r) => r.usd).filter((x) => x != null).sort((a, b) => a - b);
  const taban07r = rows.filter((r) => r.varyant === 'taban-0.16.1' && r.arm === 'core' && !r.dropped);
  const usd07 = taban07r.map((r) => r.usd).filter((x) => x != null).sort((a, b) => a - b);
  const taban07 = taban07r.length ? { usd: O.medyan(usd07), pass: taban07r.filter((r) => r.pass).length + '/' + taban07r.length } : null;
  const native07 = rows.find((r) => r.arm === 'native' && r.taskId === '07-slugify-uc-parca' && !r.dropped);
  const out = ['## 8. 0.15 parçaları tek tek geri takıldı, n=1', ''];
  out.push('Karar kuralı koşudan önce plana yazıldı (plan işi bitince trash klasörüne gitti, kural burada): ünite koşusu tabanın min–max aralığında kalırsa sinyal yok, eklenmez; aralık dışında ve kabul ✓ ise n=3 ile doğrulanır; kabul ✗ ya da 1,5 kat pahalıysa reddedilir. Görev 06 tabanı bölüm 7\'nin üç core koşusu; görev 07 tabanı bu turda koşulan 0.16.1 ve native. Varyantlar `bench/varyant/`, koşturucu `bench/varyant.js` + `BENCH_EKLENTI`. Kaynak: `bench/sonuc-ozellik.jsonl`.', '');
  out.push('Görev 06 tabanı (core 0.16.1, n=3): $ ' + usd06.map(f2).join(' / ') + ', kabul ' + taban06.filter((r) => r.pass).length + '/' + taban06.length + '.', '');
  const satirlar = [];
  for (const r of rows) {
    let ref = null;
    if (r.taskId === '06-slugify-cli') ref = { min: usd06[0], max: usd06[usd06.length - 1], med: O.medyan(usd06) };
    else if (taban07 && r.varyant !== 'taban-0.16.1' && r.arm === 'core') ref = { min: usd07[0], max: usd07[usd07.length - 1], med: taban07.usd };
    const fark = ref && r.usd != null ? (r.usd - ref.med) / ref.med * 100 : null;
    let karar = '-';
    if (r.dropped) karar = 'düştü: ' + r.dropReason;
    else if (ref) {
      if (!r.pass) karar = 'ret (kabul ✗)';
      else if (r.usd >= ref.min && r.usd <= ref.max) karar = 'sinyal yok';
      else if (r.usd > ref.max) karar = r.usd > ref.med * 1.5 ? 'ret (1,5 kat)' : 'pahalı, sinyal yok';
      else karar = 'aday (ucuz), n=3 ister';
    }
    satirlar.push([r.varyant || r.arm, r.taskId.slice(0, 2), r.arm, r.dropped ? '-' : r.pass ? '✓' : '✗', f2(r.usd), f2(r.wallMs / 60000), r.kanca ? r.kanca.cueHits : '-', r.kanca ? r.kanca.subagents : '-', fark == null ? '-' : fark.toFixed(1) + '%', karar]);
  }
  out.push(tablo(['ünite', 'görev', 'kol', 'kabul', '$', 'dk', 'ipucu', 'alt ajan', 'tabana göre', 'karar'], satirlar), '');
  if (native07) out.push('Görev 07 native: ' + f2(native07.usd) + ' $, kabul ' + (native07.pass ? '✓' : '✗') + '; core 0.16.1 (n=' + taban07r.length + '): $ ' + usd07.map(f2).join(' / ') + ', kabul ' + (taban07 ? taban07.pass : '-') + '. Görev 06 tabanına göre kolon 06 satırlarında bölüm 7 medyanı, 07 satırlarında bu turun 0.16.1 medyanı.', '');
  out.push('Toplam harcama: ' + f2(rows.reduce((a, r) => a + (r.usd || 0), 0)) + ' $ (' + rows.length + ' koşu).', '');
  out.push(OZELLIK_YORUM, '');
  return out.join('\n');
}

function main() {
  const parcalar = [
    '# Bench Raporu: Core 0.16.0 vs Native Claude Code',
    '',
    'Tarih: ' + new Date().toISOString().slice(0, 10) + '. Claude Code ' + (O.jsonlOku(path.join(B, 'sonuc-016.jsonl'))[0] || {}).ccVersion + ', model claude-sonnet-5, tarife `docs/tarife.json`. Spec: Core v2 yön promptu madde 8. Ölçüm betikleri: `bench/run.js`, `bench/taban.js`, `bench/uyari.js`, `bench/devam.js`; bu rapor `bench/rapor016.js` ile üretildi.',
    '',
    taban(), gorevler(), uyari(), devam(), BULGULAR, sonra(),
    sonra('c', 7, 'Üç açık madde sonrası: yeni dosya satırları, kanca günlüğü, devir kuralı', 'Bölüm 6\'nın üç açık maddesi uygulandı: count.js yeni dosyaların satırlarını sayar ama eşiğe yalnız izlenen dosyalardaki değişiklik girer (`edited`); devam.js koşu sonunda kanca durum dizinini ve hata günlüğünü saklar; handoff.md başına tek satır kural girdi ("önce task, sonra changed_files; ilk bitmemiş parçadan sür, diff\'in gösterdiğini yeniden yapma"). İki ölçüm üç tekrarla yeniden koşuldu.'),
    ozellik(),
  ];
  fs.writeFileSync(path.join(B, 'rapor.md'), parcalar.join('\n') + '\n');
  console.log('bench/rapor.md yazıldı');
}

if (require.main === module) main();
