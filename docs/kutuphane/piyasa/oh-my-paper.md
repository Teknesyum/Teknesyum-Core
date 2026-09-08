# LigphiDonk/Oh-my--paper

- MIT · plugin (marketplace) + Tauri masaüstü · ★721
- mekanizma: 3 kanca olayı (`SessionStart`, `Stop`, `PostToolUse:Write`), 16 komut, 10 ajan, 35 skill (Codex ikizleriyle 71 dosya), 0 MCP
- sıradan turda bağlama: 35 skill'in `description` alanları toplam ~29.945 bayt ≈ **7.500 token**, her turda; `awk` ile description blokları toplanıp `wc -c`. Üstüne SessionStart kancası `.pipeline/.session-context.md` yazıyor (proje `.pipeline/` yoksa sessizce çıkıyor, 5 dk TTL)
- premium: yok

## Ne yapar
Claude Code'u araştırma laboratuvarına çeviriyor: literatür taraması, fikir değerlendirme, deney tasarımı, makale yazımı için 5 aşamalı boru hattı. Aşama geçişlerini `PostToolUse:Write` kancasıyla izliyor, tamamlanmayı `Stop` ile kaydediyor.

## Core'a alınacak
- fikir: **TTL'li oturum bağlamı** — kanca üretilmiş bağlamı 5 dakikadan yeniyse hiç yeniden yazmıyor; Core'un devir/handoff kancasında aynı ucuzlatma uygulanabilir.
- fikir: kancanın ilk işi "bu proje benim projem mi" kontrolü (`.pipeline/` yoksa `return`); Core'un "sıradan turda sıfır"ının bir başka uygulaması.
- kitap: 7.500 token'lık skill kataloğunun maliyeti — kütüphane rafına karşı "her şeyi skill yap" yaklaşımının ölçülmüş fiyatı.

## Karar
fikir notu — alan (akademik yazım) Core dışı, ama 7,5k token'lık daima-yüklü katalog ilkeyi doğrulayan en iyi karşı ölçü.
