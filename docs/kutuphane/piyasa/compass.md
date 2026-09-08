# dshakes/compass

- MIT · plugin (Claude Code + Codex + Gemini, `/plugin marketplace add`) · ★19
- mekanizma: 13 kanca betiği / 7 olay (SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, Stop, Notification, PreCompact) · 13 komut · 15 ajan · 8 skill · MCP dizini var
- sıradan turda bağlama: `claude/CLAUDE.md` 10.322 B + 8 skill açıklaması 3.256 B + SessionStart `inject-context.sh` çıktısı (~300 B: dal, kirli dosya sayısı, son 5 commit) ≈ 13,9 KB ≈ ~3,5k token. `wc -c` ile ölçüldü.
- premium: yok; tamamı yerel, ücretsiz

## Ne yapar

Ajanı üç şeyden alıkoyan bir yapılandırma katmanı: bütçe yakmak, tehlikeli komut çalıştırmak, doğrulanmamış kodu birleştirmek. `COMPASS_MAX_USD=5` verilince oturum tavanda sert durur; korumalı yollar ve prompt/araç-çıktısı taraması PreToolUse'ta kesilir. Kendi PR'ını onaran bir döngü ve CI'da puanlanan bir guardrail korpusu da var.

## Core'a alınacak

- **Pasif betik — `budget-gate.sh` mantığı.** Transcript JSONL'ini tek geçişte jq ile tarayıp model başına fiyat tablosuyla oturum maliyetini USD hesaplıyor (144 satır). Core'un bench harcama yetkisi ve "önce fiyatla" kuralı bugün gözle yapılıyor; bu ölçüm deterministik. Fiyat tablosu yerel kopya, güncellenmesi gerekir.
- **Fikir — çift tavan.** Oturum tavanı + gün tavanı (`spend.tsv` ortak defterinden) ayrı; ikisi de kapalıyken kanca sıfır iş yapıp exit 0. Core'un "sıradan turda sıfır token" ilkesiyle birebir uyumlu tasarım.
- **Fikir — statusline'ın maliyet kâhyası olması.** Claude Code her render'da `.cost.estimated_cost_cents` veriyor; compass bunu `sessions/<id>.cost` kırıntısına yazıp kancaya okutuyor. Core'un statusline'ı zaten var, kırıntı yok.

## Karar

Al — fiyat kancası Core'un eksik olduğu tek yerde (harcama tavanı) çalışır bir mekanizma sunuyor, 144 satır ve bağımlılığı jq.
