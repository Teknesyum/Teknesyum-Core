# hoangsonww/Claude-Code-Agent-Monitor

- MIT · plugin pazarı + yerel pano (Node/React/SQLite) · ★983
- mekanizma: 14 eklenti, 66 skill, 18 ajan, 34 komut (kendi `marketplace.json` beyanı); 8 kanca olayı — `PreToolUse`, `PostToolUse`, `Stop`, `SubagentStop`, `Notification` (matcher `*`) + `SessionStart`, `SessionEnd`, `UserPromptSubmit`; kanca işleyicisi 2477 B, taşıyıcısı 3098 B
- sıradan turda bağlama: kanca stdout'u yok (olay 4820 portundaki sunucuya gider), ama proje `CLAUDE.md` 5617 B ≈ 1400 token her turda; 66 skill kurulursa açıklamaları da sürekli yüklü olur.
- premium: yok (MIT), pano yerel.

## Ne yapar
`~/.claude/settings.json`'a sekiz kanca yazar, her oturum ve araç olayını SQLite'a akıtır, React
panosunda maliyet, token, alt ajan orkestrasyonu ve anomali olarak gösterir. Kancaları `npm run
install-hooks` kendisi kurar; Codex için ayrı bir işleyici var.

## Core'a alınacak
- fikir: `HOOKS_WITH_MATCHER` / `HOOKS_WITHOUT_MATCHER` ayrımı — hangi olayın araç adı eşleştiricisi aldığı derli toplu yazılmış; Core'un kanca kurulumunda referans.
- pasif betik: `.claude/settings.json` izin şablonu — `deny` altında `Read(**/.env)`, `~/.ssh/**`, `~/.aws/**`, `git reset --hard`, `rm -rf`; `setup.js`'in yazdığı ayara aynen aday.
- hiç: pano, 14 eklenti ve MCP katmanı Core'un tersi yönde.

## Karar
Fikir notu — sayaç işini zaten Core statusline'ı yapıyor; alınacak olan kanca-olay tablosu ve hazır deny listesi.
