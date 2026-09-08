# mksglu/context-mode

- Elastic-2.0 · plugin + MCP sunucusu (npm `context-mode`) · ★21274
- mekanizma: 7 kanca olayı (SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, PreCompact, Stop) · 8 skill (`context-mode`, `ctx-doctor/index/insight/purge/search/stats/upgrade`) · 1 MCP sunucusu · 0 ajan
- sıradan turda bağlama: SessionStart `additionalContext` olarak `routing-block.mjs` içindeki `<context_window_protection>` bloğu basılıyor (8.3 KB dosya, blok gövdesi ~5 KB ≈ 1300 token); artı 8 skill açıklaması, en büyüğü `context-mode/SKILL.md`'nin 15 satırlık tetikleyici listesi (~250 token). CLAUDE.md 4.6 KB. Toplam her oturumda ~2 KB metin, her turda skill açıklamaları.
- premium: var — `ctx-insight` skill'i barındırılan "Insight" analitik panosunu satıyor; lisans ELv2.

## Ne yapar
Bash/Read/WebFetch çıktısını MCP kum havuzuna yönlendirir, ham baytları bağlama sokmadan yalnız türetilmiş cevabı döndürür; çıktıları SQLite FTS5/BM25 dizinine yazıp `ctx_search` ile geri okutur. Sıkıştırma ve `resume` anında oturum anlık görüntüsünü geri yükler.

## Core'a alınacak
- fikir: "araç çıktısını okumadan işle" yönlendirmesini kalıcı bağlama basmak yerine yalnız eşikte (ör. tek turda N KB'ı aşan Bash çıktısı) PostToolUse'ta tek satırla hatırlatmak — Core'un eşik ilkesine uyar.
- kitap: `hooks/core/tool-naming.mjs` + `routing-block.mjs`'in platform-bağımsız araç adlandırması; çok istemcili kanca yazımı için raf notu.
- fikir: PreCompact kancasıyla oturum kararlarını diske yazıp `resume`'da geri vermek — Core'un `handoff.md`'sinin otomatik hâli.

## Karar
fikir notu — mekanizması güçlü ama her oturumda ~1300 token sabit blok basıyor; Core'un sıfır-token ilkesiyle çelişir, yalnız kanca desenleri alınır.
