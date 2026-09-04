# 003 — Kapının Bash Kör Noktası

Danışılan: Fable. Tarih: 2026-09-04. Kayıt elle yazıldı; kurulu eklenti 0.9.0'dı, danışma
kaydını otomatik yazan yol 0.10.0 ile geldi.

## Sorulan (tam metin)

Teknesyum Core adlı bir Claude Code eklentisinin tasarım kararında görüşünü istiyoruz. Kod yazmanı istemiyoruz; hangi seçeneği kurmamız gerektiğine dair kısa ve gerekçeli bir hüküm istiyoruz. Cevabın tamamı Türkçe olsun.

### Sistem

Core, ajan işini "sözleşme" denen dosyalara bölüyor. Her sözleşmenin bir `owns` kümesi (dokunabileceği dosyalar) ve bir adım tavanı (varsayılan 150 araç çağrısı) var. Bir kanca (`guard.js`) `PreToolUse` olayında çalışıp sınırı çiğneyen çağrıyı reddediyor.

### Kusur

`guard.js` yalnız `Write`, `Edit` ve `NotebookEdit` araçlarını inceliyor. `Bash` ve `PowerShell` çağrıları bu denetimin dışında; onlar için yalnız `git merge|push` kalıbına bakılıyor.

Sonuç: kabuğun içinden koşan bir betik ne `owns` kümesine ne de adım tavanına takılıyor. İki somut olay:

1. Statusline'da `Adım 197/150` görüntüsü. Ajan tavanı 47 adım aşmış; adımların çoğu Bash olduğu için tavan hiç tetiklenmemiş. Sayaç doğru sayıyor, kapı o sayıya bakmıyor.

2. Bir yorum temizleme betiği depo kökünden koşturulunca, kökün içinde duran bağımsız bir git deposuna da girdi ve 51 dosyada 1878 satır sildi. Hasar geri alındı, çünkü hedef temiz bir depoydu ve değişiklik saf silmeydi. İkisi de tesadüftü.

### Seçenekler

**A — Tavanı bütün araçlara uygula.** `exhausted()` denetimi şu an yalnız yazma araçlarının koluna bağlı; onu kancanın girişine taşımak. Komut ayrıştırması yok, yalnız sayaç karşılaştırması. Yaklaşık 15 satır kod, 2 sav. Yanlış pozitif riski neredeyse yok. Kapsadığı şey yalnız "çok uzayan ajan"; sınır dışına yazmayı engellemiyor.

**B — Sızıntı dedektörü.** `PostToolUse` olayında, her Bash çağrısından sonra kök deponun ve altındaki her bağımsız git deposunun durumuna bakmak (`git status --porcelain`). `owns` dışında ya da iç içe bir depoda değişiklik varsa bir sonraki adımı bloklamak ve `live/problems.log` dosyasına yazmak. Komut başına yaklaşık 30-60 ms, modele hiçbir token yazmıyor. Yaklaşık 60 satır kod, 4 sav.

B önlemiyor, bir komut geç yakalıyor: hasar tek komutla sınırlı kalıyor ama olmuş oluyor. Gerçek önleme kabuğu izole etmek olurdu; o çok daha pahalı ve şu an açık bir madde.

### Bağlam

- Projenin altın kuralı maliyet: sıradan bir turda hiçbir kanca modelin bağlamına tek token yazmıyor. Bu kısıt korunmalı.
- Regex'le bash ayrıştırmanın kırılgan olduğunu daha önce ölçtük; o yüzden B sonuca bakıyor, niyete değil.
- Depoda 2630 sav var; her yeni davranış sav ister.
- Ölçüm alışkanlığımız var: bir kapının yanlış pozitifleri sayılmıyorsa ayarlanamaz.

### Soru

1. A, B, A+B ya da hiçbiri — hangisini kurmalıyız, neden?
2. Kurmadan önce toplamamız gereken bir sayı var mı?
3. Bu iki seçenekten daha ucuz ya da daha doğru, gözden kaçırdığımız bir üçüncü yol var mı?
4. Statusline'da `197/150` görüntüsü şu an sessizce doğru bir sayıyı gösteriyor. Kullanıcıya bunun bir aşım olduğunu ayrıca bildirmeli miyiz, yoksa bu gürültü mü olur?

Kısa yaz. Hükmü başa koy.

## Gelen cevap (tam metin)

**Hüküm: A'yı hemen kur. B'yi kurma; yerine daha ucuz bir "iç içe depo" kapısı ekle (aşağıda C). B'nin geri kalanını ölçüm alınmadan açma.**

### 1. Neden A, neden B değil

A ucuz, deterministik, yanlış pozitifi sıfır. Zaten var olan sayaca bakıyor; tek değişiklik "kim sayılıyor" sorusu. 197/150 vakası tamamen A'nın vakası. Bunu tartışmaya gerek yok.

B'nin sorunu maliyet değil, **aldığı şeyin adı**. B iki farklı olayı tek kapıda toplamış:

- `owns` dışında değişiklik → bu, ajanın "yanlış dosyaya dokunması". Bash'te bu sık ve çoğu masum: `npm install` lock dosyasını, test koşusu bir snapshot'ı, formatter beş dosyayı değiştirir. Bunları yanlış pozitif olarak saymadan bloklayan bir kapı, ajanı sözleşme ortasında kilitler. Ölçüm yok, dolayısıyla eşik yok.
- İç içe bağımsız depoda değişiklik → bu hiçbir zaman masum değil. Ajanın sözleşmesi kök depoyu kapsar; başka bir `.git`'in çalışma ağacına dokunmak her koşulda sızıntıdır.

İkincisi için yanlış pozitif tanımı gereği yoktur. Birincisi için ölçüm olmadan eşik seçemezsiniz. O yüzden B'yi bölün.

### 2. Kurmadan önce toplanacak sayı

Bir tek sayı: **Bash sonrası `owns` dışı değişiklik oranı**. Sadece log tutan (bloklamayan) bir `PostToolUse` kancası; her Bash'ten sonra `git status --porcelain` çıktısını `owns`'a göre ayırıp `live/problems.log`'a yazsın: sözleşme ID, komut, dışarı düşen yollar. 2-3 gün sonra:

- Dış değişikliklerin yüzde kaçı gerçek sızıntı, yüzde kaçı lock/snapshot/build çıktısı?
- Hangi yollar tekrarlıyor? (Muhtemelen bir `ignore` listesi çıkar: `package-lock.json`, `__snapshots__`, `dist/`.)

Bu sayı çıkmadan B'nin `owns` kolu kapıya dönüşmemeli. Bu zaten sizin kuralınız: sayılmayan yanlış pozitif ayarlanamaz.

Ek olarak A için ucuz bir sayı: son N oturumda tavanı aşan sözleşme sayısı ve aşımın Bash payı. Statusline zaten sayıyor; log'a bir satır düşürmek yeter. A'nın yanlış pozitifi yok, ama 150'nin doğru tavan olup olmadığını bu söyler.

### 3. Gözden kaçan üçüncü yol — C

**İç içe depo koruması `PreToolUse`'ta, komuta değil dosya sistemine bakarak.** Regex'e girmeden: kanca başlangıçta (ya da sözleşme açılırken bir kez) kökün altındaki bağımsız `.git` dizinlerini bulur, listeyi `live/` altına yazar. İki ucuz kullanım:

- **Önleme, ucuz sürüm:** Bash'ten önce bu depoların `HEAD` ve `index` mtime'ını not et; sonra karşılaştır. Bu B'nin `git status` maliyetinin onda biri ve yalnız iç içe depolara bakıyor. Yakalarsa bloklar ve log'a yazar. Yanlış pozitif yok, çünkü sözleşme dışı depoya dokunmanın masum hali yok.
- **Gerçek önleme, hâlâ ucuz:** Sözleşme açılırken iç içe depoları geçici olarak `chmod -w` / Windows'ta `attrib +R` ile salt-okunur yap, kapanışta geri al. Kabuk izolasyonu değil, ama "betik yanlış klasöre girdi" olayının yüzde doksanını kesiyor ve sıfır çalışma zamanı maliyeti var. Riski: sözleşme çökerse bayrak kalır; `closure.js` zaten kapanışı yönettiği için geri alma oraya bağlanabilir.

İkinci şık 51 dosya/1878 satır olayını geç yakalamaz, **hiç olmasını engeller**. B'nin "hasar olmuş oluyor" zaafını, izolasyon parasını ödemeden kapatıyor. Önce birinciyi kurun, ölçün; ikincisi sadece o depo listesine bağlı olduğu için sonra eklemek 20 satır.

### 4. `197/150` görüntüsü

Ayrıca bildirin, ama bir kez ve tek satır. Sessizce doğru sayı göstermek, kapı o sayıya bakmadığı sürece **yalan**: kullanıcı "tavan var" sanıyor, tavan yok. A kurulunca bu kendiliğinden düzelir; sayaç 150'de durur, aşım oluşmaz.

A'dan sonra hâlâ gösterilecek tek durum, tavanın açıkça yükseltilmiş olduğu sözleşmeler. Orada `197/150` yerine `197/250 (yükseltildi)` yazın; aşım değil, karar. "Aşıldı" uyarısını bağlama yazmayın — o token kuralınızı kırar. Statusline renk/işaret yeter, `problems.log`'a bir satır düşer, sözleşme kapanışında `complete` o satırı okur ve raporda gösterir.

### Sıra

1. A — bugün, ~15 satır, 2 sav.
2. C'nin birinci şıkkı — iç içe depo listesi + mtime karşılaştırması, ~30 satır, 3 sav. Bloklar.
3. B'nin `owns` kolu yalnız log modunda, ~25 satır, 1 sav. Bloklamaz.
4. 2-3 gün sonra log'a bakıp B'yi kapıya çevirmeye ya da çöpe atmaya karar verin.

Toplam, B'nin tek başına maliyetiyle aynı bandda; ama sızıntının masum olmayan kısmı önlenmiş, masum olabilen kısmı ölçülmüş olur.

## Ajan

`a0ca4a6a75f06cae0`, 51.094 token, 0 araç çağrısı, 56 sn.
