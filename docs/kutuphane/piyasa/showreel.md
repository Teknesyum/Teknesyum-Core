# HeyRenan/showreel

- MIT · kurulum biçimi: Claude Code plugin (marketplace.json + plugin.json) · ★10
- mekanizma: 0 kanca, 0 komut, 0 ajan, 0 MCP; 2 skill (`showreel`, `guide`) ve ~40 `.mjs`/`.sh`
  betik. Ağır iş skill değil betikte: `scripts/annotate.mjs`, `lib/autoplace.mjs`, `rec-*.mjs`.
- sıradan turda bağlama: yalnız 2 skill frontmatter açıklaması, toplam ~0.7 KB ≈ 180 token
  (SKILL.md başlıklarından sayıldı). Gövdeler 17 KB + 1.4 KB, ancak skill çağrılınca okunuyor.
- premium: yok

## Ne yapar

URL + CSS seçici alıp açıklamalı ekran görüntüsü, akış GIF'i, terminal kaydı ve önce/sonra
karşılaştırması üretiyor. Kendi headless Chromium'unu paketliyor; ajan piksel tahmin etmiyor,
DOM ölçülüyor ve çıktı kaydedilmeden önce (baskınlık, çakışma, kontrast, hedef metin) doğrulanıyor.

## Core'a alınacak

- **kitap** — "ajan piksel konuşmaz, seçici konuşur; çıktıyı kaydetmeden önce betik doğrular"
  ilkesi. Core'un `teknesyum-ui` boşluğunda (renk/ölçü uydurma yasağı) doğrudan işe yarayan raf.
- **fikir** — mekanizma deseni: kalın gövdeyi skill'e değil betiğe koy, skill yalnız hangi betiğin
  ne aldığını söylesin. 40 betik karşılığında turda 180 token — Core'un kendi ölçütünü doğruluyor.
- **hiç** — betiklerin kendisi alınmaz; Chromium indiren 40 dosyalık motor Core'un kapsamı değil.

## Karar

fikir notu — mekanizma deseni (ince skill + kalın betik + kendini doğrulayan çıktı) kitaba yazılır,
kod alınmaz.
