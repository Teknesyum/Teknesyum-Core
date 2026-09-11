# Cursor kullanıcısı için kurulum istemi

Cursor'da Agent sohbetine olduğu gibi yapıştırılır. Ajan komutları koşar, girişi ve
tarayıcı onayını kullanıcı yapar. Kurulum satırlarındaki sürümü `release.js cut` günceller.

---

```text
Teknesyum Core'u bu makineye kurmama yardım et. Teknesyum Core iki yerde çalışıyor: Cursor'un
terminalinde açılan Claude Code içinde tam haliyle, Cursor'un kendi Agent'ında (şu an
konuştuğumuz yer) ise bir adaptörle. İkisini de kuracağız. Her adımda koştuğun komutu ve
çıktısını göster, Türkçe konuş. Şifre, giriş ya da tarayıcı onayı gereken yerde dur ve bana
ne yapacağımı tek satırla söyle.

1. İşletim sistemini bul. Sonra şunları kontrol et: `git --version`, `node -v` (18 ya da
   üstü), `claude --version`. Eksik olanı söyle.
   - git ya da Node.js yoksa kurulum yolunu söyle (Windows'ta `winget install Git.Git` ve
     `winget install OpenJS.NodeJS.LTS`), kurmadan önce bana sor.
   - Claude Code yoksa bana sor; yalnız Cursor Agent'ı istiyorsam 2. ve 3. adımı atla.
     İstersem resmi kurucuyu koş:
     Windows PowerShell: `irm https://claude.ai/install.ps1 | iex`
     macOS / Linux: `curl -fsSL https://claude.ai/install.sh | bash`
     İlk açılışta giriş tarayıcıda olur; onu ben yaparım.

2. Claude Code için Teknesyum Core'u kur:
   Windows PowerShell:
   `irm https://raw.githubusercontent.com/Teknesyum/Teknesyum-Core/v0.33.0/install.ps1 | iex`
   macOS / Linux:
   `curl -fsSL https://raw.githubusercontent.com/Teknesyum/Teknesyum-Core/v0.33.0/install.sh | bash`

3. Doğrula: `claude plugin list` çıktısında `teknesyum-core` görünmeli. Görünmüyorsa
   `claude plugin marketplace add Teknesyum/Teknesyum-Core` ve
   `claude plugin install teknesyum-core@teknesyum` koş.

4. Cursor Agent adaptörü. Core'u ev klasörüne klonla (`$HOME/Teknesyum-Core` zaten varsa
   dokunmadan önce bana sor), sonra kancaları bağla:
   `git clone --depth 1 --branch v0.33.0 https://github.com/Teknesyum/Teknesyum-Core "$HOME/Teknesyum-Core"`
   `node "$HOME/Teknesyum-Core/core/scripts/setup.js" --host cursor`
   Çıktı `~/.cursor/hooks.json` yolunu söylemeli. Dosyayı aç ve bana göster; başka kancalar
   varsa yerinde kalmış olmalı, yanında `.bak` yedeği durmalı.

5. Kurallar. `$HOME/Teknesyum-Core/adapters/AGENTS.md` içindeki kural bloğunu oku ve bana
   göster. Onayımla, üzerinde çalıştığım projenin kökündeki `AGENTS.md` dosyasına ekle (yoksa
   oluştur). Model iş listesini `.claude/jobs.md`'ye böyle yazmayı bilir.

6. Bana şunu söyle, kendin yapma: "Cursor'u tamamen kapatıp yeniden aç." Kancalar ancak
   böyle yüklenir.

7. Canlı deneme, yeniden açılıştan sonra yeni bir sohbette. Geçici bir klasör aç, içinde
   `git init` koş, bir dosya yazıp commit'le. Sonra o klasörde `git reset --hard` koşmayı
   dene. Beklenen: komut reddedilir, ekranda `Teknesyum Core > …` satırı görünür, sen de
   reddin gerekçesini alırsın. Ret gelmezse Cursor'un Hooks çıktı kanalını (Output >
   Hooks) ve `~/.claude/teknesyum/hook-errors.log` dosyasını oku.

8. Sonunda kısa rapor ver: işletim sistemi, git / node / claude sürümleri, `claude plugin
   list` içinde teknesyum-core sürümü, 4. adımın çıktısı, 7. adımda ekranda ve sende görünen
   metin olduğu gibi, hata çıktıysa olduğu gibi.

Bilmen gereken sınır: Cursor Agent'ta yasak liste, döngü sınırı, sayım, iş ve kanıt kapıları
ve devir çalışır. İstem işaretleri (`??`, `pp`, `aa`…) ve statusline yalnız Claude Code'da
var. Kaldırmak için: `node "$HOME/Teknesyum-Core/core/scripts/setup.js" --host cursor --remove`.
```
