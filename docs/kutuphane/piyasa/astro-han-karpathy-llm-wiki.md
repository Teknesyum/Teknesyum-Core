# Astro-Han/karpathy-llm-wiki

- MIT · tek skill (metin paketi + 1 Python betiği) · ★2178
- mekanizma: 0 kanca, 0 komut, 0 ajan, 1 SKILL.md (14.6 KB), 4 şablon (0.3-1.3 KB), 1 pasif betik `check_evidence.py` (14.9 KB)
- sıradan turda bağlama: CLAUDE.md yok; yalnız skill frontmatter açıklaması (~260 karakter, ~65 token). Gövde ancak çağrılınca okunur.
- premium: yok

## Ne yapar
`raw/` (değiştirilemez kaynak) ve `wiki/` (derlenmiş bilgi sayfaları) iki katmanı tutar. Kaynak alınır, sayfaya derlenir, sorular sayfadan atıfla yanıtlanır. "Grounding invariant": wiki'deki her yük taşıyan olgu — sayı, tarih, alıntı — bağlı ham dosyada birebir geçer.

## Core'a alınacak
- **pasif betik**: `check_evidence.py` — rapor üretir, dosyaya dokunmaz; üç tarama (birebir geçme, atıfsız sayfa, hiç atıf almamış kaynak). Kapalı aday kümesi ilan edilmiş: 15+ karakter alıntı, ISO tarih, 4+ basamak / ekli / ondalıklı sayı. Core'un raflarındaki ölçümleri doğrulamak için birebir uyar.
- **kitap**: değiştirilemez kaynak + türetilmiş sayfa ayrımı; kaynak dokunulmadığı için bir kez doğrulanan sayfa doğrulanmış kalır, artımlı durum tutmaya gerek yok.
- **fikir**: "no material" günlüğü — alınan ama hiçbir şey katmayan kaynak işaretlenir, envanter taraması onu şikayet etmez.

## Karar
Al — Core'un kütüphane raflarındaki sayıları makineyle doğrulayan tek dosyalık pasif betik; model gerekmiyor.
