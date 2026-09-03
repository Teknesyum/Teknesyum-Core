# Denetçiyi gerçek bir gözden geçirmeye çevirmek — maliyet analizi

3 Eylül 2026. Soru iki parçalı: (1) "kritik durumda denetleyici çağırılır dedik hiç
çağırılmadı", (2) deterministik denetçiyi haiku ya da sonnet ile gerçek bir gözden geçirme
sistemine çevirsek ne olur.

## 1. Önce ölçüm: denetçi gerçekten çağrılmadı mı

Çağrıldı. VidShrink defterinde:

| Ölçü | Sayı | Kaynak |
|---|---|---|
| Mühürlenen sözleşme | 216 | `.claude/relay/audits/ledger.jsonl` |
| `risk: high` çıkan | 25 | aynı defter |
| Denetçi kaydı olan yüksek riskli | 25 / 25 | aynı defter, `auditorRunId` alanı |
| Diskteki denetim kaydı (turlar dahil) | 142 | `.claude/relay/audits/*.json` |
| Kayıtların tur dağılımı | 1. tur 80 · 2. tur 43 · 3. tur 10 · 4. tur 4 | dosya adları |

Yani yüksek riskli her sözleşme denetlendi, istisnasız. Denetçi bulgusuz da değil:
metinlerinde gerçek bir KRİTİK bildiren 15 kayıt var, 48'i "KRİTİK yok" diyor.

Somut örnekler, kayıtlardan birebir:

- **T84** — "Bağımsız denetçi tur 2'ye KALDI verdi (KRİTİK: rozet sayımı 44 ziyaret
  sayımıydı, gerçek popülasyon 23)." Yeşil bir diff, yanlış bir sayı; denetçi yakaladı.
- **T100** — "Tur 2. KRİTİK kapandı: `MainWindow.axaml.cs:1889` yüklemi üç koşulu birden
  istiyor."
- **T102** — 3. turda tek KRİTİK kapandı.

Denetçinin hiç çağrılmadığı yer **Teknesyum-Core'un kendisi**: bu depoda `.claude/relay`
klasörü bile yok, tek bir sözleşme açılmamış. Core kendi kapısından geçmiyor. Sizin
gördüğünüz boşluk burası, VidShrink değil.

**Sonuç:** kapatılacak bir yol yok, kapatılacak bir yanlış izlenim var. Denetçi çalışıyor —
ama yalnızca `risk: high` çıktığında, o da 216'da 25 kez, yani **%11,6**.

## 2. Asıl açık: tetik yapısal, hata sessiz

`risk.js` yükseği şuradan hesaplıyor: hassas yol adı, 8'den çok dosya, 300'den çok satır,
silme, yeniden adlandırma. Hepsi **diff'in şeklini** ölçüyor, hiçbiri **diff'in doğru olup
olmadığını** ölçmüyor.

Fable'ın 001'de gösterdiği hata tam da bunun dışında kalıyor: küçük, tek dosyalık, yeşil ve
yanlış bir diff. Ne 300 satırı geçer, ne dosya siler, ne `auth/` altına yazar. Risk `low`
çıkar, denetçi hiç açılmaz, mühür vurulur.

Yani mesele denetçinin çağrılmaması değil, **çağrılma koşulunun yanlış şeyi ölçmesi.**

## 3. Öneri: haiku okur, opus denetler

Bugünkü denetçi tek katman: opus, araç kullanan, testleri baştan koşturan, kayıt yazan bir
ajan. Pahalı ve yalnız %11,6'da açılıyor. Önerilen iki katman:

- **Okur (`reader`)** — haiku, `mühür` anında **her** sözleşmede koşuyor. Elinde tek araç
  var (`Read`), tek işi var: sözleşmenin kabul maddelerini ve `owns` diff'ini okuyup
  `TEMİZ` ya da `ŞÜPHELİ: <tek satır>` demek. Kod yazmıyor, test koşmuyor, kayıt tutmuyor.
- **Denetçi** — bugünkü opus denetçisi, olduğu gibi kalıyor. Yeni tek şey: `ŞÜPHELİ` cevabı
  riski `high`a çekiyor, yani okur bugünkü yapısal kuralların göremediği tetiği veriyor.

Okur bir yargı mercii değil, bir **alarm**. Yanılma hakkı var; yanıldığında bedeli bir opus
denetimi.

## 4. Maliyet

Fiyatlar Mtoken başına: haiku ≈ 1 $ / 5 $, sonnet ≈ 3 $ / 15 $, opus ≈ 15 $ / 75 $.
Tipik bir sözleşme için okurun bağlamı: sözleşme gövdesi + kabul + `owns` diff'i ≈ **8 k
giriş**, cevabı ≈ **0,6 k çıkış**. `Read` yüzünden iki tur, yani girişin bir kez tekrarı.

| Katman | Model | Sözleşme başı | 216 sözleşmede |
|---|---|---|---|
| Okur, tek tur (araçsız) | haiku | ~0,011 $ | ~2,4 $ |
| Okur, iki tur (`Read` ile) | haiku | ~0,022 $ | ~4,8 $ |
| Okur, iki tur | sonnet | ~0,066 $ | ~14,3 $ |
| Bugünkü denetçi (araçlı, test koşan) | opus | ~1,50 $ | ~37 $ (25 kez) |

**Mümkün olan en düşük maliyet: sözleşme başına ~1 sent**, yani projedeki 216 sözleşme için
2–3 dolar. Bu rakama ulaşmanın tek yolu okurun **hiç aracı olmaması**: diff'i ona sözleşme
kapısı hazır bir dosyaya yazıp prompt'un içine gömmek. Araç verdiğiniz an her tur bağlamı
yeniden gönderiyor ve maliyet ikiye katlanıyor.

Sonnet aynı işi ~3 kat pahalıya yapıyor. Okurun işi "bu diff kabul maddesini gerçekten
karşılıyor mu" sorusuna evet/hayır demek; bu haiku'nun boyuna göre bir iş. Sonnet'i ancak
haiku'nun kaçırma oranı ölçülürse savunabiliriz — ölçmeden seçmek, düzelttiğimiz hatanın
aynısı olur.

### Gizli maliyetler

1. **Yanlış alarm.** Okur %10 yanlış "şüpheli" verirse 216 sözleşmede ~22 fazladan opus
   denetimi = ~33 $. Okurun kendi maliyetinden **on kat büyük.** Bu yüzden tur başına en
   çok bir yükseltme şart.
2. **T0'ın bağlamı.** Diff'i okur için T0 okursa maliyet T0'a yazılır ve okur ucuzluğu
   anlamsızlaşır. Diff'i kapı dosyaya yazmalı, T0 yalnız yolu vermeli.
3. **Kurulum.** Rol dosyası, `tiers.json` hücresi, kapıda `ŞÜPHELİ` okuma, kayıt, sav,
   iki README. Bir dalga işi — bugünkü dalgalar kadar, yani yaklaşık bir oturum.

## 5. Alternatif: hiç model kullanmamak

Aynı sessiz hatanın bir kısmı deterministik olarak da yakalanır ve **sıfır token** eder:

- Kabul maddesi metniyle diff'in kesişimi: kabul `X()` fonksiyonundan söz ediyor ama diff
  `X`e hiç dokunmuyorsa, bu bir şüphe. Saf `grep`.
- `verify` adımının gerçekten yeni koda dokunup dokunmadığı: dar filtreli bir test, diff'in
  değdiği dosyayı hiç çalıştırmıyorsa bu da bir şüphe.

Bunlar okurun yakaladıklarının hepsini yakalamaz ama en ucuz kısmını ücretsiz alır ve
okurun yanlış alarm yükünü düşürür. **Önce bunu kurmak, okuru sonra eklemek** en düşük
maliyetli sıra.

## 6. Tavsiye

1. Önce **fan-in ve plancı damgası** ölçülsün (bu turda kuruldu). Sessiz hatanın ne kadarını
   zaten kapattıklarını bilmeden okur eklemek, ölçmeden model seçmektir.
2. Sonra **deterministik kesişim kontrolü** — sıfır token, bir dalga.
3. Okur ancak 1 ve 2'den sonra, kaçan hata sayısı ölçülmüşse. Bütçesi sözleşme başına 1
   sent, tur başına en çok bir yükseltme hakkı.

Karar sizin; bu belge yalnız fiyatı koyuyor.
