# nicobailon/visual-explainer

- lisans: MIT (2025, Nico Bailon)
- tür: skills (Claude Code plugin olarak paketli tek beceri)
- kitap sayısı ve yeri: 1 SKILL.md (`plugins/visual-explainer/SKILL.md`) + 6 slash komutu (`plugins/visual-explainer/commands/*.md`) + referans md'ler (`references/`, `quick/README.md`, `pptx/README.md`, `mcp/README.md`) + çoklu harness config'leri (`configs/{antigravity,codex,copilot,openclaw,opencode,pi}/AGENTS.md`)
- scan: `plugins/visual-explainer/SKILL.md`, `plugins/visual-explainer/commands/`, `plugins/visual-explainer/references/` · skip: `configs/` (rakip harness kurulumları), `.claude-plugin/` (marketplace meta), `banner.png`, `CHANGELOG.md`

## Ne işe yarar
Terminal çıktısını (mimari, diff review, plan review, slayt, veri tablosu) ASCII yerine tema destekli, kendi kendine yeten HTML sayfasına çeviren bir agent becerisi. SKILL.md tetikleyici kuralları, tasarım yargısı (renk/tipografi planı, polished-utilitarian vs editorial ayrımı) ve referans yönlendirme tablosu (mermaid, css-patterns, slide-patterns, themes) içeriyor. Claude Code, Pi, MCP host'lar, Antigravity, Codex, OpenCode, Cursor gibi çok sayıda harness için ayrı kurulum yolu tanımlanmış.

## ??'de ne zaman bulunmalı
- "bu mimariyi/akışı diyagram olarak göster"
- "bu diff'i/planı HTML rapor olarak incele"
- "şu karşılaştırma tablosunu okunaklı hale getir"

## Kalite
Özgün ve güncel: son commit 2026-08-28, versiyon 0.11.0, CHANGELOG aktif bakım gösteriyor. SKILL.md'nin tetikleyici/tasarım-yargısı kısmı düzeyli yazılmış, template ve referans dosyaları ayrılmış (monolitik değil) — iyi organize bir tekil beceri.

## Karar
fikir notu — teknesyum-ui token standardıyla çakışabilecek kendi tema/palet sistemi getiriyor, doğrudan raf yerine ilham/entegrasyon incelemesi olarak değerlendirilmeli.
