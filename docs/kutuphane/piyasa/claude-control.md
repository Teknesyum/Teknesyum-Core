# sverrirsig/claude-control

- MIT · Electron masaustu uygulamasi (yalniz macOS) · ★132
- mekanizma: `~/.claude/settings.json` icine 7 kanca yazar — SessionStart, SessionEnd, Stop, UserPromptSubmit, PermissionRequest, SubagentStart, PostToolUseFailure (sonuncusu `Bash` matcher'iyla); 0 komut, 0 skill, 0 ajan, 0 MCP
- siradan turda baglama: 0 token — kanca betigi (`~/.claude-control/hooks/status-hook.sh`) stdout'a hicbir sey yazmiyor, cikti dosyaya gidiyor: `~/.claude-control/events/$PPID.json`, olay basina ~200 bayt
- premium: yok

## Ne yapar
Ayni anda kosan Claude Code oturumlarini tek panoda toplayan macOS uygulamasi. Oturumlari process tablosundan buluyor, durumu (Calisiyor / Bos / Girdi bekliyor / Hata / Bitti) kanca olaylarindan okuyor, JSONL mtime'ini yedek olarak kullaniyor; git dali, degisen dosyalar ve PR durumu da ayni satirda.

## Core'a alinacak
- kanca: PID ile anahtarlanan olay dosyasi — kanca `$PPID.json` yaziyor, boylece ayni makinedeki paralel oturumlar birbirine karismiyor. Core'un statusline'i su an tek kok varsayiyor; bu dosya adlandirmasi bedava cozum.
- fikir: `PermissionRequest` ve `PostToolUseFailure` olaylari — Core hicbirini dinlemiyor. Izin bekleyisi ve tekrar eden Bash hatasi, `log.js`'in su an kacirdigi iki sinyal.
- fikir: kancayi `settings.json`'a yazarken once ayni `command` degeri kayitli mi diye bakip cift kayit yapmamasi; Core'un `setup.js`'i icin dogrudan uygulanabilir kalip.

## Karar
fikir notu — uygulama macOS'a bagli ve Core'a girmez, ama PID'li olay dosyasi ile iki dinlenmeyen olay dogrudan alinabilir.
