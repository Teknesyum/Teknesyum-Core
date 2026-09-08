# levnikolaevich/claude-code-skills

- MIT · plugin (14 plugin.json, Agent Plugins v1 + Claude Code/Codex marketplace) · ★559
- mekanizma: 25 SKILL.md, kanca 0, komut 0, ajan 0, MCP 0 (README'nin kendi ifadesi: "no MCP servers, no orchestration hierarchy")
- sıradan turda bağlama: `CLAUDE.md` 39 B; 25 frontmatter toplamı 4.656 B (~1,2K token) ve yalnız kurulan plugin'inki yüklü; gövdeler 306.871 B tetiklenince
- premium: yok

## Ne yapar
Her biri tek sınırlı çıktıya odaklı mühendislik becerileri: plan gözden geçirme, teslim gözden geçirme, dokümantasyon/kod tabanı/test/mimari/kalıcılık denetimi, optimizasyon. Beceriler suite'lere bölünmüş, yalnız gereken plugin kuruluyor.

## Core'a alınacak
- **kitap (en değerli)**: `SKILL_TEMPLATE.md` — "preservation contract". SKILL.md için 200 satır tavanı, 200 karakter açıklama sınırı, her bağımsız doğrulanabilir yükümlülük ayrı kutucuk, bir kural tek kanonik yerde, zorunlu kontrol isteğe bağlı referansın arkasına saklanmaz. Core'un kitap yazma disiplini için doğrudan uygulanabilir kural seti; RULES.md'nin 30 satır tavanıyla aynı felsefe.
- **kitap**: ortak rapor sırası (sonuç, kapsam, kanıt, doğrulama, tamamlanma) — Core'un "kanıtı göster, özetleyip geçme" kuralının biçimlenmiş hali.
- **fikir**: "her beceri bağımsız, ortak sözleşme metni her dosyada tekrarlanır, doğrulama kopyalar arası kaymayı yakalar" — Core'un raflarında da kopya-kayma sorunu doğabilir.

## Karar
Al — şablonun disiplin kuralları rafa; 25 skill kurulmaz.
