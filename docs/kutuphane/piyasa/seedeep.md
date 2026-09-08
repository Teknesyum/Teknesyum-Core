# duqaXxX/seedeep

- MIT · CLI (npm global, isteğe bağlı tek slash komut dosyası) · ★45
- mekanizma: 0 kanca, 0 ajan, 0 skill, 0 MCP; `install-command` bir kez `~/.claude/commands/seedeep.md` yazar
- sıradan turda bağlama: 0 KB / 0 token — depoda `hooks/`, `skills/`, `.mcp.json` yok; komut dosyası ancak `/seedeep` yazılınca okunur
- premium: yok; uzak sunucu isteğe bağlı, webhook varsayılan kapalı

## Ne yapar
Claude Code'un diske yazdığı oturum günlüğünü canlı takip edip turu yeniden kurar: bağlam penceresinin dolması, her API çağrısının gecikmesi ve token kırılımı, alt ajanların ağacı. Salt okunur; proxy ya da daemon yok. Onay bekleyen ya da sessizce kırılan oturumu sekme rengiyle ayırır.

## Core'a alınacak
- **fikir — tur sonu yedi deterministik israf kontrolü.** `apps/server/src/core/verdict.ts` (513 satır) LLM'siz yedi bulgu üretiyor: `wasted-subagent`, `compaction`, `esc`, `resume`, `context`, `exploration`, `unverified-ship`; ayrıca üç olumlu (`verified`, `delegated`, `reviewed`). Core'un eşik kancası bugün yalnız "N dosya, plan yok" sayıyor; bu liste aynı kalıbın hazır sözlüğü.
- **fikir — soğuk resume'ü işten ayırma.** Cache soğuduktan sonra açılan tur, tüm istemi yeniden ödetir; bu maliyet işe değil dönüşe yazılır. Core'un maliyet ölçümünde eksik ayrım.
- **kitap — ölçüm tarifi.** `docs/features.md` "Checking the numbers yourself": 770 oturum, 34.724 API çağrısında token'ın %98'i cache okuması, faturanın %71'i yeniden okunan bağlam. Kütüphane rafına olgu olarak girer.

## Karar
Fikir notu — kurulacak bir şey yok, ama israf kontrolü sözlüğü ve resume ayrımı Core'un eşik kancasına doğrudan uyar.
