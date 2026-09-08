# Wolfe-Jam/faf-cli

- MIT · CLI + plugin (1 komut, 1 skill) · ★39
- mekanizma: 0 Claude kancası (1 git pre-commit emoji denetimi), 1 komut (`/faf`, 1501 B), 1 skill (7811 B), 0 ajan, 0 MCP
- sıradan turda bağlama: skill açıklaması 419 B ≈ 105 token + ürettiği CLAUDE.md 1121 B ≈ 280 token (bu depoda `wc -c`); toplam ~385 token her turda
- premium: yok (npm paketi ücretsiz), ama README ağır pazarlama: IANA kaydı, DOI, rozetler

## Ne yapar
Depodan `project.faf` adlı tek bir bağlam dosyası üretir; oradan `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.cursorrules` yazar ve senkronda tutar. Yığını otomatik algılar, "AI okunabilirliği" puanı verir. `/faf` komutu `bunx faf` çıktısını olduğu gibi ekrana basar.

## Core'a alınacak
- fikir: **tek kaynaktan çok hedefli bağlam dosyası üretimi** — Core'un `scaffold.js`'i zaten sabit metin yazıyor; `AGENTS.md` + tek satırlık `CLAUDE.md` ikilisi bu depoda çalışan bir desen.
- fikir: komut çıktısını modele özetletmeme kuralı ("stream verbatim, do not summarize"), Core'un betik çıktısı ilkesiyle aynı.
- hiç: `.faf` formatının kendisi — 105 token'lık skill açıklaması + 280 token'lık üretilmiş CLAUDE.md sürekli bağlamda durur, Core'un sıfır token ilkesini bozar.

## Karar
fikir notu — desen doğru, ama her turda ~385 token sabit yük ve ağır marka anlatısı Core'a girmez.
