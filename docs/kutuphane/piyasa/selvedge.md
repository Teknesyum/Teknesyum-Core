# masondelan/selvedge

- MIT · plugin + yerel MCP sunucusu + CLI · ★23
- mekanizma: 3 kanca (`PreToolUse` Edit|Write|MultiEdit|NotebookEdit|Bash, `SessionStart`, `PreCompact`), 4 komut (`blame`, `history`, `prior-attempts`, `status`), 1 skill, 1 MCP sunucusu (`bin/selvedge-plugin-server`), 0 ajan
- sıradan turda bağlama: ~7,7 KB / ~2,0k token — `CLAUDE.md` 7321 bayt + skill açıklaması 370 bayt (SKILL.md gövdesi 3629 bayt) + MCP araç tanımları + SessionStart kanca çıktısı; `wc -c` ile sayıldı
- premium: yok; "yerel öncelikli, takım sunucusu seçmeli"

## Ne yapar
Ajanın yaptığı değişikliği gerekçesiyle birlikte, değişiklik olurken SQLite'a yazar (`.selvedge/`). `selvedge blame user_tier_v2` o sütunun neden eklendiğini, hangi ajanın hangi commit'te yazdığını döndürür. Asıl iddia denenip geri alınmış yaklaşımları hatırlatmak: `prior_attempts` çağrısı ajanın aynı duvara ikinci kez toslamasını engeller.

## Core'a alınacak
- **fikir — "denendi ve geri alındı" kaydı.** Core'un `docs/netlestirme/` ve karar kayıtları neyin seçildiğini yazıyor, neyin elendiğini yazmıyor. Reddedilen yolu kaydetmek en ucuz tekrar önleyicisi.
- **fikir — kaydı ajanın kendisi anında yazar.** İkinci bir LLM diff'ten gerekçe uydurmuyor; Core'un `log.js` kalıbıyla aynı yön.

## Karar
Hayır — fikir değerli ama kurulum biçimi Core'un tersi: sıradan turda ~2,0k token (CLAUDE.md + MCP + her zaman açık skill) ve her Edit/Write/Bash'te kanca.
