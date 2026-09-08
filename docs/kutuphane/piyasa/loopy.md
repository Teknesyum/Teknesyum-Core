# Forward-Future/loopy

- MIT · skill (metin paketi) + dış web katalog · ★3120
- mekanizma: 0 kanca, 0 komut, 0 ajan, 1 skill (loopy) + katalog sitesi
- sıradan turda bağlama: skill frontmatter'ı 882 B (~220 token, iki SKILL.md'nin `---` blokları).
  Katalog depoda değil; ajan gerektiğinde `catalog.json` / `llms.txt` adresini çekiyor,
  yani yerel sabit yük yok.
- premium: yok (katalog ücretsiz, yayına gönderim onaylı)

## Ne yapar
"Döngü" (loop) kavramını standartlaştırıyor: tek seferlik istem yerine ölçüt, geri besleme ve
durma koşulu olan yinelenebilir iş tarifi. Loopy skill'i döngü bulma, denetleme, onarma,
çalıştırma ve kanıt fişi (run receipt) üretme yollarını anlatıyor; katalog ayrı bir sitede.

## Core'a alınacak
- kitap (raf): "döngü" tanımı — durma koşulu, ölçüt, kanıt fişi üçlüsü. Core'un `docs/plan.md`
  ve bench koşularına eksik olan şey tam bu: iş ne zaman biter.
- fikir: kanıt fişi (run receipt) — her koşunun çıktısını dosyaya bağlamak; RULES.md'nin
  "kanıtı göster, özetleyip geçme" kuralının makine biçimi.
- fikir: kataloğu depoya koymamak, `llms.txt` ile dışarıdan çekmek — raf büyürken kurulum
  boyutunu sabit tutan bir yol.

## Karar
fikir notu — mekanizma temiz (220 token) ama içerik dış siteye bağlı; döngü tanımı ve kanıt
fişi Core'a kendi metniyle yazılmalı.
