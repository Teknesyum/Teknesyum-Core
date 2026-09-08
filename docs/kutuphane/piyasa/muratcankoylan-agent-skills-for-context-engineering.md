# muratcankoylan/Agent-Skills-for-Context-Engineering

- MIT · metin paketi (skills klasörü, kurulum yok) · ★17947
- mekanizma: 23 SKILL.md (18'i `skills/` altında, gerisi örnek), 0 kanca, 0 komut, 0 ajan, 0 MCP; kök SKILL.md tek bir toplayıcı
- sıradan turda bağlama: kök frontmatter 310 bayt (~80 token); gövdeler ağır — `context-fundamentals/SKILL.md` tek başına 17.2 KB (~4.3k token), CLAUDE.md 8.5 KB
- premium: yok

## Ne yapar
Bağlam mühendisliğini konu konu anlatan bir okuma seti: bağlam bozulması (lost-in-the-middle, U eğrisi), sıkıştırma, dosya sistemini bağlam olarak kullanma, çok ajanlı desenler, değerlendirme. Akademik atıf almış; skill biçiminde ama aslında ders metni.

## Core'a alınacak
- **kitap**: `context-degradation` + `context-compression` içeriği Core kütüphanesine "bağlam" rafı olarak birebir uygun — Core'un tüm ilkesi (sıradan turda sıfır token) bu metnin savunduğu şeyin uygulaması, gerekçeyi yazılı tutar.
- **kitap**: `filesystem-context` — bilgiyi bağlama değil diske koyup istenince okutma; Core'un pasif raf tasarımının literatür dayanağı.
- **fikir**: `advanced-evaluation` içindeki ajan davranışı ölçüm başlıkları bench raporuna kolon önerisi olarak alınabilir.

## Karar
Al (kitap) · içerik Core'un raf biçimine hazır; ama skill olarak kurulmaz, ~4k token'lık gövdeler yalnız istenince okunacak rafa konur.
