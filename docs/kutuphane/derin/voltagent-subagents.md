# VoltAgent/awesome-claude-code-subagents

- lisans: MIT (VoltAgent, 2025)
- tür: agents
- kitap sayısı ve yeri: 176 md, `categories/01..10-*/` altında (her klasörde ayrıca `.claude-plugin`)
- scan: categories/01-core-development, categories/02-language-specialists, categories/03-infrastructure, categories/04-quality-security, categories/05-data-ai, categories/06-developer-experience, categories/07-specialized-domains, categories/08-business-product, categories/09-meta-orchestration, categories/10-research-analysis · skip: .claude-plugin, tools, install-agents.sh

## Ne işe yarar
Her dosya bir Claude Code subagent tanımı: `name`, `description`, `tools`, `model` frontmatter'ı ve ardından uzun bir sistem promptu (checklist'ler, "when invoked" adımları). SKILL.md yok, hepsi tekil ajan dosyası. Kategoriler backend/dil/altyapı/kalite/veri-AI/DX/özel alan/iş/orkestrasyon/araştırma olarak ayrılmış.

## ??'de ne zaman bulunmalı
- "backend API tasarımı için ajan öner"
- "Go/Python mikroservis geliştirirken hangi subagent'ı kullanmalıyım"
- "OWASP'a uygun güvenlik incelemesi yapan bir ajan var mı"

## Kalite
İçerik özgün görünüyor (VoltAgent'ın kendi promptları), checklist'ler jenerik ama tutarlı; kopya-yama izi yok. Son commit 2026-09-07 ("update README") — güncel ve aktif bakımlı.

## Karar
fikir notu — Claude Code'un kendi subagent formatında (frontmatter + tools + model), Teknesyum Core'un md-kitap rafı değil; ilgi çekerse ayrı bir "ajan galerisi" olarak değerlendirilmeli, doğrudan rafa alınmaz.
