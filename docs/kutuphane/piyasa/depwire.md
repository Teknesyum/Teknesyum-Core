# depwire/depwire

- BUSL-1.1 (açık kaynak değil, ticari kısıtlı) · MCP sunucusu + CLI + VS Code eklentisi · ★61
- mekanizma: 24 MCP aracı, 17 dil ayrıştırıcı; 0 kanca, 0 skill, 0 ajan (ölçüm README rozetleri
  ve README kurulum bölümünden; depo klonlanmadı — lisans nedeniyle kod alınamaz)
- sıradan turda bağlama: MCP sunucusu bağlıyken 24 araç tanımı her tura giriyor; benzer
  sunucularda araç başına ~120-200 token, yani kabaca 3-5 KB / ~3.000+ token
- premium: var — bulut sürümü `app.depwire.dev`, BUSL lisansı ticari kullanımı sınırlıyor

## Ne yapar
Kod tabanının bağımlılık grafiğini deterministik olarak (RAG değil, ayrıştırıcı ile) çıkarıp
ajana "hangi dosya neyi çağırıyor, bu değişiklik neyi kırar" sorusunun cevabını veriyor.
17 dil, MCP üzerinden sorgulanabilir 24 araç.

## Core'a alınacak
- **fikir — grafiği model yerine ayrıştırıcı çıkarsın**: Core'da `map.js` zaten import haritası
  üretiyor; depwire'ın satışı "olasılıksal değil deterministik" — Core'un `map.js` tanıtımında
  aynı gerekçe kullanılabilir.
- **fikir — etki alanı sorgusu**: "bu dosyayı değiştirirsem ne kırılır" çıktısı `map.js`'e
  ters-bağımlılık listesi olarak eklenebilir; MCP gerekmez, dosyaya yazılır.
- **hayır — MCP olarak kurulum**: 24 araç tanımı sıradan turda bağlama giriyor, ilke ihlali.

## Karar
Hayır — BUSL lisansı ve MCP maliyeti; yalnız ters-bağımlılık sorgusu `map.js` için fikir notu.
