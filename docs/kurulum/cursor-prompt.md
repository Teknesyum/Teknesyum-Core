# Cursor kullanıcısı için kurulum istemi

Cursor'da Agent sohbetine olduğu gibi yapıştırılır. Ajan komutları koşar, girişi ve
tarayıcı onayını kullanıcı yapar. Kurulum satırlarındaki sürümü `release.js cut` günceller.

---

```text
Teknesyum Core'u bu makineye kurmama yardım et. Teknesyum Core bir Claude Code eklentisi;
Cursor'un kendi ajanında değil, Cursor'un terminalinde açılan Claude Code içinde çalışıyor.
Her adımda koştuğun komutu ve çıktısını göster, Türkçe konuş. Şifre, giriş ya da tarayıcı
onayı gereken yerde dur ve bana ne yapacağımı tek satırla söyle.

1. İşletim sistemini bul. Sonra şunları kontrol et: `git --version`, `node -v` (18 ya da
   üstü), `claude --version`. Eksik olanı söyle.
   - git ya da Node.js yoksa kurulum yolunu söyle (Windows'ta `winget install Git.Git` ve
     `winget install OpenJS.NodeJS.LTS`), kurmadan önce bana sor.
   - Claude Code yoksa resmi kurucuyu koş:
     Windows PowerShell: `irm https://claude.ai/install.ps1 | iex`
     macOS / Linux: `curl -fsSL https://claude.ai/install.sh | bash`
     Sonra yeni bir terminal açıp `claude --version` ile doğrula. İlk açılışta giriş
     tarayıcıda olur; onu ben yaparım.

2. Teknesyum Core'u kur:
   Windows PowerShell:
   `irm https://raw.githubusercontent.com/Teknesyum/Teknesyum-Core/v0.32.2/install.ps1 | iex`
   macOS / Linux:
   `curl -fsSL https://raw.githubusercontent.com/Teknesyum/Teknesyum-Core/v0.32.2/install.sh | bash`
   Kurucu sonunda setup'ı koşar. Atlandıysa:
   `node ~/.claude/plugins/cache/teknesyum/teknesyum-core/*/scripts/setup.js`

3. Doğrula: `claude plugin list` çıktısında `teknesyum-core` görünmeli. Görünmüyorsa
   `claude plugin marketplace add Teknesyum/Teknesyum-Core` ve
   `claude plugin install teknesyum-core@teknesyum` koş.

4. Bana şunu söyle, kendin yapma: "Cursor'da View > Terminal ile terminali aç, proje
   klasöründe `claude` yaz." Açılışta `Teknesyum Core > v… Çalışıyor` satırı ve altta
   statusline görünmeli.

5. İsteğe bağlı: Cursor'un Extensions panelinden Anthropic'in "Claude Code" eklentisi de
   kurulabilir. Eklentiler ve kancalar orada da çalışır, ama statusline orada görünmez.

6. Sonunda kısa rapor ver: işletim sistemi, git / node / claude sürümleri,
   `claude plugin list` içinde teknesyum-core sürümü, hata çıktıysa olduğu gibi.

Bilmen gereken sınır: Cursor'un kendi Agent sohbeti (şu an konuştuğumuz yer) Teknesyum
Core kancalarını koşmaz; onun adaptörü henüz yok. Codex CLI de henüz desteklenmiyor.
```
