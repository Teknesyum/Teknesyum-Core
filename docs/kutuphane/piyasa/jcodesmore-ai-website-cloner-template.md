# JCodesMore/ai-website-cloner-template

- MIT · şablon depo (16 ajan aracı için ikizlenmiş yapılandırma) · ★34045
- mekanizma: 0 Claude Code kancası · 1 skill (`.claude/skills/clone-website`) · aynı skill/komut `.cursor`, `.codex`, `.gemini`, `.roo`, `.kiro`, `.opencode`, `.augment`, `.continue`, `.cline`, `.windsurf`, `.amazonq`, `.github` altında tekrar edilmiş · 0 MCP
- sıradan turda bağlama: depo kökündeki CLAUDE.md yalnız 12 bayt (`@AGENTS.md` gibi tek satır); asıl kural AGENTS.md'de. Skill açıklaması ~1 satır. Ölçülen bağlam ≈ AGENTS.md boyutu, CLAUDE.md'nin kendisi sıfıra yakın.
- premium: yok.

## Ne yapar
Tek komutla bir siteyi klonlayan proje şablonu; aynı talimatı 16 farklı ajan aracının beklediği yola kopyalayarak araç bağımsızlığı sağlıyor.

## Core'a alınacak
- fikir: 12 baytlık CLAUDE.md + gerçek içerik AGENTS.md'de — Core'un kendi kuralı (`CLAUDE.md` içinde yalnız `@AGENTS.md`) burada da uygulanmış; piyasa doğrulaması.
- pasif betik: tek kaynaktan 16 araç dizinine yapılandırma çoğaltan üretici; Core'un `scaffold.js`'ine "ikizleri üret" adımı olarak eklenebilir.

## Karar
fikir notu — ürün ilgisiz ama tek kaynaktan çoklu-araç yapılandırması üretme deseni Core'un `scaffold.js`'i için doğrudan kullanışlı.
