# jnMetaCode/agency-agents-zh

- MIT · metin paketi (ajan md dosyaları) · ★20396
- mekanizma: 327 markdown, 20 bölüm klasörü (engineering, design, finance, legal, security, product…), 0 kanca, 0 komut, 0 SKILL.md, 0 MCP; her dosya `name/description/emoji/color` frontmatter'lı tek rol metni
- sıradan turda bağlama: kurulmadığı sürece 0; `~/.claude/agents`e kopyalanırsa 327 açıklama yüklenir (dosya başına ~250 B açıklama → ~80 KB / ~20.000 token)
- premium: yok

## Ne yapar
267+ hazır uzman rolünün Çince çevirisi; Claude Code, Cursor, Copilot dahil 18 araca
kopyalanabilecek düz metin. `CATALOG.md` ve `AGENT-LIST.md` bölüm bölüm dizin tutuyor.
Rol metinleri dar tanımlı: "genel veri mühendisi değil, boru hattı durduramazken çağrılan cerrah".

## Core'a alınacak
- kitap: koltuk deposu — Core'un `agency.js find/show --lean` mekanizması hazır bir rol havuzu bekliyor; bu depo `kutuphane.js fetch` ile raf olarak çekilip ajana gövde olarak verilebilir, kurulum gerekmez.
- fikir: rol metnini "ne değil" ile sınırlama kalıbı — koltuk seçiminde yanlış eşleşmeyi düşürür.
- fikir: bölüm klasörü + CATALOG dizini — `find <alan>` için hazır arama yüzeyi.

## Karar
Al — kitap olarak; kurulunca 20.000 token, rafta durunca sıfır, `agency.js`in tam beklediği biçim.
