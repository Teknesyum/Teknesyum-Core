# a5c-ai/babysitter

- MIT · plugin + CLI (npm `@a5c-ai/babysitter`) · ★1780
- mekanizma: 14 kanca betiği (SessionStart, Stop, UserPromptSubmit, PreToolUse, PostToolUse, SubagentStop, Notification, PreCompact, SessionEnd, SessionIdle, before-prompt-build, before-provider-request, after-agent, shell-env), 17 komut, 1 skill; 12 harness için adaptör
- sıradan turda bağlama: CLAUDE.md 1712 B + skill açıklaması 278 B ≈ 2,0 KB / ~500 token; ayrıca her kanca `babysitter hook:run --json` çağırıyor — 14 olayın hepsinde bir Node süreci, çıktısı olay başına değişken. Sıradan tur "sıfır" değil, en iyi ihtimalle sabit ~500 token + 14 süreç
- premium: yok

## Ne yapar
İş akışını kod olarak tanımlatıp ajanı ona uymaya zorluyor: her adımda kalite kapısı, breakpoint'te insan onayı, her karar değiştirilemez bir günlüğe (event-sourced journal) yazılıyor. v6'dan beri harness'tan bağımsız.

## Core'a alınacak
- **fikir**: değiştirilemez karar günlüğü (journal) — Core'un `log.js` yalnız hatayı yazıyor; kararı ve gerekçesini de aynı biçimde yazmak compact talimatındaki "son kararlar ve gerekçeleri koru" kuralını makineye devrederdi.
- **fikir**: breakpoint — ilerlemeden önce insan onayı istenen noktanın *iş akışında* tanımlı olması, modelin takdirine bırakılmaması. Core'un "eşikte bir kez konuş" kancasının genellemesi.
- **hiç**: 14 kancalık yüzey ve her olayda CLI çağrısı alınmaz.

## Karar
Fikir notu — 14 kanca ve tur başına ~500 token sabit maliyet Core'un ilkesinin tam tersi; yalnız karar günlüğü ve breakpoint fikri not edilir.
