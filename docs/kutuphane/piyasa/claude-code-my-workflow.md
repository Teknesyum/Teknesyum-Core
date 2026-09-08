# pedrohcgs/claude-code-my-workflow

- MIT · fork'lanan proje şablonu (CLAUDE.md + `.claude/`) · ★1567
- mekanizma: 7 kanca betiği (Python/Shell) / 4 olay (PreToolUse, PostToolUse, PreCompact, SessionStart, Stop) · 18 ajan · 60 skill · 38 kural dosyası (`.claude/rules/`) · MCP yok
- sıradan turda bağlama: `CLAUDE.md` 9.166 B + 60 skill açıklaması 34.164 B ≈ 43,3 KB ≈ ~11k token (import yok; `MEMORY.md` 25 KB ayrıca, elle okunuyor). `wc -c` ile ölçüldü.
- premium: yok

## Ne yapar

Akademik iş (LaTeX/Beamer slayt, makale, R analizi, replikasyon paketi) için hazır bir Claude Code kurulumu. Kullanıcı ne istediğini söylüyor; şablon planlıyor, uzman alt ajanları koşturuyor, 10 denetleyiciden oluşan bir kapı takımıyla kaliteyi puanlıyor. Ayarları `bypassPermissions` ile geliyor.

## Core'a alınacak

- **Fikir — bağlam ölçer kanca.** `context-monitor.py` (233 satır) transcript dosya boyutundan pencere yüzdesi tahmin ediyor, %40/55/65'te bir kez skill çıkarmayı, %80 ve %90'da uyarıyı öneriyor; eşik altında 60 saniyelik throttle ile sessiz. Core'un "eşikte bir kez konuş" ilkesinin aynısı, farklı bir eşik için.
- **Fikir — compact çifti.** `pre-compact.py` (305 satır) durumu proje karmasıyla adlanmış oturum klasörüne yazıyor, `post-compact-restore.py` SessionStart `source=compact|resume` matcher'ıyla geri veriyor. Core'un `handoff.md`/`devir.md` işini kanca otomatikleştiriyor.
- **hiç (kitap)** — 60 skill ve 38 kural akademik alana özel; Core'un rafına giren bir bilgi yok.

## Karar

Fikir notu — iki kanca deseni (bağlam eşiği, compact öncesi/sonrası durum) alınmaya değer; 43 KB'lık sıradan-tur yükü Core'un ilkesine ters, paket olarak alınmaz.
