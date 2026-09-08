# sara-star-quant/presence

- Apache-2.0 · plugin (kur: install.sh, ayrıca MCP + AGENTS.md yansıması) · ★7
- mekanizma: 6 kanca betiği / 5 olay (SessionStart, UserPromptSubmit, PreToolUse:Bash, PostToolUse:Bash+Edit, Stop) · 7 komut · 1 ajan · 3 skill · MCP sunucusu var · ajan yok denecek kadar az
- sıradan turda bağlama: 3 SKILL.md frontmatter açıklaması ~1.15 KB ≈ 290 token (wc -c ile ölçüldü: 2729+2453+3242 B gövde, açıklamalar gövdenin küçük kısmı). UserPromptSubmit kancası olay yoksa hiçbir şey basmıyor (`hook_user_prompt_submit.py`: `if digest:`) → boş turda 0. SessionStart'ta `model.md` enjeksiyonu tavanı `max_tokens*4` karakter, varsayılan 4000 token (solo-dev preset).
- premium: yok; README'de fiyat/abonelik geçmiyor

## Ne yapar
Her oturumu birbirine bağlar: depo başına kalıcı "proje modeli", Claude'un attığı commit'lerin sonucunu (revert/amend/PR kapanışı) izleyen telemetri, turlar arası olayların özeti ve Stop kancasında "düzeldi/oldu" gibi doğrulanmamış başarı iddiasını yakalayan kalibre güven kapısı. Durum tamamen yerel, `~/.claude/presence/`.

## Core'a alınacak
- kanca: Stop olayında doğrulanmamış başarı iddiası uyarısı — son edit'ten sonra geçen test/build olayı yoksa tek satır uyar. Core'un "eşikte bir kez konuş" ilkesine birebir oturuyor, sıfır turda sıfır token.
- kanca: UserPromptSubmit'te olay kuyruğunu boşaltma deseni — kuyruk boşsa hiç yazmama (`if digest:`), Core'un sıradan tur ilkesinin hazır uygulaması.
- fikir: `max_tokens*4` karakter tavanıyla yapısal parça parça kırpma (`model.py read_model`) — Core'un raf okumasında pasif kırpma ölçüsü olarak.

## Karar
Al — Stop kancası güven kapısı ve boş kuyrukta susan UserPromptSubmit deseni, ölçülen 0 token maliyetiyle Core ilkesine tam uyuyor.
