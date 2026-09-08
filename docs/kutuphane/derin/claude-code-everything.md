# wesammustafa/Claude-Code-Everything-You-Need-to-Know

- lisans: MIT (Wesam Abousaid, 2025)
- tür: docs (rehber) + agents + prompts
- kitap sayısı ve yeri: 50 md dosyası — çoğu `docs/` (skills, hooks, agent-teams, workflows) ve kök `README.md`; ayrıca `.claude/agents/` (5 dosya, frontmatter'lı), `.claude/commands/` (7 dosya), `specialized-agents/system-prompts/` ve `specialized-agents/Descriptions/`
- scan: `.claude/agents`, `specialized-agents/system-prompts`, `specialized-agents/Descriptions` · skip: `docs/`, `README.md`, `.github/`, `Images/`, `.claude/skills/claude-md-review` (tek örnek meta-skill)

## Ne işe yarar
Claude Code'u uçtan uca anlatan tek parça bir rehber: kurulumdan prompt mühendisliğine, Skills/Hooks/MCP/Subagent farkına, agent-team ve workflow desenlerine kadar. `.claude/agents/` altında gerçek, frontmatter'lı (name/description/model) 5 alt-ajan var (coder-reviewer, frontend-engineer, project-manager, tech-lead-architect, ux-designer) — sıralı bir geliştirme hattı kurgusuyla yazılmış. `specialized-agents/` klasörü aynı ajanların ayrı sistem-promptu ve açıklama dosyalarını taşıyor.

## ??'de ne zaman bulunmalı
"Claude Code'da skill ile subagent farkı ne?"
"Sıralı bir geliştirme ekibi kurmak için ajan şablonu var mı?" (coder-reviewer, frontend-engineer vb.)
"Hooks/MCP/agent-teams için pratik örnek rehber göster."

## Kalite
Özgün, aktif tutulan bir rehber deposu (son commit Temmuz 2026, awesome-claude-code listesinde). Ajan dosyaları frontmatter standardına uyuyor ve rol tanımları detaylı; ama rehber kısmı (docs/*.md, README) uzun-format eğitim yazısı, "kitap" değil kaynak metin — kütüphane taraması için asıl değer `.claude/agents` ve `specialized-agents` ajan tanımlarında.

## Karar
raf — ajan tanım dosyaları (`.claude/agents`, `specialized-agents/system-prompts`) frontmatter standardına uygun ve doğrudan kullanılabilir; docs/README kısmı taranmaz.
