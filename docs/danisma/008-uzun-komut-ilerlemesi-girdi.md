# 008 — Uzun Süren Bash Komutunun İlerlemesi (Girdi)

## Soru

Kullanıcının sorusu, kendi cümlesiyle:

> bu tarz işlemlerin progress ini ücretsiz görmemiz mümkün mü fable a sor bir işlemi
> progress barı ile beklemekle ne kadar süreceğini bilmeden beklemek arasında fark yüksek

Somut örnek: bir Bash aracı çağrısı 1 dk 3 sn'dir çalışıyor, ekranda "No output yet" yazıyor.
Komut `robocopy` ile `D:\!Tmp\VideoEdit` altına ~4 klasör kopyalıyor (`/MT:8`, `/XF`, `/NFL /NDL /NP`
gibi bayraklarla), toplam onlarca GB video. Kullanıcı ne kadar sürdüğünü ve nereye geldiğini görmek
istiyor. Bu ekranda hiçbir şey yok — sadece geçen süre ve "No output yet".

## Altın kural

Sıradan turda hiçbir kanca modelin bağlamına tek token yazmaz. "Ücretsiz" = model bağlamına
0 token. Statusline modelin görmediği yerdir; oraya yazmak bedava.

## Elimdeki olgular

Teknesyum Core bir Claude Code eklentisi. Kanca kaydı (`core/hooks/hooks.json`) şu an şunları
bağlıyor:

- `PreToolUse` — `Write|Edit|NotebookEdit` → guard.js; `Write|Edit` → prefs.js;
  `Bash|PowerShell` → guard.js; `Agent|Task` → watch.js
- `PostToolUse` ve `PostToolUseFailure` — `Write|Edit|NotebookEdit|Bash|PowerShell|Agent|Task`
  → watch.js
- `SubagentStop`, `Stop`, `SessionEnd`, `PreCompact` → watch.js
- `Notification`, `StopFailure` → notify.js (async, timeout 10)
- `SessionStart`, `UserPromptSubmit` → cue.js
- `MessageDisplay` → notice.js

Bilinen davranış: `PreToolUse` komut çalışmadan **önce**, `PostToolUse` **bittikten sonra** çalışır.
Komut sürerken tetiklenen bir kanca olayı bilmiyorum. Yani kanca, komut 60 saniye sürerken
periyodik olarak çağrılmıyor.

Statusline tarafı: `core/scripts/statusline.js` her turda (ve Claude Code'un kendi yenileme
ritminde) çalışır, `.claude/relay/live/*.json` dosyalarını okuyup banner basar. Banner'da
şu an koltuk adı, kademe (`Fable-Medium Danışman`), iş satırı, `??` işareti var. Adım/dosya/
dakika sayaçları bilerek kaldırıldı — kimse bakıp bir şey yapmıyordu.

`core/hooks/watch.js` zaten `PreToolUse` (Agent|Task) ve `PostToolUse` üzerinde çalışıyor ve
`live/` altına json yazıyor. `notify.js` ses/bildirim işini görüyor ve `stamp()` fonksiyonu var.

Ortam: Windows 11, kabuk PowerShell 5.1. Claude Code masaüstü uygulaması (Code sekmesi).
Robocopy'nin kendi ilerleme çıktısı var ama `/NP /NFL /NDL` ile bastırılmış; bastırılmasa bile
çıktı araç bittiğinde tek seferde modele döner — yani ilerleme olarak işe yaramaz ve token yakar.

## Senden istediğim

Görüş değil, karar verilebilir bir yol. Şunlara cevap ver:

1. Claude Code'un kanca ve statusline mekanizmasında, **komut sürerken** tetiklenen bir yol var mı?
   Yoksa bunu söyle — uydurma. Emin değilsen "doğrulanmalı" de ve nasıl doğrulanacağını yaz.
2. Kanca yoksa, ilerlemeyi 0 token ile göstermenin mekanik yolu nedir? Aklıma gelenler:
   (a) `PreToolUse/Bash` kancası komutu sarmalar, komut arka planda çalışır, ilerleme bir dosyaya
   yazılır, statusline o dosyayı okur; (b) komutun kendisi `> ilerleme.txt` yazar ve statusline
   dosyanın son satırını basar; (c) statusline'ın kendisi her yenilenişinde hedef klasörün
   boyutunu ölçer. Her birinin gerçekten bedava olup olmadığını ve nerede kırılacağını söyle.
3. Robocopy gibi ilerlemesi ölçülebilir komutlarla, ilerlemesi ölçülemeyen komutlar (npm install,
   test koşusu) arasında ayrım yapmak gerekiyor mu? Genel bir çözüm mü, tanınan komut listesi mi?
4. Bunun ucuz sürümü ne? Kaç satır, hangi dosya, hangi kanca. Yapmaya değmiyorsa değmez de.

Cevabını `## Soru` (varsa netleştirme), `## Olgu` (doğrulanmış/doğrulanacak bilgi),
`## Yol` (yapılacak iş) başlıklarıyla ver. Türkçe yaz.
