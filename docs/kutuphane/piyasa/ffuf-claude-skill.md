# jthack/ffuf_claude_skill

- lisans yok · tek skill (elle `~/.claude/skills/` altına kopyalanır, plugin değil) · ★211
- mekanizma: 1 skill · 0 kanca · 0 komut · 0 ajan · 0 MCP. Depoda 5 dosya: `SKILL.md` (17.381 bayt ≈ ~4.300 token, gövde yalnız çağrılınca yüklenir), `ffuf_helper.py`, `resources/WORDLISTS.md`, `resources/REQUEST_TEMPLATES.md`.
- sıradan turda bağlama: frontmatter'daki `name` + `description` yalnızca **178 bayt ≈ ~45 token**; gövde ancak skill tetiklenince açılıyor.
- premium: yok

## Ne yapar
ffuf web fuzzer'ını Claude Code'a öğreten tek dosyalık bir bilgi paketi: FUZZ anahtar sözcüğü, çoklu sözcük listesi kipleri (clusterbomb / pitchfork / sniper), oto-kalibrasyon, kimlik doğrulamalı ham istekle tarama ve sonuç filtreleme. Kendisi hiçbir şey çalıştırmıyor; Claude'un ffuf'u doğru kurmasını sağlıyor.

## Core'a alınacak
- **fikir** — "ince frontmatter, kalın gövde" oranı: ~45 token sabit maliyete karşı ~4.300 token'lık gövde, yalnız gerekince. Core'un raf mantığının skill biçimindeki karşılığı; kütüphane rafları için iyi bir ölçü hedefi.
- konu (web güvenlik taraması) Core ile ilgisiz.

## Karar
Fikir notu — içerik alakasız, ama frontmatter/gövde oranı (45 token'a karşı 4.300) Core'un raf tasarımı için ölçülmüş bir referans.
