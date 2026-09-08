# modu-ai/moai-adk

- Apache-2.0 · CLI (Go) + proje sablonu (CLAUDE.md, ajan, komut, kanca, skill, MCP hepsi birden) · ★1201
- mekanizma: 20 ayri kanca olayina 47 kanca betigi (PermissionRequest, PostToolUseFailure, StopFailure, ConfigChange, InstructionsLoaded, CwdChanged, FileChanged, TeammateIdle, TaskCompleted dahil), 16 komut (`/moai plan|run|sync|gate|goal|harness...`), 11 ajan, 34 skill, 4 MCP sunucusu (context7, chrome-devtools, playwright, moai), 3 JS workflow
- siradan turda baglama: CLAUDE.md 19.8 KB + AGENTS.md 14.2 KB + her zaman yuklu anayasa/zone-registry 50.4 KB = ~84 KB, ~21 bin token; ustune 34 skill aciklamasi 11.8 KB (~3 bin token) — `wc -c` ile olculdu. `skillListingBudgetFraction: 0.02` ile skill listesi kirpiliyor ama CLAUDE.md kirpilmiyor
- premium: yok (Apache-2.0); kitap ve dokuman sitesi var

## Ne yapar
Claude Code'u SPEC odakli bir plan/run/sync zincirine sokan Go tabanli harness. v3.1'in Kanban Mode'u bir isi tek oturum yerine dort terminale bolustuyor: lider oturum zinciri surer, uc yardimci oturumun her biri yalniz kendi sutununun baglamini tasir. Kalite kapilari (`gate`, `sync-phase-quality-gate.sh`) Stop kancasindan gecer.

## Core'a alinacak
- kanca: `settings.json`'daki "kanca yoksa sessizce logla ve cik" sarmalayicisi — `[ -f "$0" ] && exec bash "$0"; ... exit 0`. Core'un kancasi eksik dosyada patlarsa oturumu bozar; bu iki satir bedava dayaniklilik.
- kanca: `async: true` ve olay basi `timeout` — moai gozlem kancalarini asenkron, kapi kancalarini senkron isaretliyor (5 sn'den 900 sn'ye). Core'un kancalarinda tek tavan var, bu ayrim dogrudan alinabilir.
- kitap: kanca olay katalogu — Core'un dinlemedigi 12 olay burada calisan ornekleriyle duruyor; pasif rafta "hangi olay ne ise yarar" notu.

## Karar
fikir notu — sablonun kendisi Core'un tersi (siradan turda ~24 bin token), ama kanca sarmalayicisi ve async/timeout ayrimi olculmus, dogrudan alinabilir iki mekanizma.
