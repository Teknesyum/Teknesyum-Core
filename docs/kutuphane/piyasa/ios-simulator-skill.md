# conorluddy/ios-simulator-skill

- MIT · plugin (skill) · ★1245
- mekanizma: 0 kanca, 0 komut, 0 ajan, 1 skill, 0 MCP; 31 betik (python/bash), 5 referans md
- sıradan turda bağlama: yalnız SKILL.md frontmatter açıklaması, 254 B ≈ 65 token (`wc -c` frontmatter); gövde 22 KB yalnız skill tetiklenince okunur
- premium: yok

## Ne yapar
iOS uygulamasını Xcode/simülatörle kurar, çalıştırır, test eder. Ekran görüntüsü yerine erişilebilirlik ağacını okur; `screen_mapper.py` 5-7 satır (~10 token) verir, ekran görüntüsü 1600-6300 token yerine. Derleme çıktısı tek satır özet + `xcresult` kimliği, ayrıntı istenirse ayrı komutla açılır.

## Core'a alınacak
- fikir: **kademeli açma (progressive disclosure) betik sözleşmesi** — pahalı bir işin çıktısı tek satır özet + tutamak; ayrıntı ayrı çağrıyla. Core'un `map.js`/`log.js` çıktı biçimi için doğrudan uygulanabilir, ilkeye birebir uyuyor.
- kitap: "ölçülmüş token karşılaştırması ile araç çıktısı tasarımı" — 10 token vs 1600 token gibi somut sayılarla yazılmış tek raf.
- fikir: her betikte `--json` + `--help`; model betiği okumadan kullanır, bağlama sıfır girer.

## Karar
fikir notu — iOS alanı Core'a yabancı, ama tek satır özet + tutamak sözleşmesi ölçülmüş (65 token pasif, 22 KB tembel) ve Core'un çıktı disiplinine aynen alınabilir.
