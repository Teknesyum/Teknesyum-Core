# fivetaku/gptaku_plugins

- MIT · plugin marketplace (`.claude-plugin/marketplace.json`) · ★1121
- mekanizma: 18 eklenti, her biri ayrı git submodule (klonda gövdeleri boş geliyor); üst depoda 1 komut, 1 skill, CLAUDE.md 7475 B; hiç `hooks.json` yok (`find` ile arandı, 0 sonuç)
- sıradan turda bağlama: üst depo CLAUDE.md 7475 B / ~1870 token, ama bu yalnız marketplace deposunda çalışırken; kullanıcı tarafında maliyet kurduğu eklenti sayısına bağlı, ölçülemedi (submodule'ler boş)
- premium: yok

## Ne yapar
Kore'ce konuşan "AI Native" kullanıcılar için 18 eklentilik pazar yeri: engellenen siteleri arayan, herhangi bir URL'den tasarım sistemi çıkaran, kod inceleyen, ham fikri PRD'ye çeviren araçlar. Her eklenti bağımsız depo.

## Core'a alınacak
- **fikir**: **submodule başına eklenti** — tek marketplace deposu, her eklenti kendi deposunda sürümleniyor. Core tek eklenti; ileride raf sayısı büyürse rafları ayrı depoya almanın hazır deseni.
- **fikir**: `tikeytaka` — merkezî API anahtarı kasası eklentisi; Core'un özel rafı (`teknesyum-private`) ile aynı ihtiyaç, ayrı eklenti olarak çözülmüş.
- **hiç**: eklentilerin içeriği alınmaz (Kore diline ve dış servislere bağlı).

## Karar
Hayır — 18 eklentinin gövdesi submodule olduğu için ölçülemedi, üst depoda kanca yok ve içerik Core'a yabancı; yalnız depo düzeni fikri not edilir.
