# ykdojo/claude-code-tips

- OTHER · kurulum biçimi: metin paketi + kabuk betikleri (kurulum yok, kopyala) · ★10056
- mekanizma: 9 SKILL.md, 0 kanca, 0 komut, 0 ajan, 0 MCP; 5 kabuk/JS betiği (`context-bar.sh`, `check-context.sh`, `half-clone-conversation.sh`, `color-preview.sh`, `generate-toc.js`)
- sıradan turda bağlama: kurulmuyor; `README.md` 81258 B okunduğunda gelir. Örnek global yapılandırma `GLOBAL-CLAUDE.md` 3899 B (~1k token, her turda) — deponun kendi `CLAUDE.md`'si 2015 B
- premium: yok

## Ne yapar
45+ Claude Code ipucu, bir statusline betiği ve konteynerde kendi kendini çalıştırma anlatısı. Yanında `dx` eklentisi: gündelik geliştirici işleri için 9 raf (handoff, half-clone, version-check, review-claudemd, gha, hn-summarize...). `GLOBAL-CLAUDE.md` gerçek bir kişisel yapılandırma örneği: yazım stili, git kuralı, npm 2FA tuzağı, uzun işlerde üstel geri çekilme.

## Core'a alınacak
- **Fikir — konuşmayı yarıya klonlama.** `half-clone-conversation.sh` + `skills/half-clone`, `skills/quarter-clone`: oturum kaydını ilk yarısından kesip yeni oturum açıyor. Core'un `handoff.md` devrinin yanında ikinci bir devir yolu; compact yerine kesme.
- **Kitap — statusline/bağlam çubuğu.** `scripts/context-bar.sh` + `check-context.sh`: bağlam doluluğunu statusline'da gösteriyor. Core'un statusline'ı zaten var; ölçüm biçimi karşılaştırma için raf olur.
- **Fikir — `review-claudemd` rafı.** Kendi `CLAUDE.md`'ni denetleten raf; Core'un `AGENTS.md`/`RULES.md` 30 satır tavanını koruyan bir bakım turu için iskelet.

## Karar
Fikir notu — kurulacak bir mekanizma yok; yarıya klonlama ve CLAUDE.md denetimi iki not olarak kalır.
