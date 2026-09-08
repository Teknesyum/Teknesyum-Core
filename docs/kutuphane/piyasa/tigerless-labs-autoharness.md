# tigerless-labs/autoharness

- MIT · plugin (marketplace + plugin.json) · ★2953
- mekanizma: 4 kanca olayı (SessionStart, Stop, PreToolUse, SessionEnd) tek `dispatch.py` kapısına bağlı; 1 skill (1.1 KB), 2 ajan (reflector 11 KB, curator 8.5 KB), 1 `.mcp.json`
- sıradan turda bağlama: CLAUDE.md yok; SessionStart `additionalContext` ile kendi ürettiği becerilerin tek satırlık indeksini basar — açıklama başına 60 karakter tavanı (`INDEX_DESC_MAX_CHARS=60`), kütüphane boşsa sıfır enjeksiyon. Kapasite tavanı 20 (global) / 50 (proje) → dolu kütüphanede ~4 KB, ~1000 token. Stop kancası her turda çalışır ama çıktısı yok, sayaç artırır.
- premium: yok

## Ne yapar
Gerçek oturumlardan beceri damıtır: Stop'ta ayrık (detached Popen) bir reflector alt oturumu başlatır, aynı senaryodaki becerileri birleştirir, kullanılmayanı arşive taşır. Kullanım oranını ölçer (pay: Skill çağrısı + beceri dizinine Read; payda: Stop sayısı) ve eleme kararını bu birikmiş orana bağlar.

## Core'a alınacak
- **kanca**: tek kapı deseni — `hooks.json` yalnız tek dosyayı gösterir, olay adına göre dallanır, bilinmeyen olay sessizce yutulur (yeni host olayı eklentiyi çökertmesin).
- **pasif betik**: raf kullanım sayacı — hangi raf hiç okunmadı; `??` ile açılan rafı say, payda tur sayısı. Budama kararı ölçüme bağlanır.
- **fikir**: eşiğe takılan tek satırlık indeks — açıklama başına sabit karakter tavanı ve kesildiğini belli eden `...`.

## Karar
Al — 60 karakterlik indeks tavanı ve kullanım-oranıyla budama, Core'un pasif kütüphanesine doğrudan uyar.
