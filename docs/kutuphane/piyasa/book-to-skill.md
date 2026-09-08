# virgiliojr94/book-to-skill

- MIT · metin paketi + CLI (Python) · ★29101
- mekanizma: 1 SKILL.md, 0 kanca, 0 komut, 0 ajan, 0 MCP; `book_to_skill/` altında 7 ayrıştırıcı (pdf, epub, docx, html, rtf, text, calibre) + `scripts/extract.py`
- sıradan turda bağlama: CLAUDE.md 139 B + tek skill frontmatter 448 B ≈ 0,6 KB / ~150 token (wc -c ile ölçüldü)
- premium: yok; GitHub Sponsors bağlantısı var

## Ne yapar
PDF/EPUB/DOCX/HTML/MD/RTF/MOBI belgelerini ayrıştırıp kitabı "beceri" biçiminde yapılandırır.
İlkesi özet çıkarmak değil yapı çıkarmak: adlandırılmış çerçeveler, ilkeler, teknikler,
anti-desenler ve yazarın ses ayarı. Ayrıştırma Python'da, yorum modelde.

## Core'a alınacak
- pasif betik: belgeden raf üretme hattı — Core'un `kutuphane.js fetch`'i depo çekiyor; PDF/EPUB'dan kitap üretmenin ayrıştırıcı katmanı burada hazır.
- fikir: "özet değil yapı çıkar" kuralı — raf kitaplarının biçim şartnamesi olarak yazılabilir (çerçeve adı, ilke, teknik, anti-desen).
- fikir: tek beceriyle çok ajan uyumu — `allowed-tools` bilerek boş bırakılıp HTML yorumunda araç eşlemesi tutuluyor.

## Karar
Al — 0,6 KB bağlamla çalışan, Core'un raf üretimini doğrudan besleyen ayrıştırıcı hat.
