# Fable ölçüm yorumunu karşılaştır

- soran: T0
- danisilan: fable
- tarih: 2026-09-05

## Sorulan

C:/Users/Teknesyum/.claude/plugins/cache/teknesyum/teknesyum-core/0.15.0/roles/advisor.md dosyasını oku ve onu izle.

Depo kökü: C:\Users\Teknesyum\Desktop\Projeler\Teknesyum Core
Soran: T0, opus. Senin koltuğun: fable/medium.

## Kullanıcının isteği

"Bu verileri Fable ile de paylaş, bakalım onun yorumu da seninki gibi mi."

Yani senden bağımsız bir okuma isteniyor. Benim yorumumu aşağıda veriyorum ama önce kendi okumanı yap; katılmıyorsan söyle.

## Ölçüm — click hata düzeltme görevi, sonnet/low koltuğu, üçer tekrar

Her kol pinlenmiş temiz bir klonda koştu, kabul betiği bağımsız koşuldu, dokuz koşunun dokuzu da PASS verdi. "Ajan" = alt ajanın kendi transcript'i. "T0" = benim o kol için harcadığım pencere.

| Kol | Turlar | Ajan medyan | T0 medyan | Toplam medyan |
|---|---|---|---|---|
| native | 11, 9, 12 → 11 | $0,1079 | $0,6240 | $0,7319 |
| Core, eski akış | 15, 17, 17 → 17 | $0,1697 | $0,6826 | $0,8522 |
| Core, düzeltilmiş akış | 11, 21, 18 → 18 | $0,1653 | $0,7492 | $0,9144 |

Düzeltilmiş akışta senin önerdiğin kesintiler uygulandı: sözleşme metni prompt'a gömüldü, ajan sözleşmeye yalnız bir kez dokunuyor (tek `Edit`, `status: open` → `active`), kapanışı T0 yapıyor. Sözleşmeye dokunan çağrı sayısı 4-6'dan **1'e** indi ve bu ölçüldü.

Senin ikinci önerin uygulanmadı, gerekçesiyle: `status: active` yazımını T0'a almak. `hooks/guard.js` satır 402-410'da `boundary()` bağlanma kaydını ajanın kendi kimliğiyle arıyor (`bindingFile(relay, agentId)`), ve `if (!rec || !rec.contract) return;` — kaydı olmayan ajan hiçbir `owns` denetimine uğramadan geçiyor. Kayıt ajanın sözleşmeye kendi yazmasıyla oluşuyor. T0 yazsaydı ajan bağsız kalır, kapı iş boyunca hiç devrede olmazdı.

## Benim yorumum

Sözleşme dokunuşu 1'e indiği hâlde tur sayısı düşmedi (17 → 18). Demek ki fazladan turların sebebi sözleşme değildi. Sebep şu olabilir: iki kola **aynı görev metnini vermemişim**. Native kolu dondurulmuş görev metnini alıyor — traceback (`testing.py:676`), reprodüksiyon kodu, hatanın hangi sürümde çıktığı dahil. Core kolu ise yalnız sözleşmenin `Goal`ünü alıyordu: tek cümle, traceback yok, repro kodu yok. Yani ölçtüğüm şey kapının bedeli değil, zengin prompt ile yalın prompt arasındaki fark olmuş olabilir.

Şimdi Core kollarını birebir aynı dondurulmuş metinle, üstüne yalnız sözleşme sarmalayıcısı ekleyerek yeniden koşacağım.

## Sorular

1. Bu okumaya katılıyor musun? Katılmıyorsan, tur farkının başka hangi açıklaması veriyle uyumlu?
2. T0 medyanı üç grupta $0,62 / $0,68 / $0,75 — Core kollarında native'den yüksek ve düzeltilmiş akışta daha da yüksek. Bu neyin işareti, ve T0 tarafını gerçekten düşürmenin yolu ne?
3. Aynı metinle koşum tur farkını kapatmazsa geriye ne kalır — mekanizmanın gerçek bedeli neresi olur?

Türkçe yaz. Kod yazma, dosya oluşturma; tek çıktın rol dosyandaki üç başlıklı ve en fazla 20 satırlık mesaj.

## Donen

## Call
Okumana katılıyorum ama yarısına: prompt asimetrisi karşılaştırmayı geçersiz kılıyor, yeniden koşum şart. Ancak tur farkını tek başına açıkladığını veri söylemiyor; T0 sorusu ise bu koşumdan bağımsız ve daha büyük.

## Why
n=3, yayılım 11-21; düzeltilmiş kolun bir koşusu 11 tur, yani native ile aynı. Mekanizmanın tabanı native'e eşit, fazla turlar zorunlu değil — medyan bu yayılımda karar taşımaz.
T0 toplamın %85'i ve düzeltilmiş akışta yükselmesi senin değişikliğinin doğrudan sonucu: kapanışı sonnet'ten alıp opus'a verdin, iş pahalı koltuğa taşındı. T0'ın her Bash turu bütün pencereyi yeniden ödüyor; çare tur sayısı — sarma ve kapanış birer betik çağrısı olsun, T0 ajan transcript'ini okumadan kapatsın.
Native'de bile T0 $0,62: ölçtüğün şeyin çoğu bench koşumunun kendi bağlam ağırlığı. Kol farkları ($0,06-0,13) o gürültünün içinde olabilir.

## Missed
Yeniden koşmadan eldeki dokuz transcript'te ucuz bir test var: ilk Edit'ten önceki Read/Grep sayısı. Core kollarında yüksekse keşif turudur, hipotezin doğrulanır; eşitse sebep başka.
Kapının gerçek bedeli sözleşme dokunuşu değil, her araç çağrısında kancanın bağlama bastığı çıktı ve reddedilip yinelenen çağrılar. Transcript'ten sayılır: kanca stdout token'ı × çağrı, ret sayısı, ret sonrası tekrar. Aynı metinle fark kapanmazsa kalan budur.
Tablolar dolar yerine giriş/çıkış/önbellek token'ı vermeli; opus-sonnet fiyat farkı ve önbellek isabeti dolarda görünmez, kararı saptırır.
