# wanshuiyin/Auto-claude-code-research-in-sleep

- MIT · metin paketi (skills) + MCP + CLI · ★15881
- mekanizma: 82 SKILL.md · 7 MCP sunucusu (claude-review, gemini-review, minimax-chat, llm-chat, feishu-bridge, codex-image2, manual-review) · kanca yok · ~30 Python aracı (`tools/`)
- sıradan turda bağlama: 82 skill frontmatter'ı toplam 39.514 B ≈ 10.000 token, hepsi kurulursa her turda yüklü. Depo 63 MB. Ölçüm: `awk` ile frontmatter blokları toplanıp bayt sayıldı.
- premium: yok; makale (arXiv 2605.03042) ve topluluk üzerinden yayılıyor.

## Ne yapar
Makine öğrenmesi araştırmasını gece boyunca kendi başına yürüten bir skill zinciri: fikir üretme, literatür taraması, deney planı ve kuyruğu, sonuç analizi, atıf denetimi, otomatik gözden geçirme döngüleri, makale yazımı. Her adım Markdown skill, ağır iş Python araçlarında.

## Core'a alınacak
- kitap: "otomatik gözden geçirme döngüsü" (auto-review-loop) — üretilen işi ikinci bir modele denetletip bulguyu geri besleme kalıbı; Core'un danışma/netleştirme akışıyla akraba, tek sayfa raf metni olur.
- fikir: `tools/check_skills_inventory.py` — skill envanterinin manifest ile tutarlılığını denetleyen deterministik betik; Core'un raf sayımına uyarlanabilir.
- hayır: skill kümesi; 10.000 token'lık sabit yük ve ML araştırma alanı Core'un dışında.

## Karar
hayır — alan alakasız ve mekanizma (82 skill, 10.000 token) Core ilkesinin tam zıddı; yalnız gözden geçirme döngüsü kalıbı not edildi.
