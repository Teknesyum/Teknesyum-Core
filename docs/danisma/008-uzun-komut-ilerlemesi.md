# 008 — Uzun Süren Bash Komutunun İlerlemesi

Tarih: 5 Eylül 2026. Rol: `advisor` (fable/medium). Girdi:
[008-uzun-komut-ilerlemesi-girdi.md](008-uzun-komut-ilerlemesi-girdi.md) — tam metin ayrı dosyada.

## Fable'ın cevabı (tam metin)

## Soru
1. Statusline, araç çağrısı sürerken yenileniyor mu? Claude Code onu transcript değişince çalıştırır, zamanlayıcıyla değil — komut 60 sn sürerken transcript değişmiyorsa banner donar. Doğrulama: statusline.js'e `Date.now()` bas, uzun bir `sleep 30` çalıştır, saat ilerliyor mu bak. İlerlemiyorsa (b)/(c) ölü doğar.
2. İlerleme kime lazım — modele mi, sana mı? Modele lazım değil; sen ekrana bakıyorsun. O zaman çözümün Claude Code'un içinde olması şart değil.

## Olgu
- Komut sürerken tetiklenen kanca yok: olaylar `PreToolUse` → (sessizlik) → `PostToolUse`. Bu bilinen kanca listesiyle tutarlı; aksini iddia eden bir olay adı bilmiyorum.
- "No output yet" ekranı zaten canlı akış: robocopy `/NP /NFL` kaldırılsa satırlar ekrana anında düşer, ama bitince hepsi modele döner — bedava değil, tam tersi.
- (a) sarmalayıcı: PreToolUse komutu değiştirebilir ama arka plana atarsan model "bitti" sanır, sonucu göremez; iş yarım kalır. (c) klasör boyutu ölçümü: onlarca GB'lik ağaçta her yenilemede `Get-ChildItem -Recurse` statusline zaman aşımını yer. (b) tek gerçekçi olan, ama 1. soruya bağlı.
- npm/test gibi ölçüsüz komutlar için "ilerleme" zaten yok; yalnız geçen süre var, o da ekranda. Genel çözüm arama.

## Yol
- Önce sıfır-kod yol: komutu `run_in_background` ile `robocopy ... /LOG+:D:\!Tmp\ilerleme.log` (NFL kapalı, NP açık kalsın) çalıştır; sen Terminal sekmesinde `Get-Content D:\!Tmp\ilerleme.log -Wait -Tail 3` aç. 0 token, kanca yok, statusline yok. Model bitince PostToolUse'la haber alır.
- Bu yetmezse ve 1. soru "evet" çıkarsa: statusline.js'e 5 satır — `live/progress.txt` varsa son satırını banner'a ekle; komutu yazan model `| Tee-Object` ile oraya yazar. Tanınan komut listesi kurma, dosya varsa bas, yoksa basma.
- Yapma: PreToolUse'ta Bash'i sarmalayıp arka plana atma; robocopy çıktısını modele geri akıtma.

## Maliyet

55.614 token, 43,1 sn, tek araç çağrısı.

## Fable'ın 1. sorusunun ölçümü

Fable "statusline araç çağrısı sürerken yenileniyor mu, ölç" dedi. Ölçüldü.

Yöntem: eklenti önbelleğindeki `0.15.0/scripts/statusline.js` başına tek satır eklendi —
her çalışmada `Date.now()` bir kayıt dosyasına yazıyor. Ardından ön planda 45 saniye süren
bir Bash komutu (`node -e` ile meşgul döngü) koşturuldu. Sonra kayıt sayıldı, satır geri alındı.

**Sonuç: 45 saniyede 0 tick.** Aynı probe elle çağrıldığında (`bridge.js`'e stdin verilerek)
1 tick yazdı — yani mekanizma çalışıyordu, statusline sadece hiç çağrılmadı.

Statusline bağı: `~/.claude/settings.json` → `node ".../0.9.0/scripts/bridge.js"`; bridge en yeni
sürümü seçtiği için gerçekte 0.15.0 koşuyor. Probe doğru dosyadaydı.

Yani Fable'ın (b) ve (c) şıkları bu barındırıcıda ölü doğuyor: komut sürerken banner donuyor,
ne dosya okunuyor ne klasör ölçülüyor. Geriye tek yol kalıyor — Claude Code'un dışı.

## Karar

Kullanıcı: "claude code dışında mümkün değilse gerek yok." İş kapandı, kod yazılmadı.
Banner'a ilerleme satırı eklenmeyecek, kanca sarmalayıcı kurulmayacak. Dosya, aynı soru
tekrar açılırsa ölçümün elde olması için duruyor.
