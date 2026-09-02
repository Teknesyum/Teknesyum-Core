# Ek — 72 ek turun sınıf ataması (ham tablo)

`rele-surec-kusurlari-127-sozlesmelik-olcum.md` §2c'deki bütün sayılar bu tablodan
toplanmıştır. Kaynak: VidShrink deposu `.claude/relay/contracts/done/`, 131 mühürlü
sözleşme, 2 Eylül 2026.

Bir sözleşme `round: N` ise **N−1** satır taşır; her satır o turu açan gerekçedir.
İki KRİTİK'le açılan turda ilk yazılan KRİTİK esas alınmıştır.

| Sözleşme | Tur | Sınıf | Turu açan gerekçe |
|---|---|---|---|
| T100 | 2 | diger | kayit-yok: dosyada tur 2 bolumu yok |
| T106 | 2 | eksik-test | M5 mutasyonu hayatta, olcu oldurmuyor |
| T108 | 2 | mansetkaymasi | iki ozet cumlesi kendi tablosuna aykiri |
| T111 | 2 | mansetkaymasi | p10 iddiasi kilitli olcude isaret degistiriyor |
| T119 | 2 | eksik-test | Bench dusme yolunu hicbir olcu tutmuyor, istisna siziyor |
| T12 | 2 | eksik-test | K4.6 kapanmadi, kod-metin baglantisi olcusuz |
| T123 | 2 | mansetkaymasi | manset 90 517 ms belgenin kendi tablosuyla 3,2 kat tutmuyor |
| T13 | 2 | diger | usul: _sorun.log kaydi eksik |
| T14 | 2 | stil | yerlesim: bos durumda dokuz piksel tasma |
| T17 | 2 | eksik-test | K1 surum okuma kanitsiz |
| T18 | 2 | yanlis-kapsam | T0 yeni kriter ekledi (K9 gunde bir denetim) |
| T20 | 2 | diger | urun-kriteri: K1'in 100 MB bacagi karsilanmadi |
| T22 | 2 | diger | urun-kriteri: K5 delindi, surum satiri kullaniciya ulasmiyor |
| T25 | 2 | stil | birlesme sonrasi yerlesim yeniden olculdu, K6 simge |
| T29 | 2 | stil | boyama aciklama metinlerini kapsamiyordu |
| T33 | 2 | mansetkaymasi | belge kendi icinde celisiyor, curutulen sayilar isaretsiz |
| T36 | 2 | stil | etiket metni degisti (180 -> WhatsApp Web) |
| T40 | 2 | diger | urun-kriteri: SetLanguage etiketi demo sabitleriyle eziyor |
| T43 | 2 | diger | borc-uzerine: denetim GECTI, tur borc icin acildi |
| T44 | 2 | diger | urun-kriteri: K2, 2 sn inis sayaci hic kurulmuyor |
| T46 | 2 | yanlis-kapsam | T0 owns'i genisletti (WindowLayoutTests) |
| T48 | 2 | yanlis-kapsam | T0 K4'u bolup K9 acti |
| T54 | 2 | diger | dis-birlesme: bes sozlesme ana dala girdi, agac altindan degisti |
| T56 | 2 | yanlis-kapsam | T0'in kendi duzeltmesi uygulandi |
| T57 | 2 | diger | urun-kriteri: arama kendi tanimladigi cevabi vermiyor |
| T58 | 2 | diger | dis-birlesme: sapmayi T60 kapatti, rebase |
| T61 | 2 | diger | altyapi: T0 worktree yalitimi olmadan acti, ajan ana agaca yazdi |
| T62 | 2 | yanlis-kapsam | T0'in koydugu sinir yanlisti, owns genisletildi |
| T65 | 2 | yanlis-kapsam | T0'in koydugu sinir yanlisti, olcu hicbir sey korumuyormus |
| T69 | 2 | eksik-test | olcu "okuma uretilemedi" ile "kod yanlis"i ayirmiyor |
| T71 | 2 | yanlis-kapsam | owns dar tutulmustu, pinli taban kaza eseriymis |
| T72 | 2 | diger | kayit-yok: dosyada tur 2 bolumu yok |
| T76 | 2 | diger | urun-kriteri: kriter 3 delindi, Swap kokte exe birakmiyor |
| T78 | 2 | diger | kayit-yok: dosyada tur 2 bolumu yok |
| T85 | 2 | eksik-test | yarim kosum sessizce yesil sayiliyor (F2 KRITIK) |
| T86 | 2 | eksik-test | olcu davranisi degil zamanlamayi siniyor |
| T92 | 2 | eksik-test | yanlislanamayan olcu; tur acan bulgu dosyada acik yazili degil |
| T94 | 2 | yanlis-kapsam | sozlesmenin onceki hali yanlis onculde, T0 yeniden yazdi |
| T95 | 2 | mansetkaymasi | manset kendi tablosunu yalanliyor, aracin kapisini cigniyor |
| T98 | 2 | diger | dis-birlesme: T105 birlesti, tel tuzagi ates aldi |
| T102 | 2 | eksik-test | tur 2'ye giden bulgu: olcu izgarasi eksik |
| T102 | 3 | mansetkaymasi | "sebep sayi degil yer" iddiasi olculmemis, belgenin tablosu curutuyor |
| T115 | 2 | eksik-test | esik gevsetildi, gerekce olculmemis tarihsel orana dayaniyor |
| T115 | 3 | diger | altyapi: kosum kapisi yesil kosumda kod=66 donuyor |
| T118 | 2 | eksik-test | CI Failed farki kimlikle kapatilmamisti |
| T118 | 3 | mansetkaymasi | capa dogrulamasi: dokuz alintinin ikisi sapiyor |
| T16 | 2 | stil | yinelenen aciklama metni tek yere alinmadi |
| T16 | 3 | stil | cumle iki durumda da tam bir kez gorunsun |
| T23 | 2 | eksik-test | K7'nin dolu dosya bacagi hic olculmuyor |
| T23 | 3 | eksik-test | olcu ters kurulmus, kaydirma cubugunu zorunlu kiliyordu |
| T50 | 2 | mansetkaymasi | K2'nin sayilari dosyanin son kosumundan gelmiyor |
| T50 | 3 | mansetkaymasi | sinir maliyeti paragrafi ikinci kosumdan alintilayip "son kosum" diyor |
| T84 | 2 | eksik-test | tasma nobetcisi kendini onayliyor, kriter 5 totolojik, kriter 6 olculmemis |
| T84 | 3 | mansetkaymasi | rozet sayimi 44 dondurulmus, gercek populasyon 23 |
| T87 | 2 | diger | urun-kriteri: HDR + libx265'te psy bayraklari sessizce dusuyor |
| T87 | 3 | eksik-test | boyut garantisi kosan hicbir olcuyle bagli degil |
| T88 | 2 | diger | urun-kriteri: konteyner degisikligi planlayici girdisini bozdu |
| T88 | 3 | diger | urun-kriteri: konteyner asimetrisi hareket ekseninde duruyor |
| T99 | 2 | diger | CI: uc olcu CI'da dustu, tur 1'in iki sabitinin gorulmemis sonucu |
| T99 | 3 | mansetkaymasi | olculmus diye sunulan hucre olculdugunde curuyor |
| T126 | 2 | mansetkaymasi | eski kaymayi yeni kaymayla degistirdi ("hicbir zaman" iddiasi) |
| T126 | 3 | mansetkaymasi | kaldirici commit iddiasi yanlis |
| T126 | 4 | mansetkaymasi | duzeltmenin geri tepmesi, sozluk cumlesine tasindi |
| T28 | 2 | eksik-test | LiveProbeDecidesOnThisMachine sessizce geciyordu |
| T28 | 3 | diger | urun-kriteri: uc dal "hizli dusur kapali" cumlesini kosulsuz yaziyor |
| T28 | 4 | diger | borc-uzerine: borc 3 kapandi, uctan uca yol |
| T3 | 2 | diger | urun-kriteri: alt-tasma duzeltmesinin tavan payi yok |
| T3 | 3 | diger | urun-kriteri: bulgu 1 surduruyor, celiski derinlesti |
| T3 | 4 | diger | urun-kriteri: hedef isabeti, uc kusur ayni denklemin terimleri |
| T63 | 2 | mansetkaymasi | iki KRITIK, ikisi de manset sayinin kendisinde |
| T63 | 3 | mansetkaymasi | olculmemis sayi iki docstring'de duruyor, rapor kapandi diyor |
| T63 | 4 | mansetkaymasi | iki kritik de metin isi (17 satir yorum, silinmedi denen satirlar) |

## Doğrulama

- Satır sayısı: 72. Tur dağılımından beklenen: 40×1 + 10×2 + 4×3 = 72. Tutuyor.
- Sınıf toplamları: diğer 25, manşet kayması 17, eksik test 16, yanlış kapsam 8,
  stil 6. Toplam 72.
- Seviye toplamları: tur 2 → 54, tur 3 → 14, tur 4 → 4. Toplam 72.

## Atamanın zayıf yeri

Üç sözleşmede (T72, T78, T100) `round: 2` yazılı ama dosyada tur 2 bölümü yok;
gerekçe defterden okunamadı, `diğer / kayıt-yok` atandı. Bir sözleşmede (T92) tur 2'yi
açan bulgu dosyada açıkça yazılı değil; sınıf sözleşmenin konusundan çıkarıldı.
Dört satır, yani atamanın **%6'sı** dolaylı.
