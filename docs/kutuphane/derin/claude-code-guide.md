# zebbern/claude-code-guide

- lisans: MIT (LICENSE, Copyright (c) 2025 zebbern)
- tür: skills + agents (74 adet SKILL.md, 6 adet Claude Code alt-ajan md'si) + docs (kök README)
- kitap sayısı ve yeri: 318 md dosyası, `skills/<isim>/SKILL.md` (74 adet) altında; her klasörde ek `references/`, `rules/`, `assets/` alt dosyaları var; `agents/.claude/agents/*.md` altında 6 alt-ajan tanımı
- scan: `skills/*/SKILL.md` · skip: `agents/`, `skills/*/references`, `skills/*/rules`, `skills/*/assets`, kök `README.md`, `CHANGELOG.md`

## Ne işe yarar
Claude Code için toplanmış geniş bir SKILL.md koleksiyonu: pentest/güvenlik testi (idor, xss, sqlmap, active-directory-attacks gibi ~25 adet), geliştirme (react-best-practices, nextjs-developer, playwright, typescript-pro, three-best-practices) ve yazı/analiz (academic-paper-reviewer, cv-tailor, scholarly-writing-refiner) olmak üzere üç kümede toplanıyor. Her SKILL.md `name`/`description` frontmatter'ı taşıyor, `description` alanı tetikleyici ifadeleri içeriyor. Kök README ayrı bir konu: Claude Code CLI'nin kendisini (komutlar, hook'lar, MCP) anlatan bir el kitabı, kütüphaneye dahil değil.

## ??'de ne zaman bulunmalı
- "playwright ile e2e test yazarken CI paralelleştirme nasıl yapılır"
- "next.js server actions için en iyi pratik ne"
- "idor açığı nasıl test edilir, checklist ver"

## Kalite
Skiller özgün görünüyor, frontmatter tutarlı ve içerik (ör. academic-paper-reviewer) ayrıntılı, kendi başına çalışır durumda yazılmış. Ancak kapsamın büyük kısmı (playwright, react/three best-practices, pentest serisi) başka topluluk skill koleksiyonlarıyla örtüşen jenerik konular; repo son commit'i güncel (2026-09-07) ve README kendi ekosistemini (antigravity-awesome-skills, agent-skills-authoring) ayrı depolar olarak işaret ediyor — bu da burada özgün küratörlük değil derleme olduğunu gösteriyor.

## Karar
raf — 74 SKILL.md gerçek frontmatter'lı kitap, güncel ve `??` sorgularına doğrudan yanıt verebilecek nitelikte; scan yalnız `skills/*/SKILL.md` ile sınırlı tutulmalı.
