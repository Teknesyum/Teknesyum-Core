# revfactory/harness

- lisans: Apache-2.0
- tür: skills (meta-skill, tek kitap + 6 referans dosyası)
- kitap sayısı ve yeri: 1 SKILL.md (`skills/harness/SKILL.md`), 6 referans `.md` (`skills/harness/references/`)
- scan: `skills/harness` · skip: `docs/`, `_workspace/`, `.github/`, kök `README*.md`, `CHANGELOG.md`, `CONTRIBUTING.md`

## Ne işe yarar
Tek bir "harness" meta-skill'i: kullanıcının bir cümlelik domain tarifinden ajan takımı (`.claude/agents/`) ve o ajanların kullanacağı skill'leri (`.claude/skills/`) üretiyor. Altı hazır takım-mimarisi kalıbı sunuyor (Pipeline, Fan-out/Fan-in, Expert Pool, Producer-Reviewer, Supervisor, Hierarchical Delegation). SKILL.md 457 satır, faz faz (Phase 0-7) bir orkestrasyon süreci tanımlıyor; referans dosyaları ajan tasarım kalıpları, orkestratör şablonu, QA ajan rehberi, skill yazma/test rehberi ve takım örnekleri içeriyor.

## ??'de ne zaman bulunmalı
- "bu proje için ajan takımı nasıl kurarım"
- "harness / takım mimarisi tasarla, birden fazla alt ajan birbirine nasıl SendMessage ile konuşur"
- "yeni bir skill yazarken frontmatter ve test kalıbı nasıl olmalı"

## Kalite
Frontmatter'lı düzgün SKILL.md, Türkçe değil Korece yazılmış (description ve gövde Korece + bazı İngilizce terim), teknesyum-core'un Türkçe/İngilizce ikili düzeniyle uyumsuz. Kendi ekosistemine (Claude Code'un TeamCreate/SendMessage/TaskCreate araçlarına) sıkı bağlı, genel amaçlı değil. Son commit 2026-06-10, aktif bakımlı; ancak içerik oldukça spesifik ve niş (yalnız "harness kur" isteğine hizmet ediyor).

## Karar
fikir notu — tek kitaplık dar kapsamlı meta-skill, dili Korece ve mimarisi Claude Code'a özgü araçlara bağımlı; rafa almadan önce Türkçe'ye çevrilip teknesyum'un kendi ajan/skill sözleşmesine uyarlanması gerekir.
