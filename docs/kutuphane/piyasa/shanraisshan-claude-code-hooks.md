# shanraisshan/claude-code-hooks

- MIT · kurulum biçimi: proje `.claude/settings.json` + Python betiği (eklenti değil) · ★539
- mekanizma: 30 kanca olayının hepsi tek `hooks.py`'ye bağlı; 3 komut, 3 ajan, MCP 1 (demo), skill 0
- sıradan turda bağlama: `CLAUDE.md` 3.650 B (~0,9K token); kanca stdout'u yok — kancalar `"async": true` ve yalnız ses çalıyor, metin basmıyor
- premium: yok

## Ne yapar
Claude Code'un yayımlanmış 30 kanca olayının her birine bir ses efekti bağlar; amaç kancaların ne zaman ateşlendiğini duyarak öğrenmek. `.claude/hooks/HOOKS-README.md` (34.899 B) her olayı sırayla, sürüm tarihiyle ve tetiklenme koşuluyla anlatıyor; README'deki changelog tablosu hangi Claude Code sürümünde hangi olayın eklendiğini gösteriyor.

## Core'a alınacak
- **kitap**: 30 kanca olayının katalogu (HOOKS-README + changelog tablosu). Core'un tüm mekanizması kanca; hangi olayların var olduğu ve ne zaman eklendiği kütüphanede pasif durmalı. Core bugün SessionStart/UserPromptSubmit/PostToolUse üçlüsünü kullanıyor; `CwdChanged`, `FileChanged`, `PermissionDenied`, `PostToolBatch`, `InstructionsLoaded` kullanılmamış.
- **fikir**: tek betik–çok olay deseni. 30 giriş noktası yerine tek `hooks.py`, olay adını stdin'den okuyor; Core'un `hooks/mod.js` deseniyle aynı, doğrulayıcı.
- **fikir**: kanca sayısının tutarlılığını doğrulayan checklist (CLAUDE.md'de "hook count MUST match across ALL of these locations" listesi) — Core'un sürüm çıkarma adımına benzer bir kontrol.

## Karar
Al — 30 olayın katalogu doğrudan kitaplık rafı değeri; ses/otomasyon kısmı alınmaz.
