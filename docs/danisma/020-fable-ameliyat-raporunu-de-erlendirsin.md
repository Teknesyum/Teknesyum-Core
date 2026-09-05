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

_cevap bekleniyor_
