# mag123c/toktrack

- MIT · CLI (Rust, npx/brew ile kurulur) · ★188
- mekanizma: 0 kanca, 0 komut, 0 ajan, 0 skill, 0 MCP — oturum dosyalarını okuyan tek ikili dosya, TUI'de 5 sekme; `daily|weekly|monthly|stats` JSON çıktı verebiliyor.
- sıradan turda bağlama: 0 token; Claude'un dışında, terminalde çalışır.
- premium: yok.

## Ne yapar
Claude Code, Copilot, Codex, Gemini, Qwen, OpenCode, Grok CLI oturumlarının token ve maliyetini tek
panoda toplar. Ayırt edici yanı kalıcı önbellek: Claude Code oturum dosyalarını 30 gün sonra sildiği
için diğer araçların geçmişi kaybolurken toktrack'inki kalıyor. Büyük geçmişte simd-json + rayon ile
~0,04 s'de yanıt veriyor.

## Core'a alınacak
- fikir: 30 günlük silme — Core'un `bench/rapor.md` maliyet ölçümleri oturum dosyalarına dayanıyorsa ölçüm ham verisinin depo içine kopyalanması gerekir, yoksa tekrar üretilemez.
- fikir: `--json` çıktılı alt komut; Core betiklerinin de makineye okunur çıktı vermesi statusline dışında rapor üretmeyi ucuzlatır.

## Karar
Fikir notu — Core'un statusline'ı bu işi zaten yapıyor; alınacak olan "ölçüm verisi silinmeden kopyalanmalı" uyarısı.
