# luongnv89/claude-howto

- lisans: MIT (LICENSE dosyasında, luongnv89 2024 telif)
- tür: docs (eğitim müfredatı) + içinde skills
- kitap sayısı ve yeri: 109 gerçek md (dil kopyaları hariç, toplam 482 — ja/uk/vi/zh çeviri klasörleri aynı içeriği 4 kez tekrarlıyor); 6 gerçek `SKILL.md` `03-skills/` altında (blog-draft, brand-voice, claude-md, code-review-specialist, doc-generator, refactor), ayrıca `.claude/skills/` altında 2 tanıtım-amaçlı skill (lesson-quiz, self-assessment)
- scan: `03-skills/*/SKILL.md`, `.claude/skills/*/SKILL.md` · skip: `ja/`, `uk/`, `vi/`, `zh/` (çeviri kopyası), `01-slash-commands`..`10-cli` (ders anlatımı, kitap değil), `slides/`, `local-progress/`, `.github/`

## Ne işe yarar
Claude Code'u sıfırdan öğreten, 10 bölümlük (slash komutlar, memory, skills, subagents, mcp, hooks, plugins, checkpoints, ileri özellikler, cli) hafta sonu kursu. `03-skills/` altında gerçek, frontmatter'lı, çalışan SKILL.md dosyaları var (ör. refactor, Martin Fowler metodolojisiyle fazlı bir refactor akışı). Geri kalanı CATALOG.md/INDEX.md/LEARNING-ROADMAP.md gibi rehber metinler, kitap rafı değil.

## ??'de ne zaman bulunmalı
- "Claude Code skill'i nasıl yazılır, örnek göster"
- "kod refactor etmek için sistematik bir skill var mı"
- "Claude Code'u yeni öğreniyorum, öğrenme yol haritası nedir"

## Kalite
`03-skills/refactor/SKILL.md` özgün ve iyi yapılandırılmış (fazlı workflow, references/scripts/templates alt klasörleri ile). Depo genel olarak "trend" pazarlamalı bir öğretim materyali, son commit 2026-09-06 — aktif bakımlı. Skill sayısı içerik hacmine göre az (6 gerçek + 2 demo); asıl kütle ders metni ve 4 dilde tekrar.

## Karar
fikir notu — kütüphaneye tüm depo değil yalnız `03-skills/*/SKILL.md` altı raf adayı, geri kalanı ders içeriği ve dil tekrarları taşıyor.
