# Teknesyum-UI Kontrast Kapıları

Tarih: 2026-09-24 · Depo: Teknesyum-UI · Commit: `70abb08`, push edildi · Sürüm kesilmedi.

## Test Sonucu

```
  ok    an Avalonia project gets the headless test
  ok    a bad namespace exits 2

185 passed, 0 failed
```

`--list-rules`: 97 kural (önce 96).

## Dosya Dosya Değişiklikler

**J2 · Token kapısı**
- `ui/scripts/kontrast.js` (yeni): WCAG parlaklık ve oran, `over` bindirme, hex/rgb/hsl/`color-mix` ayrıştırma. Kapı, kural ve testler bunu ortak kullanır.
- `ui/scripts/generate.js`: `on` kapısı. Her dolgu için `on` eşi zorunlu; saydam dolgu yüzeyin üstüne bindirilip 7:1 ile ölçülür. Tutmayan eş `black on pink — 6.44:1, below 7:1` diye basılır ve çıkış 1 olur. Rationale'daki oran ölçülenden farklıysa da durur. CSS'e `--tk-on-*`, XAML'e `On*` fırçaları yazılır.
- `ui/scripts/setup.js`: `measureOnPairs`.
- `ui/templates/neon.tokens.json` ve `assets/theme.tokens.json`: `on` grubu. Assets'teki `theme.css`, `Theme.xaml` ve `Theme.axaml` yeniden üretildi.

**J3 · `pair-contrast` kuralı**
- `ui/scripts/rules/okunurluk.js` (yeni): `okunurluk/pair-contrast`, önem derecesi error. Mesaj biçimi: `bg X on fg Y — 2.1:1, below 7:1`. Okuduğu kaynaklar:
  - CSS kuralları: background ile color aynı kuralda, `@apply` dahil; disabled seçiciler atlanır.
  - `var()` fallback ile.
  - Tailwind: v3 paleti, `--color-*`, tailwind.config, `/NN` opaklık, `[..]` keyfi değer.
  - JSX/TSX/Vue/Svelte: className/class ve style; eş, ata zinciri boyunca kurulur.
  - XAML/AXAML: proje çapında Color/Brush/Style dizini; BasedOn, iç içe `^:` stiller, Trigger/MultiTrigger; IsEnabled=False ve `:disabled` atlanır.
  - C#: `const`/`static readonly` sembol dizini, `ColorTranslator.FromHtml`, `Color.FromArgb` (1–4 argüman), ternary ve if/else dallarını koşul etiketiyle izleme; boyama yönteminde `Fill*`/`Clear` ile `TextRenderer.DrawText`/`DrawString` eşleşir. Ayrıca WinForms `BackColor`/`ForeColor` eşleri.
- `ui/scripts/rules/core.js`: `contrast` yalnız onaylı yazı renklerini (`text`, `text-label`, `pink-text`, `purple-text`, `success`, `warning`, `danger-text`, `disabled` ve `on` renkleri) muaf tutar. Yazı olarak kullanılan dolgu kesimleri ölçülür. Aynı satırda background varsa işi `pair-contrast`'a bırakır. XAML'de yalnız `Foreground` ölçülür.
- Fixture'lar (`ui/scripts/rules/__fixtures__/okunurluk/`): wpf-style, wpf-element, avalonia-style, jsx, tsx-arbitrary, css, winforms; her biri bad/good.
- Standardın kendi tutmayan eşleri düzeltildi:
  - `generate.js`: ghost hover yazısı `--tk-on-purple-20` oldu (6.38 idi).
  - `assets/States.xaml`: `TkIconButton` hover/focus `OnPink10`, pressed `OnPink30` (6.89 ve 5.16 idi).
  - `templates/ustcubuk/react/titlebar.css`: hover purple 30% + `--tk-on-purple-30` (4.3 idi), close hover `danger-text` + `--tk-on-danger-text`, active pink 30% + `--tk-on-pink-30` (6.1 idi).

**J4 · Canlı denetim**
- `ui/scripts/denetim.js` (yeni): URL alır; `--snippet <dosya>` ile dosyaya, yoksa stdout'a bağımsız bir JS betiği yazar. Betiğin yaptıkları:
  - görünen her yazıyı üst zincir boyunca bindirilmiş zeminine karşı ölçer;
  - eşiğin altındaki eşleri JSON döndürür;
  - 24 px'ten küçük tıklanır hedefleri listeler;
  - axe-core kullanmaz.

  Seçenekler `--esik` ve `--hedef`. Tarayıcıda doğrulandı: 1 eş (1.17) ve 1 hedef (20 px) yakalandı.
- `ui/templates/denetim/avalonia/KontrastTests.cs`: Avalonia.Headless.XUnit, `[AvaloniaFact]`.
- `ui/templates/denetim/wpf/KontrastTests.cs`: STA iş parçacığı ve `VisualTreeHelper` yürüyüşü.
- `ui/scripts/scaffold.js`: `denetim <Namespace>` hedefi. Seçenekler `--wpf|--avalonia` (varsayılan: `.axaml` varsa avalonia), `--pencere` ve `--esik`.
- `test/okunurluk.js` (yeni) ve `test/all.js`: kapı, contrast düzeltmesi, çapraz dosya eşleri, Tailwind, C# boyama, kapsamlı var, kardeş durum stili, snippet ve scaffold.
- `README.md` ve `README.tr.md`: 97 kural, 185 assertion, Kontrast bölümü (kapı, `on` değişkenleri, `pair-contrast`, `javascript_tool` ile denetim), `denetim` şablon satırı. `CHANGELOG.md`: Unreleased.

## Dört Proje, `pair-contrast`

Komut: `node Teknesyum-UI/ui/scripts/scan.js <Proje> --json --rules okunurluk`

**Runly: 1**
- `src/Runly.Settings/NeonControls.cs:395 bg Palette.NeonPurple @30 (#b026ff 12%) on fg Palette.PurpleText (#c67eff) — 6.9:1, below 7:1`

  Bu, NeonButton'ın hover'daki çerçeveli hâli. Runly WPF değil: WinForms ve GDI ile özel boyama yapıyor. Bu yüzden 0 bulgu alıyordu; C# geçişiyle yakalandı.

**VidShrink: 6** (ilk 5)
- `src/VidShrink.App/MainWindow.axaml:149 bg Surface (#121216) on fg NeonPurple (#b026ff) — 4.1:1, below 7:1`
- `src/VidShrink.App/Playback/PlayerView.axaml:84 bg AppBg (#050507) on fg NeonEmber (#ff0033) — 5.1:1, below 7:1`
- `src/VidShrink.App/ShrinkJobWindow.axaml:64 bg PanelSurface (#121216) on fg NeonPink (#ff00ea) — 5.7:1, below 7:1`
- `src/VidShrink.App/Themes/Controls.axaml:733 bg NeonPurple (#b026ff) on fg OnNeon (#000000) — 4.6:1, below 7:1`
- `src/VidShrink.App/Themes/Controls.axaml:750 bg NeonPink (#ff00ea) on fg OnNeon (#000000) — 6.4:1, below 7:1`

**CodeXray: 28** (ilk 5)
- `src/components/AiAssistant.css:39 bg rgba(0, 0, 0, 0.3) (#000000 30%) on fg var(--text-muted) (#8892b0) — 6.5:1, below 7:1`
- `src/components/AiAssistant.css:337 bg rgba(0, 0, 0, 0.25) (#000000 25%) on fg var(--text-muted) (#8892b0) — 6.5:1, below 7:1`
- `src/components/AiAssistant.css:546 bg var(--neon-magenta) (#ff00ff) on fg #fff — 3.1:1, below 7:1`
- `src/components/AiAssistant.css:626 bg rgba(3, 8, 15, 0.94) (#03080f 94%) on fg var(--text-secondary) (#8892b0) — 6.5:1, below 7:1`
- `src/components/AiAssistant.css:885 bg rgba(0, 0, 0, 0.22) (#000000 22%) on fg var(--text-muted) (#8892b0) — 6.5:1, below 7:1`

**VideoEdit: 2**
- `arayuz/src/index.css:135 bg var(--tk-pink) (#ff00ea) on fg #000 — 6.4:1, below 7:1`
- `arayuz/src/index.css:143 bg rgba(176, 38, 255, 0.1) (#b026ff 10%) on fg var(--tk-purple) (#b026ff) — 4.1:1, below 7:1`

Ham JSON'lar oturum scratchpad'inde (`pc-<Proje>.json`); geçicidir.

## Tarama Sırasında Giderilen Yanlış Pozitifler

- **VidShrink:** 26 paletin hepsi dizine giriyordu ve ilk gelen açık tema (AyuLight) kazanıyordu; 25 bulgu çıkıyordu. Artık `ResourceInclude Source` ile birleştirilen dosya önce gelir, adında light/latte/dawn geçen en sona kalır.
- **VidShrink:** `^:pointerover /template/ Border` stili, yazı rengini kardeşi olan `^:pointerover` stilinden almıyordu. Artık alıyor.
- **CodeXray:** 58 bulgu vardı. Açık tema değişkenleri koyu kurallara sızıyordu. Artık `:root`/`html`/`body` tanımı önce gelir, ilk yazılan kazanır, light en sona kalır. Başka bir seçiciye kapsanmış değişken yalnız fallback yoksa kullanılır.
- **Runly:** 3 px'lik seçim şeridi (`FillRectangle(..., Px(3), ...)`) zemin sayılmıyor. Yazı, koşulu uyan son dolguyla eşleşir.

## Tasarım Değişiklikleri (Ana Oturumun Bilmesi Gereken)

- Danger düğmesinin dolgusu `danger` yerine `danger-text` oldu. Siyah yazı `danger` üstünde 7:1'i tutmuyordu.
- Ghost hover, başlık çubuğu hover/close/active ve `TkIconButton` durumlarının yazı rengi `on` eşlerine geçti. Görünüm biraz değişir.

## Çözülmeyenler

- Runly başlatıcısındaki Win32 `CreateSolidBrush`/`SetTextColor` (P/Invoke, `uint` BGR) okunmuyor.
- `on` eşi tanımlamayan özel bir palette, o dolgu için `--tk-on-*` üretilmez; kapı yalnız tanımlı eşleri ölçer.
- `--files` ile taramada yalnız dosya kümesi daralır; XAML ve C# dizinleri yine proje çapında kurulur.
- C# değerlendirici sezgiseldir:
  - çalışma anında hesaplanan renkler (`ControlPaint.Light`, bir alandan okunan renk) bilinmez sayılıp atlanır;
  - yazının altındaki zemin, `BackColor` değil tema yüzeyi (`surface`) varsayılır.
- CSS'te eş aynı kural içinde kurulur. Başka bir seçiciden gelen zemin (kalıtım) ölçülmez; bunu `denetim.js` yakalar.
