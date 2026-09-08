# wshobson/agents

- lisans: MIT
- kurulum biçimi: plugin (marketplace) — ayrıca Codex/Cursor/Antigravity/OpenCode adaptörleri, "skills only" kurulum (`gh skill`, `npx skills`)
- mekanizma: 94 plugin (92 yerel + 2 git-subdir), 202 ajan, 183 skill, 105 komut, 2 hooks.json (yalnız `protect-mcp` ve `review-agent-governance` pluginlerinde — PreToolUse/PostToolUse, her araç çağrısında `npx protect-mcp` ile Cedar policy + Ed25519 imzalı makbuz)
- sıradan turda bağlama: repo kökünde her-zaman-yüklü içerik yok; `CLAUDE.md` 9 bayt (yalnız `AGENTS.md`'ye link), `AGENTS.md` ~6 KB (~1.5K token) — ama bu depo geliştirme rehberi, kurulan plugin değil. Kurulan tek bir plugin yalnız kendi skill description'larını + varsa kendi hooks.json'ını yükler; marketplace'in tamamı asla birden yüklenmiyor (README: "Installing a plugin loads only its components into context — not the whole marketplace").
- premium: yok. Bir plugin (payment-processing, pricing-optimization vb.) konu olarak ödeme/pricing işler ama depo kendisi ücretsiz.

## Ne yapar
Claude Code (+ Codex/Cursor/Antigravity/OpenCode) için 94 parçalı bir uzmanlık marketplace'i: her plugin tek konuya odaklı ajan+skill+komut seti, isteğe bağlı kurulur. İki plugin, her araç çağrısını Cedar politikasıyla onaylayıp Ed25519 imzalı zincir makbuzuna kaydeden bir governance/denetim katmanı ekliyor. Skill'ler progressive disclosure ile yalnız aktive olunca gövdesini yüklüyor.

## Kullanıcıya nasıl hissettirir
Sessiz — çağrılmayan plugin bağlama hiç girmiyor, komutlar `/plugin install <ad>` ile açıkça seçiliyor. `protect-mcp` kurulursa her araç çağrısı öncesi/sonrası npx alt-process çalışıyor, gecikme ve receipts/ klasörü üretiyor; banner yok, sadece exit code / receipt dosyası.

## Core'a alınacak
- fikir: "plugin kurulumu yalnız o pluginin bağlamını yükler, marketplace'in tamamı yüklenmez" ilkesi zaten Core'un sıfır-bağlam felsefesiyle örtüşüyor — doğrulama/referans olarak kullanılabilir, kopyalanacak kod yok.
- fikir: `protect-mcp`'nin PreToolUse/PostToolUse ile imzalı makbuz zinciri fikri — Core'un log.js'ine "kanıtlanabilir denetim izi" eklemek istenirse esin olabilir, ama npx bağımlılığı ve her-araçta-alt-process maliyeti nedeniyle doğrudan alınmaz.
- hiç: 202 ajan/183 skill'in kendisi metin kitabı, mekanizma değil — kütüphaneye (kitap) değil bu incelemeye göre plugine bakıldı, alınmadı.

## Ölçülecek
- `protect-mcp` kurulup denenirse: npx çağrısının araç başına eklediği gecikme (ms) ve receipts/ boyutu.

## Karar
fikir notu — mekanizma (marketplace izolasyonu, imzalı makbuz zinciri) esin verici ama doğrudan alınacak kod/kanca yok.
