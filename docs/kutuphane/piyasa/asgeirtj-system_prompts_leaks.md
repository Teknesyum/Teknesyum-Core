# asgeirtj/system_prompts_leaks

- CC0-1.0 · metin paketi (kurulum yok, salt okunur depo) · ★64440
- mekanizma: 0 kanca, 0 komut, 0 ajan, 0 skill, 0 MCP — yalnız markdown
- sıradan turda bağlama: 0 KB / 0 token (hiçbir şey kurulmuyor; okunduğunda okunur)
- premium: yok

## Ne yapar
Anthropic, OpenAI, Google, xAI ve diğerlerinin sistem istemlerini birebir toplar.
`Anthropic/claude-code/` altında Claude Code'un Fable 5.1, Opus 5, headless sürüm
istemleri (337 KB ve 207 KB), 25 dahili skill'in SKILL.md'si, `commands/` (compact,
btw, rename) ve 4 output-style dosyası duruyor. Toplam 12 MB Anthropic klasörü.

## Core'a alınacak
- kitap: `Anthropic/claude-code/` — "resmî istem" rafı. Kanca yazarken hangi olayın
  bağlama ne enjekte ettiğini tahmin etmek yerine birebir metinden okuruz.
- kitap: `claude-code/skills/*/SKILL.md` — resmî skill frontmatter'ı; açıklama
  uzunluğu/tetikleyici dili için ölçüt (Core skill kurmuyor ama kitap yazarken dil örneği).
- fikir: `output-styles/concise.md` — Core'un kısa cevap kuralıyla aynı işi resmî
  dille yapıyor; RULES.md'deki "duvar yok" maddesine karşılaştırma.

## Karar
Al — CC0 lisanslı, sıfır kurulum maliyetli, Core'un tüm kanca kararlarını olguya
bağlayan tek birincil kaynak.
