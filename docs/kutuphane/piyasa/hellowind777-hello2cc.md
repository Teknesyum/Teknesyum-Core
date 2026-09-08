# hellowind777/hello2cc

- Apache-2.0 · plugin (npm + marketplace) · ★693
- mekanizma: 7 kanca olayı (SessionStart, UserPromptSubmit, SubagentStart×3 matcher, SubagentStop, TaskCreated/TaskCompleted, TeammateIdle), 1 ajan (`native.md` 7.300 B), 1 output-style (3.918 B), komut 0, skill 0, MCP 0; ~586 KB betik, 60+ `lib/` modülü
- sıradan turda bağlama: değişken. `UserPromptSubmit` her istemde `buildRouteContext` çağırıyor; ama `lastRouteStateSignature` aynıysa enjekte etmiyor — yani aynı durumda ikinci turda 0
- premium: yok

## Ne yapar
Claude Code'da üçüncü parti model (GPT, Kimi, DeepSeek, Gemini) çalıştıranlar için, modeli yerel Opus davranışına yaklaştıran bir yönlendirme katmanı. Yetenek seçimi, ajan/takım karışıklığı, görev yaşam döngüsü ve cevap üslubunu kancalarla hizalıyor.

## Core'a alınacak
- **fikir (en değerli)**: imza tabanlı tekrar bastırma. `rememberRouteStateSignature(session_id, additionalContext)` — enjekte edilecek metin bir öncekiyle aynıysa hiç yazılmıyor. Core'un "eşikte bir kez konuşur" kuralının genelleştirilmiş, oturum ömrü boyunca çalışan hali.
- **fikir**: `SubagentStart` üzerine matcher'lı kanca (Explore/Plan/general-purpose ayrı bağlam). Core alt ajana "eline hazır olguları ver" diyor; bu, olguyu kancayla vermenin yolu.
- **fikir**: eski/yeni araç adı takma adı (`Task` = `Agent`) — Claude Code sürüm kayması karşısında kancayı kırmayan desen.

## Karar
Fikir notu — ürünün kendisi Core'un derdi değil, ama imza-tekrar bastırma kancası doğrudan uygulanabilir.
