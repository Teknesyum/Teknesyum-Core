# gmickel/flow-next

- MIT · plugin (marketplace) + CLI/TUI · ★693
- mekanizma: 73 skill, 32 komut, 25 ajan, 2 kanca dosyası, 0 MCP; 3.879 dosya
- sıradan turda bağlama: skill frontmatter 22.146 B + ajan frontmatter 6.696 B = 28,8 KB ≈ 7.200 token; ayrıca kullanıcının deposundaki CLAUDE.md'ye `<!-- BEGIN FLOW-NEXT -->` işaretleri arasına ~1,2 KB sabit blok enjekte ediyor (ölçüm: klondaki CLAUDE.md 12,7 KB, blok sayıldı)
- premium: yok

## Ne yapar
"Ajanlar üretir, flow-next kanıtlar" iddiası. Özellik teslimini spec/task durum makinesine bağlar; her adımda doğrulama ve inceleme kapıları var. Kendi TUI'si ve Codex uyumu var, yani plugin katmanı taşınabilir tutulmuş.

## Core'a alınacak
- fikir: CLAUDE.md'ye işaretli blok enjeksiyonu (`<!-- BEGIN ... -->` / `snippet:v2` sürüm damgası) — Core'un `scaffold.js`'i sabit metinleri yazarken aynı deseni kullanabilir, güncelleme idempotent olur.
- fikir: "bakımcı eklemeleri işaretlerin dışında kalır" sözleşmesi — üretilen metinle elle yazılanı ayırma kuralı, tek satır.
- hayır: 7.200 token sabit gider ve 32 komut — Core'un sıfır token ilkesiyle bağdaşmıyor.

## Karar
Fikir notu — mekanizması ağır (7,2k token boşta), ama işaretli/sürümlü blok enjeksiyonu `scaffold.js` için doğrudan uygulanabilir bir desen.
