# PatrickJS/awesome-cursorrules

- lisans: CC0 1.0 Universal (kamu malı, atıfsız kullanım serbest)
- tür: docs (Cursor editörü için kural/prompt koleksiyonu)
- kitap sayısı ve yeri: 257 dosya, tek klasör `rules/`, uzantı `.mdc` (md değil)
- scan: rules/ · skip: .github, scripts, kök görseller/lockup dosyaları

## Ne işe yarar
Cursor editörü için proje türüne göre (React, Astro, Blender addon, Solidity vb.) hazır "cursor rules" dosyaları barındırır. Her dosya frontmatter'lı (`description`, `globs`, `alwaysApply`) ama gövde formatı tutarsız — bazıları düz markdown talimat listesi, bazıları JSON blok. Cursor'a özgü bir mekanizma (`.cursor/rules/`) için yazılmış, Claude Code'a doğrudan taşınmaz.

## ??'de ne zaman bulunmalı
Astro projesinde hangi kod standartlarını uygulayayım?
React/TypeScript için "clean code" kuralları var mı, örnek ister misin?
Yeni bir framework'e başlarken hazır bir stil rehberi şablonu lazım.

## Kalite
Özgün: topluluk katkılı, çoğu tek yazar tek dosya, denetim yok. Güncel: son commit 2026-05-30, aktif. Format tutarsız — `.mdc` uzantısı ve bazı dosyaların JSON gövdesi, "md kitap" tanımına uymuyor; frontmatter var ama Claude Code'un okuduğu SKILL.md/başlıklı-md şablonuyla eşleşmiyor.

## Karar
hayır — dosyalar `.mdc` uzantılı ve içerik/format tutarsız, Teknesyum Core'un kitap tanımına (md, frontmatter'lı ya da başlıklı) uymuyor; Cursor'a özgü, doğrudan taşınamaz.
