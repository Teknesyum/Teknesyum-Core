# DevinoSolutions/anotifier-for-claude-codex-cursor

- AGPL-3.0 · kurulum bicimi: plugin (+ npm CLI) · ★28
- mekanizma: 2 kanca (Notification, Stop; `hooks/hooks.json`, timeout 10 sn), 6 slash komut (config/setup/snooze/status/test/uninstall), ajan 0, skill 0, MCP 0
- sıradan turda bağlama: ~0 KB — kancalar stdout'a metin basmaz, masaustu/telefon bildirimi gonderir; komutlar cagrilmadan yuklenmez; CLAUDE.md yok
- premium: yok (bagimliliksiz npm paketi); ntfy/webhook ucu var

## Ne yapar
Claude Code, Codex, Gemini CLI ve Cursor icin tek yapilandirmali bildirim koprusu. `parse-input.mjs`
her aracin olay adini ortak sozluge cevirir (Stop -> task_complete, Notification -> needs_input).
`notify.mjs` Claude'un Stop yukundeki `background_tasks` defterini okuyup arka plandaki alt ajanlar
bitmeden bildirim atmayi bastiriyor; `patch-config.mjs` dort aracin ayar dosyasini yamiyor.

## Core'a alınacak
- fikir: Stop yukundeki `background_tasks` defterini okuyup "gercekten bitti mi" ayrimi yapmak — Core'un esik kancasi da erken konusmayi boyle onleyebilir.
- pasif betik: olay adi normalizasyon tablosu (`src/parse-input.mjs`, ~40 satir) — Core kancalari tek olay sozlugu uzerinden yazilirsa arac degisikligine dayanikli olur.
- hic: bildirim tasima katmani (platform ikilileri, sentry, ntfy) — Core'un isi degil.

## Karar
fikir notu — kancalari baglama sifir token yazan dogru ornek, ama urun bildirim; yalniz Stop-defteri ve olay sozlugu fikri alinir.
