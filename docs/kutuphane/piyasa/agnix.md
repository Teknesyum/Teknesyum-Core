# agent-sh/agnix

- MIT/Apache-2.0 · CLI (Rust binary) + isteğe bağlı eklenti · ★405
- mekanizma: kanca 0; eklenti tarafında 1 komut (`agnix.md`, 4,1 KB), 1 skill (4,0 KB), 1 ajan (1,0 KB); MCP yok. Ana depoda ayrıca kök `skills/agnix/SKILL.md` (2,3 KB).
- sıradan turda bağlama: CLI olarak kurulursa 0. Eklenti kurulursa yalnız skill açıklaması yüklenir: 230 karakter ≈ 60 token (SKILL.md frontmatter'ından sayıldı).
- premium: yok; README'de üçüncü taraf inference reklamı var.

## Ne yapar

CLAUDE.md, AGENTS.md, SKILL.md, hooks.json, MCP ve plugin dosyalarını 455 kurala karşı denetleyen linter; auto-fix, LSP, GitHub Action ve dört editör eklentisi var. Kural gövdesi `knowledge-base/` altında: `rules.json` 600 KB, `VALIDATION-RULES.md` 204 KB, `PATTERNS-CATALOG.md` 14 KB.

## Core'a alınacak

1. **Pasif betik** — `agnix` binary'sini `scaffold.js`/`setup.js` yanında isteğe bağlı doğrulayıcı olarak çağırmak: eklentinin kendi `hooks.json`, `plugin.json` ve SKILL frontmatter'larını model harcamadan denetler. "Angarya işte deterministik araç" kuralına birebir oturur.
2. **Kitap** — `PATTERNS-CATALOG.md` (14 KB) rafa alınabilir; SKILL/kanca yazım hatalarının kataloğu, `??` öneki ile istenince okunur.
3. **Fikir** — kuralların JSON'da veri olarak durup metinde durmaması; Core'un kanca eşiklerini de veri dosyasına taşımak.

## Karar

Al — kurulumu sıfır token (binary), Core'un kendi dosyalarını denetleyen tek deterministik araç.
