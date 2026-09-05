# Fable ölçüm verilerini incelesin

- soran: T0
- danisilan: fable
- tarih: 2026-09-05

## Sorulan

C:/Users/Teknesyum/.claude/plugins/cache/teknesyum/teknesyum-core/0.15.0/roles/advisor.md dosyasını oku ve onu izle.

Depo kökü: C:\Users\Teknesyum\Desktop\Projeler\Teknesyum Core
Soran: T0, opus. Senin koltuğun: fable/medium.

## Kullanıcının sorusu, kendi cümlesiyle

"Bu değerler normal mi ya, 6+ dk düşünmesi şu basit soru için falan. Fable şu verileri incelesin."

## Bağlam

Bench'in altı kolu (`eco`/`normal`/`premium` ve her birinin aynı koltukta koşan native eşi) alt ajanlarla kurulacak. Koltuk ayrımı `.claude/agents/*.md` frontmatter'ındaki `model: sonnet` + `effort: low|medium|high` ile üretiliyor. Koşulardan önce "effort kanalı gerçekten çalışıyor mu" diye sentetik bir sınama yapıldı.

Sınama sorusu (üç koltuğa da birebir aynı verildi): masanın etrafında 8 kişi, her biri ya hep doğru ya hep yalan söylüyor, her biri "sağımdaki iki kişiden en az biri yalancıdır" diyor, en fazla kaç doğru söyleyen olabilir. Dosya yazma ve komut çalıştırma yasaklandı.

## Ölçülen veriler

Model her koşuda `claude-sonnet-5`. Dört kalem transcript'ten, mükerrer mesaj kimlikleri elenerek toplandı. Fiyat `claude.com/pricing`den doğrulanmış tarife.

| Koşu | Asistan mesajı | girdi | çıktı | cache yazma | cache okuma | thinking bloğu | $ | süre |
|---|---|---|---|---|---|---|---|---|
| low, bulmaca | 1 | 2 | 167 | 13.165 | 0 | 0 | 0,0346 | 4,5 sn |
| medium, bulmaca | 0 | 0 | 0 | 0 | 0 | 0 | 0,0000 | 2,5 dk sonra öldürüldü |
| high, bulmaca | 0 | 0 | 0 | 0 | 0 | 0 | 0,0000 | 6+ dk sonra öldürüldü |
| high, "2+2 kaç eder" | 1 | 2 | 3 | 13.020 | 0 | 0 | 0,0326 | 1,5 sn |

`low`un bulmacaya verdiği cevap kendi içinde çelişikti: sayı olarak "5" dedi ama gerekçesi 6'ya çıkıyordu. `high` "2+2" sorusuna 1,5 saniyede "4" dedi.

Öldürülen iki koşunun transcript dosyası 865 baytta kaldı, yalnız açılış kaydını içeriyor, tek asistan mesajı yok.

## Sorular

1. Bu rakamlar normal mi? Özellikle: aynı koltuk basit soruda 1,5 saniyede dönerken bulmacada 6 dakikadan fazla düşünüp hiçbir şey yazmaması beklenir mi, yoksa bir arıza işareti mi?
2. Her koşuda cache yazma ~13.000 token ve cache okuma 0. Bu, alt ajanın kendi sistem istemi ve araç tanımları mı, ve her kol bunu sabit gider olarak mı ödüyor? Bench'te bu sabiti nasıl ele almalıyız — düşülmeli mi, ayrı raporlanmalı mı?
3. Öldürülen koşular **sıfır** maliyet kaydediyor, oysa gerçekte hesaplama yapıldı. Tavana çarpan koşuların harcaması bu yolla hiç ölçülemiyor. Bunu nasıl çözeriz, yoksa "düşen koşu" satırının maliyeti bilinmez mi kalmalı?
4. `thinking bloğu` sayısı her koşuda 0 çıkıyor ama yüksek effort açıkça uzun düşündü. Düşünme tokenleri `çıktı` kalemine giriyor mu, girmiyorsa bench'in maliyet ölçümü yüksek effort kollarını sistematik olarak eksik mi sayacak?

Türkçe yaz. Kod yazma, dosya oluşturma; tek çıktın rol dosyandaki üç başlıklı ve en fazla 20 satırlık mesaj.

## Donen

## Call
Arıza değil, sınama sorusu bozuk. Kanal çalışıyor ("2+2" 1,5 sn); bulmaca çözümsüz, yüksek effort tutarlı dizilim ararken döngüye giriyor. Soruyu değiştir, süre tavanı koy, öldürülen koşuları "maliyet ≥ bilinen" diye raporla.

## Why
Yalancı "sağımdaki ikisi de doğrucu" demiş olur → her Y'yi TT izler, o T'lerin ilki de 2 içinde Y ister → zorunlu örüntü YTT, periyot 3; 8'e bölünmez, tümü-T de olmaz. Çözüm yok; low'un 5/6 çelişkisi de bundan.
Transcript'e asistan mesajı akış bitince yazılır; öldürülen koşu düşünmeyi hiç diske koymaz, 865 bayt bunun kanıtı, "hesaplama yapılmadı" değil.
Düşünme tokenleri faturada `çıktı` kalemine girer; bitirilen koşularda thinking=0 normal (low düşünmez, 2+2 düşünmeye değmez). Sistematik eksik sayım yok, kayıp yalnız yarım kalan koşuda.

## Missed
- ~13k cache yazma = alt ajanın sistem istemi + araç tanımları, her kol sabit öder; cache okuma 0 çünkü her koşu yeni oturum ve öneki farklı/5 dk dışı. Düşme, iki satır yaz: "koltuk sabiti" ve "göreve atfedilen". Cache yazma 1,25× girdi fiyatı, 3 sentin neredeyse tamamı bu.
- Tavana çarpan koşunun harcamasını almak için `--output-format stream-json --include-partial-messages` ile koş; usage delta'ları gelir. Olmazsa Console kullanım raporundan koşu zaman aralığına bak.
- Bench'e süre/maksimum-tur tavanı olmadan giriyorsun; premium kolu her açık uçlu soruda dakikalarca dönebilir. Tavan, sonuç tablosunda ayrı sütun olsun.
- Sağlamlık sınaması için çözümü tek ve doğrulanabilir bir soru seç (ör. 9 kişiyle aynı bulmaca: 6). Böylece üç koltuğun düşünme süresi ve doğruluğu kıyaslanır.
