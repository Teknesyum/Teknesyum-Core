# Fable kapsamlı düzeltme planı

- soran: T0
- danisilan: fable
- tarih: 2026-09-05

## Sorulan

C:/Users/Teknesyum/.claude/plugins/cache/teknesyum/teknesyum-core/0.15.0/roles/advisor.md dosyasını oku ve onu izle.

Depo kökü: C:\Users\Teknesyum\Desktop\Projeler\Teknesyum Core
Soran: T0, opus. Senin koltuğun: fable/medium.

## Kullanıcının isteği

"Bana sormadan ölçümleri yapıp düzeltmeleri yap, nihayete ulaşsın, ancak o zaman kontrol edeceğim son hâlini. Fable'a sormayı unutma — süreç, yapılacaklar vb. kapsamlı analiz ve düzeltme silsilesi."

Yani senden **sıralı bir yapılacaklar listesi** istiyorum: neyi hangi sırayla düzelteceğim, her adımda neyi ölçeceğim, ve nerede durup kullanıcıya döneceğim.

## Nerede kaldık — ölçülmüş olgular

Aynı dondurulmuş görev metniyle, `sonnet/low` koltuğunda, üçer tekrar, pinlenmiş temiz klonlar, kabul betiği bağımsız koşuldu. Dokuz koşunun dokuzu da PASS.

| Kol | Tur medyanı | Çıktı medyanı | Cache okuma medyanı | Ajan $ medyanı |
|---|---|---|---|---|
| native | 11 | 3.374 | 204.260 | 0,1079 |
| Core, aynı metin | 12 | 4.118 | 209.871 | 0,1292 |

Ajan tarafında **+%19,7**, ve fark **tam olarak 1 tur**: ajanın sözleşmeye bağlanmasını sağlayan tek `Edit`.

Daha önce ölçülen %57'lik fark kurulum hatamdı: Core koluna dondurulmuş metni değil sözleşmenin yalın `Goal`ünü veriyordum. Kanıtı senin önerdiğin keşif sayımı verdi — ilk kaynak düzenlemesinden önceki çağrılar: native 5 (Read=0), yalın promptlu Core 11-13 (Read=4-8). Aynı metni verince Core'un Read sayısı da sıfırlandı.

Senin geçen turdaki üç uyarın da doğrulandı: T0 toplamın ~%85'i, native kolunda bile T0 $0,62, ve düzeltilmiş akışta T0'ın yükselmesi kapanışı sonnet'ten opus'a taşımamın sonucuydu.

## Kalan tek kalem ve tasarım sorusu

O 1 tur yapısal. `hooks/guard.js` içinde `boundary()` bağlanma kaydını `bindingFile(relay, agentId)` ile arıyor ve `if (!rec || !rec.contract) return;` — kaydı olmayan ajan hiçbir `owns` denetimine uğramıyor. Kayıt, ajanın sözleşme dosyasına kendi yazmasıyla oluşuyor.

Bağlanmayı T0'a taşımak istiyorum: ajan hiç sözleşmeye dokunmasın, kapı yine tam güçte olsun. Görünen zorluk: T0 ajanı başlatmadan `agentId`'yi bilmiyor, `Agent` çağrısı kimliği dönerken ajan çoktan çalışmaya başlamış oluyor. Yani T0'ın önceden `live/<agentId>.json` yazması yarış içeriyor.

## Sorular

1. Bağlanmayı ajanın yazımından koparmanın doğru tasarımı ne? Aklımdakiler: (a) kapı, ajanın prompt'unda adı geçen sözleşmeyi `watch.js`'in `PreToolUse:Agent` kancasında yakalayıp kaydı orada açsın; (b) T0 dispatch'ten hemen sonra kaydı yazsın ve kapı kayıt yoksa **engellesin** (fail-closed), böylece yarış sessiz açılma değil gecikme üretsin; (c) hiç değiştirme, 1 tur kalsın. Hangisi doğru, ve (b)'deki fail-closed dönüşü başka neyi kırar?

2. Bu değişikliği yaparken hangi mevcut savlar (test/all.js 2.673 sav) beni koruyor, hangileri yeni yazılmalı? Kapıyı sessizce kapatan bir regresyonu hangi sav yakalar?

3. Düzeltme silsilesinin doğru sırası ne? Elimde şunlar var: bağlanma değişikliği, T0 tarafının kendi maliyeti (toplamın %85'i), `docs/COST-MODEL.md`'nin "sıfır sürekli token" iddiasının bu ölçümlerle güncellenmesi, `BENCH.md`'nin aynı-metin kuralının netleştirilmesi, ve bulduğum bir hata: `contract.js close --id` beş karakteri geçen kimlikleri reddediyor ama o kimlikle sözleşme açılabiliyor.

4. Nerede durup kullanıcıya dönmeliyim — hangi eşik "nihayete ulaştı" sayılır?

Türkçe yaz. Kod yazma, dosya oluşturma; tek çıktın rol dosyandaki üç başlıklı ve en fazla 20 satırlık mesaj.

## Donen

## Call
(b)'nin düzeltilmiş hâli: bağlanma T0'a değil **kancaya** taşınsın. `PreToolUse:Agent` sözleşme kimliğini prompt'tan alıp `pending/<contractId>` yazar; `SubagentStart` kancası (`agent_id` verir, ajanın ilk araç çağrısından önce koşar) onu `live/<agentId>.json`'a taşır. Yarış yok, ajan hiç dokunmaz. Fail-closed ise **yalnız sahipli dosyada**: kaydı olmayan ajan bir açık sözleşmenin `owns` kümesine yazmaya kalkarsa engel; sahipsiz dosya ve salt-okur çağrı serbest.

## Why
Tam fail-closed Explore, advisor, bench-native kolu ve sözleşmesiz her ajanı kırar; sahipli-dosya kapsamı kapıyı tam güçte tutar, geri kalanı bozmaz. Değişikliğin gerekçesi 1 tur değil: `if (!rec) return;` bugün de sessiz açık — Edit'i atlayan ajan denetimsiz. Sıra: (1) `close --id` uzunluk hatası + savı, (2) bağlanma + savlar, (3) bench'i yeniden koş ve tur eşitliğini göster, (4) T0'ı evreye böl (dispatch / bekleme / kapanış) ölç, kapanışı sonnet'e geri al, (5) COST-MODEL ve BENCH son sayılarla.

## Missed
Kapıyı sessiz kapatan regresyonu yakalayan sav şu ve yok: "kaydı olmayan ajan, açık sözleşmenin sahipli dosyasına Edit → engel". Mevcut savlar yalnız kaydı olan yolu korur; "kayıt yok → geç" diyen varsa tersine çevrilecek. İkinci yeni sav: `pending` → `live` aktarımı ve aynı sözleşmeye ikinci ajan. "Sıfır sürekli token" iddiası kanca çıktısıyla düşer: izin verirken stdout boş olmalı, ölçün. T0'ın %85'i asıl kalem — ajan tarafı bitti sayılır, orada bir tur daha kovalama. Nihayet eşiği: all.js yeşil, üçer tekrar bench'te ajan turu native'e eşit, T0 evre tablosu ve iki belge güncel — o zaman tek seferde dön; ara dönüş yalnız fail-closed'un adlandıramadığın bir ajan sınıfını engellediğini görürsen.
