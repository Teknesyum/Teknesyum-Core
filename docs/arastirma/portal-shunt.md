# Portal By Spotify (Shunt) İncelemesi

2026-09-29. Sonnet alt ajanının raporu, olduğu gibi.

**Yazı bulundu ve okundu.** Spotify Engineering'de, yazar Dimitri Mazmanov. Yazının kendi sayfası 3 Eylül 2026 tarihini veriyor. Bazı haber siteleri 16 Eylül diyor, ama birincil kaynak 3 Eylül.

## 1. Mekanizma
- MCP sunucusu, yerel model ya da önbellek yok. Bu bir Claude Code eklentisi: `shunt`.
- Üç katmanı var. Hook'lar (PreToolUse) büyük okumaları engelliyor. `bulk-read` ve `code-write` betikleri Portal CLI'yi çağırıyor. Markdown skill dosyaları Claude'a ne zaman devredeceğini söylüyor.
- İşi yapan, Portal'daki "AiKA Modes" adlı, geçici çalışma ortamında koşan bildirimsel ajanlar. İkisi var: `bulk-reader` ve `code-writer`. İkisinde de işçi model Gemini 2.5 Flash.
- Yönlendirilen işler: çok dosyalı büyük okumalar (işçi özet döndürüyor) ve mevcut kalıba uyan boilerplate üretimi (test, yapılandırma, tip iskeleti).
- Karar kuralı: bir dosya okuması 350 satırı aşarsa hook engelliyor ve devrettiriyor. Eşik `SHUNT_MIN_LINES` ile ayarlanıyor. Büyük dosyaya bash ile okuma da aynı kurala tabi. Hedefli okuma (satır aralığı, grep, boru hattı) devretmeden geçiyor.
- Gist'e göre kararlılık için işçi sıcaklığı 0.2, kod üretiminde 0.0. Bu bilgi üçüncü taraf gist'ten, yazıda doğrulamadım.

## 2. Ölçüm
- %90, dört Java monorepo senaryosunda ortalama tasarruf. Claude'un dosyaları doğrudan okumasıyla harcayacağı token ile devir sonrası ona dönen özet/üretim arasındaki fark.
- Yazının kendi uyarısı: kod yazma ölçümünde referans dosya okumaları ve Claude'un hiç işlemediği üretim tokenleri dışarıda bırakılmış.
- Örneklem küçük, tek kod tabanı türü (Java) ve ölçümü yazarın kendisi yapmış. Bağımsız doğrulama bulamadım.

## 3. Açık Kaynak Mı, Kurulabilir Mi
- Evet. Depo: https://github.com/spotify/portal-ai-plugins, lisans Apache-2.0. `plugins/shunt/` dizininde, yalnız Claude Code'da çalışıyor.
- Kurulum: `claude plugin marketplace add spotify/portal-ai-plugins`, `claude plugin install portal@portal`, `claude plugin install shunt@portal`.
- Bağımlılık: `@spotify/portal-cli` (npm) ve bir Spotify Portal hesabı. Yani işçi model çağrıları Portal'ın eylem kayıt defterinden geçiyor. Kendi API anahtarınla bağımsız çalışacağına dair bir işaret bulamadım.

## 4. Somut Teknikler
- PreToolUse hook ile 350 satır üstü Read'i sert engelleme (istem talimatı değil, zorlama).
- Bash ile büyük dosya okumayı da ayrı hook ile yakalama.
- Boru hattı ve hedefli komutları (grep, satır aralığı) engelden muaf tutma.
- Okumayı tek dosya yerine "N dosya, tek soru" diye toplu devretme.
- İşçiye yalnız özet döndürtme, ham içerik ana bağlama girmesin.
- İşçiyi tek kullanımlık bağlamda çalıştırma, sunucuda saklama yok.
- Boilerplate'i spesifikasyon ve referans dosyayla işçiye yazdırma.
- Yönlendirme mantığını işçi model yapılandırmasından ayırma (model değiştirmek kolay).
- Skill dosyalarıyla Claude'a devretme kuralını öğretme.
- Claude devri görmezden gelirse sistem yine çalışıyor (zarif bozulma).
- Eşiği ayarlanabilir tutma. Gist'e göre devir gecikmesi kazancı aşarsa eşik yükseltilmeli.

**Bulunamadı:** yazıdaki ham token tablosu (senaryo bazında sayılar) ve bağımsız bir yeniden üretim. Gist'teki `your-org/mcp-cheap-worker` deposu yer tutucu, gerçek değil, yok sayın.

## Kaynaklar
- https://engineering.atspotify.com/2026/9/portal-by-spotify-cut-my-claude-code-token-usage-by-90
- https://github.com/spotify/portal-ai-plugins
- https://gist.github.com/vtri950/84b2261efbadba243870bf161764aeb7
- https://clauding.de/en/posts/spotify-shunt-claude-code-tokens-90-prozent/
- https://www.techzine.eu/news/devops/144093/spotify-reduces-claude-code-token-usage-by-90-percent/
