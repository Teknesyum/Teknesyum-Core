# staruhub/ClaudeSkills

- MIT · metin paketi (Agent Skills, `SKILL.md` biçimi) · ★711
- mekanizma: 20 SKILL.md, 0 kanca, 0 komut, 0 ajan, 0 MCP; 285 dosya; CI'da `validate` iş akışı, ayrıca `verification/`, `llm-wiki/`, `tests/`
- sıradan turda bağlama: 20 skill frontmatter'ı 11.745 B ≈ 2.900 token (ortalama 587 B/skill — claude-code-java'nın iki katı)
- premium: yok

## Ne yapar
13 skill paketi (dosya sayısı 20): araştırma, ürün kararları, sunum, yayın, denetim. İddiası şu: bir prompt bir kez iş yapar ve konuşmayla ölür, bir skill yöntemi ortada bırakır — yeniden kullanılır, denetlenir, iyileştirilir. Her paket adımlar + şablonlar + betikler + kabul kontrollerini birlikte taşıyor.

## Core'a alınacak
- kitap: "prompt bir kez, kitap kalıcı" ayrımı — Core kütüphanesinin varlık gerekçesinin en temiz tek cümlelik ifadesi.
- fikir: her paketin içinde **kabul kontrolü** (acceptance check) bulunması — raf maddesi "ne zaman uygulandı sayılır"ı da yazsın; şu an raflarda böyle bir alan yok.
- fikir: CI'da şema doğrulama (`validate.yml`) — Core'un kütüphane raflarının biçimini `npm test` içinde deterministik olarak sınamak, model gerektirmiyor.

## Karar
Fikir notu — içerik alanı geniş ve Core'a uzak, ama kabul kontrolü alanı ve raf biçimini CI'da doğrulama iki somut, ucuz ekleme.
