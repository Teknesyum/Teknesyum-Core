# zircote/workflows-plugin

- MIT · plugin (marketplace + tek skill) · ★1
- mekanizma: 0 kanca, 0 komut, 0 ajan, 1 skill, 0 MCP; 2 yardımcı betik (`hydrate-vendor.mjs`, `validate-plugin.mjs`)
- sıradan turda bağlama: ~593 bayt (yalnız SKILL frontmatter `description`), ~150 token; SKILL.md gövdesi (6,8 KB) ve `reference/` (17 KB) yalnız skill tetiklenince okunur. Ölçüm: `wc -c` frontmatter description + dosya boyutları
- premium: yok

## Ne yapar
Claude Code'un `Workflow` aracı için tek bir skill taşır: Anthropic'in kendi dokümanı "mekanik/otorite", zircote'un alan notu ise "20 desen + 8 anti-desen" adlandırma katmanı olarak ayrılmış. Her iki kaynak `vendor/` altında aynen saklanıyor.

## Core'a alınacak
- **pasif betik**: `vendor/VENDOR.lock` deseni — her raf için `url`, `sha256`, `bytes`, `fetchedAt`, `refreshable`, elle tazelenecekse `manualNote`. Core'un `kutuphane.js fetch`'i şu an kaynağın ne zaman ve nereden geldiğini kilitlemiyor; 20 satırlık bir lock dosyası bunu çözer ve `--check` ile CI'da bayatlık raporlar (burada `hydrate-vendor:check` drift'te exit 1).
- **fikir**: "önbellek asla otorite değil" ayrımı — bir rafta iki kaynak varsa hangisinin çeliştiğinde kazandığı raf başlığında tek cümleyle yazılı olsun.
- **fikir**: frontmatter'da `Anti-trigger;` cümlesi — ne zaman *okunmayacağını* açıkça yazmak. Core'un `??` kancasında raf seçimini daraltır.

## Karar
Al — VENDOR.lock deseni kancasız, pasif, ~20 satır ve Core'un kütüphanesinin tam eksiği.
