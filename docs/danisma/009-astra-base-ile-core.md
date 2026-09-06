# 009 — GPT Astra: Base İle Core Arasındaki Fark

Tarih: 6 Eylül 2026. Dış göz: GPT Astra (kullanıcı elle yapıştırdı, bu makineden bağlantı yok).
Girdi: [009-astra-base-ile-core-girdi.md](009-astra-base-ile-core-girdi.md).

## Astra'nın cevabı (tam metin)

## Olgu

**Dar tez destekleniyor:** Verilen küçük görevlerde Core, aynı kabul sonucuna daha düşük maliyetle ulaşıyor. **"Model yerine seçen makine faydasızdır" genellemesi desteklenmiyor.** Bütün paketi geri takmak; rol ayrımı, ek bağlam, denetim ve tekrarların toplam etkisini ölçüyor. Hangisinin maliyeti yarattığını tek başına ayırmıyor. Ayrıca ölçülen 0.15 hattı; Base 2.66 için doğrudan deney yok.

Muhtemel fark: Core, modelin zaten yaptığı planlama ve koordinasyonu yeniden yaptırmıyor; sayaç ve devir gibi dışarıda tutulabilecek durumu taşıyor. Devir sonucu, **bazı makine müdahalelerinin işe yaradığını** zaten gösteriyor.

"0 bağlam baytı" da "0 toplam maliyet" değildir: betik süresi ve bakım kalır. Kalıcı CLAUDE.md talimatları ayrıca okunur.

## Kör nokta

- **Tavan etkisi:** İki kol da bütün görevleri geçiyorsa kabul artışı görülemez. Gizli testler, eksik gereksinimler ve sonradan gereken düzeltmeler ölçülmeli.
- **Kapsam:** n=3–5, tek model/çaba ve küçük işler; uzun işte fayda var mı bilmiyoruz. Bu örneklem eşdeğerlik kanıtı değil.
- **Devir karşılaştırması:** Sonuç, yalnız "devam" verilen koşulu destekliyor. Native kola da aynı devir metnini vererek belgenin faydasıyla eklentinin ek faydasını ayırın.

**Ucuz deney:** Mevcut başarısız veya zorlanılmış işlerden üç sabit başlangıç seçin: belirsiz gereksinim, modüller arası değişiklik, kesintiden dönüş. Her birinde Core ile yalnız ilgili Base parçasını eşleştirin; tüm paketi takmayın. Başlangıç, kabul testleri ve bütçe aynı olsun; sıra değişsin. Önce altı koşuluk eleme yapın, yalnız olumlu sinyali tekrarlayın. Ölçüt: **kabul edilen iş başına toplam maliyet**, düzeltmeler ve kullanıcı müdahalesi dahil. Bu pilot kesin hüküm vermez; pahalı deneye değip değmediğini gösterir.

## Ekle

- **Sözleşmenin ajansız kısmı:** Kullanıcı çağırınca gereksinim–kabul testi eşleştirmesi için boş dosya üreten betik. Yönetici/işçi sistemi gerekmez. Sıradan tur: **0 ek token**, kalıcı talimat eklenmezse. Doldurma bedeli yalnız kullanımda.
- **İstenince kabul kanıtı:** Seçilen testlerin komutunu, çıkış kodunu ve doğrulanan Git durumunu kaydeden betik. Base'in denetim fikrinin mekanik kısmı alınabilir. Sıradan tur: **0 ek token**; kullanımda test süresi ve modele okutulan çıktı kadar maliyet. Test geçmesi, bütün gereksinimlerin karşılandığı anlamına gelmez.

Bunlar aday; mevcut doktor/sürüm betikleri aynı işi yapıyorsa yenisini eklemeyin.

## Çıkar

**Şimdi kesin çıkarılmalı diyebileceğim bir özellik yok.** İlk çıkarma deneyi, plan uyarısının modele yazdığı satır olmalı: faydası gösterilmemiş; sayacı statusline'da tutup uyarıyı kapatarak karşılaştırın.

Beş satırlık kuraldaki **"Küçük iş: bunların hiçbiri"** ifadesini çıkarın veya daraltın. Küçük değişiklikte de doğrulama gerekebilir.

Devir kalsın: sunulan ölçümlerde en açık fayda onda.

## A/B/C kararı

| Aday | Karar | Gerekçe |
|---|---|---|
| **A — Profil taraması** | **Ekle, kapsamı dar tut.** | Deterministik eksik tespiti yapılabilir. Çıktıyı varsayılan olarak bağlama taşımayın; profil tercihini zorunlu mimari gibi sunmayın. |
| **B — Ön çalışma** | **Yalnız açık kullanıcı çağrısıyla dene.** | Bilinmeyen depo/kütüphane için anlamlı aday. Tek ajan, sınırlı kaynak, kısa çıktı ve çağrı başına bütçe koyun. Fayda henüz ölçülmemiş. |
| **C — Plan meclisi** | **Önerilen haliyle alma.** | CLAUDE.md'ye dört satır sıradan tur maliyetini artırır; "plan gereken iş" otomatik ve geniş bir tetikleyicidir. İki planın uzlaştırılması da maliyetlidir. Önce mevcut tek soruluk ikinci görüşü kullanın. |

**"İstenince" tek başına koruma değildir.** İsteyenin kullanıcı mı model mi olduğunu belirleyin. B/C için açık kullanıcı çağrısı, tek çalıştırma sınırı ve betik tarafından uygulanan bütçe gerekir; yalnız metinsel talimat maliyet sınırı sağlamaz.

## Maliyet

Bu makineden 0 token; tur kullanıcının ChatGPT hesabında koştu.
