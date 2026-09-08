# samber/cc-skills-golang

- MIT · plugin (marketplace) + skills dizini · ★3204
- mekanizma: 46 skill, 0 kanca, 0 komut, 0 ajan, 0 MCP; ayrica Cursor icin `rules/golang-always.mdc` (8.8 KB, `alwaysApply: true`)
- sıradan turda bağlama: 46 SKILL.md frontmatter `description` satırı toplam 28.7 KB (~7.2k token; `awk '/^description:/' skills/*/SKILL.md | wc -c`). Depo CLAUDE.md'si 74 KB ama o yalnız katkıcıya.
- premium: yok

## Ne yapar
Go icin uretim seviyesinde 46 ayrı skill: performans, eszamanlilik, hata yonetimi, gozlemlenebilirlik, gRPC, lint. Her skill kendi frontmatter'inda "ne zaman kullan / ne zaman kullanma" yaziyor ve baska skill'e ok veriyor (`→ See samber/cc-skills-golang@golang-benchmark`). Yazar el ile duzenledigini ve AI ciktisini kabul etmedigini one cikariyor.

## Core'a alınacak
- fikir: 46 skill'in yalnız açıklamaları 7.2k token sabit maliyet — Core'un "raf" tercihinin ölçülmüş karsit ornegi; kütüphaneye bu sayıyla giren bir not, pasif rafın neden dogru oldugunu kanitlar.
- kitap: skill/raf yazim bicimi — her basligin "ne zaman kullanma" satiri ve komsu rafa ok. Core raflarinda bu iki alan yok, ucuz ve isabet artirici.
- fikir: `rules/*.mdc` gibi tek dosyada yonlendirme tablosu; Core'da rafların indeksini tek dosyada tutmanin karsiligi.

## Karar
fikir notu — icerik Go'ya ozel ve alinmaz, ama 46 skill = 7.2k sabit token olcumu Core'un tezini destekleyen en somut piyasa verisi.
