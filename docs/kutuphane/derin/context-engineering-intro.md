# coleam00/context-engineering-intro

- lisans: MIT (Cole Medin, 2025)
- tür: prompts | docs (bir adet skills — SKILL.md)
- kitap sayısı ve yeri: ~45 md dosyası; kök (`README.md`, `CLAUDE.md`, `INITIAL.md`), `PRPs/templates/`, `.claude/commands/`, çoğu `use-cases/<proje>/` altında tekrarlanan CLAUDE.md + PRPs + komut şablonları
- scan: `PRPs/templates/`, `use-cases/*/PRPs/templates/`, `use-cases/build-with-agent-team/` (SKILL.md burada) · skip: `use-cases/*/agents/*/documents/` (örnek RAG verisi), `use-cases/*/tests/`

## Ne işe yarar
Depo "Context Engineering" adlı bir PRP (Product Requirements Prompt) iş akışı şablonu: `INITIAL.md` yaz, `/generate-prp` ile zengin bağlamlı bir PRP üret, `/execute-prp` ile uygulat. Kök dışında `use-cases/` altında Pydantic AI, MCP server, agent-factory gibi 8 alt-şablon var, her biri kendi CLAUDE.md + PRP şablonunu tekrarlıyor. Tek gerçek Claude Code "skill" dosyası `use-cases/build-with-agent-team/SKILL.md` — tmux ile çoklu-ajan takım kurma rehberi, frontmatter'ı (`name`, `description`, `argument-hint`) düzgün.

## ??'de ne zaman bulunmalı
- "PRP nedir, nasıl feature isteği yazılır" sorulduğunda
- "Çoklu ajan takımıyla nasıl paralel build yapılır, contract nasıl tanımlanır" sorulduğunda
- "Claude Code için slash-komut tabanlı context engineering şablonu var mı" sorulduğunda

## Kalite
Özgün bir metodoloji (PRP kavramı Cole Medin'e ait, yaygın atıf alıyor) ama depo içi 8 use-case klasörü aynı CLAUDE.md/PRP iskeletini kopyalayıp çeşitlendiriyor — tekrar oranı yüksek. Son commit 2026-03-16, aktif bakımlı. `SKILL.md` haricindeki dosyalar frontmatter'sız düz Markdown, Teknesyum'un "kitap" tanımına (frontmatter'lı md/SKILL.md/başlıklı md) başlıklı md olarak zayıf uyar.

## Karar
fikir notu — tek gerçek SKILL.md (agent-team) rafa değer ama gerisi PRP şablonu tekrarından ibaret, doğrudan raf yapmaya değmez.
