# Yöntem: Akan Grafik Ve Giriş Animasyonları

**Tür:** Yöntem
**Kaynak:** AmeliyatListesi, 2026-09-23
**Kullanıcı geri bildirimi:** "bu animatif düzenini sevdim ... analize tıklayınca grafiklerin akması falan iyi olmuş"

## Ne Beğenildi

Analiz sekmesine geçince KPI kartları ve çubuk grafikler sırayla, hafif gecikmeli
biçimde beliriyor; çubuklar sıfırdan gerçek genişliğine akıyor. Genel olarak
sekme değişimi, dosya bırakma, toast ve skeleton gibi her geçiş aynı yumuşak
dilde hareket ediyor — göze tek bir sistemmiş gibi geliyor.

## Kullanılan Parçalar

**`.main > *`** — `app.css:127`
Özellik: `animation: enter var(--tk-t-slow) var(--tk-e-out) both;`
Token: `--tk-t-slow` = 360ms, eğri `--tk-e-out` = `cubic-bezier(0.2, 0, 0, 1)`
```css
.main > * { animation: enter var(--tk-t-slow) var(--tk-e-out) both; }
@keyframes enter { from { opacity: 0; transform: translateY(var(--tk-entry-offset)); } }
```
`.main` içine düşen her doğrudan çocuk (Analiz, Liste, Ayarlar gövdesi) sekme
değişince bu girişi otomatik alıyor.

**`.kpi`** — `app.css:385`
`animation: enter var(--tk-t-slow) var(--tk-e-out) both;` — KPI kartları için
aynı giriş animasyonu, `--tk-t-slow` (360ms).

**`.bars__row`** — `app.css:394`, gecikme `Analytics.tsx:60`
Özellik: `animation: enter var(--tk-t-base) var(--tk-e-out) both;`
Token: `--tk-t-base` = 240ms
```css
.bars__row { animation: enter var(--tk-t-base) var(--tk-e-out) both; }
```
```tsx
style={{ animationDelay: `calc(var(--tk-stagger) * ${Math.min(i, 6)})` }}
```
Her satır aynı `enter` animasyonunu kullanıyor ama `--tk-stagger` (40ms) ile
çarpılan sıra numarasınca gecikmeli başlıyor — bu, satırların art arda "akarak"
belirmesini veriyor.

**`.bars__fill`** — `app.css:400`
Özellik: `transform-origin: left; animation: grow var(--tk-t-slow) var(--tk-e-out) both;`
Token: `--tk-t-slow` = 360ms
```css
.bars__fill { transform-origin: left; animation: grow var(--tk-t-slow) var(--tk-e-out) both; }
@keyframes grow { from { transform: scaleX(0); } }
```
Çubuğun kendisi `scaleX(0)`'dan gerçek genişliğine büyüyor — "akan grafik"
hissinin asıl kaynağı bu.

**`.tab::after`** — `app.css:52`
Özellik: `transform: scaleX(0); transition: transform var(--tk-t-base) var(--tk-e-spring);`
Token: `--tk-t-base` = 240ms, eğri `--tk-e-spring` = `cubic-bezier(0.34, 1.36, 0.64, 1)`
Sekme altı çizgisi zıplayarak (spring) genişliyor.

**`.skeleton-wrap .sk`** — `app.css:137-145`, gecikme `App.tsx:283`
`animation: sk var(--tk-t-slow) var(--tk-e-out) 1;` + `animationDelay: ${i * 40}ms`
Dosya okunurken satır iskeletleri de aynı kademeli gecikme mantığıyla beliriyor.

**`.dropzone`** — `app.css:151`
`animation: enter var(--tk-t-fast) var(--tk-e-out);` — dosya sürükleme katmanı
hızlı (`--tk-t-fast` = 160ms) giriyor.

**`.toast`** — `app.css:171`
Özellik: `animation: toast-in var(--tk-t-base) var(--tk-e-spring);`
```css
@keyframes toast-in { from { opacity: 0; transform: translateX(var(--tk-sp-5)); } }
```
Bildirimler yandan spring eğrisiyle kayarak giriyor.

**`key={block}` / `key={tab}`** — `App.tsx:323`, `SettingsView.tsx:306`
`<Sheet key={block} .../>` ve Ayarlar'da `<div className="settings__body tk-panel" key={tab}>`
React'a "bu farklı bir eleman" dedirtip DOM'u yeniden bağlıyor; `.main > *`
veya `.settings__body` animasyonu bu yüzden her sekme/blok değişiminde yeniden
tetikleniyor — yoksa `animation ... both` sadece ilk mount'ta çalışır, ikinci
girişte hiç oynamazdı.

**`prefers-reduced-motion`** — `app.css:460`
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: var(--tk-t-instant) !important; transition-duration: var(--tk-t-instant) !important; }
}
```
Tüm animasyon ve geçiş süreleri `--tk-t-instant` (90ms) değerine düşüyor;
hareket kapanmıyor, sadece anlık hale geliyor.

## Neden İşe Yarıyor

Her animasyon yalnız `transform` ve `opacity` değiştiriyor (`enter`, `grow`,
`toast-in`, `sk`) — layout/reflow tetiklemeyen, GPU'da ucuz özellikler.
Renk/arka plan geçişleri (`background`, `color`, `border-color`) ayrı ve kısa
tutuluyor (`--tk-t-fast` = 160ms, `--tk-t-instant` = 90ms).

Kademeli gecikme (`--tk-stagger` * i) `Math.min(i, 6)` ile tavanlanıyor
(`--tk-stagger-max: 6` token'ı ile tutarlı) — liste ne kadar uzun olursa olsun
son satır 240ms'den fazla gecikmiyor, akış duyulur ama beklemeye dönüşmüyor.

`key={tab}` / `key={block}` deseni CSS animasyonunun tek seferlik doğasını
(`animation ... both`, yalnız mount'ta oynar) React tarafında yeniden mount
ettirerek aşıyor — CSS'e "her tıklamada tekrar oyna" mantığı hiç yazılmamış,
bileşen ağacı yeniden kuruluyor.

`prefers-reduced-motion` tüm süreleri tek noktadan (`--tk-t-instant`) sıfırlıyor;
ayrı bir "no-animation" kod yolu yok, token değişimi yetiyor.

## Teknesyum UI'ya Öneri

`enter` keyframe'i + `--tk-stagger` deseni (satır listeleri için `animationDelay`
hesaplama, `Math.min(i, N)` tavanıyla) genel bir "liste girişi" reçetesi olarak
kitaba alınmalı — Analiz'e özgü değil, her tablo/liste bileşeninde tekrar ediyor.

`grow` (scaleX(0) → 1, transform-origin: left) bar-chart dolgusu için ayrı bir
mini bileşen/reçete olmalı; sık kullanılacak bir görsel dil.

`key={prop}` ile CSS "both" animasyonunu yeniden tetikleme tekniği bir not
olarak (kod parçası değil, "neden gerekli" açıklamasıyla) belgeye eklenmeli —
ekip tekrar karşılaşacak, kaynağı unutulmasın.

`toast-in` ve `.tab::after` spring geçişi zaten `--tk-e-spring` token'ında var;
ayrı reçete gerekmiyor, sadece kullanım örnekleri kitaba referans olarak düşebilir.

## 3. Closed

pp rafında `private/tercihler/ui-duzeni.md` Hareket bölümüne eksik olan üç madde eklendi:
liste girişi `--tk-stagger` * `min(i, --tk-stagger-max)` deseni, çubuk grafik dolgusu
`scaleX(0)` + `transform-origin: left` reçetesi, ve `key={prop}` ile CSS `animation ...
both`'u yeniden tetikleme notu. `toast-in`/`.tab::after` zaten `--tk-e-spring` altında
kayıtlıydı, eklenmedi. Raf commit: `c1298b8`.
