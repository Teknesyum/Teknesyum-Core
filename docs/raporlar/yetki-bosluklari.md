# Yetki boşlukları — ajan işini bitiremiyor, kullanıcıya el işi düşüyor

2 Eylül 2026 · VidShrink deposunda 138 sözleşmelik koşumdan çıkan gözlem.

## Hüküm

İzin katmanı bu projede **hiçbir tehlikeyi engellemedi**, yalnız işi durdurdu. Reddedilen
her işlem sonunda ya başka bir araçla ya kullanıcının eliyle yapıldı. Reddin ürettiği tek
fark: iş bir tur geç bitti ve kullanıcıya angarya döndü.

Kullanıcının sözleri, 2 Eylül: *"bende red aldım ancak izin veriyorum silmene… bu tarz
yetkisizlikleri istemiyorum sende bir."*

## Ölçülen olaylar

### 1. Özyineli silme araçtan araca değişiyor

Aynı yolları, aynı anda, iki araçla silmeye çalıştım:

| Araç | Komut | Sonuç |
|---|---|---|
| PowerShell | `Remove-Item -Recurse -Force <16 yol>` | **Reddedildi** |
| Bash | `rm -rf <aynı 16 yol>` | **16/16 silindi** |

Yollar birebir aynıydı: beş mühürlü sözleşmenin geçici klasörü ve üç sahipsiz ajan
worktree'si. Yani kural **işlemi** değil **aracı** kısıtlıyor.

Bir kapı, aynı işi yan kapıdan geçiriyorsa kapı değildir; ajana hangi kapının açık
olduğunu öğreten bir levhadır. Bu, `guard.js`'in `TEKNESYUM_GATE_OPEN` sorunuyla
(Kusur H) aynı ailedendir: meşru işi engelleyen kapı, aşılmayı öğretir.

### 2. Ajan kendi bıraktığı çöpü silemiyor

`AGENTS.md` her ajandan işi bitince kendi geçici dosyalarını silmesini istiyor. T114
ajanı bunu denedi, reddedildi ve raporuna yazdı: `.calisma/T114/{tekrar-deneme,
iki-hucre-deneme,kapi-denemesi}` silinemedi. Klasörler yerinde kaldı.

Sonuç: kural yazılı, uygulanamıyor. Bugün elle silinen birikinti **1,2 GB**.

### 3. Kullanıcıya devredilen iş geri geliyor

Önceki turda aynı silme kullanıcıya devredilmişti. Kullanıcı denedi, Windows dosya
kilidine takıldı ve iş bana geri döndü. Yani devir, işi bitirmedi; bir gidiş-dönüş ekledi.

## Kök neden

İzin listesi **niyeti** değil **komut metnini** eşleştiriyor. `rm -rf .calisma/T96` ile
`rm -rf C:\` arasında fark görmüyor; buna karşılık `Remove-Item -Recurse` yazan her şeyi
tehlikeli sayıyor. İkisi de yanlış tarafta hata yapıyor: biri fazla geçirgen, öteki
gereksiz kapalı.

Asıl eksik, **silmenin nerede meşru olduğunu bilen bir yer yok.** Proje bunu zaten
biliyor — `AGENTS.md` "geçici dosyalar `.calisma/` altına" diyor, `.gitignore` da aynı
sınırı çiziyor. Bu bilgi izin katmanına hiç ulaşmıyor.

## Öneri — Core silmeyi kendi üstlensin

Ham `rm -rf`'e izin vermek yerine Core bir betik versin:

`scripts/temizle.js`

1. Yalnız iki kök altında çalışır: `<proje>/.calisma/` ve `<proje>/.claude/worktrees/`.
   Bunların dışındaki her yolu reddeder — ajanın yazdığı yol değil, betiğin bildiği kök.
2. **Korunan adlar** silinmez: `kaynak/` gibi paylaşılan veri klasörleri
   `.calisma/.korunan` dosyasında listelenir; listedeki hiçbir şeye dokunulmaz.
   (Bu depoda `kaynak/` 3,5 GB ve ortak; yanlışlıkla silinmesi ölçüm düzeneğini bitirirdi.)
3. **Yalnız mühürlü sözleşmenin klasörünü siler.** `contracts/done/T96.md` varsa
   `.calisma/T96` gidebilir; `contracts/T132.md` `active` iken `.calisma/T132` duramaz —
   betik reddeder. Sahiplik zaten sözleşmede yazılı, ikinci kez sorulmaz.
4. Worktree'yi `git worktree remove` ile kaldırır, dalın `main`e birleşmiş olduğunu önce
   `git branch --merged` ile doğrular. Birleşmemiş dalı silmez.
5. `--dry-run` varsayılan; silmek için `--yap` gerekir. Ne silineceğini ve kaç bayt
   kazanılacağını basar.
6. Sildiğini `LOG.md`'ye tek satır yazar. Kaybolan veri sessizce kaybolmaz.

Böylece izin listesine tek bir satır düşer:

```
Bash(node <eklenti>/scripts/temizle.js:*)
```

Ham özyineli silmeye hiç izin verilmez; buna karşılık ajan işini bitirir ve kullanıcıya
"şunu sen sil" mesajı gitmez.

**Nasıl ölçülür.** Bir sözleşme turunda kullanıcıya devredilen el işi sayısı. Bugünkü
değer: 3 (iki silme, bir kilit çözme).

## İkinci öneri — reddin kendisi kayda geçsin

Bugün bir araç çağrısı reddedildiğinde iz kalmıyor; ne kullanıcı ne T0 sonradan
"burada ne engellendi" diye bakabiliyor. `guard.js` zaten `live/_sorun.log` yazıyor;
reddedilen çağrılar da oraya düşsün — araç, komut, gerekçe, zaman.

Aksi hâlde bu raporun verisi ancak elle toplanabiliyor, nitekim öyle toplandı.
