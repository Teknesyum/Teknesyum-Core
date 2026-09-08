# obra/superpowers

- lisans: MIT (Jesse Vincent, 2025)
- tür: skills
- kitap sayısı ve yeri: 15 SKILL.md, hepsi `skills/<isim>/SKILL.md` altında (brainstorming, tdd, systematic-debugging, writing-skills, writing-plans, executing-plans, code-review çifti, using-git-worktrees, dispatching-parallel-agents, subagent-driven-development, finishing-a-development-branch, verification-before-completion, using-superpowers)
- scan: skills/*/SKILL.md · skip: .agents, .claude-plugin, .codex-plugin, .cursor-plugin, .devin-plugin, .hermes-plugin, .kimi-plugin, .opencode, .pi, .github, docs, hooks, scripts, tests, assets

## Ne işe yarar
Claude Code (ve Codex/Gemini/Copilot gibi çoklu runtime) için süreç disiplini kitaplığı: TDD, sistematik hata ayıklama, plan yazma/yürütme, kod incelemesi isteme/alma, git worktree kullanımı, paralel alt-ajan dağıtımı. `using-superpowers` adlı bir "meta-skill" ile her konuşmada skill kontrolünü zorunlu kılmaya çalışıyor. Frontmatter (`name`/`description`) her dosyada var ve tutarlı.

## ??'de ne zaman bulunmalı
"özellik eklemeden önce test nasıl yazılır" (test-driven-development)
"bu hatayı sistematik nasıl ayıklarım" (systematic-debugging)
"yeni bir skill/kitap nasıl yazılır, nasıl test edilir" (writing-skills)

## Kalite
Özgün ve güncel — son commit 2026-08-12, aktif geliştiriliyor, çoklu runtime desteği (Claude/Codex/Gemini/Copilot/Devin/Kimi/Hermes) ayrı plugin klasörleriyle bakımlı. İçerik tekrarları var (tdd ↔ writing-skills birbirine referans veriyor, döngüsel bağımlılık); `using-superpowers` agresif "MUST invoke" dili taşıyor, bu doğrudan alınırsa Core'un kendi disiplinini (K0, RULES) ezebilir.

## Karar
fikir notu — süreç disiplini içerik olarak değerli ama `using-superpowers`in zorlayıcı dili Core'un kendi kural setiyle çakışıyor, doğrudan raf yerine seçilmiş 2-3 SKILL.md'nin elle uyarlanması daha güvenli.
