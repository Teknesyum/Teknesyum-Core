# Claude / VidShrink'e iletilecek düzeltme istemi

Teknesyum-Core/VidShrink denetiminde, rapor ile uygulanmış güvence arasında ciddi farklar bulundu. Yeni geniş benchmark başlatmadan önce aşağıdaki işi yap. “Kurala yazdım”, “testler yeşil”, “closed klasöründe” ifadelerini tek başına kapanış kanıtı sayma.

Önce şu dosyaları bütün olarak oku:

- `C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/raporlar/2026-09-03-vidshrink-denetim.md`
- `C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/raporlar/2026-09-03-vidshrink-kanit.json`
- `C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/raporlar/rele-surec-kusurlari-127-sozlesmelik-olcum.md`
- `C:/Users/Administrator/Desktop/Projeler/Vidshrink/.claude/relay/CORE-ONERILER.md`

Çalışma ağacındaki Codex değişikliklerini koru. HEAD, dirty diff, gerçekten yüklü plugin yolu/sürümü/hash'i ve kullanılan rol dosyalarıyla başla. Kaynak depo ile cache sürümünü aynı sanma. Önce salt-okuma durum incelemesi; kurulum, yayın veya başka deponun yazımı mevcut yetkinin dışındaysa kullanıcıdan kapsam iste.

## A. Raporu yeniden kur

1. Her sayının birimini ve örneklemini yaz: sözleşme, deneme, denetim turu, Agent çağrısı, API isteği, token ve Max kota yüzdesi ayrı alanlar olsun.
2. 127/131/156/157 sayımlarını tek bir sabit tarih/HEAD'e göre açıkla. T2b/T2c ve beklemede klasörünü dahil edip etmediğini belirt. Kök checkout ile T0 worktree verilerini karıştırma.
3. “18 kere aynı sözleşme” iddiasını kanıt olmadan tekrar etme. 18 kuyruk turu ile 22 farklı manşet kayması vakasını ayrı anlat; örtüşmeyi çıkar.
4. “Fable hiç yok” yerine her gerekli danışma için contract ID, round, advisor ID, requested/resolved model, başlangıç/bitiş, sorulan soru ve ilgili yanıt yolunu yaz. Eksik kanıtı eksik bırak; sonradan audit dosyası üretip eski denetimi sertifikalandırma.
5. Eski Base `2.67.0/agents/*.md` yollarını gösteren çağrıları ayrı listele. Core'da `roles/` bulunmadığı iddiasını düzelt.
6. Aynı requestId'nin parçalarını iki defa toplama. Ana/alt-ajan kullanımını ayır; cache oluşturma ve okumasını normal input ile aynı fiyattan sayma. Kaynak dosyaların hash'lerini ve kapsamadığın oturumları belirt.
7. 4/54 uyumsuzluktan otomatik ±%7 güven aralığı üretme. “risk alanı boş”u “düşük risk kesin” diye yorumlama. Tur sayısından tüketim yüzdesi çıkarma.

## B. Kalan kritik uygulama boşluklarını kapat

Her madde için önce küçük kırmızı test, sonra düzeltme, sonra aynı testin yeşil sonucu. Aynı başarısızlığı kör biçimde tekrar eden pahalı tam süit açma.

1. Ortak çalışma kayıt deposu ile worktree'ye özel sözleşme/diff ayrımını tasarla. Explicit coordinator root kullan; yanlış kök okunursa sessizce boş liste döndürme.
2. Agent/Task, generic worker ve eski rol dosyası yollarında aynı contract/run kimliğinin korunmasını test et. Host response'taki resolved model kaydı ve SubagentStop sırası gerçek istemcide doğrulansın.
3. Kullanıcının kuralı: iki başarısız denemeden sonra üçüncü denemeye geçmeden ilgili işi Fable'a danış. Bunu yalnız `reopen` komutuna değil bütün round/durum geçişlerine bağla. Aynı model, başka sözleşme, eski tur, bitmemiş ajan ve elle uydurulmuş kayıt geçmesin. Fable erişilemiyorsa Opus'u Fable diye gösterme; açıkça durumu bildir.
4. Auditor salt-okuma kanıtını shell yazılarını da kapsayacak şekilde tasarla. Live kaydında `files: []` olması yeterli değil. Audit bağı contract+round+HEAD+owned diff+gerçek run olsun.
5. `git -C`, alıntılı yollar, wrapper, birden fazla refspec, komut zinciri ve shell ile audit/live/done yazma için gerçek hedef bazlı testler kur. Basit metin regex'ine güvenlik garantisi verme.
6. Genel `lib.lock()` edinilemediğinde işleme devam etmesin. SessionEnd yalnız kendi oturumuna ait ajanları kapatsın. Denetimce referanslanan bitmiş run kayıtlarını 24 saatlik sweep ile silme.
7. Aynı-imzalı başarısızlık sayacını sözleşme+ajan bazında tut. Başka işin tool hatası ucuz ölçüm işini Opus'a yükseltmesin.
8. Pahalı verify'dan önce ucuz şema/HEAD/round/audit-varlığı kontrollerini yap; çalıştırma sonrası hash/kanıt geçerliliğini tekrar doğrula. Beklenen test sayısı ve rapor bitiş işareti olmadan kesilmiş süiti yeşil sayma.
9. Hedefli üç negatif kabul örneği kur: ölçümden üretilen kabul listesi, aynı filtreyi kendine doğrulatma, sabit aritmetik assertion. Eski log bunlar yakalanmadan kapatılamaz.

## C. Kapalı logları yeniden sınıflandır

16 kaydı tek tek `reported/reproduced/patched/verified/transferred/accepted-risk` olarak değerlendir. Üç timeout kaydını tek kök kusurun bağlantılı kayıtları olarak tut. Avalonia çökmesinin başka depoya ait olması çözülmüş olduğu anlamına gelmez. Kapanış testini değiştirdiysen bunu açık karar olarak yaz; eski ölçünün sağlandığını iddia etme.

Bir log yalnız şu kanıtla `verified` olsun: eski davranışı bozan küçük test, düzeltme HEAD'i, aynı testin yeni sonucu ve ilgili gerçek kullanım kabulü. Talimat metni değişen ama gerçek replay'i olmayan kaydı `patched` veya açık bırak.

## D. Ucuz ve sınırlandırılmış kabul deneyi

Kaynak düzeltmelerin ardından `npm test` çalıştır. Sonra yalnız küçük bir VidShrink smoke örneği seç: salt ölçüm görevi, kritik kod görevi ve iki başarısızlıktan sonra Fable danışması. Her örneğin başında beklenen model/rol/kapsamı açıkça kaydet.

Sonnet salt ölçüm/araştırma için başlangıç adayı olsun; Opus yalnız somut risk/başarısızlık/yetkili tercih gerekçesiyle seçilsin. Model alanını boş bırakma. Kullanıcı/harness ajan açmayı kısıtlıyorsa bu talimatı ihlal etme; gerekli danışmanın engellendiğini söyle.

“0 continuous token” deneyi ayrı olsun: sabit host sürümü, aynı kısa replay, plugin açık/kapalı, input/cache/output delta ve hook duvar süresi. Display-only banner için sıfır ek bağlam doğru olabilir; bunu toplam plugin tüketimi sıfır diye pazarlama.

Max kota tasarrufu için abonelik kullanım göstergesinin aynı pencere ve aynı görev kapsamındaki başlangıç/bitiş verisi gerekir. API eşdeğerini fatura/kota gibi sunma. %25 tasarrufu ancak eşlenmiş kalite ve maliyet ölçümü destekliyorsa sonuç olarak yaz; öncesinde hipotez olarak tut.

## Teslim

- Düzeltme öncesi/sonrası kanıt tablosu ve tam dosya/fonksiyon yerleri.
- Her açık kalan madde için neden, risk, gereken yetki veya veri.
- Güncellenmiş süreç raporu; ölçülmüş sonuç ile öneri ayrı.
- Yüklü plugin sürümü için doğrulama; kaynak testlerinin kurulu sistemde geçtiğini varsayma.
- Küçük deneyin kalitesi ve maliyeti; hangi testlerin hiç çalışmadığının listesi.

Bu istem yeni görev/ajan açma veya kullanıcı hesabında yayın yapma yetkisi vermez. Mevcut yetki kapsamında düzelt; kapsam değişirse açıkça bildir.
