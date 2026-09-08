# mvanhorn/last30days-skill

- MIT · plugin (Claude Code + Codex + Grok + Gemini uzantısı) · ★61596
- mekanizma: 1 skill, 1 kanca (SessionStart `check-config.sh`), `mcp/` dizini opsiyonel, 0 komut, 0 ajan
- sıradan turda bağlama: skill frontmatter 277 B (~69 token); depo CLAUDE.md yalnız 12 B (AGENTS.md'ye yönlendirme), AGENTS.md 15431 B ama o depoda çalışana ait
- premium: yok; opsiyonel ücretli API anahtarları (`SCRAPECREATORS_API_KEY`, `XAI_API_KEY`, `OPENAI_API_KEY`) — anahtarsız da çalışıyor

## Ne yapar
Herhangi bir konu hakkında son 30 günde Reddit, X, YouTube, TikTok, HN, Polymarket, GitHub ve web'de ne konuşulduğunu, etkileşim sayılarıyla toplar. `doctor` alt komutu kırık/eksik kaynakları teşhis eder.

## Core'a alınacak
- kitap: 12 baytlık `CLAUDE.md` = `@AGENTS.md` — Core'un kendi kuralının piyasada aynen uygulanmış hali, doğrulama olarak not.
- fikir: frontmatter'da `optionalEnv` listesi — anahtar yoksa yetenek düşüyor ama iş durmuyor; Core betiklerinde aynı kademelendirme.
- fikir: `doctor` sağlık denetimi alt komutu — Core'un `setup.js`ine "neyi bulamadım" raporu.

## Karar
Fikir notu · araştırma alanı Core'un konusu değil, ama `optionalEnv` kademelendirmesi ve doctor deseni ucuz.
