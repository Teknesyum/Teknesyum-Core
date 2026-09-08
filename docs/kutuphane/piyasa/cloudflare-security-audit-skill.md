# cloudflare/security-audit-skill

- MIT · metin paketi (tek skill + 9 referans dosyası) · ★3246
- mekanizma: 1 SKILL.md (10.751 B), 9 markdown referans, `report-schema.json`, `validate-findings.cjs`; kanca 0, komut 0, ajan 0, MCP 0. Toplam metin 86.007 B.
- sıradan turda bağlama: yalnız `description:` satırı 325 B ≈ 80 token; gövde ancak tetiklenince okunur — Core'un pasif raf modeliyle aynı.
- premium: yok

## Ne yapar
Ajanı altı fazlı güvenlik denetçisine çevirir: keşif, paralel avlanma, bulguyu çürütmeye çalışan doğrulama, rapor, şemaya uygun `findings.json`, sonra olguları kaynak koda karşı bağımsız doğrulama. Aynı depoda tekrar koşumlar toplanır; önceki `findings.json` okunup bilinenler atlanır.

## Core'a alınacak
- kitap: dosya bölme düzeni — 86 KB bilgi tek dosyada değil, 9 konu dosyasında; giriş dosyası hangisinin ne zaman okunacağını söyler. Core'un raf yapısına doğrudan örnek.
- betik: `validate-findings.cjs` + `report-schema.json` — modelin ürettiği raporu şemaya karşı deterministik doğrulama; Core'un "angaryada önce deterministik araç" kuralının somut hali.
- fikir: üreten değil çürütmekle görevli ayrı geçiş; Core'un danışma turuna eklenebilir.

## Karar
Al — kitap olarak rafa; salt metin, ajan/skill kurmuyor, ilkeyi hiç bozmuyor.
