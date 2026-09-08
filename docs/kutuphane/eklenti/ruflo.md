# ruvnet/ruflo

- lisans: MIT
- kurulum biçimi: plugin marketplace (41 alt plugin) + MCP + CLI (`@claude-flow/cli`)
- mekanizma: temel `ruflo-core` — 4 ajan, 5 skill, 1 MCP sunucu (300+ araç iddiası), 2 hook noktası
  (PreToolUse/PostToolUse; Bash ve Write|Edit|MultiEdit'i yakalar, her biri `node -e` ile
  `ruflo-hook.cjs`'e düşer). Kök `.claude-plugin/hooks.json` (ayrı, eski "claude-flow" paketi)
  çok daha ağır: PreToolUse Bash/Write/Task/Grep-Glob-Read/mcp__claude-flow__* hepsini yakalar,
  UserPromptSubmit her promptu "route" eder, Stop/SubagentStop **prompt tipi** hook ile her
  turu bir LLM çağrısıyla değerlendirir (`type:"prompt"` — modele ekstra tur bindirir).
  41 plugin toplamında komut/ajan/skill sayısı çok daha yüksek (marketplace.json'da 41 giriş).
- sıradan turda bağlama: `ruflo-core` skill description'ları ~1.5 KB (~400 token). Hook'lar
  stdout'a normalde bir şey yazmıyor (`ruflo-hook.cjs` sessiz, sadece PreCompact'te "54 ajan,
  GOLDEN RULE" gibi 8 satırlık rehber metni basıyor). Kök CLAUDE.md 68 KB / AGENTS.md 25 KB
  ama bu repo'nun kendi geliştirici dosyası, kullanıcı projesine kopyalanmıyor — `init-project`
  skill'i `npx @claude-flow/cli init` ile kendi CLAUDE.md'ini üretiyor, boyutu görülemedi.
- premium: yok — MIT, ücretsiz. "Extend your Claude Code subscription by 250%" iddiası kendi
  ücretli katmanı değil, ayrı bir ChatGPT Pro/Plus aboneliği gerektiren bir yönlendirme özelliği.

## Ne yapar
Çok-ajanlı swarm orkestrasyonu, hafıza (AgentDB/HNSW vektör arama), SPARC metodolojisi ve
"witness" adında Ed25519 imzalı regresyon takip aracı sunan devasa bir plugin marketplace'i.
`ruflo-core` çekirdek olup MCP sunucusu üzerinden diğer 40 plugin'i (swarm, security-audit,
testgen, cost-tracker, vb.) keşfettirip kurduruyor.

## Kullanıcıya nasıl hissettirir
Emoji ağırlıklı, "GOLDEN RULE", "300% performans" gibi pazarlama diliyle konuşan bir sistem;
PreCompact anında 8 satırlık talimat bloğu bastırıyor. Windows'ta eski hook seti (kök
`.claude-plugin/`) bozuk (`/bin/bash`, jq, xargs varsayıyor); yalnız `plugins/ruflo-core`
#2721 ile `node -e` bootstrap'ına geçirilerek platform bağımsız yapılmış.

## Core'a alınacak
- fikir | Stop/SubagentStop'ta "prompt tipi" hook ile tamamlanma denetimi — ilginç ama
  Core'un "kanca çıktıları yalnız eşikte konuşur" ilkesiyle çelişir, model turunu ikiye
  katlıyor; alınmaz.
- fikir | witness skill'i (Ed25519 imzalı fix-regresyon manifestosu) — Core'un log.js'ine
  benzer ama kriptografik imza katmanı var; ayrı incelemeye değer, bu turda almaya değmez.
- hiç | geri kalan mekanizma (swarm/MCP 300+ araç, 41 plugin) Core'un "pasif kütüphane,
  sıfır bağlam" ilkesiyle taban tabana zıt; boyutu ve pazarlama diliyle uyumsuz.

## Ölçülecek
- Alınırsa: witness betiğinin tek başına (plugin'siz) çalışıp çalışmadığı, Windows'ta
  node-only çalışma iddiasının doğrulanması.

## Karar
hayır — mekanizma Core'un ilkesiyle (sıfır bağlam, pasif kütüphane) ters, witness dışında
alınacak somut parça yok.
