# lst97/claude-code-sub-agents

- MIT · metin paketi (agents/ klasörü + kök CLAUDE.md) · ★1678
- mekanizma: 37 ajan md (kategorilere bölünmüş) · 0 kanca · 0 komut · 0 skill · 0 MCP · `.claude-plugin/` yok
- sıradan turda bağlama: kök `CLAUDE.md` 10.701 B ≈ 2.700 token (wc -c). Ajanlar Task aracının listesine girdiği için 37 açıklama × ~60 token ≈ 2.200 token daha; toplam ~4.900 token/tur. Ajan gövdeleri 364 KB (du -sk) ama çağrılmadıkça yüklenmiyor.
- premium: yok

## Ne yapar
Yazılım yaşam döngüsünün her alanı için (react-pro, backend-architect, golang-pro, ux-designer…) 37 uzman alt ajan tanımı. Her dosya frontmatter'da `name`, uzun `description`, sabit `tools` listesi ve `model` taşıyor; Claude Code bağlama göre otomatik seçiyor. Yanında bir de tüm projeye dayatılan tam yığın geliştirme yönergesi var.

## Core'a alınacak
- fikir: frontmatter'da model katmanının ajan başına sabitlenmesi (`model: sonnet`) — Core'un bench koltuklarındaki ayrımın dışarıdaki karşılığı, not değeri var.
- fikir: ajan `tools:` listesini daraltarak yetkiyi dosyada kısıtlama; Core'un danışma ajanlarında dosya okutmama kuralının mekanik karşılığı.

## Karar
Hayır — 37 ajanın açıklaması + 10.7 KB CLAUDE.md ölçülen ~4.900 token/tur sabit maliyet demek; Core'un "hiçbir şey ajan olarak kurulmaz, sıradan turda sıfır" ilkesinin tam zıddı.
