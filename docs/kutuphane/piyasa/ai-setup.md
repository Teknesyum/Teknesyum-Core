# caliber-ai-org/ai-setup (Caliber)

- MIT · kurulum: CLI (npm `@rely-ai/caliber`) + kendi deposunda kanca seti · ★1263
- mekanizma: 7 kanca olayı (SessionStart, SessionEnd ×2, PostToolUse, PostToolUseFailure, UserPromptSubmit, Stop, Notification) · 8 skill · 4 kural dosyası · ajan yok · MCP yok
- sıradan turda bağlama: kancalar sessiz çıkıyor; `caliber-session-freshness.sh` yalnız `.caliber/.caliber-state.json` varsa ve HEAD son yenilemeden **15 commit** ileriyse tek satırlık `systemMessage` basıyor — o zaman ~120 bayt (~30 token), aksi hâlde 0. Depo kendi `CLAUDE.md`/`AGENTS.md` dosyalarını üretiyor (ürünün kendisi), o metin bağlamda.
- premium: yok (ücretsiz npm paketi, "Caliber Score" rozeti pazarlama)

## Ne yapar
Elde yazılan `CLAUDE.md` / `AGENTS.md` / `.cursor/rules` dosyalarının bayatlamasını sorun olarak alıp bunları koddan üretir ve senkron tutar. Oturum boyunca araç kullanımı, hata ve kullanıcı düzeltmelerini gözleyip oturum sonunda "öğrenme" olarak sabitler.

## Core'a alınacak
- **kanca — commit mesafesiyle bayatlık ölçümü**: durum dosyasındaki `lastRefreshSha` ile HEAD arası `git rev-list --count`; 15'in üstündeyse tek satır. Core'un `docs/plan.md` ve harita dosyaları için aynı ölçüt kullanılabilir, maliyeti tek `git` çağrısı.
- **fikir — kancanın kendi alt oturumunu susturması**: `CALIBER_SUBPROCESS=1` görünce çıkıyor, böylece headless alt ajan çıktısı kirlenmiyor. Core'un kancaları alt ajan turunda aynı korumayı almalı.
- hiç (üçüncü madde) — "öğrenme" toplayıcısı her araç çağrısında süreç başlatıyor, Core'un sıradan tur maliyeti sıfır ilkesine aykırı.

## Karar
Fikir notu — iki küçük kanca deseni (bayatlık eşiği, alt oturum susturması) alınmaya değer; ürünün kendisi harici CLI'ye bağımlı, Core'a girmez.
