# addyosmani/agent-skills

- MIT · plugin (skills + agents + commands + hooks) · ★92965
- mekanizma: 25 skill, 4 ajan, 9 komut, 3 kanca betiği (SessionStart kayıtlı; sdd-cache pre/post ve simplify-ignore isteğe bağlı), MCP yok
- sıradan turda bağlama: SessionStart kancası `using-agent-skills/SKILL.md` dosyasını olduğu gibi enjekte ediyor — 10.446 B (~2.6K token); üstüne 25 skill açıklaması 8.936 B (~2.2K token). Toplam ~4.8K token, her oturumda. (wc -c ve description satırlarının awk toplamı.)
- premium: yok

## Ne yapar
Üretim seviyesinde mühendislik skill'leri kitaplığı: tanımla / planla / kur / doğrula / gözden geçir / gönder fazlarına bölünmüş. Her skill'de Overview, When to Use, Process, Common Rationalizations, Red Flags, Verification bölümleri zorunlu. Eval çatısı ve çok platformlu (codex, gemini, opencode) dağıtım var.

## Core'a alınacak
- kitap: skill iskeleti — "Common Rationalizations" ve "Red Flags" başlıkları. Bir kitabın modelin kendine söylediği bahaneleri önceden yazması, Core'un pasif raf metinleri için doğrudan uygulanabilir kalıp.
- fikir: `sdd-cache` kancası — WebFetch sonucunu diske yazıp her kullanımda `If-None-Match`/`If-Modified-Since` ile 304 doğrulaması yapıyor. Önbellek ama bayat değil; Core'un kütüphane fetch'ine uyar.
- fikir: `simplify-ignore` — okumadan önce dosyanın seçili bloklarını `BLOCK_<hash>` ile değiştirip Stop'ta geri koyan kanca. Bağlama girmeyen kod bölgesi kavramı.

## Karar
fikir notu — mekanizması iyi ama her oturumda ~4.8K token yazıyor, Core'un sıfır-token ilkesinin tam tersi; alınacak olan kalıplar, paket değil.
