# anthropics/claude-plugins-official

- lisans: Apache License 2.0
- tür: agents | skills | prompts (commands) — karma eklenti deposu
- kitap sayısı ve yeri: 229 md dosyası; 39 eklenti altında `plugins/<isim>/{skills,agents,commands}/`. 31 SKILL.md, 35 agent md, 30 command md.
- scan: `plugins/*/skills/*/SKILL.md`, `plugins/*/agents/*.md`, `plugins/*/commands/*.md` · skip: `.git`, `external_plugins`, her eklentinin kendi `README.md`/`LICENSE`/`.claude-plugin`

## Ne işe yarar
Anthropic'in resmi Claude Code eklenti market deposu; her eklenti tek bir işi kapsayan komut/skill/agent üçlüsünü paketliyor (code-review, mcp-server-dev, plugin-dev, lsp'ler, hookify, math-olympiad gibi). SKILL.md dosyaları frontmatter'lı (`name`, `description`, çoğunda `tools`), agent md'leri `name`/`description`/`model` taşıyor, command md'leri `description`/`argument-hint`. Her eklenti kendi README+LICENSE'ını taşıyor, yani raf tekil dosya değil eklenti klasörü bazında düşünülmeli.

## ??'de ne zaman bulunmalı
"Claude Code için hazır eklenti/skill var mı, kendim yazmayayım" sorusu
"MCP server nasıl yazılır, örnek referans lazım" sorusu
"Agent SDK ile yeni uygulama kurarken adım adım rehber ister misin" sorusu

## Kalite
Anthropic birinci taraf, aktif geliştiriliyor (son commit 2026-09-04, merge PR akışı düzenli). İçerik özgün — resmi dokümantasyona referans veren, WebFetch ile canlı doc çeken talimat dosyaları; kopya değil. Windows'ta bazı `references/` alt yolları 260 karakter sınırını aşıyor (`core.longpaths=true` gerektirdi).

## Karar
raf — 39 eklenti, tutarlı frontmatter ve resmi kaynak; scan deseni net, klasör bazlı seçilebilir.
