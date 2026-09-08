# alibaba/open-code-review

- Apache-2.0 · CLI (`ocr`, Go) + ince skill sarmalayıcı + plugin · ★22094
- mekanizma: 2 skill (10.1 KB + 8.0 KB), 1 eklenti klasörü (claude-code / opencode / qca hedefleri), 0 kanca, 0 MCP; asıl iş Go ikilisinde
- sıradan turda bağlama: 0 KB — CLAUDE.md 57 bayt, skill'ler yalnız çağrılınca okunuyor. Kurulu skill frontmatter'ı ~700 bayt (~180 token)
- premium: yok (Alibaba ürünü, kurumsal sayfa var)

## Ne yapar
Kod incelemesini deterministik mühendislik ile ajan arasında bölüyor: dosya seçimi, ilgili dosyaları tek birime paketleme, kurala göre şablon eşleme ve yorum konumlandırma kodda; yalnız yargı modelde. README'de kendi ölçümü: genel amaçlı ajanla aynı modelde daha yüksek precision/F1, **~1/9 token**, recall bilinçli olarak düşük.

## Core'a alınacak
- **fikir**: "deterministik motor + dar ajan" bölüşümü Core'un "model gerekmiyorsa model kullanma" kuralının ölçülmüş hali; 1/9 token rakamı raf notu olarak yazılabilir.
- **pasif betik**: ilgili dosyaları tek inceleme birimine paketleme (ör. `message_en.properties` + `message_zh.properties`) — Core'daki README ikizleri kuralının otomatik karşılığı.
- **fikir**: kalın CLI'yı ince bir skill'in sarmalaması; skill yalnız CLI'yı nasıl çağıracağını anlatıyor, bilgi CLI'da duruyor.

## Karar
Al (fikir + betik) · ölçülü token oranı ve dosya-paketleme deseni Core'un ilkelerini doğrudan besliyor, kod Go olduğu için kendisi alınmaz.
