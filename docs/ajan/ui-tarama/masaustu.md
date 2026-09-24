# Masaüstü Kabuk Taraması

Ana ajan raporu yazmadan kapandı; bu dosya dört alt ajanın (Tauri, Avalonia/WinUI,
Electron+Windows, cilalı uygulamalar) dönüşlerinden ana oturumda derlendi.

## Taranan Depolar

| Depo | Lisans | Yıldız | Karar | Neden |
|---|---|---|---|---|
| tauri-apps/tauri | Apache-2.0 | 111278 | al | Pencere yaşam döngüsünün kaynağı |
| tauri-apps/plugins-workspace | Apache-2.0 | 1816 | al | window-state, single-instance, updater, notification |
| tauri-apps/window-vibrancy | Apache-2.0 | 1037 | ele | Görsel efekt kitaplığı |
| clearlysid/tauri-plugin-decorum | MIT | 321 | uyarla | Özel başlıkta Snap Layout; tek bakımcı, sürüm sabitlenmeli |
| AvaloniaUI/Avalonia | MIT | 31549 | al | ExtendClientArea, RenderScaling, Transitions |
| AvaloniaUI/Avalonia.Samples | MIT | 1160 | uyarla | TrayIcon + NativeMenu örneği |
| microsoft/WinUI-Gallery | MIT | 3653 | ele | WinUI3'e özgü; yalnız davranış karşılaştırması |
| microsoft/microsoft-ui-xaml | MIT | 8465 | ele | Stilli kontrol kitaplığı |
| Microsoft Learn — başlık çubuğu, Snap, Mica | - | - | al | Çerçeveden bağımsız davranış kuralları |
| electron/electron | MIT | 123204 | ele | Dondurulmuş yığın; yalnız ilke |
| gitbutlerapp/gitbutler | Diğer | 21686 | uyarla | window-state eklentisi kullanımı |
| mountain-loop/yaak | MIT | 19251 | uyarla | Tek örnek akışı |
| readest/readest | AGPL-3.0 | 24549 | uyarla | Platforma göre ayrık pencere durumu |
| pot-app/pot-desktop | GPL-3.0 | 19420 | uyarla | DPI ile çarpılmış yardımcı pencere boyu |
| spacedriveapp/spacedrive | belirsiz | 39018 | uyarla | Enum tabanlı pencere türleri, updater sözleşmesi |
| zed-industries/zed | GPL/AGPL | 90746 | al | Tek sürükleme bölgesi, OS'e göre denetim yerleşimi |
| ente-io/ente | AGPL-3.0 | 29022 | al | Kapanış, güncelleme, pencere sınırı akışı |
| localsend/localsend | Apache-2.0 | 92508 | uyarla | Ekran dışı konum koruması, tepsi davranışı |

## Kural Adayları

- **Kural:** Pencere gizli yaratılır; ilk boyalı kare hazır olunca gösterilir, arka plan rengi temadan ilk karede verilir.
  **Kaynak:** tauri discussion #13226; ente `desktop/src/main.ts`. **Token önerisi:** -. **Denetim:** `rg "visible:\s*false"` + koşullu `.show()`; açılışın ilk 500 ms kaydında beyaz kare yok.
- **Kural:** Pencere konumu ve boyutu hazır eklentiyle saklanır (`tauri-plugin-window-state`); büyütülmüşken sınır değil `maximized` bayrağı yazılır.
  **Kaynak:** plugins-workspace window-state; ente `saveWindowBounds`. **Token önerisi:** -. **Denetim:** kapat-aç, konum ve boyut aynı.
- **Kural:** Geri yüklenen konum tüm ekranların birleşiminin içinde değilse ortalanmış varsayılana düşülür; yazmadan önce de aynı denetim yapılır.
  **Kaynak:** localsend `window_dimensions_provider.dart`. **Token önerisi:** -. **Denetim:** ikinci ekranı çıkar, uygulama görünür açılır.
- **Kural:** `save_window_state` yeniden boyutlandırma/taşıma olayının içinde eşzamanlı çağrılmaz; kayıt kısıtlanır (throttle).
  **Kaynak:** plugins-workspace issue #3594; localsend `onWindowMove`. **Token önerisi:** `--tk-state-save-throttle: 600ms (localsend)`. **Denetim:** `rg "save_window_state"` olay kolunda değil.
- **Kural:** Tek örnek zorunludur; ikinci açılış mevcut pencereyi öne getirir (`set_focus`) ve argümanı ona iletir.
  **Kaynak:** Tauri single-instance dokümanı, v2.4.5 sürüm notu; ente `second-instance`. **Token önerisi:** -. **Denetim:** iki kez aç, tek süreç, pencere önde.
- **Kural:** Özel başlık çubuğunda büyütme düğmesi Snap Layout açılır menüsünü gösterir (Windows'ta `HTMAXBUTTON` ya da decorum overlay).
  **Kaynak:** learn.microsoft.com apply-snap-layout-menu; tauri-plugin-decorum. **Token önerisi:** -. **Denetim:** büyütme düğmesinin üstünde bekle, Snap ızgarası çıkar.
- **Kural:** Sürükleme bölgesi başlık kabının tamamıdır; içindeki düğmeler açıkça sürüklemeden çıkarılır.
  **Kaynak:** zed `platform_title_bar.rs`; Tauri window customization. **Token önerisi:** -. **Denetim:** her başlık düğmesi tıklanır, pencere kaymaz.
- **Kural:** Başlık alanı genişletme ipucu pencere gösterilmeden önce verilir; özel çizim, istenen değil verilen bayrağa (`IsExtendedIntoWindowDecorations`) bakar.
  **Kaynak:** Avalonia `Window.cs`; Learn title-bar. **Token önerisi:** -. **Denetim:** açılışta sistem başlığı yanıp sönmez.
- **Kural:** Etkin olmayan pencerede başlık ön yüzü sönükleşir.
  **Kaynak:** Learn title-bar. **Token önerisi:** -. **Denetim:** başka pencereye tıkla, başlık değişir.
- **Kural:** Piksele oturan çizimler çalışma anında `RenderScaling` / `scale_factor` okur; ölçek sabiti yazılmaz.
  **Kaynak:** Avalonia TopLevel; pot `window.rs`. **Token önerisi:** -. **Denetim:** %125 ve %150'de ince kenar bulanık değil.
- **Kural:** En küçük pencere genişliği Snap bölgelerine sığar.
  **Kaynak:** Learn Snap. **Token önerisi:** `--tk-window-min-width: 500epx, önerilen 330epx (Microsoft Learn)`. **Denetim:** 1920 px ekranda üçlü düzene oturur.
- **Kural:** Kapatma, arka plan işi varsa tepsiye gizler; gerçek çıkış ayrı yoldur ve kullanıcı ayarıyla seçilir.
  **Kaynak:** ente `allowWindowClose`; localsend `setPreventClose`. **Token önerisi:** -. **Denetim:** iş sürerken kapat, iş sürer, tepsiden geri gelir.
- **Kural:** Tepsi simgesinde Windows'ta sol tık pencereyi getirir, sağ tık menüyü açar; menü yerel menüdür.
  **Kaynak:** Avalonia.Samples TrayIcon; localsend `tray_watcher.dart`. **Token önerisi:** -. **Denetim:** iki tık da beklenen işi yapar.
- **Kural:** Güncelleme arka planda denetlenir, indirme ayrı adımdır; yeniden başlatma kullanıcının "şimdi / sonra" seçimidir, sürüm atlanabilir.
  **Kaynak:** Tauri updater; ente `app-update.ts`. **Token önerisi:** `--tk-update-check-interval: 1 gün; --tk-update-prompt-delay: 5 dk (ente)`. **Denetim:** `relaunch()` yalnız düğme arkasında.
- **Kural:** Sistem bildirimi izin denetiminden geçmeden gönderilmez.
  **Kaynak:** plugins-workspace notification. **Token önerisi:** -. **Denetim:** `sendNotification` öncesi `isPermissionGranted`.
- **Kural:** Mica yalnız uzun ömürlü ana pencereye konur; kapalı saydamlıkta düz renge düşüş kırılmadan çalışır.
  **Kaynak:** Learn Mica. **Token önerisi:** -. **Denetim:** Pil tasarrufu açıkken ekran görüntüsü.

## Çelişkiler

- Raf "Yalnız koyu tema" diyor; Mica duvar kağıdından ton alır, koyu tema paletini kaydırabilir. Mica ancak palet dışı renge izin verilirse alınır — karar sahibin.

## Şablon Adayları

- Tauri: window-state + single-instance + gizli açılış kurulumu tek `setup.rs` parçası (Apache-2.0).
- Avalonia: ExtendClientArea başlık + TrayIcon/NativeMenu iskeleti (MIT).
