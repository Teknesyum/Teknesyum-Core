# garrytan/gstack

- lisans: MIT (Garry Tan, 2026)
- tür: skills + agents (Claude Code eklentisi)
- kitap sayısı ve yeri: 223 md dosyası, 61 tanesi SKILL.md; ~70 kök klasörde dağılmış (autoplan, benchmark, browse, careful, codex, qa, review, ship, spec, plan-ceo-review, office-hours, vb.), her biri kendi klasöründe SKILL.md + sections/
- scan: kök seviyede `*/SKILL.md` deseni · skip: `.github`, `test`, `test/fixtures`, `lib`, `supabase`, `extension`, `docs`, `bin`, `patches`, `scripts`

## Ne işe yarar
Claude Code'u "sanal mühendislik ekibine" çeviren komut/skill koleksiyonu: CEO incelemesi, mimari kilit, tasarım eleştirisi, QA (gerçek tarayıcı açar), güvenlik denetimi (OWASP/STRIDE), release mühendisliği gibi 23 uzman rolü ve 8 "power tool" sunuyor. Her SKILL.md düzgün frontmatter taşıyor (name, version, description, allowed-tools, triggers) ve `SKILL.md.tmpl`'den otomatik üretiliyor. Son commit 2026-09-06, aktif geliştiriliyor (v1.81.0.0).

## ??'de ne zaman bulunmalı
- "PR'ımı gerçek bir tarayıcıda QA testinden geçir"
- "bu özellik fikrini CEO gözüyle eleştir, mimariyi kilitle"
- "branch'imi OWASP/STRIDE güvenlik denetiminden geçir ve release'e hazırla"

## Kalite
Özgün ve iddialı: yazar günlük kullandığını, üretim akışını (LOC metodolojisi dahil) belgelediğini iddia ediyor; CI'da skill'leri otomatik kaydeden GitHub Action'lar var. Frontmatter ve tetikleyiciler (triggers) tutarlı, template'ten üretiliyor — kopya-yapıştır izlenimi vermiyor, canlı bakım görülüyor.

## Karar
fikir notu — kalite yüksek ama 61 SKILL.md tek bir "kitap"tan çok tam bir rakip eklenti (23 rol + 8 araç); rafa almak yerine yapısından (frontmatter şablonu, triggers alanı) esinlenilmeli.
