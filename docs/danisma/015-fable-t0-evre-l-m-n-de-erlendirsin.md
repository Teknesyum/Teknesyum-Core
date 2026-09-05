# Fable T0 evre ölçümünü değerlendirsin

- soran: T0
- danisilan: fable
- tarih: 2026-09-05

## Sorulan

C:/Users/Teknesyum/.claude/plugins/cache/teknesyum/teknesyum-core/0.15.0/roles/advisor.md dosyasını oku ve onu izle.

Depo kökü: C:\Users\Teknesyum\Desktop\Projeler\Teknesyum Core
Soran: T0, opus. Senin koltuğun: fable/medium.

Geçen turda "T0'ın %85'i asıl kalem, ajan tarafı bitti sayılır, orada bir tur daha kovalama" demiştin. T0'ı evrelere böldüm, sonuç aşağıda. Kullanıcı son bir tablo istiyor.

## Ajan tarafı — kapandı

Aynı dondurulmuş görev metni iki kolda da, `sonnet/low`, üçer tekrar, pinlenmiş temiz klonlar, kabul betiği bağımsız koşuldu, hepsi PASS.

| Kol | Turlar | Tur medyanı | Ajan $ medyanı |
|---|---|---|---|
| native, sözleşmesiz | 11 / 9 / 12 | 11 | 0,1079 |
| Core, ajan sözleşmeye 1 kez dokunuyor | 12 / 14 / 11 | 12 | 0,1292 |
| Core, ajan sözleşmeye hiç dokunmuyor | 13 / 10 / 10 | 10 | 0,1047 |

Son satır native'in %2,9 **altında**, aralıklar örtüşüyor. Bağlanma dispatch anında, prompt'ta geçen sözleşme yolundan kuruluyor; ajanın sözleşmeye yazması hiç gerekmiyormuş. Kapının tam güçte olduğunu ayrı bir sınamayla doğruladım: sözleşmeye hiç dokunmamış bir ajan `owns` içine yazabildi, dışına yazamadı.

## T0 tarafı — evrelere bölündü

Her koşu penceresindeki T0 turlarını yaptıkları araç çağrısına göre sınıfladım.

| Koşu | T0 turu | Evreler | Tur başına cache okuma | O andaki oturum toplamı |
|---|---|---|---|---|
| N1 / N2 / N3 (native) | 2 / 2 / 2 | dispatch 1, bekleme 1 | 470k / 475k / 480k | $83 → $86 |
| K1 / K2 / K3 (Core) | 2 / 2 / 2 | dispatch 1, bekleme 1 | 579k / 581k / 584k | $116 → $117 |

Koşu başına T0 maliyeti: native $0,525, Core $0,637.

Ama tur sayısı **birebir aynı** (2 ve 2), ve tur başına cache okuma Core partisinde %23 daha yüksek çünkü o koşular oturumun ilerisinde yapıldı. T0 doları da %21 daha yüksek. Yani aradaki fark mekanizmadan değil, koordinatörün bağlamının büyümesinden geliyor.

Bir T0 turunun oturum ortalaması: **$0,2313**, tur başına **349.845 token cache okuma**.

Not: "sözleşme yazma" ve "kapanış" evreleri bu pencerelerde görünmüyor çünkü üç sözleşmeyi tek turda toplu yazdım ve üçünü tek turda kapattım; o turlar pencerelerin dışında kaldı.

## Sorular

1. Bu okuma doğru mu — T0'ın koşu başına bedeli "2 tur", ve doların kol farkı yalnızca bağlam büyümesinin eseri mi? Veriyle uyumlu başka bir açıklama var mı?
2. "Mekanizmanın bedeli" için doğru birim ne: tur mu, dolar mı, yoksa ikisi birden mi? Kullanıcı yüzde bir tavan istiyordu (%5-10); tur cinsinden ifade edersek o tavan nasıl yazılır?
3. Kullanıcıya gösterilecek son tablo neyi içermeli, neyi içermemeli? Hangi sayıyı vermek yanıltıcı olur?
4. Nihayete erdi mi, yoksa hâlâ ölçülmemiş bir kalem var mı?

Türkçe yaz. Kod yazma, dosya oluşturma; tek çıktın rol dosyandaki üç başlıklı ve en fazla 20 satırlık mesaj.

## Donen

## Call
Okuma büyük ölçüde doğru: T0'ın koşu başına bedeli 2 tur, kol farkı sıfır. Ama "nihayete erdi" deme — bir kalem hâlâ karanlıkta: sözleşme yazma ve kapanış turları pencerelerin dışında kaldı, dolayısıyla Core'un T0'a yüklediği tek gerçek ek iş tam olarak ölçülmemiş olan.

## Why
Native'de sözleşme yazma ve `complete` turu yoktur; Core'da vardır. Bu turlar kaç tane ve ne tuttu bilinmiyor. "Üçünü tek turda yazdım/kapattım" iyi haber ama 3 koşuya bölünmüş bir tur bile koşu başına ~0,67 tur ekler; bu, 2 turluk tabana %33 demek — kullanıcının %5-10 tavanını tur cinsinden aşar. Dolar cinsinden ise tur başına $0,23'ün üçte biri, ~$0,08, koşu başı $0,63'e karşı %12. İkisi de tavanın üstünde; sadece görünmüyor.

Birim: tur, çünkü dolar oturum bağlamıyla şişiyor ve oturumlar arası karşılaştırılamaz — sizin tablonuz bunu zaten kanıtladı (%21 fark, sıfır mekanizma farkı). Tavan tur cinsinden şöyle yazılır: "Core, native'e göre koşu başına en fazla 0,1-0,2 ek T0 turu; ajan tarafında tur medyanı ±1 içinde." Dolar ancak aynı oturum penceresi içinde ikincil kanıt.

Son tablo: kol × (ajan tur medyanı, ajan $ medyanı, T0 tur, T0 ek tur = sözleşme+kapanış amortize). Vermeyin: T0 dolarını kollar arası kıyas olarak (bağlam etkisi), oturum toplamını ($83→$117 mekanizmayı değil süreyi ölçer), ve "%2,9 altında"yı bir kazanç olarak (üç tekrar, örtüşen aralık; doğru ifade "fark ölçülemedi").

## Missed
- Sözleşme yazma ve kapanış turlarını ayrı ölçüp koşu sayısına bölmeden ek maliyet sıfır sayılamaz; %85 tezi tam da bu turlarda yaşıyor.
- Ajan sözleşmeye dokunmayınca `complete`'in verify ve risk hesabı hâlâ T0'da koşuyor; o adımın kaç tool çağrısı ürettiği 2'lik tur sayısına gizlenmiş olabilir — turdan bağımsız araç çağrısı sayısını da not edin.
- Kapı doğrulaması tek örnek; tabloya "kapı: 1 sınama, geçti" diye yazın, "tam güçte" demeyin.
- T0 dolarını bağlamdan arındırmak isterseniz yalnız "cache dışı" (input + output) tokenı kıyaslayın; o sayı koşu sırasından bağımsızdır.
