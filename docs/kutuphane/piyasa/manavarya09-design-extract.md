# Manavarya09/design-extract

- MIT · plugin + CLI (`designlang`) · ★4059
- mekanizma: 0 kanca · 14 komut (`/extract`, `/site`, `/grade`, `/battle`, `/remix`, `/pack`, `/theme-swap`, `/brand`, `/pair`, `/studio`, `/verify`, `/fidelity`, `/gallery`, `/dna`) · 1 skill (`extract-design`) · 0 ajan · MCP (smithery dockerfile) var
- sıradan turda bağlama: 14 komut adı + 1 skill açıklaması; ama `plugin.json` `description` alanı tek başına ~180 kelime — pazarlama metni bağlamda duruyor. Kaba ölçüm ~1.2 KB ≈ 300 token.
- premium: yok; designlang.app barındırılan hizmet olarak duruyor.

## Ne yapar
Verilen bir site URL'sinden tam tasarım dilini çıkarır: DTCG token'ları, Tailwind/shadcn/Figma değişkenleri, hareket ve ton; WCAG puanı üretir, klon ile orijinali piksel farkıyla karşılaştırır.

## Core'a alınacak
- fikir: `/fidelity` — üretileni orijinaline karşı ölçüp puan veren doğrulama adımı; Core'un "bitince çalıştır, çıktıyı göster" kuralının ölçülebilir hâli.
- fikir: `plugin.json` açıklamasının 180 kelimeye şişmesi — Core için karşı örnek; eklenti üst verisi de bağlama giriyor, kısa tutulmalı.

## Karar
hayır — tasarım token'ı çıkarma Core'un alanı dışında; yalnız iki karşı/olumlu desen not edilir.
