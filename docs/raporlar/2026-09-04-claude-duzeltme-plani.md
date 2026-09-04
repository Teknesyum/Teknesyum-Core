# Claude için düzeltme ve VidShrink raporunu tamamlama talimatı

Uygulama güncellemesi — kullanıcı devam dedi ve ilk parti uygulandı. Sonraki çalışmada önce
[Parti 1 sonuç raporunu](2026-09-04-parti1-sonuc.md) oku; A bölümünü baştan tekrar yürütme.
Güçlü izolasyon/canlı host sınırları ve G12–G60 açık kalıyor. Aşağıdaki metin ilk parti için
tarihsel talimattır; VidShrink raporuna yönelik B bölümü hâlâ kullanılabilir.

Bu metin **yarın kullanıcı devam dediğinde** kullanılmak içindir. Hazırlanması bir görev başlatma, yeni task açma veya ücretli ajan çağırma yetkisi değildir.

## A. Core düzeltme işi için kopyalanabilir prompt

Teknesyum-Core’u yeni özellik eklemeden güvenilir hale getireceğiz. Önce şu üç dosyayı oku:

- `docs/raporlar/2026-09-04-core-tam-inceleme.md`
- `docs/raporlar/2026-09-04-core-okuma-kapsami.md`
- `docs/raporlar/2026-09-04-core-tam-inceleme-kanit.json`

İnceleme tabanı 61b91c829e11ec0bd9b95f218c4583b0f6e54a7d. Rapor sonradan gelen 30 satırlık contract.js farkını ayrıca kaydediyor. Güncel çalışma ağacını ve eşzamanlı kullanıcı değişikliklerini kontrol et; eski bulguyu yeni koda otomatik uygulama. Satır yerine fonksiyon ve hash ile eşleştir. Core ve Base rol/kurulum yollarını karıştırma.

İlk iş yalnız **Parti 1: G01–G11 güvenilir kapatma ve kapsam** olsun. Başka parti, yeni thread, alt-ajan veya geniş benchmark kendiliğinden açma.

Kurallar:

1. Her düzeltmeden önce ilgili karşı örneği izole fixture’da yeniden üret. `rtk node tools/full-review-probes.js --expect-fixed` şu anda 12 sorun için exit 1 vermelidir. Bunun yeşil olduğu izlenimini yaratma.
2. Tam yeniden yazım yapma. Önce çağrı zincirini çıkar; en küçük tutarlı değişikliği yap. Paylaşılan relay kökü ile checkoutRoot/HEAD/index/test cwd’yi ayır.
3. Kapanış öncesi ve verify sonrası aynı içerik, aynı HEAD ve aynı kontrat sürümünü doğrula. Verify kaynak değiştirdiyse denetim eskimiştir. Lock’u yalnız test çalıştırma değil son geçişin atomikliği açısından değerlendir.
4. Auditor kaydı iş/tur/checkout/dispatch/result kimliğine bağlanmalı. Biçimce doğru live/audit JSON’u, kullanıcının/ajanın aynı yetkiyle yazabildiği dosyada duruyorsa kriptografik güven sınırı değildir. Aynı yere bir hash veya gizli anahtar ekleyerek “sahtecilik çözüldü” deme. Tehdit modeli ve host yetki sınırını açıkça yaz.
5. passed, unmet, cancelled ve closed ayrı anlamlar taşımalı. unmet önkoşul başka işin kabulünü açmamalı. Gerekçesiz verify: [] kod işini kapatmamalı; gerçek manuel/araştırma kabulü için açık ve dar istisna olsun.
6. Write/Edit/NotebookEdit/Bash/PowerShell/MCP yollarının gerçek kapsama sınırını açıkla. Shell regex’ini sandbox diye sunma. Girdinin yalnız bir parçasını değil tam yeni kontratı aynı şemayla doğrula.
7. Kapanış/ledger/audit tüketimi/snapshot cleanup, kısmi I/O hatasında kurtarılabilir ve idempotent olmalı. Kullanıcı dosyası, untracked veri, log veya worktree silme; temizliği gerekçesiz yürütme.
8. Testler yalnız geçici repo/config’te çalışsın. Ana suite’in HKCU Environment değiştiren üç testini gerçek kullanıcı registry’sinde çalıştırma; envPinned’i adaptör/fake ile yalıt. Kaynak .changes ve kişisel statusline/config’e test yazısı gitmesin.
9. Her bulgu için: eski hata çıktısı, değiştirilen fonksiyon, yeni negatif test, meşru akış testi, test sonucu ve kalan sınır raporla. Assertion sayısını bağımsız test/gerçek host kabul sayısı gibi kullanma.
10. Ürün kodu düzelmeden README’yi “tam garanti” diye güncelleme; fakat yanlış maliyet/kapalı log iddialarını açıkça işaretle. Başka çalışanın değişikliklerini sahiplenme, commit/push/install yapma.

Parti 1’in tesliminde özellikle şu kabul sonuçlarını göster:

- Worktree’de bozulan kod ana checkout temiz diye kapanamıyor.
- Verify sırasında/sonrasında değişen dosya eski audit ile kapanamıyor.
- Yanlış iş/tur, bitmemiş/eski veya sahte denetçi kabul edilmiyor; güçlü sınır mümkün değilse sınırlama açık.
- Repo dışı ve farklı araç yolu, açıklanmayan bir sahiplik bypass’ı oluşturmuyor.
- unmet bağımlılık ve gerekçesiz boş kabul kapanmıyor.
- Yarım disk yazımı tek ve kurtarılabilir kapanış bırakıyor.
- Önceki 17 regresyon ve timeout fixture’ı korunuyor; ana suite tam izole ortamda raporlanıyor.

Parti sonunda dur. Kalan G12–G60 için yalnız güncellenmiş öncelik ve kabul listesi bırak.

## B. VidShrink raporunu düzeltmesi için kopyalanabilir prompt

Mevcut VidShrink/Core raporları kullanıcı sorularına kesin yanıt vermeye yetmiyor. Yeni geniş bench veya yeni ürün işi yapmadan raporu kanıtla düzelt:

1. Envanteri zaman ve hash ile sabitle. Hangi ana oturum/çocuk JSONL dosyaları, hangi checkout, hangi relay, hangi Core/Base sürümü ve hangi rol yolu kullanılmış, ayrı sütunlara yaz.
2. Bir satırı bir **attempt** temsil eden veri tablosu üret: contractId, round, attemptId, failureSignature, toolUseId, childAgentId, requestedModel, resolvedModel, role, checkoutRoot, HEAD/contentHash, start/end, verify sonucu/test sayısı, audit bağı, consultationId ve maliyet sayaçları.
3. Request/stream tekrarlarını tekilleştir; bilinmeyen/eksik eşleşmeyi sakla. Model başlığını gerçek çalışmış model diye doldurma. done dizini ve status: submitted çelişkisini temizlemeden başarılı kabul sayısı verme.
4. 407 başlatma/405 model eşleşmesi, 378 Opus (199 açık +179 miras), 14 Fable, 12 Sonnet, 1 Haiku ve 2 bilinmeyen sayılarını sabit 3 Eylül görüntüsüyle uzlaştır. Daha yeni görüntü farklıysa eskisini sessizce değiştirme; ayrı sürüm olarak göster.
5. “Fable hiç çalışmadı” deme. Her üçüncü deneme öncesinde ilgili işin önceki iki başarısızlığına bağlı, tamamlanmış gerçek Fable advisor görüşü var mı? Fable builder veya Opus advisor bu şartı karşılamaz.
6. “18 kez aynı sözleşme” iddiasını olay tablosuyla doğrula ya da düzelt. Kuyruk turu, yeniden açılan kontrat sayısı, araç retry, manşet hatalı rapor ve aynı kök sebep farklı birimlerdir. Örtüşen kümeleri iki kez toplama.
7. 25/25 auditorRunId’yi 25 gerçek bağımsız denetim diye yazma. İş/tur/hash/host olayına eşleşen, tamamlanmış denetimi say. Kanıt kayıp, yanlış kökte, eski rolde veya gerçekten yok durumlarını ayrı tut.
8. Her kapalı logu özgün kabulüyle değerlendir. Talimat yazıldı, dosya taşındı, test sayısı arttı ve bir yeniden koşum geçti sonuçlarını “özgün kusur çözüldü” yerine kullanma. Timeout kayıtlarını tek kökün mükerrerleri olarak ilişkilendir.
9. 17/72’yi “çoğu” deme; 127/131/154/216 paydalarını açıklamadan bir tabloda birleştirme. Graphify raporundaki 10.657 ms /8 ≈1.332 ms ≈1,3 saniye hesabını düzelt. Manşet sayılarını veri+formül+birimden üret.
10. API fiyat eşdeğerini gerçek Max faturası/kota kaybından ayır. Model ID ve cache 5dk/1s yazım/okuma tarifelerini tarihli resmi kaynağa bağla. Önceki $3284,02145975 hesabı bir oturum ailesinin standart API senaryosudur; tümü plugin israfı değildir.
11. “Üyeliğin %25’i kurtarılırdı” sonucu için eş kalite ve gerçek kota ölçümü yoksa hipotez yaz. Proje %50 kota kullandıysa bunun %25’ini kurtarmak 12,5 kota puanıdır. Ucuz model daha fazla retry yaparsa net maliyeti hesaba kat.
12. Sıfır continuous-token iddiasını daralt: yerel işlem/ek model çağrısı/araç sonucu/context injection ayrı kavramlardır. OWED UserPromptSubmit çıktısını ölç. MCP karşılaştırmasında eager/deferred araç keşfini belirt.
13. Sonuçta kullanıcıya her kök neden için **nerede, neden, hangi kanıt, önerilen en küçük çözüm ve hangi testle kapanır** sütunları ver. Kesin kanıt olmayanı unknown/hipotez olarak tut.

Sınır: Gerçek sırları/transkriptlerin özel içeriğini rapora kopyalama; yalnız gerekli anonimleştirilmiş olay/kimlik ve özetleri taşı. Kullanıcı yeni bütçe vermeden ek ücretli model koşuları veya geniş benchmark başlatma. Rapor bitince yeni task açmadan dur.

## Yarın ele alınacak konular

Bu liste otomatik başlatma talimatı değildir:

- Önce G01–G11; ardından tek routing karar nesnesi ve gerçek attempt sayacı.
- Kullanıcının iki başarısızlıktan sonra üçüncü öncesi Fable şartı bütün yürütme yollarında sağlansın.
- Borç/log kanıtı korunsun; map dirty tazeliği düzeltilsin.
- Raporlar ve kapalı loglar özgün kabul testlerine göre güncellensin.
- Güven testleri yeşil olmadan pahalı ürün benchmark’ı başlatılmasın.
