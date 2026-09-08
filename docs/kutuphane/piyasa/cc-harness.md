# lookfree/cc-harness

- MIT · masaüstü uygulama (Electron, CLI/plugin değil) · ★48
- mekanizma: 0 kanca kurar, 0 komut, 0 ajan, 0 skill, 0 MCP — Claude Code'a hiçbir şey eklemez; oturum `jsonl`'ini dışarıdan okur. 254 dosya; ilgili çekirdek: `electron/services/hook-sandbox.ts`, `shared/hooks/matcher-semantics.ts`.
- sıradan turda bağlama: 0 B — ayrı süreç, bağlama yazmıyor. Sayım: depo ağacında `.claude-plugin/` ve kurulan `hooks/` yok.
- premium: yok.

## Ne yapar
Claude Code oturumunu dışarıdan izler: canlı alt ajan çağrı ağacı (5 seviye, düğüm başına gecikme ve token maliyeti), skill/alt ajan/MCP/plugin kırılımlı maliyet paneli, döngü ve zamanlanmış uyanış takibi. Ayrıca kanca kum havuzu: kancayı sahte stdin JSON'u ile kuru çalıştırıp stdout, stderr, çıkış kodu ve dönüşmüş sonucu gösterir.

## Core'a alınacak
- pasif betik: kanca kuru çalıştırıcısı — `{session_id, transcript_path, hook_event_name, cwd, tool_name, tool_input}` stdin'i kurup kancayı proje kökünde koşturur, `exit 2` = blok, JSON stdout = karar diye çözer. Core'un `hooks/mod.js`'ini oturum açmadan sınamak için doğrudan uyarlanabilir (~120 satır).
- kitap: matcher semantiği — 2.1.195'ten beri düz metin matcher **tam eşleşme** (eskiden `code-reviewer` yanlışlıkla `mcp__code-reviewer-pro__x`'i tutuyordu), 2.1.191'den beri virgüllü liste çalışıyor, `mcp__<sunucu>` tek başına hiçbir şeyi tutmaz — `mcp__<sunucu>__.*` yazılmalı. Tarihli, sınanabilir olgular.
- fikir: skill tetikleyici çözümleyicisi — hangi anahtar sözcüğün hangi skill'i uyandırdığını çıkarır.

## Karar
Al — uygulamanın kendisi değil, kanca kuru çalıştırıcısı pasif betik olarak ve matcher olguları kitap olarak.
