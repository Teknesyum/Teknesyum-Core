# dmmulroy/anti-slop

- MIT · vendor edilen Oxlint eklentisi + 1 kurulum skill'i · ★4172
- mekanizma: 1 skill (`install-anti-slop`), 0 kanca, 0 komut, 0 ajan, 0 MCP; ~15 lint kuralı `src/rules/` altında test dosyalarıyla
- sıradan turda bağlama: skill frontmatter'ı 249 B (~62 token); kural gövdesi hiç yüklenmiyor, Oxlint çalıştırıyor.
- premium: yok

## Ne yapar
LLM'in ürettiği düşük-kanıtlı TypeScript/JavaScript kalıplarını reddeden Oxlint kuralları: `no-unknown-returns`, `no-runtime-typeof`, `no-chained-type-assertions`, `no-array-filter-map`, `no-reduce-accumulator-copy`, `no-unsafe-dictionary-type` gibi. npm paketi yok — depoya kopyalanır, kurallar artık senindir.

## Core'a alınacak
- kitap: kural adlarının kendisi bir "LLM kod kokuları" rafı — model yazarken neyi kaçınacağını 15 satırda alır, lint'e gerek kalmadan.
- fikir: "model gerekmiyorsa model kullanma" ilkesinin en temiz örneği — kalite denetimi deterministik linter'a devrediliyor, ajana değil.
- fikir: vendor modeli (npm bağımlılığı yok, kopyala ve sahiplen) — Core'un pasif betikleri için aynı dağıtım biçimi.

## Karar
Al · kural listesi ucuz bir kitap (bir sayfa) ve Core'un deterministik-araç kuralını olguyla besliyor.
