# Bench: harness mi, koltuk mu — aynı iş, eşlenmiş kollar

**Durum:** pilot uygulanıyor (2026-09-05). **Kapsam kararı:** pilot, kullanıcı, 2026-09-05.
**Native kolu kararı:** eşle, kullanıcı, 2026-09-05. **Danışman:** Fable, iki tur —
[009-fable-bench-plan-gozden-gecirme.md](danisma/009-fable-bench-plan-g-zden-ge-irme.md).

Ölçtüğümüz şey: Teknesyum Core kurulu bir Claude Code oturumu ile kurulu olmayanı, aynı
görev, aynı kabul testi ve **aynı koltuk** altında karşılaştırmak.

---

## 0. Durma kuralı

**Core, eşlendiği native kolundan %40 fazla harcıyorsa bench durur.** Sonraki görevlere
geçilmez; nerede sızdırdığı bulunur.

Eşik **medyan $** üstünedir, token üstüne değil. Bölüm 1 token karşılaştırmasını yanıltıcı
ilan ediyor; eşiği token'a bağlamak o hükümle çelişirdi. Ham token sayısında `cache okuma`
kalemi baskın çıkıyor ve taban ücretin küçük bir katıyla faturalanıyor — uzun bağlamı
tekrar okuyan taraf, ödediğinden çok daha pahalı görünür.

Pilotta eşik bir **karar kuralı değil, bayraktır.** Görev×kol başına 3 tekrar var; LLM
koşularında tekrar-içi sapma zaten %30-50, yani tek bir %40 fark gürültüyle de tetiklenir.

Kural iki basamaklı ve her basamakta **medyan** kullanılır:

1. **Bir görev tutar** — o görevde Core kolunun medyan $'ı, eşlendiği native kolunun aynı
   görevdeki medyan $'ını %40'tan fazla aşıyorsa. Medyan tek bir aykırı koşuya karşı zaten
   dayanıklı olduğu için ayrıca "tekrarların şu kadarında" koşulu aranmaz; koşu başına
   eşleştirme **yapılmaz** — Core'un 2. tekrarı ile native'in 2. tekrarı bağımsız
   koşulardır, indeksle eşleştirmek olmayan bir eşleşme uydurur.
2. **Bayrak kalkar** — çift, **en az iki görevde** tutuyorsa. Pilotta bu iki görevin ikisi
   demektir; tamda beş görevin en az ikisi. Tek görevde tutması hiçbir kapsamda yetmez.

Medyanın hesaplanamadığı hücre (tek koşu, ya da eşlenmiş native koşusu hiç yok) tutmaz
sayılır ve raporda ayrıca belirtilir.

---

## 1. Ölçülen dört rakam

| Rakam | Nasıl | Neden bu |
|---|---|---|
| **pass@1** | Görevle gelen kabul testi, elle müdahale olmadan geçti mi | Ana rakam |
| **medyan $** | transcript'ten model × token × fiyat, dört kalem ayrı | Profiller farklı model kullanıyor; token karşılaştırması yanıltır |
| **medyan dk** | duvar saati | |
| **düşen koşu oranı** | tavana çarpan ya da kendi kendine duran koşu | Otonom koşuda "insan müdahalesi" 0'a sabitlenir, yerine bu geçer |

`verify` geçme oranı **karşılaştırma metriği değildir** — native'de verify yoktur. Yalnız
Core profilleri arasında raporlanır.

Maliyet dört kalemi ayrı ayrı fiyatlar: `input_tokens`, `output_tokens`,
`cache_creation_input_tokens`, `cache_read_input_tokens`. Tarife `COST-MODEL.md`'den gelir.
Toplama ana oturumun transcript'i **ve** `<oturum>/subagents/agent-*.jsonl` altındaki her alt
ajan girer; premium kolunun paralel ajanları sayılmazsa Core kolu olduğundan ucuz görünür.
Headless koşunun kendi maliyet alanı çapraz kontrol olarak kaydedilir; tutmazsa transcript
toplamı esas alınır.

---

## 2. Kollar ve kapsam

Native tek kol değil. Her Core profili, **aynı modelle koşan** bir native eşiyle
karşılaştırılır; yoksa ölçülen şey harness farkı değil koltuk farkı olur.

| Çift | Core kolu | Native eşi | Koltuk |
|---|---|---|---|
| 1 | `eco` | `native-eco` | `sonnet/low` |
| 2 | `normal` | `native-normal` | `sonnet/medium` |
| 3 | `premium` | `native-premium` | `sonnet/high` |

Koltuk, `core/tiers.json`'daki builder hücresidir. Core kolunda t0 ayrıca kendi koltuğunu
kullanır (eco `sonnet`, normal ve premium `opus`); native kolunda t0 diye bir şey yok, tek
ajan builder koltuğuyla koşar. Bu asimetri Core'un mekanizmasının parçasıdır ve maliyete
dahildir — gizlenmez, raporda ayrı satırda gösterilir.

**Pilot:** 2 görev × 3 tekrar × 6 kol = **36 koşu**.
**Tam:** 5 görev × 3 tekrar × 6 kol = **90 koşu**.

Görev türleri, tamda üçü de temsil edilir:

1. **Yeşil alan** — sıfırdan küçük bir araç, testleri görevle birlikte verilir.
2. **Yabancı depoda hata düzeltme** — pinlenmiş commit + reprodüksiyon testi.
3. **Çok dosyalı refactor** — davranış değişmeyecek, mevcut takım geçmeye devam edecek.

Pilot ikisini kapsar, refactor türü dışarıda kalır. **Pilot sonucu beşe genellenmez** —
yalnız durma eşiğini kontrol eder.

---

## 3. Aday depolar

Core geliştirilirken **kullanılmamış** olmaları şart. VidShrink bu yüzden listede yok:
Core onunla birlikte geliştirildi, mekanizmanın çoğu onun günlüklerinden doğdu.

| # | Depo | Tür | Neden |
|---|---|---|---|
| 1 | `sindresorhus/slugify` | yeşil alan benzeri, küçük JS | Tek sorumluluk, hızlı takım, Unicode kenar durumları gerçek zorluk |
| 2 | `pallets/click` | hata düzeltme, Python | Olgun, pinlenebilir, reprodüksiyon testleri depoda |
| 3 | `chalk/wrap-ansi` | refactor, JS | Küçük ama kurnaz; ANSI genişlik hesabı davranışı kolay kırar |
| 4 | `jonschlinkert/gray-matter` | hata düzeltme, JS | Ayrıştırıcı; kabul testi net, kapsam geniş |
| 5 | `psf/requests` (tek modül) | refactor, Python | Büyük depoda dar kapsam; navigasyon maliyetini ölçer |

Beşi de Node/Python, yani `dotnet` kaynaklı süreç ağacı sorunları ölçümü kirletmez.

Pilot 1 ve 2'yi kullanır — bir yeşil alan, bir hata düzeltme, biri JS biri Python.

Model bu depoları eğitiminden tanıyor olabilir; bu Core-native asimetrisi değildir, iki kola
da aynı biçimde biner, ama pass@1'i mutlak olarak şişirir. Pinlenmiş commit yeterli önlemdir,
rapora not düşülür.

---

## 4. Kirlenmeye karşı

- Her koşu **temiz klon** ve **temiz `CLAUDE_CONFIG_DIR`** ile. `MEMORY.md`, `RULES.md`,
  `CLAUDE.md`, otomatik hafıza ve eski `live/` kayıtları taşınmaz — native'e haksız yük,
  Core'a gizli avantaj olur.
- Core kolunun eklenti kurulumu **bench betiğinin içinde** yapılır, elle değil; yoksa temiz
  config dizini Core'u da yok eder.
- RTK kancası ya bütün koşularda açık ya bütün koşularda kapalı.
- Görev metinleri ve kabul testleri **koşudan önce** yazılır ve dondurulur.
- Native koşuya aynı görev metni **tek seferde** verilir, arkasından hiçbir ek mesaj yok.
  Core'un sözleşme şablonundan gelen ek yönerge görev metnine sızmaz.
- **Kabul yargısı kördür.** pass@1'i kabul testi verdiği için zaten kör; ama "düşen koşu" ve
  tavan kararı da kol etiketi görünmeden verilir.
- Görev başına **30 dk duvar tavanı**. Tavana çarpan koşu `fail` sayılır.
- Koşular **karışık sırada** verilir, kol kol blok halinde değil. Her koşu kendi `batchId`,
  `modelId` ve Claude Code sürümünü kaydeder; analizde görev blok faktörü olarak durur.
- Pilot ve kalan koşular **aynı hafta** içinde kalır. Model id ya da Claude Code sürümü
  değişirse birleştirme reddedilir — pilot kendi başına bir yığın etkisi olur.
- Tek koşu asla raporlanmaz. **Medyan + min–max**, ortalama değil.

---

## 5. Çıktı

`bench/run.js` koşuyu sürer, `bench/sonuc.jsonl` satır satır **ekler**, `bench/rapor.md`
tabloyu üretir. Betik depoda yaşar; yoksa rakam tekrar üretilemez. Pilotun ve tamın çıktısı
aynı dosyadır — tam, kalan koşuları ekleyip raporu yeniden üretmektir.

Her `sonuc.jsonl` satırı en az şunları taşır: `batchId`, `taskId`, `repoPin`, `arm`, `seat`,
`modelId`, `ccVersion`, `repeat`, `startedAt`, `wallMs`, `pass`, `dropped`, `dropReason`,
`tokens` (dört kalem ayrı, ana + alt ajanlar), `usd`, `usdSource`.

README'ye girecek tablo:

| Çift | Kol | pass@1 | medyan $ | medyan dk | düşen koşu |
|---|---|---|---|---|---|
| eco | native-eco | | | | |
| eco | eco | | | | |
| normal | native-normal | | | | |
| normal | normal | | | | |
| premium | native-premium | | | | |
| premium | premium | | | | |

Yanına tarih, model id ve Claude Code sürümü. Rakamlar gelmeden README'ye tek satır yazılmaz.

---

## 6. Bench'in kapattığı ayrı iş

`sonnet/high` premium builder hücresinde ölçülmeden duruyor (bkz. `danisma/001`). Premium
kolunun koşuları bu koltuğu gerçek işte çalıştırır, yani "20-30 sözleşme yeniden ölçülecek"
maddesi için ayrı bir koşu gerekmez. Bench sonucu o maddeyi ya gereksiz kılar ya acil.
