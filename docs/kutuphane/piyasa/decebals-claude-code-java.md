# decebals/claude-code-java

- MIT · metin paketi + plugin.json (Agent Skills spesifikasyonuna uygun) · ★731
- mekanizma: 18 skill, 0 kanca, 0 komut, 0 ajan, 0 MCP; 65 dosya; ayrıca `templates/`, `evals/`, `scripts/`
- sıradan turda bağlama: 18 SKILL.md frontmatter'ı 4.781 B ≈ 1.200 token (name+description satırları sayıldı) — dilim 44'ün en ucuz çok-skill'li deposu
- premium: yok

## Ne yapar
Java projeleri için yeniden kullanılabilir skill koleksiyonu: API sözleşme incelemesi, mimari inceleme, paket yapısı ve katman sınırları denetimi. Her skill'in frontmatter'ında `license` alanı ve "kullanıcı şunu derse" tetik cümleleri var; `evals/` altında skill'lerin kendi sınamaları duruyor.

## Core'a alınacak
- fikir: `evals/` — bir kitabın/raf maddesinin işe yarayıp yaramadığını ölçen sınama dosyaları. Core'un `bench/` altyapısı var, kütüphane raflarında karşılığı yok.
- kitap: skill frontmatter'ında `license` alanı — Core'un kütüphanesi dış metin topluyor, kaynağın lisansını maddenin yanında taşımak `scaffold.js`'in LICENSE disiplininin devamı.
- fikir: 18 skill'i 1.200 token'da tutan kısa açıklama disiplini (ortalama 265 B/skill) — ölçülebilir bir üst sınır örneği.

## Karar
Fikir notu — Java alanı Core'a uzak, ama 265 B/skill açıklama disiplini ve raf başına eval fikri ölçülebilir biçimde değerli.
