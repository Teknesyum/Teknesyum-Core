# OneRedOak/claude-code-workflows

- MIT · metin paketi (kopyala-yapıştır; slash komut + subagent + GitHub Actions) · ★3893
- mekanizma: 3 iş akışı klasörü, 3 slash komut metni, 2 subagent metni, 3 workflow YAML; 0 kanca, 0 skill, 0 MCP, `.claude-plugin` yok
- sıradan turda bağlama: 0 — hiçbir şey otomatik yüklenmiyor. Tek istisna `design-review-claude-md-snippet.md` (1335 B / ~330 token) kullanıcı CLAUDE.md'sine elle yapıştırılırsa
- premium: yok (YouTube kanalına yönlendiriyor)

## Ne yapar
Kod incelemesi, güvenlik incelemesi ve tasarım incelemesi için üç iş akışı. Her biri "çift döngü": yerelde slash komut / subagent, PR'da GitHub Actions. Tasarım incelemesi Playwright MCP ile tarayıcıyı sürüp görsel geri bildirim veriyor.

## Core'a alınacak
- **kitap**: `security-review/security-review-slash-command.md` — OWASP eşlemeli, ciddiyet sınıflı bulgu biçimi; Core'un `log.js` hata günlüğü biçimiyle akraba, rafa uygun.
- **fikir**: aynı disiplinin iki yüzü — yerel komut ve CI workflow'u aynı metinden besleniyor. Core'un betikleri de `gh` üzerinden CI'ya bağlanabilir.
- **fikir**: "pragmatic" ön eki — inceleme çıktısında bulgu sayısı tavanı ve kanıt zorunluluğu; Core'un "kısa cevap" kuralının inceleme karşılığı.

## Karar
Fikir notu — sıradan turda 0 token ve MIT, ama içerik Claude Code'un kendi `/code-review` ve `/security-review` skill'leriyle örtüşüyor; yalnız biçim fikri alınır.
