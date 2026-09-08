# ksimback/tech-debt-skill

- lisans belirtilmemiş · metin paketi (tek skill) · ★593
- mekanizma: 1 skill, 0 kanca/komut/ajan/MCP; 3 dosya
- sıradan turda bağlama: frontmatter 409 B ≈ 100 token, üstelik `disable-model-invocation: true` — model kendiliğinden çağıramıyor, yalnız `/tech-debt-audit` ile açılıyor
- premium: yok

## Ne yapar
Depo genelinde teknik borç denetimi yapar, `TECH_DEBT_AUDIT.md` üretir. Faz 1 "önce yönel" zorunlu: manifest, dizin haritası, `git log --oneline -200` ve 6 aylık churn okunmadan hüküm verilmiyor. Her bulguda `dosya:satır` alıntısı şart, ayrıca zorunlu bir "kötü görünüyor ama aslında sorun değil" bölümü var.

## Core'a alınacak
- kanca/fikir: `disable-model-invocation: true` — bir kitabın yalnız istenince açılmasının resmî yolu; Core'un "istenince okunur" ilkesinin skill dünyasındaki tam karşılığı, kütüphane raflarında kullanılabilir.
- kitap: denetim sözleşmesi — hükümden önce churn okuma, her bulguda `dosya:satır`, zorunlu "yanlış alarm" bölümü. Üçü de rapor kalitesini olguya bağlıyor, RULES.md'deki "kanıtı göster" kuralıyla aynı hat.
- fikir: churn (`git log --stat --since=6 months`) ile borcu önceliklendirme — deterministik, model gerektirmiyor, pasif betik olabilir.

## Karar
Al — 100 token boşta, model kendiliğinden çağıramıyor; mekanizması Core ilkesiyle uyumlu, içeriği doğrudan raf malzemesi.
