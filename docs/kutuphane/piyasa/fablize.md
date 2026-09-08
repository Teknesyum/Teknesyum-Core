# fivetaku/fablize

- MIT · plugin (marketplace + plugin.json) · ★896
- mekanizma: 4 kanca (UserPromptSubmit×2, PostToolUse, Stop), 1 komut, 1 skill, 2 "pack" metni, 0 MCP
- sıradan turda bağlama: `gate_prompt.py` her turda `context_for_mode()` yazıyor (~330 B / ~85 token), skill açıklaması ~95 token; `router.sh` yalnız sinyal eşleşirse 1-2 satır ekliyor. Toplam ~0,4 KB / ~180 token/tur (dosya boyutları + emit edilen satır sayısıyla ölçüldü)
- premium: yok

## Ne yapar
Opus'u Fable gibi "işi sonuna kadar götüren" hale getirmeyi hedefliyor. PostToolUse turun kanıtlarını bir "ledger"a yazıyor, Stop kancası ledger'da doğrulama kanıtı yoksa `decision: block` ile durmayı reddediyor. UserPromptSubmit istemi quick/normal/deep diye sınıflayıp o moda uygun tek paragraf enjekte ediyor.

## Core'a alınacak
- **kanca**: tur-içi kanıt defteri + Stop kapısı. Core'un "eşikte bir kez konuş" ilkesine uyar: PostToolUse sessizce sayar, yalnız Stop anında ve yalnız kanıt yoksa tek satır konuşur. `plan yok` uyarısıyla aynı desen.
- **fikir**: `packs/*.txt` — sinyal eşleştiğinde dosya *yolunu* ve tek cümlelik özeti veriyor, dosyayı yüklemiyor. Core'un raf mantığının ucuz varyantı.
- **fikir**: `stop_hook_active` döngü koruması + `warning_after_max_blocks` — kapı ikinci kez ısrar etmiyor, Core'un "ikinci kez sormaz" kuralının kodlanmış hali.

## Karar
Al — Stop kapısı + PostToolUse defteri, sıradan turda 0 token ile kurulabilir; fablize kendisi her tur ~180 token harcıyor, o kısım alınmaz.
