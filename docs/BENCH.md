# Bench: dört profil, aynı iş

**Durum:** ertelendi (2026-09-02) — en sona. Plan hazır, betik yazılmadı. **Karar:** kullanıcı, 2026-09-02. **Danışman:** Fable.

Ölçtüğümüz şey: Teknesyum Core kurulu bir Claude Code oturumu ile kurulu olmayanı,
aynı görev ve aynı kabul testi altında karşılaştırmak.

---

## 0. Durma kuralı

**Core, native'den %40 fazla token harcıyorsa bench durur.** Sonraki görevlere geçilmez;
nerede sızdırdığı bulunur. Bu bir hedef değil, bir alarm eşiği: Core'un iddiası "aynı işi
daha ucuza değil, daha güvenilir" olsa bile %40 sapma mekanizmada bir kusur demektir.

---

## 1. Ölçülen dört rakam

| Rakam | Nasıl | Neden bu |
|---|---|---|
| **pass@1** | Görevle gelen kabul testi, elle müdahale olmadan geçti mi | Ana rakam |
| **medyan $** | transcript'ten model × token × fiyat | Profiller farklı model kullanıyor; token karşılaştırması yanıltır |
| **medyan dk** | duvar saati | |
| **düşen koşu oranı** | tavana çarpan ya da kendi kendine duran koşu | Otonom koşuda "insan müdahalesi" 0'a sabitlenir, yerine bu geçer |

`verify` geçme oranı **karşılaştırma metriği değildir** — native'de verify yoktur. Yalnız
Core profilleri arasında raporlanır.

---

## 2. Pilot kapsamı

5 görev × 3 tekrar × 4 profil = **60 koşu**. Profiller: `native`, `eco`, `normal`,
`premium`.

Görev türleri, üçü de temsil edilecek:

1. **Yeşil alan** — sıfırdan küçük bir araç, testleri görevle birlikte verilir.
2. **Yabancı depoda hata düzeltme** — pinlenmiş commit + reprodüksiyon testi.
3. **Çok dosyalı refactor** — davranış değişmeyecek, mevcut takım geçmeye devam edecek.

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

---

## 4. Kirlenmeye karşı

- Her koşu **temiz klon** ve **temiz `~/.claude`** ile. `MEMORY.md`, `RULES.md`, eski
  `live/` kayıtları taşınmaz — native'e haksız yük, Core'a gizli avantaj olur.
- RTK kancası ya bütün koşularda açık ya bütün koşularda kapalı.
- Görev metinleri ve kabul testleri **koşudan önce** yazılır ve dondurulur.
- Native koşuya aynı görev metni verilir; Core'un sözleşme şablonundan gelen ek yönerge
  görev metnine sızmaz.
- Görev başına **30 dk duvar tavanı**. Tavana çarpan koşu `fail` sayılır.
- Bütün koşular aynı hafta içinde; model id'leri rapora yazılır.
- Tek koşu asla raporlanmaz. **Medyan + min–max**, ortalama değil.

---

## 5. Çıktı

`bench/run.js` koşuyu sürer, `bench/sonuc.jsonl` satır satır yazar, `bench/rapor.md`
tabloyu üretir. Betik depoda yaşar; yoksa rakam tekrar üretilemez.

README'ye girecek tablo:

| Profil | pass@1 | medyan $ | medyan dk | düşen koşu |
|---|---|---|---|---|
| native | | | | |
| eco | | | | |
| normal | | | | |
| premium | | | | |

Yanına tarih ve model id. Rakamlar gelmeden README'ye tek satır yazılmaz.
