# itsmostafa/aws-agent-skills

- MIT · plugin (marketplace) / Codex skill-installer · ★1150
- mekanizma: 18 skill (her biri SKILL.md + `best-practices.md`/`policies.md` yan dosyaları, toplam 456 KB), kanca 0, komut 0, ajan 0, MCP 0; 2 Python betiği (433 satır) GitHub Action'da çalışıyor
- sıradan turda bağlama: 18 frontmatter toplam 7.295 bayt ≈ 1.820 token, her turda yüklü. Gövdeler ve yan dosyalar yalnız skill çağrılınca okunuyor.
- premium: yok

## Ne yapar

18 AWS servisi için damıtılmış, LLM'e göre sıkıştırılmış bilgi paketi. README'de MCP'ye karşı açık bir tez var: MCP canlı doküman ve şema akıtır, bu paket yerel ve önceden sıkıştırılmış olduğu için bağlam penceresini küçük ve öngörülebilir tutar, gecikme ve kimlik bilgisi yüzeyi getirmez.

## Core'a alınacak

- **pasif betik**: `scripts/check-aws-updates.py` deseni — kaynak dokümanın RSS akışını izleyip `tracking/last-check.json` ve `pending-updates.json` ile rafın tazeliğini takip ediyor, değişiklik varsa issue açıyor. Core'un kütüphane raflarının bayatlamasını ölçmek için birebir uyarlanabilir; model çalıştırmıyor, Action çalıştırıyor.
- **fikir**: frontmatter'a `last_updated` ve `doc_source` alanları koymak — rafın hangi tarihli kaynaktan damıtıldığı okunmadan görülüyor.
- **fikir**: "MCP yerine yerel damıtılmış metin" gerekçesinin sayıyla savunulması; Core'un aynı tezini dışarıdan destekleyen bir örnek.

## Karar

Al — bilgi içeriği (AWS) Core'a gerekmez, ama tazelik takibi betiği ve `last_updated`/`doc_source` alanları raf disiplinine doğrudan girer; 1.820 tokenlik skill yükü alınmaz.
