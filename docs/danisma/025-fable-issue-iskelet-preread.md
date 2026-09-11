[[danisma:025]] — girdi: `025-fable-issue-iskelet-preread-girdi.md` · model fable · 55.911 token, 123 sn

# Danışma Yanıtı — Issue #1, Issue #2, preread/postread

## 1. Issue #1 — İlke nerede, kural nasıl kapsamlanır

**Karar:** İlke ve kural **Teknesyum-UI**'de yaşar; Core'a **hiçbir şey** eklenmez.

| Parça | Yer | Sınıf | Gerekçe |
| --- | --- | --- | --- |
| Beş ilke metni | `Teknesyum-UI/SKILL.md`'ye 5 satırlık bölüm ("Çalıştığını Gösteren Program") | Z | SKILL yalnız `teknesyum-ui.json` olan projede açılır; Core'a girse her turda ödenirdi (C) |
| Senkron çağrı kuralı | `scan.js`'e 1 kural | Z | scan yalnız çağrılınca koşar |
| Referans kod | `Teknesyum-UI/templates/durum/` (Electron main+renderer, Avalonia, WinForms-PS) | Z | Model sabit metni yazmaz ilkesi; kopyalanır, okunmaz |

**Kural kapsamı — Core'un kendi CLI'sini yakalamaması için:** kural dosyayı değil **süreç türünü** tanır. Tetik koşulu: dosya `execFileSync|spawnSync|execSync` içeriyor **ve** aynı dosya `require('electron')`/`from 'electron'`/`@tauri-apps/api`/`Avalonia` içeriyor (ya da `.Result`/`.Wait()` Avalonia dosyasında). Core'un hook ve script'leri electron import etmez → asla eşleşmez. Ayrıca scan zaten `teknesyum-ui.json` olmayan projeye girmez; Core'da o dosya yok. İki katman yeter, üçüncüsü (allowlist) gereksiz.

**Renderer için ikinci küçük kural:** `ipcRenderer.sendSync` yasak (`invoke` kullan). Tek satır regex.

**İtirazım:** Issue'daki (c) "referans kod"u üç yığın için birden yazmak ~600 satır; **ilk hali yalnız Electron** (Asistan'ın gerçek ihtiyacı), Avalonia sürümü VidShrink'ten kopyalanır, WinForms sürümü zaten `kur-usb.ps1`'de var. En küçük hal: 1 kural + 5 satır SKILL + Electron `senkron-rozet.js`.

## 2. Issue #2 — Standart paneller, yığın, USB anahtarı

### Nerede yaşasın

**Karar:** Kod **Teknesyum-UI/templates/**, tercih cümlesi **pp/ui.md'ye 2 satır**, üretim **scaffold.js hedefi**. Üçü birlikte; tek yer değil.

| Şey | Yer | Neden pp değil |
| --- | --- | --- |
| Üst çubuk (logo + Vurgu + dil/⚙ + sponsor + Teknesyum + pencere düğmeleri + 1 px neon çizgi) | `templates/ustcubuk/{avalonia.axaml, react.tsx+css}` | pp 8 KB tavanlı md; bir `.axaml` + `.tsx` bunu doldurur, üstelik pp her `pp` turunda bağlama girer — kodun bağlama girmesi para |
| Kurulum penceresi | `templates/kur/{Kur.bat, kur.ps1}` + `{{ADIMLAR}}` yeri | Aynı |
| Tercih | `private/tercihler/ui.md`: "Her program standart üst çubuk + Kur penceresi taşır; `scaffold.js ustcubuk\|kur`" | pp'nin işi *ne istediğini* söylemek, kodu değil |
| Üretim | `scaffold.js kur <ad>` → 2 dosya kopyalar, proje adı/simge doldurur | A sınıfı, yalnız çağrılınca |

Teknesyum-UI özel depo değilse imza/sponsor herkese açık olur; bu zaten imza, sakınca yok. Sponsor URL'i token dosyasına değil `teknesyum-ui.json`'a (proje başına).

### Yığın

**Karar: iki yığın, üçüncü yok. Electron dondurulur.**

| Ölçüt | Electron | Tauri 2 + React | Avalonia 11 |
| --- | --- | --- | --- |
| Hız / boyut | 150+ MB, yavaş açılış | 5–10 MB, hızlı | 30 MB, hızlı |
| 3 platform | ✓ | ✓ (webview farkları: Linux WebKitGTK) | ✓ (Skia, her yerde piksel aynı) |
| Animatif görsellik | CSS/Framer | CSS/Framer | Avalonia Animations + Lottie; CSS'ten daha az kaynak |
| Token uyumu | `neon.tokens.json` → CSS doğrudan | aynı | JSON → `ResourceDictionary` çevirici gerek (~40 satır, bir kez) |
| scan.js | çalışır | çalışır | HTML/CSS kuralları işlemez, ayrı kural seti |
| Sizde bugün | Asistan, Quizloop | CodeXray | VidShrink |

- **Yeni web-arayüzlü program → Tauri 2 + React.** Electron'un yerini alır: aynı React bilgisi, aynı token CSS'i, aynı üst çubuk `.tsx`'i; 10 kat küçük, açılış hızlı. Electron'un tek üstünlüğü Node erişimi; Tauri'de `sidecar`/Rust komutu ile karşılanır.
- **Medya/ağır yerel iş, tutarlı piksel → Avalonia.** VidShrink zaten orada; üst çubuk `.axaml` şablonu ondan çıkar.
- **Asistan ve Quizloop Electron'da kalır**; göç yok, yalnız async düzeltmesi. Göç ~2 gün/proje, kazanç görünmez.

Tek yığın istiyorsan **Tauri**; ama VidShrink'i taşımak anlamsız. İki yığın gerçekçi olan.

### USB deploy anahtarı ve sil-kur

**Karar:** anahtar USB'de kalır ama **çubuk başına ayrı anahtar** + kurulumda `%USERPROFILE%\.ssh`'ye kopyalanıp USB'den silinmez (prova hariç). Kayıp → GitHub'da o tek anahtarı sil, diğer kurulumlar çalışır. `usb-01`, `usb-02` adlandırması; `private/depo.md`'de liste. Maliyet Z. Fine-grained PAT alternatifi daha güvenli değil, sadece daha zahmetli.

**"Her güncellemede sil-kur": hayır.** Pencere üç durum içindir: ilk kurulum, `--onar` (bozuk klon/node_modules), sürüm atlama (senkron pull çözemezse). Günlük güncelleme `senkron.js`'in işi; issue'daki "pull → kod değiştiyse yeniden başlat" zaten sil-kur'un yaptığını 0 kesintiyle yapıyor. Pencereye "Onar" düğmesi eklenir, sil-kur mantığı `--onar` bayrağının arkasına alınır.

**En küçük hal (Issue #2):** `templates/kur/` (Asistan'daki dosyanın adımları `{{ADIMLAR}}` olmuş hali) + `templates/ustcubuk/react.tsx` + `scaffold.js`'e 2 hedef + pp/ui.md 2 satır. Avalonia üst çubuk şablonu VidShrink'ten sonraki bir işte.

## 3. preread.md / postread.md

**Karar: preread kurulsun (`.claude/sonra.md` adıyla), postread kurulmasın.**

### Çakışma tablosu

| Sistem | Kim yazar | Ömür | Ne zaman okunur | Maliyet |
| --- | --- | --- | --- | --- |
| YOL-HARITASI.md | sahip | kalıcı | kural: her tur başı | C (model okursa) |
| plan.md | model+sahip | iş boyu | SessionStart tek satır | B |
| handoff.md | hook | oturum→oturum | SessionEnd yazar, sonraki oturum okur | B |
| MEMORY.md | model | kalıcı | her oturum indeks | B |
| **sonra.md** | **model** | **bir tur** | **sonraki prompt, otomatik, sonra taşınır** | **A** |

Çakışma yok: bu, modelin **kendi kısa vadeli kuyruğu**. Yol haritası sahibin isteği ve kalıcıdır; sonra.md "bu turda yapmadığım 3 iş" ve bir kez okununca biter. Değeri gerçek: bugün ertelenen iş ya plan.md'ye girer (fazla ağır) ya unutulur.

### Postread neden hayır

- Modelin durmadan önce okuyacağı şeyi **aynı turda kendisi yazdı**; okumanın bilgi değeri sıfır.
- Stop kancasında bağlama metin koymanın tek yolu `block`; yani postread = "kuyruk boşalana kadar durma" makinesi. `stop_hook_active` bir kez keser, ama o bir kez bile `dur.js` kanıt kapısıyla çakışır (iki kanca aynı turda kim önce blokluyor?).
- Sahibin istediği "unutmamak"; bunu preread tek başına verir.

### En küçük hal

`mod.js`'e (UserPromptSubmit) 6 satır:
1. `.claude/sonra.md` var ve boyut > 0 mı? Yoksa çık (0 bayt, 0 ms).
2. Varsa içeriği `additionalContext`'e "**Önceki turdan sonraya bırakılanlar:**" başlığıyla koy.
3. Dosyayı silme, **`trash/sonra-<ts>.md`'ye taşı** (sahibin trash kuralı; turu Ctrl+C keserse liste kurtarılır).

Model tarafı: SKILL/yordam'a bir cümle — "Bir işi ertelediysen `.claude/sonra.md`'ye madde ekle."

### Riskler ve cevapları

| Risk | Cevap |
| --- | --- |
| Stop blok döngüsü | Postread yok, Stop kancasına dokunulmuyor → risk yok |
| Dosya silme zamanı | İçerik bağlama girdikten sonra taşınır; taşıma silme değil |
| Aynı projede iki oturum | Hangi oturum önce prompt verirse o alır. Kabul edilir: madde zaten proje işi, oturum işi değil. Oturuma bağlamak (session_id ekli ad) yeni oturumun devralmasını bozar; yapma |
| Model unutup yazmaz | Yordam cümlesi + `handoff.js`'in SessionEnd'de sonra.md boş değilse handoff'a "sonra.md dolu" satırı eklemesi (1 satır) |
| Sahip görmez | `trash/` izi var; statusline'a "S" rozeti isteğe bağlı, sonraya |

**Maliyet sınıfı:** A. Boşken sıfır bayt; doluyken yalnız o turda o metin.

## Özet karar

| # | Karar | Sınıf | İlk iş |
| --- | --- | --- | --- |
| 1 | İlke+kural+şablon Teknesyum-UI'de; kural "electron/tauri import eden dosyada senkron süreç" | Z | 1 regex + 5 satır SKILL + Electron rozet |
| 2 | Kod Teknesyum-UI templates, tercih pp 2 satır, `scaffold.js kur\|ustcubuk`; yeni iş Tauri, yerel iş Avalonia, Electron donuk; anahtar çubuk başına; sil-kur → `--onar` | Z/A | `templates/kur` + `react.tsx` |
| 3 | Yalnız preread, adı `.claude/sonra.md`, mod.js'e 6 satır, trash'e taşı; postread yok | A | mod.js |
