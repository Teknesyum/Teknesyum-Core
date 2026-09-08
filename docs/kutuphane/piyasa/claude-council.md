# hex/claude-council

- MIT · plugin (marketplace) · ★706
- mekanizma: 1 kanca dosyası (`Stop`, 120 sn), 4 komut (`ask`, `advise`, `result`, `status`), 1 ajan (`council-advisor`), 4 skill, 0 MCP; sağlayıcı başına shell betiği
- sıradan turda bağlama: `CLAUDE.md` yok; 4 skill açıklaması ~1.400 bayt ≈ 350 token daima yüklü (frontmatter `description` alanları toplandı). Stop kancası `stop-review-gate.sh` üzerinden geçiyor
- premium: yok; sağlayıcı API anahtarları ya da mevcut CLI abonelikleri kullanıcının

## Ne yapar
Aynı soruyu beş sağlayıcıya (Codex, Antigravity, Grok, Perplexity, Kimi/OpenRouter) paralel soruyor, cevapları yan yana gösterip bir sentez yazıyor. Sentezin ayırt edici yanı: hemfikir oldukları yerde bunu doğrulama değil, cevabın dayandığı ortak varsayım olarak adlandırıyor. Sağlayıcı yoksa aynı modelden kör roller açan yerel konsey.

## Core'a alınacak
- fikir: **"hemfikirlik doğrulama değildir"** sentez kuralı — Core'un fable danışma akışında dönen cevabın altına yazılacak tek satır.
- kitap: `config/roles.json` + `prompts/role-injection.md` kalıbı; Core'un `agency.js` koltuk sistemine karşılaştırmalık.
- fikir: sağlayıcı arabirimini tek bir shell sözleşmesine indirgemek (`scripts/providers/*.sh`), yeni sağlayıcı eklemeyi dosya kopyalamaya çevirmesi.

## Karar
fikir notu — Core'da `agency.js` zaten danışma yapıyor; alınacak olan mekanizma değil, sentez kuralı ve rol dosyası biçimi.
