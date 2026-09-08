# CloudAI-X/claude-workflow-v2

- MIT · plugin (npx / `claude plugin install` / `--plugin-dir` / Agent SDK) · ★1413
- mekanizma: 29 kanca dosyası 6 olayda (SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, Stop, Notification) · 26 komut · 7 ajan · 14 skill
- sıradan turda bağlama: depo kökündeki `CLAUDE.md` 4.4 KB (~1.1 bin token, `wc -c`) + skill açıklamaları 3.9 KB (~1 bin token) = ~2.1 bin token, her turda.
- premium: yok

## Ne yapar
"Her yazılım projesi için evrensel" bir Claude Code iş akışı eklentisi: mimari/hızlı kip komutları, çok ajanlı doğrulama, otomatik commit mesajı, biçimlendirme ve güvenlik kancaları. skills.sh üzerinden 35+ ajana da kurulabiliyor.

## Core'a alınacak
- **fikir**: `CLAUDE.md`'nin kendi eklentisini geliştirenlere yazılmış olması (yeni skill 500 satırı geçmesin, ajan açıklamasında tetik sözcüğü olsun) — Core'un `AGENTS.md`'sine "yeni raf nasıl eklenir" eşiği olarak eklenebilir.
- **fikir**: tek depodan `.claude-plugin/` ve `.codex-plugin/` manifestlerini birlikte yayımlama.
- hiç: 26 komut + 7 ajan + 14 skill, Core'un "hiçbir şey ajan/skill olarak kurulmaz" ilkesinin karşıtı.

## Karar
Hayır — mekanizması ilkeye aykırı ve her turda ~2.1 bin token yazıyor; yalnız eklenti-geliştirme eşikleri fikir olarak not edildi.
