# 007 — Küresel mi, Projeye Özel mi

Danışılan: Fable (`advisor` rolü). Tarih: 2026-09-05. 51.567 token, 1 araç çağrısı, 44 sn.

## Sorulan (tam metin)

Teknesyum Core adlı **herkese açık** bir Claude Code eklentisinin tasarım kararında görüşünü
istiyoruz. Kod yazmanı istemiyoruz; kısa ve gerekçeli bir hüküm istiyoruz.

## Durum

Claude Code'da bir oturum yalnız açıldığı klasörün altına yazabiliyor. Dışarı çıkmak için
`permissions.additionalDirectories` listesine klasör eklemek gerekiyor. Bu liste iki ayrı
yerde durabiliyor:

**Küresel:** `~/.claude/settings.json`. Bütün projeler için geçerli. Şu an kullanıcının
makinesinde elle şu duruyor:

```
"additionalDirectories": ["~/Desktop/Projeler", "C:/Users/Administrator/Desktop/Projeler"]
```

**Projeye özel:** `<depo>/.claude/settings.local.json`. Yalnız o depoda açılan oturum için
geçerli, `.gitignore`'da, yani takıma gitmiyor. Senin bir önceki turda önerin üzerine
`setup.js --projectsRoot <klasör>` bayrağıyla bunu yazan yolu kurduk: bayrak yoksa hiçbir
şey yazmıyor, yalnız komutu ekrana basıyor; ev dizini, dosya sistemi kökü, var olmayan
klasör ve `~/.claude` içi reddediliyor.

Yani şu an ikisi bir arada duruyor.

## Kullanıcının kendi cümlesi

"Şimdi küresel bir ayar var ve bireysel bir ayar sistemi var. Bu ikisinin arasındaki fark
nedir, küresele ne kadar gerek var, çatışırlarsa ne olur, küresel sistemi kaldırmalı mıyız?"

## Bağlam ve kısıtlar

- Eklenti herkese açık. Kurulumda kullanıcının küresel izin kapsamını sessizce genişletmek
  kabul edilemez diye karar verdik; senin hükmündü.
- Projenin altın kuralı maliyet: sıradan bir turda hiçbir kanca modelin bağlamına tek token
  yazmıyor. `setup.js` tur dışında koştuğu için bu kuralı ilgilendirmiyor.
- Kullanıcının kuralı: "araçlarının yapabileceği işi bana verme" — mümkünse elle iş bırakma.
- Kullanıcı iki makinede çalışıyor (masaüstü, dizüstü) ve yollar farklı.
- Her yeni davranış sav ister; depoda 2.672 sav var.
- Windows, macOS, Linux.

## Bilmediğimiz ve senden tam olarak istediğimiz

1. Claude Code bu iki listeyi nasıl birleştiriyor — küresel ve projeye özel liste
   **birleşiyor mu**, yoksa projeye özel olan küreseli **eziyor mu**? Emin değilsen "emin
   değilim" de; uydurma. Emin değilsen bu belirsizliğin altında hangi seçimin daha güvenli
   olduğunu söyle.
2. Kullanıcının makinesindeki küresel satır kalmalı mı, kalkmalı mı? Kalkarsa ne kaybediyor?
3. Eklentinin kurduğu yol yalnız projeye özel olarak mı kalmalı, yoksa küresel bir bayrak da
   sunmalı mı?
4. İki liste bir arada dururken hangi somut kafa karışıklığı çıkar? Kullanıcı bir gün "neden
   bu klasöre yazabiliyorum, ben izin vermemiştim ki" derse cevabı nereden okuyacak?
5. Gözden kaçırdığımız daha ucuz ya da daha doğru bir yol var mı?

Kısa yaz. Hükmü başa koy. Cevabın tamamı Türkçe olsun.

## Dönüş biçimi

## Hüküm
<hangi yolu tutmalıyız>

## Neden
<gerekçe, en çok üç satır>

## Kaçırılan
<sorumuzda düşünmediğimiz şey>

## Gelen cevap (tam metin)

## Hüküm

Küresel satırı kaldır; eklenti yalnız projeye özel yolu (`settings.local.json`) sunsun, küresel bayrak ekleme. Tek seferlik dışarı çıkış için `claude --add-dir <klasör>` / oturum içi `/add-dir` yeter; kalıcı olanı `setup.js --projectsRoot` yazsın.

## Neden

Birleştirme: bildiğim kadarıyla izin dizileri (allow/deny/additionalDirectories) kapsamlar arasında **birleşir**, proje küreseli ezmez, daraltamaz; yalnız `deny` daraltır. Yüzde yüz emin değilim — ama iki ihtimalde de güvenli seçim aynı: birleşiyorsa küresel her depoda sessizce açık kalır, eziyorsa küresel zaten işe yaramaz. İkisinde de küresel kaybedilecek şey değil.

Kaybedilen tek şey: `Projeler` kökünde ya da `settings.local.json`'suz bir depoda açılan oturumun komşu depolara yazması. Bu da zaten CLAUDE.md'nin "proje kökünde aç" kuralıyla çelişen bir kullanım; `--add-dir` ile kapanır.

Kafa karışıklığının cevabı oturum içinde `/permissions`: etkin kuralları kaynağıyla (user/project/local) listeler. Depodan bakan biri küresel satırı göremez; yerel dosya ise deponun içinde, `git status`'un yanında durur — "neden yazabiliyorum" sorusunun cevabı yalnız yerel yoldayken tek yerde olur.

## Kaçırılan

- Küresel listedeki çift satır (`~/Desktop/Projeler` + mutlak yol) bir belirti: Windows'ta `~` genişlemesine güvenilmemiş. Kaldırınca bu belirsizlik de gider.
- İki makine sorunu küreselle değil yerelle çözülür: `settings.local.json` gitignore'da, her makine kendi mutlak yolunu taşır; küresel dosya da makine başına ayrıdır, avantajı yok.
- Sav yükü: küresel bayrak eklemek yeni bir yazma yolu, yeni ret kümesi (ev dizini, kök, `~/.claude`) ve ikinci bir "kim yazdı" sorusu demek; yerel-yalnız yol var olan savları yeniden kullanır.
- Eklentinin `guard.js` kancası yazma sınırını depoya göre mi, bu listeye göre mi çiziyor — bunu doğrulayın; hafızadaki "sınır klasör değil depo" notu buradan geçiyor.
- Soru 1'i kesinleştirmek ucuz: bir depoda yerel listeyi boş bırakıp küresel açıkken dışarı yazmayı deneyin; tek deneme, tek sav.
