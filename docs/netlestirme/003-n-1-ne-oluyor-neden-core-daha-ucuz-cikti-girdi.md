[[netlestirme:003]]

# Netleştirme: n=1 ne oluyor neden core daha ucuz çıktı bu tesadüfü marifete çevirmenin yolu va

İşe başlamadan önce soruyu keskinleştir. Görüş verme, plan yazma, kod yazma.
Yalnız şunu döndür: soruda belirsiz kalan yerler, her biri için tek satırlık bir netleştirme sorusu, en fazla beş. Belirsizlik yoksa "net" yaz.

## Soru

n=1 ne oluyor neden core daha ucuz çıktı bu tesadüfü marifete çevirmenin yolu var mı mantıklı mı vb

## Elde olan olgular

# Olgular — n=1 ölçümü

## Ürün ve ölçüm düzeneği

Teknesyum Core, Claude Code için kancalardan ve betiklerden oluşan bir eklenti. Tasarım
iddiası: sıradan bir turda hiçbir kanca modelin bağlamına tek bayt yazmaz; durum
statusline'da durur ve model onu görmez.

Bench koşucusu (`bench/run.js`) bir görevi iki "kol"da koşturur:

- **core**: eklenti kurulu, sekiz kanca bağlı.
- **native**: eklenti hiç yok, çıplak Claude Code.

Her koşu gerçek bir depoyu sabit bir commit'e sabitler, ajana görev metnini verir, sonunda
kabul ölçütünü (testler, davranışlar) denetler ve token/USD sayar. USD, `tarife.json`
üzerinden token'lardan hesaplanır, ölçülmez.

## Yapılan koşu (2026-09-09)

Görev `06-slugify-cli` (sindresorhus/slugify deposuna bir CLI ekleme, ava testleri yeşil
olacak), koltuk sonnet/low, model `claude-sonnet-5`, Claude Code 2.1.251, **tekrar 1**.
Yani her kol **bir kez** koştu. Toplam iki koşu.

| Kol | Geçti | Süre | Çıktı token | Cache yazma | Cache okuma | Toplam | USD |
| --- | --- | --- | --- | --- | --- | --- | --- |
| core | evet | 113 sn | 8.280 | 34.098 | 1.190.982 | 1.233.400 | 0,4063 |
| native | evet | 118 sn | 9.569 | 35.936 | 1.271.762 | 1.317.309 | 0,4400 |

Fark: core, native'den 83.909 token (%6,4) ve 0,034 $ (%7,6) **ucuz** çıktı.

Her iki kolda da `cueHits: 0`, `cueBytes: 0`: hiçbir kanca bağlama metin yazmadı. Yani
core kolunun ucuzluğunun eklentinin bağlama bir şey eklemesiyle ilgisi yok — eklenti zaten
hiçbir şey eklemedi. İki kol arasındaki tek yapısal fark, core kolunda kancaların
çalışması (PreToolUse denylist, sayaç, vb.) ve bunların turu bloklayabilme ihtimali.

Girdi token'ının neredeyse tamamı cache okumadır (1,19–1,27 milyon). Çıktı token'ı 8,3 bin
ve 9,6 bin. İki kol arasındaki çıktı farkı %13,5; toplam farkı %6,4.

Koşunun kendi bedeli 0,85 $ ve yaklaşık 4 dakika sürdü.

## Bilinen kısıtlar

- Ajan tarafı non-deterministik: aynı görev iki kez koşulduğunda tur sayısı, okunan
  dosyalar ve dolayısıyla cache okuma miktarı oynayabilir.
- Kullanıcının kendi koyduğu tavan: **kol başına en fazla 3 tekrar** (eco dahil). Daha
  fazlasını istemiyor.
- Bench harcama yetkisi: 50 $ altı sorulmadan yapılabilir.
- Üç tekrarlı bir koşunun tahmini bedeli ~2,5 $ ve ~20 dakika.
- Havuzda başka görevler de var (`06-slugify-cli` bunlardan biri); tek görevle ölçüm
  görev-özgü olabilir.

## Kullanıcının sorusu (kendi cümlesi, olduğu gibi)

"n=1 ne oluyor neden core daha ucuz çıktı bu tesadüfü marifete çevirmenin yolu var mı
mantıklı mı vb"

Yani üç şey soruyor:

1. n=1'in ne anlama geldiği, bu farkın ne kadarının gürültü olduğu.
2. Core'un neden ucuz çıkmış olabileceği — mekanizma var mı, yoksa tamamen şans mı.
3. Bu tesadüfü "marifete" çevirmenin, yani eklentiyi gerçekten ölçülebilir biçimde daha
   ucuz kılmanın bir yolu var mı ve bunu kovalamak mantıklı mı.

## Altın kural (bağlam)

Kullanıcının değişmez kuralı: maliyet native seviyesinde olacak. Yani hedef "native'den
ucuz olmak" değil, "native'den pahalı olmamak". Eklentinin varlık gerekçesi tasarruf değil,
kullanıcıya sağladığı davranış (kanıt kapısı, denylist, işaretler, kütüphane).
