# UC Kampanyası — Sahip Kararları ve Açık Kalanlar

Altı program raporunun "Sahip Kararı Bekler" ve "Açık Kalan" bölümleri, değiştirilmeden.

=== VidShrink
## Sahip Kararı Bekler

Pembe (#FF00EA) ve mor (#B026FF) dolgu üstünde hiçbir token yazı 7:1 tutmuyor, pembe yazı token'ı da yüzeyde tutmuyor (PinkText Surface üstünde 6.93). Aşağıdakiler brif gereği 7:1 tutan bir token'a ya da çerçeveli/saydam biçime çevrildi. Her biri görünüşü değiştirir; geri dönmek ya da tohum değiştirmek sahibin kararı.

1. **WindowControlButton durma.** Mor dolgu, NeonBlue dolgu + OnNeon oldu.
2. **CloseWindowButton durma.** Pembe dolgu, saydam zemin + pembe çerçeve + PinkText oldu.
3. **PrimaryButton.** AccentGradient'in mor ucu yazı taşıyordu. Düz NeonBlue oldu. Bu `NeonYesilTests` beklentisini de değiştirdi.
4. **Hata yazıları.** StatusError, TxtAdvancedError, TxtFfmpegPathError ve ShrinkJobWindow TxtNotice pembe iken EmberBlaze (sarı) oldu.
   - 018 kararı "hata = kırmızı" diyor. Kırmızı (NeonEmber) ve pembe yüzeyde 7:1 tutmuyor.
   - Sarı, oynatıcıdaki TxtStall ile aynı token.
   - Seçenek: PinkText ya da NeonEmber tohumunu 7:1'e yükseltmek.
5. **Destek (Buy Me a Coffee).** Mor yazı, başlık çubuğunda PinkText oldu, sayfa içinde NeonBlue.
6. **Güncelleme rozeti.** Yeni sürüm ve iniyor durumlarında yazı artık gradyan değil.
7. **ShrinkJobWindow ikincil etiketleri.** TextDisabled (yüzeyde 4.2) TextBody oldu. Birincil ve ikincil arasındaki ton farkı kayboldu.

## Açık Kalanlar

1. **125/150 çekiminde GlowBlue gölgesi içeriği örtüyor.** Gerçek ekranda doğrulanmalı. Doğrulamak için ya Windows ölçeği bir kez elle 150 % yapılır, ya da ayrı bir Avalonia hata kaydı açılır.
2. **Edilgen PrimaryButton yazısı NeonBlue dolgu üstünde 3.51.** Muaf, ama dolgunun edilgende sönmesi beklenirdi.
3. **Kaydedici overlay görüntüleri boş.** Dört ekran görsel olarak değerlendirilemedi.
4. **25 palet ölçülmedi.** Bkz. Uygulanmayan Kurallar.
5. **Kontrast dışı tarama açıkları (6):**
   - `core/fixed-window-maximize-open`
   - `core/fixed-window-no-shrink`
   - `hb15-media-foundation.md` unmeasured-label ×2
   - `PlayerAdvancedPanel.axaml` component-without-motion
   - `tools/kararsiz.js` sessiz-dongu
6. **Tam test takımı bu makinede bitmiyor.** Takım "test ana işlemi kilitlendi" ile iptal oluyor. Başarısızların çoğu `libmpv was not found` ve ortam kaynaklı. Renk ve tema değişikliğine dokunan 21 test sınıfı ayrıca koşuldu: 1365 / 1365 başarılı ([test-ilgili.txt](2026-09-24/test-ilgili.txt)). İlk koşuda `KaydediciUyariTests` uyarı ve hata fırçası aynı çıktığı için düştü. Hata yazısı bu yüzden TextBody yerine EmberBlaze yapıldı.
7. **Sahip Kararı Bekler altındaki yedi kalem.**
=== Runly
## Sahip Kararı Bekler

Pembe ya da mor dolgu üstünde hiçbir yazı 7:1 tutmuyor. Aşağıdakiler token'a uygun, çerçeveli ya da saydam biçime çevrildi; renk dili sahibin onayını bekliyor:

1. **NeonButton ikincil hover** (NeonControls.cs:378): mor %12 dolgu kaldırıldı. Hover artık yalnız çerçeveyle gösteriliyor.
2. **Tablo "Aç" çipi** (NeonGridCells.cs:244-262): mor dolgu ve mor yazı → mor çerçeve ve beyaz yazı. Mavi "Çalıştır" çipi de aynı biçime geçti; bu, sahibin şikâyet ettiği mavi dolgu üstünde mavi yazının kendisiydi.
3. **Başlık × hover** (NeonForm.cs:574): pembe %14 dolgu kaldı; üstündeki simge pembeden beyaza döndü (pink-10…60 `on` eşi `text`).
4. **İleti simgesi hale** (NeonMessageBox.cs:186-198): pembe/mor hale dolgusu kaldırıldı.
5. **Başlatıcı ikincil düğme** (NeonWindowChrome.cs:192): yazı mor dolgu hex'inden PurpleText'e geçti.
6. **"Önerilen" çipi** (ChooseApplicationDialog.cs:23, 479): pembe dolgu üstünde pembe yazı, 6.89:1. **Çevrilmedi**, çünkü dosya başka bir çalışmanın kirli değişikliklerini taşıyor. Önerilen: dolguyu kaldır, yazı `TextBody` ya da çerçeveli PinkText.

## Açık Kalan Bulgular

1. `ChooseApplicationDialog.cs:479`: "Önerilen" çipi 6.89:1 ve pembe üstünde pembe. Dosya kirli.
2. `ChooseApplicationDialog.cs:434`: seçili satır adında mavi yazı mavi dolguda (11.35:1, aile ihlali). Dosya kirli. Önerilen: `TextStrong`.
3. `MainForm.cs:38, 1148`: "Bağlı" durumunda yeşil yazı yeşil dolguda (8.13:1, aile ihlali). Dosya kirli. Önerilen: dolgu yerine `Surface`, ya da dolgu kalır ve yazı `TextBody` olur.
4. `NeonWindowChrome.cs:16`: giriş kutusu zemini #101214 token değil. Token'a (`Surface`) çekilirse kutuyu pencere zemininden yalnız sistemin `WS_BORDER` çizgisi ayırır. Başlatıcının görüntüsü alınamadığı için bunun kullanılabilir kalıp kalmadığı doğrulanamadı; bu yüzden değiştirilmedi.
5. %125 ve %150 görüntüleri üretilmedi (gerekçe aşağıda).

=== AbxPilot
## Sahip Kararı Bekler

Pembe (#ff00ea) ve mor (#b026ff) dolgu üstünde hiçbir yazı 7:1 tutmadığı için dönüştürülenler:

1. **Küçült / büyüt hover dolgusu**: mor (`NeonPurple`) → mavi (`NeonBlue`) + `OnBlue`. Neon kimliğinde mor vurgu kayboldu.
2. **Kapat hover dolgusu**: dolu pembe (`NeonPink`) → saydam pembe (`NeonPink20`) + `OnPink20` (beyaz). Kapat'ın "tehlike" rengi korunuyor ama soluk.
3. **Logo sağ yarısı**: `NeonPink` → `PinkText` (#ff54eb). Marka işareti; WCAG logoyu muaf tutar, brif her simgeyi 7:1 istediği için çevrildi. Ad yazısının pembe yarısı zaten `PinkText` idi, şimdi logo ile eşleşti.

## Açık Kalan

Kontrast: 0. Kural dışı kalan: gerçek pencere %125/%150 (gerekçe yukarıda), edilgen stil ve ipucu ölçümü.
=== CodeXray
## Sahip Kararı Bekler

1. Pembe dolgular maviye çevrildi: `.analyze-btn:hover` (ControlBar.css:124), `.visualizer-mode-toggle button:hover` (DynamicVisualizer.css:45),
   `.radio-launcher-open:hover` (PlaylistRadio.css:54), `.example-tab:hover` (AiAssistant.css:546). Hepsi artık `--tk-blue` + `--tk-on-blue`, 15.26:1.
2. `.variable-pin-button` pembe ton zemini kaldırıldı (VariablesPanel.css:99); pembe yazı saydam zeminde.
3. `.examples-difficulty.is-hard` pembe zemin → çerçeveli biçim (LeetCodeDrawer.css:29).
4. `--text-muted` neon'da `--tk-text`'e (beyaz) bağlandı: ikincil yazı hiyerarşisi artık renkle değil boyut / ağırlıkla taşınmalı.
5. Light tema token'sız ve 7:1'i tutmuyor: 495 canlı bulgu. Büyük kısmı AA'ya ayarlı 6.1-6.8 (#596273, #075ca8); ciddi olanlar:
   radyo listesi açık temada koyu zeminde #596273 (3.26), katalog `is-easy` / `is-medium` rozetleri (1.43 / 1.37), `.qs-list-item` beyaz / açık pembe (1.08),
   `.model-requirement` (1.46), `.graph-node-badge` (2.89). Açık tema token seti gerekiyor.
6. Dark tema standart dışı (standart yalnız koyu neon); tehlike yazısı 7:1 için beyaza bağlandı (`src/index.css` dark bloğu).
7. teknesyum-ui `scan.js --fix` hatası: `tokenizeDuration` sonsuz döngülere 360 ms tavanı uyguluyor ve `.8s` → `.var(--tk-t-slow)` üretiyor.
8. `theme.css` gövde kuralları CodeXray'de nötrlendi; eklenti gövdeye dokunmamalı mı, karar eklentide.
9. teknesyum-ui `theme.css` hatası: azaltılmış harekette tüm öğelere `transform: none !important` yazması ortalama ve yerleşim transform'larını bozuyor; CodeXray kopyasından silindi, eklentide düzeltilmeli.

## Açık Kalanlar

- Neon ve dark: `textarea.code-textarea` 1 bulgu (ornekler). Yazı saydam, üstündeki vurgu katmanı okunuyor; snippet `uncertain: true` diyor. Yanlış pozitif.
- Light: 495 canlı kontrast bulgusu (madde 5).
- axe `target-size`: 22 düğüm.
- ornekler: "Örnek Mülakat Soruları" modalı alt paneldeki rozetlerle çakışıyor (dış bakış; önceden var).
- Tarama: 1100 açık bulgu, 955 hata; kontrast kurallarında 0.
=== VideoEdit
## Sahip Kararı Bekler

Pembe (`#ff00ea`) ve mor (`#b026ff`) dolgu üstünde hiçbir yazı 7:1 tutmuyor. Bu dolgular dönüştürüldü ve görünüm değişti, sahibin onayı gerekiyor:

1. `.tk-btn-danger`: pembe dolgu yerine `--tk-danger-text` (#ff54eb) dolgu ve siyah yazı, 7.72:1. `arayuz/src/index.css:190`
2. `.tk-btn-ghost`: mor %10 dolgu saydam oldu, kenar ve yazı mor. `arayuz/src/index.css:195`
3. `Rozet` pembe, mor, mavi ve başarı tonları: renkli dolgu saydam oldu, kenarlı. `arayuz/src/bilesen/ortak/Rozet.tsx:6`
4. `SupheliKarti` karar radyosunda Bırak ve Dinle: mor ve pembe dolgu saydam oldu. "Al" `--tk-blue-10` olarak kaldı. `arayuz/src/bilesen/SupheliKarti.tsx:25`
5. `.ve-cip` pembe hover dolgusu kaldırıldı. Zaten ekrana çizilmiyordu, katmansız `button{background-color:transparent}` kuralı kazanıyordu.

## Uygulanmayan Kurallar ve Açık Kalanlar

| Kural | Adet | Gerekçe |
|---|---|---|
| `colour/background-gradient` (hata) | 1 | 11 duraklı kanonik degradenin orta gri durakları metnin arkasına gelince 7:1 bozuluyor. Düz `--tk-bg` bilerek korundu, degradeyi sahip seçmeli. `arayuz/src/index.css:90` |
| Edilgen "Raporu onayla", 4.23:1 | 1 durum, 3 ekran | teknesyum-ui SKILL §2'ye göre edilgen denetim 7:1'den muaf. Karşılığında imleç, `title` ve `aria-disabled` taşıması gerekiyor; taşıyor. Tarama bunu hata saymıyor. |
| `colour/unused-token` | 12 | Kanonik ve Tailwind `@theme` bloğunun parçası. Silmek kanonu bozar. |
| `core/list-without-motion` | 11 | Liste giriş/çıkış animasyonu yeni bir hareket tasarımı gerektiriyor, ucuz değil. |
| `colour/mono-data-numbers` | 6 | Biçimli sayılar cümle içinde (`PuanIzgarasi`, `SupheliBolumu`, `SureMuhasebesi`). Mono yazı cümle akışını bozar, karar sahibin. |
| `states/five-states` | 4 | `.tk-btn-primary` ve `.tk-btn-ghost` için basılı ve edilgen durum ortak `.tk-btn:active` ve `.tk-btn:disabled` kurallarında tanımlı, ama tarama sınıf başına arıyor. `.ve-cip[data-secili]` ve `.ve-baglanti` hiç edilgen olmuyor. |
| `colour/border-alpha` | 2 | `/30` kenar süs amaçlı (`--tk-border-decorative`), ama seçici adı bunu belli etmiyor. |
| `core/component-without-motion` | 2 | `AmacPaneli` ve `Panel` statik. Giriş animasyonu eklemek tasarım kararı. |
| `core/hover-without-transition` | 2 | Kaydırma çubuğu tutamacı geçiş ve odak almaz. Seçili çipin hover'ı bilerek durağan. |

=== Quizloop
## Sahip Kararı Bekler

`ui-denetim.md` sınırı gereği: pembe (#ff00ea) ve mor (#b026ff) dolgu üstünde hiçbir yazı
7:1 tutmuyor. Kod değiştirilmediği için burada yalnız liste var, uygulama yok:

1. `--tk-danger` (#ff00ea) dolgusu — hem katı (siyah yazı 6.4:1) hem tint (%12, #ff54eb
   yazı 6.8:1) biçiminde `teknesyum-ui/css/theme.css:334`, `teknesyum-ui/react/theme.css:334`
   ve `src/renderer/src/styles/app.css:125,669`.
2. `--ql-tint-purple` (#b026ff %12) + `--tk-purple-text` (#c67eff) — `app.css:163`, canlı
   ölçümde "Örnek modülü kur" (2.31:1) ve "Modülü kaldır/Sıfırla/Soru bankası" (6.31:1)
   düğmelerinde, ayrıca imza bağlantısında (4.54:1) ve istatistik rakamlarında (6.69:1)
   tekrarlanıyor.

Öneri (uygulanmadı): bu yazıları mavi + `on-blue` token çiftine taşımak ya da çerçeveli/
saydam biçime çevirmek — karar sahipte.

