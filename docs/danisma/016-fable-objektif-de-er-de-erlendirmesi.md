# Fable objektif değer değerlendirmesi

- soran: T0
- danisilan: fable
- tarih: 2026-09-05

## Sorulan

C:/Users/Teknesyum/.claude/plugins/cache/teknesyum/teknesyum-core/0.15.0/roles/advisor.md dosyasını oku ve onu izle.

Depo kökü: C:\Users\Teknesyum\Desktop\Projeler\Teknesyum Core
Soran: T0, opus. Senin koltuğun: fable/medium.

## Kullanıcının sorusu, kendi cümlesiyle

"Misal 6 farklı kola Chess960 yazın desem aradaki fark ne olur? Bana bunun gibi bir veri lazım: tüketim ne kadar oynar, süre ne kadar oynar, bu aradaki farka biz ne satın aldık, mantıklı bir iş mi yaptık? Fable'ın objektif değerlendirmesini istiyorum."

Sana iki şey soruyor: (1) böyle bir deney ne gösterirdi, (2) **objektif olarak** bu mekanizma değer üretiyor mu, yapılan iş mantıklı mı.

Kullanıcının kendisine karşı da dürüst ol. Övme, savunma, teselli etme. Değmiyorsa değmiyor de.

## Ölçülmüş olgular — bugünkü pilot

Görev: `pallets/click` deposunda pinlenmiş bir hata düzeltme. Görev metni traceback'i, hatanın hangi dosyada olduğunu (`src/click/` altında) ve reprodüksiyon kodunu veriyordu. Koltuk `sonnet/low`, üçer tekrar, temiz klonlar, kabul betiği bağımsız koşuldu, dokuz koşunun dokuzu da PASS.

| | native (sözleşmesiz) | Core (sözleşme altında) |
|---|---|---|
| ajan turu, medyan | 11 | 10 |
| ajan cache dışı tokeni, medyan | 3.398 | 3.929 (+%15,6) |
| ajan $, medyan | 0,1079 | 0,1047 |
| T0 turu, koşu başına | 2 | 3 (toplu yapılmazsa 4) |
| kabul testi | 3/3 geçti | 3/3 geçti |

Ajan tarafında fark ölçülemedi (aralıklar örtüşük). T0 tarafında koşu başına 1-2 ek koordinatör turu var: sözleşmeyi yazmak ve kapatmak.

Kapı bir kez sınandı ve geçti: sözleşmeye hiç dokunmamış bir ajan `owns` içine yazabildi, dışına yazamadı.

**Önemli bağlam:** bu görevde kapının kısıtlayacak bir şeyi yoktu. Görev metni hatanın nerede olduğunu söylüyordu, iki kol da aynı tek dosyayı aynı biçimde düzeltti, hiçbiri kapsam dışına çıkmaya çalışmadı. Yani mekanizmanın önlediği bir şey ölçülmedi — çünkü önlenecek bir şey olmadı.

## Chess960 fikri

Kullanıcı yeşil alan bir görev öneriyor: sıfırdan Chess960 (Fischer Random satranç) yazmak. Bu, click görevinin tersi: kapsam belirsiz, "bitti" tanımı bulanık, ajanın kendi kararlarını verdiği yer çok.

## Sorular

1. Altı kola Chess960 yazdırmak hangi veriyi üretirdi ve o veri kullanıcının sorusunu (mekanizma değer üretiyor mu) gerçekten cevaplar mı? Cevaplamıyorsa, cevaplayan deney ne olurdu?
2. Tüketim ve süre ne kadar oynar — yeşil alan görevde kollar arası yayılım hata düzeltmeye göre nasıl değişir, ve n=3 böyle bir görevde yeter mi?
3. **Objektif değerlendirme:** bugüne kadar ölçülenle, sözleşme kapısı ne satın alıyor? Bedeli koşu başına 1-2 koordinatör turu. Bu takas hangi koşullarda mantıklı, hangilerinde değil? Kullanıcı bunu inşa etmekle mantıklı bir iş mi yapmış?
4. Ölçülmeyen ama asıl önemli olan ne — kapının değeri "önlediği hata" ise onu nasıl ölçeriz?

Türkçe yaz. Kod yazma, dosya oluşturma; tek çıktın rol dosyandaki üç başlıklı ve en fazla 20 satırlık mesaj.

## Donen

## Call
Chess960'ı altı kola yazdırma. Ürettiği veri "kollar arası yayılım"dır, mekanizmanın sorusuna cevap vermez; belirsiz görevde n=3 ile yayılım sinyali yutar. Objektif olarak: kapı bugüne kadar hiçbir şey satın almadı, çünkü henüz önleyecek bir şeyle karşılaşmadı. Yapılan iş mantıksız değil ama kanıtlanmamış — sigorta yaptın, hasar olmadan primin değerini ölçemezsin.

## Why
Ajan tarafı sıfır fark (aralıklar örtüşük), T0 tarafı koşu başına +1-2 tur; ölçülen tek şey bedel. Chess960 bunu değiştirmez: yeşil alanda tokens/süre yayılımı kolayca 2-3 kata çıkar (kapsam kararı ajana bırakılınca "bitti" 400 satır da olur 2000 de), n=3 medyanlar 50-100 puan oynar, iki kolun farkı gürültünün altında kalır. Kabul betiği de bulanıklaşır — hangi Chess960 "PASS"?
Kapının değeri önlediği hata olduğuna göre deney tehdit içermeli: görev metninde hatanın yeri söylenmesin, düzeltme için doğal olarak iki dosyaya dokunmak cazip olsun (biri `owns` dışında), veya komşu bir test/fixture'ı "iyileştirmek" isteğini uyandıran bir yem konsun. Native kolun kaç koşuda kapsam dışına taşıdığını say; Core kolunda kapının kaç kez reddettiğini ve reddin ardından ajanın ne yaptığını (vazgeçti / sözleşmeyi genişletmeyi istedi / hile aradı) kaydet. Ölçü: kapsam ihlali oranı ve ihlal sonrası kabul testi kırılma oranı, token değil.

## Missed
- Takas mantığı görev başına değil ajan sayısına bağlı: tek ajan tek dosyada +2 tur saf kayıp; 3+ paralel ajan aynı ağaçta çalışırken çakışma başına maliyet (rebase, kırık test, geri alma) muhtemelen 2 koordinatör turunu aşar — asıl deney paralel kollar, ardışık değil.
- T0 turunun bedeli sabit görünüyor ama şablonla sıfıra yaklaştırılabilir; ölçmeden önce sözleşme yazma turunu otomatiğe alıp sonra kıyasla, yoksa aracın ham halini yargılamış olursun.
- Kapının ikinci değeri kayıt: hangi ajanın neye dokunduğu sonradan okunabiliyor. Bu bugün ölçülmüyor ama hata günlüğüyle çaprazlanınca "kim bozdu" sorusuna harcanan turu düşürür; o turu da say.
- Sonnet/low disiplinli bir koltuk; kapsam dışına en çok taşan koltuk high/opus'tur ("iyileştirme" iştahı). Tehdit deneyini o koltukta koş.
