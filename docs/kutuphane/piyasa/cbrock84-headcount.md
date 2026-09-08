# cbrock84/headcount

- MIT · plugin pazar yeri (16 bölüm) · ★1322
- mekanizma: 16 eklenti, 172 skill, 0 kanca, 0 komut, 0 MCP; skill adları `bölüm:skill` biçiminde
- sıradan turda bağlama: skill açıklamaları toplamı 68.742 B ≈ 17k token (172 `description:` satırının byte toplamı). Hepsi kurulursa her tur bu ücret; tek bölüm (ör. `security`, 8 skill) ~3 KB.
- premium: yok

## Ne yapar
Claude Code'u şirket gibi kurgular: bir "CEO" altında 16 departman, her departman bağımsız kurulabilir eklenti, toplam 172 uzman skill'i. Kurulum seçici olduğu için proje yalnız ihtiyacı olan departmanı yükler; skill'ler sohbet eşleşmesiyle kendi açılır.

## Core'a alınacak
- fikir: `bölüm:ad` ad alanı — 172 parça arasında ad çakışmasını önleyen kural; Core'un 14 rafı büyürse aynı kural gerekir.
- kitap: `plugins/security/.claude-plugin/plugin.json` içindeki "reviewer-class: blocking findings are not overrulable by the department under review" cümlesi — role yetki sınırı yazma kalıbı.

## Karar
Fikir notu — gövdesi skill yığını, Core hiçbir şeyi skill olarak kurmadığı için alınamaz; yalnız ad alanı ve yetki-sınırı kalıbı not edilir.
