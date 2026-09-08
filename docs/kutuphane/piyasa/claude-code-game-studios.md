# Donchitos/Claude-Code-Game-Studios

- MIT · CLAUDE.md + ajan/skill ağacı · ★24890
- mekanizma: 98 ajan dosyası (49 ilan edilen ajan), 73 skill, 11 kanca betiği (SessionStart, Stop, PreCompact, PostCompact, commit/push kapıları), 0 MCP
- sıradan turda bağlama: CLAUDE.md 1.719 B, ama içinde 5 `@` içe aktarma var (dizin yapısı, teknik tercihler, koordinasyon kuralları, kodlama standardı, bağlam yönetimi) — hepsi her turda yükleniyor. Üstüne SessionStart kancası dal, son 5 commit, aktif sprint ve kilometre taşını her oturumda yazıyor
- premium: yok

## Ne yapar
Claude Code'u oyun stüdyosuna çeviriyor: her alan bir alt ajana ait, koordinasyon kuralları ve kalite kapıları CLAUDE.md'de. İşbirliği protokolü sert: her yazma öncesi "şu dosyaya yazayım mı?" sorulacak, çok dosyalı değişiklik için açık onay, talimatsız commit yok.

## Core'a alınacak
- fikir: `settings.json`'daki `deny` listesi — `rm -rf`, `git push --force`, `git reset --hard`, `cat *.env`, `Read(**/.env*)`. Core'un yıkıcı iş kuralını modele anlatmak yerine kapıya yazma örneği.
- fikir: SessionStart'ta dal + son commit + aktif sprint yazmak; Core bunu statusline'a koyuyor, yani modele hiç göstermiyor — karşılaştırmalı ölçüt olarak değerli.
- Alınmayacak: 49 ajan / 73 skill mimarisi ve `@` zinciriyle şişen CLAUDE.md; Core'un ilkesinin karşı kutbu.

## Karar
hayır — Core'un "hiçbir şey ajan/skill olarak kurulmaz" ilkesinin tam zıddı; yalnız deny listesi fikir olarak not edildi.
