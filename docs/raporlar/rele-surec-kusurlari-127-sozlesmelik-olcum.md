# Röle süreç kusurları — 127 sözleşmelik ölçüm

İkinci rapor. Birincisi (`rele-israfi-124-sozlesmelik-olcum.md`) **neyin boşa gittiğini**
ölçtü. Bu rapor **neden kimsenin durdurmadığını** ölçüyor.

Aradaki fark önemli: birinci raporun 11 kusuru tek tek düzeltilebilir. Buradaki dört
kusur ise düzeltmenin kendisinin neden gelmediğini anlatıyor — yazılı kural var,
kuralı işleten kapı yok.

Ölçüm tabanı: VidShrink deposu, 5 görev paketi, 116 denetim kaydı. Sayılar
`.claude/relay/` altından sayıldı, tahmin yok.

**Yeniden ölçüm — 2 Eylül 2026.** Rapor ilk yazıldığında defter 127 mühürlü
sözleşmeydi; bugün **131**. Aşağıdaki her sayı 131'lik deftere göre yeniden
sayıldı. Yeniden sayım rapordaki üç hatayı ortaya çıkardı ve üçü de düzeltildi:
tur dağılımı tablosu 132 sözleşme topluyordu (bir fazla), danışmanın hiç
çağrılmadığı iddiası yanlıştı (üç kez çağrıldı), "22 tur danışmansız" sayısı
aritmetik olarak tutmuyordu (doğrusu 18). Başlıktaki 127 sayısı raporun kimliği
olduğu için değiştirilmedi; ölçüm tabanı bu paragraftır.


## 0. Hüküm

**Röle yalnız sözleşmeleri denetliyor. Sözleşme dışında kalan her şey denetimsiz.**

Üç somut sonuç:

| Ne | Kaç kez oldu | Kaç kez denetlendi |
|---|---|---|
| Sözleşme | 127 | 116 |
| Görev paketi | 5 | **0** |
| Tur 4 açan sözleşme (danışman zorunlu) | 4 | 3 |

Paket, sözleşmeyle aynı işi yapar: bir ajana ne yapacağını söyler, kabul kriteri
koyar, çıktı bekler. Sözleşmenin geçtiği hiçbir kapıdan geçmez. Bugün bu yüzden
bir paket, hedef makinede var olmayan bir dosyaya dayanarak gönderildi.


## 1. Kusur A — Paketin kapısı yok

### Belirti

`.claude/relay/paketler/SERKAN-MACOS-PAKET.md:70-72` şunu yazıyor:

> `.calisma/kaynak/` altındaki ortak ölçüm parçalarını kullan. **Kendi kaynağını
> üretme** — bu depoda "aynı yerden kesilmiş ama aynı içerikte olmayan" parçalar
> ölçümü bir kez haksız yaptı.

Paket macOS makinesinde açıldı. `.calisma/` **`.gitignore` içinde**; o makinede
dizin hiç yok. Paketin asıl işi (İş 2, VideoToolbox ölçümü) tamamen o dosyalara
bağlı. Ajan işe başlayamadı, T0'a döndü, bir tur boşa gitti.

### Kök neden

İki katman birden eksik:

1. **T0 ön koşulu doğrulamadı.** Paketi yazarken "bu dosya hedef makinede var mı"
   sorusu hiç sorulmadı. Beş paketin hiçbirinde ön koşul doğrulama talimatı yok —
   `grep -rn "dogrula\|kontrol et\|var mi" paketler/*.md` **sıfır satır** döndü.

2. **Sistemde soracak bir kapı yok.** `contract.js` sözleşme için üç kapı işletiyor
   (`submit`, `audit`, `complete`). Paket için hiçbir betik yok. Paket bir metin
   dosyası; yazılır, gönderilir, kimse bakmaz.

Bu, birinci raporun 5. kusurunun (`owns` glob'u yalnız mühür anında reddediliyor)
daha ağır hâli: orada kapı geç çalışıyordu, burada kapı hiç yok.

### Neden bu kusur kaçınılmazdı

Paket **uzak makineye** gider. Sözleşmede ön koşul hatası ucuzdur — ajan aynı ağaçta,
eksik dosyayı görür, T0'a on saniyede döner. Pakette aynı hata pahalıdır: ajan başka
bir makinede, başka bir işletim sisteminde, T0'ın hiç bakmadığı bir ağaçta. Geri
dönüş bir tur.

Yani paket, sözleşmeden **daha sıkı** bir kapı ister; bugün **daha gevşek** bir
kapısı var. Sıfır.

### Öneri — `packet.js`

`scripts/packet.js check --file <yol>` şunları koşsun ve eksik varsa paket
gönderilmesin:

- **Ön koşul çıkarımı.** Paket metnindeki her dosya/dizin yolunu topla. Her biri
  için üç şeyden birini iste: (a) depoda taahhütlü, (b) pakette "bunu şu komutla
  üret" satırı var, (c) pakette "bu dosya sende yok, şuradan al" satırı var.
  Üçü de yoksa **engelle**. Bugün üçü de yoktu.
- **`.gitignore` kesişimi.** Paketin adı geçen her yolu `.gitignore`a karşı sına.
  Yoksayılan bir yol pakette geçiyorsa bu **kesin** bir uzak-makine hatasıdır;
  o dosya karşı tarafta yok. Tek satırlık kontrol, bugünkü hatayı tek başına
  yakalardı.
- **Kabul kriteri biçimi.** Sözleşmede `## Kabul kriteri` zorunlu. Pakette de olsun.
- **Çıktı yolu.** Paketin ürettiği her dosyanın yolu yazılı olsun.

Ve `packet.js audit` — paketi gönderilmeden önce bir denetçiye okutmak. Sözleşme
için bunu 116 kez yaptık; paket için sıfır kez.


## 2. Kusur B — Danışman kuralı yazılı, hiç işlemedi

### Belirti

Röle kuralı (`references/protocol.md` §4) diyor ki:

> Üçüncü turdan sonra `advisor` zorunlu, beşinciden sonra borç tur gerekçesi olamaz.

Ölçülen tur dağılımı:

| Tur | Sözleşme sayısı | Ek tur (tur−1) |
|---|---|---|
| 0 | 10 | 0 |
| 1 | 67 | 0 |
| 2 | 40 | 40 |
| 3 | 10 | 20 |
| 4 | 4 | 12 |
| **Toplam** | **131** | **72** |

`round: 0` alanı 10 sözleşmede duruyor; alan konvansiyonu T1–T9 döneminde henüz
yoktu, o sözleşmelerin ek turu sayılmadı.

**14 sözleşme üçüncü turu gördü.** Bu raporun ilk hâli "danışman kaçında
çağrıldı: **0**" diyordu. **Bu yanlıştı.** Yeniden sayımda üç çağrı bulundu:

| Sözleşme | Nerede | Kayıt |
|---|---|---|
| T3 | tur 4 açılışı | `contracts/done/T3.md:743` — "Düzeltme turu 4 — hedef isabeti (T0, abiye danışıldı)" |
| T63 | tur 4 açılışı | `contracts/done/T63.md:561` — "Danışman görüşü alındı (protokol §4, üçüncü turdan sonra zorunlu)" |
| T126 | tur 4 açılışı | `contracts/done/T126.md:296` — "Danisman gorusu (tur 4 zorunlu kildi)" |

Kuralın lafzı şudur: *üçüncü turdan **sonra** advisor zorunlu.* Yani kural tur 3'ü
açarken değil, **tur 4'ü açarken** bağlar. Tur 4 açan sözleşme dörttür: T3, T28,
T63, T126. Üçünde danışman çağrıldı, **birinde çağrılmadı: T28.**

Kuralın gerektirdiği yerdeki ihlal sayısı: **1/4.** 14 değil.

Kuralın gerektirmediği yerde de dört çağrı var — T44 (tur 2), T47 (tur 1),
T48 (tur 2), T49 (tur 1). `contracts/done/T96.md:5`'teki `model: fable` bir
**model seçimi**, danışman çağrısı değil; ilk sayımda o da yanlış sayılmıştı.

Yani mekanizma çalışıyor ve kullanılıyor; **zorlanmıyor.** Kusur, "hiç
çağrılmıyor" değil, "çağrılmadığında hiçbir şey durmuyor."

**Tek ihlalin ikinci yüzü.** T28'in tur 4'ü zaten açılmamalıydı: gerekçesi bir
KRİTİK değil, bir borçtu (`contracts/done/T28.md:299` — "Tur 4 — borç 3 kapandı").
Danışman kuralının delindiği tek yer, Kusur C'nin de delindiği yer.

### Kök neden

Kural bir cümle olarak duruyor, kod olarak durmuyor. Tur açan tek şey T0'ın kararı;
T0 turu açarken hiçbir betik "bu üçüncü tur, danışman nerede" diye sormuyor.

Karşılaştır: `complete` kapısı denetim kaydı yoksa mühür atmıyor — ve tam da bu
yüzden 127 sözleşmenin 116'sı denetlendi. Kapısı olan kural işledi, olmayan işlemedi.
Aradaki fark disiplin değil, kod.

### Neden bu pahalı

Tur 3'e gelen bir sözleşme tanım gereği iki kez yanlış anlaşılmış demektir. Orası
tam olarak ikinci bir aklın gerektiği yer. 14 kez o eşiğe gelindi ve **14 kezin
14'ünde de aynı akıl üçüncü kez denedi** — çünkü kuralın lafzı tur 3'ü bağlamıyor.

72 ek turun kuyruğu buradadır: tur 3 ve 4 seviyesindeki turlar toplam **18**
(14 üçüncü tur + 4 dördüncü tur). Raporun ilk hâlindeki "22 tur" sayısı yanlıştı;
aritmetiği hiçbir tablodan gelmiyordu. Bu 18 turun **15'inde** dışarıdan bir göz
yok; kalan 3'ü yukarıdaki danışman kayıtları.

Asıl bulgu şu: kuralın eşiği yanlış yerde. Pahalıya mal olan tur 3'tür, ve kural
tur 3'ü serbest bırakıyor. Aşağıdaki §2b bunu turların kendi gerekçesiyle gösteriyor.

### Öneri

`contract.js reopen --id T## --kritik "<tanim>"` (birinci raporun 11. maddesi) zaten
öneriliyordu. Buraya bir kapı daha eklensin:

- `round >= 3` ise `reopen` **`--advisor <ajan-id>` istesin.** Danışman kaydı yoksa
  tur açılmasın.
- `round >= 5` ise `reopen` tümden reddetsin; sözleşme borçla mühürlensin ya da
  yeniden yazılsın.

Danışmanın ne söylediği `audits/` gibi bir yere kaydedilsin ki sonradan sayılabilsin.


## 2b. Üçüncü tura geçen 14 sözleşme — turu ne açtı, danışman neden yok

Her satır o sözleşmenin **tur 3 açılışındaki** gerekçesidir; kaynak sözleşme
dosyasının kendi tur 3 bölümüdür.

| Sözleşme | Tur 3'ü açan gerekçe | Sınıf | Danışman |
|---|---|---|---|
| T102 | "Sebebi anahtar kare sayısı değil, yeri" iddiası hiç ölçülmemiş; belgenin kendi tablosu çürütüyor | manşet kayması | Kural tur 3'ü bağlamıyor |
| T115 | Koşum kapısı bu makinede yeşil koşumda `kod=66` dönüyor | altyapı | Kural tur 3'ü bağlamıyor |
| T118 | Çapa doğrulaması: dokuz alıntının ikisi sapıyor | manşet kayması | Kural tur 3'ü bağlamıyor |
| T16 | Açıklama cümlesi iki durumda da tam bir kez görünsün | stil | Kural tur 3'ü bağlamıyor |
| T23 | Ölçü ters kurulmuş — kaydırma çubuğunun **olmasını** zorunlu kılıyordu | eksik test | Kural tur 3'ü bağlamıyor |
| T50 | Sınır maliyeti paragrafı ikinci koşumdan alıntılayıp ona "son koşum" diyor | manşet kayması | Kural tur 3'ü bağlamıyor |
| T84 | Rozet sayımı 44'te dondurulmuş, gerçek popülasyon 23 | manşet kayması | Kural tur 3'ü bağlamıyor |
| T87 | Boyut garantisi koşan hiçbir ölçüyle bağlı değil | eksik test | Kural tur 3'ü bağlamıyor |
| T88 | Konteyner asimetrisi hareket ekseninde duruyor | ürün kriteri | Kural tur 3'ü bağlamıyor |
| T99 | "Ölçülmüş" diye sunulan hücre ölçüldüğünde çürüyor | manşet kayması | Kural tur 3'ü bağlamıyor |
| T126 | Kaldırıcı commit iddiası yanlış | manşet kayması | **Tur 4'te çağrıldı** |
| T28 | Üç dal "hızlı düşür kapalı" cümlesini koşulsuz yazıyor | ürün kriteri | **Tur 4'te çağrılmadı — tek ihlal** |
| T3 | Bulgu 1 sürüyor, çelişki derinleşti | ürün kriteri | **Tur 4'te çağrıldı** |
| T63 | Ölçülmemiş sayı iki docstring'de duruyor, rapor kapandı diye beyan ediyor | manşet kayması | **Tur 4'te çağrıldı** |

Tablodan çıkan iki sayı:

- **14 tur 3 açılışının 14'ünde de danışman yok**, çünkü kural o eşiği bağlamıyor.
- 14 açılışın **7'si manşet kayması** — yani sözleşmeyi üçüncü tura taşıyan en
  yaygın tek sebep, kodun yanlış olması değil, **kodu anlatan cümlenin yanlış olması.**
  Yedisi: T102, T118, T50, T84, T99, T126, T63.

İkincisi kuralın eşiğinin neden yanlış yerde olduğunu gösteriyor. Danışman tur 4'te
çağrıldığında iş çoktan üç kez yapılmıştır. T63 tur 4'ünde danışmanın söylediği tam
olarak buydu: *"aynı ajana dördüncü kez 'cümleyi düzelt' demek en pahalı ve en
riskli yol"* (`contracts/done/T63.md:562`). Bu yargı tur 3'te de aynen geçerliydi.


## 2c. 72 ek turun kusur sınıfları

Her ek tur, **o turu açan gerekçeye** göre tek bir sınıfa atandı. İki KRİTİK'le açılan
turda ilk yazılan KRİTİK esas alındı. Kaynak: sözleşme dosyalarının kendi tur
bölümleri; ham atama tablosu 72 satır.

| Sınıf | Tanım | Tur | Pay |
|---|---|---|---|
| diğer | aşağıda kırılıyor | 25 | %35 |
| manşet kayması | sayı/tablo doğru, üstündeki cümle yanlış; iddia veriden güçlü | 17 | %24 |
| eksik test | ölçü ölçmüyor: totoloji, ölü süzgeç kolu, sessiz atlama, hayatta kalan mutasyon | 16 | %22 |
| yanlış kapsam | T0'ın kendi kurgusu yanlıştı: `owns` dar/geniş, kriter hatalı tanımlı | 8 | %11 |
| stil | yerleşim, metin, görsel rötuş | 6 | %8 |
| **Toplam** | | **72** | **100** |

### "diğer" neden en büyük kutu — kırılımı

Verilen beş sınıf 72 turun 47'sini karşılıyor. Kalan 25'i tek bir sınıf değil, yedi
ayrı sebep:

| Alt sebep | Tur | Ne demek |
|---|---|---|
| ürün kriteri karşılanmadı | 13 | Kabul kriteri üründe gerçekten karşılanmamış. **Bu bir süreç kusuru değil, sıradan iş.** |
| kayıt yok | 3 | `round: 2` yazıyor ama dosyada tur 2 bölümü yok (T72, T78, T100) |
| dış birleşme | 3 | Başka bir sözleşme `main`e girdi, ağaç altından değişti (T54, T58, T98) |
| borç üzerine açıldı | 2 | Denetim GEÇTİ verdi, tur yine de açıldı — Kusur C (T43, T28) |
| altyapı | 2 | T0 worktree yalıtımı olmadan açtı; koşum kapısı yanlış kod döndürdü (T61, T115) |
| usul | 1 | `_sorun.log` kaydı eksikti (T13) |
| CI | 1 | Ölçüler CI'da düştü (T99) |

**En önemli satır birincisi.** 72 ek turun 13'ü hiçbir sürecin önleyemeyeceği turdur:
iş bitmemişti, denetim yakaladı, tur açıldı, iş bitti. Süreç tam da böyle çalışmalı.
Kusur aranacak yer kalan 59 turdur.

### Sınıfın turu nerede pahalıya patladığı

Aynı 72 tur, seviyeye göre:

| Sınıf | Tur 2 | Tur 3 | Tur 4 |
|---|---|---|---|
| diğer | 19 | 4 | 2 |
| eksik test | 14 | 2 | 0 |
| manşet kayması | 8 | 7 | 2 |
| yanlış kapsam | 8 | 0 | 0 |
| stil | 5 | 1 | 0 |
| **Toplam** | **54** | **14** | **4** |

Bu tablo raporun en pahalı tek bulgusudur:

- **Tur 2'de manşet kayması payı 8/54 = %15.**
- **Tur 3 ve 4'te 9/18 = %50.**

Yani ilk turda yakalanan kusurların çoğu kod kusuru; **üçüncü ve dördüncü tura kadar
yaşayan kusurların yarısı ise cümle kusuru.** Kod kusuru bir turda kapanıyor, cümle
kusuru kapanmıyor — çünkü düzeltilen cümlenin yerine yazılan yeni cümle de
denetlenmiyor. T126 bunun saf hâli: üç turun üçü de aynı sınıftan, her tur bir
öncekinin düzeltmesini yeni bir kaymayla değiştirdi.

`yanlış kapsam` sınıfının **8'inin 8'i de tur 2'de.** T0'ın kurgu hatası her zaman ilk
denetimde yakalanıyor; hiçbiri tur 3'e taşmıyor. Bu iyi haber ve kapı gerektirmiyor.

### `round` alanı sayaç olarak güvenilir değil

Sınıflandırma sırasında ölçüldü: `round` alanı ile dosyanın gövdesi **54 sözleşmenin
4'ünde** uyuşmuyor (%7).

- Fazla sayan üç sözleşme: T72, T78, T100 — `round: 2` yazıyor, dosyada tur 2 bölümü
  hiç yok, teslim raporu da yok.
- Eksik sayan bir sözleşme: T98 — `round: 2` yazıyor ama gövdede
  `## Denetim — tur 3 · GECTI` bölümü var (`contracts/done/T98.md:239`).

Yani 72 sayısının kendisi ±%7 belirsizlik taşıyor. Alanı hiçbir betik yazmıyor; T0
elle giriyor ve tur açılışında güncellemeyi unutabiliyor.

**Öneri:** `reopen` alanı kendisi artırsın ve gövdeye `## Tur N` başlığını kendisi
açsın. Elle girilen bir sayaç sayaç değildir.


## 2d. "18+ tekrar" ne demekti — birinci rapora düzeltme

Birinci rapor (`rele-israfi-124-sozlesmelik-olcum.md:56`) manşet kaymasını
*"en pahalı, 18+ tekrar"* diye etiketliyor. Sayı belirsizdi: tek bir sözleşmenin koşum
sayısı mı, yoksa kusurun kaç ayrı sözleşmede tekrarladığı mı belli değildi. Ölçüldü:

**Kaç ayrı sözleşmede tekrarladığıdır.** Tek bir sözleşmenin koşum sayısı değil.

İki bağımsız sayaçla ölçüldü:

| Sayaç | Ne sayıyor | Sözleşme |
|---|---|---|
| Tur açan | Ek turun gerekçesi manşet kayması olan sözleşmeler | 12 |
| Sözcüksel | Gövdesinde "veriden güçlü / manşet / özet cümle / tablo doğru" geçen sözleşmeler | 16 |
| Kesişim | İkisinde birden | 6 |
| **Birleşim** | **En az bir sayaçta görünen** | **22** |

Birleşim listesi: T33, T50, T63, T64, T84, T95, T99, T102, T106, T108, T111, T115,
T116, T118, T119, T120, T123, T124, T126, T134, T135, T138.

**131 mühürlü sözleşmenin 22'si — %17.** Buna mühürsüz T137 dahil değil; onun 2 Eylül
denetimi de aynı sınıftan bir KRİTİK verdi (rapor, var olmayan bir bölüme yönlendiriyor),
yani açık sözleşmelerle birlikte 23.

"18+" bir tahmindi ve **eksik tahmindi.** Doğrusu 22, ve anlamı "22 ayrı sözleşme"dir.


## 3. Kusur C — Tur, KRİTİK olmadan açılıyor (bugün yine oldu)

Birinci raporun 11. maddesiydi. Rapor yazıldıktan **sonra** tekrarlandı, bu yüzden
burada ikinci kez geçiyor — kuralın yazılmasının yetmediğinin kanıtı olarak.

Bugün T134'ün denetimi **GEÇTİ** verdi, KRİTİK yok, sekiz borç yazdı. Doğru davranış:
mührü at, borçları nota yaz. Yapılan: ajan sekiz borcun üçünü düzeltsin diye geri
gönderildi. Bu bir turdur ve KRİTİK yoktu.

Hata T0'ın Stop kancası tarafından hatırlatılmasıyla fark edildi ve mühür atıldı;
ama fark ettiren şey kural değil, **kancanın ısrarıydı.**

### Öneri

`complete`, denetim kaydında `HUKUM: GECTI` görüyorsa ve T0 mühür yerine tur açmaya
kalkıyorsa (`reopen`), **KRİTİK metni istesin.** "Borç düzeltmesi" gerekçe olarak
kabul edilmesin. Borç düzeltmesi mühürden **sonra** gelen ayrı bir commit'tir.


## 4. Kusur D — Paylaşılan durum `.gitignore`da, uzak makine göremiyor

### Belirti

`.calisma/kaynak/` 3,5 GB, beş dosya, ve **ölçümlerin ortak temeli**. Depoda değil.
Hangi makinede olduğu hiçbir belgede yazmıyor. Bugün bu yüzden bir paket düştü.

Dahası, havuzun kendisinde kayıtlı ama düzeltilmemiş bir kusur var:

```
parca-1.mkv   video yok ses YOK    60,399 sn
parca-2.mkv   video + AAC ses      60,442 sn
parca-3.mkv   video + AAC ses      60,432 sn
```

Ses akışı hedef boyuttan yer. Üç parça arasında A/B yapan her ölçüm haksız. Bu
daha önce bir kez ölçümü bozdu, günlüğe geçti, **havuz düzeltilmedi** — çünkü
havuz git'te değil, düzeltmeyi taahhüt edecek bir yer yok.

### Kök neden

Röle, paylaşılan ölçüm girdisi diye bir kavram tanımıyor. Kod git'te, sözleşme
git'te, rapor git'te — ama **ölçümün girdisi** hiçbir yerde. Sahibi yok, sürümü yok,
sağlaması yok.

### Öneri

`scripts/kaynak.js` — paylaşılan ölçüm girdilerinin kaydı:

- Depoda `.claude/relay/kaynaklar.json`: her girdi için ad, boyut, **sha256**,
  nereden alınacağı (URL / sürüm etiketi), ve bilinen kusurları.
- `kaynak.js dogrula` yerel dosyaları sha256 ile sınar; eksik ya da farklıysa söyler.
- Paket ve sözleşme, kullandığı kaynağı **ada göre** anar; `packet.js check` o adı
  `kaynaklar.json`da arar. Yoksa paket gönderilmez.

Bugün bu elle yapıldı: üç parça özel bir depoya sürüm varlığı olarak yüklendi,
sha256'ları yazıldı, bilinen ses kusuru sürüm notuna geçti. Betikle yapılmalıydı.


## 4b. Kusur E — `complete`in "ölü dosya" uyarısı yanlış alarm veriyor

`contract.js complete` mühürden sonra şunu basıyor:

```
Nothing else in the tree names these files:
  tests/VidShrink.Tests/PlanCalculatorProbeTests.cs
  docs/olcumler/ui-yoklama-donmasi.md
If their work is done, move them under trash/. Do not delete them.
```

Uyarının ölçtüğü şey: dosyanın **adı** ağacın başka bir yerinde geçiyor mu.
Ölçmek istediği şey: dosya kullanılıyor mu. İkisi iki farklı sorudur ve iki dosya
sınıfında ayrışıyorlar:

- **Test dosyaları.** xUnit testleri yansımayla bulunur; hiçbir dosya onların adını
  yazmaz. Kural harfiyen uygulansa T130'un yeni ölçüleri `trash/`e taşınacaktı —
  yani sözleşmenin ürettiği kanıt, sözleşme mühürlenir mühürlenmez silinecekti.
- **`docs/olcumler/` raporları.** Bunlar tasarım gereği uç düğümdür; kimse onlara
  bağlanmaz, proje kuralı da (`AGENTS.md`) "rapora giren sayı `docs/`e taşınır"
  diyor. Uyarı, kendi projesinin kuralıyla çelişiyor.

Bu turda uyarı iki kez çıktı, iki kez de yanlıştı. Tehlikesi düşük görünüyor ama
değil: doğru olduğu durumla yanlış olduğu durum aynı metinle geliyor, bu yüzden
T0 ya hepsini uygular (kanıt silinir) ya hiçbirini (uyarı gürültüye döner). Bugün
ikincisi oldu — yani uyarı fiilen çalışmıyor.

**Öneri.** Uyarıyı dosya sınıfına göre kısıtla, model gerekmez:

- `tests/` altındaki dosyalar ve `docs/` altındaki `.md` dosyaları hiç sorulmaz.
- Kalanlar için ad araması yerine **dile göre içe aktarma araması** yapılsın
  (`import`/`require`/`using`/`#include`), ki `harita.js` bunu zaten üretiyor.
- Eşleşme bulunamayan dosya için uyarı, "taşı" değil "şu dosyayı kimse çağırmıyor,
  öyle mi" biçiminde sorulsun.

Ölçüsü: uyarının çıktığı ilk 20 dosyada yanlış alarm oranı. Bugünkü oran 2/2.

## 4c. Kusur F — Denetim kaydı ajanın TİPİNE bakıyor, işine değil

T128'in denetimi yapıldı, geçti, üç koşumla mutasyonları kendi elinde yeniden
üretti. Kayıt tutulamadı:

```
node contract.js audit --id T128 --run-id <ajan> --verification "..."
Refused - auditorRunId points at a non-auditor agent record: worker
```

Sebep: denetçi ajanı `teknesyum-core:worker` tipiyle açılmıştı. Ajanın *rolü*
istemde yazılıydı, rol dosyası (`agents/auditor.md`) okundu, ajan kurallara
harfiyen uydu — depoya hiç yazmadı, `git status --porcelain` boş döndü. Ama
kapı istemi okumuyor, ajan kaydındaki tip alanına bakıyor.

Asıl tehlike bu değil. Tehlike şu: **`complete` yine de geçti.** Risk `low`
hesaplandığı için denetim kaydı zorunlu değildi ve mühür işlendi. Yani:

- Düşük riskli sözleşmede kayıt sessizce kaybolur; denetim yapılmış görünmez.
- Yüksek riskli sözleşmede mühür düşer ve sebebi **ancak o an** görülür — yani
  denetim koştuktan, token harcandıktan sonra.

İkisi de aynı kök: tip uyuşmazlığı denetim **başlarken** değil, denetim
**bittikten sonra** yakalanıyor.

**Öneri.** İki yerde kapı, ikisi de model çağırmaz:

1. `contract.js` bir `audit --dry-run <ajan-id>` alt komutu versin; T0 denetçiyi
   açmadan önce tipin kabul edilip edilmeyeceğini sorabilsin.
2. `complete`, risk `low` olsa bile kayıtsız mühürde **tek satır uyarı** bassın:
   "bu sözleşme denetim kaydı olmadan kapandı". Bugün hiçbir şey demiyor;
   127 sözleşmenin 116'sında kayıt var, 11'inde neden yok, bilinmiyor.

Ölçüsü: kayıtsız kapanan sözleşme sayısı. Bugünkü değer 12'ye çıktı.

## 4d. Kusur G — `verify` filtresinin ölü kolu sessizce geçiyor

**Nerede.** `contract.js`, `verify` adımlarını çalıştıran yer.

**Ne oldu.** `dotnet test --filter` içinde vstest'in varsayılan işleci
`FullyQualifiedName~`, yani alt dizi eşlemesi. **Hiçbir teste denk gelmeyen bir
filtre kolu hata vermez; sıfır test seçer ve süit yeşil döner.** Sözleşme
mühürlenir, kimse ölçünün koşmadığını görmez.

VidShrink'te iki mühürlü sözleşmede var. `grep -rl "class <ad>" tests/` ile sayıldı:

| sözleşme | filtre kolu | eşleşen sınıf |
|---|---|---:|
| T116 | `MeasuredQualityTests` | 0 |
| T130 | `HdrResolverTests` | 0 |

Aynı sözleşmelerin öteki kolları gerçek (`QualityMeterTests`, `PlanCalculatorTests`,
`PlanCalculatorProbeTests`, `EncoderCapabilitiesTests` — dördü de 1). Yani kusur
"filtre tümden yanlış" değil, **çok kollu bir filtrenin bir kolu ölü**. Gözle en zor
görülen hâli bu: komut çalışıyor, çıktı yeşil, sayı biraz düşük.

İkinci bir yüzü T130'da duruyor: `verify` satırının kapanış tırnağı eksik —
`...|EncoderCapabilitiesTests]`. Betik bunu da kabul etti.

**Neden yakalanmadı.** `verify` çıkış koduna bakıyor. Sıfır test seçen bir koşum
çıkış kodu 0 veriyor.

**Önerilen çözüm.** İkisi de model çağırmaz:

1. `verify` bir `dotnet test --filter` adımıysa `--list-tests` ile önce kolları say;
   sıfır eşleşen kol varsa **reddet** ve hangi kol olduğunu yaz. Aynı denetim
   `precheck --id` içinde de koşar, yani iş başlamadan görülür.
2. `verify` satırını ayrıştırırken dengelenmemiş tırnak/parantez varsa reddet.

**Nasıl ölçülür.** Kayıtsız kolla mühürlenen sözleşme sayısı. Bugünkü değer 2.

## 4e. Kusur H - Kapi, ana dali degil her dali kapatiyor

### Belirti

`guard.js` icindeki `merging()` kancasi, herhangi bir sozlesme `active` ya da
`submitted` iken `git merge` veya `git push` **iceren her Bash komutunu** durduruyor.
Eslestirdigi kalip hedef ref'e hic bakmiyor:

```js
const MERGING = /git\s+(?:-[^\s]+\s+)*(merge|push)/i;
```

Oysa protokolun kendisi her yapici ajandan **kendi is dalini itmesini** istiyor
(`AGENTS.md`: "kendi dalinda calis ve oraya it"). Yani kapi, is akisinin zorunlu
adimini engelliyor. Ajanin onundeki tek yol kapiyi acmak:
`TEKNESYUM_GATE_OPEN=1` ile ayni komutu tekrarlamak.

T138 ajani bunu yapip bildirdi ve sordu: *"kapinin hedefi main iken her dali
engellemesi kasitli mi?"* Soru yerinde - son dort sozlesmede en az dort ajan ayni
yolu buldu.

### Ikinci yuz: komut degil metin taraniyor

Bu raporun kendisi kapiya takildi. Yukaridaki paragrafi dosyaya yazan Python
betigi hicbir git komutu calistirmiyordu; icinde ornek komutun **metni** geciyordu
diye engellendi. Kalip komutun ne yaptigina degil, karakter dizisine bakiyor.

Sonuc: kapi hakkinda belge yazmak, kapiyi acmayi gerektiriyor.

### Neden bu, kapiyi tumden gecersiz kiliyor

Kapinin korudugu sey `main`. Ama ajan, **kendi dalini itmek icin** ogrendigi env
degiskeni ile `main`e de itebilir; ikisi ayni anahtar. Yani kapi, korumak istedigi
kapiyi acmayi her yapiciya rutin olarak ogretiyor.

Bir kapi, mesru isi engelledigi olcude asilmayi ogretir. Bugun
`TEKNESYUM_GATE_OPEN=1` sozlesme surecinin normal bir parcasi hale geldi -
istisna degil, adim.

### Kok neden

Kalip komut **metnini** tariyor, komutun **hedefini** degil. Is dalina giden itme
ile `main`e giden itme kapi icin ayni komut; hatta ikisinden soz eden bir cumle de
oyle.

### Oneri

`merging()` hedef ref'i cozsun, yalniz korunan dala giden isi durdursun:

1. Acik ref verilmisse: ref korunan dal (`main`, `master`) degilse **gecir**.
2. Ref yoksa `git symbolic-ref --short HEAD` ile mevcut dala bak; korunan dal
   degilse gecir.
3. `git merge` icin ayni: HEAD korunan dalda degilse gecir. Bir is dalinin `main`i
   kendi icine almasi normal tazelemedir, engellenmemeli.
4. Kalibi komutun **basina** demirle (`^` veya `;`/`&&` sonrasi), boylece metin
   icinde gecen ornekler eslesmesin.
5. Korunan dala `--force` ile giden itme, kapi acik olsa bile ayri onay istesin.

Boylece ajan kendi dalini kapiyi hic acmadan iter; `TEKNESYUM_GATE_OPEN` yeniden
istisna olur.

**Nasil olculur.** Bir sozlesme turunda `TEKNESYUM_GATE_OPEN=1` yazilma sayisi.
Bugunku deger: yapici basina en az 1, T0 icin tur basina 2-3.

## 5. Neden hiçbiri fark edilmedi

Ortak desen: **röle kendi ürettiği metni denetlemiyor.**

Denetlenen şey her zaman *ajanın işi* oldu — kod, rapor, ölçüm. T0'ın ürettiği
metinler (sözleşme, paket, plan) hiç denetlenmedi. Oysa bugünkü hata bir kod hatası
değil, bir **sözleşme hatası**ydı: yanlış ön koşul üzerine yazılmış talimat.

Sayı bunu doğruluyor: 116 denetim kaydının **hepsi** ajan çıktısına bakıyor. T0'ın
yazdığı 127 sözleşme ve 5 paket için sıfır denetim kaydı var.

Birinci raporun 2. kusuru (manşet veriden kayıyor) da aynı ailedendi ve en keskin
kanıtı şuydu: kusur, tam o kusuru yakalamak için yazılmış aracın **kendi içinde**
çıktı. Yazan taraf kendi metnini denetleyemiyor — ne ajan, ne T0.

### Öneri — en ucuz kapı

`contract.js` ve `packet.js` yazma anında koşsun, model çağırmadan:

- Metinde geçen her dosya yolu için: taahhütlü mü, üretilecek mi, indirilecek mi.
- `.gitignore` kesişimi.
- `verify:` gerçekten liste mi (birinci raporun 3. kusuru — sessizce boş `verify`).
- `owns` glob içeriyor mu (birinci raporun 5. kusuru — mühürde reddediliyor).
- Tur ≥3 ise danışman kaydı var mı.

Beşi de deterministik. Model gerekmiyor. Bugün bunların **hiçbiri** koşmuyor.


## 6. Öncelik

| # | Kusur | Bugüne kadarki bedeli | Düzeltme | Nerede |
|---|---|---|---|---|
| 1 | Paketin kapısı yok | 1 paket düştü, 1 tur | `packet.js check` + `.gitignore` kesişimi | yeni betik |
| 2 | Danışman kuralı zorlanmıyor, eşiği de geç | 18 turun 15'i danışmansız; kuralın bağladığı 4 yerin 1'i ihlal | `reopen --advisor` zorunlu, eşik tur 3'e insin | `contract.js` |
| 3 | Tur KRİTİK'siz açılıyor | 1. raporun ölçtüğü 72 ek turun bir kısmı | `reopen --kritik` zorunlu | `contract.js` |
| 4 | T0 metni denetlenmiyor | Bugünkü hatanın tamamı | yazma anında deterministik sınama | `contract.js`, `packet.js` |
| 5 | Paylaşılan girdi kayıtsız | 1 paket düştü, 1 ölçüm haksız çıktı | `kaynaklar.json` + sha256 | yeni betik |
| 6 | `complete` yanlış alarm veriyor | uyarı fiilen yok sayılıyor, 2/2 yanlış | `tests/` ve `docs/*.md` muaf, ad yerine içe aktarma araması | `contract.js` |
| 7 | Denetim kaydı ajan tipine bakıyor | 1 denetim kayıtsız kaldı, kayıtsız kapanan 12'ye çıktı | `audit --dry-run` + kayıtsız mühürde uyarı | `contract.js` |
| 8 | `verify` filtresinin ölü kolu | 2 mühürlü sözleşmede ölçü hiç koşmadı | `--list-tests` ile kol sayımı + tırnak denetimi | `contract.js` |
| 9 | Kapi her dali kapatiyor | Kapiyi acmak rutin oldu; `main` korumasi fiilen yok | `merging()` hedef ref'i cozsun | `guard.js` |

İlk dördü model çağırmaz. Beşincisi tek seferlik kurulum.


## 7. Ne kusur değildi

Dürüstlük için, birinci raporun aynı başlığıyla:

- **Denetimin kendisi.** 116 denetim kaydı ve bugünkü T134 denetimi işe yaradı:
  denetçi bir **ölçek hatası** buldu (`signalstats` 10 bit girdide 10 bit raporluyor,
  rapor sütunu "8 bit" diyordu — 4 kat uyuşmazlık) ve hükmün 12 hücresini bağımsız
  yeniden hesapladı. Sözleşme kapısı olan tek yer, düzgün çalışan tek yer.
- **Ajanın kendi kusurunu bulması.** T114 bugün kendi ölçümünü geçersiz saydı: dalına
  `main` geldiğinde plan çözünürlüğü değişti, ölçtüğü commit yanlış oldu, dört
  kriteri silip baştan koştu. Bu, birinci raporun 2. kusurunun (ölçülen commit
  yanlış) ajan tarafından kendiliğinden yakalandığı ilk kez.
- **Paketin geri dönmesi.** Ajan eksik dosyayı görünce uydurmadı, sormaya geldi ve
  üç seçenek sundu — ikisi ölçümü sessizce geçersiz kılacak seçeneklerdi. Doğru
  davranış buydu; kusur paketi yazandaydı.
