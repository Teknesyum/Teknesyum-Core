# Danışma: Issue #1, Issue #2 + standart iskelet, preread/postread (2026-09-11)

Sen fable'sın, karar ortağısın. Aşağıdaki üç konu için görüş ver: her biri için tek net öneri, gerekçesi, maliyet sınıfı (Z/A/B/C) ve en küçük uygulanabilir hali. Seçenek sayma değil karar ver; itirazın varsa açıkça söyle. Türkçe, madde ve tablo ağırlıklı, en fazla ~1500 kelime.

1. Issue #1 ilkesi Core'da mı Teknesyum-UI'de mi, hangi parçası nereye? scan.js senkron çağrı kuralı Core'un kendi CLI senkron çağrılarını yakalamayacak şekilde nasıl kapsamlansın?
2. Standart paneller (kurulum/güncelleme penceresi, VidShrink tarzı ince temalı üst çubuk + Teknesyum imzası + sponsor düğmesi) nerede yaşasın: özel raf (pp), Teknesyum-UI şablonu, scaffold.js hedefi ya da maliyeti 0 başka bir sistem? Programlar için hangi yığın (Electron, Avalonia, Tauri, başka): hızlı, 3 platform, animatif görsellik, sık kullanılan; tek yığın mı iki mi? USB'deki okuma-yazma deploy anahtarı ve 'her güncellemede sil-kur' için ne yapılsın?
3. preread.md / postread.md: değerli mi, yol haritası + plan + handoff + memory ile çakışıyor mu, 0 maliyetle nasıl kurulur, riskleri (Stop blok döngüsü, dosya silme zamanı, aynı projede iki oturum) neler; kurulsun mu, kurulacaksa en küçük hali ne?

Sahibin cümleleri aşağıda aynen duruyor; onları değiştirme.

# Olgular — üç danışma (2026-09-11)

## Sahibin cümleleri (aynen)

> issue 1 i fable incelesin en uygun önerdiğini yapalım

> issue 2 de de aynısı geçerli asistan projemizdeki güncelleme penceresi hoştu hem geri bildirim fazla hem görsel güzel bunun gibi bir standart güncelleme panelimizin olmasından veya programlarımızda bazı alanlarda aynı standart paneli kullanmaktan hoşlanıyorum örnek veriyim ince ve temali vidshrinkteki üst header barı teknesyum imzası ve sponsor tuşumuz vb bu alanlar hem imzamız olur hem hoş oluyor artık bunu private rafımıza mı eklersin başka maliyet 0 bi sistem mi düşünürsün fable a danış yap genellikle electron kullanıyoruz ancak hem hızlı olmak istiyoruz hem 3 platform desteklesin hem animatif görsellik desteklesin(hemde sık kullanalım) vb istiyoruz avolania mı kullanmalıyız vb bunları da fable bi danışalım programlarımızda standart bi iskelet olsun pp rafımızda bu bilgiler saklansın fikrindeyim

> bir fikrim daha: preread.md ve postread.md şeklinde iki dosyamız olacak ve normalde bunlar boş olacaklar input okunmadan önce eğer preread.md boş değilse önce preread okunacak (okunduktan sonra dosya silinecek) ve işlem başlıyacak post read içinde eos stop token geldiyse sonlandırılmadan hemen önce postread okunacak bunlar hook ile kontrol edildiğinden tüketim 0 olmalı diye tahmin ediyorum ne işe yarıyorlar örneğin bu yaptığım gibi kompleks farklı farklı işler verdim sen birine odaklanmak istiyorsun diğer 3 ünü bi sonraki inputun preread kısmına veya bu mesajın postread kısmına koydun bak şunu şunu yaptım şunlar sonraya saklandı bu şekilde sonraya saklanan hiç bişeyi unutmayacaksın ve pre post a yönlendirebileceğin bir memory in olacak bu sistemi de fable değerlendirisn

Maliyet kuralı (sahip bugün düzeltti): Core'a eklenen bir özellik **her turda** maliyet getiriyorsa
önce "mantıklı ama ~%X tüketim artışı, yine de ekleyelim mi" diye sorulur. Yalnız çağrılınca
ödenen şey sorulmadan yapılır. Maliyet sınıfları: Z (hiçbir şey yazmaz), A (yalnız çağrılınca),
B (oturum başına şema), C (her tur öder). Core yalnız Z ve A taşır.

## Issue #1 — "The Best Program Is The One That Shows It Is Working"

Asistan (Electron, özel nöbet çizelgesi uygulaması) donmaları: ana süreçte senkron `git pull/push`.
Çözüm async + görünür iş: başlık çubuğunda canlı senkron göstergesi (`Syncing…` → `Synced · 14:05`
→ `Offline`, tıkla-eşitle), başka makineden değişiklik gelince toast, markalı kurulum penceresi.
Önerilen beş ilke: UI thread'i asla bloklama; ~1 sn üstü her iş ilerleme gösterir (bar adım içinde
sürünür, adım adı görünür); arka plan durumu (senkron, güncelleme, bağlantı) hep görünür; sonuç
duyurulur (başarı kısa toast, hata insan cümlesi + log); kurulum ürünün parçasıdır.
Önerilen işler: (a) ilkeyi Core rehberine ekle, (b) UI süreçlerinde senkron süreç/IPC çağrısı
yakalayan kontrol ya da `scan.js` kuralı, (c) durum göstergesi ve ilerleme penceresi için referans
kod (Electron + PowerShell/WinForms).
Not: Core'un kendi 10 dosyası (hook'lar, CLI script'leri) `execFileSync/spawnSync` kullanıyor ve
orada doğru; kural körlemesine konursa bunları yakalar. Teknesyum-UI'nin `scan.js`'i 86 kural taşıyor.

## Issue #2 — Her projeye standart kurulum/güncelleme penceresi

Referans `Teknesyum/Asistan` (`kur-usb.ps1` + `Kur.bat`, bu makinede klon yok):
- `Kur.bat` tek satır: gizli PowerShell 5.1, `-STA`, konsol görünmez.
- WinForms, bağımlılıksız, 560×424 çerçevesiz sürüklenebilir pencere; uygulama simgesi + başlık.
  UI STA thread'de, iş arka plan runspace'te, `[hashtable]::Synchronized` ile paylaşım. ~30 ms timer
  owner-drawn bar: mavi→mor gradyan, parıltı, **adım tavanı içinde yavaş sürünme** (bar donmuş
  görünmez). Canlı monospace log, en yeni satır vurgulu. İş sürerken kapanmaz. Bitişte sürüm +
  "Aç" düğmeleri, hatada kırmızı bar + "Log'u aç". Renkler yalnız `teknesyum-ui` token'ları.
- Akış: sistem git yoksa USB'deki taşınabilir git; özel repoya USB'deki **okuma-yazma deploy
  anahtarı** (`icacls` ile kilitli, `StrictHostKeyChecking=accept-new`); eski kurulumları bul
  (işaretçisiz git klonu = geliştirici kopyası, dokunma); her eskiyi durdur, veriyi yedekle,
  commit+push et, sil; `git clone`, çevrimdışıysa USB kopyası; `node_modules` robocopy; kısayol +
  `kurulum.json`; prova modu (TEMP'e kurar, silmez); tam log.
- Kurulum sonrası `senkron.js`: async git kuyruğu, açılışta ve 60 sn'de bir pull; kod değiştiyse
  kendini yeniden başlatır, veri değiştiyse UI'yi yeniler; değişiklikten ~5 sn sonra push.
- Tuzaklar: PS değişken adları büyük/küçük harf duyarsız (`$f`/`$F` çakıştı); `.ps1` BOM'lu UTF-8
  olmalı; native araçlarda `$ErrorActionPreference=Stop` kullanma; `core.sshCommand` içinde boşluklu
  yol kaçışı.
- Kabul: ortak şablon (ya da `scaffold.js` hedefi) `Kur.bat` + `kur-<x>.ps1` üretir; her proje yalnız
  adımlarını doldurur. `private/tercihler/ui.md`'ye tercih satırı.
Benim itirazlarım (Opus): USB'de okuma-yazma anahtarı kaybolursa özel repoya yazma yetkisi gider;
"her güncellemede sil-kur" ağır, güncellemeyi senkron zaten yapıyor; pencere ilk kurulum/onarım için.

## Sahibin projeleri ve yığınları (bu makinede)

| Proje | Yığın |
| --- | --- |
| Asistan | Electron (issue'dan), Node, git senkron |
| Quizloop | Electron 42 + React 19 + Vite 7 |
| CodeXray | Tauri 2 + React 19 + Vite 8 |
| VidShrink | .NET, Avalonia 11.3 (Fluent tema), Windows/macOS/Linux kurulum script'leri |
| Teknesyum-UI | arayüz standardı: token dosyaları (`neon.tokens.json`, 14 KB), 86 kurallı `scan.js`, 124 satırlık SKILL.md; yalnız projede `teknesyum-ui.json` varsa açılır |

VidShrink üst çubuğu (sahibin beğendiği imza): ince, temalı, çerçevesiz pencere başlığı. Solda 24 px
logo + "Vid**Shrink**" (ikinci kelime vurgu renginde). Sağda dil seçici + ⚙, "Buy Me a Coffee"
sponsor düğmesi (fincan ikonu), "Teknesyum" GitHub bağlantısı, sonra Windows tarzı bitişik
küçült/büyüt/kapat düğmeleri, kapatma pencerenin sağ kenarına dayanır. Alt kenarda 1 px neon mavi
çizgi. Tüm ölçü ve renkler token'dan (TitleBarHeight, SpaceSm, SpaceXl, PinkText…).

Tema token'ları: `#08090a` zemin, `#00f3ff` / `#b026ff` vurgular, `#34d399` başarı, `#ff54eb` hata,
`#71717a` sönük; 24/16/14 px.

## Özel raf (`pp`) nasıl çalışır

`~/.claude/teknesyum-private/private/` altında md kitaplar; ayrı özel depo (`Teknesyum-Private`).
Sıradan turda 0 bayt. Kullanıcı `pp` yazınca kanca kitapları bağlama koyar; 8 KB tavanı var, üstünde
yalnız liste basar ve model kitabı `show` ile okur. Bugün 7 kitap: kimlik, tercihler/{yazim, ui (7
satır, 480 B), araclar, calisma, readme-protokolu (4,8 KB), lisans, depo}. `scaffold.js` şu an
LICENSE, imza ve dil bağlantısı üretir ("model sabit metni yazmaz" ilkesi).

## Hook mekaniği (preread/postread için)

- `UserPromptSubmit` kancası `additionalContext` ile bağlama metin ekler; boşsa 0 bayt. Bugün `mod.js`
  işaret (`??` `pp` `aa` `ff`) yoksa hiçbir şey basmaz.
- `Stop` kancası `{decision:'block', reason}` dönerse model durmaz, `reason` metnini okuyup devam
  eder; `stop_hook_active` bayrağı sonsuz döngüyü keser. Bugün `dur.js` bunu kanıt kapısı için
  kullanıyor (kod değişti, test koşmadı → bir kez blokla).
- `SessionEnd`'de `handoff.js` `.claude/handoff.md` yazar (değişen dosyalar, testler, son istekler).
- Zaten var olanlar: her projede `docs/YOL-HARITASI.md` (sahibin açık istekleri, compact'ta
  kaybolmasın diye; "tur başında oku" kuralı), `docs/plan.md` (SessionStart ilk açık kutuyu tek
  satırla söyler), dosya tabanlı memory (MEMORY.md indeks her oturum bağlamda), compact sonrası
  CLAUDE.md yeniden okunur.
- Kanca model değildir: dosyayı okumak 0 token; ama bağlama koyduğu her bayt o turda ödenir.
