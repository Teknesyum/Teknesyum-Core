# davepoon/buildwithclaude

- MIT · plugin pazaryeri + web sitesi · ★3431
- mekanizma: 142 eklenti klasörü, 117 ajan, 175 komut, 28 kanca, 26 skill; `.claude-plugin/marketplace.json` 73.620 B; 5 doğrulayıcı betik (validate-hooks/skills/commands/subagents/all) + 4 JSON şeması
- sıradan turda bağlama: 0 B — depo kendisi kurulmuyor, `/plugin install` ile seçilen eklenti kadar yük gelir; pazaryeri dosyası modele girmez
- premium: yok (buildwithclaude.com ücretsiz vitrin)

## Ne yapar
Claude Code ekosisteminin vitrin ve pazaryeri deposu: kendi derlediği 51 paket eklentiyi barındırır, ayrıca 20 bin topluluk eklentisini ve 4.500 MCP sunucusunu indeksleyip web arayüzünde arattırır. CI'da her katkı şemaya karşı doğrulanır; `hook-validation-report.json` 33 dosya, 0 hata diyor.

## Core'a alınacak
- pasif betik: `scripts/validate-hooks.js` + `hook-schema.json` (221 + 64 satır, ajv + gray-matter) — Core'un kendi `core/hooks/` dosyalarını olay adı ve alan şemasına karşı deterministik denetler; model gerekmez, `npm test` içine girer.
- kitap: geçerli kanca olayları listesi (PreToolUse, PostToolUse, Stop, Notification, SessionStart, SessionEnd, UserPromptSubmit, PreCompact, SubagentStop) tek raf sayfası olarak.
- fikir: her katkının şemaya karşı doğrulanıp rapor JSON'u depoda tutulması — Core'un bench/rapor.md alışkanlığının kanca tarafındaki karşılığı.

## Karar
Al — sıradan turda 0 B yazıyor; doğrulayıcı betik ve olay listesi Core ilkesini bozmadan doğrudan alınabilir.
