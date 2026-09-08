# eugeniughelbur/obsidian-second-brain

- MIT · plugin (+ paketlenmiş MCP sunucusu) · ★4368
- mekanizma: 47 komut, 1 skill, 3 kayıtlı kanca (SessionStart / PostToolUse Write-Edit / PostCompact async) + isteğe bağlı UserPromptSubmit recall, 1 MCP (vault)
- sıradan turda bağlama: SessionStart kancası kurulum kökünü yazıyor (~200 B); vault manifesti yalnız cwd vault içindeyse. Recall kancası ölçülü: en çok 4 not ve 900 karakter (~250 token) tavan, eşleşme zayıfsa hiç yazmıyor
- premium: yok

## Ne yapar
Obsidian kasasını Claude'un arayabildiği kalıcı belleğe çeviriyor; yeni kaynak eski sayfayı yeniden yazıyor, çelişkiler uzlaştırılıyor, bayat olgular işaretleniyor. Kaynak `commands/` platform-nötr, adaptörler Codex/Gemini/opencode/Pi için derliyor.

## Core'a alınacak
- kitap: `obsidian-recall.py` başındaki sözleşme — BOUNDED (tavan) · ABSTAINS (şüphedeyse sus) · FAIL-CLOSED (hata = çıkış 0, çıktı yok) · OBSERVABLE (her karar tek JSONL satırı) · OPT-IN (iki env değişkeni yoksa ölü). Core'un kanca felsefesinin yazılı hâli; `pp` ve `??` kancalarına ölçüt olur.
- fikir: kararın kendisini günlüğe yazmak — "enjekte ettim" kadar "sustum" da kaydediliyor; kancanın eşiği sonradan ölçülebiliyor.
- fikir: `CLAUDE_PLUGIN_ROOT` yalnız kanca alt süreçlerinde tanımlı olduğu için mutlak kurulum yolunu SessionStart'ta bir kez yayımlama — Core'un `<eklenti>` yolu sorununu çözer.

## Karar
Al — sözleşme metni Core'un kendi ilkesini dışarıdan doğruluyor ve ölçülebilir eşik (900 karakter, 4 not) veriyor.
