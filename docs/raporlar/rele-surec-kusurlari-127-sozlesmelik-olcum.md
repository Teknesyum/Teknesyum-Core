# Röle süreç kusurları — 127 sözleşmelik ölçüm

İkinci rapor. Birincisi (`rele-israfi-124-sozlesmelik-olcum.md`) **neyin boşa gittiğini**
ölçtü. Bu rapor **neden kimsenin durdurmadığını** ölçüyor.

Aradaki fark önemli: birinci raporun 11 kusuru tek tek düzeltilebilir. Buradaki dört
kusur ise düzeltmenin kendisinin neden gelmediğini anlatıyor — yazılı kural var,
kuralı işleten kapı yok.

Ölçüm tabanı: VidShrink deposu, 127 mühürlü sözleşme, 5 görev paketi, 116 denetim
kaydı. Sayılar `.claude/relay/` altından sayıldı, tahmin yok.


## 0. Hüküm

**Röle yalnız sözleşmeleri denetliyor. Sözleşme dışında kalan her şey denetimsiz.**

Üç somut sonuç:

| Ne | Kaç kez oldu | Kaç kez denetlendi |
|---|---|---|
| Sözleşme | 127 | 116 |
| Görev paketi | 5 | **0** |
| Tur 3'ü geçen sözleşme (danışman zorunlu) | 14 | **0** |

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

| Tur | Sözleşme sayısı |
|---|---|
| 0 | 10 |
| 1 | 68 |
| 2 | 40 |
| 3 | 10 |
| 4 | 4 |

**14 sözleşme üçüncü turu gördü.** Danışman kaçında çağrıldı: **0.**

`advisor`, `plan konseyi` ya da `fable` geçen üç sözleşme var — T44, T47, T96 — ve
üçü de tur ≥3 listesinde **değil**:

- `contracts/done/T44.md:82` — "İkinci görüş (fable)", tur 1'de alınmış.
- `contracts/done/T47.md:48` — "Danışman kararı (fable, bu oturumda alındı)", tur 1.
- `contracts/done/T96.md:5` — `model: fable`. Bu bir **model seçimi**, danışman
  çağrısı değil.

Yani danışman iki kez çağrıldı ve ikisi de kuralın **gerektirmediği** yerdeydi.
Kuralın gerektirdiği 14 yerin hiçbirinde çağrılmadı.

### Kök neden

Kural bir cümle olarak duruyor, kod olarak durmuyor. Tur açan tek şey T0'ın kararı;
T0 turu açarken hiçbir betik "bu üçüncü tur, danışman nerede" diye sormuyor.

Karşılaştır: `complete` kapısı denetim kaydı yoksa mühür atmıyor — ve tam da bu
yüzden 127 sözleşmenin 116'sı denetlendi. Kapısı olan kural işledi, olmayan işlemedi.
Aradaki fark disiplin değil, kod.

### Neden bu pahalı

Tur 3'e gelen bir sözleşme tanım gereği iki kez yanlış anlaşılmış demektir. Orası
tam olarak ikinci bir aklın gerektiği yer. 14 kez o eşiğe gelindi, 14 kez aynı akıl
üçüncü kez denedi. Dört sözleşme tur 4'e kadar gitti.

Birinci raporun ölçtüğü 72 ek turun kuyruğu buradadır: tur 3 ve 4'ler toplam
**22 tur** (10×1 + 4×2 fazladan) — ve hiçbirinde dışarıdan bir göz yok.

### Öneri

`contract.js reopen --id T## --kritik "<tanim>"` (birinci raporun 11. maddesi) zaten
öneriliyordu. Buraya bir kapı daha eklensin:

- `round >= 3` ise `reopen` **`--advisor <ajan-id>` istesin.** Danışman kaydı yoksa
  tur açılmasın.
- `round >= 5` ise `reopen` tümden reddetsin; sözleşme borçla mühürlensin ya da
  yeniden yazılsın.

Danışmanın ne söylediği `audits/` gibi bir yere kaydedilsin ki sonradan sayılabilsin.


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
| 2 | Danışman kuralı işlemiyor | 14 sözleşmede eşik aşıldı, 22 tur danışmansız | `reopen --advisor` zorunlu | `contract.js` |
| 3 | Tur KRİTİK'siz açılıyor | 1. raporun ölçtüğü 72 ek turun bir kısmı | `reopen --kritik` zorunlu | `contract.js` |
| 4 | T0 metni denetlenmiyor | Bugünkü hatanın tamamı | yazma anında deterministik sınama | `contract.js`, `packet.js` |
| 5 | Paylaşılan girdi kayıtsız | 1 paket düştü, 1 ölçüm haksız çıktı | `kaynaklar.json` + sha256 | yeni betik |

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
