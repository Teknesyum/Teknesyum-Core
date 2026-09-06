# Plan: Asılı Süreç Sayacı ve Döngü Kapısı

Tarih: 2026-09-06. Sebep: VideoEdit oturumunda yedi `until … sleep` döngüsü on saat asılı kaldı,
dört pytest çekirdekleri doldurdu, kullanıcı "Running" görüp iş sürüyor sandı.

## Kural

Sıradan turda 0 bayt. Statusline bağlama yazmaz. Kapı yalnız reddettiğinde konuşur.
Üst sınırı model seçer; 90 dakikalık iş 90 dakikalık sınır alır, kapı süreye karışmaz.

## Parçalar

1. `core/scripts/procs.js`: claude süreçlerinin altında, zincirinde kabuk olan (bash, sh,
   zsh, powershell, pwsh, cmd) ve 30 dakikayı geçmiş süreçleri sayar. MCP sunucuları
   doğrudan claude'un çocuğu, kabuksuz, sayılmaz. Sonuç `~/.claude/teknesyum/procs.json`,
   60 saniye tazelik; statusline eskiyse ayrık bir tazeleyici başlatır, beklemez.
   Sayı 0'dan yukarı çıktığında notify'ın "waiting" sesi bir kez çalar.
2. `core/scripts/statusline.js`: `⏳ 3 süreç 40 dk` parçası, yalnız sayı > 0 iken.
3. `core/hooks/loop.js`: PreToolUse Bash|PowerShell. `until`/`while` + `sleep`/`Start-Sleep`
   var, `timeout`/sayaç/`SECONDS`/tarih karşılaştırması yoksa tek satır gerekçeyle ret.
4. `core/hooks/hooks.json`, `core/strings.json`: bağlama ve metinler.
5. `test/all.js`: sentetik süreç tablosuyla sayaç; kapı için ret/geçiş/sayaç/timeout/PowerShell.
6. README.md, README.tr.md, `.changes/` notu.
7. Bench: `bench/varyant/u5-kapi` olarak görev 06 n=1; kapı ateşlenmemeli, $ taban aralığında
   kalmalı. Statusline bench'te görünmez, ölçülmez.

## Maliyet

Bağlam: 0 sıradan turda; ret anında ~100 token + modelin komutu yeniden yazdığı tur.
Bench: ~1 $. Kod: ~150 satır.
