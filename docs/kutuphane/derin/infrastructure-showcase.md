# diet103/claude-code-infrastructure-showcase

- lisans: MIT (2025, Claude Code Infrastructure Contributors)
- tür: skills + agents + slash komutlar (Claude Code eklenti kolleksiyonu, Node/Express/TS-React stack'e özel)
- kitap sayısı ve yeri: 84 md dosyası; 4 SKILL.md (`.claude/skills/*`, `.agents/skills/*` ikizi), 8 subagent (`.claude/agents/*.md`), 4 slash komut (`.claude/commands/*.md`)
- scan: `.claude/skills/*/SKILL.md`, `.claude/agents/*.md`, `.claude/commands/*.md` · skip: `.codex/`, `.git/`, `editor-config/`, `dev/` (aktif iş klasörü, referans değil)

## Ne işe yarar
Node.js/Express/TypeScript + Prisma + Sentry backend'i ve React/TanStack frontend'i için hazır "best practice" iskeleti sunuyor: mimari kurallar (layered architecture, BaseController), kod inceleme ajanları, dokümantasyon ve refactor planlama komutları. `.claude/` ve `.codex/` altında aynı içerik ikiletilmiş, iki asistan aracını hedefliyor. `CLAUDE_INTEGRATION_GUIDE.md` başka stack'e uyarlama talimatı veriyor.

## ??'de ne zaman bulunmalı
Express/Prisma/Sentry ile backend route-controller-service-repository katmanı kurarken.
React 19 + TanStack + MUI frontend'de bileşen/mimari standardı ararken.
Kod inceleme ajanı (architecture reviewer, refactor planner) örneği ararken.

## Kalite
İçerik özgün ve belirli bir stack'e (Node/Express/Prisma/Sentry, React 19/TanStack/MUI) sıkı sıkıya bağlı — genel geçer değil, doğrudan alınamaz, uyarlama gerekir. Son commit 2026-07-11, güncel sayılır. Frontmatter (name/description) SKILL.md'lerde düzgün dolu; agent dosyalarında da name/description/model var.

## Karar
fikir notu — stack'e özgü (Node/Express/Prisma/React/TanStack) olduğu için Core'da raf olarak genel kullanılamaz, ama SKILL.md/agent yazım kalıbı örnek olarak saklanmaya değer.
