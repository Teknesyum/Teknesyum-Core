# es617/claude-replay

- MIT · CLI (npm, sıfır bağımlılık, Node 18+) · ★826
- mekanizma: 0 kanca, 0 komut, 0 ajan, 0 skill, 0 MCP; tek giriş `bin/claude-replay.mjs`
- sıradan turda bağlama: 0 KB / 0 token — depoda `.claude-plugin/`, `hooks/`, `skills/`, `CLAUDE.md` yok
- premium: yok

## Ne yapar
Yedi ajanın (Claude Code, Cursor, Codex, Gemini, OpenCode, Kimi, Hermes) diskteki oturum kaydını biçimini kendi tanıyarak tek dosyalık, bağımlılıksız HTML'e çevirir: oynatma hızı, düşünme bloklarının katlanması, yer imleri, dosya etkinliği kenar çubuğu. `--serve --watch` ile koşan oturumu canlı izler. Dışa aktarmadan önce sır temizliği yapar.

## Core'a alınacak
- **pasif betik — sır temizleyici.** `src/secrets.mjs`, transkript dışa aktarılmadan önce anahtar/parola desenlerini maskeliyor. Core'un `log.js` hata günlüğü ve `docs/netlestirme/` kayıtları bugün ham metin yazıyor; aynı süzgeç oraya uyar.
- **fikir — transkript ayrıştırıcı ayrı katman.** `src/formats/` her ajan için tek biçim adaptörü; Core'un handoff/devir üretimi de aynı jsonl'i okuyor, biçim bilgisini tek dosyada tutmak kopyayı önler.

## Karar
Fikir notu — kurulum yükü sıfır ama Core'un işi paylaşım değil; yalnız sır süzgeci ve ayrıştırıcı ayrımı alınır.
