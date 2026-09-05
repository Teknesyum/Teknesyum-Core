# Fable ameliyat raporunu değerlendirsin

- soran: T0
- danisilan: fable
- tarih: 2026-09-05

## Sorulan

C:/Users/Teknesyum/.claude/plugins/cache/teknesyum/teknesyum-core/0.15.0/roles/advisor.md dosyasını oku ve onu izle. Başlıklar Türkçe: `## Karar`, `## Gerekçe`, `## Kaçırdığın`.

Depo kökü: C:\Users\Teknesyum\Desktop\Projeler\Teknesyum Core
Soran: T0, opus. Senin koltuğun: fable/medium.

Bu turda dosya oku: `docs/raporlar/2026-09-05-ameliyat-sonuc.md` (raporun kendisi), `core/hooks/embed.js`, `core/hooks/autoclose.js`, `core/hooks/watch.js` içindeki `dispatch()` ve `SubagentStop` dalı, `bench/katlama-kol-maliyet.jsonl`.

## Bağlam

Senin planın ([danisma/019](docs/danisma/019-fable-ameliyat-plan-tam-yetki.md)) uygulandı: kesim listesi kesildi, sözleşme prompt'a katlandı, kapanış SubagentStop'a katlandı, pilot 3 tekrar yeniden koşuldu. Eşikler koşudan önce yazılıydı: T0 turu Core ≤ native VE ajan $ ≤ +%5. İkisi de tuttu (+%2,5; T0 4 tur / 3 koşu, native 6).

Ama mühür üç koşuda da düştü: `complete`, 17 dosyalık `owns`'ı 8-dosya kuralıyla yüksek risk sayıp denetçi istedi. Denetçi 95-100k token = %5 tavanının 10 katı. Rapor bunu "yapısal sınır" diye yazıyor ve kararı kullanıcıya bırakıyor.

Kullanıcı bu raporu senin gözünden geçmiş hâliyle görecek. Nihai gaye onun sözüyle: "%5'lerle yakalamamız lazım native'i."

## Sorular

1. Rapor dürüst mü — abartan, gizleyen ya da yanlış atfeden bir cümle var mı? Varsa hangisi.
2. 8-dosya kuralı: yeri bilinmeyen bir hata için paketin tamamını sahiplenmek Core'da neden yüksek risk sayılıyor ve bu doğru mu? "Sahipli dosya sayısı" riskin doğru vekili mi, yoksa "değişen dosya sayısı" mı olmalı? Kural değişirse hangi ölçümle savunulur?
3. %5 tavanı ile Core'un mekanizması bugün nerede duruyor: bu tavan altında hangi işler yapılabilir, hangileri yapılamaz — somut ve kısa.
4. Ameliyat nihayete erdi mi? Ermediyse tek eksik ne?

Türkçe yaz. Kod yazma, dosya oluşturma; tek çıktın rol dosyandaki üç başlıklı ve en fazla 20 satırlık mesaj.

## Donen

## Karar
Rapor büyük ölçüde dürüst ama manşeti fazla iyimser; 8-dosya kuralı yanlış vekile bakıyor, `owns.length` yerine `stat.files` sayılmalı (`core/scripts/risk.js:108`, zaten hesaplanıyor `gitNumstat` → `files`); ameliyat bitmedi, tek eksik mühür.

## Gerekçe
1. Dürüstlük: (a) "+%2,5" medyan; ortalama 0,1192 / 0,1057 = **+%12,8** (`katlama-kol-maliyet.jsonl` KAT5 0,1403, 15 tur). n=3'te medyanı söylemeden vermek KAT5'i gizler — ikisi de yazılmalı. (b) "İkisi de tuttu": native 6 tur **bitmiş** akış, Core 4 tur **mühürsüz** akış; kapanış için T0 en az bir tur daha harcayacak, eşik bunu saymıyor. (c) "Kuralı değiştirmek ürünü eğmek olur" — atıf yanlış: kural kendi başına hatalı, ölçüm için değil. (d) "Yapısal sınır" tek sabit (`FILE_LIMIT = 8`), yapısal değil.
2. `owns` yazma izni sınırıdır, raporun kendisi diyor: "nereye yazıldığını sınırlar, ne yapıldığını değil". Risk yapılanın ölçüsü; 17 dosyayı sahiplenip 1'ini değiştiren sözleşme düşük risktir. Geniş `owns`'un gerçek bedeli risk değil kilit: 17 dosya başka sözleşmeye kapanır. Savunma ölçümü: 124-sözleşmelik korpusta denetçinin yakaladığı 33 kusurun kaçı `owns&gt;8` ama `diff.files≤8` sözleşmede? Sıfıra yakınsa kural bedava değişir. Hassas yol denetimi `owns` üstünde kalsın, o izin riski.
3. Bugün %5 altında: tek builder, düşük risk (değişen ≤8 dosya, ≤300 satır, silme/yeniden adlandırma yok, hassas yol yok), otomatik mühür, danışmansız. Altına sığmayan: denetçi (tavanın 10 katı), Fable danışma turu, round≥3 yeniden açılış, sözleşme başına T0 turu yiyen çok-sözleşmeli iş. Model koşturan hiçbir kapı sığmaz; yalnız deterministik kapılar sığar.
4. Ermedi. Tek eksik: mühür üç koşuda da düşmüş, "ölçülen akış" kapanmış bir akış değil. Kural değişip 3 koşu yeniden mühürlenirse biter.

## Kaçırdığın
`risk: high` yalnız denetçi istemiyor; `contract.js:339-350` builder'ı **opus'a** yükseltiyor. Bench koltuğu `sonnet/low`a pinlendiği için görünmedi; gerçek kullanımda aynı 17-owns sözleşme opus'ta koşar, +%2,5 değil kat kat fark eder. Kural değişmeden ölçüm zaten temsilî değil. Rapora ortalama, "mühürsüz 4 tur" notu ve bu opus etkisi eklenmeden kullanıcıya gitmesin.
