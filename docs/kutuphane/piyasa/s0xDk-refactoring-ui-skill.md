# s0xDk/refactoring-ui-skill

- OTHER (kitap telifi dışarıda) · metin paketi (tek skill + 3 referans dosyası) · ★539
- mekanizma: 1 skill, 3 referans (`systems.md`, `techniques.md`, `diagnose.md`), 0 kanca/komut/ajan/MCP; 7 dosya
- sıradan turda bağlama: yalnız frontmatter 612 B ≈ 150 token; gövde ve referanslar ancak tetiklenince okunuyor (SKILL.md ilk 14 satırı sayıldı)
- premium: yok

## Ne yapar
Refactoring UI kitabının (Wathan & Schoger) mekanik kararlarını sabit ölçeklere indirger: 4-768 aralığında boşluk ölçeği, 12-72 tip ölçeği, iki font ağırlığı, gölge/radius setleri. "Uydurma değer yok, listeden seç" kuralını ve "kötü görünüyor" şikâyetini somut düzeltmeye çeviren teşhis akışını içerir.

## Core'a alınacak
- kitap: doğrudan rafa girecek türden — RULES.md'de "renk/ölçü uydurma, `teknesyum-ui` içinde kal" kuralı var ama ölçeklerin kendisi hiçbir yerde yazılı değil; `teknesyum-ui` kurulana kadar boşluğu bu kapatır.
- fikir: bitişik iki değer arası ≥%25 olmalı kuralı — token ölçekleri üretilirken kullanılacak tek satırlık sınama.
- kitap: "em kullanma, px/rem" gerekçesi (0.875em × 1.25em = 17,5px, ölçek sessizce yok olur) — kısa ve olgusal.

## Karar
Al — 150 token boşta duran, tetiklenince açılan tam bir kitap; Core'un pasif raf modeline birebir uyuyor ve mevcut bir eksiği kapatıyor.
