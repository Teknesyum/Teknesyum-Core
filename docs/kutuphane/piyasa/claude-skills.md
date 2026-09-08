# alirezarezvani/claude-skills

- MIT · plugin pazarı (99 plugin) + CLAUDE.md · ★25705
- mekanizma: 846 SKILL.md, 287 komut, 281 ajan dosyası, 20 kanca dosyası (7 hooks.json), 1 MCP (tessl)
- sıradan turda bağlama: hepsi kurulursa 846 skill frontmatter'ı 188297 B (~47000 token); depo CLAUDE.md'si tek başına 111519 B (~28000 token). 99 plugin'e bölünmüş olması tek kurtarıcı.
- premium: yok, ama `STORE.md` ile satış vitrini var

## Ne yapar
20 alanda üretim düzeyinde skill kütüphanesi: mühendislik, finans, pazarlama, uyum, C-seviye danışman personaları. Sayaçlar `scripts/derive_counters.py --check` ile ağaçtan türetiliyor.

## Core'a alınacak
- pasif betik: `engineering/security-guidance/security_reminder_hook.py` — dosya+kural başına oturumda **bir kez** uyarır, durum dosyasını 30 günde temizler, `ENABLE_SECURITY_REMINDER=0` ile susar. Core'un "eşikte bir kez konuşur" kuralının dışarıdan bağımsız doğrulaması.
- fikir: `scripts/derive_counters.py --check` — README'deki sayıları ağaçtan türet ve CI'da doğrula; Core'un raf sayısı için aynısı.
- fikir: `error-capture.sh` PostToolUse — başarıda sıfır çıktı, yalnız hata deseninde yakalar; Core'un `log.js`ine otomatik besleme.

## Karar
Fikir notu · içerik Core'un ölçeğine göre şişkin (47k token), ama üç mekanizma parçası doğrudan uygulanabilir.
