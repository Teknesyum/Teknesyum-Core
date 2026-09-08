# tony/claude-code-riper-5

- MIT · kurulum biçimi: `.claude/` klasörünü kopyala (metin paketi) · ★93
- mekanizma: 11 slash komut (`/riper:research|innovate|plan|execute|review|strict` + `memory/*`),
  3 alt ajan, 0 kanca, MCP yok; `settings.json` içinde `"hooks": {}`
- sıradan turda bağlama: `AGENTS.md` 12.0 KB (≈3K token) + `.claude/project-info.md` 2.8 KB
  (≈700 token), `wc -c` ile ölçüldü; ikisi de her turda yüklü.
- premium: yok

## Ne yapar

RIPER (Research · Innovate · Plan · Execute · Review) aşamalarını slash komutlarıyla ayırıyor,
her aşamayı ayrı alt ajana verip bağlamı bölüyor. Kararlar `.claude/memory-bank/` altında
kalıcı, `/riper:strict` ile aşama atlamayı yasaklıyor.

## Core'a alınacak

- **fikir** — aşama ayrımını ajanla değil dosyayla yapmak: Core zaten `docs/plan.md` eşiğinde
  konuşuyor; "araştırma bitmeden yazma" kuralı plan kancasına tek satır olarak eklenebilir.
- **hiç** — komut/ajan tarafı alınmaz; 15 KB sabit bağlam Core'un sıfır-token ilkesinin tam tersi.

## Karar

hayır — tek yeni fikri (aşama kilidi) Core'da plan eşiğiyle zaten karşılanıyor, karşılığında
15 KB sabit bağlam getiriyor.
