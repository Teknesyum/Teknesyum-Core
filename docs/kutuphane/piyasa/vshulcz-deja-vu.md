# vshulcz/deja-vu

- MIT · plugin + CLI (Go) + MCP · ★790
- mekanizma: 5 kanca olayı (SessionStart, UserPromptSubmit, PreCompact, PreToolUse `Bash|Edit|Write|Task`, PostToolUse `Bash`), 1 skill, 1 komut, 1 MCP sunucusu; kanca köprüsü `hooks/deja.sh` yalnız 1.441 B
- sıradan turda bağlama: sıfır değil — UserPromptSubmit her istemde arama yapıp özet enjekte eder. Enjekte edilen metin byte bütçesine kesilir (`internal/digest` testleri 120/200/400/900 B bütçe koşuyor), yani tur başına ~0,1-1 KB ≈ 30-250 token.
- premium: yok; her şey yerel dosya

## Ne yapar
Makinedeki Claude Code, Codex, Cursor oturum kayıtlarını indeksler ve "bunu daha önce çözmüştük" anını ajan sormadan geri verir. Anahtar ve token'ları indeksleme sırasında ayıklar. LongMemEval-S'te %85,3 hit@1 iddiası, koşum takımı depoda.

## Core'a alınacak
- kanca: `deja.sh` ilk 12 satırı — `settings.json` içinde aynı kanca zaten varsa eklenti kendini susturur (`grep -q "deja hook-"; exit 0`). Core'un kancaları iki kez kurulduğunda çift konuşmasını aynı üç satır önler.
- fikir: kanca çıktısına byte bütçesi. Core "eşikte tek satır" diyor ama satır uzunluğuna tavan koymuyor; deja bütçeyi test ediyor (`cut_marker_test.go`: kesme işareti bütçeye eklenmez, bütçeden düşülür).
- fikir: ikili yoksa kanca hata vermez, tek seferlik `systemMessage` ile kurulumu söyler, çıkış kodu daima 0 — "başarısız kanca, kullanıcıyı kesen kancadır".

## Karar
Fikir notu — ürünün kendisi (her istemde enjeksiyon) Core'un sıfır-token ilkesine aykırı; üç kanca hijyeni kuralı alınır.
