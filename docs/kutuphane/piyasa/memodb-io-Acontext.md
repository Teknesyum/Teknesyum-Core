# memodb-io/Acontext

- Apache-2.0 · plugin + barındırılan servis (Go/Python/TS SDK, dashboard) · ★3686
- mekanizma: 1 pazar yeri girdisi (`.claude-plugin/marketplace.json`, kaynak `src/packages/claude-code/plugin`), 3 SKILL.md şablonu (`daily-logs`, `user-general-facts`), kök `CLAUDE.md` 9 B
- sıradan turda bağlama: sabit ölçülemiyor — kurulan skill'ler koşum sırasında üretilir. Tur maliyeti biriken skill sayısına bağlı ve tavanı yok; bu, ölçüm açısından en kötü durum.
- premium: var — acontext.io barındırma, dashboard, Discord; yerel kısım açık kaynak

## Ne yapar
Ajan belleğini skill dosyası biçiminde tutar: koşumlardan öğrenilenleri otomatik yakalar, insanın okuyup düzeltebileceği dosyalara yazar, ajanlar arası paylaşır. Tezi: bellek ayrı bir kara kutu olmasın, skill formatı yeter.

## Core'a alınacak
- fikir: biriken bilginin kullanıcının elle düzeltebileceği düz dosya olması ısrarı — Core'da zaten raf, ama gerekçesi rafa yazılacak kadar iyi.
- fikir: şablonlu bellek dosyası adları (`user-general-facts`, `daily-logs`) — Core'un `MEMORY.md` disiplinine ad şablonu.

## Karar
Hayır — çekirdeği barındırılan servis ve kendi kendine yazan bellek; sabit bir tur maliyeti bile vermiyor, Core'un "istenince okunan pasif raf" ilkesiyle ters.
