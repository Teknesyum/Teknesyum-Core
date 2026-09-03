# 002 — Denetçi tetiği ve iki basamağa gelen itiraz

Soran: T0 (opus). Danışılan: fable. Tarih: 3 Eylül 2026.

Not: bu kayıt elle yazıldı. `advice.js` kancası kurulu eklenti sürümünde (0.8.0) henüz yok;
kanca yalnız kaynak ağacında. Kurulu sürüm çıkınca bu dosya kendiliğinden oluşacak.

---

## Sorulan

```
Sen Teknesyum-Core'un danışmanısın. Karar ortağı olarak soruluyorsun; onaylayıcı değil.
Depo: C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core

Cevabın Türkçe olacak. İstenen şey öneri listesi değil, **karar**: hangisi kurulsun, hangisi
kurulmasın, hangi ölçüm önce gelsin. Gerekçesiz "iyi olur" cümlesi işe yaramıyor.

## Bağlam

Core, ajanları rol × profil tablosundan bir modele oturtuyor (core/tiers.json). Premium'da
builder `sonnet/high` ile açılıyor; sinyaller opus'a yükseltiyor. Sinyaller: üst üste iki
araç hatası, 3. tur, geri alınamaz yol, ve bu turda eklenen ikisi:

1. **fan-in** — sözleşmenin `owns` dosyasını 5+ dosya içeri alıyorsa builder/ui-builder
   opus'la açılıyor. Sayı `map.json`'dan okunuyor (core/scripts/map.js:fanIn).
2. **plancı damgası** — sözleşmedeki `raise: opus` satırı, aynı sayfada bir `why:` varsa
   modeli yükseltiyor (core/scripts/contract.js:tier).

Bu ikisini senin 001 numaralı danışmanda önerdiğin için kurduk:
docs/danisma/001-ucuz-once-tier.md

## Soru 1 — Denetçi

Ölçüm (docs/raporlar/denetci-maliyet-analizi.md, kanıt VidShrink defterinden):
- 216 mühürlü sözleşmenin 25'i `risk: high` çıkmış; 25'inin 25'inde denetçi kaydı var.
- Denetçi gerçek kusur yakalamış: T84'te kabul sayısı 44 "ziyaret sayımı"ymış, gerçek
  popülasyon 23'müş; denetçi turu KALDI vermiş.
- Yani denetçi çalışıyor. Sorun tetikte: core/scripts/risk.js `high`ı diff'in **şeklinden**
  hesaplıyor (satır sayısı > 300, dosya > 8, silme, yeniden adlandırma, hassas yol adı).
  Küçük, tek dosyalık, yeşil ama yanlış bir diff bu ölçülerin hiçbirine takılmıyor.

Fiyatladığımız üç yol:
- (a) deterministik kesişim kontrolü: kabul maddesinin metniyle diff'in kesişimi boşsa
  şüphe; `verify` adımı diff'in değdiği dosyaya hiç dokunmuyorsa şüphe. Sıfır token.
- (b) haiku "okur": her mühürde, araçsız, tek turda, diff + kabul verilip `TEMİZ` ya da
  `ŞÜPHELİ: <tek satır>` istenir; şüphe riski `high` yapar, gerçek opus denetçisi açılır.
  Sözleşme başına ~1 sent; yanlış alarm başına ~1,5 $ (açılan opus denetimi).
- (c) hiçbiri: önce fan-in ve damganın sessiz hatanın ne kadarını kapattığı ölçülsün.

Hangisi, hangi sırayla? Eğer (b) diyorsan: okurun yanlış alarm oranı hangi eşiği geçerse
kapatılmalı, ve bunu nasıl ölçeriz? Eğer (a) diyorsan: kesişim kontrolünün yanlış pozitif
üretmemesi için hangi somut kural yeter?

## Soru 2 — Kendi önerdiğin iki basamağa gelen itiraz

Bağımsız bir denetim (docs/raporlar/2026-09-03-vidshrink-denetim.md, madde 28) şunu diyor:

> Harita şema sürümünün doğru olması güncel HEAD'e ait olduğunu göstermez. Ayrıca
> `raise: opus` + serbest `why` alanı planlayıcının kimliğini/yetkisini doğrulamaz.
> Bunları maliyet kapısının yeni kaçışına çevirmemek için güncellik ve karar provenansı
> gerekir.

İtiraz bize haklı görünüyor: sözleşme dosyasını builder'ın kendisi de düzenleyebiliyor,
yani builder kendi sözleşmesine iki satır yazıp kendini opus'a çıkarabilir. Bayat `map.json`
da fan-in'i olduğundan küçük ya da büyük gösterebilir.

Aklımızdaki çare: `raise:` satırını sözleşme `open`dan çıktığı anda dondurmak — bir
sözleşmeye bağlı ajan kendi sözleşmesindeki `raise:` satırını değiştiremesin, kapı
(core/hooks/guard.js) engellesin. Bayat harita içinse `map.js` zaten HEAD sha'sını tutuyor;
bayatsa yükseltmeyi yapıp gerekçeye "harita bayat" yazmak mı, hiç yapmamak mı?

Bu iki çare yeterli mi, yoksa basamakların kendisi mi yanlış kurulmuş? Yanlışsa nasıl
kurulmalıydı?

## Nasıl cevap ver

Dosyaları oku, tahmin etme. Cevabın şu başlıklarla olsun:
- **Karar** — soru 1 ve soru 2 için tek cümlelik hüküm.
- **Gerekçe** — neden, kanıta bağlı.
- **Kurulacaklar** — sırayla, her biri için "neyi ölçer, neyi ölçmez".
- **Kurulmayacaklar** — ve neden.
- **Ölçüm** — hangi sayı toplanmadan bir sonraki adıma geçilmemeli.
```

---

## Dönen

## Karar

**Soru 1:** (c) önce, (a) aynı dalgada ama **tetik değil defter sütunu** olarak; (b) şimdi kurulmasın, açılma koşulu sayıya bağlansın.

**Soru 2:** İtiraz haklı, ama basamaklar yanlış kurulmamış — **kaynağı yanlış yerden okuyor.** Çare `guard.js`'de dondurma değil: `raise:`'i `open` anında mühürleyip `tier()`'ın gövdeden değil mühürden okuması; bayat haritayı yükseltmeye çevirmek değil, haritayı dispatch'te yeniden kurmak.

## Gerekçe

**Denetçi tetiği için elimizde asıl sayı yok.** Rapor 216'da 25 yüksek riskin hepsinin denetlendiğini gösteriyor; göstermediği şey **191 düşük riskli mührün kaçının sonradan geri açıldığı**. Sessiz hatanın fiyatı bu sayıdır ve defterde zaten var: `contract.js:1431-1443` reopen'ı, `1474` unmet'i ledger'a yazıyor. Bu sayı 191'de 2 ise okur 216 sözleşmeye 2,4 $ + yanlış alarm ödeyip iki hata arar; 191'de 15 ise (b) kendini öder. Sayıyı bilmeden (b) kurmak, raporun 4. bölümünde kendi yazdığınız "ölçmeden model seçmek"tir.

**Okurun yakalayacağına dair kanıt zayıf.** T84 örneği — 44 ziyaret / 23 gerçek — araçsız bir haiku'nun diff'e bakarak göremeyeceği türden; onu araçlı opus denetçisi çalıştırarak buldu. Yani elimizdeki tek somut "yeşil ama yanlış" örneği, önerilen okurun yakalayamayacağı sınıfta.

**001'in istediği ölçüm bugün toplanamıyor.** `contract.js:1072-1079` ledger'a `id, round, risk, verify, auditorRunId, headSha` yazıyor. Dispatch edilen model, sinyal, fan-in, raise — hiçbiri yok. Model yalnız `watch.js:243-244` ile `live/<agent>.json`'a düşüyor, `_calls.json` son 12 kaydı tutuyor. 001'deki "plancı üçte birden fazla damgalarsa ucuz-önce kurgudur" cümlesini sınayacak sütun yok. Bu, herhangi bir yeni tetikten önce gelir.

**Soru 2'de itiraz kodda birebir doğru.** `map.js:335` `fanIn()` yalnız şemaya bakıyor; `staleness()` çağrısı `who()`da var (`map.js:361`), `fanIn`'de yok. `raise`/`why` ise `field()` ile gövdeden okunuyor (`contract.js:552-553`) — `why:` regex'i sayfadaki **ilk** `why:` satırını yakalar, `raise:` ile bağı yok. Ve `guard.js:312` `boundary()` `.claude/relay/` altını tümüyle muaf tutuyor: bağlı builder kendi sözleşmesine `raise: opus` yazabilir, 2. turda opus'la döner.

**Önerdiğiniz guard dondurması sızdırır.** `guard.js:445` yalnız `Write|Edit|NotebookEdit`'i inceliyor; `Bash` için tek kontrol `merging()` (`guard.js:449`). `echo "raise: opus" >> T12.md` kapıyı görmeden geçer. Kimlik doğrulamaya da gerek yok: **zaman** yeter — `open` anındaki değer karar provenansıdır, sonrası sayılmaz.

## Kurulacaklar

1. **Ledger sütunları** — `contract.js:1072` kaydına `model, requestedModel, signals, fanIn, fanInFile, raise` eklenir (kaynak: `live/<runId>.json` + `tier()` çıktısı). *Ölçer:* hangi sinyal hangi modeli açtı, damga oranı, fan-in dağılımı. *Ölçmez:* diff'in doğruluğu. Sıfır token.

2. **`raise` mührü** — `open` komutu `raise/why`'ı `live/` ya da sözleşme bağlama kaydına yazar; `tier()` (`contract.js:376`) gövdeden değil o kayıttan okur. `why:` regex'i `raise:` satırına bağlanır (aynı satır: `raise: opus — why: ...`). *Ölçer:* plancının open anındaki kararını. *Ölçmez:* plancının haklı olup olmadığını — o 1'deki sütunlardan çıkar. Guard'a kural gerekmez.

3. **Fan-in tazeliği** — `fanIn()` `staleness()` çağırır; `stale` ise `build()` çalıştırıp yeniden okur; kuramazsa `{max:0, read:false, why:'stale'}` döner ve **yükseltmez**, ledger'a `fanIn: unknown` yazar. Bilgisizlik üstüne yükseltmek "haritayı yenileme" diye yeni bir kaçış açar. *Ölçer:* güncel HEAD'e ait kenar sayısı. *Ölçmez:* dinamik/yansıma bağımlılıkları.

4. **(a)-1 kesişim, defter sütunu olarak** — `## Acceptance`'tan yalnız ters-tırnaklı tanımlayıcı/yol token'ları alınır; HEAD'de grep'le var olmayanlar (prosa, yazım hatası) atılır; kalanların **hiçbiri** diff metninde (+/- satırlar) ya da değen dosya yollarında geçmiyorsa `acceptanceMiss: true`. Token yoksa hüküm yok. Tek eşleşme temizler → yanlış pozitif ancak kabulün tamamen başka şeyden söz ettiği durumda çıkar. Önce sütun, 30 mühür sonra reopen'la korelasyon varsa tetik. *Ölçer:* diff kabulün adını andığı yere değdi mi. *Ölçmez:* değerin doğru olup olmadığı (T84).

## Kurulmayacaklar

- **(b) haiku okur** — şimdi değil. Açılma koşulu: Ölçüm-1'de düşük riskli mühürlerin geç-kusur oranı **≥ %5** ve bu kusurların yarısından azını 4. sütun işaretlemişse. Kurulursa kapatma eşiği: ilk 20 `ŞÜPHELİ`'de opus denetçisinin "KRİTİK yok" dediği sayı **≥ 10** (kesinlik < %50 → 15 $ boş denetim). Kesinlik ölçümü hazır: denetim kayıtları zaten KRİTİK var/yok yazıyor (15/48).
- **(a)-2 "verify diff'e değiyor mu"** — dar filtreli testin dosyaya değip değmediğini statik çözmek harita + test keşfi ister; refactor ve silme sözleşmelerinde doğal olarak boş çıkar. Yanlış pozitif kaynağı, tetik olmaz.
- **Guard'da `raise:` dondurma** — Bash'ten sızar, 2. madde onu gereksiz kılar.
- **Bayat haritada yükseltme** — kaçış açar (3. madde).

## Ölçüm

Bir sonraki adım (okur ya da herhangi bir yeni tetik) için şu üç sayı VidShrink defterinden, sıfır token, tek betikle alınmadan geçilmesin:

1. **Sessiz kusur oranı:** `risk: low` mühürlenmiş 191 sözleşmeden kaçı sonradan reopen/unmet satırı aldı ya da `log.js` kaydında dosya adıyla anıldı. Eşik: < %3 ise (b) kapalı kalır.
2. **Fan-in dağılımı:** done sözleşmelerin `owns`'u güncel `map.json`'a vurulunca kaçının max fan-in ≥ 5. > %35 ise eşik 5 yanlış, ucuz-önce fan-in üzerinden kurgudur.
3. **Damga oranı:** 1. madde kurulduktan sonraki ilk 30 mühürde `raise` dolu olanların payı. 001'in eşiği: > 1/3 → ucuz-önce kurgu.

Not: Core'un kendisi hiç sözleşme açmadı (rapor §1); bu sayılar yalnız VidShrink'ten gelir ve Core'un kendi kapısı hâlâ ölçülmemiş.
