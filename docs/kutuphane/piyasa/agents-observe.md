# simple10/agents-observe

- MIT · plugin (marketplace) + MCP sunucusu + Docker · ★668
- mekanizma: `hooks/hooks.json` içinde **28 kanca olayı** (Setup, SessionStart/End, UserPromptSubmit, UserPromptExpansion, PreToolUse, PostToolUse, PostToolUseFailure, PostToolBatch, PermissionRequest/Denied, Stop, StopFailure, SubagentStart/Stop, TeammateIdle, TaskCreated/Completed, Notification, InstructionsLoaded, ConfigChange, CwdChanged, FileChanged, Pre/PostCompact, Elicitation/Result, WorktreeRemove); hepsi aynı `hook.sh`'a gidiyor. 1 skill (`observe`, 5,2 KB, `user_invocable`), 1 MCP sunucusu, komut/ajan 0.
- sıradan turda bağlama: kanca stdout'u yok (ateşle-unut), skill `user_invocable` olduğu için açıklaması ~70 karakter ≈ 20 token. Asıl maliyet bağlamda değil: her tur 28 olayda `bash` süreci ve Docker + SQLite gereksinimi.
- premium: yok.

## Ne yapar

Claude Code ve Codex oturumlarının tüm olaylarını SQLite'a yazıp `localhost:4981`'de gerçek zamanlı bir panoda gösteriyor: filtreleme, arama, tam oturum tekrarı, token ve maliyet dökümü. Sunucu Docker konteyneri olarak çalışıyor, eklenti `SessionStart`'ta otomatik başlatıyor.

## Core'a alınacak

1. **Kitap** — `hooks/hooks.json`, bugünkü Claude Code kanca olaylarının en eksiksiz listesi (28 olay). Core yalnız birkaçını kullanıyor; rafta referans olarak durmalı.
2. **Fikir** — tek `hook.sh`'un tüm olayları karşılayıp olay adına göre dallanması: Core'un `mod.js` deseniyle aynı, ama olay yelpazesi çok daha geniş.
3. **Fikir** — ateşle-unut kanca: stdout'a hiçbir şey yazmadan kayıt tutmak, "sıradan turda sıfır token" ilkesiyle uyumlu ölçüm yolu.

## Karar

Fikir notu — Docker + MCP + pano Core'un pasif ilkesine aykırı, ama 28 olaylık kanca haritası ve ateşle-unut deseni alınır.
