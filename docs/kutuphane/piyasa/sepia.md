# Nanako0129/sepia

- MIT · kurulum: plugin (`.claude-plugin/plugin.json`) + taşınabilir Agent Skill (skills.sh, 77+ ajan) · ★2448
- mekanizma: kanca 0 · komut 0 · ajan 0 · MCP 0 · 6 skill (1 yönlendirici + write/review/refactor/recreate/hemingway)
- sıradan turda bağlama: yalnız skill frontmatter'ları. Ölçüldü: ana `sepia` açıklaması 741 karakter, diğer beşi 100-190 karakter; toplam ~1.5 KB ≈ **~380 token**. Gövde (`SKILL.md` toplamı 16 KB) ve `research/` (9 dosya, 119 KB) çağrılmadan okunmuyor.
- premium: yok

## Ne yapar
Metnin "yapay" görünmesini kelime düzeyinde değil anlatı mimarisi düzeyinde onarır; kurgu için üç geçişli protokol, profesyonel metin (sürüm notu, PR yanıtı, postmortem, bilet, teknik yazı) için tür başına kural seti uygular. Dört işlem: write, review, refactor, recreate.

## Core'a alınacak
- **kitap — "yapay metin izleri" rafı**: `research/` altındaki dosyalar (storyscope 10 KB, rhythm-syntax 12 KB, detectors 8 KB, sources 42 KB) tam olarak Core'un pasif raf biçimi: kaynaklı, ölçülü, istenince okunan. README ve doküman dilinin Türkçe/İngilizce ikizini yazarken doğrudan işe yarar.
- **fikir — yönlendirici + dar giriş ayrımı**: bir geniş açıklamalı ana skill, yanında yalnız açıkça istendiğinde tetiklenen 100-190 karakterlik dar girişler. Core'un `??`/`pp` öneklerinde aynı ayrım maliyeti düşürür.
- **fikir — davranış eval'i CI'da**: `evals/` altında istem + beklenen davranış; Core'un kanca davranışını `npm test` dışında böyle sınamak mümkün.

## Karar
Al — `research/` doğrudan raf malzemesi ve ölçülen sıradan tur maliyeti ~380 token; kitap olarak alınırsa o da sıfıra iner.
