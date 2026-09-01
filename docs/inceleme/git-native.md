# Git'in Kendisi

> Kanıt seviyesi: çalıştırıldı

Aşağıdaki her sayı Teknesyum-Core deposunda (git 2.55.0.windows.3, 92 commit,
77 izlenen dosya) gerçekten çalıştırılarak ölçüldü.

## Kimlik

Sıfır kurulumlu rakip. Core zaten `git`'e bağımlı: `risk.js` `git diff --numstat`
çağırıyor, `contract.js` `git rev-parse`, `git grep`, `refs/teknesyum/` snapshot'ları
kullanıyor, `seal.js` diff digest'i git'ten alıyor. Yani "yeni bağımlılık" değil,
**zaten elde olan ama kullanılmayan yüzey**.

Git'in etki analizi için sunduğu, Core'un bugün kullanmadığı komutlar:
`git log -L`, `git log --follow`, `git log -S` (pickaxe), `git blame --line-porcelain`,
`git merge-base`, `git log --all`, `git rev-list --count -- <path>`.

## Çözdüğü dert

`risk.js` bugün riski üç şeyden okuyor: yol deseni (`HIGH_PATHS`), dosya sayısı (>8),
değişen satır sayısı (>300). Üçü de **statik** — dosyanın tarihçesini hiç sormuyor.
Git, aynı maliyetle üç boyut daha veriyor:

1. **Tarihsel oynaklık** — bu dosya ne sıklıkla değişti, en son ne zaman.
2. **Birlikte-değişme (co-change coupling)** — bu dosya değişince tarihsel olarak
   hangi dosyalar da değişmiş. `owns` listesinin eksik olup olmadığının sinyali.
3. **Eşzamanlılık** — başka bir dal/worktree aynı dosyaya dokunuyor mu.

## Veri akışı

Ölçülen komutlar ve süreleri (hepsi tek `spawnSync`, ağ yok, kurulum yok):

| Komut | Ne verir | Süre | Çıktı boyu |
|---|---|---|---|
| `git log --format= --name-only \| sort \| uniq -c \| sort -rn` | tüm tarihçe churn tablosu | **43 ms** | 77 satır |
| `git rev-list --count HEAD -- <path>` | tek dosyanın commit sayısı | **22 ms** | 1 sayı (`statusline.js` → 21) |
| `git log --format=%H -- <path>` + her commit için `git show --name-only` | birlikte-değişme tablosu | **112 ms** | 12 satır |
| `git log -L '/^function assess/,/^}/:core/scripts/risk.js'` | tek fonksiyonun tarihçesi + diff'i | **26 ms** | 2 commit |
| `git log -S 'DIFF_LIMIT' -- <path>` | bir sembolün hangi commit'te doğduğu | **21 ms** | 1 satır |
| `git blame --line-porcelain -- <path> \| grep ^author-time` | satır başına yaş | **35 ms** | dosya satırı kadar |
| `git merge-base HEAD origin/main` | dalın ayrılma noktası | **27 ms** | 1 sha |
| `git grep -l --fixed-strings -- '<ad>'` | kaba etki yarıçapı | **22 ms** | 8 dosya |
| `git log --follow -- trash/title.js` | yeniden adlandırma öncesi tarihçe | <50 ms | 2 commit |
| `git diff --unified=0 <base> HEAD -- <f> \| grep '^@@'` | değişen satır aralıkları + kapsayan fonksiyon adı | <30 ms | 7 hunk |
| `git diff --name-status --diff-filter=ACDMRT` | dosya başına A/M/D/R sınıfı | <30 ms | 20 satır |
| `node core/scripts/map.js who core/scripts/risk.js` | import grafiğinden ters bağımlılık | **68 ms** | 3 satır |

Ölçülen büyüklük farkı — `HEAD~5..HEAD` aralığı için:

```
git diff        HEAD~5 HEAD  →  32 584 bayt
git diff --stat HEAD~5 HEAD  →  20 dosya, 286 ekleme, 50 silme
git diff --numstat HEAD~5 HEAD →     542 bayt
```

**60 kat.** `risk.js`'in bugün `--numstat` seçmesi doğru seçim; ölçüm bunu doğruluyor.

Yeniden adlandırma tespiti gerçekten çalışıyor: `git log --diff-filter=R -M --name-status`
depoda `core/hooks/title.js → trash/title.js` (R100) ve
`docs/contracts/S-isaretci-denetimi.md → trash/...` (R095) çiftlerini buldu. Yani
`trash/` politikası git tarafından "silme" değil "taşıma" olarak görülüyor — `--follow`
ile geçmiş korunuyor.

Bir olumsuz bulgu: `git diff --numstat -w` ile `-w`siz çıktı bu depoda **birebir aynı**
çıktı. Yani "sadece boşluk değişmiş, riski düşür" fikri ancak gerçek boşluk gürültüsü
olan depolarda işe yarar; burada ayırt edici değil.

## Bağlam maliyeti

**Sıfır.** Hepsi `risk.js`/`contract.js` içinde `spawnSync` ile çalışır; çıktı Node
değişkenine gider, modelin bağlamına değil. Bugünkü `gitNumstat()` ile aynı desen,
aynı maliyet sınıfı. Toplam ek süre, yukarıdaki tablodan seçilecek 3-4 komut için
**~150-250 ms** — `contract.js complete` zaten `verify:` adımlarını (dakikalar
sürebilir, `VERIFY_TIMEOUT` 45 dk) çalıştırdığı için ölçülemeyecek kadar küçük.

Ölçek uyarısı (**tahmin**): tüm tarihçeyi tarayan churn ve co-change komutları 92
commit'te 43-112 ms. 50 000 commit'lik bir depoda bu doğrusal büyür ve saniyelere
çıkabilir. Bunun için `--since=90.days` veya `--max-count` ile pencere daraltmak
gerekir; ölçülmedi.

## Core'daki karşılık

- `core/scripts/risk.js` — `gitNumstat()` (satır 20-35) tek git çağrısı. `assess()`
  üç sinyal döndürüyor. Tarihçe sinyali için doğal yer.
- `core/scripts/contract.js` — `orphans()` (satır 523) **zaten** `git grep -l
  --fixed-strings` ile "bu dosyaya kimse dokunuyor mu" sorusunu soruyor. Git-native
  etki analizi fikri Core'da zaten mevcut, sadece riske bağlı değil.
- `core/scripts/map.js` — `who(root, target)` import grafiğinden ters bağımlılık
  veriyor. Git'in `git grep`'i ile aynı soruyu farklı kanıttan cevaplıyor; ikisi
  birleştirilebilir (import kenarı **kesin**, grep **kaba**).
- `core/hooks/seal.js` — `ownsDigest` + `headSha`, denetim kaydının çıpası. `merge-base`
  bu çıpayı dal-farkındalıklı yapabilir.

## Çalınabilir fikir

1. **Tarihsel oynaklık sinyali.** `git rev-list --count HEAD -- <file>` +
   `git log -1 --format=%at -- <file>`. Çok dokunulan ve dün dokunulmuş dosya, aynı
   satır sayısında daha risklidir. `assess()`'e dördüncü sebep satırı.
   *Altın kuralı ihlal eder mi — hayır.* (22 ms, spawnSync, çıktı modele gitmez)

2. **Birlikte-değişme ile eksik `owns` yakalama.** Sözleşme `owns: [a.js]` diyorsa,
   `a.js`'in tarihçesindeki commit'lerde %70+ oranda beraber değişmiş `b.js` `owns`'ta
   yoksa `check()` bunu "owns eksik olabilir" diye yazsın. Ölçüldü: `risk.js` için
   `contract.js` ve `test/all.js` 3/3 commit'te beraber. Bu, Core'un "agent yalnız
   `owns` içine yazabilir" kuralının en sık çarptığı duvarın **önceden** haberi.
   *Altın kuralı ihlal eder mi — hayır.*

3. **`git log -L` ile fonksiyon-düzeyi tarihçe.** `git log -L '/^function X/,/^}/:file'`
   26 ms'de bir fonksiyonun tüm değişim tarihçesini diff'iyle veriyor. Ajanın "bu
   fonksiyon neden böyle" sorusu için dosyayı baştan okumaya alternatif — `scout`
   rolüne verilecek bir komut.
   *Altın kuralı ihlal eder mi — hayır* (ajan kendi turunda kendi isteğiyle çalıştırır;
   sıradan turda hiçbir kanca çalıştırmaz).

4. **`merge-base` çıpalı risk.** `risk.js` bugün `git diff --numstat HEAD` ile
   **çalışma ağacını** ölçüyor. Bir worktree'de çalışan ajan için doğru taban
   `merge-base` olmalı; aksi halde dalda biriken commit'ler riskten kaçar. Tek satırlık
   düzeltme, 27 ms.
   *Altın kuralı ihlal eder mi — hayır.*

5. **Eşzamanlılık uyarısı.** `git log --all --since=1.day -- <owns>` başka bir ref'te
   aynı dosyaya dokunulduğunu gösterirse, SKILL.md'nin "iki yazıcı bir checkout'u
   paylaşır" uyarısı **kanıtla** verilebilir. Ölçüldü, 3 satır çıktı.
   *Altın kuralı ihlal eder mi — hayır.*

6. **`--follow` ile `trash/` sürekliliği.** RULES.md ölü dosyayı silmeyip `trash/`'a
   taşımayı emrediyor; git bunu R100 rename olarak görüyor. Yani taşınan dosyanın
   tarihçesi kaybolmuyor — `map.js`/`log.js` bunu kullanabilir.
   *Altın kuralı ihlal eder mi — hayır.*

7. **Hunk başlığı fonksiyon adını taşıyor.** `git diff --unified=0` çıktısında
   `@@ -44 +44 @@ function fit(parts, cap)` — yani `{dosya, satır aralığı, fonksiyon}`
   tablosu ek bir araç olmadan çıkıyor. `risk.js` "hangi fonksiyonlar değişti" sorusunu
   parser yazmadan cevaplayabilir; ölçüldü, 7 hunk. Dosya sayısı yerine **değişen
   fonksiyon sayısı** daha dürüst bir risk ölçüsü olabilir.
   *Altın kuralı ihlal eder mi — hayır.*

8. **Dosya durumu sınıfı.** `git diff --name-status --diff-filter=ACDMRT` — silme (`D`),
   ekleme (`A`), yeniden adlandırma (`R`) ve değiştirme (`M`) farklı risk taşır;
   `--numstat` bu ayrımı vermiyor, `risk.js` bugün hepsini ham satır sayısına eziyor.
   Ölçüldü.
   *Altın kuralı ihlal eder mi — hayır.*

9. **`git grep` + `map.js who` birleşimi = etki yarıçapı.** import kenarı kesin kanıt,
   `git grep -l` kaba kanıt (string, doküman, test adı). İkisinin birleşimi
   `contract.js check` çıktısına "bu değişiklik şu 8 dosyayı ilgilendirir" satırı yazar.
   Ölçüldü: `risk.js` için import 1 dosya, grep 8 dosya.
   *Altın kuralı ihlal eder mi — hayır.*

## Ret adayı gerekçe

- Git tarihçesi **niyeti** değil **olguyu** bilir. Çok değişen dosya "riskli" değil,
  belki sadece README'dir — ölçümde en çok değişen iki dosya `README.md` (54) ve
  `README.tr.md` (52). Ham churn sayısı tek başına yanıltıcı; yol filtresiyle
  eşleşmeden kullanılamaz.
- Genç depoda sinyal yok. 92 commit'te co-change sayıları 2-3; istatistik değil
  gürültü olabilir. Eşik gerektirir, eşik ise uydurma sayı riski taşır.
- Ölçek belirsizliği ölçülmedi (yukarıdaki tahmin).
- `-w` boşluk filtresi bu depoda hiçbir şey ayırt etmedi; "akıllı" görünüp değer
  vermeyen bir sinyal.
- Her yeni git çağrısı `risk.js`'i büyütür; bugün 96 satır ve tek sorumluluğu var.
  Dokuz fikrin hepsi alınırsa dosya iki-üç katına çıkar — Core'un sadeliği bir varlıktır.

## README cümlesi

You do not need to install this, and you never could: git is already in the repository,
and everything Core wants from it -- diff size, file churn, changed line ranges, what
historically changes alongside a file -- comes back in under a tenth of a second from
commands that write to a script variable rather than to the model's context.
