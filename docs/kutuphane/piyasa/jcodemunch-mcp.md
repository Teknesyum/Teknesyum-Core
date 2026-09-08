# jgravelle/jcodemunch-mcp

- ikili lisans (LicenseRef-jCodeMunch-Dual-Use, kisisel kullanim bedava) · plugin + MCP (uvx) · ★2672
- mekanizma: 1 MCP sunucu (plugin.json icinde `mcpServers`), 0 zorunlu kanca, 0 komut/skill kurar; AGENT_HOOKS.md 47 KB'lik dokumanda kullaniciya opsiyonel 3 kanca (read guard, edit guard, index) hem sh hem ps1 olarak veriyor
- sıradan turda bağlama: plugin kendi basina 0 satir yazmaz; ama onerilen CLAUDE.md "Code Exploration Policy" pasaji ~1.2 KB (~300 token) ve MCP arac tanimlari her turda yuklu. AGENT_HINTS.md (3.2 KB) MUNCH cozucusunu isteyene sistem istemine yapistirtiyor.
- premium: var — ticari kullanim ucretli, kisisel bedava

## Ne yapar
Depoyu tree-sitter ile bir kez indeksliyor, ajan dosya okumak yerine sembol/fonksiyon duzeyinde parca cekiyor; kod kesfinde %86-99 token tasarrufu iddia ediyor (28.3x, kendi bench'i). Ciktiyi MUNCH adli sikistirilmis metin bicimiyle donduruyor.

## Core'a alınacak
- fikir: PreToolUse kancasiyla Read/Grep'i kesip ucuz yola yonlendirme — Core'un `graphify` kullanimini "soft kural" yerine kancaya baglamanin hazir kalibi; PowerShell surumu de var.
- kitap: kendi `.claude/skills/claude-md-budget` (1.6 KB) — CLAUDE.md'yi tavan altinda tutma yordami: once bolumleri olc, turetilebilen disari, yasak/gerekce kalir, tavan yukseltilmez. Core'un 30 satir RULES tavani ile birebir ortusuyor.
- kitap: `mechanism-not-instance` (1.3 KB) — duzeltmeyi bir kat asagida yap, girdinin oteki yazimlarini ara. Kisa ve alana bagimsiz.

## Karar
fikir notu — MCP'nin kendisi Core ilkesine aykiri (surekli arac yuzeyi), ama iki kucuk skill metni ve kanca-ile-yonlendirme kalibi rafa alinabilir.
