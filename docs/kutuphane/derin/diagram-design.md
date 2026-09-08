# cathrynlavery/diagram-design

- lisans: MIT (Cathryn Lavery, 2025)
- tür: skills
- kitap sayısı ve yeri: 1 SKILL.md + 39 referans dosyası, `skills/diagram-design/` altında (SKILL.md kökte, tip başına `references/type-*.md`, artı `references/style-guide.md`, `onboarding.md`, `profiles.md`, `export*.md`, `import-*.md`, `animation.md`, `doctor.md`, `semantic-patterns.md`, `primitive-*.md`)
- scan: `skills/diagram-design` · skip: `docs/adr`, `docs/superpowers`, `docs/pr-previews`, `commands/`, `prompts/`, `scripts/` (bunlar depo bakımı/CI, kitap değil)

## Ne işe yarar
Claude Code (ve Codex, Factory Droid, Pi gibi Agent Skills uyumlu araçlar) için 39 diyagram tipini (mimari, akış şeması, sequence, ER, Gantt, Sankey, kanban, UML class, vb.) self-contained HTML/SVG olarak üretmeyi öğreten bir tasarım-sistemi becerisi. SKILL.md kısa bir giriş kapısı (marka token onboarding'i, felsefe), asıl detaylar her tip için ayrı `references/type-*.md` dosyasında ve talep üzerine yükleniyor. draw.io/Mermaid kaynaklarını yeniden çizme, marka tokenlerini bir web sitesinden çekme ve semantic pattern/animasyon eklerini de kapsıyor.

## ??'de ne zaman bulunmalı
- "mimari diyagramı çiz, markama uygun görünsün"
- "bu mermaid diyagramını daha güzel bir HTML'e çevir"
- "flowchart / sequence / ER diyagramı üret, shadow olmasın, editorial görünsün"

## Kalite
Özgün ve derli toplu: her tip için ayrı, kısa (~40 satır) referans dosyası, ortak "shape carries type" gibi tasarım kuralları tekrar ediyor, ADR'lerle (docs/adr) kararlar belgeli. Son commit 2026-09-07, aktif sürüm 2.6.17 — güncel ve bakımlı bir depo.

## Karar
raf — MIT lisanslı, frontmatter'lı SKILL.md ve 39 iyi bölümlenmiş referans dosyasıyla doğrudan kitap rafı formatına uyuyor.
