# 005 — Clarifier Rolü Gerekli Mi

Danışılan: Fable (`advisor` rolü). Tarih: 2026-09-05. Ajan `a99ff918158400369`,
55.152 token, 1 araç çağrısı, 36 sn.

## Sorulan (tam metin)

Teknesyum Core adlı bir Claude Code eklentisinin tasarım kararında görüşünü istiyoruz. Kod yazmanı istemiyoruz; hangi seçeneği kurmamız gerektiğine dair kısa ve gerekçeli bir hüküm istiyoruz. Cevabın tamamı Türkçe olsun.

### Ne kurduk

Bir önceki turda sana danıştık ve senin hükmünle `clarifier` adlı yeni bir rol kurduk (sürüm 0.12.0). Kurulan şey şu:

Kullanıcı bir promptu `??` ile işaretlerse, T0 (baş ajan) işe başlamadan önce `clarifier` rolünü fable modeliyle açıyor. Rol dosya okumuyor; T0'ın zaten topladığı hazır olguları (ağacın durumu, açık sözleşmeler, harita, son günlük satırları, adı geçen dosyaların başı) eline alıyor ve `## Soru` / `## Olgu` / `## Yol` biçiminde en fazla on beş satır döndürüyor. Kullanıcının cümlesi asla yeniden yazılmıyor, üstte durur, çelişkide cümle kazanır.

Senin o turdaki gerekçen aynen şuydu: "Görüş vermek ve netleştirmek iki ayrı iş; aynı dosyada durursa ikisi de bulanır." Bunun üzerine `advisor.md` dosyasına da şu satır yazıldı: "This role is not the one the `??` mark opens; that is `clarifier`. An opinion and a sharpening are different jobs and they do not share a file."

### Kullanıcının şimdiki itirazı (kendi cümleleriyle)

"şimdi sadece ?? ile başlayan promptlarım için yeni bir rol yaratmamız ne kadar uygun maliyeti ne ölçüde değiştirdik. onun yerine bu işi t0 fable a soracak şekilde olsa hem yeni rol eklememiş oluruz hem t0 projenin geçmişine de hakim olduğundan daha iyi anlar diye düşünüyorum. bana biraz gereksiz geldi clarifier. ya bu rolü senin de otomatik açabildiğin, t0'ın inisiyatifinin de olduğu bir senaryoya gidilmeli, ya da rol kalkmalı diye düşünmekteyim."

Yani iki ayrı itiraz var ve bunlar farklı şeyler:

1. **Ayrı rol gereksiz mi?** Zaten `advisor` diye bir rol var ve o da fable'a gidiyor. `??` işaretini gördüğünde T0 doğrudan `advisor`'ı açsa, yeni dosya, yeni sav, yeni bakım yükü olmazdı.
2. **İşaret tek kapı olmalı mı?** Şu an `??` yoksa netleştirme hiç çalışmıyor. Kullanıcı T0'ın kendi inisiyatifiyle de açabilmesini istiyor; yani işaret bir zorunluluk değil, bir tetikleyicilerden biri olsun.

### Ölçülen maliyet

- İşaretsiz turda maliyet **sıfır**. Kanca yok, bağlama tek token yazılmıyor. Altın kural korunuyor.
- İşaretli turda bir fable turu ölçüldü: dört turda sırasıyla 53.990 / 49.521 / 51.414 / 53.159 token ve 31 / 27 / 23 / 21 saniye. Yani yaklaşık **50 bin token, 25 saniye**.
- Bu maliyet `advisor` ile `clarifier` arasında **aynı**. İkisi de aynı basamağa (`tier: advisor`) düşüyor, aynı modele gidiyor, aynı büyüklükte girdi alıyor.
- Ayrı rolün ek bedeli tur maliyeti değil, **depo bedeli**: 1 rol dosyası (1,1 KB), 8 sav, iki README'de birer satır ve bir paragraf, `docs/netlestirme/` klasörü. Depoda toplam 2.674 sav var.

### İki rolün metinsel farkı

`advisor` şunu döndürüyor: `## Call` (hangi yoldan giderdim) / `## Why` (gerekçe) / `## Missed` (asker'ın düşünmediği). Yirmi satır. Girdi olarak hedef, kabul ölçütü ve ham kanıt alıyor; asker'ın taslak cevabını **almıyor**, çünkü cevabı görmüş bir görüş görüş değildir.

`clarifier` şunu döndürüyor: `## Soru` (isteğin cevapsız bıraktığı sorular) / `## Olgu` (kanıtın hâlihazırda çözdüğü) / `## Yol` (sıra ve yasak). On beş satır. Girdi olarak kullanıcının ham cümlesini **alıyor** — advisor'ın aksine, işin konusu tam da o cümlenin kendisi.

### Bağlam

- Projenin altın kuralı maliyet: sıradan bir turda hiçbir kanca modelin bağlamına tek token yazmıyor.
- Her yeni davranış sav ister; ölçülmeyen kapı ayarlanamaz.
- Kullanıcının bir kuralı: "ağaçta ölü dosya olmaz" — işi biten dosya `trash/`'e taşınır.
- Sen bir önceki turda şunu da istemiştin: bir ay sonra `docs/netlestirme/` altındaki girdi sayısına bakıp `??` işaretinin eşiğe ihtiyacı olup olmadığına karar verilsin. O ölçüm henüz alınmadı — rol dün kuruldu, klasörde sıfır girdi var.

### Soru

1. Kullanıcı haklı mı? `clarifier` kalkmalı ve `??` doğrudan `advisor`'ı mı açmalı — yoksa senin bir önceki hükmün ("görüş ile netleştirme iki ayrı iştir") hâlâ geçerli mi? Fikir değiştiriyorsan neden değiştirdiğini açıkça söyle.
2. İşaret tek kapı mı kalmalı, yoksa T0'ın kendi inisiyatifiyle de açabilmesi mi doğru? İnisiyatif verirsek "her turda açar mı" riski nasıl sınırlanır?
3. "T0 projenin geçmişine hakim olduğu için daha iyi anlar" savı doğru mu? T0'ın kendi kendine netleştirmesi ile ikinci bir modele netleştirtmek arasında gerçek bir fark var mı, yoksa bu sadece 50 bin token'lık bir tekrar mı?
4. Karar vermeden önce toplamamız gereken bir sayı var mı? Varsa hangisi ve kaç turluk?

Kısa yaz. Hükmü başa koy.

## Gelen cevap (tam metin)

## Call

Kullanıcı yarı haklı. `clarifier` dosyası kalkmalı, ama iş kalmalı: `??` doğrudan `advisor`'ı açsın ve advisor'ın girdi kuralına tek satır eklensin — "işaretle açıldıysa kullanıcının ham cümlesi girdinin ilk satırıdır, cevabın başlığı `## Soru / ## Olgu / ## Yol` olur." İşaret tek kapı kalsın; T0'a inisiyatif verilmesin. Önce ölçüm, sonra karar — ama ölçüm bu dosya birleştirilmiş hâlde alınsın.

## Why

Önceki hükmüm "iki iş ayrı" idi; hâlâ doğru. Yanlış olan çıkarım: iki işin iki dosya istediği. Ölçülen fark sıfır tur maliyeti, aynı basamak, aynı model; tek gerçek fark döndürülen başlıklar ve girdiye ham cümlenin girip girmemesi. Bu, bir dosya içinde iki dönüş kalıbıyla çözülür. Sekiz sav ve ayrı klasör bedeli, on beş satırlık bir ayrım için fazla. Fikri değiştiren şey ölçüm: dün depo bedelini bilmiyordum, bugün biliyorum.

T0'ın inisiyatifi altın kuralı kırar: "sıradan turda sıfır token" garantisi işaret sayesinde var. T0'a "gerekince aç" denirse eşik ölçülemez, çünkü tetikleyici modelin kanaati olur; 50 bin token'lık tur belirsiz sayıda tekrar eder. İnisiyatif ancak sayısal bir kapıyla verilebilir — örneğin "cümle iki dosyayı adlandırıyor ve açık sözleşme yok" gibi mekanik bir koşul — ve o koşul henüz tanımlanmış değil.

"T0 geçmişe hâkim, daha iyi anlar" savı yarı doğru. T0 daha çok bilir; tam bu yüzden kendi kendine netleştiremez, çünkü boşluğu göremeyen kendisidir. İkinci modelin değeri bilgi değil, körlük eksikliği. Bu 50 bin token'lık tekrar değil, ama yalnız ham cümle belirsizken değerli — belirsiz değilse hiç açılmamalı, bunu da işaret zaten sağlıyor.

## Missed

- Sayı: `??` ile açılan ilk 10 turda, dönen `## Soru` bloğunun kaç tanesi kullanıcının cevabını değiştirdi (planı düzeltti, dosya seçimi değişti). 10'da 3'ün altındaysa rol tamamen kalkar, işaret de kalkar. 10'da 5'in üstündeyse mekanik inisiyatif koşulu tasarlanır.
- Advisor "asker'ın taslağını almaz" kuralı ile "ham cümleyi alır" kuralı çelişmez: cümle taslak değil, girdidir. Dosyaya bunu tek cümleyle yaz, yoksa iki ay sonra biri karıştırır.
- `docs/netlestirme/` klasörü kalsın; birleşen dosyanın kanıt yeri odur. `clarifier.md` `trash/`'e gider, savları advisor'ın altına taşınır, sav sayısı sekizden ikiye iner.
