# Teknesyum-Core: kapsamlı işleyiş ve yapıcı eleştiri raporu

Güncelleme — 4 Eylül, sonraki uygulama turu: G01–G11 için kod ve izole test sonuçları
[Parti 1 sonuç raporunda](2026-09-04-parti1-sonuc.md). Aşağıdaki ilk inceleme ve test sayıları
tarihsel görüntüdür; güncel düzeltme durumuyla karıştırılmamalıdır.

Tarih: **4 Eylül 2026**, Europe/Istanbul. İnceleme tabanı: **61b91c8**; sonradan gelen 30 satırlık contract.js deltası ayrıca değerlendirildi.

## 1. Sonuç

**Core’un hedefi yerinde, fakat uygulama henüz hedeflediği güvenceyi vermiyor.** Yerel hook’larla ucuz koordinasyon, açık sahiplik, kontrollü kapatma ve küçük bağlam fikri değerli. Sorun, bunların birkaçının “bütün yolları kapsayan garanti” gibi anlatılması; gerçekte bazıları metinsel talimat, bazıları yalnız tek CLI yolunun kontrolü, bazıları da zayıf bir heuristik.

En ağır açıklar: **yanlış worktree’nin doğrulanması, denetim sonrası değişmiş kodun mühürlenmesi, ilgisiz/sahte denetçi kaydının kabulü, kapsam dışı yazı yolu, unmet önkoşulun sağlanmış sayılması ve tekrar/danışma kuralının tüm denemeleri kapsamaması**. Bunlar çözülmeden “denetim artık güvenilir” veya “benchmark’a hazır” onayı vermiyorum.

Bu rapor **60 eleştiri maddesi** içerir. Bunların hepsi ayrı bir doğrulanmış bug değildir: **R** çalıştırılarak yeniden üretilen sorun, **K** kaynak/rapor okumasına dayalı bulgu veya tasarım riski demektir. P1 yanlış kabul, veri/kanıt kaybı veya kontrolsüz maliyet açısından öncelikli; P2 doğruluk, bakım, gözlenebilirlik ve ürün iddialarının iyileştirilmesidir. Öncelikler puanlanmış istatistik değil teknik değerlendirmedir.

Bu tur ürün kodu düzeltilmedi. Yalnız raporlar ve izole tanı betiği eklendi. Başka çalışmanın commit ve değişiklikleri kendi düzeltmem olarak sayılmadı. Kullanıcının son isteği gereği **bu inceleme teslim edilince durulacak; yeni görev, otomasyon veya düzeltme çalışması başlatılmayacak**.

## 2. Kapsam ve kanıt sınırı

Güncel Core kapsamındaki **135 dosyanın 26.923 satırı** incelendi. İlk tam görüntü 26.720 satırdı; altı değişen dosyanın farkı da tamamen okundu. Son 30 satırlık commit edilmemiş contract.js farkı ayrıca okundu. Kapalı 16 log, 16 araç araştırması, iki ölçüm raporu, sentez, önceki 10 rapor/kanıt dosyası, SVG kaynakları ve lisanslar dahil.

**Ignored eski Teknesyum-Base arşivinin 1.074 dosyasının tamamı okunmadı.** Güncel Core incelemesi tamam; bütün disk/arşiv geçmişi için yüzde 100 iddiası yok. Okunan her dosya ve hash [okuma manifestinde](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/raporlar/2026-09-04-core-okuma-kapsami.md); ayrıntılı çıktılar [kanıt dosyasında](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/raporlar/2026-09-04-core-tam-inceleme-kanit.json).

Bütün satırları okumak, bütün kombinasyonları çalıştırmak değildir. Gerçek Claude host entegrasyonu, ücretli model A/B deneyi, özgün .NET/Avalonia hata koşumu, görsel/ses QA ve tüm işletim sistemleri bu tur çalıştırılmadı. Eski VidShrink kullanım kanıtı 3 Eylül 2026 19:44:51 UTC görüntüsüdür; yeni canlı durum veya tüm hesap geçmişi değildir.

### Doğrulama sonuçları

| Kontrol | Sonuç | Ne anlama gelir? |
|---|---|---|
| Ana suite, 61b91c8 kaynak kopyası ve boş izole config | **2621 geçti / 1 kaldı / 3 atlandı** | Toplam 2625 assertion; 3 registry değiştiren test geçici kopyada çıkarıldı. Tam yeşil değil. |
| Kalan ana-suite testi | Model/effort fixture beklentisi | Boş config’te Sonnet-Low/Opus Explorer çıkışı, fixture’ın beklentisiyle uyuşmuyor; tek başına ürün hatası sayılmadı. |
| Önceki hedefli regresyonlar | **17/17 geçti** | Önceki düzeltmelerin bu dar kabulleri korundu. |
| Windows timeout süreç ağacı | **Geçti** | Yeni runner’ın fixture çocuğu hayatta kalmadı; eski yöntem çocuğu bırakıyordu. Gerçek .NET koşumu değil. |
| Mevcut 30 JavaScript dosyası syntax ve takip edilen JSON parse | **Hata yok** | Sözdizimi sağlıklı; davranış garantisi değil. Yeni tanı betiği de syntax kontrolünden geçti. |
| Yeni adversarial tanılar | **12/12 sorun yeniden üretildi** | Bunlar “12 test geçti” diye başarı hanesine yazılmamalı. `--expect-fixed` bilinçli exit 1 veriyor. |
| Geç contract.js deltası | **12/12 sorun sürüyor** | Syntax geçti; ana suite bu geç deltada yeniden koşulmadı. |

İlk görüntüde suite 2608/6 idi. Son commit beş eski beklentiyi düzeltti; onları güncel hatalar diye taşımadım. Fakat 2621 başarılı assertion, aşağıdaki 12 karşı örneği ortadan kaldırmıyor.

Tekrarlama: [izole tanı betiği](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/tools/full-review-probes.js:1) için `rtk node tools/full-review-probes.js --expect-fixed`. Betik kendi geçici Git fixture’larını üretir; API çağırmaz, paket kurmaz, registry değiştirmez, gerçek projenin dosyalarını değiştirmez. Fixture’lar incelemek için tutulur. Varsayılan tanı modu sorunları JSON olarak bildirir; `--expect-fixed` sorun sürüyorsa 1, altyapı hatasında 2 döner.

## 3. Kullanıcının VidShrink sorularının doğrudan yanıtı

### Neden sürekli Opus?

Eski oturum ailesinde 407 benzersiz Agent/Task başlatması var; 405’i modele eşleşiyor. **378 Opus**: 199 açık Opus seçimi, **179 modelsiz çağrıdan miras alınan Opus**. Ayrıca 14 Fable, 12 Sonnet ve 1 Haiku eşleşmesi var; 2 başlatma çözümlenemedi. Bu, yalnız “zor iş olduğu için Opus” açıklamasıyla uyuşmuyor.

Kökler: eski premium builder varsayılanı, modelsiz generic worker çağrısı, 150 prompt’ta eski Base rol yollarının kullanılması, ölçüm işinin pahalı auditor rolüyle paketlenmesi, T0’ın büyük Opus bağlamındaki koordinasyonu ve kontrolün çağrıdan sonra uygulanması. Güncel cheap-first değişikliği olumlu; **relay’siz ilk dispatch ve raw raise ayrışması hâlâ açık** (G14–G18).

157 kontrat görüntüsünde 154 done dosyası var: başlıklarda 116 Opus, 37 Sonnet, 1 Fable. Ancak **66 done dosyasının gövdesi hâlâ submitted**. Dosya yeri, terminal durum, gerçek run modeli ve kabul sonucu tek veriymiş gibi kullanılmamalı. İlk/erken turdaki 66 Opus kaydı ucuz modele taşıma adayıdır; hepsinin güvenle Sonnet’e taşınabildiği ölçülmüş değildir.

### Fable hiç mi çalışmadı? İki denemeden sonra neden gelmedi?

**Fable hiç çalışmadı demek doğru değil; gereken noktada çalışmasının garantisi yoktu.** Fable builder çalışması danışma değildir; advisor rolünün Opus’ta çalışması da Fable görüşü değildir. Eski rapor kendi içinde bazı dördüncü turlarda advisor izini zaten kabul ediyor.

Eski eşik tutarsızlığı (3/4), rol adının tek kanıt sayılması, yanlış çocuk/ebeveyn kimliği ve ilgisiz cevabın danışmayı kapatması önemli kusurlardı. Önceki düzeltmelerin 17 regresyonu geçiyor. Fakat güncel kural çoğunlukla **reopen** yolunda: aynı açık sözleşmenin üçüncü başarısız denemesi bununla eşdeğer değil. G12–G13 ve G17, kullanıcının gerçek “iki başarısız deneme sonrası üçüncüden önce danış” niyeti için eksik halkaları gösteriyor.

### Gerçekten aynı sözleşme 18 defa mı koşmuş?

Mevcut rapor/kanıttan **aynı kontratın 18 kez koştuğu sonucu doğrulanmadı**. “18 kuyruk turu”, farklı sözleşmelerin üçüncü/dördüncü turlarının toplamı; tekrar eden manşet hatası ise başka bir küme. Aynı şey değiller. Bu düzeltme israfı inkâr etmiyor; israfın doğru birimle ve kaynak listesiyle açıklanmasını istiyor.

### Denetim raporları özensiz miydi?

Bazı raporlar önemli sorunları önceden açıkça yazmış. Dolayısıyla yalnız “rapor yoktu” değil, **rapordaki öneriyi çalışan kontrol ve özgün kabul testine bağlayamadık** sorunu var. Bazı kapanışlar da gerçek kabulü daraltmış. Kendi önceki incelemem tam proje satır taraması değildi; o kapsamı bu raporla tamamlıyorum. Eski test sayısını veya dosyada audit alanı bulunmasını güvenilirlik onayı saymak doğru değildi.

## 4. Amaç–uygulama eşleşmesi

| Amaç | Uygulamadaki karşılık | Değerlendirme |
|---|---|---|
| Ucuz işe ucuz model | tiers + dispatch | Kısmi; ilk dispatch, rol ve karar tutarlılığı açık. G14–G18 |
| İki hatadan sonra Fable | reopen + secondOpinion | Reopen yolu iyileşti; bütün attempts değil. G12–G13 |
| Bağımsız kritik denetim | audit/live + hash | Rol dosyasının varlığı bağımsız inceleme kanıtı değil. G02–G04 |
| Yalnız sahibi olunan dosyaya müdahale | guard.boundary | Repo dışı ve shell yolları açık. G08–G11 |
| Doğru çalışma ağacının testi | locate/projectRoot | Yanlış checkout kanıtlandı. G01 |
| Test geçmeden bitirme yok | complete/runVerify | Boş/zayıf kabul ve stale seal açık. G02, G06, G31 |
| Sağlanmış bağımlılık | blockers + done | unmet’i sağlanmış kabul ediyor. G07 |
| Güvenilir devir/borç hafızası | handoff/owed | Geçmiş refresh’te silinebiliyor. G24 |
| Doğru etki alanı | map + risk | Dirty graph ve eksik kapsam false-low üretebilir. G27–G30 |
| Sıfır sürekli model yükü | yerel hooks/statusline | Sessiz yollar için avantaj; OWED ve araç sonuçları istisna. G40, G56 |
| Güvenli kurulum/release | setup/install/release | Başarı, pin, dry-run ve veri koruma eksikleri. G35–G39 |
| Kanıta dayalı kapanış/araştırma | logs/reports/tests | Sıklıkla talimat/test sayısı kanıt yerine geçmiş. G43–G60 |

## 5. Dosya/satır bazında 60 yapıcı eleştiri

Satırlar 61b91c8 sürümünündür; eşzamanlı düzenlemede fonksiyon adı ve manifest hash’i esas alınmalıdır. R=izole karşı örnekle yeniden üretildi. K=kaynak incelemesi/rapor tutarsızlığı veya tasarım riski; önerilen bütün negatif testler bu tur çalıştırılmış değildir.

### G01 · P1 · Paylaşılan relay kökü ile doğrulamanın çalışma ağacı karıştırılıyor [R]

Yer: [core/scripts/contract.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/contract.js:43).

- **Neden / etki:** locate(), worktree bilgisini bırakıp projectRoot(relay) kullanıyor. Ana checkout değeri 1, worktree değeri 999 iken worktree içinden complete başarılı oldu; ana kopya test edildi. reachOf ve guard.boundary de aynı kök varsayımını taşıyor.
- **Önerilen çözüm:** ExecutionContext içinde relayRoot, checkoutRoot, gitCommonDir ve worktreeId ayrı tutulsun. Test, hash, risk, sahiplik ve snapshot checkoutRoot kullanmalı; ortak relay yalnız koordinasyon deposu olmalı.
- **Kapanış kabulü:** Ana/bağlı worktree içerikleri farklı olan fixture’da doğru kopya test edilmeli; farklı HEAD, untracked dosya ve iki eşzamanlı worktree ayrıca sınanmalı.

### G02 · P1 · Denetimden sonra değişen dosya mühürlenebiliyor [R]

Yer: [core/scripts/contract.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/contract.js:1084).

- **Neden / etki:** Denetim hash’i verify öncesinde kontrol ediliyor. Verify dosyayı 1’den 999’a değiştirse de complete geçiyor. Lock, doğrulama bitince bırakılıyor; kapanış öncesi HEAD/hash/kontrat tekrar karşılaştırılmıyor.
- **Önerilen çözüm:** Kapanışı doğrulanan içerik ve kontrat sürümüne bağla. Verify sonrası içerik değişirse yeniden denetim iste; son commit/kayıt geçişini karşılaştırmalı ve atomik yap.
- **Kapanış kabulü:** Verify’nin kaynak/kontrat/HEAD değiştirdiği üç negatif test; doğrulama sonrası eşzamanlı değişiklik kapanışı reddetmeli.

### G03 · P1 · Denetçi kimliği iş ve turla bağlanmıyor [R]

Yer: [core/hooks/seal.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/hooks/seal.js:110).

- **Neden / etki:** checkAuditor sadece rolü ve kaydedilmiş yazı listesini inceliyor. Z999/8 turu, 2020 tarihli denetçi A1 için imza verebildi. verification dizisi gerçekten çalıştırılan komutların kanıtı değil.
- **Önerilen çözüm:** Sözleşme, tur, checkout, dispatch/tool-use kimliği, tamamlanma zamanı, kaynak hash’i ve sonuç artefaktını birlikte doğrula. Denetçi yazarın kendisi olmamalı; gerçek rol olayı kayda bağlanmalı.
- **Kapanış kabulü:** Yanlış sözleşme/tur, bitmemiş, eski, başka worktree ve kimliği eşleşmeyen kayıtların tümü reddedilmeli.

### G04 · P1 · Mühür, kendi yazarından bağımsız güven sınırına sahip değil [R]

Yer: [core/hooks/seal.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/hooks/seal.js:92).

- **Neden / etki:** Ajanın yazabildiği live ve audit JSON dosyalarını biçimce doğru üretmek yüksek riskli işi kapatmaya yetti. Hash hesaplamak içeriğin kim tarafından incelendiğini kanıtlamaz. Bu, aynı kullanıcı yetkisine karşı kriptografik güvenlik sağlandığı anlamına gelmez.
- **Önerilen çözüm:** Tehdit modelini açıkla: kazara atlama mı, güvenilmeyen ajan mı? Güvenilir host/supervisor olaylarından kanıt üret; ajanın yazabildiği alandaki ortak sır veya ikinci hash’i güvenlik çözümü diye sunma. Güçlü sınır yoksa iddiayı süreç kontrolüyle sınırla.
- **Kapanış kabulü:** Sahte audit+live fixture’ı kapanamamalı; yetki ayrımı varsa gerçek host uçtan uca negatif testle gösterilmeli.

### G05 · P1 · Kapanış çok dosyalı, kısmen başarısız olabilen bir işlem [K]

Yer: [core/scripts/contract.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/contract.js:1126).

- **Neden / etki:** Kontrat taşınıyor, snapshot siliniyor, denetim tüketiliyor, ledger sonra yazılıyor. Ortadaki bir I/O hatası done dosyasıyla eksik ledger veya kaybolmuş geri dönüş noktası bırakabilir. Önceden alınmış c.body eşzamanlı değişikliği ezebilir.
- **Önerilen çözüm:** Tek işlem kimlikli journal ve kurtarılabilir aşamalar kullan; kontrat sürümünü karşılaştır, audit tüketimini ve ledger eklemeyi idempotent yap. Snapshot yalnız tamamlanan commit sonrası temizlensin.
- **Kapanış kabulü:** Her I/O sınırına hata enjekte et; yeniden çalıştırma tek kapanış üretmeli, kaydı kaybetmemeli.

### G06 · P1 · verify: [] gerekçesiz kabul ediliyor [R]

Yer: [core/scripts/contract.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/contract.js:1012).

- **Neden / etki:** Mesaj Acceptance altında yazılı gerekçe istiyor; gerçek koşul sadece boş listeyi görüyor. Gerekçesiz ve kabul maddesiz E1 kapandı. Otomatik prose kontrolü eklenmesi de ürün kabulünün yerine geçmemeli.
- **Önerilen çözüm:** İş türü ve kabul şeması tanımla. Çalıştırılabilir kabul veya açıkça yetkilendirilmiş manuel kanıt istisnası zorunlu olsun; doküman lint’i ayrı kontrol sınıfı olsun.
- **Kapanış kabulü:** Boş gerekçe, anlamsız gerekçe ve sadece prose lint’li kod işi reddedilsin; gerçek doküman/araştırma işi uygun manuel kanıtla kapanabilsin.

### G07 · P1 · unmet ile kapanan önkoşul, başarıyla bitmiş sayılıyor [R]

Yer: [core/scripts/contract.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/contract.js:732).

- **Neden / etki:** blockers(), done dosyasının varlığını yeterli görüyor. Uygulanmadığı gerekçesiyle close edilen D1, D2’nin bağımlılığını karşılamış oldu.
- **Önerilen çözüm:** Terminal durum ile kabul sonucu ayrı alanlar olsun: closed/passed, closed/unmet, cancelled. Bağımlılık yalnız gerekli kabul sonucu ve revizyonla sağlansın.
- **Kapanış kabulü:** unmet/cancelled/missing önkoşullar bloke etmeli; passed olan geçmeli; sonradan reopened önkoşul bağımlıları etkileyebilmeli.

### G08 · P1 · Sahiplik sınırı hedef dosyadan relay aradığı için repo dışına açılıyor [R]

Yer: [core/hooks/guard.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/hooks/guard.js:332).

- **Neden / etki:** Bağlı builder’ın repo dışındaki Write isteği izin aldı. Hedefte relay bulunmayınca guard dönüyor. Relay metadata muafiyeti ve bağsız ajanlar ayrıca geniş bir kontrol dışı alan bırakıyor.
- **Önerilen çözüm:** Yetki bağlamını hedef yoldan değil doğrulanmış çağıran ajan/checkout bağından kur. Hedefi realpath/izinli kök içinde çöz; meşru geçici çıktıları açık yetki listesiyle tanımla.
- **Kapanış kabulü:** Repo dışı, kardeş repo, symlink/junction, Windows büyük-küçük harf ve meşru worktree yolları için olumlu/olumsuz testler.

### G09 · P1 · Kabuk yazıları için dosya koruması yok [K]

Yer: [core/hooks/guard.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/hooks/guard.js:463).

- **Neden / etki:** Bash ve PowerShell yolları sadece merging() kontrolüne gidiyor; dosya yazma, audit üretme ve sahiplik denetimi uygulanmıyor. Metin tabanlı Git ayrıştırıcısı wrapper, -C, alıntı ve çoklu refspec durumlarını da tam temsil etmiyor.
- **Önerilen çözüm:** Bunu sandbox diye tanımlama. Gerçek yazı izolasyonu/host izinleri veya kontrollü yürütücü kullan; Git hedefini güvenilir argüman çözümlemesiyle değerlendir. FileChanged sonradan tespit için yararlıdır, yazıyı önceden engellemez.
- **Kapanış kabulü:** Aynı değişikliği Write, Edit, Bash, PowerShell ve alternatif araçla yapmayı deneyen tek uyumluluk matrisi; dış kapsam değişiklik kapanışta da yakalanmalı.

### G10 · P1 · Edit, Write ve durum geçişleri aynı tam belge doğrulamasından geçmiyor [K]

Yer: [core/hooks/guard.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/hooks/guard.js:167).

- **Neden / etki:** regression() çoğu Edit için yalnız new_string görüyor; owns/verify/raise kontrolleri Write ağırlıklı. Alan silme, parçalı değiştirme, yeniden bağlanma ve blocked→done yolları tam durum makinesi olarak modellenmemiş.
- **Önerilen çözüm:** Önce mevcut içerikten beklenen tam yeni belgeyi oluştur, sonra tek parser ve geçiş tablosuyla denetle. Ajan-sözleşme bağını ilk başarılı işlemden sonra sabitle; sahiplik genişletmeyi açık yetkiye bağla.
- **Kapanış kabulü:** Her yasak geçişi Write ve parçalı Edit ile ayrı ayrı dene; failed tool olayından sonra durum/bağ değişmemeli.

### G11 · P1 · Regex alan okuyucusu bir sözleşme şeması değil [K]

Yer: [core/hooks/schema.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/hooks/schema.js:22).

- **Neden / etki:** Alanlar tüm metinde aranıyor; yinelenen veya code fence içindeki başlıklar etkili olabilir. Virgüllü inline liste, boş liste/başlık fallback’i ve eksik sayısal alanlar belirsiz. ID düzeltmesi diğer regex tüketicilere yayılmamış.
- **Önerilen çözüm:** Sınırlı ve açık metadata bölümü, tekil alanlar, tipler, pozitif round ve schemaVersion kullan. Karmaşık YAML gerekmiyorsa JSON metadata + Markdown gövde yeterli; tüm tüketiciler aynı parser’dan geçsin.
- **Kapanış kabulü:** Duplicate/fenced alan, virgüllü komut, bozuk round, suffix ID ve eski sürüm göç testleri; belirsiz girdi fail-closed olmalı.

### G12 · P1 · İki başarısızlıktan sonra Fable kuralı bütün denemeleri kapsamıyor [K]

Yer: [core/scripts/contract.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/contract.js:1454).

- **Neden / etki:** reopen yolu artık ilgili önceki turda bitmiş Fable arıyor; bu gerçek bir iyileştirme. Ancak round düzenlenebilir kontrat gövdesinden geliyor. Aynı açık kontratta yinelenen verify/iş denemeleri reopening değildir; iki başarısızlık sayacıyla eş anlamlı değildir.
- **Önerilen çözüm:** Attempt kimliğini kontrat+checkout+girdi sürümü+hata imzasına bağla; immutable olaylardan say. Kullanıcının kuralını tam olarak 'aynı problemin iki başarısız denemesinden sonra, üçüncüden önce danışma' şeklinde uygula. Danışma gelmezse üçüncü denemeyi beklet.
- **Kapanış kabulü:** Aynı aktif kontrat üzerinde 3 tekrar, round sıfırlama, close/reopen, farklı hata ve manuel --force durumları test edilsin. Açık kullanıcı istisnası kaydı olmadan limit aşılmamalı.

### G13 · P1 · Fable kaydının varlığı görüşün soruya cevap verdiğini kanıtlamıyor [K]

Yer: [core/scripts/contract.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/contract.js:1430).

- **Neden / etki:** Model, kontrat, önceki tur ve ended kontrolü var; soru/cevap artefaktı, danışılan kod revizyonu ve görüşün yeni denemeye uygulanması birlikte doğrulanmıyor. Aynı kayıt uygun görünen durumlarda tekrar kullanılabilir.
- **Önerilen çözüm:** Danışmayı consultationId ile soru, failure signature, input hash ve tamamlanmış yanıt hash’ine bağla. Uygulandı/reddedildi kararını gerekçeyle kaydet; salt model farkını denetim bağımsızlığının garantisi sayma.
- **Kapanış kabulü:** Yanıtsız, yanlış revizyonlu, eski failure signature’lı görüş reddedilsin; gerçek kayıt üçüncü denemeyi bir kez açabilsin.

### G14 · P1 · İlk dispatch model belirtmeden pahalı modeli miras alabiliyor [R]

Yer: [core/hooks/watch.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/hooks/watch.js:26).

- **Neden / etki:** relayRoot yoksa model zorunluluğundan önce return oluyor. Bilinen builder rolü ve modelsiz ilk Agent çağrısı izin aldı. Tanınmayan rol veya dispatch içindeki exception da sessizce kontrol dışına çıkıyor.
- **Önerilen çözüm:** Yönlendirme için gerekli bağlamı dispatch öncesi oluştur veya bağlamsız iş için ucuz-açık varsayılan tanımla. Core tarafından yönetilen dispatch’te rol/model doğrulaması relay varlığına bağlı olmasın.
- **Kapanış kabulü:** Yeni repo/relay’siz ilk çağrı, bilinmeyen rol, eksik config ve eski rol yolu için kayıtlı host payload testleri.

### G15 · P1 · Son raise düzeltmesi dispatch yoluna uygulanmamış [K]

Yer: [core/scripts/contract.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/contract.js:885).

- **Neden / etki:** tier/overModel sealedRaise okurken overDispatch hâlâ kontrat gövdesindeki raise ve why alanlarını kullanıyor (918–919). Böylece çalıştırmaya izin verilen kademe ile kapanışta kabul edilen kademe ayrışıyor; pahalı çağrı önce yapılıp sonra reddedilebilir.
- **Önerilen çözüm:** Tek, yan etkisiz routing decision fonksiyonu oluştur; CLI, dispatch, ledger ve statusline aynı karar nesnesini kullansın. Kararı çağrı öncesi kalıcılaştır.
- **Kapanış kabulü:** Aynı girdinin tier/dispatch/complete sonuçları eşleşmeli; yalnız gövdeye eklenen mühürsüz raise pahalı çağrı açmamalı.

### G16 · P1 · Kademe, bütçe ve güvenlik politikaları birbirine karışıyor [K]

Yer: [core/scripts/contract.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/contract.js:309).

- **Neden / etki:** overDispatch yalnız fazla pahalı modeli reddediyor; kritik iş için asgari yetkinlik bir garanti değil. Advisor kota kontrolü CLI yolunda kalabiliyor; eco cap bazı yükseltme sinyallerini kırpabiliyor. Ücretli tekrar bütçesi kontrat bazında yürütme sınırı değil.
- **Önerilen çözüm:** Maliyet tavanı, rol tabanı, zorunlu danışma ve kullanıcı bütçesini ayrı kurallar olarak çöz. Ölçüm/rapor işleri cheap-first; başarısızlık ve yüksek etki yükseltmesi gerekçeli olsun. Otomatik Fable istisnası bütçe görünürlüğünü kaldırmasın.
- **Kapanış kabulü:** Profiller×roller×sinyaller için yalnız çıktı matrisi değil gerçek dispatch izin/red testi; kota tükenince yeni çağrı oluşmamalı.

### G17 · P1 · Tekrar hatası sayacı aynı problemin tekrarını ölçmüyor [K]

Yer: [core/hooks/watch.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/hooks/watch.js:88).

- **Neden / etki:** Her araç başarısızlığı aynı tür sinyale dönüşebiliyor; başarı sayacı sıfırlayabiliyor. Tool-use hatası, kabul başarısızlığı ve ürünün aynı kusuru ayrı sınıflar değil. tierCmd bazı yollarında kontrata özel olmayan tally kullanıyor.
- **Önerilen çözüm:** Komut/girdi/checkout/test sonucu üzerinden normalize failure signature ve attempt outcome kaydet. Alakasız araç hataları ile aynı kabulün tekrarını ayrı tut.
- **Kapanış kabulü:** İki farklı hatayı tek hata sayma; aradaki başarılı Read, iki başarısız verify geçmişini silmemeli.

### G18 · P2 · Yeni ledger alanları dispatch zamanındaki gerçek kararı kesin kaydetmiyor [K]

Yer: [core/scripts/contract.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/contract.js:821).

- **Neden / etki:** ledgerTier kapanış anında sinyalleri yeniden hesaplıyor. Arada profil, map ve sayaç değişebilir. model alanı gerçek run kaydı yoksa kontratın istenen modeline düşüyor; requested ile observed karışıyor. Snapshot silindikten sonra bazı analizler yeniden yapılıyor.
- **Önerilen çözüm:** dispatchDecisionId, policyVersion, profile, inputSignals, requestedModel, resolvedModel ve kaynağı ayrı kaydet; bilinmeyeni null bırak. Kapanış bu kararı referanslasın, yeniden üretip 'o anki karar' demesin.
- **Kapanış kabulü:** Çağrıdan sonra profil/map değiştir; ledger ilk kararı korumalı. Run kaydı yokken observedModel üretilmemeli.

### G19 · P2 · acceptanceMiss yararlı ipucu; kabul kapsamı ölçümü değil [K]

Yer: [core/scripts/contract.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/contract.js:792).

- **Neden / etki:** Tek bir backtick belirtecinin diff veya owns yolunda geçmesi miss=false üretiyor. Dosya adının zaten owns içinde olması, diğer kabul maddelerinin uygulanmadığını örtebilir. Prose-only kabul null. Bu veriyle semantik hata oranı çıkarılamaz.
- **Önerilen çözüm:** Adını lexicalAcceptanceHint gibi daralt; madde başına kanıt/test eşlemesi ayrı olsun. null/unknown ile passed ayrışsın. Heuristiği sert kapı veya kalite yüzdesi yapma.
- **Kapanış kabulü:** İki kabul maddesinden yalnız biri, sadece dosya adı, yorumda geçen ad ve davranışsal regresyon örnekleriyle sınırlarını göster.

### G20 · P1 · Kilit ve durum yazma hataları güvenilir biçimde taşınmıyor [K]

Yer: [core/hooks/lib.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/hooks/lib.js:63).

- **Neden / etki:** Kısa stale süresi canlı ama yavaş kilit sahibinden kilit çalmaya yol açabilir; merge yazımın false sonucunu yutabilir. Eski 'kilit bulunamazsa fn çalıştır' kusuru düzeltilmiş; onu hâlâ açık diye saymıyorum.
- **Önerilen çözüm:** Kilit sahibi PID+başlangıç kimliği, lease/heartbeat ve atomik sahiplik kontrolü kullan; bütün write hatalarını işlemin başarısızlığına taşı. Koordinasyon kilidi ile uzun verify kilidini ayır.
- **Kapanış kabulü:** Yavaş canlı sahip, çökmüş sahip, disk-full ve iki süreç yarışını sınayan testler; çift ledger yazımı ve sessiz veri kaybı olmamalı.

### G21 · P1 · Bir oturumun bitişi başka oturumu kapatabiliyor [R]

Yer: [core/hooks/watch.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/hooks/watch.js:257).

- **Neden / etki:** session_id payload’da var ama ortamda yokken SessionEnd başka oturumdaki canlı kaydı ended yaptı. Ortam değişkeni olayın kimliğinin yerine kullanılıyor.
- **Önerilen çözüm:** Host payload kimliğini esas al; kaydı o sessionId ile filtrele. Kimlik yoksa bütün kayıtları kapatmak yerine belirsiz olayı kaydet ve güvenli dar kapsam uygula.
- **Kapanış kabulü:** Aynı relay’de iki oturum, eksik env, farklı payload ve tekrar gelen SessionEnd senaryoları.

### G22 · P2 · Canlı kayıt, saklama süresi ve sessiz hata yönetimi kanıt kaybedebilir [K]

Yer: [core/hooks/watch.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/hooks/watch.js:156).

- **Neden / etki:** Role prompt metninden çıkarılıyor; yaşam döngüsü/resume olayları eski ended durumunu taşıyabilir. sweep bazı rol kayıtlarını 24 saatte silebilir; görüş kotası/kanıt buna bağımlı kalır. Üst catch hatayı görünmez yapıyor.
- **Önerilen çözüm:** Host kimlikli olayları kalıcı event journal’a yaz; live yalnız türetilmiş görünüm olsun. Hatalar kullanıcıya kısa sağlık durumu versin, tekrar injection yapmasın. Saklama politikasını kanıt ömründen ayır.
- **Kapanış kabulü:** Restart/resume, gecikmiş Stop, 24 saat sınırı, bozuk JSON ve disk hatası replay testleri.

### G23 · P1 · Danışma açma/eşleme eşzamanlılıkta kayıp üretebilir [K]

Yer: [core/scripts/advice.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/advice.js:75).

- **Neden / etki:** Sıra numarası ve pending dosyası kilitsiz read-modify-write. Pending listesinin 8 kayda kırpılması devam eden danışmayı düşürebilir; close olayı bind’den önce gelebilir. 3 haneli numara taraması uzun ömür sınırı yaratıyor.
- **Önerilen çözüm:** Benzersiz consultationId, atomik ekleme ve olay sırasından bağımsız eşleme kullan; bind öncesi sonucu beklet. Ham prompt kaydını gizli veri ve saklama açısından sınırla.
- **Kapanış kabulü:** Eşzamanlı 10 danışma, Stop→bind ters sırası, 999→1000 ve tekrar teslimde hiçbir yanıt yanlış işe bağlanmamalı.

### G24 · P1 · Yenilenen handoff kapatılmış borcun kanıtını siliyor [R]

Yer: [core/scripts/handoff.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/handoff.js:134).

- **Neden / etki:** owe --done, Closed debts bölümüne kayıt ekliyor; writeAt/render yalnız intent ve güncel olguları yeniden oluşturuyor. Bir sonraki handoff write kapanmış borcu kaybettirdi.
- **Önerilen çözüm:** Borç olaylarını ayrı kalıcı journal’da tut, handoff’u bu kaynaktan üret. Elle yazılmış kalıcı bölümlerin koruma kuralları açık olsun.
- **Kapanış kabulü:** owe add→done→write→show→restart zincirinde gerekçe ve geçmiş korunmalı.

### G25 · P2 · Handoff CLI giriş/çıkış sözleşmesi gevşek [K]

Yer: [core/scripts/handoff.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/handoff.js:247).

- **Neden / etki:** Ondalıklı indeks splice davranışıyla yanlış borcu kapatabilir; bazı hatalarda çıkış kodu başarı kalır. show komutu yazıyor; intent komutunda flag metni niyete karışabilir.
- **Önerilen çözüm:** İndeks için pozitif integer doğrula, ID tabanlı işlemi tercih et. Read-only show ve mutating refresh ayır; başarısız işlemler nonzero dönsün.
- **Kapanış kabulü:** 1.5, 0, negatif, eksik gerekçe, boş liste ve bilinmeyen flag testleri; show dosya hash’ini değiştirmemeli.

### G26 · P1 · Log close varsayılanı kanıt toplamadan silme [K]

Yer: [core/scripts/log.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/log.js:83).

- **Neden / etki:** close kalıcı silmeye, archive kontrolsüz taşımaya dayanıyor. .md ile biten id için ../ gibi yol geçişi normalleştirme sınırı yok; isim belirsizliği veya hedef çakışması yanlış dosyaya etki edebilir. Yol geçişini gerçek kullanıcı dosyasında denemedim.
- **Önerilen çözüm:** ID’yi liste kaydından çöz ve realpath’in log kökü içinde olduğunu doğrula; default kapanış arşiv+manifest olsun. Üzerine yazmayı reddet; silme ancak açık kullanıcı tercihi ve kurtarma planıyla.
- **Kapanış kabulü:** Traversal/junction/çakışma fixture’ları, atomik arşiv, kapanış kanıtı eksikliği testi; gerçek loglar testte silinmemeli.

### G27 · P1 · HEAD eşitliği değişen çalışma ağacında tazelik kanıtı değil [R]

Yer: [core/scripts/map.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/map.js:144).

- **Neden / etki:** Yeni untracked importer ekledim; map fresh ve fanIn=0/read=true kaldı. Bu sadece arama kalitesini değil cheap-first kararını da yanlış etkiliyor.
- **Önerilen çözüm:** HEAD yanında ilgili tracked+untracked içerik manifesti veya dirty invalidation kullan; ölçülmeyen grafı unknown göster. Büyük depoda güvenli artımlı ve bütçeli yenileme tasarla.
- **Kapanış kabulü:** Commit olmadan ekleme/değiştirme/silme, rename, worktree ve config değişikliğinde graf bayat veya yeniden hesaplanmış olmalı.

### G28 · P2 · Graf taramasının kapsamı ve doğruluk iddiası fazla geniş [K]

Yer: [core/scripts/map.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/map.js:18).

- **Neden / etki:** Ignored Base/trash gibi tarihsel kopyalar taranabilir; regex import yorum/string ve çözülmeyen alias/dil durumlarında gerçek ilişkiyi temsil etmiyor. C# namespace ilişkisi sembol çağrısı değil; bulunamayan kenar sıfır etki diye yorumlanmamalı.
- **Önerilen çözüm:** Git-aware envanter, açık include/exclude ve dil yetenek tablosu kullan. file-import, namespace-reference ve symbol-call kenarlarını türle; confidence/unknown taşı. Gerekirse opsiyonel gerçek parser adaptörü ekle.
- **Kapanış kabulü:** Ignored tarihsel kopya, alias, dinamik yükleme, yorum ve C# iki sınıf örnekleri; false-positive/false-negative ayrı raporlansın.

### G29 · P2 · Graf bütçesi ve yazımı atomik/ölçülebilir değil [K]

Yer: [core/scripts/map.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/map.js:189).

- **Neden / etki:** String length byte veya model tokeni değil. Başlık ve uzun tek satır bütçeyi aşabilir; recursive cycle taraması derin grafı yığından taşırabilir. MD ve JSON ayrı yazıldığından farklı sürümler görülebilir.
- **Önerilen çözüm:** Bütçenin birimini açıkla ve gerçek byte ölç; token için tokenizer/usage kullan. İteratif graf algoritması ve manifest+atomik publish uygula.
- **Kapanış kabulü:** Uzun Unicode yollar, çok derin graf, büyük tek satır, yarım yazım ve bütçeden küçük/üst sınırlar testleri.

### G30 · P1 · Riskin düşük çıkması kapsamlı biçimde düşük etki demek değil [K]

Yer: [core/scripts/risk.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/risk.js:29).

- **Neden / etki:** Tracked numstat ve baseRef yaklaşımı untracked/binary veya main’de commit edilmiş işi eksik görebilir. Dosya adı sinyalleri küçük config işini pahalılaştırırken küçük ama kritik iş mantığını kaçırabilir. ownsMissing meşru silmeyi de engelleyebilir.
- **Önerilen çözüm:** Başlangıç revizyonu+tam değişiklik manifesti kullan; create/modify/delete ayrı olsun. Semantik risk soruları, geri alınabilirlik ve kullanıcı etkisi açık metadata olsun; belirsizi low’a yuvarlama.
- **Kapanış kabulü:** Küçük ödeme/kimlik kontrolü, silme, untracked kaynak, binary/config etkisi ve main commit’i örnekleri; risk açıklaması karar kanıtıyla eşleşsin.

### G31 · P1 · Çalıştırıcı başarılı çıkışı kabul doğruluğuyla karıştırabiliyor [K]

Yer: [core/scripts/contract.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/contract.js:186).

- **Neden / etki:** 0-test ifadelerinin yakalanması iyileşti; ama process.exit(0) veya sahte '10 passed' gerçek kabul kanıtı değil. Adım başına uzun timeout var, toplam sözleşme bütçesi yok; hata sonrası kalan adımlar çalışıyor. precheck/check --run aynı güvenlik kapılarını bütünüyle paylaşmıyor.
- **Önerilen çözüm:** Tek yürütme planı ve yapılandırılmış test sonucu kullan; gereken assertion/test sayısını ve kabul bağını kaydet. Fail-fast varsayılanı, toplam süre/tekrar bütçesi ve açık continue-on-failure seçeneği olsun.
- **Kapanış kabulü:** Sahte yeşil, kısmi suite, beklenenden az test, hiç test, timeout ve ilk adım hatası testleri. Başarılı komut ile başarılı kabul ayrı alanlar olsun.

### G32 · P2 · Geri alma tam ve risksiz bir işlem değil [K]

Yer: [core/scripts/contract.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/contract.js:1223).

- **Neden / etki:** Snapshot tracked içerik odaklı; yeni dosyaları kapsamayabilir. git checkout tabanlı geri alma index’i de değiştirir; pathspec ve kısmi hata durumları dikkat istiyor. unmet kapanışı rollback referansını düşürüyor.
- **Önerilen çözüm:** Başlangıç index/worktree/untracked manifestini sakla; restore işlemini açık kapsam ve literal paths ile yap. Kullanıcı değişikliği varsa otomatik ezme yerine çatışma bildir.
- **Kapanış kabulü:** Tracked staged/unstaged, yeni/silinmiş dosya, glob benzeri ad ve sonradan kullanıcı değişikliği örnekleri.

### G33 · P2 · Gösterge görünümü kabul edilen sözleşmeleri eksik sayıyor [R]

Yer: [core/scripts/statusline.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/statusline.js:54).

- **Neden / etki:** T2b.md schema tarafından geçerli; statusline bekleyen sözleşme olarak göstermedi. 5 dakika sessiz kalan çalışan görünümden düşebilir. Model/effort varsayımı gerçek gözlem gibi, profil ise bazı yollarda proje yerine genel ayar gibi sunuluyor.
- **Önerilen çözüm:** Ortak parser ve olay kaynağı kullan; running/quiet/unknown ayrı görünsün. Planlanan ve gözlenen model farklı etiketlensin; proje profilini çöz.
- **Kapanış kabulü:** Suffix kontrat, 20 dakika çalışan sessiz ajan, eksik resolved model ve proje/global profil çatışması görsel metin testleri.

### G34 · P2 · doctor yeşili aktif entegrasyonun çalıştığını kanıtlamıyor [K]

Yer: [core/scripts/doctor.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/doctor.js:139).

- **Neden / etki:** Hook dosyası/regex varlığı, hostun doğru sürümü yüklediğini ve payload’ların işlendiğini göstermiyor. Bazı sağlık kontrolleri ledger başlatma/adoption gibi yazı yan etkileri taşıyor; CI’daki toleranslı adımlar da kesin onay değil.
- **Önerilen çözüm:** Salt okunur doctor ile repair ayır. Kurulu plugin yolu/sürümü, enabled hooks ve küçük kaydedilmiş host-event roundtrip’ini ayrıca denetle; unknown sağlık durumu olsun.
- **Kapanış kabulü:** Dosyalar var ama hooks kapalı/yanlış cache/bozuk payload durumunda yeşil vermemeli; doctor dosya hash’lerini değiştirmemeli.

### G35 · P1 · Kurulum başarı sinyali ve sabitleme iddiası zayıf [K]

Yer: [install.ps1](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/install.ps1:1).

- **Neden / etki:** PowerShell native komutların LASTEXITCODE sonucunu her adımda kontrol etmiyor. install.sh Node yokken başarıyla çıkabiliyor. Sabit bootstrap sürümü, mutable marketplace’den kurulan ürünün de sabit olduğunu garanti etmiyor.
- **Önerilen çözüm:** Her adımı hata koduyla doğrula; gerekli Node/Git/Claude sürümlerini açık prerequisite yap. Kurulan paket commit/hash’ini kaydet; bootstrap ve plugin pin’ini ayrı belirt.
- **Kapanış kabulü:** Node yok, Claude komutu başarısız, ağ kesik, eski cache ve sürüm uyuşmazlığı fixture’ları; başarısız kurulum nonzero dönmeli.

### G36 · P2 · Kurulum aktif plugin yerine en yeni cache’i seçebilir; kullanıcı ayarını ezebilir [K]

Yer: [core/scripts/setup.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/setup.js:77).

- **Neden / etki:** findCore cache semver seçimini gerçek etkin kurulumla karıştırabiliyor. Varsayılan cevaplar mevcut tercihleri resetleyebilir; statusline ve tek backup üzerine yazılır. write başarısızlığı her yerde başarıya yansımıyor; interactive ask anahtarının çevirisi eksik.
- **Önerilen çözüm:** Etkin kurulum manifestini ve scope’u esas al; kurulum planı/diff göster, mevcut değerleri varsayılan yap. Backup benzersiz ve geri yüklenebilir olsun; atomik ayar güncellemesi kullan.
- **Kapanış kabulü:** Birden çok plugin sürümü/scope, özel statusline, bozuk JSON ve ikinci kez setup senaryoları.

### G37 · P2 · Sürüm kontrolü ağsız veya otomatik güncelleme değildir [K]

Yer: [core/scripts/update.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/update.js:1).

- **Neden / etki:** Kod sürüm kontrolü yapıyor; otomatik plugin kurulumu yaptığı iddia edilmemeli. Ağ isteği bulunduğu için 'network yok' da mutlak doğru değil. Başarısız kontrolün checkedAt yazması yeniden denemeyi uzatabilir; eşzamanlı tetikler çoğalabilir.
- **Önerilen çözüm:** Update-check'i opt-out, tek-flight ve başarı/başarısızlık için ayrı backoff ile tanımla. Ağ, disk ve model token maliyetlerini ayrı belirt.
- **Kapanış kabulü:** Offline, bozuk cevap, ilk kurulum ve eşzamanlı kontrol testleri; başarısızlık bir haftalık sahte güncellik üretmemeli.

### G38 · P1 · release --dry gerçekten kuru çalışma değil [K]

Yer: [core/scripts/release.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/release.js:143).

- **Neden / etki:** cut içinde stamp/changelog/not silme işlemleri dry ayrımından önce yapılabiliyor. git add -A başka çalışanın değişikliklerini de kapsar. Test, paket kapsamı ve dağıtılan checksum zorunlu release kapısı değil.
- **Önerilen çözüm:** Önce salt okunur release planı oluştur; --dry hiçbir byte değiştirmesin. Açık dosya listesiyle stage, temiz kaynak sürümü, test/manifest ve checksum artefaktı üret; yarım işlem kurtarılabilir olsun.
- **Kapanış kabulü:** Dry öncesi/sonrası bütün dosya hash’leri eşit; ilgisiz dirty dosya stage edilmemeli; test başarısızsa release durmalı.

### G39 · P2 · İmza/asset üretimi kullanıcı içeriğini genişçe değiştirebilir [K]

Yer: [core/scripts/scaffold.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/scaffold.js:1).

- **Neden / etki:** İmza işaretinden sonraki içerik yeniden yazılabiliyor; asset kopyası üzerine yazıyor, ikinci dil README’si yokken bağlantı kurulabiliyor. Lisans dosyası seçimi path sınırı istemeli. AGPL varsayılanı teknik zorunluluk değil ürün tercihi.
- **Önerilen çözüm:** Başlangıç/bitiş işaretli dar blokları değiştir; diff/overwrite seçeneği ve idempotent çıktı kullan. SPDX seçimini allowlist’le sınırla; lisans tercihini kullanıcıya açık göster.
- **Kapanış kabulü:** İmzadan sonra kullanıcı metni, mevcut özel SVG, tek dilli proje, geçersiz SPDX ve ikinci çalıştırma testleri.

### G40 · P2 · Sıfır sürekli token iddiasının OWED istisnası var [K]

Yer: [core/hooks/cue.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/hooks/cue.js:20).

- **Neden / etki:** UserPromptSubmit dalı açık borç için stdout üretiyor. Bu host olayında stdout bağlama eklenir. CAP=200 karakter token üst sınırı değildir; uyarı her promptta yinelenebilir.
- **Önerilen çözüm:** İddiayı 'yerel hook yürütmesi model çağırmaz; sessiz yollar ek bağlam üretmez' diye sınırla. Borç mesajını değişiklik/ilk teslim bazlı ve ölçülmüş bütçeli yap; görünür UI ile model bağlamını ayır.
- **Kapanış kabulü:** Açık borç yok/var/değişti durumlarında tüm hook stdout/stderr/JSON ve gerçek kullanım farkı kaydedilsin; yalnız additionalContext aramak yeterli değil.

### G41 · P2 · Bildirimler proje ve platformlar arasında tutarlı değil [K]

Yer: [core/hooks/notify.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/hooks/notify.js:1).

- **Neden / etki:** Global cooldown bir projenin uyarısının diğerini susturmasına yol açabilir; proje config’i tam cwd varsayımına bağlı. Linux WAV bulunmadığında terminal fallback’ine ulaşmayan yollar var. Statusline renk/escape ve NO_COLOR ayrıntıları da taşınabilirlik sorunu.
- **Önerilen çözüm:** Cooldown’u session/project/event anahtarına bağla; kök config çözümlemesini paylaş. Ses, terminal ve sessiz modu ayrı adaptörler yap; güvenilmeyen başlıkları terminal kontrol karakterlerinden arındır.
- **Kapanış kabulü:** İki proje, alt dizin cwd, ses dosyası yok ve NO_COLOR testleri. Bu tur gerçek ses çıkışı/GUI doğrulanmadı.

### G42 · P1 · Manşet denetimi sayının anlamını doğrulamıyor [K]

Yer: [core/scripts/manset.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/manset.js:80).

- **Neden / etki:** Bir sayının kaynakta veya yakın tabloda geçmesi, doğru satır/payda/birimle kullanıldığını göstermez. source bag başka sayıya dayanak olabilir. 1,3 saniye→1,3 ms gibi hata bu tasarımın kör noktasını somutlaştırıyor.
- **Önerilen çözüm:** Hesaplanan iddiaları kaynak hücre/alan, formül, birim ve yuvarlama ile yapılandırılmış veri olarak üret. Prose heuristiğini ipucu olarak tut; her metni anlayan kesin denetçi diye sunma.
- **Kapanış kabulü:** Aynı sayı yanlış model satırında, yüzde yerine puan, saniye/ms, toplam/altküme ve çift sayılmış tur örnekleri negatif olmalı.

### G43 · P1 · Binlerce assertion, binlerce bağımsız davranış testi değil [K]

Yer: [test/all.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/test/all.js:1083).

- **Neden / etki:** Geniş model kombinasyon matrisi sayıyı büyütüyor; aynı fonksiyonun çok girdili kontrolü host uçtan uca test yerine geçmez. Elle yazılmış audit/live ve sentetik passed çıktıları kimi önemli açıkları görünmez bırakmış.
- **Önerilen çözüm:** Raporu birim/özellik/entegrasyon/host replay/negatif kabul olarak ayır. Önce gerçek hata fixture’ı kırmızı olsun; sonra düzeltme. Sayı yerine invariant ve risk kapsamını raporla.
- **Kapanış kabulü:** Bu rapordaki 12 karşı örnek kalıcı regresyon olmalı; ayrıca dispatch→bind→tool→stop→audit→complete zinciri gerçek payload fixture’ıyla sınanmalı.

### G44 · P2 · Testler makine ayarına ve yan etkilere tam yalıtılmış değil [K]

Yer: [test/all.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/test/all.js:1839).

- **Neden / etki:** Üç assertion HKCU Environment anahtarı ekleyip siliyor; önceden var olan kullanıcı değerini korumuyor. Bazı testler kaynak .changes dizinine yazıyor; profil varsayımı yüzünden boş config koşusunda tek test kaldı. Keskin süre beklentisi yavaş makinede oynak.
- **Önerilen çözüm:** Her test kendi temp repo/config’ini kursun; registry bağımlılığını adaptörle fake et. Aktif profil fixture’da açık olsun; kaynak repo write ve zaman limitlerini ayrı test sınıfına al.
- **Kapanış kabulü:** Boş ve dolu kullanıcı ayarında aynı sonuç; suite öncesi/sonrası kaynak ve registry aynı. Kalan failure’ı gizleme, fixture beklentisini düzelt.

### G45 · P1 · Totoloji kabulü kapatılmış sayılacak düzeyde sınanmamış [K]

Yer: [test/all.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/test/all.js:1779).

- **Neden / etki:** 'Komut hata verebilir' ölçütü tek başına ürün kabulünü test ettiğini göstermez. process.exit(0) ve sahte test sayısı gibi fixture’lar var. Logdaki üç olumsuz örnek için bağımsız yakalama kanıtı yerine denetçi rolüne talimat yazılmış.
- **Önerilen çözüm:** Her kabul maddesi için değişikliği geri alınca veya davranışı bozunca kırılan test iste; araştırma işinde kaynak/veri uyuşmazlığı negatif kontrolü kullan. Denetçi talimatı mekanik kanıtın yerine geçmesin.
- **Kapanış kabulü:** Özgün logdaki üç karşı örnek yeniden oynatılsın; mutation/revert deneyi ilgili kabul testini gerçekten düşürsün.

### G46 · P2 · Maliyet toplama aracı kapsam ve bilinmeyenleri daha açık taşımalı [K]

Yer: [tools/audit-evidence.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/tools/audit-evidence.js:1).

- **Neden / etki:** Büyük JSONL tek seferde belleğe alınıyor; dosyalar arası duplicate için ilk kayıt seçimi farklı stream usage sürümlerinde eksik sayabilir. Request ID’siz usage dışarıda kalıyor; bilinmeyen model/başlatma oranı açık hata bütçesi değil.
- **Önerilen çözüm:** Akışlı parse, request ID bazlı en güncel/tam kullanım seçimi, unknown/dropped sayacı ve kaynak hash manifesti ekle. Fiyat tablosu tarihli veri olsun; API senaryosu Max kota ölçümü diye sunulmasın.
- **Kapanış kabulü:** Duplicate varyant, bozuk son satır, ID’siz usage ve cache süreleri fixture’ları; toplamlar iki bağımsız yöntemle uzlaştırılsın.

### G47 · P1 · Ölçüm yorumunda bin katlık birim hatası var [K]

Yer: [docs/inceleme/_OLCUM-graphify.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/_OLCUM-graphify.md:114).

- **Neden / etki:** 10.657 ms indeksleme / 8 soru ≈1.332 ms ≈1,3 saniye; metin 1,3 ms yazıyor. Map payı yaklaşık 18 ms. Bu sadece imla değil, göreli maliyet algısını ters yönlendiriyor.
- **Önerilen çözüm:** Birimli ham veriden tablo ve cümleyi birlikte üret; indeksleme payı, sorgu gecikmesi ve model maliyetini ayrı göster.
- **Kapanış kabulü:** 10.657/8 hesabını birim dönüşümüyle sabitle; rapordaki bütün türetilmiş sayıların formülü çalıştırılabilir olsun.

### G48 · P2 · Araştırma şablonu sonucu önceden yönlendiriyor [K]

Yer: [docs/inceleme/_SABLON.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/_SABLON.md:1).

- **Neden / etki:** Son cümlenin 'neden bunu kurmana gerek yok' eksenine bağlanması, karşılaştırmayı açık araştırmadan Core lehine savunmaya çekiyor. Bağımlılıksız küçük kodun doğruluk ve bakım maliyetiyle eşdeğerliği ayrıca kanıtlanmalı.
- **Önerilen çözüm:** Her araç için 'ne zaman kullan, ne zaman kullanma, Core neyi karşılamıyor' bölümleri zorunlu olsun. Hipotez, karşı kanıt ve başarısız deney de kaydedilsin.
- **Kapanış kabulü:** Bir rakibin açıkça üstün çıktığı senaryo rapor şablonunda kayıpsız yer bulmalı; sonuç kaynak seviyesinden daha güçlü olmamalı.

### G49 · P2 · Benchmark sonuçlarının genellenebilirliği sınırlı [K]

Yer: [docs/inceleme/_OLCUM-obsidian.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/_OLCUM-obsidian.md:1).

- **Neden / etki:** Az soru/ajan ve tek koşu; reasoning, model, cache, çıktı paketleme ve veri kapsamı etkileri tam ayrıştırılmıyor. Graphify/Core indekslerinin dosya ve kenar semantiği de birebir aynı değil.
- **Önerilen çözüm:** Eşlenmiş görevler, aynı girdi sürümü, rastgele sıra, cold/warm cache, kalite kör puanlaması ve maliyet limiti kullan. İndeksleme, model düşünme ve tekrar maliyetini ayrı ölç.
- **Kapanış kabulü:** Önce ucuz offline pilot; geniş model bench’i ancak kırmızı güven kapıları kapandıktan ve kullanıcı bütçesi belirlendikten sonra. Bu tur yeni ücretli benchmark yapılmadı.

### G50 · P1 · audit alanı dolu olması denetimin yapıldığını kanıtlamıyor [K]

Yer: [docs/raporlar/denetci-maliyet-analizi.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/raporlar/denetci-maliyet-analizi.md:14).

- **Neden / etki:** 25/25 auditorRunId üzerinden denetim boşluğu olmadığına yakın sonuç çıkarılıyor; G03/G04 bunu çürütüyor. 216 ledger olayı, 154 ayrı done dosyasıyla aynı payda değil. Opus 15/75 fiyatı bu oturumun Opus 5 fiyatı değil.
- **Önerilen çözüm:** Audit coverage = iş/tur/hash/host kimliği doğrulanmış bağımsız denetim olarak yeniden hesapla. Olay, kontrat, tur ve run sayısını ayrı tut; fiyatları sürümle.
- **Kapanış kabulü:** 25 kaydın her birini kaynağa eşleştir; eşleşmeyeni unknown say. Fiyatlı tablo resmi modele/cache türüne göre yeniden üret.

### G51 · P1 · Tekrar sayıları aynı birimde toplanmıyor [K]

Yer: [docs/raporlar/rele-surec-kusurlari-127-sozlesmelik-olcum.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/raporlar/rele-surec-kusurlari-127-sozlesmelik-olcum.md:1).

- **Neden / etki:** 18 kuyruk turu aynı sözleşmenin 18 çalışması değil. 127/131 envanter revizyonları ve 12 reopen +16 sözcüksel vaka −6 örtüşme gibi kümeler aynı veri sürümünde tutulmalı. Sonradan geçen suite, önceki hatanın kesinlikle yalnız paralellik olduğunu göstermez.
- **Önerilen çözüm:** Kontrat-attempt-event ilişki tablosu, set üyeleri ve kaynak zamanını yayımla. Nedensel atama için aynı girdinin kontrollü seri/paralel tekrarı gerekir; tahmine güven aralığı görünümü verme.
- **Kapanış kabulü:** Her özet sayısı listeyle uzlaşmalı; başlık/tablolar aynı veri sürümünden üretilmeli. Sınıflandırılamayan kayıt ayrı sütun olsun.

### G52 · P1 · Bir yardımcı fonksiyon düzeldi diye birden çok log kapatılmış sayılıyor [K]

Yer: [docs/raporlar/vidshrink-tasnif.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/raporlar/vidshrink-tasnif.md:1).

- **Neden / etki:** 'Tek fonksiyon/beş rapor kapandı' yaklaşımı relay keşfi ile gerçek worktree yürütmesini aynı sorun kabul ediyor. G01 güncel sürümde hâlâ tekrarlandı. Düzeltme niyeti, çağrı zinciri ve özgün kabul kanıtı arasında boşluk var.
- **Önerilen çözüm:** Her logu özgün kabul maddesine ve regresyon testine bağla. shared root bulunması alt koşul; doğru checkout’ta doğrulama ayrı zorunlu koşul olsun.
- **Kapanış kabulü:** Her kapalı log için önceki başarısız fixture, düzeltme commit’i, sonra geçen çıktı ve sınanmayan kapsam yazılsın.

### G53 · P2 · Bazı öneriler güvenliği kanıtlamak yerine kapıyı gevşetiyor [K]

Yer: [docs/raporlar/vidshrink-core-onerileri.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/raporlar/vidshrink-core-onerileri.md:1).

- **Neden / etki:** unverified_runner veya kanıt yokken tekrar audit önerileri ya güvenceyi azaltır ya tekrar maliyetini büyütür. Host permission reddi ile Core guard reddi kaynak gösterilmeden aynı sepete atılabiliyor; Base/Core rol yolları da karışıyor.
- **Önerilen çözüm:** Her engelin kaynağını host permission/Core guard/uygulama/araç hatası olarak kaydet. Kanıt kurtarma yolunu otomatik yeni pahalı run’dan önce dene; yetkiyi genişleterek yanlış pozitif çözme.
- **Kapanış kabulü:** Aynı reddin kural kaynağı ve intended action’ı görülsün; farklı araçla izin aşmak çözüm kabul edilmesin.

### G54 · P2 · İzinlerin faydasız olduğu ve temizliğin güvenli olduğu genellenemez [K]

Yer: [docs/raporlar/yetki-bosluklari.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/raporlar/yetki-bosluklari.md:1).

- **Neden / etki:** Yalnız engellenmiş örneklerden bütün izinlerin değersizliği çıkarılamaz. Ignored dosya veya done/unmet worktree güvenle silinebilir demek değildir; dirty/untracked ve kullanıcı çıktısı kaybolabilir.
- **Önerilen çözüm:** Temizlik önerisi önce gerçek yol/iş sahipliği/değişiklik manifesti ve kurtarılabilir karantinaya dayanmalı. Yetki gevşetme yerine dar, gözlenebilir onaylı işlemler tasarla.
- **Kapanış kabulü:** Dirty, untracked, symlink, unmet ve başka işin kullandığı worktree fixture’ları; izin etkisi karşı olgusal veriyle değerlendirilmeden yüzde iddiası verilmesin.

### G55 · P2 · README, rol dosyaları ve karar kayıtları aynı politikayı anlatmıyor [K]

Yer: [README.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/README.md:1).

- **Neden / etki:** Premium model, 3/4. tur danışma, tur tavanı, Node zorunluluğu, sıfır maliyet ve bütün komutların korunması konusunda eski/yeni ifadeler yan yana. advisor.md advisorPair adına gönderme yaparken uygulama başka şema kullanıyor. Örnek kontratın eksik alanları kullanıcıya yanlış kalıp veriyor.
- **Önerilen çözüm:** Politika tablosu ve örnekleri tiers/schema’dan üret; tarihsel ADR’leri superseded/version etiketiyle koru. Rol dosyası, README ve uygulama için tutarlılık testi ekle.
- **Kapanış kabulü:** İki README, roller, tiers ve çalışan kontrat örneği aynı çıktıyı vermeli; tüm iddialar ölçülen kapsamı ve istisnasını söylemeli.

### G56 · P2 · Sürekli token tasarrufu toplam ekonomik sonuçla karıştırılmamalı [K]

Yer: [docs/COST-MODEL.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/COST-MODEL.md:1).

- **Neden / etki:** Yerel otomasyon avantajı gerçek; ancak talimat okumaları, CLI çıktıları, blok gerekçeleri, OWED ve yeniden denemeler bağlam/maliyet üretir. 'MCP bütün şemaları her zaman taşır' güncel deferred tool search ile evrensel doğru değil.
- **Önerilen çözüm:** Idle overhead, çağrı başına context, cache yaz/oku, model output ve yeniden iş maliyetini ayrı ölç. Rakipte eager/deferred modları aynı koşulda karşılaştır.
- **Kapanış kabulü:** No-op, ilk görev, borçlu prompt, red, tekrar ve danışma için token ledger; toplam $/başarılı kabul ve gecikmiş hata maliyeti raporlansın.

### G57 · P2 · Bench planının güvenilirlik ve bütçe önkoşulları eksik [K]

Yer: [docs/BENCH.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/BENCH.md:1).

- **Neden / etki:** Sayıca geniş koşu planı tek başına gerçek kullanıcı olayını kapsamaz; .NET/Avalonia kısmi-suite vakası kritik. Farklı model token adetleri doğrudan maliyet ölçüsü değildir; gecikmiş kusur ve yanlış kapatma maliyeti gözden kaçabilir.
- **Önerilen çözüm:** Önce bu raporun offline negatif testlerini kapat. Sonra sınırlandırılmış pilotta kalite eşitliği, false-pass/false-block, token türü, API eşdeğeri ve kullanıcı kota göstergesini ayrı izle. Durdurma kuralı koy.
- **Kapanış kabulü:** Pilot için kullanıcı bütçesi, en fazla tekrar, başarısızlıkta duruş ve gerçek testhost vaka seçimi yazılı olmalı; şu an üretim bench’ine hazır onayı verilmedi.

### G58 · P2 · Plan tamamlanması gerçek garantiye dönüştürülmüş [K]

Yer: [docs/contracts/T-evrim-plani.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/contracts/T-evrim-plani.md:1).

- **Neden / etki:** Önceki handoff zaten birçok kök sorunu tarif etmiş. 'Kod eklendi/test sayısı arttı' ile invariant sağlandı aynı şey değil. N/O/P/R kayıtlarında submitted durumları, boş görüş ve CLI-seviyesi kabuller uygulama kanıtının yerini tutmuyor.
- **Önerilen çözüm:** Amaç→kontrol noktası→negatif test→kanıt→sınır eşlemesi tut; plan maddesi implemented ile verified ayrı durum olsun. Skorlar ölçülmediyse değerlendirme olarak etiketlensin.
- **Kapanış kabulü:** Boş GORUS-model kaydı kanıt sayılmamalı; danışma ve sonraki işi verme kabulleri gerçek çok turlu replay ile doğrulanmalı.

### G59 · P2 · Diyagramlar eski/absolut iddiaları yeniden yayıyor [K]

Yer: [assets/flow-cost.svg](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/assets/flow-cost.svg:1).

- **Neden / etki:** Cost akışında sıfır bağlam genellemesi, contract akışında gerçek doğrulama/risk sırası ve hata durumuyla uyuşmayan anlatım var. Dil rozetinde iki alan ayrı düğme gibi görünse de bütün SVG tek link; lisans etiketi manifestle daha tutarlı olabilir.
- **Önerilen çözüm:** Diyagramları çalışan süreç ve dar maliyet tanımına göre güncelle. İki dil linkini ayrı erişilebilir bağlantı yap; başlık/aria/kontrastı gerçek render ile kontrol et.
- **Kapanış kabulü:** SVG metni incelendi; bu tur piksel/render erişilebilirlik onayı verilmedi. Sonraki UI değişikliğinde iki tema/dil ve gerçek tıklama hedefi test edilsin.

### G60 · P2 · Closed klasörü çözüm doğruluğunun tek kaynağı olmuş [K]

Yer: [logs/openlogs/closed/HATA-contract-guard-komut-metnine-takiliyor-hedef-yola-degil.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/logs/openlogs/closed/HATA-contract-guard-komut-metnine-takiliyor-hedef-yola-degil.md:1).

- **Neden / etki:** Bazı kayıtların başında Durum AÇIK veya doldurulmamış çözüm bölümü kalmış; bazılarında özgün kabul yerine daha dar bir test verilmiş. Yöntem notu, başka projeye devredilmiş sorun ve düzeltilmiş bug aynı klasörde.
- **Önerilen çözüm:** Kapanış şeması: resolved/partially-verified/transferred/duplicate/documented + özgün kabul + kanıt + kalan sınırlar. Arşivleme bu alanları doğrulasın; geçmiş iddia silinmesin.
- **Kapanış kabulü:** Aşağıdaki 16 log matrisi esas alınarak yeniden sınıflandır; yalnız metin eklemek yerine özgün hata negatif fixture’ı geçsin.


## 6. Kapalı 16 log gerçekten kapanmış mı?

**“Closed klasörüne taşındı” çözüm kanıtı değil.** Aşağıdaki statüler inceleme hükmüdür; bu tur gerçek logların durumları değiştirilmedi.

| Kayıt | İnceleme hükmü | Kanıtın sınırı | Kapanış için gereken |
|---|---|---|---|
| [BUG-contract-js-verify-adimi-testhost-exe-yi-oldurmuyor.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/logs/openlogs/closed/BUG-contract-js-verify-adimi-testhost-exe-yi-oldurmuyor.md:1) | Kısmen doğrulandı | Timeout çocuk-süreç fixture’ı geçiyor; özgün .NET testhost olayı yeniden oynatılmadı. | Windows .NET/Avalonia süreç ağacı ve timeout sonrası süreç yokluğu. |
| [BUG-core-eklenti-olarak-kuruluyken-kendi-deposunu-bulamiyor-gunlukler-maka.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/logs/openlogs/closed/BUG-core-eklenti-olarak-kuruluyken-kendi-deposunu-bulamiyor-gunlukler-maka.md:1) | Kısmi düzeltme | Kurulum/root keşfi iyileşse de aktif cache seçimi ve G01 worktree yürütmesi açık. | Eklenti olarak kurulu, kaynak repo yok, birden fazla cache ve worktree uçtan uca. |
| [BUG-plan-konseyi-dosya-adina-bagli-kararin-agirligina-degil.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/logs/openlogs/closed/BUG-plan-konseyi-dosya-adina-bagli-kararin-agirligina-degil.md:1) | Talimat iyileşmesi; tam kanıt yok | Karar ağırlığına göre danışma mekanik olarak her yoldan garanti değil. | Dosya adı değişse de aynı yüksek etkili karar aynı danışma kuralını tetiklemeli. |
| [BUG-spawnsync-timeout-surec-agacini-oldurmuyor.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/logs/openlogs/closed/BUG-spawnsync-timeout-surec-agacini-oldurmuyor.md:1) | Aynı kökün mükerrer kaydı; kısmen doğrulandı | Yeni küçük timeout testi geçti; üç timeout kaydı üç bağımsız düzeltme sayılmamalı. | Tek ana olay altında platform/runner kabul matrisi. |
| [BUG-suit-basssiz-avalonia-testlerinde-konak-sureci-cokerek-kosumu-yarida-k.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/logs/openlogs/closed/BUG-suit-basssiz-avalonia-testlerinde-konak-sureci-cokerek-kosumu-yarida-k.md:1) | Devredilmiş/kısmen araştırılmış | 958 beklenirken kısmi sayılar ve exit 0 önemli; seri geçiş paralelliğin kesin neden olduğunu kanıtlamaz. | Beklenen test sayısı + kontrollü seri/paralel .NET testhost deneyi. |
| [BUG-t0-dogrulamasi-sabit-uzerine-kurulu-ve-kendini-dolduran-testi-goremiyo.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/logs/openlogs/closed/BUG-t0-dogrulamasi-sabit-uzerine-kurulu-ve-kendini-dolduran-testi-goremiyo.md:1) | Çözülmüş saymak için yetersiz | Üç totoloji örneğini denetçisiz yakalama kabulü, auditor talimatına çevrilmiş. | Özgün üç negatif test ve davranışı bozunca kırılma. |
| [BUG-t0-is-dagitmak-yerine-soru-sorup-projeyi-durdurdu.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/logs/openlogs/closed/BUG-t0-is-dagitmak-yerine-soru-sorup-projeyi-durdurdu.md:1) | Kabul daraltılmış | 10 turluk davranış/format beklentisi yerine tek Stop bloklaması kanıtlanmış. | On turlu host replay; gereken iş dağıtımı ve kullanıcı taleplerinin doğru bölümü. |
| [BUG-t0-turu-siradaki-direktifi-vermeden-kapatiyor-ajan-bosta-bekliyor.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/logs/openlogs/closed/BUG-t0-turu-siradaki-direktifi-vermeden-kapatiyor-ajan-bosta-bekliyor.md:1) | Kabul daraltılmış | Stop’un bir kez engellenmesi sıradaki ajanın gerçekten başlatıldığını göstermiyor. | Stop→sonraki dispatch→başlatma onayı; tıkanmış işte gereksiz dispatch olmamalı. |
| [BUG-trash-disiplini-yazili-ama-hicbir-yerde-olculmuyor.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/logs/openlogs/closed/BUG-trash-disiplini-yazili-ama-hicbir-yerde-olculmuyor.md:1) | Heuristik iyileşme | Orphan taraması gerçek temizlik veya bütün artıkların bulunması değil. | Özgün kapsam/dışlamalar, meşru dinamik yükleme ve yanlış silme negatifleri. |
| [BUG-zaman-asan-verify-zombi-testhost-birakiyor.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/logs/openlogs/closed/BUG-zaman-asan-verify-zombi-testhost-birakiyor.md:1) | Aynı timeout kökü; kısmen doğrulandı | Küçük süreç ağacı testi olumlu; özgün zombi testhost tam tekrarı yok. | Diğer timeout kayıtlarıyla tek kanıt zinciri. |
| [HATA-contract-guard-komut-metnine-takiliyor-hedef-yola-degil.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/logs/openlogs/closed/HATA-contract-guard-komut-metnine-takiliyor-hedef-yola-degil.md:1) | Kapanış kanıtı yok | Closed içinde Durum AÇIK ve eksik çözüm alanları; kabuk hedef ayrıştırma hâlâ sınırlı. | G09 komut/hedef matrisi; önce açık durum ve eksik kanıt düzeltilmeli. |
| [HATA-imza-blogu-yeni-projelere-kendiliginden-gelmiyor.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/logs/openlogs/closed/HATA-imza-blogu-yeni-projelere-kendiliginden-gelmiyor.md:1) | Kapsamı eksik doğrulanmış | Beş proje beklentisi yalnız Core yardımcı fonksiyonuyla karşılanmış sayılamaz; açık başlık kalmış. | Beş ayrı yeni proje ve kullanıcı metnini koruyan idempotent scaffold. |
| [HATA-kullaniciya-verilen-silme-komutu-dogrulanmamis-yollardan-kuruldu.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/logs/openlogs/closed/HATA-kullaniciya-verilen-silme-komutu-dogrulanmamis-yollardan-kuruldu.md:1) | Süreç düzeltmesi; güvence yok | Özgün güvenli silme kabulünün tümü iki talimatla ikame edilmiş; açık başlık ve yeni vakalar var. | Yol, kapsam, kullanıcı verisi, kurtarma ve açık yetki için altı kabulün her biri. |
| [HATA-paralel-ajanlar-ayni-git-indeksini-paylasti.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/logs/openlogs/closed/HATA-paralel-ajanlar-ayni-git-indeksini-paylasti.md:1) | Yalnız yönerge yeterli değil | T44/T45 ortak index olayı için worktree talimatı var; gerçek yürütme kökü G01 hâlâ yanlış. | İki ajan/index/checkout izolasyonu ve commit’e yabancı dosya girmemesi. |
| [HATA-shields-rozetinde-okunmayan-beyaz-yazi.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/logs/openlogs/closed/HATA-shields-rozetinde-okunmayan-beyaz-yazi.md:1) | Tasarım değişmiş; görsel QA eksik | Kaynak SVG değişikliği okunmuş, gerçek görüntü ve kontrast doğrulaması bu tur yapılmadı. | İki tema/ölçek/dil için render ve erişilebilirlik. |
| [YONTEM-cift-dilli-readme.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/logs/openlogs/closed/YONTEM-cift-dilli-readme.md:1) | Bug değil, yöntem kaydı | İki dil amaç olarak doğru; sözü edilen başlık/semantik CI güvencesi mevcut workflow ile aynı değil. | Yöntem arşivi olarak etiketle; gerçek link/politika/başlık tutarlılık testi. |

Özellikle üç timeout kaydı tek kökün tekrar anlatımıdır. Bunları üç bağımsız kapatılmış hata diye saymak yanıltıcıdır. Küçük Windows çocuk süreç testi olumlu kanıt; gerçek .NET/Avalonia vaka sınırını ortadan kaldırmaz.

## 7. Araştırmalara ve mevcut raporlara yapıcı eleştiri

Bu bölüm rakip projelerin güncel bütün kodlarının yeniden denetlendiği iddiası değil; Core’daki araştırma belgelerinin yöntem, iç tutarlılık ve sonuç kuvveti değerlendirmesidir.

| Araştırma | Sorun | Düzeltme |
|---|---|---|
| [adr.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/adr.md:1) | Karar gerekçesi (ADR), işin kapanış ledger’ıyla eşdeğer değil. | Neyi neden seçtik kaydı korunmalı; completion tarihçesi tamamlayıcıdır. |
| [aider-repomap.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/aider-repomap.md:1) | HEAD tabanlı tazelik dirty değişiklikleri yakalamıyor; file-import ile symbol graph aynı değil. | G27 fixture’ını araştırmanın kendi önerisine uygula; kalite/yenileme ölçümünü ayrı ver. |
| [ast-grep.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/ast-grep.md:1) | AST kullanımı sıfır yanlış pozitif garantisi değil; CLI kontrolü yalnız Core’a özgü avantaj değil. | Gerçek pattern false-positive/negative örnekleri ve opsiyonel CLI entegrasyon maliyeti. |
| [baglam-enjeksiyonu.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/baglam-enjeksiyonu.md:1) | Tüm PostToolUse işlemlerini async yapmak kanıt/bind sırası için yarış yaratabilir. | Güven kapısı ile UI/log görevini ayır; byte/4 tahminini gerçek usage diye etiketleme. |
| [beads.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/beads.md:1) | Dört hex karakterli ID çakışmasız değildir; deps yok karşılaştırması güncel Core’la eskimiş. | ID alanı 65.536 olasılıktır; yaklaşık 301 üretimde çakışma olasılığı yarıya ulaşır (uniform varsayım). UUID/ULID veya çakışma kontrolü. |
| [git-native.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/git-native.md:1) | 112 ms örnek varken bütün ölçüler <100 ms denemez; byte ile token aynı değil. | Birimli çıktı ve açık baseline; git-native araç ile semantik analiz kapsamını ayır. |
| [mem0.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/mem0.md:1) | Her hafıza işlemi zorunlu iki bulut LLM çağrısıdır genellemesi kendi ADD/local ayrımlarıyla uyuşmuyor. | İşlem/provider bazlı maliyet; hash bütünlüğünü bilgi doğruluğu veya denetçi güveni diye sunma. |
| [repomix.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/repomix.md:1) | Bağımlılık listesinde chokidar bulunması ilgili modun davranış kanıtı değil; sabit token bütçesi tahmini aşırı güçlü. | Komut/mod/sürümle davranış testi ve gerçek çıktı/context ölçümü. |
| [serena.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/serena.md:1) | ToolSearch kabul edilip kalıcı şema vergisi genelleniyor; Core’un shell yazı açığı karşılaştırmada görünmüyor. | Eager/deferred koşulları ve iki ürünün aynı yazı sınırı testi. |
| [spec-kit.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/spec-kit.md:1) | Niyet/spec katmanı test kapısının rakibi olmak zorunda değil. | Core’un kendi amaç-kabul boşluğunda neyi tamamladığını da ölç; kurulum bağımlılığından değersizlik sonucu çıkarma. |
| [openspec-taskmaster.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/openspec-taskmaster.md:1) | İş planlama/spec ve bitiş kapısı farklı işler; hepsini yerel küçük kod eşdeğeri saymak iddialı. | Gereksinim→görev→kabul→kanıt eşlemesini eşdeğer görevlerde karşılaştır. |
| [ccusage-ccstatusline.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/ccusage-ccstatusline.md:1) | Son istekte output’un context hesabından ayrılması çıktı hiçbir zaman sonraki input olmaz demek değil; otomatik compaction oranları evrensel değil. | Host/model sürümünü ve stdin alanlarını sabitle; maliyet/bağlam/abonelik ölçülerini ayır. |
| [claude-flow.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/claude-flow.md:1) | 358 tanım ve 270.118 byte üst sınırı gerçek startup payload’ı veya her isteğin faturası değil; stdio deneyi başarısız. | Üst sınır etiketini README’ye taşırken koru; gerçek keşif sonrası payload ölç. |
| [semgrep-codeql.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/semgrep-codeql.md:1) | git diff semantik analiz eşdeğeri değil; özel CodeQL deposu için mutlak kullanılamaz genellemesi yanlış. | Lisanslı özel repo durumunu ayır; gereken güvenlik analizini opsiyonel adaptörle karşılaştır. |
| [graphify.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/graphify.md:1) | İndeksleme ve ajan sorgusu ayrı; 74× kurulum süresi token tasarrufu değildir. Farklı dosya/kenar kapsamları tam eşdeğer değil. | G47 birim düzeltmesi, eş kapsam, aynı soru, cold/warm ayrımı ve sembol doğruluğu. |
| [obsidian.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/obsidian.md:1) | Eksik from[]/backlink gibi bazı karşılaştırmalar aynı raporun diğer bölümleri veya güncel Core ile çelişiyor. | Backlink query ile dev indeksin tamamını okutmayı ayır; yararlı/yararsız kullanım koşullarını ikisini de yaz. |

[docs/inceleme/_SENTEZ.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/_SENTEZ.md:1) kaynak envanteri olmakla karar/üstünlük iddiasını ayırmalı. Bir fikrin yüksek güvenli kaynak etiketi, onun bütün türev önerilerinin ölçüldüğü anlamına gelmez. Sentezde fark edilen çelişki README ve eski araştırmada düzeltilmezse yanlış sonuç yayılmaya devam eder. [docs/inceleme/_OLCUM-graphify.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/_OLCUM-graphify.md:128) içindeki “HEAD kontrol edilse bayatlık yakalanırdı” açıklaması da commit yapılmayan mutasyonu çözmez.

Güncel resmi belge kontrolü: Claude Code MCP araçlarını ertelenmiş keşifle yükleyebilir; bütün şemaların her istekte peşinen taşındığı iddiası evrensel değildir. Karşılaştırma kullanılan mod/sürümü söylemeli. [Claude Code MCP](https://code.claude.com/docs/en/mcp). CodeQL özel depolar için her koşulda yasak/erişilemez değildir; uygun organizasyon ve GitHub Code Security lisansı durumu ayrılmalıdır. [GitHub CodeQL CLI](https://docs.github.com/en/code-security/concepts/code-scanning/codeql/codeql-cli).

### Önceki 10 rapor/kanıt dosyası

| Dosya | Düzeltme veya sınır |
|---|---|
| [2026-09-03-vidshrink-denetim.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/raporlar/2026-09-03-vidshrink-denetim.md:1) | Önceki incelemem; yararlı ama tam proje satır taraması değildi. O sırada değişen kaynak/test çıktılarıyla sınırlıydı. Eski 'düzeltildi' ifadeleri bu raporun güncel karşı örnekleriyle daraltılmalı. |
| [2026-09-03-claude-vidshrink-prompt.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/raporlar/2026-09-03-claude-vidshrink-prompt.md:1) | Eski prompt yeni 12 karşı örneği kapsamıyor; bu raporun yeni prompt’u mevcut durum ve kabul testlerini tamamlar. |
| [2026-09-03-vidshrink-kanit.json](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/raporlar/2026-09-03-vidshrink-kanit.json:1) | Zaman/hash’li güçlü ham özet; bir oturum ailesiyle sınırlı ve bugünün canlı envanteri değil. 66 done dosyada status submitted olduğu ayrıca hesaplandı. |
| [denetci-maliyet-analizi.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/raporlar/denetci-maliyet-analizi.md:1) | G50: auditorRunId≠bağımsız denetim; model fiyatı, olay/kontrat paydası ve açıklanmamış alt toplamlar düzeltilmeli. |
| [ek-72-ek-tur-sinif-atamasi.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/raporlar/ek-72-ek-tur-sinif-atamasi.md:1) | Atama tablosu değerli; sınıflandırma belirsizliğini ve çakışan kök sebepleri gizlememeli. Tekrarların tamamı boşa harcama değildir. |
| [rele-israfi-124-sozlesmelik-olcum.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/raporlar/rele-israfi-124-sozlesmelik-olcum.md:1) | 17/72 yaklaşık %24 iken 'çoğu' denemez. Ürün hatası ile süreç hatasının önlenebilirliğini kategorik ayırma; ilk yakalama bazı sonrakileri önleyebilir. |
| [rele-surec-kusurlari-127-sozlesmelik-olcum.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/raporlar/rele-surec-kusurlari-127-sozlesmelik-olcum.md:1) | G51: 18 tur/18 aynı sözleşme ayrımı, sürüm/örneklem ve set hesabı. Tekrar geçişinden kesin kök neden çıkarmama. |
| [vidshrink-core-onerileri.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/raporlar/vidshrink-core-onerileri.md:1) | G53: Base/Core, host/Core redleri, kanıt eksikliği ve gerçekten çalışmama ayrılmalı. Zayıflatılmış runner bayrağı yeni yanlış kapanış üretmemeli. |
| [vidshrink-tasnif.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/raporlar/vidshrink-tasnif.md:1) | G52: tek root helper’ıyla bütün çağrı zinciri düzelmiş sayılmaz; kabul maddelerine tekrar dönülmeli. |
| [yetki-bosluklari.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/raporlar/yetki-bosluklari.md:1) | G54: izin faydasızlığı genellemesi ve ignored/worktree temizleme güveni daraltılmalı. |

## 8. “0 continuous token” ve maliyet analizi

### Doğru olan, olmayan

Doğru: Yerel Node kodunun arka planda hesap yapması kendi başına LLM çağrısı oluşturmaz. Sessiz hook yolu ve yalnız kullanıcıya gösterilen UI çıktısı model bağlamına eklenmiyorsa doğrudan model token maliyeti sıfır olabilir. Bu önemli bir tasarım avantajıdır.

Yanlış genelleme: Plugin’in tüm kullanımının veya her turunun sıfır token olduğu. Rol/skill okumaları, modelin ürettiği araç çağrıları, modele dönen CLI sonuçları, bazı red mesajları, OWED ve tekrarlar ücretli bağlam/çıktı yaratır. Handoff’un diske yazımı yereldir; model tarafından okunması başka şeydir. Update ağ isteği de model tokeni olmadan ağ maliyeti doğurur.

Somut karşı örnek: [core/hooks/cue.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/hooks/cue.js:20) açık borçta UserPromptSubmit stdout üretiyor. Bu olayın düz metin stdout’u bağlama eklenir. PreToolUse çıktılarının etkisi olay/çıkış biçimine bağlıdır; “her red sıfır context” veya “her stdout context” gibi iki uç genelleme de yapılmamalı. [Resmi hook çıktı kuralları](https://code.claude.com/docs/en/hooks).

Bir kez eklenen b token, compaction olmadan n istekte tutulursa toplam b×n input taşır. Her tur tekrar eklenip eskileri de kalırsa teorik toplam b×n×(n+1)/2 olur. Bunlar **context taşıma üst senaryolarıdır**, fatura veya ölçülmüş tüketim değil; caching/compaction ayrıca değerlendirilir.

### API eşdeğeri; Max faturası değil

Resmi standart/global tarifeyi yeniden kontrol ettim. Aşağıdaki değerler milyon token başına USD; 5 dakika ve 1 saat cache yazımı ile cache okuması ayrı fiyatlanır. Sonnet 5’in 2/10 fiyatının 1 Eylül’de 3/15’e çıkacağı eski plan uygulanmamış; resmi sayfa 2/10’u standart fiyat gösteriyor. [Resmi fiyatlandırma](https://platform.claude.com/docs/en/about-claude/pricing).

| Model | Input | 5 dk cache write | 1 saat cache write | Cache read | Output |
|---|---:|---:|---:|---:|---:|
| Opus 5 | 5 | 6,25 | 10 | 0,50 | 25 |
| Sonnet 5 | 2 | 2,50 | 4 | 0,20 | 10 |
| Fable 5 | 10 | 12,50 | 20 | 1 | 50 |
| Fable 5.1 | 10 | 12,50 | 20 | 0,25 | 50 |
| Haiku 4.5 | 1 | 1,25 | 2 | 0,10 | 5 |

Eski ham kanıtın kullanım sayaçlarından aynı formülle tekrar hesap:

| Model | API eşdeğeri USD |
|---|---:|
| claude-opus-5 | 3154.978111 |
| claude-fable-5 | 45.976760 |
| claude-sonnet-5 | 81.981980 |
| claude-fable-5-1 | 0.956010 |
| claude-haiku-4-5-20251001 | 0.128599 |
| **Toplam** | **3284.02145975** |

Opus payı **%96,07**. Formül: `(input×inputRate + write5m×write5mRate + write1h×write1hRate + cacheRead×readRate + output×outputRate)/1e6`. Yuvarlama sadece gösterimde; tam sayaçlar önceki kanıt JSON’unda, tarife ve hesap bu raporun kanıt JSON’unda.

**$3284,02 bir Max faturası, plugin’in tek başına neden olduğu zarar veya hesapta düşülen para değildir.** Bir ana oturum ailesinin ürün işi, araştırma, koordinasyon ve tekrarlarının standart API karşılığıdır. Gerçek Max kota kullanımını bu sayıdan dönüştüremem. Abonelik ve token maliyet göstergesi farklı ölçülerdir. [Claude Code maliyet/abonelik ayrımı](https://code.claude.com/docs/en/costs).

### Ne kadarı kurtarılabilirdi?

Aynı token dağılımı ve aynı başarı kalitesi varsayımında Opus 5→Sonnet 5 tarifesi bu beş token türünde %60 ucuzdur. Ama Sonnet daha çok tekrar/bağlam gerektirirse net avantaj küçülür; yanlış kapanışın sonraki maliyeti ayrıca eklenir.

Yalnız bir duyarlılık hesabı: Opus maliyetinin %25’i aynı kalitede Sonnet’e taşınabilse tüm oturum maliyetinde yaklaşık **%14,41**; %50’si taşınabilse **%28,82** azalma olur. Bunlar ölçülmüş taşınabilir pay değil, varsayımdır. Gereksiz tekrarların kaldırılması ek tasarruf sağlayabilir; aynı maliyeti hem model taşıma hem tekrar silme olarak iki kez saymamak gerekir.

Dolayısıyla “%25 kurtarılabilirdi” **makul bir test hipotezi**, kanıtlanmış oran değil. Proje gerçekten Max kotasının %50’sini tükettiyse, proje tüketiminin %25’ini kurtarmak **12,5 kota puanı** demektir; üyeliğin **25 puanını** kurtarmak ise proje tüketiminin yarısını önlemek demektir. Mevcut kayıtlar bu kota dönüşümünü ispatlamıyor.

Güvenilir ölçü: **başarıyla ve doğru kabul edilmiş iş başına toplam maliyet**. Buna model/cache, tekrar, denetçi/danışman, false-block, false-pass ve sonradan çıkan düzeltme maliyeti dahil edilmeli. Ucuz ama yanlış mühür, pahalı ama doğru ilk çözümden daha kötü olabilir.

## 9. Claude’a uygulanacak düzeltme sırası

Ayrıntılı, kopyalanabilir talimat [Claude düzeltme planında](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/raporlar/2026-09-04-claude-duzeltme-plani.md). Bu yalnız yarın için plan; bu tur başlatılmadı.

1. **Güvenilir kabul:** G01–G11. Doğru checkout, audit/kanıt bağı, verify sonrası doğrulama, atomic closure, unmet ve yazı kapsamı. Önce mevcut kırmızı fixture’lar.
2. **Deneme ve model maliyeti:** G12–G23, G27–G30. Tek karar kaynağı, gerçek dispatch modeli, iki hata sonrası üçüncü öncesi Fable, kalıcı attempt sayacı ve dirty graph.
3. **Kanıt/veri koruma ve ürünleşme:** G24–G26, G32–G41. Borç geçmişi, güvenli log arşivi, kurulum/release ve read-only health.
4. **Deney ve iddia temizliği:** G42–G60. Özgün negatif kabul, rapor birimleri/kümeleri, dürüst maliyet anlatısı, kapalı logların yeniden sınıflandırılması.
5. **Ancak sonra küçük bütçeli pilot.** Gerçek host payload’ları ve özgün .NET olayı dahil; model A/B bütçesi kullanıcı tarafından seçilmeden pahalı geniş bench yok.

Başarı ölçüsü “60 maddeden kaçına kod ekledik” değil: ilgili invariant gerçekten sağlanıyor mu, eski karşı örnek kapanıyor mu ve komşu meşru akış korunuyor mu? Bu yüzden geniş bir yeniden yazım önermek yerine küçük, kanıtlı düzeltme partileri öneriyorum.

## 10. Teslim ve kalan sınır

Bu incelemenin okuma/eleştiri kısmı tanımlı Core kapsamında tamamlandı; **ürünün bütün hatalarının düzeltildiği söylenmiyor**. Satır taraması %100 olabilir, davranış doğruluğu %100 diye çıkarılamaz. Eski Base arşivi, gerçek host/ses/görsel doğrulama ve ücretli model benchmark’ı ayrı kalan kapsamdır.

Kullanıcının isteği gereği burada durulacak. Yeni task açılmadı, otomasyon kurulmadı, yeni ajan/model araştırması başlatılmadı; yarın devam edilirse öncelik yeni özellik değil kırmızı güven testleridir.
