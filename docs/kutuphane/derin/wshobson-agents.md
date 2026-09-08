# wshobson/agents

- lisans: MIT (Seth Hobson, 2024)
- tür: agents + skills + commands karışık marketplace (Claude Code eklenti deposu)
- kitap sayısı ve yeri: 751 md dosyası, 183 SKILL.md, 202 agent md, 105 command md — `plugins/<94 eklenti>/{agents,commands,skills}/` altında
- scan: `plugins/*/skills/*/SKILL.md` (frontmatter'lı, en kitap-benzeri) · skip: `plugins/*/agents/`, `plugins/*/commands/`, `tools/`, `.cursor*`, `docs/`

## Ne işe yarar
94 eklentiden oluşan çok-harness'lı bir "agentic building blocks" pazarı; her eklenti Claude Code, Codex CLI, Cursor, OpenCode, Copilot için aynı Markdown kaynaktan agent/command/skill üretiyor. SKILL.md'ler frontmatter'lı (`name`, `description`) ve konu bazlı (ör. `before-you-build`, `prompt-engineering-patterns`). Agent md'leri de frontmatter taşıyor ama "elite specialist" tonunda uzun, reklamsı prompt'lar; kitap değil ajan tanımı.

## ??'de ne zaman bulunmalı
- "Landing page/MVP yapmadan önce risk kontrolü nasıl yapılır" → `before-you-build` SKILL.md
- "Prompt engineering / few-shot pattern kitaplığı var mı" → `llm-application-dev/skills/prompt-engineering-patterns`
- "Next.js app router veya k8s güvenlik politikası referansı" → ilgili `skills/*/references/*.md`

## Kalite
Depo aktif ve güncel (son commit 2026-09-01), 94 eklenti taze bakım görüyor; klon sırasında bazı `references/` dosya adları Windows MAX_PATH sınırını aşıp checkout hatası verdi (içerik derin iç içe, dosya adları uzun). SKILL.md'ler özgün ve odaklı görünüyor ama agent md'leri şişirilmiş, pazarlama diliyle dolu — Core'un sade raf üslubuna uymuyor.

## Karar
fikir notu — SKILL.md'ler tek tek rafa değebilir ama tüm depo (agents/commands dahil) hacim ve üslup uyumsuzluğu yüzünden toptan raf değil.
