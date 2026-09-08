# SuperClaude-Org/SuperClaude_Framework

- MIT · plugin + Python paketi (`superclaude install`) · ★23873
- mekanizma: 30 slash komutu, 20 ajan, 7 mod, 1 SKILL.md (confidence-check); `~/.claude/` altına commands/agents/skills kopyalıyor; 0 kanca dosyası depoda
- sıradan turda bağlama: kendi CLAUDE.md'si 13323 B ≈ 13 KB / ~3.300 token; kurulumdan sonra 30 komut + 20 ajan açıklaması ayrıca yüklenir
- premium: yok

## Ne yapar
Claude Code'u komut/persona/mod katmanlarıyla saran çatı. İlgi çeken tek parça
`confidence-check` becerisi: uygulamaya başlamadan önce 5 kontrolle (kopya var mı,
mimariye uyum, resmî belge, çalışan OSS örneği, kök neden) 0-1 arası güven puanı
hesaplıyor, ≥%90 altında başlamıyor. 8/8 test vakası bildiriliyor.

## Core'a alınacak
- fikir: iş öncesi güven eşiği — Core'un K0 kuralının ("bilmediğin kütüphane: yazmadan önce oku") ölçülebilir hali; kanca değil, plan adımı olarak.
- fikir: `token_budget.py` — ajan başına token tavanı tutma; bench tarafında karşılığı var.

## Karar
Fikir notu — 3.300 tokenlık CLAUDE.md ve ev dizinine kurulum Core'un ilkesine aykırı; yalnız güven eşiği fikri alınır.
