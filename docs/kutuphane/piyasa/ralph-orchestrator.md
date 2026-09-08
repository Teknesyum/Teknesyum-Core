# mikeyobrien/ralph-orchestrator

- MIT · CLI (Rust/npm) + yaninda 3 skill'lik eklenti · ★3127
- mekanizma: 3 skill (ralph-hats, ralph-loop, ralph-docs), 0 kanca, 0 komut, 0 ajan, 0 MCP; asil urun `ralph` CLI'si, 11 hazir preset YAML
- siradan turda baglama: yalnizca 3 skill frontmatter'i — name+description toplam 1117 bayt, ~280 token (sed ile frontmatter cikarilip wc -c). Depo koku CLAUDE.md 9 bayt (`AGENTS.md` satiri), AGENTS.md 11.6 KB ama o gelistirici tarafi, kullaniciya kurulmuyor
- premium: yok

## Ne yapar
Ralph, gorev bitene kadar ajani dongude tutan disaridan bir kosucu. Her tur bir "sapka" (hat) giyer: preset YAML'da rolun adi, tetikleyen olaylari, yayinladigi olaylari ve talimati yazilidir. Dongu `LOOP_COMPLETE` sozu ya da iterasyon/sure tavani gorene kadar doner.

## Core'a alinacak
- kitap: sapka/olay topolojisi — tek uzun oturum yerine rol basina ayri tur, her rolun kendi talimati ve "hangi olayi yayinlarsa siradaki kim" kurali. Core'un pasif rafina mekanizma notu olarak yakisir.
- fikir: `completion_promise` + `max_iterations` + `max_runtime_seconds` ucusu — bitis sarti metinle degil, tek anahtar sozcuk ve iki sayisal tavanla tanimlaniyor; Core'un plan/handoff makinesinde ucuz karsiligi var.
- fikir: presetleri kod degil veri tutmak (`presets/*.yml`, `index.json`) — Core'un sabit metinleri model yazmasin ilkesiyle ayni yon.

## Karar
fikir notu — CLI'nin kendisi Core'a girmez ama sapka/olay ve bitis-sozu mekanizmasi raf notu degerinde.
