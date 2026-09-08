# DenisSergeevitch/agents-best-practices

- MIT · skill (metin paketi, `npx skills add`) · ★2277
- mekanizma: 1 SKILL.md (21 KB) + 21 referans dosyası; 0 kanca, 0 komut, 0 ajan, 0 MCP
- sıradan turda bağlama: yalnız frontmatter açıklaması, 740 B / ~185 token (SKILL.md'nin description bloğu sayıldı); gövde ancak skill tetiklenince yükleniyor
- premium: yok

## Ne yapar
Sağlayıcıdan bağımsız "ajan koşum takımı" tasarım kitabı. Ajan döngüsü, araç tasarımı, izin, bağlam sıkıştırma, bellek, skill/MCP, prompt caching, eval, gözlemlenebilirlik başlıklarını 21 ayrı markdown'a bölmüş; SKILL.md yalnız yönlendirici.

## Core'a alınacak
- **kitap**: `references/context-memory-compaction.md` ve `prompt-caching-and-cost.md` — Core'un token disiplini raflarıyla doğrudan aynı konu, hazır ve MIT.
- **kitap**: `references/tools-and-permissions.md` + `security-observability.md` — kanca/izin tasarımı için raf.
- **fikir**: tek yönlendirici + 21 referans dosyası deseni; Core'un raf indeksi zaten böyle, ama burada "description'da tüm konu başlıkları sayılı" biçimi arama isabetini artırıyor.

## Karar
Al — 21 referans dosyası pasif metin, kanca yok, sıradan turda 185 token; rafa doğrudan konulabilir.
