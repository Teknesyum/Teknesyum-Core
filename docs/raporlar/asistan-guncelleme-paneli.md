# Asistan — Güncelleme Özelliği ve Paneli İncelemesi

Kaynak proje: `C:\Users\Administrator\Desktop\Projeler\!Tamamlandı\Asistan`
(iki bağımsız Electron uygulaması: `Görevlendirme\` ve `Nöbet\`, neredeyse birebir aynı iskelet)

Amaç: bu tekniğin başka projelerde nasıl yeniden kurulacağını çıkarmak. Bulunamayan
her şey açıkça "bulamadım" olarak işaretlenmiştir, hiçbir sayı/renk uydurulmamıştır.

## 1. Özet tablo

| Soru | Bulgu |
|---|---|
| Electron mu? | Evet — `devDependencies: { "electron": "^44.2.0" }` |
| electron-updater / electron-builder? | **Yok.** package.json'da `build`/`publish` alanı yok, `electron-builder.yml`, `dev-app-update.yml` gibi dosyalar bulunamadı |
| Güncelleme kaynağı | GitHub release/manifest değil — **git repo'nun kendisi**: `git@github.com:Teknesyum/Asistan.git` |
| Sürüm bilgisi kaynağı | `package.json.version` değil — **git commit HEAD hash'i** (`git rev-parse HEAD`) |
| İmza/hash doğrulama | **Yok** (git'in kendi pack bütünlüğü dışında ayrı bir adım yok) |
| İlerleme yüzdesi/hız/byte göstergesi | **Yok** |
| Release notes / changelog gösterimi | **Yok**, markdown render kütüphanesi de yok |
| Ayrı güncelleme penceresi/modalı | **Yok** — tek `BrowserWindow`, başlık çubuğunda küçük gösterge |
| Tema desteği | Yalnızca koyu (dark); açık tema **yok** |
| Zorunlu/isteğe bağlı güncelleme ayrımı | Kod güncellemesi her zaman **zorunlu** ve otomatik (kullanıcı onayı yok) |

## 2. Dosyalar ve sorumlulukları

| Dosya (tam yol) | Rol | Ana fonksiyonlar |
|---|---|---|
| `...\Asistan\Görevlendirme\senkron.js` | Git tabanlı senkron/güncelleme motoru | `surum()` (61-64), `cekIc()` (81-100), `esitleIc()` (114-121), `gonderIc()` (123-128), `izle()` (148-151), `arkadaGonder()` (157-163), `depoVar()` (50-52), `degisenler()` (66-70) |
| `...\Asistan\Görevlendirme\main.js` | Electron main süreç, açılış kontrolü, IPC, relaunch | `app.whenReady()` bloğu (67-77), `senkron.izle(60000, ...)` (105-111), `before-quit` handler (116-120), `ipcMain.handle("senkron:durum"/"senkron:simdi", ...)` (101-102) |
| `...\Asistan\Görevlendirme\preload.js` | IPC köprüsü (contextBridge) | `senkron: { durum, simdi, olay }` |
| `...\Asistan\Görevlendirme\arayuz.html` | Panel/renderer UI | `senkronBagla()` (2244-2265), `toast()` (942-945) |
| `...\Asistan\Görevlendirme\app.css` | Panel bileşeni stili | `.basbar-senk` kuralları (77-100) |
| `...\Asistan\Görevlendirme\teknesyum-ui\css\theme.css` | Ortak tema token'ları | renk/ölçü/geçiş değişkenleri |
| `...\Asistan\Görevlendirme\package.json` | Bağımlılık/versiyon alanı (kullanılmıyor) | — |
| `...\Asistan\kur-usb.ps1` | USB/kurulum aracı, repo URL sabiti | satır 43, 74 |
| `...\Asistan\Nöbet\*` | Aynı yapının birebir kopyası | `ARAC`/`IZLENEN` sabitleri "Nöbet" olarak değişmiş |

`Nöbet` klasöründeki dosyalar işlevsel olarak birebir aynı; farklar yalnızca ürün adı,
klasör/dosya adları ve pencere başlığıdır.

## 3. package.json

`Görevlendirme\package.json`:
```json
{
  "name": "asistan-gorevlendirme",
  "version": "1.0.0",
  "private": true,
  "description": "Aylik nobet ve izin listesinden zorunlu yerlere asistan gorevlendirme",
  "main": "main.js",
  "scripts": { "start": "electron ." },
  "devDependencies": { "electron": "^44.2.0" }
}
```
`"version"` alanı hiçbir yerde runtime'da okunmuyor/gösterilmiyor. `build`, `publish`,
`electron-updater`, `electron-builder` anahtarları **yok**.

## 4. Sürüm ve kaynak: git tabanlı yaklaşım

`senkron.js` üstünde `KOK = path.resolve(__dirname, "..")` (repo kökü), izlenen kod
dosyaları:

```js
IZLENEN = [
  "Görevlendirme/main.js", "Görevlendirme/preload.js", "Görevlendirme/arayuz.html",
  "Görevlendirme/app.css", "Görevlendirme/package.json", "Görevlendirme/gorevlendir.py",
  "Görevlendirme/senkron.js"
]
```

Git binary'si önce taşınabilir `.araclar/git/cmd/git.exe`, yoksa sistem `git` kullanılıyor.

Sürüm okuma (satır 61-64):
```js
async function surum() {
  const r = await gitSessiz(["rev-parse", "HEAD"]);
  ...
}
```
Yani "sürüm" bir GitHub Releases API'sinden değil, doğrudan **git commit HEAD hash'inden**
okunuyor. Repo: `git@github.com:Teknesyum/Asistan.git` (kur-usb.ps1 satır 43) veya https
fallback `https://github.com/Teknesyum/Asistan.git` (satır 74).

## 5. Akış

**Tetiklenme noktaları** (`main.js`):
- Açılışta (67-77): `app.whenReady().then(async () => { const g = await senkron.cek(); if (g.ok && g.kodDegisti) { ... app.relaunch(); app.exit(0); } })`
- Periyodik (105): `senkron.izle(60000, r => {...})` → `izle()` içinde `setInterval(esitle, ms || 60000)` (senkron.js 148-151) — **60 saniyede bir**
- Manuel: başlık çubuğundaki göstergeye tıklama → `arayuz.html` 2263: `e.onclick = () => { goster({ asama: "esitleniyor" }); S.simdi(); };` → preload → `ipcMain.handle("senkron:simdi", ...)` (main.js 101-102)

**Çekme (indirme) — klasik "download progress" yok, `git pull` var** (`cekIc()`, senkron.js 81-100):
```js
const r = await gitSessiz(["pull", "--no-rebase", "--no-edit", "-X", "ours", "origin", "HEAD"], { timeout: 45000 });
```
Ardından `degisenler(once, await surum())` ile HEAD öncesi/sonrası `git diff --name-only`
karşılaştırılıyor:
```js
kodDegisti = list.some(f => IZLENEN.includes(f));
veriDegisti = list.some(f => f.startsWith(ARAC + "/veri/"));
```

**İmza/hash doğrulama: yok.** Git'in kendi pack bütünlük kontrolü dışında ayrı bir kod
imzası/checksum adımı bulunamadı. SSH anahtarı (`.kurulum/anahtar/id_ed25519`) erişim
yetkisi sağlar, içerik bütünlüğü doğrulaması değildir.

**Kurulum/restart** (main.js 105-111):
```js
senkron.izle(60000, r => {
  if (!r || !r.ok || w.isDestroyed()) return;
  if (r.kodDegisti) {
    w.webContents.send("senkron:olay", { tur: "kod" });
    setTimeout(() => { app.relaunch(); app.exit(0); }, 2500);
  } else if (r.veriDegisti) w.webContents.send("senkron:olay", { tur: "veri" });
});
```
Kod değişikliği algılanınca renderer'a "kod" olayı gidiyor, **2.5 saniye sonra**
`app.relaunch()` + `app.exit(0)` çağrılıyor. Ayrı bir kurulum/paketleme adımı yok —
dosyalar zaten `git pull` ile diskte güncellenmiş durumda; "kurulum" == restart.

**Hata / çevrimdışı** (cekIc(), 88-92):
```js
if (!r.ok) {
  not("çekme başarısız: " + r.cikti.split("\n").slice(-2).join(" "));
  await gitSessiz(["merge", "--abort"]);
  durumYaz("cevrimdisi", r.cikti.split("\n").slice(-1)[0]);
  return { ok: false, kodDegisti: false, veriDegisti: false, sebep: r.cikti };
}
```
Merge çakışması/ağ hatasında `merge --abort` ile geri alınıp `"cevrimdisi"` durumuna
geçiliyor. `esitleIc()` (114-121) ve `gonderIc()` (123-128) seviyesinde de try/catch var.
Repo hiç yoksa (`depoVar()` false, 50-52) durum `"yerel"` (yalnız bu bilgisayar).

**Yarıda kesilme**: Özel bir "resume/kaldığı yerden devam" mantığı **bulamadım**.
`git pull` 45000 ms timeout ile sınırlı; işlem kapatılırsa git'in atomikliğine (ya tam
pull ya hiç) ve sonraki açılışta yeniden denemeye bırakılıyor. Kapanışta ayrıca:
```js
app.on("before-quit", () => {
  if (cikisSenkronu) return;
  cikisSenkronu = true;
  try { senkron.arkadaGonder(); } catch (e) {}
});
```
`arkadaGonder()` (157-163) ayrı bir arka-plan node process'i fork ederek kapanış
sırasında yerel veri değişikliklerini push etmeyi dener (best-effort, garanti yok).

**Çakışma stratejisi**: `yerelKaydet()` (72-79) yalnızca `<Araç>/veri` klasörünü
commit'liyor; pull'da `-X ours` stratejisi kullanılıyor — yerel veri, gelen kodla
çakışırsa yerel kazanıyor.

## 6. Panel (UI) — durumlar ve state metni

Vanilla JS + tek `arayuz.html`, React/Vue yok. Durum makinesi enum/union type değil,
düz obje eşlemesi.

`arayuz.html` 2244-2265, `senkronBagla()`:
```js
function senkronBagla() {
  const S = window.pencere && window.pencere.senkron;
  const e = $("#basbarSenk");
  if (!S || !e) return;
  const saat = t => t ? new Date(t).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) : "";
  const METIN = { bekliyor: "Bağlanıyor…", esitleniyor: "Eşitleniyor…", esitlendi: "Eşitlendi", cevrimdisi: "Çevrimdışı", yerel: "Yalnız bu bilgisayar" };
  const goster = d => {
    if (!d) return;
    const a = METIN[d.asama] ? d.asama : "bekliyor";
    e.dataset.durum = a;
    e.textContent = METIN[a] + ((a === "esitlendi" || a === "cevrimdisi") && d.zaman ? " · " + saat(d.zaman) : "");
    e.title = (d.hata ? d.hata + "\n" : "") + "Tıkla: şimdi eşitle";
  };
  S.durum().then(goster).catch(() => {});
  if (S.olay) S.olay(d => {
    if (d.tur === "durum") goster(d.durum);
    else if (d.tur === "veri") { try { sessionStorage.setItem("senkBildirim", "Başka bilgisayardaki değişiklikler geldi"); } catch (_) {} location.reload(); }
    else if (d.tur === "kod") toast("Yeni sürüm geldi, program yenileniyor…");
  });
  e.onclick = () => { goster({ asama: "esitleniyor" }); S.simdi(); };
  try { const m = sessionStorage.getItem("senkBildirim"); if (m) { sessionStorage.removeItem("senkBildirim"); setTimeout(() => toast(m), 400); } } catch (_) {}
}
```

**Durum kümesi** (senkron.js 20-27'de `durumBilgi.asama` olarak yazılıyor):
`bekliyor`, `esitleniyor`, `esitlendi`, `cevrimdisi`, `yerel`.

Klasik electron-updater durumlarıyla (`checking/available/downloading/downloaded/error/
up-to-date`) birebir örtüşmüyor; en yakın karşılıklar:

| Asistan durumu | electron-updater karşılığı |
|---|---|
| `esitleniyor` | checking + downloading (birleşik) |
| `esitlendi` | up-to-date / updated |
| `cevrimdisi` | error |
| `yerel` | update devre dışı |
| `bekliyor` | idle/başlangıç |

**İlerleme yüzdesi/hız/kalan süre/byte: yok.** Sadece renkli nokta + metin gösterimi
var, `d.tur` alanı `"durum" | "veri" | "kod"` olayları taşıyor.

Toast (942-945):
```js
function toast(m) {
  const t = $("#toast"); t.textContent = m; t.dataset.acik = "1";
  ...
}
```
Kod güncellemesinde: `"Yeni sürüm geldi, program yenileniyor…"` (2261).
Veri güncellemesinde: `"Başka bilgisayardaki değişiklikler geldi"` (2260), sayfa
`location.reload()` ile yenileniyor.

## 7. Release notes / changelog

**Bulamadım.** Ne `Görevlendirme` ne `Nöbet` içinde release notes/changelog gösteren
bir alan var, ne markdown render kütüphanesi (react-markdown, marked, showdown vb.)
import edilmiş. UI'daki tüm metinler sabit Türkçe string'ler.

## 8. Görsel teknik (CSS)

Panel bileşeni tamamen ortak tema token'larına (`var(--tk-*)`) bağlı; kendi başına ham
değer yok. Token'lar: `...\Asistan\Görevlendirme\teknesyum-ui\css\theme.css`.

`app.css` 77-100, `.basbar-senk`:
```css
.basbar-senk {
  display: inline-flex;
  align-items: center;
  gap: var(--tk-sp-2);
  font-size: var(--tk-fs-1);
  line-height: var(--tk-lh-heading);
  color: var(--tk-text-label);
  cursor: pointer;
  -webkit-app-region: no-drag;
  transition: color var(--tk-t-base) var(--tk-e-out);
}
.basbar-senk:empty { display: none; }
.basbar-senk::before {
  content: "";
  width: var(--tk-sp-2);
  height: var(--tk-sp-2);
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 var(--tk-sp-2) currentColor;
}
.basbar-senk[data-durum="esitlendi"] { color: var(--tk-success); }
.basbar-senk[data-durum="cevrimdisi"] { color: var(--tk-warning); }
.basbar-senk[data-durum="yerel"] { color: var(--tk-disabled); }
.basbar-senk[data-durum="esitleniyor"]::before { box-shadow: none; }
```
`esitleniyor` durumu için ayrı bir renk tanımlanmamış (varsayılan `--tk-text-label`
kalıyor); yalnızca glow (`box-shadow`) kapatılarak "aktif ama nötr" görsel durum elde
edilmiş.

Token gerçek değerleri (`theme.css`, satır numaraları o dosyaya göre):
```css
481  --tk-blue: #00f3ff;
482  --tk-pink: #ff00ea;
483  --tk-purple: #b026ff;
484  --tk-success: #34d399;
487  --tk-bg-from: #000000;
488  --tk-bg-to: #08090a;
505  --tk-pink-text: #ff54eb;
506  --tk-purple-text: #c67eff;
547  --tk-warning: #fbbf24;
548  --tk-warning-border: rgba(251, 191, 36, 0.5);
557  --tk-disabled: #71717a;
577  --tk-fs-1: 14px;
601  --tk-sp-2: 8px;
602  --tk-sp-3: 12px;
614  --tk-r-window: 12px;
615  --tk-border-w: 1px;
654  --tk-t-instant: 90ms;
656  --tk-t-base: 240ms;
658  --tk-e-out: cubic-bezier(0.2, 0, 0, 1);
```
`--tk-danger`, satır 522 civarında `var(--tk-pink)`'e bağlanmış (ayrı bir "danger" rengi
bilinçli olarak tanımlanmamış — dosyadaki yorum: "no counterpart in the brand triad").

**Tema desteği**: yalnızca koyu (dark) — `theme.tokens.json` içinde `"palette": { "dark": true }`.
Açık tema token'ı veya `prefers-color-scheme` medya sorgusu **bulunamadı**.

**Modal mı, ayrı pencere mi**: Ayrı güncelleme penceresi/modalı **yok**. Gösterge, ana
pencerenin başlık çubuğunda (`<span class="basbar-senk" id="basbarSenk">`, arayuz.html
satır 20) küçük bir metin+nokta elemanı. Ana `BrowserWindow` tek pencere
(`main.js` 33-61, `frame: false, transparent: true`); ayrı bir update `BrowserWindow`
oluşturulmuyor.

## 9. Kullanıcıyı boş bırakmama teknikleri

| Teknik | Durum | Kanıt |
|---|---|---|
| Skeleton/shimmer | Panelde yok. (Ayrı bir PowerShell/WinForms kurulum aracında — `kur-usb.ps1` — ilerleme çubuğunda "sweep" adlı hareketli parlaklık efekti var, ama bu Electron UI'sı değil) | — |
| İptal butonu | Yok | `esitleniyor` durumunda kullanıcı işlemi durduramıyor |
| Arka planda indirip sonra bildirme | Kısmen var | `izle(60000, ...)` arka planda otomatik çalışıyor; kod değişince toast + 2.5 sn sonra otomatik relaunch |
| Zorunlu/isteğe bağlı ayrım | Yok — kod güncellemesi her zaman zorunlu | main.js 107-109: `setTimeout(() => { app.relaunch(); app.exit(0); }, 2500);` içinde onay/erteleme kontrolü yok |

Veri güncellemesi (`veriDegisti`) daha yumuşak: sadece `location.reload()` (arayuz.html 2260),
restart gerektirmiyor.

## 10. Yeniden kullanılabilirlik

**Projeye özel (hardcoded):**
- Repo URL: `git@github.com:Teknesyum/Asistan.git` / `https://github.com/Teknesyum/Asistan.git` (kur-usb.ps1 43, 74)
- `IZLENEN` dizisi ve `ARAC` sabiti (klasör/dosya adları: `Görevlendirme`/`Nöbet`, `gorevlendir.py`/`nobet.py`)
- Pencere başlığı (`main.js` 45), `simge.ico`, kısayol adları
- Marka renkleri (`--tk-blue #00f3ff`, `--tk-pink #ff00ea`, `--tk-purple #b026ff` — "neon" template)
- SSH anahtar yolu ve GitHub organizasyonu (`.kurulum/anahtar/id_ed25519`, `Teknesyum` org)
- Türkçe UI metinleri (durum yazıları, toast mesajları)

**Şablona çıkarılabilir (jenerik):**
- `senkron.js`'in tüm mimarisi (git pull/push tabanlı iki yönlü senkron); `IZLENEN`/`ARAC`
  parametrize edilerek doğrudan taşınabilir — zaten `Görevlendirme` ve `Nöbet` arasında
  neredeyse birebir kopya olarak kullanılmış, kanıtlanmış bir pattern.
- `preload.js`'deki `senkron: { durum, simdi, olay }` IPC arayüzü — genel amaçlı.
- `app.css`'teki `.basbar-senk` bileşeni — tamamen `--tk-*` token'larına bağlı,
  `teknesyum-ui` ortak tema sistemi zaten çoklu-proje kullanımı için tasarlanmış.
- `senkronBagla()`'daki `METIN` state-metin eşlemesi — pattern jenerik, sadece metinler
  Türkçe.

**Dışarı alınması gereken ayarlar** (şablonlaştırırken parametre yapılacaklar):
repo URL/SSH anahtarı, `IZLENEN` dosya listesi, `ARAC` (proje klasör adı), periyodik
kontrol süresi (`60000` ms sabiti), relaunch gecikmesi (`2500` ms sabiti), merge
stratejisi (`-X ours`), veri klasörü yolu (`<ARAC>/veri`).

## 11. Bulunamayanlar — net liste

- electron-updater / electron-builder yapılandırması: yok
- İmza/hash doğrulama (kod bütünlüğü): yok
- İndirme ilerleme yüzdesi/hız/byte göstergesi (uygulama içi panelde): yok
- İptal butonu: yok
- Release notes/changelog gösterimi ve markdown render kütüphanesi: yok
- Açık (light) tema: yok
- Ayrı update penceresi (BrowserWindow): yok
- Yarıda-kesilme için özel "resume" mantığı: yok (git atomikliğine ve sonraki açılışta
  yeniden denemeye dayanıyor)

---

# Düzeltme ve tamamlama (2026-09-13, birinci elden okuma)

Yukarıdaki raporun "zengin bir güncelleme paneli yok, yalnızca başlık çubuğunda nokta var"
sonucu **yanlıştır**. Alt ajan Electron tarafına baktı, kurulum/güncelleme penceresini
gözden kaçırdı. Şık panel `Asistan\kur-usb.ps1` içindedir: 343 satırlık, WinForms ile
elle çizilen bir kurulum/güncelleme penceresi. Aşağıdaki her değer dosyadan okunmuştur.

## A. İki ayrı kanal

Asistan'da güncelleme iki yerden yürür ve ikisi birbirinin yerine geçmez:

| Kanal | Dosya | Ne zaman | Görsel |
| --- | --- | --- | --- |
| Kurulum / sil-baştan-kur | `kur-usb.ps1` | USB'den kurulum, onarım | Tam ekranlık özel pencere (aşağıda) |
| Günlük güncelleme | `Görevlendirme\senkron.js` + `arayuz.html` | Program açıkken, 60 sn'de bir | Başlık çubuğunda nokta + metin, gerekirse toast |

## B. Kurulum penceresinin tekniği (`kur-usb.ps1`)

**İskelet.** `System.Windows.Forms` + `System.Drawing`, `EnableVisualStyles()`.
Pencere `FormBorderStyle = "None"`, `StartPosition = "CenterScreen"`,
`ClientSize = 560 x 424`, `DoubleBuffered` reflection ile açılıyor, `KeyPreview = $true`.
Kenarlıksız olduğu için sürükleme elle: `MouseDown/MouseMove/MouseUp` ile `$G.surukle`.

**İş ile arayüzün ayrılması.** Asıl kurulum `$is` scriptblock'u; ayrı bir
`[runspacefactory]::CreateRunspace()` (ApartmentState `STA`) içinde `BeginInvoke` ile
koşuyor, arayüz hiç donmuyor. İkisi arasındaki tek köprü
`[hashtable]::Synchronized(@{...})` — `$S`:

```
kaynak, hedef, gunluk, yuzde, tavan, adim, log, durum, cevrimdisi, prova
```

`durum` üç değer alır: `calisiyor`, `bitti`, `hata`.

**Adım sözleşmesi.** İş tarafı tek fonksiyonla konuşur:

```powershell
function Adim([int]$y, [int]$t, [string]$m) { $S.yuzde = $y; $S.tavan = $t; $S.adim = $m; Yaz $m }
```

`$y` şu anki yüzde, `$t` o adımın **tavanı**, `$m` kullanıcıya görünen cümle. Tavan fikri
tekniğin kalbi: bir adım ne kadar süreceğini bilmez, ama nereye kadar dolabileceğini bilir.
Çubuk `$y`'ye hızla gider, sonra `$t`'ye doğru çok yavaş sürünür — yani iş uzasa bile
çubuk yaşamaya devam eder, ama bir sonraki adımın alanına girmez.

Dosyadaki gerçek adım dizisi:

```
2→6    Git hazırlanıyor
6→12   GitHub bağlantısı sınanıyor
12→16  Eski kurulum aranıyor
16→24  Eski sürüm kaldırılıyor ($sira/$($adaylar.Count))
24→52  Güncel sürüm GitHub'dan indiriliyor   (çevrimdışıysa: USB'deki sürüm kopyalanıyor)
52→56  Erişim anahtarı yerleştiriliyor
56→76  Taşınabilir Git kuruluyor
76→92  Program motoru kopyalanıyor
92→97  Masaüstü kısayolları yazılıyor
100    Kurulum tamamlandı · sürüm $surum
```

Hata yolunda `$S.adim = "Kurulum yarıda kaldı: " + $_` ve `$S.durum = "hata"`.

**Renkler ve yazılar** (dosyadaki değerler, uydurma yok):

```
zemin #08090a · metin #ffffff · mavi #00f3ff · mor #b026ff
basari #34d399 · tehlike #ff54eb · sonuk #71717a
kenar  #00f3ff @128 alfa · iz #00f3ff @77 alfa
```

```
baslik  Segoe UI 24 Bold · adim Segoe UI 16 · kucuk Segoe UI 14
log     Consolas 14      · dugme Segoe UI 14 Bold   (hepsi GraphicsUnit::Pixel)
```

**Çizim (`Add_Paint`).** `SmoothingMode = AntiAlias`, `TextRenderingHint = ClearTypeGridFit`.

- 1 px'lik `kenar` rengi çerçeve.
- Simge `Görevlendirme\simge.ico`'dan 64×64 bitmap, 24,24 noktasına 48×48 çizilir.
- Ad iki renkli: "Asistan" beyaz, hemen yanına `MeasureString` ile ölçülüp 4 px içeri
  kaydırılmış "Kurulum" mavi. (Üst çubuk standardındaki iki renkli ad ile aynı fikir.)
- Altına `sonuk` renkte "Görevlendirme ve Nöbet · <hedef yol>".
- Adım cümlesi 24,100'de; rengi duruma bağlı (`bitti`→basari, `hata`→tehlike, yoksa metin).
  `StringFormat` ile `Trimming = EllipsisCharacter`, `FormatFlags = NoWrap` — uzun cümle
  taşmaz, üç nokta olur.
- Yüzde aynı hizada sağa dayalı, mavi.
- Çubuk: 24,132, genişlik `w-48`, yükseklik 8. Zemin `iz` (mavi @77). Dolu kısım
  çalışırken `LinearGradientBrush(mavi → mor)`, bittiğinde/hata durumunda düz durum rengi.
- Parıltı: dolu dikdörtgenin üstüne 3 kez, `40/i` alfa ile taşan dikdörtgen çizilerek
  neon "glow" elde ediliyor — ayrı bir görsel dosya yok.
- Tarama ışığı: yalnız `calisiyor` iken, 120 px genişlikte beyaz `ColorBlend`
  (0 → 150 alfa → 0) dolu kısmın içinde `SetClip` ile kırpılarak soldan sağa geçiyor.
  Konum `$G.faz % 1.0` ile sürüyor.
- Günlük: 160'tan başlayarak **son 9 satır**, 20 px aralık; son satır mavi, öncekiler
  `sonuk`. Aynı `StringFormat` ile kırpılıyor.

**Yumuşatma (`System.Windows.Forms.Timer`, `Interval = 16` yani ~60 fps).**

```powershell
if ($G.goster -lt $hy) { $G.goster = [math]::Min($hy, $G.goster + [math]::Max(0.2, ($hy - $G.goster) * 0.08)) }
elseif ($S.durum -eq "calisiyor" -and $G.goster -lt ($S.tavan - 0.5)) { $G.goster += ($S.tavan - $G.goster) * 0.006 }
$G.faz += 0.012
```

Yani: gerçek yüzdeye 0.08 oranında yaklaş (en az 0.2 adımla), gerçek yüzde durursa tavana
0.006 oranında sürün. Ekrandaki sayı hiçbir zaman geri gitmez ve hiçbir zaman donmaz.

**Düğmeler.** 160×36, `FlatStyle = Flat`, `Cursor = Hand`, y = 364. Birincil: zemin mavi,
yazı koyu, kenar yok. İkincil: zemin koyu, yazı ve kenar mavi. Hepsi `Visible = $false`
başlar; iş bitince zamanlayıcı tek seferlik (`$G.sonlandi`) açar:

- `bitti` → "Görevlendirme'yi Aç" + "Nöbet'i Aç" + "Kapat", odak ilk düğmede
- `hata` → "Günlüğü Aç" (notepad ile `%LOCALAPPDATA%\Asistan\kurulum.log`) + "Kapat"

**Kaçış yok.** `Escape` yalnız iş bittiyse kapatır; `FormClosing` sırasında
`$S.durum -eq "calisiyor"` ise `$_.Cancel = $true`. Yarım kurulum kapatılamıyor.

**Prova kipi.** `ASISTAN_KUR_PROVA` ortam değişkeni → geçici klasöre kurar, kısayol
yazmaz, "Aç" düğmelerini göstermez. Panel bire bir aynı koşuyor.

## C. Günlük güncelleme tarafı (`senkron.js`)

Durum makinesi beş değerli: `bekliyor`, `esitleniyor`, `esitlendi`, `cevrimdisi`, `yerel`.
`durumYaz()` dinleyicilere yayar; `main.js` bunu `senkron:olay` ile pencereye geçirir.

Arayüz karşılıkları (`arayuz.html`):

```js
const METIN = { bekliyor: "Bağlanıyor…", esitleniyor: "Eşitleniyor…", esitlendi: "Eşitlendi",
                cevrimdisi: "Çevrimdışı", yerel: "Yalnız bu bilgisayar" };
```

`esitlendi` ve `cevrimdisi` metnin sonuna ` · HH:MM` ekliyor. `title` içinde varsa hata
metni, altında "Tıkla: şimdi eşitle". Rozete tıklamak elle eşitlemeyi başlatıyor ve anında
`esitleniyor`'a düşüyor.

Rozetin kendisi `.basbar-senk`: `::before` ile `--tk-sp-2` çapında yuvarlak nokta,
`background: currentColor` ve aynı renkte `box-shadow` ile parlıyor. Renk tokenlardan:
`esitlendi → --tk-success`, `cevrimdisi → --tk-warning`, `yerel → --tk-disabled`,
`esitleniyor` iken parıltı kapanıyor. Metin boşsa `:empty` ile rozet tümden kayboluyor.

Sonuç bildirimi üç biçimde:
- kod değiştiyse → `toast("Yeni sürüm geldi, program yenileniyor…")`, 2500 ms sonra
  `app.relaunch()`
- yalnız veri değiştiyse → `sessionStorage`'a not, `location.reload()`, açılışta 400 ms
  gecikmeyle `toast("Başka bilgisayardaki değişiklikler geldi")`
- hiçbiri → yalnız rozetin saati güncellenir

Açılışta `senkron.cek()` beklenir; kod değiştiyse pencere hiç açılmadan yeniden başlatılır.
Periyot `izle(60000)`. Günlük `not()` ile bellekte, en fazla 200 satır, `durum()` ile
arayüze veriliyor.

## D. Eksikler (Asistan'da yok)

İmza/hash doğrulaması, bayt/hız/kalan süre, sürüm notu gösterimi, iptal düğmesi, kaldığı
yerden devam, indirme ilerlemesi (git clone çıktısı yalnız günlüğe akıyor) yok.
