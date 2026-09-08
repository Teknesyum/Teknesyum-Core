# JeongJaeSoon/agent-guard

- MIT · kurulum biçimi: plugin (Claude Code marketplace + Codex) · ★26
- mekanizma: 5 kanca olayı (PreToolUse, PostToolUse, Stop, SessionStart, UserPromptSubmit), 2 komut (checksum, verify), 2 skill (setup-agent-guard, setup-shell), 0 ajan, 0 MCP; motor 5838 satırlık tek POSIX sh betiği + gitleaks
- sıradan turda bağlama: kancalar sessiz, yalnız engellemede tek satır stderr yazıyor (`agent-guard: blocked sensitive file access: .env`) ≈ 0 token; 2 skill açıklaması hariç CLAUDE.md yok
- premium: yok

## Ne yapar
Ajanın sır sızdırmasını araç sınırında, deterministik olarak engelliyor: `.env` okuma, sır benzeri değer yazma, kimlik bilgisi döken kabuk komutu, tool call sonrası ağaçta kalan sır. Tespit gitleaks'e, entegrasyon düz kabuk betiklerine bırakılmış; yakalanacaklar 85 satır `deny-read-paths.txt` ve 100 satır `deny-bash-patterns.txt` içinde veri olarak duruyor.

## Core'a alınacak
- kanca: PreToolUse'ta yol/desen listesine bakan engelleyici — Core'un kanca felsefesine tam oturuyor (sessiz, eşikte tek satır).
- pasif betik: desenleri koda değil iki düz metin dosyasına koyma biçimi; Core'un sabit metinleri model yazmaz kuralının aynısı.
- fikir: `AGENT_GUARD_INFRA_FAILURE_MODE=open|closed` — kanca kendi altyapısını bulamazsa açık mı kapalı mı düşeceğini kullanıcı seçiyor.

## Karar
Al — 5 kanca olayı boyunca sıradan turda 0 token yazan, tamamen deterministik tek örnek; desen dosyası + PreToolUse engelleyicisi doğrudan alınabilir.
