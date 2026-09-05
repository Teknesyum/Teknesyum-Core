# Pilot bench — kapının bedeli ölçüldü

**Tarih:** 2026-09-05. **Görev:** `pallets/click`, pin `a5f5aa6d4012d256ccca24638f2642fc371e9f77`,
`echo_via_pager` + `CliRunner.invoke` regresyonu. **Koltuk:** `sonnet/low` (model `claude-sonnet-5`).
**Tarife:** `docs/tarife.json`, dört kalemi de `claude.com/pricing`den doğrulanmış.

Bu bir kıyas raporu **değildir**: tek görev, üçer tekrar, tek koltuk. `BENCH.md` bölüm 0'ın
durma kuralı ve bölüm 2'nin altı kollu tasarımı burada uygulanmadı. Ölçülen tek şey şu:
**sözleşme kapısı, aynı işi yapan sözleşmesiz bir ajana kıyasla ne kadar pahalıya mal oluyor.**

## Sonuç

| Kol | Turlar | Tur medyanı | Ajan $ | Medyan |
|---|---|---|---|---|
| native, sözleşmesiz | 11 / 9 / 12 | 11 | 0,1079 · 0,0940 · 0,1151 | **0,1079** |
| Core, aynı metin, ajan sözleşmeye 1 kez dokunuyor | 12 / 14 / 11 | 12 | 0,1292 · 0,1339 · 0,1233 | 0,1292 |
| Core, aynı metin, ajan sözleşmeye **hiç dokunmuyor** | 13 / 10 / 10 | 10 | 0,1579 · 0,0964 · 0,1047 | **0,1047** |

Son satır native'in **%2,9 altında**, ve iki aralık tamamen örtüşüyor (Core 0,096-0,158,
native 0,094-0,115). Yani kapının ölçülebilir bedeli yok. Dokuz koşunun dokuzu da kabul
testini bağımsız olarak geçti; hiçbiri test dosyasına dokunmadı.

## Yol boyunca düzeltilen üç şey

**1. Ölçüm hatası — düşünen kollar beş yüz kat eksik sayılıyordu.** Düşünen bir tur
transcript'e tek mesaj kimliği altında iki kayıt yazıyor: biri `thinking` bloğu, diğeri metin,
ve `usage` alanları farklı. `bench/maliyet.js` mükerrer kimlikleri elerken ilkini tutuyordu,
yani `high` kolunun çıktısını 1714 yerine 2 sayıyordu. Kural artık kimlik başına her kalemin
en büyüğünü tutuyor. Bu hata tam da ölçmek istediğimiz eksende yanlılık üretiyordu.

**2. Kurulum hatası — iki kola aynı brifing verilmemişti.** Core kolu sözleşmenin yalın
`Goal`ünü alıyordu, native kolu ise traceback ve reprodüksiyon kodu dahil dondurulmuş görev
metnini. Ölçülen %57'lik fark kapının değil, eksik brifingin bedeliymiş. Kanıt keşif
sayımında: ilk kaynak düzenlemesinden önceki çağrılar native'de 5 (`Read` = 0), yalın
promptlu Core'da 11-13 (`Read` = 4-8). Aynı metni verince Core'un `Read` sayısı da sıfırlandı.

**3. Gereksiz tur — bağlanma zaten dispatch anında kuruluyordu.** Ajana "önce sözleşmeyi
`active` yap" dedirtiyorduk. Oysa `watch.js` `PostToolUse:Agent` kancasında, prompt'ta geçen
sözleşme yolundan `live/<agentId>.json` kaydını zaten yazıyor. Sözleşmeye hiç dokunmayan bir
ajanla sınadık: `owns` içindeki dosyaya yazabildi, dışındakine yazamadı —

```
BLOCKED: bench/kapi-testi/disarida.txt is outside the owns set of H1.
owns: bench/kapi-testi/icerde.txt
```

Kapı tam güçte, tur gitti.

## Kapatılan iki açık

**Sessiz delik:** `guard.js` `boundary()` içinde `if (!rec || !rec.contract) return;` — kaydı
olmayan ajan hiçbir denetime uğramadan geçiyordu, açık bir sözleşmenin sahipli dosyasına bile
yazabiliyordu. Artık sahipli dosya kaydı olmayan ajana kapalı; sahipsiz dosya açık kalıyor,
yoksa sözleşmesiz her ajan (Explore, advisor, native kol) kırılırdı.

**Kapana kısılan sözleşme:** `close --id` beş karakteri geçen kimlikleri reddediyordu ama o
kimlikle sözleşme yazılıp listelenebiliyordu — açılıp bir daha kapatılamayan sözleşme. Kimlik
deseni genişletildi.

İkisinin de savı yazıldı ve yamasız hâlde kırmızı verdiği doğrulandı. `npm test` dört suite
yeşil, `test/all.js` 2.677 sav.

## Ölçülemeyen: T0 tarafı

Koşu başına ajan $0,10-0,16 iken T0 penceresi $0,62-0,95 çıkıyor — toplamın yaklaşık %85'i.
Ama bu rakam iki sebeple mekanizmanın bedeli sayılamaz: pencerelere kullanıcıyla konuşmam
karışıyor, ve native kolunda bile $0,62 — yani ağırlığın çoğu koşuyu süren oturumun kendi
bağlam yükü, kolun türü değil. T0'ı evrelere bölüp (dispatch / bekleme / kapanış) ölçmek ayrı
bir iş olarak duruyor.

## Kayıtlar

Ham veri: `bench/kol-maliyet.jsonl` (koşu başına dört kalem, tur, süre, geçti/kaldı),
`bench/anlik.jsonl` (T0 pencereleri). Danışma turları: `docs/danisma/011` – `docs/danisma/014`.
