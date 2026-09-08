# Imbad0202/academic-research-skills

- CC-BY-NC-4.0 · plugin · ★47005
- mekanizma: 4 skill, 42 ajan dosyası (3'ü plugin'e açık), 16 komut, 2 kanca (SessionStart duyuru + PreToolUse `run_guard.sh`), 0 MCP
- sıradan turda bağlama: 4 skill frontmatter'ı 3501 B (~875 token) + SessionStart duyurusu; kanca ölçüldü, skill gövdeleri tembel.
- premium: yok (ticari kullanım lisansla kapalı)

## Ne yapar
Akademik boru hattı: araştır → yaz → hakem → revize → bitir. 27 mod, 39 rol; alıntı doğrulama ve iddia-sadakati kapıları deterministik betiklerle.

## Core'a alınacak
- pasif betik: `hooks/run_guard.sh` — Windows'ta `python3`un 0 baytlık Store stub'ı yüzünden kanca patlıyordu; launcher gerçek Python'u arar, bulamazsa geçerli PASS_THROUGH JSON basıp `exit 0` yapar, stderr'e hiçbir şey yazmaz. Core'un Windows kancaları için birebir ders.
- fikir: PreToolUse yazma-kapsamı kapısı (Write|Edit|Bash) — "asla `allow` verme, karar yoksa normal izin akışına düş" kuralı yorumda gerekçeli.
- fikir: `plugin.json` açıklamasında sürüm-sürüm yetenek tavanı ve `STAGE_CAPABILITY_MATRIX.md` linki; Core'un yol haritasına benzer ama makine okunur yerde.

## Karar
Fikir notu · boru hattının kendisi Core'a yabancı, ama Windows kanca launcher deseni doğrudan alınacak kadar somut.
