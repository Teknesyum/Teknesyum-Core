# larashero3-dotcom/lieflat-charts

- OTHER (özel lisans + THIRD_PARTY_NOTICES) · tek skill (şablon paketi) · ★4977
- mekanizma: 1 SKILL.md (37917 B), `templates/`, `color-presets.js`, `mono-tokens.js`, `catalog.md`, `report-catalog.md`, ajan dizini; 0 kanca, 0 komut, 0 MCP
- sıradan turda bağlama: frontmatter 470 B (~118 token); gövde 37,9 KB (~9500 token) çağrılınca — tek skill için ağır
- premium: yok; çıktıda geliştiriciye atıf isteniyor

## Ne yapar
Şablon güdümlü veri görselleştirme ve rapor üretimi. Mono gri tabanı varsayılan; veri anlamına göre üç hazır renk ön ayarından biri otomatik seçilir, kullanıcı marka rengi verirse custom palet kurulur. Tek dosyalık, kurulum gerektirmeyen HTML çıkarır.

## Core'a alınacak
- kitap: "aynı teslimatta renk sistemleri karıştırılmaz, Mono her zaman güvenli taban" kuralı — Core'un "renk/ölçü uydurma" kuralının çalışan biçimi.
- fikir: `color-presets.js` + `mono-tokens.js` — renkler metinde değil, betikte token olarak; model uydurmuyor, dosyadan okuyor. `teknesyum-ui` kurulana kadar bu desen taklit edilebilir.
- fikir: `catalog.md` / `report-catalog.md` ayrımı — şablon seçimi katalogdan, gövde yalnız seçilen şablon için okunuyor.

## Karar
Fikir notu · 9500 token'lık gövde pahalı, ama renk-token'ı-betikte deseni `teknesyum-ui` beklerken doğrudan işe yarar.
