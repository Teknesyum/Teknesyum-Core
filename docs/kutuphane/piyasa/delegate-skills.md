# amElnagdy/delegate-skills

- MIT · Agent Skills paketi (`npx skills add`) · ★1822
- mekanizma: 18 skill (17 delege + `delegate-setup`), 0 kanca, 0 komut, 0 MCP; her skill'in yanında `references/` ve `scripts/`; CI'da "relay smoke" testi
- sıradan turda bağlama: 18 açıklamanın toplamı 10.345 B ≈ ~2,6k token (frontmatter `description` alanları toplandı); skill gövdeleri toplam 161.700 B, istenince yükleniyor
- premium: yok

## Ne yapar
Makinede kurulu implementer CLI'ları (claude, codex, cursor, aider, opencode, copilot, grok, kimi...) keşfeder, `feature`/`tests`/`ui` gibi şeritlere bağlar; orkestratör tek sınırlı görev için brief yazar, ayrı süreç çalışma ağacını düzenler, diff'i orkestratör inceler ve commit'i kendisi atar. Implementer'a "commit etme" denir; kapı komutları brief'e elle kopyalanır.

## Core'a alınacak
- kitap: "brief yazma" disiplini — ayrı sürecin sohbet geçmişi yok; `AGENTS.md` otomatik yüklenmez, yük taşıyan her kısıt ve gerçek kapı komutu brief'e kopyalanmalı, brief başına tek görev. Core'un ajana olgu verme kuralının tam karşılığı.
- fikir: şerit (lane) kavramı — iş türüne göre sabit implementer eşlemesi; Core'un `agency.js` koltuk seçimiyle aynı iskelet, ama koltuk yerine dışarıdaki CLI.
- fikir: "ne zaman kullanma" bölümü her skill'in başında — küçük iş, kullanıcı doğrudan istedi, CLI kimlik doğrulamasız ise devreye girme. Core'un eşik mantığına örnek.

## Karar
fikir notu — mekanizma iyi ama 18 skill turda ~2,6k token yazıyor; Core'a skill olarak girmez, brief disiplini kitap olarak alınır.
