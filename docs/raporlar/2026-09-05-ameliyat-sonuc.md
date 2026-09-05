# Ameliyat sonucu — kesim, katlama ve %5 tavanı

**Tarih:** 2026-09-05. **Yetki:** kullanıcı, "tüm yetki Fable'da, ne gerekiyorsa yap".
**Plan:** Fable, [danisma/019](../danisma/019-fable-ameliyat-plan-tam-yetki.md). **Kısıt:** native'e
göre toplam tüketim farkı ≤ %5, istisnai %10.

Eşikler koşudan önce yazıldı ve sonuç ne çıktıysa o yazıldı; ölçüm istenene kadar
tekrarlanmadı.

## Ne kesildi

Fable'ın listesi: hiçbiri bir ölçüme dayanmıyordu, hepsi bakım yüküydü.

| Parça | Ne yapıyordu | Nereye gitti |
|---|---|---|
| güncelleme kontrolü (`update.js`) | SessionEnd'de GitHub'a bakıyor, doctor denetimi ve banner satırı ekliyordu | `trash/`; kurulu sürümü okuyan 8 satır doctor'ın içine indi |
| OWED defteri (`handoff.js owe`) | bir sözü her prompt'a geri taşıyordu — sıradan turda bağlama yazan tek kanca yoluydu | kod, kapı kontrolü, prompt ipucu, skill bölümü, 17 sav |
| fan-in sinyali | sahipli dosyayı ≥5 dosya içe alıyorsa modeli yükseltiyordu | `map.js fanIn`, `tiers.json`, README basamağı, savlar |
| `raise:` mührü | sözleşmedeki plancı yükseltmesini ilk yazımda mühürlüyordu | `schema.raiseOf`, `watch.js` mühür yazımı, savlar |
| round-4 danışman zorunluluğu | üçüncü yeniden açılışta Fable'ı şart koşuyordu | `secondOpinion`, `roleRecord`, `ADVISOR_FROM`, savlar |

Kesilmeyenler ve neden: `verify` kapısı — gözlemsel kanıtı yok ama bedeli sıfır tur
(`complete` içinde koşuyor). `manset.js` — Fable kendi kararını geri aldı: en pahalı kusuru
(22 sözleşmede manşet kayması) sıfır model bedeliyle yakalayan tek deterministik parça.
Denetçi — kanıtı olan tek parça (72 ek turun 33'ü), ama turu 95-100k token; %5 tavanı altında
zorunlu olamaz, yalnız `risk: high` ve istek üzerine. Tanımsız kaldığı için dokunulmayanlar:
"banner ayrıntısı", "advice.js dışı danışma kanalı".

Kesim sırasında düzelen bir gerileme: `normal` profilde danışman hücresi `off` olunca
`overDispatch` boş modelle karşılaştırıp "advisor resolves to ." deyip **engelliyordu**; muafiyet
kalkınca altından çıktı. `off` "tavan yok" demektir, "danışman yok" değil.

Toplam: **7.781 → 7.480 satır**, `test/all.js` 2.677 → 2.640 sav (kesilen davranışların
savları düştü, yeni davranışların savları eklendi), dört suite yeşil.

## Ne katlandı

Koordinatör bir turu sözleşme dosyasını yazmaya, bir-iki turu kapatmaya harcıyordu; ajan
bir turu bağlanmaya. Hepsi zaten olan çağrılara bindi:

- **Sözleşme prompt'un içinde gidiyor** (`<<<SOZLESME>>>` … `<<</SOZLESME>>>`). `PreToolUse`
  dosyayı ajan var olmadan yazıyor; blok bozuksa ya da `id:` yoldaki kimlikle çelişiyorsa
  dispatch'i reddediyor; var olan dosyanın üstüne asla yazmıyor. (`hooks/embed.js`)
- **Kapanış `SubagentStop`'ta koşuyor.** Bağlı bir builder durunca `submit` + `complete` ayrık
  bir süreçte koşuyor, hüküm `live/_kapanis/<ID>.json`'a yazılıyor. Kırmızı verify ya da
  reddedilen mühür sözleşmeyi `submitted` bırakıyor; hiçbir şey tekrar denemiyor.
  (`hooks/autoclose.js`) Tetik ajan tipinin adına değil sözleşmenin `role:` alanına bakıyor.
- Builder rolü sözleşmeye hiç dokunmuyor; `SKILL.md` şablonu ve kapanış bölümü buna göre.

## Ölçüm — katlanmış akış, 6 koşu

Aynı dondurulmuş `click` görevi, aynı metin, `sonnet/low`, pinlenmiş taze klonlar, kabul
betiği bağımsız. Native tabanı önceki üç tekrar (aynı klon ve sanal ortam düzeni). Core'un ilk
üçü (KAT3-5) ile son üçü (KAT6-8) ajanın gördüğü prompt bakımından özdeş; aralarındaki tek
fark ajan durduktan sonra koşan risk kuralı. O yüzden ajan tarafı altı koşu birlikte okunur,
T0 ve mühür tarafı ikiye ayrılır.

| ajan | native (n=3) | Core, KAT3-5 | Core, KAT6-8 | Core, 6 koşu |
|---|---|---|---|---|
| tur | 11 / 9 / 12 | 10 / 10 / 15 | 16 / 17 / 9 | — |
| tur medyan · ortalama | **11** · 10,7 | 10 · 11,7 | 16 · 14,0 | **12,5** · 12,8 |
| $ | 0,1079 · 0,0940 · 0,1151 | 0,1068 · 0,1106 · 0,1403 | 0,1599 · 0,1709 · 0,0815 | — |
| $ medyan · ortalama | **0,1079** · 0,1057 | 0,1106 · 0,1192 | 0,1599 · 0,1374 | **0,1255** · 0,1283 |
| $ farkı, medyan · ortalama | — | +%2,5 · +%12,8 | +%48 · +%30 | **+%16 · +%21** |
| kabul testi | 3/3 | 3/3 | 3/3 | 6/6 |

| T0 ve mühür | native | Core, KAT3-5 (eski kural) | Core, KAT6-8 (düzeltilmiş kural) |
|---|---|---|---|
| T0 turu / koşu | 2 | 1,3 | **1** |
| kanca `submit` | — | 3/3 | 3/3 |
| kanca `complete` | — | 0/3 — "owns 17 files (limit 8)" | **3/3**, `done/` altında `status: done` |
| koordinatör dosya yazdı / kapattı | — | hayır / hayır | hayır / hayır |

**Eşik (önceden yazıldı):** T0 turu Core ≤ native **ve** ajan $ farkı ≤ +%5 (istisnai %10).
Birincisi tuttu. **İkincisi tutmadı:** altı koşuda medyan +%16, ortalama +%21.

İlk raporun "+%2,5" dediği sayı üç koşunun medyanıydı ve o üç koşuda mühür kapanmamıştı;
o rakam artık tek başına anılmıyor.

### Bu fark ne anlatıyor, ne anlatmıyor

Core'un altı koşusu 0,08-0,17 $ aralığına yayılıyor; native'in üçü 0,094-0,115. Dağılım
gürültü biçiminde değil, iki kümeli: Core 9/10/10 ve 15/16/17 tur, native 9-12 sıkı. Fable'ın
uyarısıyla dokuz transkriptin araç çağrısı sırası yan yana kondu
(`bench/katlama-otopsi.md`); bulgular aşağıda.

Bu yayılımla n=3'e karşı n=6, %5'lik bir farkı **çözemez**. %5'i ±%5 güvenle görmek için kol
başına yaklaşık 20 koşu gerekir: 40 koşu × ~0,12 $ ajan ≈ 5 $, artı koşu başına bir T0 turu
(bu oturumda 0,5-0,6 $/tur) ≈ 20 $; toplam **~25 $ ve ~1,5 saat**. Yapılmadı; karar
kullanıcının.

### Otopsi — fazla turlar nereye gitti

| | Edit öncesi çağrı | Edit sonrası | `kabul.sh`'ı kendisi koştu | relay/sözleşmeye baktı |
|---|---|---|---|---|
| native 1/2/3 | 5 / 5 / 9 | 4 / 3 / 3 | 0 / 0 / 0 | hayır |
| KAT3/4/5 | 5 / 5 / 10 | 3 / 3 / 4 | 1 / 1 / 1 | hayır |
| KAT6/7/8 | 11 / 8 / 4 | 3 / 8 / 3 | 1 / 0 / 1 | hayır |

- **Sözleşmeye dolaşma yok.** Altı koşunun hiçbirinde `.claude/relay`, `contracts` ya da
  `SOZLESME` geçen bir araç çağrısı, hiçbirinde kapı reddi yok. "Dokunma" cümlesi ajanı
  meraklandırmamış.
- **Tespit edilen tek Core kaynaklı bedel:** sözleşme bloğundaki `verify:` satırı. Altı
  koşunun beşinde ajan, kendi `pytest`'inin üstüne bir de kabul betiğini koşturmuş — her biri
  tam takım, bir tur (koşu başına ~%7-10). Native prompt'unda betik yok, kimse koşturmamış.
  Kanca `complete` aynı betiği bir daha koşturuyor. Çift iş, ama bilinçli: ajan kendi
  koşturmazsa kırmızı `complete` sözleşmeyi `submitted` bırakır ve o bir T0 turu, yani
  ajanın bu turunun 40-80 katı. Bu tur Core'un ajan tarafındaki **gerçek ve kabul edilen**
  fiyatı: koşu başına ~%7-10, tek başına %5 tavanının üstünde.
- **Geri kalan fazlalık Edit öncesinde:** KAT5 10, KAT6 11 çağrı (native 5/5/9). Aynı
  `grep`/`sed` keşfi, daha uzun. KAT7'de Edit sonrası 8: üç kez reprodüksiyon, düzeltme
  yeniden. Bu kısım prompt'ta olmayan bir şeyden geliyor, kolların paylaştığı oynaklık.

Yani "+%16"nın belgelenebilir kısmı bir tur (~%8); kalanı iki kolun da yaşadığı yol seçimi.
Ajan tarafı tek başına %5'in altına inmiyor ve inmeyecek — inmesi için verify'ı ajandan almak
gerekir, o da T0'a maliyet taşır. Karar toplam üzerinden verilir, aşağıda.

### Koşu başına toplam — kullanıcının sorduğu sayı

Kullanıcının kısıtı toplam tüketim; yukarıdaki tablolar ajanı ve T0'ı ayrı sayıyor. Aynı
oturumda T0 turu 0,52-0,95 $ (bağlam 350-440k token; native koşuları daha küçük bağlamda,
turu daha ucuzdu — bu yüzden T0 sadece tur sayısıyla karşılaştırılır).

| koşu başına | native | Core, mühürlü |
|---|---|---|
| T0 | 2 tur | 1 tur |
| ajan | ~0,106 $ | ~0,128 $ |
| toplam, bugünkü tur fiyatıyla | 2 × 0,5-0,95 + 0,11 ≈ **1,1-2,0 $** | 1 × 0,5-0,95 + 0,13 ≈ **0,65-1,1 $** |

Ajan +%21 pahalı, T0 bir tur ucuz; T0 turu ajanın tamamından 4-8 kat büyük olduğu için
toplamda Core native'in **altında**. "Hava cıva" sorusunun cevabı bu satır — ama şerhi de var:
bu, yalnız koordinatör bağlamı büyükken ve sözleşme başına tek builder'la geçerli.

### Bir sonraki ölçüm nasıl ucuzlar

40 koşu için ~25 $ tahmininin 20 

## Risk kuralı — yanlış vekil, tek sabit

İlk üç koşuda `complete` "owns 17 files (limit 8) → high risk → denetçi şart" diyerek durdu.
Bu bir yapısal sınır değildi: `risk.js` içinde tek bir `FILE_LIMIT = 8` sabiti, **sahiplenilen**
dosya sayısını **değişen** dosya sayısının vekili sayıyordu. Yeri bilinmeyen bir hata için açılan
sözleşme geniş sahiplenir ama bir-iki dosya değiştirir; kural bunu ayırt etmiyordu.

Sonucu yalnız denetçi zorunluluğu değil: `risk: high` `contract.js` içinde builder'ı da opus'a
yükseltiyor, yani aynı kural görevi 5 kat pahalı koltuğa da itiyordu.

Kural değişti: sayım artık diff'teki dosya sayısı üstünde; `owns` 9 dosya iken 1 dosya
değiştiren sözleşme düşük risk, 9 dosya değiştiren yüksek. Savı ikiye ayrıldı (`test/all.js`,
W1). Bu değişiklik ölçüme uydurma değil, kuralın ölçtüğü şeyin düzeltilmesi; ama şunu da
söylemek gerek: eski kuralın bu depodaki 33 yakalamasında "owns > 8 ama diff ≤ 8" olan kaç
tanesi vardı, elimizdeki kayıtlardan çıkarılamıyor — geçmiş sözleşmelerin diff'i saklanmamış.

KAT6-8 düzeltilmiş kuralla koştu: üçünde de kanca mühürledi.

## %5 tavanının bugünkü sınırı

Fable'ın çizdiği sınır: tek builder, düşük risk, kanca mührü, danışman yok — mekanizma bedeli
sıfır tur. Dışında kalanlar ve her birinin bedeli ölçülmedi: denetçi turu (95-100k token),
Fable danışması, üçüncü yeniden açılış, aynı anda birden çok sözleşme.

## Lekeli koşular ve neden

- **M1:** eski kancalarla koştu. Depo `core/` düzenlemeleri kurulu eklenti önbelleğinde canlı
  değildi; duman testleri depo dosyasını doğrudan çağırdığı için geçmişti. Önbellek depoyla
  eşitlendi; kalıcı çözüm günlükte.
- **M2:** kimlik çakışması — sabahki scout sözleşmesi de `M2` idi, `submit` "zaten `done/`
  altında" dedi; ayrıca `SubagentStop` bildirimi tam benim izleme eklerken önbelleği kırdığım
  pencereye denk geldi. `KAT2` olarak yeniden adlandırılıp kapatıldı.
- **KAT4 (ilk):** klon `m-1` yeniden kullanıldı, M1'in düzeltmesi içindeydi; öldürüldü, taze
  klonda tekrarlandı.

## Yol boyunca bulunan ve düzeltilen

- `maliyet.js` harness'in `<synthetic>` kayıtlarında çöküyordu; artık atlıyor, savı var.
- Kancalar `${CLAUDE_PLUGIN_ROOT}` altındaki kopyayı koşturuyor; geliştirme deposu canlıya
  çıkmıyor. Doctor'a "önbellek depoyla aynı mı" denetimi önerildi (günlük).
- Bir builder ajanı, `owns` içindeki `guard.js`'te OWED'i değil **bağsız-ajan korumasını** silip
  savlarını da silince takım yeşil kaldı. `owns` nereye yazıldığını sınırlıyor, ne yapıldığını
  değil. Geri alındı, günlükte.

## Kayıtlar

Ham veri: `bench/katlama-kol-maliyet.jsonl`, `bench/katlama-anlik.jsonl`. Kanca hükümleri:
`.claude/relay/live/_kapanis/KAT{3..8}.json`. Danışma: `docs/danisma/018`, `019`, `020`, `021`.
ı T0 turuydu; o tasarım seçimi. Kollar tek T0 turunda
beşer dispatch edilir, native ve Core dönüşümlü koşarsa (bu turda değildi: native tabanı önceki
oturumdan) 40 koşu **~6-8 $**. Beklenen sonuç: ajan +%8 civarı, T0 -1 tur; 40 koşu bunu ±%5 ile görür.

## Risk kuralı — yanlış vekil, tek sabit

İlk üç koşuda `complete` "owns 17 files (limit 8) → high risk → denetçi şart" diyerek durdu.
Bu bir yapısal sınır değildi: `risk.js` içinde tek bir `FILE_LIMIT = 8` sabiti, **sahiplenilen**
dosya sayısını **değişen** dosya sayısının vekili sayıyordu. Yeri bilinmeyen bir hata için açılan
sözleşme geniş sahiplenir ama bir-iki dosya değiştirir; kural bunu ayırt etmiyordu.

Sonucu yalnız denetçi zorunluluğu değil: `risk: high` `contract.js` içinde builder'ı da opus'a
yükseltiyor, yani aynı kural görevi 5 kat pahalı koltuğa da itiyordu.

Kural değişti: sayım artık diff'teki dosya sayısı üstünde; `owns` 9 dosya iken 1 dosya
değiştiren sözleşme düşük risk, 9 dosya değiştiren yüksek. Savı ikiye ayrıldı (`test/all.js`,
W1). Bu değişiklik ölçüme uydurma değil, kuralın ölçtüğü şeyin düzeltilmesi; ama şunu da
söylemek gerek: eski kuralın bu depodaki 33 yakalamasında "owns > 8 ama diff ≤ 8" olan kaç
tanesi vardı, elimizdeki kayıtlardan çıkarılamıyor — geçmiş sözleşmelerin diff'i saklanmamış.

KAT6-8 düzeltilmiş kuralla koştu: üçünde de kanca mühürledi.

## %5 tavanının bugünkü sınırı

Fable'ın çizdiği sınır: tek builder, düşük risk, kanca mührü, danışman yok — mekanizma bedeli
sıfır tur. Dışında kalanlar ve her birinin bedeli ölçülmedi: denetçi turu (95-100k token),
Fable danışması, üçüncü yeniden açılış, aynı anda birden çok sözleşme.

## Lekeli koşular ve neden

- **M1:** eski kancalarla koştu. Depo `core/` düzenlemeleri kurulu eklenti önbelleğinde canlı
  değildi; duman testleri depo dosyasını doğrudan çağırdığı için geçmişti. Önbellek depoyla
  eşitlendi; kalıcı çözüm günlükte.
- **M2:** kimlik çakışması — sabahki scout sözleşmesi de `M2` idi, `submit` "zaten `done/`
  altında" dedi; ayrıca `SubagentStop` bildirimi tam benim izleme eklerken önbelleği kırdığım
  pencereye denk geldi. `KAT2` olarak yeniden adlandırılıp kapatıldı.
- **KAT4 (ilk):** klon `m-1` yeniden kullanıldı, M1'in düzeltmesi içindeydi; öldürüldü, taze
  klonda tekrarlandı.

## Yol boyunca bulunan ve düzeltilen

- `maliyet.js` harness'in `<synthetic>` kayıtlarında çöküyordu; artık atlıyor, savı var.
- Kancalar `${CLAUDE_PLUGIN_ROOT}` altındaki kopyayı koşturuyor; geliştirme deposu canlıya
  çıkmıyor. Doctor'a "önbellek depoyla aynı mı" denetimi önerildi (günlük).
- Bir builder ajanı, `owns` içindeki `guard.js`'te OWED'i değil **bağsız-ajan korumasını** silip
  savlarını da silince takım yeşil kaldı. `owns` nereye yazıldığını sınırlıyor, ne yapıldığını
  değil. Geri alındı, günlükte.

## Kayıtlar

Ham veri: `bench/katlama-kol-maliyet.jsonl`, `bench/katlama-anlik.jsonl`. Kanca hükümleri:
`.claude/relay/live/_kapanis/KAT{3..8}.json`. Danışma: `docs/danisma/018`, `019`, `020`, `021`.
