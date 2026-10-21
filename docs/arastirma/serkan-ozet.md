Selam Serkan,

Claude Code için piyasada çok konuşulan araçları ölçtük. Kısa özeti aşağıda.

**Neden Yaptık**

Bu araçların çoğu "token'ı %80 düşürür", "71 kat ucuz" gibi büyük iddialarla geliyor ve on binlerce yıldız topluyor. Biz de Core'a ölçmeden hiçbir şey almama kuralını koyduk. Bu yüzden iddiaları kendi depolarımızda tek tek denedik.

**Ne Kadar Taradık**

| Tur | Tarih | Bakılan depo | Sonuç |
|---|---|---:|---|
| İlk piyasa taraması | 8 Eylül 2026 | 963 | 93 al, 165 fikir notu, 705 hayır |
| Piyasa taraması | 21 Ekim 2026 | 22 | Ölçüm adaylarını belirledi |
| Ön tarama (8 alan) | 21 Ekim 2026 | 515 | 49 yüksek aday |
| **Toplam** | | **1.500** | 55 araç ölçüme girdi |

Ekim taramasına Eylül'de bakılan depolar tekrar alınmadı.

**Nasıl Ölçtük**

- 55 aracı seçip kurduk.
- Her aracı aynı işte, araçlı ve araçsız olarak karşılaştırdık; her deneme en fazla 3 kez tekrarlandı.
- Her aracı ayrı bir klasöre kurduk; hiçbiri günlük ortama karışmadı.
- Toplam harcama yaklaşık 32,6 dolar oldu.

Her araç için tek bir sayı veriyoruz: **balon oranı**. Bu, iddianın tutmayan kısmı. %0 balon iddianın tamamen tuttuğunu, %80 balon iddianın beşte birinin tuttuğunu gösterir.

**Araç Araç Sonuç**

Yalnız 1.000 ve üzeri yıldızlı araçlar, yıldıza göre sıralı.

| Araç | Yıldız | İddia | Ölçtüğümüz | Balon oranı |
|---|---:|---|---|---:|
| graphify | 130.796 | Token %80 azalır | Token %22 azaldı | **%72 balon** |
| caveman | 113.970 | Token %33,2 azalır | Token %16,4 azaldı | **%51 balon** |
| headroom | 76.941 | Token %41 azalır | Token %26 azaldı | **%37 balon** |
| code-review-graph | 32.295 | 63 kat ucuz | 1,2 kat ucuz (%18) | **%82 balon** |
| promptfoo | 26.227 | İstem testlerini doğru değerlendirir | 11 vakada 11 | **%0 balon** |
| toon | 25.535 | Token %42,6 azalır | Token %18 azaldı | **%58 balon** |
| ccusage | 19.100 | Doğru token ve maliyet | Birebir doğru | **%0 balon** |
| knip (ayarsız) | 12.486 | Ölü kodu bulur | 20 bulgunun 15'i yanlış | **%75 balon** |
| scc | 8.835 | Doğru satır sayımı | Birebir doğru | **%0 balon** |
| pxpipe | 7.542 | Token %59-70 azalır | Token %79 azaldı ama doğruluk %70'e düştü | **%30 balon** |
| dcg | 6.197 | Yıkıcı komutu engeller | 18 komuttan 15 | **%17 balon** |
| skill-scanner | 2.616 | Kötü skill'i yakalar | 5 vakada 2 | **%60 balon** |
| betterleaks | 2.287 | Sızmış anahtarı bulur | 5 vakada 5 | **%0 balon** |
| tokencost | 2.004 | Doğru token sayımı | %17-36 eksik sayıyor | **%27 balon** |
| cc-safety-net | 1.714 | Yıkıcı komutu engeller | 18 komuttan 13 | **%28 balon** |

Birkaç satırda oranın yanında bilinmesi gereken bir bedel var:

- **pxpipe:** token'ı iddiadan da çok düşürüyor, ama yazıyı resme çevirdiği için modelin doğru okuma oranı %70'e iniyor. %30 balon bu kayıp.
- **tokencost:** %27 balon, ama bir sayım aracı için %17-36 eksik saymak onu kullanılamaz yapıyor.
- **dcg ve cc-safety-net:** komutların bir kısmını kaçırıyor, bir kısmında da yanlış alarm veriyorlar.

**Tabloda Olmayanlar**

- **1.000 yıldızın altındaki 8 araç:** bonsai, claude-handoff ve cc-cache-monitor tamamen ya da büyük ölçüde balon çıktı. claudeignore, claude-multisession ve ttok kısmen tuttu. fauxnix ve v4-pro iddialarını tutturdu.

- **mcp-cli, mcporter, playwright-cli:** MCP yükünü kaldırmayı vaat ediyor, ama Claude Code bunu zaten kendisi yapıyor. Bizde kazanç sıfır.
- **Ölçülemeyen 8 araç:** API anahtarı istediler ya da Windows'ta çalışmadılar. Bunlar claude-context, codebase-memory-mcp, ripsecrets, unclog, communique, fleetmates, godot-mcp-go ve coding_agent_session_search.
- **Sayısal iddiası olmayan 10 araç:** ölçecek bir iddia olmadığı için ayrı tuttuk.

**Yıldızlar Ne Diyor**

- İncelenen araçların toplam yıldızı 900.889.
- Bunun %37'si iddiası tutan 14 araçta.
- %47'si iddiasının yarısını tutturamayan 23 araçta.
- Kalan %16'sı ölçülemeyen ya da iddiası olmayan araçlarda.
- En çarpıcı örnek graphify: 131 bin yıldız ve "71,5 kat" iddiası var, ölçtüğümüz 1,3 kat.
- Kısacası yıldız ilgiyi gösteriyor, kazancı değil.

**Ne Aldık**

Bir araç ölçümde tutsa bile, onu modelin hatırlamasına bırakırsak hiç çağrılmıyor. Bu yüzden yalnız bir betiğin ya da kancanın kendiliğinden çağırdığı araçları aldık. Sürekli yük bindirmiyorlar.

- **betterleaks:** sızmış anahtar taraması yapıyor; denemede hepsini yakaladı. Her sürümden önce kendiliğinden çalışıyor.
- **markitdown:** PDF'yi %54, Word dosyasını %92 daha az token'la okutuyor; doğruluk aynı. PDF, Word, PowerPoint ya da Excel dosyası okunurken kendiliğinden devreye giriyor.

Tutan ama yeri olmayanlar:

- **scc:** satır sayımında birebir doğru, ama Core zaten satır sayıyor.
- **knip:** ayarla bile 12 bulgunun 7'si yanlış; elle kontrol gerektiriyor.
- **headroom:** işe yarıyor, ama bizim araç çıktılarımızın yalnız %0,7'si onun güçlü olduğu büyük JSON türünde.
- **graphify:** yalnız 400'den fazla üretim dosyası olan projelerde kazandırıyor. Bu projelerde oturum başında modele bir kez hatırlatılıyor; kullanıp kullanmamak modelin kararı.

Bundan çıkan kural: "doğru çıkarsa nereye girer, onu kim çağırır" sorusunun cevabı yoksa depo artık taranmıyor bile.

**Kendi Tarafımızda Çıkanlar**

- **Maliyet hesabında hata:** Core'un maliyet hesabı faturayı %8-20 eksik gösteriyordu. Sebep, 1 saatlik önbellek yazmasının ucuz fiyattan sayılmasıydı. Düzelttik; şimdi ccusage ile kuruşu kuruşuna aynı.
- **Komut kapısı:** Core'unki 18 tehlikeli komuttan 17'sini yakaladı; en iyi rakip 15'ini.
- **Token sayımı:** Core rakip araçlardan doğru sayıyor; onlar %17-36 eksik sayıyor.

Detaylı rapor istersen gönderirim.
