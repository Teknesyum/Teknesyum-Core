# jakubkrehel/make-interfaces-feel-better

- MIT · skill (metin paketi, `npx skills add`) · ★3390
- mekanizma: 1 SKILL.md (12 KB) + 5 referans dosyası (typography, surfaces, animations, icons, performance) + `agents/openai.yaml`; 0 kanca, 0 komut, 0 ajan, 0 MCP
- sıradan turda bağlama: yalnız frontmatter açıklaması 580 B / ~145 token; gövde tetiklenince
- premium: yok (interfaces.dev sitesine bağlı)

## Ne yapar
Arayüzün "iyi hissettiren" küçük ayrıntılarını kural haline getiriyor: animasyon, tipografi, ikon, hover durumu, optik hizalama, eşmerkezli köşe yarıçapı, gölge, tıklama alanı. `quick` ve `full` iki inceleme modu, bulgu sayısı tavanı ve kanıt zorunluluğu var.

## Core'a alınacak
- **kitap**: doğrudan raf adayı. Core'un `teknesyum-ui` standardı henüz kurulu değil ve AGENTS.md "arayüz işinde renk/ölçü uydurma" diyor — bu paket ölçü uydurmayı engelleyen tek kaynak.
- **fikir**: `quick`/`full` mod + bulgu tavanı; Core'un "cevaplar kısa" kuralının inceleme çıktısına uygulanmış hali.
- **hiç**: kurulum yolu (`npx skills add`) alınmaz, dosyalar rafa kopyalanır.

## Karar
Al — MIT, saf metin, 145 token'lık giriş; Core'un boş duran arayüz rafını doldurur (ama teknesyum-ui tokenları gelince ikisinin çelişmemesi gözetilmeli).
