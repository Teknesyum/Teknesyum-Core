# lackeyjb/playwright-skill

- MIT · plugin sarmalı içinde Agent Skill · ★3109
- mekanizma: 0 kanca, 0 komut, 0 ajan, 1 skill, 0 MCP; 1 çalıştırıcı betik (`run.js`, 3,8 KB) + `lib/helpers.js`
- sıradan turda bağlama: ~408 bayt frontmatter description, ~100 token; SKILL.md 8 KB ve `API_REFERENCE.md` 17 KB yalnız tetiklenince. Ölçüm: frontmatter + `wc -c`
- premium: yok

## Ne yapar
Ajanın Playwright kodunu kendisi yazıp çalıştırmasını sağlayan skill; hazır komut listesi değil, taşınabilir bir çalıştırıcı sunuyor. Dev sunucusunu kendi buluyor, betiği saklanabilir bir eser olarak bırakıyor.

## Core'a alınacak
- **fikir**: SKILL.md'nin "Path resolution" bölümü — skill'in nereye kurulduğunu bilmediği için önce kendi dizinini `SKILL_DIR` olarak çözdürüyor, kabuk durumu kalıcı değilse yolu düz yaz diyor. Core raflarında betik yolu (`<eklenti>` sürüm klasörü) aynı sorunda; bu iki satır Core'un raf başlıklarına uyarlanabilir.
- **fikir**: `allowed-tools: Bash(node:*) Bash(npm:*) Read Write` — rafa "yalnız şu araçlar" sınırı yazmak, izin sorusunu azaltır.
- hiç (kitap/kanca yok — konu tarayıcı otomasyonu, Core'un alanı değil)

## Karar
Fikir notu — mekanizması temiz ama içeriği Core'un işine yaramıyor; alınacak olan iki biçim alışkanlığı.
