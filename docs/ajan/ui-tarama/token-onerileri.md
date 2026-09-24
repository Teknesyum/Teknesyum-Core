# Token Önerileri

`ui-duzeni.md`'ye 2026-09-24'te eklenen kuralların sayıları. Kitap yalnız token adını yazar;
değer burada, kaynağıyla. Token temaya (`teknesyum-ui` `generate.js` → `theme.css` /
`Theme.axaml`) girene kadar kural ilgili yerde "token yok, sahibe sor" durumundadır.

## Yeni Token'lar

| Token | Önerilen Değer | Kaynak | Kural |
|---|---|---|---|
| `--tk-on-blue` | `#000000` (15,26:1) | SKILL §Colour "Filled neon buttons take black text"; `ui-duzeni.md` Renk | Okunurluk: dolgunun `on` eşi |
| `--tk-on-pink` / `--tk-on-danger` | `#000000` (6,44:1 — 7:1 altı) | Aynı kaynak; oran bu oturumda WCAG formülüyle hesaplandı | Okunurluk; bkz. Sahibe Sorulacak 2 |
| `--tk-on-purple` | yok: `#b026ff` üstünde siyah 4,57:1, beyaz 4,60:1 | theme.css `--tk-purple`; oran bu oturumda hesaplandı | Okunurluk; bkz. Sahibe Sorulacak 2 |
| `--tk-on-success` | `#000000` (10,92:1) | theme.css `--tk-success: #34d399` | Okunurluk |
| `--tk-scale-enter` | 0.9–0.97; auto-animate `scale(.98)` | emilkowalski/skills `STANDARDS.md` "Physicality"; formkit/auto-animate `src/index.ts` | Hareket: giren öğe sıfır ölçekten başlamaz |
| `--tk-typeahead-reset` | 750ms | floating-ui `useTypeahead` `resetMs` varsayılanı | Form: harf birikimi |
| `--tk-window-min-width` | en az 500 epx, önerilen 330 epx | Microsoft Learn, Snap düzeni | Masaüstü: Snap bölgesine sığar |
| `--tk-state-save-throttle` | 600ms | localsend `onWindowMove`; plugins-workspace issue #3594 | Masaüstü: pencere durumu kaydı |
| `--tk-inp-budget` | 200ms | web.dev/articles/inp | En iyi program: etkileşim yanıtı |
| `--tk-cls-budget` | 0.1 | web.dev/articles/cls | En iyi program: düzen kayması |

## Var Olan Token'lar (Yeni Kural Bunlara Bağlandı)
- `--tk-t-instant` / `--tk-t-fast` / `--tk-t-base` / `--tk-t-slow`: süre kademesi. Kaynak
  karşılaştırması: emilkowalski/skills geri bildirim 100–160ms, menü 150–250ms, panel
  200–500ms; Carbon `$transition-base` 250ms; M3 `$duration-medium2` 300ms.
- `--tk-e-out` / `--tk-e-in`: giriş yavaşlayan, çıkış hızlanan. Karşılaştırma: emilkowalski
  `cubic-bezier(0.23,1,0.32,1)`, M3 `$easing-emphasized-decelerate cubic-bezier(0.05,0.7,0.1,1)`.
  Yer değiştiren öğe için `--tk-e-in-out` yok; kaynak `cubic-bezier(0.77,0,0.175,1)`
  (emilkowalski/skills) — eklenmesi önerilir.
- `--tk-target-min`: 24px, WCAG 2.5.8 ile aynı; değişiklik gerekmez.

## Alınmayan Adaylar
- `--tk-swipe-velocity`, `--tk-tooltip-delay-ms`, `--tk-virtual-overscan-count`,
  `--tk-resize-hit-target-*`, `--tk-mutation-budget`, `--tk-measure-max`: kuralları kitaba
  alınmadı (tek kaynak ya da kapsam dışı).
- `--tk-contrast-min: 4.5` / `--tk-contrast-large-min: 3` (rehber.md, WCAG AA): mevcut 7:1
  eşiğinin altında; alınmadı, bkz. Sahibe Sorulacak 1.
- `--tk-update-check-interval`, `--tk-update-prompt-delay`: kural çelişkili, bkz. 5.

## Sahibe Sorulacak
1. **Büyük metin ve simge eşiği.** Rafta büyük metin için ayrı eşik yok (7:1 geçerli);
   simge/kenar için yalnız theme.css `--tk-warning-border` notunda WCAG 1.4.11 3:1 basamağı
   geçiyor. rehber.md 4.5:1 / 3:1 (AA) öneriyor. Mevcut 7:1 kaldı; simge eşiği kitaba
   "temadaki metin dışı eşik" diye yazıldı. Bu eşik SKILL'e açık kural olarak girsin mi?
2. **Pembe ve mor dolgu.** Pembe `#ff00ea` üstünde siyah 6,44:1, mor `#b026ff` üstünde
   siyah 4,57:1 / beyaz 4,60:1 — ikisi de 7:1 altı. SKILL "dolgulu neon siyah yazı" diyor,
   yeni kural 7:1 istiyor. Pembe ve mor dolgu yazı taşıyan yüzeyde yasaklansın mı, yoksa
   dolgu tonu mu yeniden ölçülsün?
3. **Edilgen durum.** Görev "edilgen dahil her durum ölçülür" diyor; SKILL §2 edilgen
   denetimi 7:1'den muaf tutuyor. Mevcut muafiyet kaldı, oran yalnız ölçülüp raporlanıyor.
   Edilgen için alt eşik konsun mu?
4. **Durağan tarayıcı.** `scan.js` `contrast` kuralı yalnız palet dışı rengi siyaha karşı
   ölçüyor; açık mavi dolgu + koyu mavi yazı bu yüzden geçiyor. Kitap canlı denetimi kanıt
   saydı; tarayıcıya "dolgu ile yazı aynı aile" ve "dolgu üstünde `on` token'ı dışı renk"
   kuralı eklensin mi?
5. **Yeniden başlatma.** `guncelleme-paneli.md` kod değişince gecikmeli otomatik yeniden
   başlatma diyor; Tauri updater / ente yeniden başlatmayı kullanıcının "şimdi / sonra"
   seçimine bırakıyor (masaustu.md). Mevcut kural kaldı.
6. **İptal ve Kur penceresi.** Yeni kural "kullanıcının başlattığı uzun iş iptal edilir"
   diyor; `guncelleme-paneli.md` Kur penceresini çalışırken kapatılamaz, Esc işlemez tutuyor.
   Kur penceresi istisna yazıldı; iptal orada da istenir mi? Kaynak tek ve düşük güvenli
   (ui-ux-pro-max), kural senin talebinle alındı.
7. **Çark.** Polaris "metin dışı içerikte çark" diyor (rehber.md); raf "iskelet, döner çark
   değil". Mevcut kural kaldı; düzeni bilinmeyen iş için çubuk + adım adı yazıldı.
8. **Yüksek frekanslı klavye eylemi.** emilkowalski/skills günde çok kez tekrarlanan klavye
   eylemini (komut paleti, `Ctrl+Tab`) canlandırmıyor; raf "Hareket temeldir" diyor
   (hareket.md). Mevcut kural kaldı.
9. **Koyu temada gölge.** Atlassian yükseltilmiş katmanda gölgeyi zorunlu tutuyor; raf
   kenarlığı öne çıkarıyor (sistem.md). Alınmadı.
10. **Mica.** Duvar kâğıdından ton alır, "yalnız koyu tema" paletini kaydırır (masaustu.md).
    Alınmadı.
11. **Etkin olmayan pencerede sönük başlık.** Microsoft Learn istiyor; "orta gri yok" ve
    7:1 ile çatışır. Alınmadı.
