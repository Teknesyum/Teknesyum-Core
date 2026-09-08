# KKKKhazix/khazix-skills

- MIT · metin paketi (Agent Skills standardı, 40+ ajan) · ★20523
- mekanizma: 6 skill · kanca yok · komut yok · MCP yok · 1 ajan tanımı (`aihot/agents`)
- sıradan turda bağlama: 6 skill frontmatter'ı toplam 5.743 B ≈ 1.400 token (Çince açıklamalar uzun; tetikleyici sözcükler frontmatter'a doldurulmuş). Skill gövdeleri toplam 494 KB, talep üzerine okunuyor.
- premium: yok.

## Ne yapar
Yazarın günlük kullandığı altı skill: `leader` (bulanık fikri ajanın tek başına koşabileceği ≤4000 karakterlik görev kitabına çevirir), `neat-freak` (iş bitince proje dokümanı, CLAUDE.md/AGENTS.md ve ajan hafızasını kodun gerçek haliyle uzlaştırır), `hv-analysis`, `storage-analyzer`, `khazix-writer`, `aihot`.

## Core'a alınacak
- kitap: `neat-freak`'in kapanış listesi — iş bitince dokümanlar, kural dosyaları ve hafıza kodla uyuşuyor mu; Core'da bu iş bugün elle yapılıyor, tek sayfalık raf metni doğrudan karşılığı.
- kitap: `leader`'ın görev kitabı şablonu — ölçülmüş sayı, beyaz liste sınırı, hile önleyici kabul ölçütü, kesintiden devam; Core'un alt ajana "hazır olgu ver" kuralının somut şablonu.
- fikir: tetikleyici sözcükleri frontmatter açıklamasına doldurma — açıklama başına ~950 B'ye çıkıyor, Core için pahalı; raf indeksinde tetikleyici ayrı sütun olmalı.

## Karar
Al — `neat-freak` kapanış listesi ve `leader` görev kitabı şablonu iki raf metni olarak; skill biçiminde değil, kitap olarak.
