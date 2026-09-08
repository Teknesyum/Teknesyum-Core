# aiwithremy/claude-skills-llm-council

- lisans dosyası yok · metin paketi (tek SKILL.md) · ★1879
- mekanizma: 1 SKILL.md (16.128 B), kanca 0, komut 0, ajan 0, MCP 0
- sıradan turda bağlama: `description:` tek satır, ~1.075 B ≈ 270 token — alışılmadık uzun; tetikleyiciler ve tetiklememesi gereken durumlar aynı satırda.
- premium: yok

## Ne yapar
Karpathy'nin LLM Council yöntemini tek skill dosyasına indirir: soruyu 5 bağımsız danışmana sorar, danışmanlar birbirinin cevabını anonim puanlar, bir başkan sentezler. Depoda kod yok, yalnız yönerge metni.

## Core'a alınacak
- fikir: anonim akran değerlendirmesi — Core'un `agency.js` turunda koltuklar birbirini görmüyor; "kim yazdı belli olmadan puanla" adımı ucuz kalite artışı.
- fikir: `description:` içine negatif tetikleyici yazmak ("basit evet/hayır sorusunda çalışma") — Core'un `??` ve `pp` öneklerinde yanlış tetiklemeyi kısar.
- kitap: iyi ve kötü konsey sorusu örnekleri; danışma rafına 10 satırlık ek.

## Karar
Fikir notu — Core'da danışma mekanizması zaten var; yalnız anonimlik ve negatif tetikleyici kuralı alınır, 270 token'lık açıklama satırı örnek alınmaz.
