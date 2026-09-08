# coleam00/Archon

- lisans: MIT
- kurulum biçimi: ajan çatısı (kendi CLI/binary'si — brew/curl); Claude Code eklentisi değil, kendi `.claude/` dizini yalnız kendi geliştirmesi için
- mekanizma: 4 hook (UserPromptSubmit, Stop, SubagentStop, Notification — hepsi durum/bildirim, `kild agent-status` ve Slack notify); 13 ajan, 12 komut, 7 skill, kendi YAML workflow motoru (`.archon/workflows/`)
- sıradan turda bağlama: CLAUDE.md 30 bayt (`@AGENTS.md` yönlendirmesi) + AGENTS.md 194 satır (~1.5 KB, ~400 token); her zaman yüklü skill description'ları toplam ~1 KB (~250 token); hook stdout'u sessiz (`|| true`) — toplam tahmini ~700 token, dosya boyutundan satır/karakter sayılarak
- premium: yok; tamamen açık kaynak

## Ne yapar
Archon, AI kodlama süreçlerini YAML workflow olarak tanımlayan bağımsız bir motor: planla, uygula, doğrula, gözden geçir, PR aç adımlarını deterministik sırayla çalıştırır. Her çalıştırma izole git worktree'de, paralel koşabilir. CLI, Web UI, Slack, Telegram, GitHub üzerinden tetiklenebilir.

## Kullanıcıya nasıl hissettirir
Kendi terminal/CLI arayüzü var (run listesi, approve/reject/resume); Claude Code içinde `archon-cli` skill'i üzerinden "use archon" gibi doğal dille çağrılıyor. Kendi geliştirme deposu içinde ajan durumunu (working/idle/waiting) statusline benzeri dış bir `kild` aracına hook'larla bildiriyor — sessiz, kullanıcıya konuşmuyor.

## Core'a alınacak
- fikir: workflow düğümlerini deterministik (bash) ve AI (prompt) olarak karıştırma modeli — Core'un "önce deterministik araç" ilkesiyle örtüşüyor, ama Archon kendi motoruyla geliyor, Core'a doğrudan taşınacak kod yok.
- fikir: `SubagentStop` + matcher (`rulecheck-agent`) ile yalnız belirli ajan bitince hook tetikleme deseni — Core'un "eşikte bir kez konuş" ilkesine örnek teşkil eder.
- hiç: geri kalanı (kendi CLI/binary, worktree yönetimi, workflow YAML dili) Core'un kapsamı dışında, ayrı bir ürün.

## Ölçülecek
Alınacak somut mekanizma yok; yalnız desen referansı olarak docs'ta not düşülebilir.

## Karar
hayır — Archon bağımsız bir workflow ürünü, Core'un eklenti modeliyle örtüşmüyor; yalnız hook-matcher deseni fikir notu olarak değerli.
