# ayoubben18/ab-method

- MIT · kurulum biçimi: `npx ab-method` ile dosya kopyalayan CLI (plugin değil) · ★189
- mekanizma: 16 slash komut, 32 skill (16 iş akışı + 16 yardımcı), 8 alt ajan, 0 kanca, MCP yok
- sıradan turda bağlama: 32 SKILL.md frontmatter açıklaması toplam 8.9 KB (`awk` ile description blokları sayıldı) ≈ 2.2K token; ayrıca 8 ajan açıklaması. Core'un sıfırına karşı her turda sabit yük.
- premium: yok

## Ne yapar

Bir isteği önce "grill" (sorgulama) turlarıyla alan modeline oturmuş plana çeviriyor, sonra ya
tek tek onayladığın TDD görevlerine ya da doğrulanabilir durma koşuluna kadar koşan `/goal`
döngüsüne veriyor. Claude Code ve Codex için aynı `.ab-method/core/*.md` tanımlarını okuyor.

## Core'a alınacak

- **kitap** — `grill-me` kuralı: soruları teker teker sor, önerilen cevabı da ver, kod tabanından
  cevaplanabilecek soruyu sorma, git oku. Core'un `netleştir` akışına doğrudan oturur, 10 satır.
- **fikir** — "grill ortasında çıkan yan konu handoff'a yazılır, ana konu bölünmez". Core'un
  `.claude/handoff.md` mekanizmasında karşılığı yok; yan konu şu an ya kaybolur ya turu böler.
- **fikir** — iş akışı tanımlarını (`.ab-method/core/*.md`) skill'den ayrı düz dosyada tutmak:
  aynı metni iki runtime okuyor, bağlama girmiyor. Core'un raf mantığının aynısı, bağımsız doğrulama.

## Karar

fikir notu — mekanizması Core ilkesine ters (32 skill her turda 2.2K token), ama grill kuralı ve
yan-konu handoff'u kitap olarak alınır.
