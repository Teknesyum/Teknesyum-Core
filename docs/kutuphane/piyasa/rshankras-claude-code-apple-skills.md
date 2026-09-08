# rshankras/claude-code-apple-skills

- MIT · plugin (`.claude-plugin/plugin.json`) + skill ağacı · ★710
- mekanizma: 183 SKILL.md (README 164 diyor), 0 kanca, 0 komut, 0 ajan, 0 MCP; 526 dosya; CLAUDE.md 3,7 KB (depo içi, kullanıcıya gitmiyor)
- sıradan turda bağlama: 183 skill frontmatter'ı 52.517 B ≈ 13.100 token — dilim 44'ün en pahalı ikinci deposu
- premium: yok (dört depoluk yığının bir katmanı: bilgi / iş akışı / eylem / entegrasyon)

## Ne yapar
Apple platformları için 164 skill. Yapı iç içe: `skills/{kategori}/SKILL.md` girişi, altında alt-skill'ler ve destek `.md` dosyaları — kademeli açılım. Frontmatter'da alışılmadık iki alan var: `last_verified` (içeriğin son doğrulandığı tarih) ve `review_by` (yeniden doğrulama randevusu, "WWDC'den ~2 hafta sonra").

## Core'a alınacak
- kitap: `last_verified` + `review_by` alanları — Core kütüphanesinin en büyük açığı bayatlama; her rafa iki tarih alanı eklemek bedava ve bayat metni ölçülebilir kılıyor.
- fikir: dört katmana ayırma (bilgi / iş akışı / eylem / entegrasyon) ve ayrı depolar — kullanıcı yalnız ihtiyacı olan katmanı kuruyor, 13,1k token'ın tamamını yüklenmiyor.
- hayır: 183 skill'in kendisi; alan da maliyet de Core'a uygun değil.

## Karar
Fikir notu — 13,1k token sabit gider ilkeye aykırı, ama `last_verified`/`review_by` tarih çifti bugün rafa eklenebilecek en ucuz iyileştirme.
