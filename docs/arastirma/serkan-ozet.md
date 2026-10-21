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

Sınıflandırma şöyle:

- **Gerçek:** iddianın en az yarısı tuttu.
- **Kısmi:** iddianın bir kısmı tuttu.
- **Balon:** iddia tutmadı ya da tersi çıktı.

**Araç Araç Sonuç**

"Tutan" sütunu, ölçülen kazancın iddia edilen kazanca oranıdır. "Balon" sütunu, iddianın tutmayan kısmıdır.

| Araç | Yıldız | İddia | Ölçtüğümüz | Tutan | Balon |
|---|---:|---|---|---:|---:|
| bonsai | 9 | Yalnız güvenli klasörü siler | Kirli klasörü de silme adayı gösterdi | %0 | %100 |
| claude-handoff | 65 | Oturumun %20-40'ı kurtarılır | Hiçbir ölçüm yok | %0 | %100 |
| cc-cache-monitor | 5 | 45 ms | 298-675 ms | %9 | %91 |
| code-review-graph | 32.295 | 63 kat ucuz | 1,2 kat ucuz (%18) | %18 | %82 |
| knip (ayarsız) | 12.486 | Ölü kodu bulur | 20 bulgunun 15'i yanlış | %25 | %75 |
| graphify | 130.796 | Token %80 azalır | Token %22 azaldı | %28 | %72 |
| skill-scanner | 2.616 | Kötü skill'i yakalar | 5 vakada 2 | %40 | %60 |
| toon | 25.535 | Token %42,6 azalır | Token %18 azaldı | %42 | %58 |
| caveman | 113.970 | Token %33,2 azalır | Token %16,4 azaldı | %49 | %51 |
| headroom | 76.941 | Token %41 azalır | Token %26 azaldı | %63 | %37 |
| pxpipe | 7.542 | Token %59-70 azalır | Token %79 azaldı ama doğruluk %70'e düştü | %70 | %30 |
| claude-multisession | 3 | Araç gecikmesi 366 ms | Yaklaşık 510 ms | %71 | %29 |
| claudeignore | 6 | Tüm dosya erişimini keser | 7 yoldan 5'i | %71 | %29 |
| cc-safety-net | 1.714 | Yıkıcı komutu engeller | 18 komuttan 13 | %72 | %28 |
| tokencost / ttok | 2.411 | Doğru token sayımı | %17-36 eksik sayıyor | %73 | %27 |
| dcg | 6.197 | Yıkıcı komutu engeller | 18 komuttan 15 | %83 | %17 |
| v4-pro | 3 | 35/35 doğru, yanlış alarm yok | 35/35 doğru, 1 yanlış alarm | %97 | %3 |
| fauxnix | 995 | 270 vakada Git Bash ile aynı | 270 vakada 269 | %100 | %0 |
| betterleaks | 2.287 | Sızmış anahtarı bulur | 5 vakada 5 | %100 | %0 |
| promptfoo | 26.227 | İstem testlerini doğru değerlendirir | 11 vakada 11 | %100 | %0 |
| scc | 8.835 | Doğru satır sayımı | Birebir doğru | %100 | %0 |
| ccusage | 19.100 | Doğru token ve maliyet | Birebir doğru | %100 | %0 |

**Tabloda Olmayanlar**

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

Aşağıdaki 6 aracı aldık. Hepsi yalnız çağrılınca çalışıyor, sürekli bir yük bindirmiyor.

- **markitdown:** PDF'yi %54, Word dosyasını %92 daha az token'la okutuyor; doğruluk aynı.
- **headroom:** büyük JSON çıktılarını yarıya indiriyor; bilgi kaybı yok.
- **graphify:** dar kod sorularında %22 tasarruf sağlıyor.
- **betterleaks:** sızmış anahtar taraması yapıyor; denemede hepsini yakaladı.
- **scc:** satır sayımında birebir doğru ve çok hızlı.
- **knip:** doğru ayarla, bizim kaçırdığımız 3 yetim test dosyasını buldu.

**Kendi Tarafımızda Çıkanlar**

- **Maliyet hesabında hata:** Core'un maliyet hesabı faturayı %8-20 eksik gösteriyordu. Sebep, 1 saatlik önbellek yazmasının ucuz fiyattan sayılmasıydı. Düzelttik; şimdi ccusage ile kuruşu kuruşuna aynı.
- **Komut kapısı:** Core'unki 18 tehlikeli komuttan 17'sini yakaladı; en iyi rakip 15'ini.
- **Token sayımı:** Core rakip araçlardan doğru sayıyor; onlar %17-36 eksik sayıyor.
- **Sızmış anahtar:** VidShrink'in git geçmişinde olası bir sızmış anahtar bulundu, yenileniyor.

Detaylı rapor istersen gönderirim.
