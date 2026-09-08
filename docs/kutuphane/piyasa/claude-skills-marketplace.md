# mhattingpete/claude-skills-marketplace

- Apache-2.0 · plugin marketplace (4 eklenti) · ★671
- mekanizma: 0 eklenti kancası ama depo `.claude/settings.json`'ında 1 `SessionStart` kancası (`bash .claude/install-gh.sh`), 1 komut, 2 ajan, 18 skill, 1 MCP sunucusu (`execution-runtime`, FastMCP)
- sıradan turda bağlama: depo `CLAUDE.md` 21.369 bayt ≈ **5.340 token**; 18 skill'in name+description satırları 4.955 bayt ≈ 1.240 token → dört eklentiyi de kuran kullanıcıda ~1.240 token/tur
- premium: yok (Smithery rozeti var, barındırma onların)

## Ne yapar
Dört eklentilik bir pazar yeri: mühendislik iş akışı (özellik planlama, git push, kod incelemesi, test düzeltme), görsel dokümantasyon (mimari diyagram, dashboard), kod operasyonları ve üretkenlik skilleri. Ayrıca bir MCP kod çalıştırma ortamı.

## Core'a alınacak
- fikir: `SessionStart` kancasının kurulum işini üstlenmesi (`install-gh.sh`) — Core'un `setup.js`'i elle çağrılıyor; her oturumda bir kez, idempotent kurulum kalıbı düşünülebilir. Riski: her oturum başında betik çalışıyor.
- kitap: 18 skill'in 1.240 token'lık açıklama vergisi; Core'un pasif raf tercihi için ikinci ölçü.

## Karar
hayır — mekanizma Core'da zaten var ya da ilkeye aykırı; 21 KB'lık `CLAUDE.md` alınacak bir şey değil.
