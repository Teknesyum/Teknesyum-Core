# runesleo/claude-code-workflow (QuietHarness)

- MIT · metin paketi + kurulum betiği (Claude/Codex/Cursor ortak) · ★711
- mekanizma: 0 kanca, 0 komut, 0 ajan, 0 skill, 0 MCP; 3 shell betiği (`install.sh`, `inventory.sh`, `verify.sh`)
- sıradan turda bağlama: paylaşılan çekirdek `templates/shared/AGENTS.md` 1.631 bayt = ~410 token; depo kendi `AGENTS.md`'si 1.170 bayt, `CLAUDE.md` 131 bayt (yalnız `@AGENTS.md` yönlendirmesi) — `wc -c`
- premium: yok

## Ne yapar
Üç ajan aracının ortak okuduğu ~1,6 KB'lık "Agent Core" metni: son isteği aktif hedef say, gereksiz plan/alt ajan/skill açma, ilgisiz değişikliği koru, riske orantılı doğrula, geri alınamaz işten önce onay iste. Kurucu varsayılan olarak yalnız dry-run; `--apply` demeden yazmıyor.

## Core'a alınacak
- kitap: "Agent Core" 1,6 KB'lık metnin kendisi — Core'un davranış kurallarıyla örtüşüyor, farkları bir rafta karşılaştırmalık.
- fikir: **Private context** bölümü — kimlik, öncelik, özel yol ve iş runbook'ları izlenmeyen özel dosyada durur, sıcak yola kopyalanmaz. Core'un `private/` özel rafının dışarıdaki karşılığı.
- betik: `install.sh --dry-run` varsayılanı; yazmadan önce hedefleri gösterme kalıbı `scaffold.js` için alınabilir.

## Karar
Al — 410 token'lık çekirdek, Core'un ilkesiyle aynı hizada ve "özel raf"ı bağımsız olarak doğruluyor.
