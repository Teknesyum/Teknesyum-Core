# SethGammon/Citadel

- MIT · plugin (marketplace, proje-yerel kurulum) · ★919
- mekanizma: 48 skill, 7 ajan, 37 kanca betigi (hooks_src/*.js) 9 olayda (PreToolUse, PostToolUse, SessionStart, UserPromptSubmit, Stop, SubagentStop, PreCompact, Notification, SessionEnd), 3 MCP sunucusu (citadel-state, codebase-memory, context-compress), 0 slash komut dizini
- sıradan turda bağlama: 48 skill description toplamı 13.3 KB + CLAUDE.md 3.5 KB = ~16.8 KB, ~4.2k token (frontmatter description alanları python ile toplandı, CLAUDE.md wc -c). Üstüne SessionStart ve UserPromptSubmit kancalarının her turdaki çıktısı var.
- premium: yok, tümü MIT

## Ne yapar
Claude Code ve Codex üstüne "işletim katmanı": `/do` ile niyet yönlendirme, oturumlar arası kampanya durumu (`.planning/`), paralel ajan koordinasyonu, dosya koruma ve dış eylem kapısı gibi güvenlik kancaları, kanıt/devir kayıtları. Her proje için `.planning/` ve `.citadel/scripts/` iskelesini SessionStart kancasıyla kurar.

## Core'a alınacak
- fikir: `external-action-gate.js` — PreToolUse'ta Bash'i tarayıp dışarı dokunan komutu kapıya alma; Core'un tek satırlık eşik konuşmasıyla uyumlu, 48 skill'e gerek yok.
- fikir: `protect-files.js` — Read/Edit/Write üstünde korunan yol listesi; özel rafın (`private/`) yanlışlıkla yazılmasını engellemek için ucuz.
- kitap: Citadel'in kendisi karşı örnek olarak rafa — "operating layer" kalıbının maliyeti 4.2k token/tur; Core'un sıfır-token ilkesini olguyla savunur.

## Karar
fikir notu — mekanizması zengin ama sıradan turda ~4.2k token yazıyor, Core'un ilkesiyle taban tabana zıt; yalnız iki kanca fikri alınır.
