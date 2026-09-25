# Yöntem: Kurulum — Exe Ve Tek Satır, Antivirüse Takılmadan

Kaynak proje: AmeliyatListe (Tauri 2, özel depo, salt okunur deploy key). Tarih: 2026-09-24.
Öneri: pp rafına **"kurulum"** bölümü açılsın; aşağıdaki tecrübeler oraya taşınsın. Rafa bu oturumda yazılmadı.

## Kalıp

- **Tek exe, iki kip.** Dosya adında `kurulum` geçerse kurulum ekranı, geçmezse uygulama. Ayrı installer derlemesi yok.
- **Anahtar exe'ye gömülü** (`include_bytes!`). Yanında klasör taşınmaz; tek dosya paylaşılır.
- **Tek satır komut** (PowerShell, yönetici değil): MinGit indir → anahtarı yaz → 443 üzerinden clone → exe'yi `Kurulum` adıyla çalıştır. Üretici betik depoda (`kurulum/tek-satir.py`), komut README'de.
- **Sormadan güncelleme:** açılışta ve 60 sn'de bir fetch → reset → exe değiştir → yeniden başlat.

## Antivirüs Tecrübeleri

- **Yakalanan desen:** gzip+base64 gömülü betik + `iex` + gizli pencere / `-ExecutionPolicy Bypass` içeren .bat. Defender statik taraması temiz dese de davranışsal/AMSI katmanı bunu yakalıyor.
- **Çözüm kaçış değil, sadelik:** komut düz ve okunur; kodlama, sıkıştırma, gizli pencere yok. Bat tamamen emekliye ayrıldı.
- git ile gelen dosyada Mark-of-the-Web yok → SmartScreen sormuyor. Tarayıcıdan inen exe'de "More info › Run anyway" gerekebilir; kalıcı çözüm kod imzası.
- Exe'ye `publisher`/`copyright` bilgisi eklemek itibar puanına yardım ediyor.
- Doğrulama: `MpCmdRun.exe -Scan -ScanType 3 -File <yol>`, çıktı "found no threats".

## Anahtar Uyuşmazlığı Tecrübesi

- "Anahtar uyuşmadı" asıl sebep değildi: hastane ağında **22 portu kapalı**. Hata metni "internet ya da anahtar" diyerek yanılttı.
- Çözüm: `ssh://git@ssh.github.com:443/...` birincil, `github.com:22` yedek; known_hosts iki satır. Kurulu kopyalar açılışta known_hosts'u ve origin adresini kendiliğinden taşıyor.
- **Anahtar sabit:** yayın betiği anahtarın SHA256'sını denetliyor, değişmişse duruyor. Kurulu makineler o anahtarla bağlanıyor; değişirse hepsi kopar.

## Windows Tuzakları

- PS 5.1 `Expand-Archive` MinGit zip'inde yarıda kalıp geri alıyor → `[IO.Compression.ZipFile]::ExtractToDirectory` ile temp'e aç, sonra `Move-Item`.
- Anahtar dosyasına `icacls /inheritance:r /grant:r USER:(R)`; yeniden yazmadan önce `icacls /reset`, yoksa yazma izni yok.
- Açık kurulum exe'si dosyayı kilitler → yayın betiği kopyalayamaz. Yayından önce pencereyi kapattır.
- Kancalar proje dışında `Remove-Item`/`rmdir` metnini engelliyor → denemeler proje `trash/` altında.

## Sınama Kipi

- Ortam değişkenleri: `AL_KOK=<sahte kök>`, `AL_OTOMATIK=1`, `AL_PROVA=1` (kısayol yok). Sonuç `kurulum-sonuc.txt`'ye.
- Gerçek kuruluma dokunmadan uçtan uca sınandı: exe kipi `TAMAM`, tek satır iki kez `True`.

## Core İçin Not

- Stop kancası bloklayınca aynı cevap iki kez basılıyor (ayrıntı: `BUG-kanit-kapisi-her-durmada-yeniden-soruyor.md`).

## 3. Closed

pp rafında `private/tercihler/kurulum-paneli.md` "Özel depo istisnası" ve "Antivirüs ve
Windows tuzakları" bölümlerine işlendi; AmeliyatListe'ye özgü ayrıntı genelleştirildi,
gömülü anahtar kalıbı yalnız özel-depo istisnası olarak yazıldı, TEKLIF'teki genel kaynak
kuralıyla (GitHub Releases + sha256) çelişmediği kitapta ayrı satırla belirtildi. Sınama
kipi notu "Sınama kipi" bölümüne. Raf commit: `c1298b8`.
