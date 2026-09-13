# Standart: Güncelleme ve Kurulum Paneli (taslak)

Asistan'ın `kur-usb.ps1` + `senkron.js` tekniğinden çıkarıldı
(`docs/raporlar/asistan-guncelleme-paneli.md`). Onaylanınca özel rafa
`private/tercihler/ui.md` altına geçecek, buradaki dosya `trash/`'e gidecek.

## 1. İki kanal ayrılır

**Kur penceresi** ilk kurulum, onarım ve sil-baştan-kur içindir; kendi penceresini açar,
kapatılamaz, kullanıcıyı sonuna kadar taşır. **Günlük güncelleme** programın kendi
senkronunda, üst çubuktaki rozette yürür; pencere açmaz, işi kesmez.

## 2. İş ile arayüz ayrılır

Asıl iş ayrı bir iş parçacığında koşar (PowerShell'de runspace, Node'da alt süreç,
web'de worker). Tek köprü paylaşılan bir durum nesnesidir:

```
kaynak, hedef, gunluk, yuzde, tavan, adim, log, durum
durum: calisiyor | bitti | hata
```

Arayüz bu nesneyi okur, işe hiç karışmaz. İş tarafı tek bir `Adim(yuzde, tavan, cumle)`
çağrısıyla konuşur; başka yoldan ekrana bir şey yazmaz.

## 3. Tavan kuralı

Her adım "şu an buradayım" ve "en fazla buraya kadar" der. Çubuk yüzdeye hızla yaklaşır
(fark × 0.08, en az 0.2), yüzde durursa tavana sürünür (fark × 0.006). Böylece uzun süren
bir adımda bile çubuk yaşar, ama sonraki adımın alanını yemez. Yüzde asla geri gitmez.
Yenileme 16 ms.

## 4. Kullanıcı asla boş kalmaz

Ekranda her an üç şey durur: ne yapıldığı (tam cümle, teknik değil), yüzde, son 9 günlük
satırı — sonuncusu vurgulu renkte, öncekiler sönük. Uzun metin kırpılır (üç nokta),
asla sarmaz. `Adim` her çağrıldığında günlüğe de bir satır düşer; günlük ayrıca diske yazılır.

## 5. Sonuç duyurulur, yol gösterilir

İş bitmeden hiçbir düğme görünmez. Bittiğinde durum rengi değişir ve düğmeler gelir:
başarıda "programı aç" birincil + "Kapat" ikincil, hatada "Günlüğü Aç" + "Kapat".
Odak birincil düğmeye gider. Çalışırken pencere kapatılamaz, Escape işlemez.

## 6. Görsel teknesyum-ui tokenlarından

Renk, boşluk, yazı tipi ve geçiş süresi `--tk-*` tokenlarından gelir; panelde sabit
değer yazılmaz. Durum renkleri: çalışıyor → vurgu, bitti → `--tk-success`,
hata → `--tk-danger`, çevrimdışı → `--tk-warning`, yerel → `--tk-disabled`.
Çubuk çalışırken iki renkli geçiş + üstünden geçen tarama ışığı; bittiğinde düz durum rengi.
Başlık standart üst çubuğun iki renkli adıdır.

## 7. Günlük güncelleme rozeti

Üst çubukta `.basbar-senk`: renkli nokta + metin. Beş durum ve metinleri:

```
bekliyor "Bağlanıyor…" · esitleniyor "Eşitleniyor…" · esitlendi "Eşitlendi"
cevrimdisi "Çevrimdışı" · yerel "Yalnız bu bilgisayar"
```

`esitlendi` ve `cevrimdisi` sonuna ` · HH:MM` alır. Tıklanınca hemen eşitler ve anında
`esitleniyor`'a düşer. `title` varsa hata metnini taşır. Metin boşsa rozet görünmez.

## 8. Güncelleme ne yaptığını söyler

Eşitleme sonunda değişenler sınıflanır ve sonuç duyurulur:
kod değiştiyse "Yeni sürüm geldi, program yenileniyor…" + gecikmeli yeniden başlatma,
yalnız veri değiştiyse "Başka bilgisayardaki değişiklikler geldi", hiçbiri değiştiyse
yalnız rozetin saati güncellenir. Sessiz yeniden başlatma yasak.

## 9. Prova kipi

Bir ortam değişkeniyle panel birebir aynı koşar ama geçici hedefe kurar, kısayol yazmaz,
"aç" düğmelerini göstermez. Panel provasız yayımlanmaz.

## 10. Şablon elle yazılmaz

Panel Teknesyum-UI `templates/` altında durur, `scaffold.js kur` ile kopyalanır.
Program başına kopyalanan tek şey adım listesi ve tavanlardır.
