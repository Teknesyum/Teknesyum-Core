# LiveNL/tmux-claude-status-tabs

- MIT · kurulum biçimi: `install.sh` ile `~/.claude/hooks/` kopyalar + `settings.json` birleştirir · ★3
- mekanizma: 10 kanca olayı (SessionStart, SessionEnd, Notification, Stop, PreToolUse, PostToolUse,
  UserPromptSubmit, PreCompact, PostCompact, PermissionRequest), 13 kanca betiği + `lib/`; 0 komut,
  0 ajan, 0 skill, 0 MCP
- sıradan turda bağlama: 0 token — kancalar stdout'a yazmıyor, tmux sekmesini boyuyor
  (`hooks/*.sh` çıktıları tmux komutuna gidiyor). Core ile aynı ilke.
- premium: yok

## Ne yapar

Her Claude Code oturumunun durumunu (çalışıyor / soru bekliyor / izin bekliyor / bitti) tmux sekme
çubuğuna yansıtıyor. Olay güdümlü: kanca yarım saniyede boyuyor, ayrıca bir doğrulayıcı
(`reconcile-panes.sh`) sekmeleri Claude'un kendi oturum dosyalarına karşı düzenli kontrol ediyor —
Claude'un hiç bildirmediği geçişlerde (Esc, verilen izin) sekme yalan söylemesin diye.

## Core'a alınacak

- **kitap** — `hooks/payload-contract.txt` deseni (1.2 KB): hangi kanca betiği hangi olayda hangi
  payload alanını okuyor, tablo halinde; test bunu elle yazılmış JSON'a değil gerçek oturumdan
  yakalanmış payload'lara karşı doğruluyor. Alan adı değişince sessizce bozulmayı yakalıyor.
- **pasif betik** — `capture-payloads.sh` fikri: bir anahtarla gerçek payload'ları diske yaz, testte
  onları kullan. Core'un `core/hooks/` tarafında karşılığı yok.
- **fikir** — "olay + ayrı doğrulayıcı": kanca kaçırırsa periyodik uzlaştırıcı düzeltir. Core'un
  sayaç/eşik mantığında durum kayması aynı riski taşıyor.

## Karar

Al — kanca payload sözleşmesi ve gerçek payload'la test, Core'un kanca tarafındaki tek gerçek
kör noktasını kapatıyor; 0 token ilkesi de birebir uyuyor.
