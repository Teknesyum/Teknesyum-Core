# Rapor: rölenin israfı — 124 sözleşmelik ölçüm

**Durum:** açık.
**Kaynak:** VidShrink projesi, tek T0 oturumu, 20 Ağustos – 2 Eylül 2026.
**Kapsam:** 124 mühürlü sözleşme, 113 denetim kaydı, 169 defter satırı, 835 satırlık
`_sorun.log`.
**Yazan:** T0 (ana oturum), kullanıcı talebiyle.
**Amaç:** Core bu kusurları bilsin ve mekanizmayı düzeltsin. Aşağıdaki her maddede
belirti ölçülmüştür; öneriler Core'daki somut betiği adlandırır.

---

## 0. Tek cümlelik hüküm

Röle **işi bitirdi ama ucuz bitirmedi.** Harcamanın en büyük tek kalemi yeni özellik
değil, **düzeltme turu**: 124 sözleşmenin 54'ü (%43,5) en az bir ek tur gördü ve
toplam **72 ek tur** koşturuldu. Bu turların çoğu koddaki hatadan değil, **raporu
özetleyen cümlenin veriden kaymasından** açıldı.

---

## 1. Ölçülen taban

Tur dağılımı (mühürlü sözleşmelerin `round:` alanından sayıldı):

| tur | sözleşme | anlamı |
|---|---|---|
| 0 | 10 | belge işi, tur sayacı hiç artmadı |
| 1 | 60 | ilk teslimde kabul |
| 2 | 40 | bir ek tur |
| 3 | 10 | iki ek tur |
| 4 | 4 | üç ek tur |

Ek tur toplamı: `40×1 + 10×2 + 4×3 = 72`.

Bir tur = bir yapıcı ajan (soğuk başlangıç ~4–15k token) + bir denetçi ajan
(ölçülen iki denetimde 95k ve 100k token). Yani **72 ek tur, kabaca oturumun en
pahalı kalemi** ve tamamı "iş zaten teslim edilmişti, geri gönderildi" demek.

`_sorun.log` dağılımı (835 satır, son alana göre gruplandı):

| adet | kayıt |
|---|---|
| 129 | risk `high` damgası |
| 62 | `end_turn` |
| 40 | `Exit code N` |
| 38 | risk `medium` damgası |
| 19 | `File does not exist` — hepsi çalışma dizini karışıklığı |
| 13 | `N kez Bash` |
| 9 | `unexpected EOF while looking for matching quote` |

Anahtar geçişleri: `bash` 126, `owns` 44, `python` 17, `dotnet` 17, `kapı/gate` 6.

---

## 2. Kusur 1 — manşet kayması *(en pahalı, 18+ tekrar)*

**Belirti.** Tablo doğru, tabloyu özetleyen cümle yanlış. Rapor gövdesi ölçümle
uyumlu; onu anlatan cümledeki sayı, sayım ya da oran uydurma.

**Ölçülen örnekler (yalnız son üç günden):**

- `ucuncu-durum.md:94` — "Dokuz sahteyi kırar", hemen üstündeki liste **on** öğe.
- `ucuncu-durum.md:187` — üç ölçü adlandırılıp "ikisi de kırıldı"; mutasyon tablosu
  üçüncüsü için kıran mutasyon göstermiyor.
- `ucuncu-durum.md:252` — "33 ölçü", statik sayım 32.
- `iptal-ulasmiyor.md:7` — "0,1–8,8 s", hiçbir koşum 435 ms'i geçmiyor (gerçek 93–427 ms).
- `tepe-egrisi.md:433` — "1,50 her yerde 1,10'un altında", kendi K1 tablosunda
  16 000'de 1,50 → 78,525 > 1,10 → 78,475.
- `surucu-yoklugu.md:317` — "her sınır tam bir yük basamağı satın alıyor",
  kendi tablosunda 4000→8000 hiçbir basamak satın almıyor.
- `T123.md` — tur 2'de geri çekilen "360 kat" ve "74,3/76,5" sözleşmede **düzenlenmiş
  hâlde duruyordu**; mühürden önce T0 işaretledi.
- `ui-yoklama-donmasi.md:120` — "24 tekrar", üreteci 8 tekrar koşuyor.
- `LOG.md` T130 satırı — "172–647 ms", tablodaki gerçek aralık 173–599.

**En keskin kanıt.** T135 tam bu kusuru yakalamak için yazılmış bir araç üretti
(`harita-tazeleme.py`: yol haritasındaki her hükmü veriden üretir ve doğrular).
**Kusur o aracın kendi içinde çıktı:** `:483`'te elle yazılmış "30 satır" sayısı,
aracın bugünkü çıktısıyla (64 satır) çelişiyordu. Yani disiplin, kendi disiplin
aracını yazarken bile tutmadı.

**Kök neden.** Sayıyı tablo üretir, cümleyi model yazar. İkisi arasında hiçbir
bağ yok. Kural yazmak durdurmadı — sekiz sözleşme boyunca aynı kural tekrarlandı
ve kusur tekrarladı.

**Önerilen çözüm (Core).** İki katman, ikisi de betik:

1. `scripts/manset.js` — bir markdown dosyasındaki **düzyazıdaki her sayıyı**
   çıkarır ve aynı dosyadaki tablo hücrelerinde ya da adı verilen kaynak dosyada
   birebir geçtiğini doğrular. Geçmeyen her sayı bulgu. Çıkış kodu bulgu sayısı.
2. `contract.js` — `owns` içinde `.md` varsa `manset.js`'i **otomatik bir verify
   adımı olarak ekler.** Sözleşme yazarının hatırlaması gerekmez.

Ek olarak sözleşme şablonuna tek satır: *"N madde/ölçü/kat diyen her cümle, o N'i
üreten komutu yanında taşır."*

**Uyarı — bu kusurun ikinci yüzü.** VidShrink'te doğrulayıcının kendisi de kaçırdı:
`harita-tazeleme.py:518` `if deger not in kaynak` diyerek **tüm dosyada** arıyor,
çapada değil. Denetçi gösterdi: bir sayı bozulduğunda başka bir bölümde de geçtiği
için doğrulama yeşil kaldı. `manset.js` yazılırken **çapa (satır/bölüm) eşleşmesi
zorunlu** olmalı; dosya geneli substring araması bu kusuru gizler.

---

## 3. Kusur 2 — `verify` sessizce boşa düşüyor *(en tehlikeli)*

Üç ayrı yüzü ölçüldü ve **üçü de mührü yalancı yeşil yapıyor.**

**(a) Düz metin `verify` sıfır adım demek.**
`T129.md` şöyleydi: `verify: dotnet test ... --filter "..."`. Köşeli parantez yok.
YAML bunu tek dizge olarak okuyor, `contract.js` adım listesi bekliyor, sonuç:
**sıfır doğrulama adımı.** Sözleşme hiçbir test koşturmadan mühürlenecekti. T0
mühürden önce elle yakaladı; yakalamasaydı kimse fark etmezdi.

**(b) Filtre kendi testlerini eşlemiyor.**
`T130.md` filtresi `PlanCalculatorTests|HdrResolverTests|EncoderCapabilitiesTests`
idi. vstest'in varsayılan işleci `FullyQualifiedName~`; T130'un asıl 16 ölçüsü
`PlanCalculatorProbeTests` sınıfında ve bu üç dizginin **hiçbirini içermiyor**.
Denetçi koşturdu: filtre 19 test topluyor, hiçbiri o dalın testi değil. Mühür bu
filtreye dayansaydı T130'un tüm ölçüleri kapıdan hiç geçmezdi.

**(c) Sıfır ölçü eşleyen ad.** Daha önce bir sözleşmede kaldırılmış bir test sınıfı
adı filtrede kalmıştı; filtre çalışıyor, sıfır test topluyor, `dotnet test` yine 0
dönüyor.

**Önerilen çözüm (Core), üçü de `contract.js`'te:**

1. `verify:` düz dizge ise **hata ver ve dur.** Sessizce boş liste olarak
   ayrıştırma. Bu tek satırlık kontrol, (a)'yı tümden kapatır.
2. `dotnet test` adımlarında **toplanan test sayısını oku**; sıfırsa `complete`
   reddet. "Başarısız: 0" ile "hiç test yok" ayrımı bugün yapılmıyor.
3. `submit` anında filtredeki her `|` parçasını depoda **ara**; eşleşmeyen parça
   varsa uyar. Bu (b) ve (c)'yi teslim anında yakalar, mühür anında değil.

---

## 4. Kusur 3 — paralel koşum ölçünün kendisini bozuyor

**Belirti.** Duvar saatine bağlı testler, kardeş ajanlar `dotnet test` koşturduğunda
kırmızıya dönüyor. Mühür tıkanıyor, iş yeniden koşturuluyor.

**Ölçülen.** Bir ajan makinede **47 `dotnet` süreci** saydı. Tek bir `verify`
adımı **9 dakikaya** çıktı. T123'ün mührü iki kırmızıyla düştü
(`DonanimYoluKapatilincaKararDegisiyor`, `OlcumYukAltindaYalnizAgirlasiyor` —
"yük altında maliyet düştü: en düşük boş okuma 2.739, yüklü 1.761").

**Kanıt ki gerçek regresyon yoktu:** aynı test tek başına koşturuldu →
`Başarısız: 0, Başarılı: 1, Süre: 1 m 11 s`. Ajanlar limitle düşüp makine
boşaldıktan sonra **aynı filtrenin tamamı yeşil geçti** ve T123 mühürlendi. Yani
iki kırmızı da tamamen yapıntıydı; kaybedilen tek şey T0'ın zamanı ve bir mühür
turu.

**Kök neden.** `parallel_width` ajan sayısını sınırlıyor ama **ölçüm koşumlarını
sınırlamıyor.** On ajan aynı anda test koşabilir ve hiçbiri ötekinin varlığını
bilmez.

**Önerilen çözüm (Core).** `contract.js` verify adımına **makine düzeyinde dışlayıcı
kilit** koy: `~/.claude/teknesyum-run.lock`. Bir seferde tek test süiti koşar,
ötekiler sıraya girer. Kilit dosyasına PID ve sözleşme kimliği yazılır; 20 dakikada
bir bayat kilit temizlenir. Ayrıca `live/<id>.json`'a "şu an test koşuyorum" alanı
eklenip statusline'da gösterilebilir.

Bu kilit paralelliği öldürmez — ajanlar okuma, yazma, derleme, düşünme işlerini
paralel yapmaya devam eder; yalnız **saat ölçen kısım** sıraya girer.

---

## 5. Kusur 4 — `owns` globu yalnız mühür anında reddediliyor

**Belirti.** `owns: [..., tools/tepe-egrisi/**]` yazılıyor, sözleşme koşuyor, iş
bitiyor; `complete` anında "glob kabul edilmez" deyip reddediyor. T0 elle 13 dosyaya
genişletiyor. T108, T123, T135'te tekrarladı.

**Kök neden.** Doğrulama en geç anda yapılıyor.

**Önerilen çözüm (Core).** `contract.js submit` (hatta sözleşme yazılır yazmaz
`validate`) globu **o anda** ya reddetsin ya da genişletip dosyaya yazsın.
Genişletme deterministik; model gerektirmiyor.

Yan bulgu: `complete` "13 dosya (sınır 8)" diyerek riski `high`'a çekiyor. Glob
otomatik genişletilirse bu sınır her büyük sözleşmede yanlış alarm verecek —
genişletilmiş glob ile elle yazılmış uzun liste ayrı sayılmalı.

---

## 6. Kusur 5 — denetçi worktree-yerel dosyayı "yok" sanıyor

**Belirti.** Denetçi `git archive <dal ucu>` ile depo dışında çalışıyor. `main`
bu arada ilerlediyse, main'de var olan bir dosya denetçinin kopyasında yok ve
denetçi bunu **eksik iş** olarak raporluyor.

**Ölçülen.** T129'un denetçisi `EncoderAvailabilityTests` sınıfını "depoda yok"
dedi ve bir borç yazdı; sınıf T123'ün birleşmesiyle main'e girmişti. Borç geçersiz
sayıldı. Aynı kusur daha önce T78'de **yanlış bir KRİTİK** üretti — yani bir tam
düzeltme turu boşa açıldı.

**Önerilen çözüm (Core).** Denetçi rol dosyasına zorunlu adım: *"Bir dosya yok
görünüyorsa mühür öncesi `git show main:<yol>` ile main'de de bak."* Daha iyisi:
`contract.js` denetçiye arşivi **dal ile main'in birleşiminden** üretsin —
denetçinin göreceği ağaç, mühürlenecek ağaçla aynı olur.

---

## 7. Kusur 6 — kapı tek taraflı ve komut metnine takılıyor

İki ayrı kusur, ikisi de `guard.js`.

**(a) Kapı komutun metnine bakıyor, hedefine değil.** Aktif sözleşme varken
`merge`/`push` kelimesi **geçen** her Bash çağrısı engelleniyor — o kelimeyi yalnız
*içeren* bir heredoc dosya yazımı dahil. Ölçülen: bir mühür betiğini `cat > f <<'EOF'`
ile yazmak reddedildi, çünkü betiğin **içinde** "push" geçiyordu. Bu Core'da kapalı
bir HATA olarak kayıtlı ama davranış sürüyor.

**(b) Kapı yalnız Bash'i tutuyor.** PowerShell aracı kancasız. VidShrink'teki her
birleştirme, itme ve mühür işlemi bu yüzden PowerShell'den geçti. Kapı bir güvenlik
mekanizması olarak **tek taraflı**: disiplini uygulayan taraf onu kolayca atlıyor.
Bu bir kolaylık değil, kapının hükümsüzlüğü.

**Önerilen çözüm.** (a) için: kapı komutu ayrıştırsın, yalnız `git merge`/`git push`
**çağrısını** yakalasın, dizge aramasın. (b) için: aynı kanca PowerShell aracına da
bağlansın — yoksa kapının varlığı yanlış güven veriyor.

---

## 8. Kusur 7 — ajan boş beklemede kilitleniyor

**Belirti.** Ajan arka planda bir ölçüm başlatıyor, sonra "arka plandaki ölçümün
bitmesini bekliyorum" diyerek turu kapatıyor. İş ilerlemiyor; T0 elle dürtmek
zorunda.

**Ölçülen.** T132'nin ajanı **iki kez** aynı cümleyle durdu. Her dürtme bir T0
turu ve bir ajan turu demek.

**Önerilen çözüm (Core).** Sözleşme şablonuna kalıcı madde: *"Arka planda başlattığın
işi **bitirmek** senin işin, beklemek değil. Tamamlanma çıktısını doğrudan oku ya da
ön planda bitir. 'Arka plandaki ölçümü bekliyorum' diyerek turu kapatma."* Ayrıca
`watch.js` bir ajanın art arda iki turu üretimsiz kapattığını görürse `_sorun.log`'a
yazsın.

---

## 9. Kusur 8 — toplu limit ölümü, kayıt noktası yok

**Belirti.** Dokuz ajan aynı anda `429 session limit` ile düştü. Kimi dalını itmişti,
kimi itmemişti; hiçbiri nerede kaldığını yapılandırılmış biçimde yazmamıştı.
Kurtarma T0'ın elle her ajanın son satırını okumasıyla oldu.

**Önerilen çözüm (Core).** Sözleşme şablonundaki `## Kayıt noktası` bölümü bugün
serbest metin ve **çoğu ajan hiç doldurmuyor.** `live/<id>.json`'a her araç
çağrısında değil ama her **kabul kriteri** bitiminde otomatik satır düşsün:
`{kriter: "K3", durum: "gecti", commit: "<sha>"}`. Ajan ölürse T0 tek dosyadan
nerede kalındığını okur.

---

## 10. Kusur 9 — verify adımlarının kabuğunda `python` ve `bash` yok

**Belirti.** `contract.js` verify adımlarını node alt süreciyle koşturuyor; o sürecin
`PATH`'inde `python` ve `bash` yok. Kurulu ve çalışıyor olmaları yetmiyor.

**Çalışan biçim** (VidShrink'te elle bulundu, her sözleşmede tekrar yazılıyor):
`C:/PROGRA~1/Git/bin/bash.exe`, `C:/Users/.../python.exe` — tam yol.

**Önerilen çözüm (Core).** `contract.js` verify adımını koşturmadan önce `python`,
`python3`, `bash` sözcüklerini **çözümlenmiş tam yolla** değiştirsin. Bulamazsa
mühür anında değil `submit` anında söylesin.

---

## 11. Kusur 10 — denetim turu KRİTİK olmadan açılıyor

**Belirti.** Kural yazılı: tur yalnız KRİTİK'te açılır, kalan her bulgu borçtur.
Uygulamada tur borç üzerine açıldı. Bir sözleşme kural yazılmadan önce **on iki tur**
döndü (Core'da kapalı HATA olarak kayıtlı). Bu oturumda da T123 tur 2'ye bir borç
üzerine açıldı ve turun kapsamı **sözlü verilip dosyaya hiç yazılmadı.**

**Önerilen çözüm (Core).** `contract.js`'e `reopen --id T## --kritik "<tanım>"` alt
komutu: tur açmanın **tek yolu** bu olsun, KRİTİK tanımı zorunlu alan olsun ve
sözleşmeye otomatik yazılsın. `round:` alanını elle artırmak kapansın.

---

## 12. Kusur 11 — paylaşılan scratchpad ve ana ağaçta dal

**Belirti.** İki ayrı olay:

- Bir ajan kendi dalını **ana çalışma ağacında** açtı; T0'ın commit'leri ajanın
  dalına düştü.
- İki ajan aynı scratchpad klasörünü paylaştı; biri ötekinin `msg2.txt` dosyasını
  okuyup **yanlış commit mesajıyla** commit attı.

**Önerilen çözüm (Core).** Ajan başına scratchpad alt klasörü (`<scratchpad>/<agent-id>/`)
ve rol dosyasında zorunlu ilk adım: *"Kendi worktree'ni kur, ana ağaçta çalışma."*
`_sorun.log`'daki 44 `owns` kaydının bir kısmı bu iki olaydan geliyor.

---

## 13. Öncelik sırası — Core hangisini önce yapmalı

| # | kusur | kazanç | maliyet |
|---|---|---|---|
| 1 | `verify` düz dizge → hata (§3a) | yalancı yeşil mührü kapatır | tek satır |
| 2 | Sıfır test toplayan filtre → red (§3b) | aynı, ikinci yüz | küçük |
| 3 | Koşum kilidi (§4) | sahte kırmızıyı ve 9 dk'lık koşumu bitirir | orta |
| 4 | `manset.js` + otomatik verify (§2) | **en pahalı kusuru** kaynağında keser | orta |
| 5 | `owns` globunu submit'te genişlet (§5) | her büyük sözleşmede elle iş | küçük |
| 6 | Denetçiye main birleşimi (§6) | boşa açılan turu önler | küçük |
| 7 | Kapıyı PowerShell'e de bağla (§7b) | kapının hükmü geri gelir | küçük |
| 8 | `reopen --kritik` (§11) | tur enflasyonunu durdurur | orta |

İlk üçü yapılırsa 72 ek turun kayda değer bir kısmı hiç açılmazdı.

---

## 14. Ne israf değildi

Dürüstlük için: harcamanın hepsi israf değil.

- **Ölçüm düzenekleri** (`tools/` altında 15+ araç) rapora giren her sayıyı yeniden
  üretilebilir yaptı. Bunlar olmasaydı aşağıdaki bulgu hiç çıkmazdı.
- **Bağımsız denetim gerçekten iş yaptı.** İki denetçi bu oturumda, teslim raporunun
  kendi verisiyle çelişen dokuzar borç buldu; ikisi de yapıcının gözünden kaçmıştı.
  Denetimi kısmak kazanılan token'dan pahalıya gelirdi.
- **En büyük kazanç bir düzeltmeydi:** projenin manşet sayısı 13 kat şişikti
  (+1,269 sanılan fark, kare kilitli yeniden ölçümde **+0,097**). Bir yol haritası
  bu yanlış sayı üzerine kuruluydu ve yeniden türetildi.

Kusur, ölçüm yapmakta değil; **ölçümü anlatan cümleyi ölçümden koparmakta.**
