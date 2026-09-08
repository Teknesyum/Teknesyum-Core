# nidhinjs/prompt-master

- MIT · metin paketi (tek skill) · ★12526
- mekanizma: 1 SKILL.md + `references/`, 0 kanca, 0 komut, 0 ajan, 0 MCP
- sıradan turda bağlama: frontmatter 382 B ≈ 0,4 KB / ~95 token
- premium: yok

## Ne yapar
Hedef araca (Claude Code, Cursor, Midjourney, v0…) göre istem yazan tek beceri.
Boru hattı: aracı sapta, niyeti 9 boyutta çıkar (görev, girdi, çıktı, kısıt, bağlam,
hedef kitle, bellek, başarı ölçütü, örnek), eksikse en çok 3 soru sor, sonra yaz.
Sloganı: "En iyi istem en uzunu değil, her sözcüğü yük taşıyanı."

## Core'a alınacak
- kitap: istem yazımı rafı — Core alt ajanlara Türkçe istem veriyor; 9 boyutlu çıkarma listesi bu istemler için hazır ölçüt.
- fikir: "en çok 3 soru" tavanı — Core'un netleştirme adımıyla aynı hedefte, sayısal sınır getiriyor.

## Karar
Fikir notu — 95 tokenlık ucuz bir raf ama Core'un netleştirme akışı aynı işi zaten yapıyor; ölçüt listesi not olarak alınır.
