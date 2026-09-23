# Ajan Raporu: Teknesyum-UI Hareket Ve Görünür İş (2026-09-23)

Görev: `logs/openlogs/YONTEM-akici-arayuz-hareket-recetesi.md`, `YONTEM-program-sessiz-calismaz-isini-gosterir.md` ve `HATA-arayuz-gercek-pencerede-hic-bakilmadan-yayimlandi.md` kayıtlarının tarayıcı ve şablon tarafı. Ajan sonnet, Teknesyum-UI deposunda çalıştı.

## Ajanın Cevabı (Aynen)

Teknesyum-UI'da iş bitti, push yapılmadı, sürüm çıkarılmadı.

**Eklenen dosyalar**
- `ui/templates/ilerleme/react/ProgressBar.tsx` + `progressbar.css` — dolgu `scaleX`, tarama ışığı `::after`+`translateX`, `prefers-reduced-motion`'da durur, yüzde barın yanında. Repo taramasında 0 bulgu.
- `ui/templates/ilerleme/tauri/setup.rs` — opsiyonel, `visible:false` ile eşleşen Rust setup parçası.
- `ui/skills/teknesyum-ui/references/primary-action-visibility.md` — gerçek pencere iç boyutuna karşı birincil düğme kontrolü (100/125/150% ölçek notuyla).
- Her kural için `bad`/`good` fixture çiftleri (core + guncelleme altında).

**Kural id'leri**
- `core/tauri-hidden-launch` — pencere `visible:false` olmadan açılıyorsa.
- `core/fixed-window-no-shrink` — sabit boyutlu pencerede daralabilir alan yoksa.
- `core/fixed-window-maximize-open` — sabit boyutlu pencerede büyütme kontrolü kapatılmamışsa.
- `guncelleme/uzun-cagri-ilerlemesiz` — uzun `invoke`/`spawn` çağrısı var, ilerleme/busy göstergesi yok.
- `guncelleme/sessiz-dongu` — arkaplan `setInterval` var, durum göstergesi yok.

**Test**: `148 passed, 0 failed`.
**Commit**: `3d05014` — "Add progress bar template, window and busy-state scanner rules".

**Şüpheler**
- `sessiz-dongu` yalnız aynı dosyaya bakıyor; çapraz dosya durum göstergesini (`sync.js` → ayrı `badge.css`) yakalamak için `state`/`durum` kelimelerine de genişletildi — gerçek pozitifleri kaçırma riski var, sıkı değil.
- `fixed-window-*` kuralları Rust'ı taramıyor (`.rs` taranan uzantılarda değil); yalnız `tauri.conf.json`'daki `resizable:false` alanına bakıyor. Sadece Rust tarafında `set_resizable(false)` çağrılıp conf dosyasına yazılmazsa kural bunu görmez.
