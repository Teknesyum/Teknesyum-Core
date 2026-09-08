# sickn33/agentic-awesome-skills

- lisans: MIT (üst depo) — ama içerik 2113 kaydın çoğu başka depolardan toplanmış, her biri kendi lisansıyla (Apache 2.0, MIT, "personal", kaynaksız) geliyor
- tür: agents + skills + araç (aas CLI, MCP tool `compose_stack`) — kitap rafı değil, bir kayıt/agrega motoru
- kitap sayısı ve yeri: `plugins/agentic-awesome-skills-claude/skills/` altında yalnızca 5 gerçek SKILL.md; asıl gövde `data/aas-v1/skill-content.v1.ndjson` içinde 2113 kayıt (JSON+frontmatter, tek satır tek beceri)
- scan: `plugins/agentic-awesome-skills-claude/skills/*/SKILL.md` (5 adet) · skip: `data/`, `docs_zh-CN/`, `apps/`, `.github/`, `assets/` — ndjson formatı doğrudan md rafı değil, ayrı ayrıştırıcı ister

## Ne işe yarar
Claude Code / Codex projeleri için 2113 topluluk becerisini tek bir yerel katalogda toplayıp agent'ın proje bağlamına göre seçim yapmasını sağlayan bir "beceri pazarı" aracı. Kendi SKILL.md'leri değil, `aas` CLI ve MCP `compose_stack` üzerinden çalışan bir keşif/derleme katmanı sunuyor. Depo 79 MB, klonlama Windows'ta uzun dosya adı hatalarıyla tamamlanamadı (checkout kısmi kaldı).

## ??'de ne zaman bulunmalı
- "Bana hazır bir agent orchestration becerisi bul" (25 kayıt bu kategoride, ama kalitesi değişken)
- "Şu işi yapan topluluk skill'i var mı, ben yazmayayım"
- "AAS kataloğundan proje için beceri seç" (asıl kullanım amacı bu, tek dosya okuma değil)

## Kalite
İçerik özgün değil, 1367 kayıt "community" kaynaklı, geri kalanı çeşitli GitHub depolarından (vibeship-spawner-skills, reverse-skill, delegate-skills, obsidian-skills, vs.) toplanmış — telif ve lisans karışık. Risk etiketleri kendi içinde 1092 kayıt "critical", 59 "offensive" olarak işaretli; bir kısmı İspanyolca (00-andruia-consultant örneğinde tüm gövde İspanyolca). Son commit 2026-09-07, aktif ama yapı Windows dosya sistemiyle uyumsuz (uzun yol adları).

## Karar
hayır — kitap rafı değil bir agrega/araç deposu; içerik kalitesi ve lisans durumu tekil, taranabilir bir raf için yeterince temiz ve güvenli değil.
