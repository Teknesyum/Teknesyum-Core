# davidondrej/skills

- MIT · metin paketi + kanca betikleri · ★3981
- mekanizma: 69 SKILL.md, 3 kanca dosyası (`deny-dangerous.sh`, `dangerous-patterns.txt`, `test-guard.sh`), 0 komut, 0 ajan, 0 MCP
- sıradan turda bağlama: CLAUDE.md yok; 69 skill frontmatter toplamı 28815 B ≈ 28 KB / ~7.200 token. Kancanın sessiz turda stdout'u sıfır (izin verilende `exit 0`, çıktı yok).
- premium: yok

## Ne yapar
Kişisel beceri koleksiyonu artı küresel bir kabuk komutu bekçisi. `deny-dangerous.sh`,
PreToolUse'ta stdin'deki JSON'dan komutu `jq` ile çekip `dangerous-patterns.txt`
içindeki ERE desenleriyle eşleştirir; eşleşirse stderr'e sebep yazıp `exit 2` ile bloklar.
Claude Code, Codex ve Cursor yük biçimlerinin üçünü de tek betikle karşılar.

## Core'a alınacak
- kanca: tehlikeli komut bekçisi — Core'un ilkesine tam uyar; sessiz turda 0 token, yalnız eşleşmede tek satır konuşur. `jq` yoksa açık kalır (fail-open).
- pasif betik: `test-guard.sh` — 45+ bloklanacak/geçecek komutla desen dosyasını doğrular; Core'un `npm test`ine kolayca eklenir.
- fikir: desenleri betikten ayrı düz metinde tutmak — düzenleme yeniden başlatma istemiyor.

## Karar
Al — kanca + doğrulama betiği birlikte, 0 token maliyetle; 69 becerinin 28 KB'ı alınmaz.
