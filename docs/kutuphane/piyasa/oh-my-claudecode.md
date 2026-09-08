# Yeachan-Heo/oh-my-claudecode

- MIT · plugin (marketplace + npm) · ★39052
- mekanizma: 20 kanca betiği / 11 olay (UserPromptSubmit, PreToolUse, PostToolUse, PostToolUseFailure, SubagentStart/Stop, PreCompact, Stop, SessionStart/End, PermissionRequest) · 21 komut · 19 ajan · 37 skill · 1 MCP sunucusu (bridge)
- sıradan turda bağlama: CLAUDE.md 6001 B + 37 SKILL.md frontmatter'ı ~9434 B = ~15,4 KB, ~3,9k token (wc -c ile ölçüldü); üstüne her turda iki UserPromptSubmit kancası (keyword-detector 82 KB, skill-injector 22 KB) bağlama metin enjekte ediyor
- premium: yok; sponsorluk/Discord var

## Ne yapar
Claude Code'a çok ajanlı düzenleme katmanı ekler: anahtar kelime yakalayan kanca isteği ilgili ajana/skill'e yönlendirir, alt ajanları izler, oturum belleği ve wiki tutar. "Claude Code'u öğrenme, OMC kullan" iddiası.

## Core'a alınacak
- **fikir** — enjeksiyon tavanı: `MAX_SKILLS_PER_SESSION`, `MAX_LEARNED_SKILL_DESCRIPTOR_CHARS`, `MAX_LEARNED_SKILLS_CONTEXT_CHARS` sabitleriyle kancanın bağlama yazabileceği metin üstten sınırlanmış. Core'un `??`/`pp` kancasında da böyle bir tavan yok; tek satırlık kural.
- **fikir** — `DISABLE_OMC=1` ve `OMC_SKIP_HOOKS=ad1,ad2` ortam değişkenleriyle kancaları tek tek kapatma. Core'da kanca kapatma anahtarı yok.
- **fikir** — `PostToolUseFailure` olayına bağlı kanca; Core'un `log.js` hata günlüğü şu an elle çağrılıyor, bu olay onu kendiliğinden tetikleyebilir.

## Karar
fikir notu — 15,4 KB sabit bağlam Core'un sıfır ilkesinin tam tersi, ama enjeksiyon tavanı ve kanca kapatma anahtarı doğrudan alınabilir üç satır.
