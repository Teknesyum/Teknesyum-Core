# EveryInc/compound-engineering-plugin

- MIT · plugin (Claude Code marketplace, 14 ajan barındırıcı) · ★24956
- mekanizma: 33 skill, 0 kanca, 0 slash komut, 0 ajan, 0 MCP; her skill `references/` + `scripts/` ile besleniyor (ce-brainstorm tek başına 20 referans dosyası, 3 betik)
- sıradan turda bağlama: CLAUDE.md 9 B (boş) + 33 SKILL.md `name`+`description` 8370 B ≈ 8,2 KB ≈ ~2100 token; gövdeler ve `references/*` yalnız skill tetiklenince okunuyor
- premium: yok

## Ne yapar
Beyin fırtınası → plan → yap → gözden geçir → öğrenileni yaz döngüsünü 33 skill'e bölüyor.
Skill gövdeleri ince, ağır bilgi `references/` altındaki ayrı markdown'larda duruyor; model
ancak o adıma gelince ilgili referansı açıyor. Betikler (`pr-snapshot`, `peer-job-runner.py`)
modelin yazmaması gereken deterministik işi üstleniyor.

## Core'a alınacak
- kitap: ince `SKILL.md` + kalın `references/<konu>.md` deseni — Core'un raf yapısının
  piyasadaki en temiz karşılığı; 33 skill'e rağmen tur başına 8,2 KB'de kalması bunun kanıtı.
- pasif betik: `scripts/pr-snapshot` gibi "modelin yazmayacağı sabit çıktı" betikleri;
  Core'daki `scaffold.js` mantığının genişletilmiş hali.
- fikir: "öğrenileni yaz" adımının döngünün resmî parçası olması — Core'un `log.js` hata
  günlüğü tur sonunda değil, gözden geçirme adımında tetiklenebilir.

## Karar
Al — kitap olarak; ince skill + kalın referans deseni, pasif kütüphane ilkesini bozmadan ölçeklenmenin ölçülmüş örneği.
