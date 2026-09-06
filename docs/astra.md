# Fable 5.1'e — Teknesyum'u sıfırdan nasıl kurardım

Tarih: 6 Eylül 2026. Hazırlayan: Astra.
Durum: tasarım önerisi; uygulanmış karar veya Fable cevabı değildir.
İncelenen yerel uçlar: Core `a6f11ff`, Base `187bdb9`.
Aktarım hedefi Fable 5.1; bu belge hazırlanırken o sürüme çağrı yapılmadı.

## 1. Senden istediğim

Fable, bu kez mevcut makineyi tamir etmeni istemiyorum. Base'in niyetini, Core'un
maliyet disiplinini ve saha kusurlarını alıp sıfırdan kuracağım iskelet aşağıda.
Karar ortağı olarak, uygulamaya geçmeden önce bunun gereksiz parçalarını kes ve
eksik kalan kullanıcı ihtiyacını göster. Kod yazma, yeni bir konsey açma.

Kullanıcının bu turdaki isteği: “sen base i core u ve geçmişi incele ve 0 dan bir
tasarım yapman gerekirse amaçlarımız ve hassasiyetlerimiz doğrultusunda nasıl
yapardın en temiz şekliyle fable 5.1 e iskeleti anlat”.

## 2. Amaç ve hassasiyetler

- Kullanıcı istediği sonucu söyler; ajan/model/sözleşme seçerek sistemi işletmez.
  Gereksiz onay, dürtme ve yeniden açıklama azalmalı.
- Küçük işin önüne hazırlık töreni gelmemeli. Sıradan olaylarda kancanın model
  bağlamına eklediği içerik sıfır olmalı. Kalıcı talimatın okuma bedeli ayrıca sayılmalı.
- Doğruluk tasarrufa feda edilmez; pahalı model veya denetim de sırf var diye çalışmaz.
  Ölçü, kabul edilen sonuç başına toplam harcama, geçen süre ve insan müdahalesidir.
- Bağımsız işlerde ajan kendi inisiyatifiyle paralellik kullanabilmeli. Kullanıcının
  süreyi yarıya/dörtte bire indirme isteği hedeftir; her iş için vaat değildir.
- İş ve kullanıcı düzeltmeleri kesintide unutulmamalı. Bayat bilgi güncel görünmemeli.
- Fable önemli kararlarda seçimden önce ortaktır. Hedef Fable'dan övgü almak değil,
  ödediğimiz bedelin karşılığını gösterebilmektir. Soru ve cevap tam metin saklanır.
- Kurulum taşınabilir olmalı; kişisel lisans, dil ve UI tercihleri genel ürüne gömülmez.

Bu öncelikleri “en az token” diye tek sayıya indirmiyorum. Kullanıcının izin verdiği
bütçe içinde, aynı doğrulukla daha az toplam iş ve daha az insan müdahalesi arıyorum.

## 3. Geçmişten gerçekten çıkardığım sonuç

| İncelenen kanıt | Tasarıma etkisi |
|---|---|
| Base'in eski bench'inde relay çalışmayan ve kota yüzünden kesilen koşular var; `docs/BRIFING-ONARIM.md` bunu ayırıyor. | Mekanizma tetiklenmeden onun faydası hakkında hüküm vermem. |
| Core `bench/rapor.md` §8: 0.15'in bütünü 06/07'de aynı kabulü 4–8 kat bedelle alıyor. Tekil varyantların çoğu n=1. | Zorunlu koordinatör/işçi/denetçi zincirini geri kurmam. Bu küçük deneylerden bütün uzun işler için sonuç çıkarmam. |
| Core §7: task ve devam talimatı bulunan devirle 3/3 kabul, native 0/3. §4'te eksik devirle yalnız 1/5. | Asıl değer dosyanın varlığı değil, devam edilebilir görev bilgisidir. Kontrol native + aynı devir belgesini de içermeli. |
| VidShrink saha raporlarında gerçek denetçi bulguları yanında yanlış filtre, bayat ağaç, çarpışan test ve rapor sayısı hataları var. | Denetimi toptan değersiz saymam; önce makinenin ürettiği yanlış yeşilleri ve tekrar işi azaltırım. Bu gözlemsel kayıt, nedensel tasarruf ölçümü değildir. |
| 07 otopsisinde başarısız worktree açılışları, yeniden dağıtımlar ve kapsam kapıları koordinasyonu büyütüyor; native-paralel de çalışıyor. | Paralelliği eklentinin icadı saymam; kurulum/birleştirme dahil native-paralelle karşılaştırırım. |
| Core'da `DECISIONS.md` ve yol haritası kaldırılmış relay parçalarını hâlâ anlatıyor. | Tarihçe saklanır; yürürlükteki tasarım tek yerde ve geçmişten açıkça ayrı durur. |

Önceki 009 cevabımdaki “B yalnız açık kullanıcı çağrısıyla” sınırı, karar ortaklığı
ve inisiyatif isteğini tam karşılamıyordu. Bunu görev başına tekrar izin istemek
yerine, bir kez belirlenen kapsam ve sınırlar içinde otomatik kullanım olarak düzeltiyorum.

## 4. Ürün: sessiz kayıt + gerektiğinde kısa çalışma usulü

Ana ajan işi sahiplenir, planlar, kod da yazar. Ayrı bir T0 yöneticisi zorunlu değildir.
Core'un işi, aynı işi tekrar tarif ettirmek ve doğrulattırmak zorunda kalmamamızı sağlamaktır.

Üç parça yeter:

| Parça | Sorumluluğu | Ne zaman yüklenir? |
|---|---|---|
| Sessiz çekirdek | Oturum/çalışma ağacı kimliği, değişiklik ve süreç gözlemi, kayıt noktası, durum gösterimi. Model çağırmaz. | Desteklenen olaylarda yerel betik çalışır; olağan olayda model çıktısı yok. |
| Kısa çalışma usulü | Uzun işin amacı/kabulü, anlamlı karar, paralel parçanın sınırı, teslim kanıtı. | İş bunu gerektirince tek kez; sonraki turda tekrar enjekte edilmez. |
| İsteğe bağlı araçlar | Dar harita sorgusu, tarama, sabit dosya üretimi, danışma paketi, doğrulama çalıştırıcısı. | İlgili komut kullanıldığında; toplu katalog bağlama girmez. |

Yeni bir orkestrasyon motoru, genel eklenti çatısı, veritabanı veya sürekli servis
kurmam. Aynı Node paketi içinde birkaç modül yeter. Native ajan, bekleme, worktree ve
izin araçları kullanılabilir olduğunda doğrudan kullanılır.

```text
core/
  hooks/adapter.js         host olayını ortak kayda çevirir
  lib/state.js             kimlik, atomik kayıt, eşzamanlı güncelleme
  lib/evidence.js          doğrulama kaydı ve tazelik kontrolü
  scripts/core.js          status / resume / verify / scan / brief
  scripts/statusline.js    yalnız gösterir
  workflows/work.md        yalnız gerekli işte okunan kısa usul
  tools/                  mevcut faydalı betikler; topluca yüklenmez
```

Bu ağaç sorumlulukları anlatır, zorunlu dosya sayısı değildir. Her host için yeni
bir ürün kurulmaz. İlk sürüm mevcut Claude Code entegrasyonu içindir; desteklenen
olay ve alanlar gerçek host üzerinde doğrulanır. Olmayan alan tahminle doldurulmaz.

## 5. Durumun tek sahibi

İki farklı bilgi türü var; ikisi birbirinin yerine yazamaz:

**Niyet:** uzun işte mevcut `docs/plan.md`. Amaç, kapsam dışı, kabul maddeleri,
alınan karar ve gerekçesi, bitmemiş iş, sonraki adım. Kullanıcının yönlendirmesini
ana ajan işler. Dosya zaten varsa ikinci bir plan yaratılmaz. Küçük işte zorunlu değil.

**Gözlem:** makinenin tuttuğu yerel kayıt. Proje/worktree/oturum kimliği, iş kimliği,
başlangıç Git durumu, son gözlenen değişiklikler, süreçler ve doğrulama kayıtları.
Yeni kullanıcı mesajlarının kaynak kimlikleri/erişilebilir tam metni korunur;
“ilk istem hâlâ güncel görevdir” varsayılmaz. Makine bunların anlamını çözmez.

`handoff.md`, bu iki kaynaktan üretilen görünüm olur; üçüncü bir elle yönetilen görev
defteri olmaz. Niyetin son güncellemesinden sonra kullanıcı mesajı varsa bunu açıkça
söyler ve mesajı gösterir. Eksik `next_action` yerine bir sonraki adımı uydurmaz.

Çalışma durumu proje + worktree + oturumla ayrılır. İki oturum aynı devir dosyasını
ezmez; ayrı kayıt noktaları vardır, `resume` doğru olanı seçer. Birden çok eşit derecede
uygun aktif iş varsa seçim gizlenmez. Çalışma ağacı değişince eski kanıt bayat olur.

Kayıt noktası yalnız SessionEnd'e veya bağlam yüzdesine bırakılmaz. Anlamlı başarılı
olaylardan sonra birleştirilerek diske yazılır; mevcutsa sıkıştırma/kapanış olayı da
kullanılır. Ani süreç ölümünde son kalıcı noktadan dönülür; gözlenmemiş son değişiklik
için kayıpsız kurtarma iddiası yoktur. Git taramasıyla durum yeniden uzlaştırılır.

Başka makineye taşınacak metin göreli yollar kullanır; makineye özel süreç/yerel log
yolları aktarım paketi sayılmaz. Yerel kaydın kendiliğinden Git'le taşındığı varsayılmaz.
Mevcut devir dosyası/betik alışkanlığı, açık bir dışa aktarım olarak korunabilir.

## 6. Dört kullanım akışı

**Küçük ve bilinen iş:** ana ajan okur, değiştirir, ilgili kontrolü çalıştırır, sonucu
söyler. Plan, danışman, sözleşme yok. Çekirdek yalnız gözlediğini kaydeder. Beş dosya
veya 150 satır göstergedir; tek başına iş büyüklüğü, doğruluk veya zorunlu plan kararı değildir.

**Uzun veya belirsiz iş:** ana ajan kısa planı yazar. İhtiyaç varsa dar ön araştırma
yapar. Mimari/önemli kapsam seçimi öncesinde Fable'a tek karar paketi gider. Karar
ana ajanda kalır; ayrışma gerekçesi kaydedilir. Her plan düzenlemesi yeni danışma açmaz.

**Bağımsız işler:** ana ajan bağımsızlığı anlam ve ortak kaynaklar açısından değerlendirir.
Import grafiği yalnız yardımcı kanıttır; iki dosya kümesinin ayrık olması yeterli değildir.
Native alt ajanlara amaç + kabul + ilgili yollar + bilinen bulgular verilir. İşçiler
sözleşme açıp kapatmaz. Yazıcı ajanlar ayrı worktree kullanır; ortak export, lock ve
entegrasyon değişikliklerini ana ajan toplar. Kurulum kazancı yiyorsa bölünmez.
Salt okunur araştırmaya worktree gerekmez. Son birleşmiş ağaç ayrıca doğrulanır.

**Kesinti ve devam:** kullanıcı “devam” der. Host adaptörü bu açık isteği görebiliyorsa
tek kısa işaretçi verir; göremiyorsa başlangıçta yalnız açık işe ait bir işaretçi
gösterir. Tam plan/geçmiş enjekte edilmez. `resume` niyeti, yeni yönlendirmeleri, bayat
kanıtları ve kalan işi tek kısa çıktı olarak döndürür. Yeni istek eski işi otomatik başlatmaz.

## 7. Doğrulama: komut başarılı mı, bu iş doğrulandı mı?

`verify`, ajanın zaten çalıştıracağı kontrolün kaydını üretir; Stop'ta bir kez daha
`npm test` çalıştırmaz. Mümkünse host'un yapılandırılmış sonucu alınır; yetmiyorsa
komut küçük çalıştırıcıdan geçer. İki yoldan aynı koşu iki kez sayılmaz.

Kayıt: komut/argümanlar, cwd, başlangıç/bitiş, çıkış kodu, timeout/iptal, çıktı yolu,
kontrol türü ve doğrulanan ağaç parmak izi. Parmak izi yalnız HEAD değildir: kapsamın
izlenen/izlenmeyen dosyalarını, kirli değişiklikleri, test/ayar/bağımlılık girdilerini
kapsar. Koşu sırasında ağaç değişirse kanıt güncel sayılmaz.

Test çalıştırıcısı destekliyorsa seçilen/koşan test sayısı kaydedilir. Sıfır test,
“testler geçti” olamaz. Sayı veya çıkış kodu alınamıyorsa bilinmiyor denir; çıktı
metninde `FAIL` bulunmaması başarı kanıtı değildir. Derleme/lint gibi test olmayan
kontroller için test sayısı aranmaz. Test geçmesi de bütün kabul maddeleri geçti demek değildir.

Durum ekranı “7 test komutu geçti” toplamını başarı rozeti yapmaz. Son ilgili kanıtı
`geçti / kaldı / bilinmiyor / bayat` diye gösterir; kabul maddelerinin kapsanmayanı açık kalır.
Kanıtın tüm gerekli girdilerinin aynı olduğu doğrulanamıyorsa yeniden kullanılamaz.

Modelin kapanış beyanı ayrıca durur. Çekirdek yalnız “bu komut şu ağaçta şu sonucu
verdi” der; mühür basıp anlamsal doğruluk garantisi üretmez. Aynı yetkilerle çalışan
ajanın yerel dosyayı yazabilmesi nedeniyle bu kayıt bir saldırganlık sınırı değildir.

Bağımsız denetçi, testin cevaplamadığı somut doğruluk sorusu için veya kullanıcının
özellikle istediği teslimde açılır. Salt satır/yol eşiği otomatik pahalı ajan başlatmaz.
Başarısız kontrol aynı kanıtla tekrar tekrar açılmaz: aynı somut hata iki denemede
kapanmıyorsa yeni kör deneme yerine teşhis/danışma yapılır. Bu eşik ilk tasarım
varsayımıdır, saha verisiyle ayarlanır. Stil önerisi düzeltme turu değildir.

## 8. Fable, araştırma ve bütçe

Fable 5.1 kullanıcının seçtiği karar ortağıdır; mevcut olmayan sürüm sessizce başka
modelle değiştirilmez. İşçi modelini Core genel bir tarife merdiveniyle yeniden seçmez.
Kullanıcının/native host'un seçimi korunur; değişiklik somut gerekçeye bağlıdır.

Bir kez kurulan tercih, önemli tasarım düğümlerinde danışmaya izin verir; her seferinde
“çağırayım mı” sorulmaz. Bir karar için bir çağrı, sınırlı girdi/çıktı, süre ve çağrı
sayısı sınırı vardır. Paket: soru, kısıtlar, seçenekler, kanıt, ana ajanın önerisi.
Fable bütün depoyu yeniden keşfetmez; eksik kanıt varsa onu adlandırır.

“İstenince” veya `--budget` kelimesi tek başına yaptırım değildir. Kullanılan host
gerçek sınır uygulayabiliyorsa çağrı o sınırla açılır; uygulayamıyorsa dolar tavanı
garantisi verilmez. Çağrı sayısı/süre/çıktı sınırı da maliyet tahminiyle karıştırılmaz.
Otomatik yeniden çağrı ve otomatik ikinci danışman yok. Kayıtta istenen ve gerçekten
koşan model ayrıdır; yanıt alınamadıysa tamamlanmış danışma yazılmaz.

Soru ve cevap yerelde tam metin saklanır. Sonraki turlara yalnız karar ve kaynak yolu
taşınır. Sonraki okuma ve ana ajanın cevabı değerlendirmesi de danışmanın toplam bedelidir.

## 9. Base/Core parçalarının yeri

| Parça | Sıfırdan kararı |
|---|---|
| Statusline, bekleme sesi | Kalsın. Ekran yalnız okur; bağlam yüzdesini diske yazması devir için zorunlu olmasın. Ses gerçek kullanıcı sırasını izlesin. |
| Devir | Çekirdeğin ana işi. Yukarıdaki güncel niyet ve ayrı oturum kayıtlarıyla. |
| Dosya/satır sayacı | Yardımcı gösterge. Kabukla yazılan dosyalar ve oturum başında zaten kirli ağaç ayrılır; bunlar çözülemeden tam kapsam sayacı denmez. Plan uyarısı ilk sürümde varsayılan kapalı. |
| A — scan | Ekle; seçilmiş proje kurallarını kontrol eden salt okunur rapor. Eski eco/premium ajan düzenini zorunlu kılan sertifika aktarılmaz. Her bulgu kontrolünü/kaynağını gösterir; düzeltme kendiliğinden başlamaz. |
| B — ön araştırma | Bilinmeyen soruya dar araştırma; gerekli işte mevcut yetki içinde kullanılabilir. Sabit 1/50 depo hedefi yok. |
| C — plan meclisi | İlk üründe yok. Ana ajan + tek Fable görüşü yeter. İkinci bağımsız plan ancak ayrı gerekçe ve yetkiyle. İki modelin uzlaşması kanıt sayılmaz. |
| Harita / agency | Dar sorgu, ilgili koltuk, gerektiğinde. Tüm harita veya rol listesi yüklenmez. Kaynağın revizyonu/tazeliği görünür. |
| Sözleşme / mühür / rol merdiveni | Kaldır. Planın kabul maddeleri ve gerçek doğrulama kaydı korunur; eski bürokrasinin dosyaları korunmaz. |
| prefs / scaffold / UI | Kişisel/isteğe bağlı araçlar. Sabit lisans ve varlıkları betik üretir. README yazımını tekrar tekrar engelleyen genel kapı kurmam. |
| manset / log | Soru olduğunda kullanılan araç. Bilinen sayıları mümkünse kaynak veriden üret; genel sayı eşleşmesini doğruluk kanıtı yapma. |
| Bekleme döngüsü kapısı | Regex'i süre garantisi saymam. Yönetilen süreç gerçek deadline/iptal ile çalışır; native bekleme kullanılır. Genel shell ayrıştırıcısı yazmam. |

Uzun süren süreç “takıldı” demek değildir. Süreç kaydı ilgili oturumun süreç kimliği
ve başlangıcıyla bağlanır; yalnız yaşından dolayı öldürülmez. Zaman hassas testler
açık kaynak kilidiyle ayrılır; bütün testleri tek küresel kuyruğa kilitlemem.

## 10. Maliyet sözleşmesi

| Durum | Hedef ve dürüst sınır |
|---|---|
| Olağan hook olayı | Modele 0 ek bayt; yerel CPU/IO/süre ayrıca ölçülür. |
| Kurulum/keşfedilebilirlik | Tek kısa yönlendirme ya da tek giriş tanımı. Boyutu ve soğuk/cache okuma bedeli ölçülür; “bedava” denmez. |
| Küçük iş | Core yüzünden plan/danışma/ek doğrulama turu yok. Toplam görev farkı bench'te ayrıca ölçülür. |
| Devam | Bir işaretçi + gerekli durum okuması; ücretsiz olduğu iddia edilmez. |
| scan/map | Kullanılmadığında bağlam maliyeti yok. Kullanıldığında betik süresi ve modele okutulan çıktı maliyeti var. |
| Fable/araştırma/denetim | Yalnız ilgili işte; girdi, çıktı, alt ajan ve ana ajanın takip işi birlikte hesaplanır. |

İlk sürümde hook başına p95 süre ve olay sayısı kaydedilir; başlangıç ölçümü olmadan
“milisaniye” hedefi tutmuş sayılmaz. Sessiz olmak arka planda sınırsız iş yapmak değildir.

## 11. En küçük teslim ve sınama

**İlk teslim:** host adaptörü + oturum kaydı + güncel devir + dürüst doğrulama durumu.
Mevcut ses/statusline kullanılır. `scan` bağımsız küçük araçtır. Kısa çalışma usulü
ve Fable paketleme bundan sonra bağlanır; ayrı paralellik motoru hiç yazılmaz.
Mevcut Core'u topluca silip yeniden yazmam: bu tasarımı küçük değişikliklerle kurarım.

Ücretsiz yerel karşı örnekler: kabukla yazılan dosya, sıfır test, eksik exit code,
testten sonra değişen ağaç, iki eşzamanlı oturum, eski görevin üstüne yeni yönlendirme,
bozuk/yarım kayıt, kapanış olayı gelmeden süreç ölümü, başka makineye devir ve
danışmanın erişilememesi. Sav sayısı değil bu davranışların geçmesi kabul ölçütüdür.

Ücretli pilot, uygulama hazır olunca ayrı sabit bütçeyle yapılır; bu tasarım turunda
yeni bench çağrısı yok. Önce kesintiden dönüşte üç kol: native, native + eşdeğer devir,
yeni çekirdek. Bir sabit görev × üç kol × iki tekrar = altı koşu; bu yalnız elemedir.
İlk istemden teslim sonuna kadar maliyet/süre, kabul ve kullanıcı müdahalesi kaydedilir.
Kazanç varsa tekrar sayısı artırılır; yoksa yeni rol eklemek yerine nedenine bakılır.

Paralellik ancak ayrıca değerlendirilecekse native-paralel karşısında aynı izolasyon
ve kabul koşullarıyla sınanır. Danışma da kritik karar sınıfında ayrı ölçülür.
Bir mekanizmanın olumlu sonucu başka mekanizmayı ücretsiz onaylamaz.

İstatistiksel olarak ayrışmayan pilot için ürün kararı açık olabilir: “varsayılan
eklenmez; faydası henüz gösterilmedi”. Bu, “kesin faydasız” demek değildir. Başlangıç
toleransı geçmişteki küçük iş +%5 hedefidir; küçük n bunu kanıtlamaya yetmez.

## 12. Fable'dan beklediğim cevap

En fazla 700 kelime; aynı tasarımı yeniden anlatma. Şunları cevapla:

1. Bu iskeletin hangi parçası hâlâ eski relay'i başka adla geri getiriyor? Kes.
2. Sessiz kayıt tek başına kullanıcının “unutma, dürttürme, doğru teslim et” ihtiyacını
   nerede karşılamaz? En küçük eksik davranışı ve maliyetini söyle.
3. Tek Fable çağrısının otomatik açılacağı karar sınırı yeterince dar mı? Sürekli
   kullanıcı onayı istemeden somut biçimde nasıl daraltırsın?
4. Doğrulama kaydını mühür makinesine çevirmeden nasıl güvenilir tutarsın?
5. İlk teslimi daha da küçültebilir misin? Tut/çıkar/sonra tablosu ve en ucuz
   yanlışlama deneyiyle bitir. Bilinmeyen fiyat veya kazanç oranı uydurma.

## Kaynak izi

Bu belge tam repo denetimi değildir. Aşağıdaki kod, raporlar ve ilgili Git geçmişi
incelendi; eski danışman cevapları kanıtla aynı ağırlıkta alınmadı.

- Core: `core/hooks/{hooks.json,count.js,handoff.js,loop.js,prefs.js,lib.js}`;
  `core/scripts/{statusline.js,procs.js,advice.js,agency.js,bridge.js}`.
- Core: `bench/rapor.md` özellikle §4–8; `bench/ab-07-otopsi.md`;
  `bench/katlama-otopsi.md` içindeki araç sıraları.
- Core: `docs/raporlar/denetci-maliyet-analizi.md`,
  `rele-israfi-124-sozlesmelik-olcum.md`, `2026-09-05-karar.md`,
  `2026-09-06-base-ozellikleri-core-icin.md`.
- Core: danışma 017, 018, 023, 024, 009-girdi; `docs/YOL-HARITASI.md`,
  `docs/COST-MODEL.md`, `docs/DECISIONS.md` ve README.
- Base: `teknesyum/skills/relay/SKILL.md`, `references/premium.md`,
  `teknesyum/hooks/hooks.json`; `contract-guard.js`, `scripts/contract.js` ve
  `scripts/tarama.js` içindeki ilgili kontrol/yönlendirme bölümleri.
- Base: `docs/BRIFING-ONARIM.md`, `docs/BENCH-SONUC.md` ve yük/onarım geçmişi.
  Yerel manifest `2.67.0` yazıyor; giriş belgesindeki `v2.66` etiketi yerine bu
  incelemenin dayanağı başta verilen commit'tir.
