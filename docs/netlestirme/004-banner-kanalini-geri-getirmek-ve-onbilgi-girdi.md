[[netlestirme:004]]

# Netleştirme: banner kanalini geri getirmek ve Onbilgilendirme ile Senden istediklerim baslikl

İşe başlamadan önce soruyu keskinleştir. Görüş verme, plan yazma, kod yazma.
Yalnız şunu döndür: soruda belirsiz kalan yerler, her biri için tek satırlık bir netleştirme sorusu, en fazla beş. Belirsizlik yoksa "net" yaz.

## Soru

banner kanalini geri getirmek ve Onbilgilendirme ile Senden istediklerim basliklarini ayri bicimde cizmek: MessageDisplay dogru yol mu, ne basmali, riskleri ne

## Elde olan olgular

# Olgular — banner kanalı ve başlık rengi

## Ürün

Teknesyum Core, Claude Code için kancalardan ve betiklerden oluşan bir eklenti. Slash
komutu yok. Kullanıcı Claude Code'u **masaüstü uygulamasında** (Code sekmesi) kullanıyor,
terminalde değil.

Değişmez kural (altın kural): sıradan bir turda hiçbir kanca modelin bağlamına tek bayt
yazmaz. Maliyet ölçüsü "native'den pahalı olmamak".

## Kanal yasası (docs/COST-MODEL.md, docs/DECISIONS.md "Standing law")

- Hiçbir özellik `additionalContext`'e yazamaz.
- Hiçbir özellik, `systemMessage`'ı bağlama dönüştüren olaylarda kullanamaz:
  `SessionStart`, `UserPromptSubmit`, `UserPromptExpansion`.
- `systemMessage` diğer olaylarda bedava ama istemcide **katlanmış** bir "Claude Code
  notice" çipi olarak geliyor; çip açılmıyor, çünkü CLI `level`'ı `notice`'a sabitliyor ve
  istemci yalnız `warning` seviyesinde ya da verbose modda açıyor. Ayrıca CLI içeriğin
  başına `hookName + " says: "` ekliyor.
- Şu olaylar kancanın `systemMessage`'ını tümden atıyor: `Notification`, `SessionEnd`,
  `StopFailure`, `PreCompact`, `PostCompact`, `ConfigChange`, `Elicitation`,
  `InstructionsLoaded`, `WorktreeCreate`, `WorktreeRemove`, `SubagentStart`, `SubagentStop`.
- Statusline bedava ama masaüstü uygulaması onu çizmiyor (Ink bileşeni).
- `terminalSequence` pencere başlığı istiyor; masaüstü uygulamasında öyle bir şey yok.

## Daha önce çalışmış çözüm (D15, Base sürümü)

`MessageDisplay` olayı: asistan mesajı akarken tetikleniyor; `turn_id`, `message_id`,
`index`, `final`, `delta` taşıyor. Kanca `hookSpecificOutput.displayContent` döndürünce
istemcinin **çizdiği** metin onunla değişiyor. İkilinin kendi ifadesi: "Display-only: the
stored message and what the model sees are untouched."

Base'de `notice.js` bunu kullanıyordu: ilk akışa ve son akışa cevap veriyor, satırı
mesajın üstüne ve altına koyuyordu (yalnız alta koymak uzun cevapta ekrandan kayıyor).
Aradaki her akışta sessiz. Ölçülen: **sıfır model token**, mesaj başına bir kanca koşusu,
~43 ms node açılışı.

Bu dosya 0.16 çıkarmasında relay makinesiyle birlikte silindi ve Core'a hiç dönmedi.
Bugün Core'da `MessageDisplay` bağlı değil; depoda `notice.js` yok, `MessageDisplay`
geçen tek satır yok.

Not: `MessageDisplay` olayının bugünkü Claude Code sürümünde (2.1.251, masaüstü) hâlâ
desteklendiği **doğrulanmadı**; CC ikilisi diskte bulunamadı.

## Bugün Core'da var olan tek banner

`count.js`, `Stop` olayında `systemMessage` ile tek satır basıyor: `Seat: <slug> read,
<n> KB`. Yalnız bir ajans koltuğu gerçekten okunduğunda. D14'te bench ile ölçüldü:
altı koşu, ortalama 0,38 $ / 0,37 $ taban, sonda dizgisi hiçbir zaman `message.content`
içinde görülmedi.

## Kullanıcının banner ölçütü (docs/banner.md, kendi altı maddesi)

1. Sıfır maliyet. Bağlama yazan banner banner değil, gider kalemidir.
2. İyi görünmeli: tek satır, Başlığı Baş Harfleri Büyük, sütun taşırmaz.
3. İyi bilgi vermeli: kullanıcının o an bilmediği ve işine yarayan şey.
4. Lüzumsuz bilgi içermemeli: statusline'da zaten duran şey banner'a girmez.
5. Durum bildirmeli: nerede olduğumuzu söyler.
6. Sistemin çalıştığını söylemeli ve sonuçlarına hazırlamalı.

D15'te öğrenilen ders: banner bir **olay** bildirir, bir skor tablosu değil. İlk sürüm
"2 Ajan Explore · 72 Adım İzlendi · 6 Günlük" basıyordu; kullanıcı "bunlar ne demek" diye
sordu. Karşılaştırma noktası olmayan sayı bilgi değildir.

## Kullanıcının bugünkü iki isteği

### 1. İşaret banner'ı

Kullanıcı `ff` yazdı ve ekranda hiçbir şey görmedi. `mod.js` yordamı `additionalContext`
ile yalnız **modele** yazıyor. Kullanıcının kendi cümlesi, olduğu gibi:

"bak misal ff dedim Fable'a Sorma Durumu İnceleniyor... gibisinden bi banner olsa ne güzel
olurdu ancak hiç göremiyorum banner konusunda bir sıkıntı var sanırım"

"banner bedava değil mi neden geri getirmeyelim 43ms gecikme önemli değil"

Yani kullanıcı 43 ms gecikmeyi kabul ediyor ve kanalın geri gelmesini istiyor.

Bugün ekrana bir şey basabilecek işaretler: `??` `++` (kütüphane), `pp` (özel raf),
`aa` (ajans koltukları), `ff` (fable danışma yordamı), `hh` (işaret listesi).

### 2. Başlık rengi

Kullanıcının her iş sonunda iki başlığı var: önce **"Önbilgilendirme"** (kullanıcıya
haber verilmemiş her şey — plan adımı, komut, bayrak; ne olduğu ve ne olacağı), sonra
**"Senden istediklerim"** (numaralı, kopyalanabilir tetik metinleriyle). Kendi cümlesi:

"birde 'Senden istediklerim' ve 'Önbilgilendirme' kısımları farklı renkte olsa iyi olurdu
ön bilgilendirme daha kullanıcının anlayacağı şekilde açıklayıcı olmalı bunu biraz kısa
kesiyor gibi"

Modelin kendi markdown çıktısında renk yok; istemci tüm başlıkları aynı çiziyor.
`displayContent` çizilen metni değiştirebildiği için teorik olarak bu iki başlık ayrı
biçimde çizilebilir. `displayContent`'in markdown mı yoksa ANSI mi kabul ettiği
doğrulanmadı.

### 3. Yan bulgu: kapanış başlıklarının altına metin düşüyor

Kullanıcı bir ekran görüntüsü gösterdi: "Senden istediklerim / Yok" başlığından sonra
"Hook re-prompted Claude" ve ardından bir ton metin daha geliyor. Sebep: `Stop` olayındaki
kanıt kapısı (`dur.js`) turu bloklayınca model ikinci bir mesaj yazmak zorunda kalıyor ve
o mesaj kapanış başlıklarının **altına** düşüyor. Kullanıcı "senden istediklerim en aşağıda
olmalı" diyor.

Kapının o turda tetiklenme sebebi: `advice.js` danışma kaydını `docs/netlestirme/` altına
yazdı; `count.js` çalışma klasörü içindeki her dosyayı "düzenleme" sayıyor, `.md` ile `.js`
ayrımı yapmıyor. Yani kod değişmediği hâlde kapı kanıt istedi.

## Kısıt

- Yeni kanca yazmak serbest; ama sıradan turda modele bayt yazmamalı.
- Kullanıcı masaüstü uygulamasında; terminal-only çözümler işe yaramaz.
- Testler `npm test` ile koşuyor, bugün 351 test geçiyor.
