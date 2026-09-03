# VidShrink / Teknesyum-Core: denetim, model seçimi ve maliyet incelemesi

Tarih: 3 Eylül 2026. Kaynak tabanı: `b244b35`; bu rapora eşlik eden değişiklikler çalışma ağacındadır, yayımlanmış sürüm değildir.

## 1. Kısa hüküm

Sorun yalnızca Claude'un raporu dikkatsiz okuması değil. Kuralların karar anına bağlanmaması, eski Base rol yollarıyla yeni Core'un birlikte kullanılması, modelin üst ajandan miras alınması, zayıf denetçi kimliği ve gerçekte kapanmamış hata kayıtlarının kapalı sayılması birleşmiş.

Eleştirin özünde haklı: bu sistem işin maliyetini denetlediğini ve aynı hatanın tekrarını önlediğini iddia ettiği ölçüde bunu yapmıyordu. Bununla birlikte üç iddiayı düzeltmek gerekiyor:

- **“Bir sözleşme 18 kere koştu” kanıtlanmış değil.** Eski rapor, farklı sözleşmelerde üçüncü/dördüncü turlara ait 18 kuyruk turunu ve ayrıca manşet kaymasının çok sayıda sözleşmede tekrarlanmasını anlatıyor. Bu iki ölçü aynı değil.
- **“Fable hiç kullanılmadı” yanlış.** Gerçek çağrılar ve kullanım kayıtları var. Doğru soru: gerekli sözleşmeye, gerekli turdan önce, gerçekten Fable'a danışıldı mı? Bunun garantisi yoktu.
- **“Üyeliğin %25'i kesin kurtarılabilirdi” henüz ölçülmüş değil.** Ciddi tasarruf adayı var; fakat sözleşme sayısı, token sayısı, API fiyatı ve Max kotası aynı birim değil.

Kaynakta çok sayıda somut kusur düzeltildi. Buna rağmen bütün proje/kurulu plugin/gerçek iş akışı için “tamamen sorunsuz” onayı **verilmiyor**. Özellikle worktree durum birliği, kabuk üzerinden geçilen denetim sınırı ve kabul ölçülerinin anlamsal yeterliliği açık risklerdir.

## 2. Kanıtın kapsamı ve sınırları

İncelenenler: Core'un yönlendirme, sözleşme, kanca, risk, mühür, danışma, maliyet belgesi ve test yolları; VidShrink relay raporları ve sözleşme başlıkları; 16 kapalı log; ana Claude JSONL oturumu ve onun `subagents/` klasöründeki 411 JSONL dosyası.

Bu, depodaki bütün tarihsel Base kopyalarının, her SVG/lisans satırının ve VidShrink ürün kodunun tamamının satır satır doğrulandığı anlamına **gelmez**. Böyle bir iddia, bu denetimde eleştirdiğimiz kanıtsız kapanış hatasını tekrarlar. Kritik çalışma yolları için satır/fonksiyon düzeyinde inceleme ve tekrarlanabilir test yapıldı; kalan alanlar aşağıda açıkça ayrıldı.

İlk incelemede kaynak `dc45ffa` idi. Devam ederken çalışma ağacı temiz fakat HEAD `b244b35` olmuştu: `2e6025f`, `e3a5e80`, `7397382`, `d691cc4`, `b244b35` başka çalışma tarafından eklenmişti. Onları kendi düzeltmem gibi saymadım; üzerlerine regresyonlar kurdum.

Rapor hazırlanırken dışarıdan `map.js:fanIn`, model yükseltme (`raise/why`) yolları, statusline/çeviri değişiklikleri, bunların testleri ve `docs/raporlar/vidshrink-core-onerileri.md` de çalışma ağacına geldi. Bu değişiklikler korundu, benim düzeltme sayısına eklenmedi. Satır numaraları bu yüzden kayabilir; fonksiyon adları esas alınmalıdır. Son test için `core/` ve `test/` dosyalarının önce/sonra SHA-256 özeti ayrıca alınır.

Veri anlık görüntüsü: **2026-09-03 19:44:51 UTC / 22:44:51 İstanbul**.

- Ana dosya: `C:/Users/Administrator/.claude/projects/C--Users-Administrator-Desktop-Projeler-vidshrink/6f1bfe85-7b86-48a4-822d-65f08e432e7f.jsonl`
- Boyut: 74.069.747 bayt.
- SHA-256: `de63afde0c02b8827b50094b7423c4ad0ab28d2cbb7692d6d07a3bb7343bde54`.
- Ayrıştırılamayan ana JSONL satırı: 0. Dosyalar arasında aynı request kimliği: 0.
- Aynı API isteğinin tekrar eden içerik blokları toplanmadı. `requestId`, yoksa mesaj kimliği ile tekilleştirildi; parçalı kullanım bildirimlerinde sayaçların en büyüğü alındı.
- Ana oturum hâlâ ilerliyordu: önceki ölçüm ile bu rapordaki Sonnet sayısının değişmesi bundan. Sabit kanıt dosyası yeniden çalıştırılan betiğin bugünkü sonucuyla karıştırılmamalı.

Tekrar üretme aracı: `tools/audit-evidence.js`. Ham konuşma/prompt/yanıtlar rapora kopyalanmadı. Toplulaştırılmış kanıt ve sözleşme başlıkları: [2026-09-03-vidshrink-kanit.json](2026-09-03-vidshrink-kanit.json).

## 3. Neden sürekli Opus çağrıldı?

### 3.1 Gerçek çağrı izi

Ana oturumdaki 407 benzersiz Agent/Task çağrısının 405'i bir çözümlenmiş model sonucu ile eşleşti:

| Gönderilen model alanı | Çözümlenen model | Çağrı |
|---|---|---:|
| opus | Opus 5 | 199 |
| boş | Opus 5 | 179 |
| fable | Fable 5 | 9 |
| boş | Fable 5 | 4 |
| sonnet | Sonnet 5 | 10 |
| boş | Sonnet 5 | 2 |
| haiku | Haiku 4.5 | 1 |
| fable | Fable 5.1 | 1 |
| opus / tam Fable kimliği | sonuçla eşleşmedi | 2 |

Eşleşen 405 çağrının **378'i Opus**. Bunun **179'unda model alanı boş**. Bu sayılar ana oturumun doğrudan çağrılarıdır; 411 alt-ajan dosyasının sayısıyla aynı payda değildir.

150 çağrı isteminde eski `agents/builder.md`, `agents/auditor.md` veya `agents/advisor.md` yolu var. Bazı yeni Core `worker` çağrıları, `.../teknesyum/2.67.0/agents/...` Base rolünü okutuyor. Böyle bir karma kurulumda “Core rolünün kuralı vardı” demek, çalışana o kuralın gittiğini ispatlamaz.

Claude Code'da çağrı parametresi, ajan tanımı ve ortam ayarıyla model seçilebilir; bunlar yoksa ana modelin miras alınabildiği resmî olarak belgelenmiş. Dolayısıyla boş alan Sonnet seçimi değildir. [Model çözümleme sırası](https://code.claude.com/docs/en/sub-agents#choose-a-model).

### 3.2 Sözleşme tarafı

VidShrink kök relay görüntüsü: 154 `done`, 2 doğrudan açık, 1 `beklemede`; toplam 157 dosya. Kök checkout ile T0 worktree aynı çalışma görünümü değildir.

- Bitenlerin model başlıkları: 116 Opus, 37 Sonnet, 1 Fable.
- Opus başlıklı, risk alanı boş, turu 0 veya 1 olan 66 sözleşme ucuz-ilk-deneme incelemesine aday.
- **Risk alanının boşluğu düşük risk kanıtı değildir.** Bu 66 dosyanın tümünün hatalı Opus kullanımı olduğu iddia edilmiyor; diff ve kabul ölçüsüyle yeniden sınıflandırılmalı.
- `T2b`, `T2c` tarihsel dosyaları sayıya dahil. Core'un yalnız harf+rakam kabul eden ID regex'i bunları listelerken dışarıda bırakabiliyor.

### 3.3 Kök neden

1. Eski premium builder hücresi Opus'u varsayılan yapıyordu; `2e6025f` bunu Sonnet'e indirmiş.
2. Tabloya bakmak tek başına çağrıyı değiştirmez. `7397382` bir ön-denetim eklemiş; ancak boş modeli ve eski rol yolunu atlıyordu. En büyük gerçek kaçış yollarından biri korunmamıştı.
3. `worker` genel bir tip; varsayılan rol/model güvenliği yok. Prompt eski Base dosyasına gidebiliyor.
4. Auditor hücresi hâlâ premium/normal profilde Opus. Salt ölçüm ve basit belge denetimlerini auditor diye paketlemek ucuz builder politikasını etkisizleştirir.
5. Ana T0 bağlamı çok büyüyor; her küçük koordinasyon adımı pahalı modelde ve büyük geçmişle işleniyor. Salt ajan sayısını düşürmek yeterli değil.
6. `overModel()` kapanışta yalnız problem kaydı bırakıyor. O aşamada ücret zaten harcanmış oluyor.

Bu turda bilinen Core rolünde boş model reddediliyor; eski rol dizini de tanınıyor. Ebeveyn ajan türü yerine çağrılan çocuğun tipi kullanılıyor. Bilinmeyen rol, doğrudan T0 çalışması, kurulu kancanın devre dışı olması ve harici model zorlamaları için tüm sistemi kapsayan bütçe garantisi henüz yok.

## 4. Fable neden gereken yerde çalışmadı?

Eski 131 sözleşmelik raporun kendi düzeltmesi zaten advisor kullanımını kaydediyor: T3/T63/T126'nın dördüncü turlarında iz var; T28 dördüncü turunda yok. Ayrıca daha erken turlarda danışmalar var. “Hiç olmadı” cümlesi raporun tamamıyla çelişiyor.

Ama “advisor açıldı” ile “Fable danışıldı” eşdeğer değil: ham çağrılarda Opus olarak gönderilmiş advisor da var. T96'nın `model: fable, role: builder` başlığı danışmanlık kanıtı sayılmaz.

Somut açıklar:

- `tiers.json` üçüncü değil dördüncü turda danışma istiyordu; `reopen()` üçüncü tur diyordu. Tek politikanın iki farklı eşiği vardı.
- `roleRecord()` yalnız `role: advisor` kontrol ediyordu. Model, sözleşme, tur ve bitiş doğrulanmıyordu.
- `watch.record()` Agent çağrısındaki çocuk rolünü ebeveynin live kaydına yazabiliyordu. T0, yalnız denetçi çağırdığı için denetçi gibi görünüyordu.
- `advice.close()` model eşleşmezse ilk bekleyen kaydı seçiyordu. Tamamen ilgisiz ajanın cevabı danışma yanıtı yapılabiliyordu.
- `live/` worktree'ler arasında parçalanıyor; eksik kayıt bazen “ajan hiç koşmadı”, bazen “yanlış dizine bakıldı” demek. Bunları ayırmadan yeniden pahalı denetim açılmış.

Yapılan düzeltmeler: eşik tek kaynaktan 3; `reopen` için tamamlanmış, ilgili sözleşme/önceki tura bağlı, çözümlenmiş Fable modeli gerekiyor. Hostun Agent sonucundan çocuk kimliği ve gerçek model ayrı kaydediliyor. Danışma cevabı `tool_use_id → agentId` bağlantısıyla eşleştiriliyor; kimlik yoksa bekliyor, rastgele cevapla kapanmıyor. Normal profilde opsiyonel danışma kapalı olsa bile zorunlu üçüncü tur öncesi Fable yolu açık tutuluyor.

Sınır: elle `round` değiştirerek ilerleme, shell ile kanıt dosyası yazma, eski kayıtların taşınması gibi yollar bütünüyle kapatılmış değil. Bu yama doğrulanmış `reopen` yolunu güçlendirir; tüm olası durum geçişleri için formel güvence vermez.

## 5. Denetim neden aynı kusuru kaçırdı?

Denetim, kabul sözleşmesinin doğruluğunu değil çok defa mevcut testlerin yeşilliğini ve rol metninin bulunmasını denetliyor. Dört katmanı ayırmak gerekiyor:

| Katman | Gerçekte neyi ispatlar? | Neyi ispatlamaz? |
|---|---|---|
| exit 0 | komut başarılı döndü | test toplandı / tam koştu / doğru şeyi test etti |
| test sayısı | belirli sayıda vaka yürüdü | kabul listesi kendini doğrulamıyor |
| audit JSON + hash | belirtilen dosya/HEAD için kayıt var | bağımsız kişinin gerçekten incelediği |
| kapalı log | arşivleme yapıldı | eski kusur düzeltme sonrası yeniden sınandı |

T84'teki kabul listesinin ölçülen taşmalardan üretilmesi, filtrelenmiş kümeye aynı koşulu tekrar doğrulatma ve sabit aritmetik assertion'ları tam bu ayrımı gösteriyor. `Assert` silinmedi diye bakmak anlamsal bir kabul denetimi değil.

“Kritik değilse yeni tur açma” kuralının mekanik karşılığı yalnız 20 karakterlik `--critical` açıklaması. Bu, ciddiyet sınıflandırması değil, alanın boş olmaması. Daha uzun açıklama istemek bu açığı çözmez. Hatanın tekrar üretimi, beklenen/gerçek farkı, etkilenen kabul maddesi ve yeni turun kapsamı birlikte kaydedilmeli.

Manşet kayması için `manset.js` yararlı ama sınırlı: yakındaki tablo/listeler ve sayısal eşleşmeler. Nedensellik, payda değişimi, yanlış tablo sütunu, birim ve raporun başka bölümündeki çelişkiyi genel olarak doğrulayamaz. Bu turda ondalık ayracı silerek `1,2`yi `12`ye eşitleme ve bildirimsiz %5 toplam toleransı düzeltildi. Araç hâlâ anlamsal denetçinin yerine geçmez.

## 6. Amaç–uygulama karşılaştırması ve Claude'a somut eleştiri

Aşağıdaki yerler `core/` altındaki dosyalar ve belirtilen fonksiyonlardır. Öncelik P1: veri/kanıt bütünlüğü veya büyük tekrar maliyeti; P2: davranış/doğruluk; P3: belge/operasyon. “Düzeltildi” kaynak ve belirtilen test kapsamındadır.

1. **P1 — `hooks/watch.js:dispatch`: boş model kontrol dışı.** Gerçek çağrıların önemli kısmı böyle Opus miras alıyor. Modeli karar öncesinde zorunlu kıl; yanlış örnekleri test et. **Düzeltildi.**
2. **P1 — `watch.js:roleOf/record`: çağıran ile çağrılanın kimliği karışıyor.** Başkasını denetçi çağırmak seni denetçi yapmaz. Host child-ID sonucunu ayrı kaydet. **Düzeltildi; gerçek istemci entegrasyon testi ayrıca gerekli.**
3. **P1 — `scripts/contract.js:secondOpinion`, `tiers.json:98`: advisor eşiği ve kimliği yetersiz.** Üçüncü tur, Fable, ilgili iş/tur, tamamlanmış yanıt birlikte doğrulanmalı. **Reopen yolu düzeltildi.**
4. **P1 — `scripts/advice.js:close`: sıra/model ile yanlış cevap bağlama.** Aynı anda iki iş varken ilk biten ilk sorunun cevabı değildir. **Kimlik bağı eklendi; belirsizlikte kapanmaz.**
5. **P1 — `contract.js:runVerify`: zaman aşımından sonra ölmüş shell PID'sini temizleme.** Çocukları kökü kaybetmeden sonlandır. **Yeni `verify-runner.js` ile düzeltildi; eski/yeni Windows düzeneğinde doğrulandı.**
6. **P1 — `contract.js:takeLock`: read–write yarışı ve yazma hatasında açık devam.** Kilit edinimi atomik olmalı, edinilemiyorsa verify başlamamalı. **Atomik `.held` dizini eklendi.** Çöken sahibin kilidi kendiliğinden silinmez; PID doğrulamalı açık kurtarma gerekir.
7. **P1 — `contract.js:precheck/check`: aynı pahalı verify için kilidi atlayan alternatifler.** **Aynı kilit bu yollara da eklendi.** Dışarıdan doğrudan `dotnet test` hâlâ bu kilide tabi değil.
8. **P1 — `contract.js:runVerify`: sıfır-test uyarısı yalnız son 12 satırda aranıyor.** Sonda temizlik logu varsa boş koşu geçer. **Tüm yakalanan çıktı kontrol ediliyor; precheck de bunu başarı saymıyor.**
9. **P1 — `hooks/guard.js:hatchOpen`: kayıt defteri temizliği eski sürecin ortamını temizlemez.** İnceleme sırasında User kayıt silindi ama mevcut host hâlâ `1` taşıyordu; dört test tekrar düştü. **Miras alınan değer artık izin değil; yalnız tek komuttaki açık Bash öneki istisna.** Force push için istisna yok.
10. **P2 — `contract.js:complete`: düşük riskte var olan audit yok sayılıyor.** Bu, sonraki raporu ve muhasebeyi yanlış yapıyor. **Mevcut geçerli kayıt kontrol edilip tüketiliyor; bozuk varsa sessiz geçilmiyor.**
11. **P2 — `seal.js:auditDone`: stale/reopened defter satırını mühür sanma.** **Legitim kapanış/benimsenmiş eski kayıt ile diğer olaylar ayrıldı.** Eski `adopted` kayıt hâlâ geriye dönük bağımsız denetim kanıtı değildir.
12. **P2 — `risk.js:HIGH_PATHS`: `\*\.csproj` gerçek proje adını eşleştirmiyor.** **Düzeltildi; `Video.csproj` testi var.**
13. **P2 — `contract.js:orphans`: namespace/type dillerinde dosya adına import arayıp çöp önermek.** PlanCalculator gibi çalışan C# sınıfı böyle bulunamaz. **Desteklenmeyen diller atlanıyor; diğer sonuçlar “sezgisel” ve taşıma öncesi kontrol uyarısıyla veriliyor.**
14. **P2 — `watch.js:halt`, `contract.js:blockedBy`: `depends` ve `blocked-by` farklı dünyalar.** **İki yazım da tanınıyor; bağımlılığı bitmeyen açık iş dağıtılacakmış gibi Stop'a takılmıyor.** Geçersiz/okunamayan bağımlılık kimlikleri için şema daha da sertleşmeli.
15. **P2 — `manset.js:canon/columnSums/rounded`: sayı büyüklüğü ve toplam toleransı.** **Ondalık büyüklüğü korunuyor, total satırı tekrar toplanmıyor, gizli %5 tolerans kaldırıldı.** Binlik/ondalık yerel gösterimler açık bir veri şemasıyla çözülmeli.
16. **P1 — `lib.js:relayRoot/liveDir`: worktree'lerde durumun tek sahibi yok.** **Açık.** Sözleşme dosyaları worktree'ye özel olabilir; çalışma/kimlik defteri ortak ve merkezi olmalı. Koordinatör kökü açıkça ayarlanmalı; “en yakındaki relay” sessiz otorite olmamalı.
17. **P1 — `seal.js:checkAuditor`: salt okunur olma yalnız Write/Edit kayıtlarıyla ölçülüyor.** Bash/PowerShell yazıları görünmeyebilir; audit kayıtları da shell'den değiştirilebilir. **Açık.** Gerçek salt-okuma yetkisi, dosya snapshot karşılaştırması ve audit-run → contract/head bağı gerekir. Başlık kontrolü güvenlik sınırı değildir.
18. **P1 — `guard.js:protectedWork/words/pushTarget`: kabuk/Git grameri eksik.** **Açık.** `git -C <yol>`, alıntılı yollar, birden fazla refspec, wrapper komutları ve shell yazıları için AST/gerçek Git hedefi çözümü veya git-native koruma gerekir. Salt regex ile “her komut korunuyor” denmemeli.
19. **P1 — `lib.js:lock`: genel JSON merge kilidi alınamazsa fonksiyon yine çağrılıyor.** **Açık.** Bu turdaki verify kilidi düzeltmesi bu ayrı yardımcıyı düzeltmez. Live/izin/danışma kayıtlarında kayıp güncelleme riski devam ediyor.
20. **P2 — `watch.js:closeAll/sweep`: bir oturum kapanınca başka oturumun ajanlarını bitmiş işaretleme; 24 saat sonra denetim kanıtını silme.** **Açık.** sessionId bazında kapanış, biten kayıt arşivi ve denetim referanslarının saklanması gerekir.
21. **P2 — `contract.js:overDispatch/tallyFails`: başka ajanın hata sayısı model yükseltebiliyor; “aynı imza” gerçekten ölçülmüyor.** **Açık.** Başarısızlık imzası + sözleşme + ajan bazlı sayaç gerekir. İki ilgisiz tool hatası “Sonnet başarısız” değildir.
22. **P2 — `contract.js:complete`: ucuz statik uygunluk denetimlerinin bir kısmı pahalı verify'dan sonra.** **Açık.** HEAD/round/audit varlığı kontrolü önce, kanıtın verify sonrası geçerlilik kontrolü sonra yapılmalı. Yokluğu baştan bilinen audit için bütün süiti koşturma.
23. **P2 — `schema.js:isContractName`: T2b/T2c kayıpları; ayrı beklemede klasörü görünmezliği.** **Açık.** Geçmiş ID'ler için uyumluluk/migrasyon ve bütün durumlar için tek katalog gerekir. Sayım raporlarında eksik paydayı “yaklaşık” diye saklama.
24. **P2 — `runVerify`: sıfır-test kontrolü tam kabul yeterliliği değil.** **Açık.** Beklenen test sayısı/filtre kimliği, test raporunun tamamlandığı işareti ve en az bir hedefli mutation/negatif kontrol gerekir.
25. **P2 — `roles/auditor.md`, test tasarımı: totoloji maddesini role yazmak kusuru kapatmaz.** **Açık.** Logdaki üç sahte test örneğinin üçünü de bozan bir kontrolü çalıştırıp kanıtla. “Talimat güçlendi” ile “hatanın tekrarı engellendi” ayrı durum olsun.
26. **P2 — sürüm/rol provenansı yok.** **Açık.** Her koşu plugin path+version+hash, role path+hash, requested/resolved model, contract, round, HEAD, worktree, request/agent kimliği taşımalı. Eski cache ile yeni kaynak karşılaştırmasını bundan sonra otomatik yakala.
27. **P3 — maliyet iddiası farklı mekanizmaları tek “Z” sınıfında birleştiriyor.** **COST-MODEL düzeltildi.** Kalan README/ekosistem/sunum iddiaları olay+sürüm+A/B kanıtına göre daraltılmalı.
28. **P2 — eşzamanlı eklenen `map.js:fanIn` / `contract.js:tier` yükseltmeleri.** **Yeni değişiklik, yalnız kaynak incelemesi.** Harita şema sürümünün doğru olması güncel HEAD'e ait olduğunu göstermez. Ayrıca `raise: opus` + serbest `why` alanı planlayıcının kimliğini/yetkisini doğrulamaz. Bunları maliyet kapısının yeni kaçışına çevirmemek için güncellik ve karar provenansı gerekir; bu çalışma bu yeni politikanın tamamını onaylamıyor.

## 7. Kapalı loglar gerçekten kapanmış mı?

Klasör adı bir test sonucu değildir. 16 kaydın yeniden değerlendirmesi:

| Kapalı kaydın kısa adı | Bu incelemedeki hüküm |
|---|---|
| contract-js verify testhost'u öldürmüyor | Eski kapanış yeterli değildi; eski mekanizma yeniden bozuldu. Yeni supervisor küçük Windows süreç ağacında geçti. Gerçek dotnet kabulü ayrıca gerekli. |
| spawnSync timeout süreç ağacını öldürmüyor | Aynı kök kusurun ikinci kaydı; bağımsız iki çözüm gibi sayılmamalı. |
| zaman aşan verify zombi testhost bırakıyor | Aynı ailenin belirti kaydı; “artık testhost kalmaz” eski kanıttan çıkmıyordu. |
| Core kendi deposunu bulamıyor / spool | setup/log/doctor karşılığı var; kaynak düzeyinde uygulanmış. Bütün kurulumların güncelliği kanıtlanmadı. |
| plan konseyi dosya adına bağlı | Rol/skill metni değişmiş. İstenen gerçek plan senaryosu tekrarının kanıtı yok; davranışsal olarak açık. |
| başsız Avalonia konak çökmesi | “Core kaydı değil” diye arşivlenmiş; ürün hatası çözüldü demek değil. Üstelik eksik test koşusunu kabul etmeme kısmı Core'un sorumluluğunda. |
| T0 sabit/kendini dolduran testi göremiyor | Denetçi talimatına yazılmış; kayıt denetçi koşmadan üç örneğin yakalanmasını istiyor. Kapanış kabul ölçüsünü karşılamıyor. |
| T0 soru sorup projeyi durdurdu | Stop engeli var; istenen on ardışık gerçek tur ve bütün kullanıcı beklentilerinin doğru bölümde olması kanıtlanmamış. |
| T0 sonraki direktifi vermeden kapatıyor | Açık iş kontrolü var; teslim sonucu + sonraki işin gerçekten ajana iletildiğini kanıtlamıyor. |
| trash disiplini ölçülmüyor | Bir sezgisel liste uygulanmış. Paket kapanışı/ignored birikinti tam çözülmemiş; C# yanlış uyarısı bu tur düzeltildi. |
| guard komut metnine takılıyor | Dosyada hâlâ `Durum: açık`, olay/ölçü yerleri şablon. Closed klasöründe olması yanlış durum sinyali. |
| imza bloğu yeni projeye gelmiyor | scaffold/prefs karşılığı var. İstenen beş eski projeye aktarımın tamamlandığına bu kod tek başına kanıt değil. |
| kullanıcıya doğrulanmamış silme komutu | Altı kabul koşulu yerine iki genel kural yazılarak kapatılmış. Mutlak yol ve gerçek kabukta çalışma kanıtı eksik. |
| paralel ajanlar aynı Git indeksini paylaştı | Yalıtım talimatı güncellenmiş. Commit'in owns dışına taşmasını önleyen mekanik kapı ve gerçek paralel tekrar yok. |
| shields rozetinde beyaz yazı | SVG tasarımı değiştirilmiş; yerel düzeltme var. Bütün projeler/iki tema için genel sertifika değil. |
| çift dilli README yöntemi | Hata değil yöntem kaydı; çözülmüş bug sayısına eklenmemeli. Başlık eşleşmesi çeviri eşdeğerliği de değildir. |

Önerilen durumlar: `reported`, `reproduced`, `patched`, `verified`, `transferred`, `accepted-risk`. Başka depoya taşınan kayıt `fixed` sayılmamalı. Kapanışta test komutu, sürüm/HEAD, negatif ve pozitif çıktı bulunmalı. Tarihsel logları silmedim veya geçmiş kanıtlarını yeniden yazmadım.

## 8. “0 continuous token” ve gerçek maliyet

### 8.1 İddianın doğru ve yanlış kısmı

`MessageDisplay` üzerinden ekranda gösterilen süsleme modelin gördüğü/stored mesajı değiştirmiyorsa o **süslemenin ilave model tokenı sıfırdır**. Bu mekanizma resmî belgede display-only olarak tanımlanıyor. Fakat metadata, yüklenen skill/rol, cue, hata/blok metni, araç sonucu ve yeniden yapılan iş sıfır değildir. [Hook olayları](https://code.claude.com/docs/en/hooks#messagedisplay).

`COST-MODEL.md` kendi içinde çelişiyordu: bir tabloda bazı `systemMessage` olayları ücretli, aşağıda her olay ücretsiz. Ayrıca “bağlam sonsuza kadar tekrar gider ve cache olmaz” genellemesi yanlıştı. Belge bu tur düzeltildi; sürüm ve olay bazında ölçüm şartı eklendi.

1500 token bir kez girip n istekte tutulursa 1500n input; her istekte yeniden eklenip eskiler de tutulursa 1500n(n+1)/2 input. Bunlar compaction olmaması varsayımıdır, dolar hesabı değil. Cache etkisi ayrıca hesaplanır.

### 8.2 Ölçülen kullanımın API eşdeğeri

Güncel standart/global fiyat senaryosu: Opus 5 input/output $5/$25; Sonnet 5 $2/$10; Fable 5 $10/$50 / milyon token. 5dk ve 1s cache yazımları ayrı, cache okumaları ayrı fiyatlandı; Fable 5.1 için belgelenen farklı okuma fiyatı kullanıldı. [Resmî fiyat tablosu, 3 Eylül 2026](https://platform.claude.com/docs/en/about-claude/pricing).

| Oturum grubu | Model | Benzersiz istek | API eşdeğeri USD |
|---|---|---:|---:|
| Ana oturum | Opus 5 | 5264 | 770,43 |
| Ana oturum | Fable 5 | 9 | 5,46 |
| Ana oturum | Sonnet 5 | 156 | 8,29 |
| Alt-ajanlar | Opus 5 | 24100 | 2384,55 |
| Alt-ajanlar | Fable 5 | 201 | 40,52 |
| Alt-ajanlar | Sonnet 5 | 1861 | 73,70 |
| Alt-ajanlar | Fable 5.1 | 6 | 0,96 |
| Alt-ajanlar | Haiku 4.5 | 8 | 0,13 |

Yuvarlanmamış toplam: **$3284,02145975**. Satırların iki ondalık yuvarlaması küçük toplam farkı yaratır. Opus payı yaklaşık **%96,07**.

Hesap: `(input×inputRate + write5m×rate5m + write1h×rate1h + cacheRead×readRate + output×outputRate) / 1.000.000`. Sentetik, sıfır kullanımlı kayıtlar ücret hesabına katılmadı.

Bu **fatura değildir**; bu **Max'ten $3284 düşüldü** demek değildir; tamamı plugin'in yol açtığı israf da değildir. Bir ana oturum ailesindeki ürün işi, koordinasyon, araştırma ve tekrarların toplamının standart API fiyatlarıyla karşılığıdır. Başka oturum aileleri dahil değildir. Fast mode/bölgesel fiyat gibi farklı ticari koşullar bu senaryoda yoktur. Max kotası ile API gösteriminin farklı olduğuna Claude Code maliyet belgesi de dikkat çeker. [Abonelik maliyeti ayrımı](https://code.claude.com/docs/en/costs).

### 8.3 %25 tasarruf mümkün mü?

Aynı token miktarı ve aynı başarı kalitesi varsayımıyla Opus 5 → Sonnet 5 birim maliyeti %60 düşürür. Ama Sonnet'in daha fazla denemesi/çıktısı gerekiyorsa net kazanç azalır. Bu oran doğrudan Max kota oranına çevrilemez.

`r` kaldırılabilir tekrarların maliyet payı, `q` tekrarlar çıkarıldıktan sonra Sonnet'e taşınabilecek işin maliyet payı olsun. Çifte saymadan senaryo tasarrufu: `1 - (1-r) × (1-0,60q)`.

| Varsayım | r | q | Senaryo tasarrufu |
|---|---:|---:|---:|
| Düşük taşıma, az tekrar | %10 | %25 | %23,5 |
| Orta taşıma | %15 | %40 | %35,4 |
| Yüksek taşıma | %20 | %50 | %44,0 |

Bunlar ölçülmüş tasarruf değil, deney tasarımına yardımcı senaryolardır. **Harcananın %25'ini** kurtarmak ile **üyeliğin 25 yüzde puanını** kurtarmak ayrı iddialar: proje gerçekten kotanın %50'sini tükettiyse, ilki 12,5 kota puanı, ikincisi proje tüketiminin yarısı demektir. Hangisinin mümkün olduğunu öğrenmek için aynı kabul kalitesinde eşlenmiş benchmark gerekir.

Öncelik küçük banner kazancından önce yanlış model, çok büyük T0 bağlamı, eksik denetim kaydı yüzünden yeniden denetim ve boşa tekrar süitlerini azaltmak olmalı. Örnek: 50 tokenlık bir banner 1000 istekte yalnız bir ek sabit bağlam yükü olarak taşınırsa 50.000 input token eder; bu ölçekteki tasarruf, buradaki binlerce Opus API isteğinin maliyetiyle aynı büyüklükte değildir.

## 9. Raporların düzeltilmesi gereken yerleri

`docs/raporlar/rele-surec-kusurlari-127-sozlesmelik-olcum.md`:

- Satır 13–19'daki 131 düzeltmesi, 28–32'de kalan 127/116 ile tutarlı hale getirilmeli. Her sayı için örneklem tarihi ve kapsamı yazılmalı.
- Satır 102–140: “üçüncü turdan sonra” ile kullanıcının “iki denemeden sonra” talebi ayrılmalı; advisor ve Fable ayrı sütun olmalı.
- Satır 157–167: 18 kuyruk turu aynı sözleşmenin 18 denemesi gibi sunulmamalı.
- Satır 278–292: 4/54 alan uyuşmazlığından otomatik ±%7 istatistiksel belirsizlik çıkarılamaz; dosya bazlı eksik/uyuşmazlık listesi verilmeli.
- Satır 295–319: 12 reopen +16 sözcüksel vaka −6 örtüşme =22 farklı sözleşme; açık T137 eklenince 23. Bunu 18 turla toplama.
- 72 ek tur sınıflamasını maliyet yüzdesi sayma. Bir tur birkaç saniye ölçüm, başka tur uzun bağlamlı Opus denetimi olabilir.
- Ürün kusuru diye sınıflanan 13 turun hiçbirinin süreçle önlenemeyeceği mutlak iddiasını kaldır; risk sınıflaması/mutasyon/ön kabul bazılarını önleyebilir.

VidShrink `.claude/relay/CORE-ONERILER.md`:

- T140/T149/T150/T156 örneklerinde kaydın yokluğu, rol yolunun eskiliği, yanlış worktree ve gerçekten koşmama ayrı sebepler olarak ayrılmalı.
- `unverified_runner` ile güvenceyi gevşetmek çözüm değil. Eksik provenansı görünür kıl, pahalı tekrarı otomatik başlatma; gerçek koşu kimliğini kurtar.
- “Core'da roles yok” ifadesi yanlış: kaynakta var. Eski Base cache'indeki `agents/` yolunu okumak Core'un dizin yapısını kanıtlamaz.
- T156 için sonradan elle üretilmiş audit, geçmişte bağımsız denetim yapıldığına dönük yeni güvence sayılmamalı.

## 10. Testler ve yayın öncesi çıkış ölçüsü

Regresyon dosyası: `test/audit-regressions.js`; timeout düzeneği: `test/verify-timeout.js`; hepsini çalıştıran komut: `npm test` (`test/run.js`). CI da bu girişe geçirildi.

- İlk on düşman senaryo düzeltme öncesinde **0 geçti / 10 kaldı**.
- Güncel hedefli senaryolar: **17 geçti / 0 kaldı**.
- Eşzamanlı son değişikliklerden önce ana test dizisi **2597 geçti / 0 kaldı**; aynı koşuda o andaki 16 hedefli senaryo ve timeout düzeneği de geçti.
- Sonraki tam koşu: **2605 geçti / 2 kaldı**. İki hata dışarıdan değişen statusline/çeviri yolunda: `the work line counts the steps that seat took` ve `a seat that has gone quiet says how long`. Çıktılarda `Line.files` ve `4 Dk Sessiz` görüldü. Bunları sessizce geçen saymadım veya eşzamanlı düzenlemeyi ezerek kapatmadım. **En son birleşik çalışma ağacı için testler tamamen yeşil değildir.**
- Kaynak özetiyle yapılan son koşu da **2605/2** verdi. Önce: `35b95f0831a3509091b8c3427b86c35b13c8104f81bd4a4767155eed4312c16d`; sonra: `cf1344388cfbc335bc333d4d594e84ecd0cd9fad0933f472497186777c79d157`. `snapshotChanged=true`: test sırasında kaynak değişti. İkinci çıktıda `Line.files` yerine `1 Dosya` vardı; kalan iki beklenti uyumsuzluğu ayrıca triage edilmeli, doğrudan iki ürün bug'ı ilan edilmemeli.
- Windows timeout düzeneği: eski yöntem sonrası çocuk hayatta **true**; yeni yöntem sonrası **false**, `timedOut=true`, `swept=true`.
- Söz dizimi ve `git diff --check` denetlendi. macOS/Linux gerçek çalıştırması yerelde yapılmadı; CI matrisi bunun için var.

Kaynak yaması kurulu cache'e uygulanmadı, sürüm çıkarılmadı, commit/push yapılmadı. VidShrink çalışma dosyaları ve ham konuşmalar değiştirilmedi. Sistemden yalnız testlerin kendi doğurduğu PID'ler temizlendi; `testhost`/`dotnet` adıyla toplu süreç öldürülmedi.

Yayın onayı için kalanlar:

1. Tek authoritative relay/run-store tasarımını seç; kök+T0+başka worktree'de aynı işi gösteren entegrasyon testi.
2. Worker/denetçi/ danışman yolları ve host resolved-model olayları için gerçek Claude Code uçtan uca smoke testi; gerçek Fable yeteneği/erişimi doğrulansın.
3. Zorunlu üçüncü tur kontrolü bütün durum geçişlerine bağlansın; elle round değiştirme ve shell yazıları ayrı test edilsin.
4. Avalonia koşusunda amaçlı timeout, ardından derleme; ayrıca eksik koşu/test sayısı ve totoloji negatif örnekleri.
5. Sonnet/Opus A/B: aynı sabit HEAD+veri+kabul ölçüsü, kısa örneklem, aynı kalite hedefi; model/rol çağrıları ve cache ayrı ölçülsün.
6. “0 continuous” A/B: aynı host sürümü, plugin kapalı/açık, aynı replay; input/cache/output delta ve hook duvar süresi kaydedilsin.

Yeni büyük bench'e bu çıkış ölçüleri sağlanmadan başlamak maliyet riskini yeniden üretir. Önce kısa, sabit bütçeli, olumsuz örnekleri de içeren kabul testi yapılmalı.
