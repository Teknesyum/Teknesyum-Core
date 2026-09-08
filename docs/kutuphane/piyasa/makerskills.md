# coreyhaines31/makerskills

- MIT · plugin (marketplace) · ★796
- mekanizma: 21 skill (642 KB), kanca 0, komut 0 (skill'ler `/ad` ile çağrılıyor), ajan 0, MCP 0
- sıradan turda bağlama: 21 frontmatter toplam 22.116 bayt ≈ 5.500 token, her turda yüklü. Skill başına ortalama 1.053 bayt; `decide`'ın description'ı tek başına 1.100 baytı aşıyor (tetik cümleleri, yöntem kaynağı ve arşiv yolu hep açıklamada).
- premium: yok (site var, ücretli katman yok)

## Ne yapar

Kurucu/tek kişilik operatör işleri için skill seti: karar verme (37signals'ın 38 soruluk kılavuzu), derin araştırma, ikinci beyin, içerik rotasyonu, senaryo modelleme. Belge önce, otomasyon yan ürün: her SKILL.md elle de uygulanabilir bir iş akışı metni.

## Core'a alınacak

- **fikir**: açık depo / gizli yapılandırma iki katmanı — `skills/` herkese açık ve kişisel veri içermiyor, `~/.config/makerskills/` gitignore'lu ve arşivler oraya yazılıyor. Core'un `teknesyum-private` özel rafıyla aynı ayrım; `ARCHITECTURE.md`'deki şema hazır bir gerekçe metni.
- **fikir**: `decide` skill'inin "karar verme eylemi = kararı günlüğe yazma eylemi" kuralı ve arşive gözden geçirme tarihi koyması — Core'un `docs/netlestirme/` ve karar kayıtları için ucuz bir ekleme.
- **karşı örnek**: 21 skill'in açıklamalarını uzun tutmanın bedeli ölçüldü: 5.500 token, hiçbiri çağrılmadan. Core'un "sıradan turda sıfır" ilkesinin sayısal savunması.

## Karar

Fikir notu — mekanizması Core'a ters (5.500 token daima yüklü), ama iki katmanlı gizli yapılandırma ayrımı ve karar-günlüğü kuralı not edilir.
