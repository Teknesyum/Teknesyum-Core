# Bench görevleri — tam kapsam (görev 1-5)

**Dondurma tarihi:** 2026-09-05T00:44:11Z (görev 3-5 ve 02'nin sızıntı düzeltmesi için;
görev 1-2'nin ilk dondurması 2026-09-05T00:10:28Z'de kaldı). Bu dosyalar ve yanındaki
`.md` / `.kabul.sh` dosyaları koşu başladıktan sonra değiştirilmez. Bir hata bulunursa
yeni bir görev numarası açılır, dondurulmuş dosya elle düzeltilmez.

Kapsam ve kurallar `docs/BENCH.md` bölüm 3 ve 4'te. Görev metinleri (`NN-*.md`)
harness'tan bağımsızdır, native kola da aynen verilebilir. Kabul testleri (`*.kabul.sh`)
kol etiketi görmez, yalnız çalışma dizinini alır, geçti/kaldı için 0/1 döner. Pinin
işlevsel kaynağı her görev dosyasının başındaki `repo:`/`sha:` frontmatter'ıdır; gövdedeki
sha bahsi ajana giden tek-prompt metnin kendi içinde tutarlı olması için var, koşucu onu
ayrıştırmaz.

---

## 01 — sindresorhus/slugify (yeşil alan benzeri, JS)

**Pinlenen commit:** `2acf5b3cadf7faed3928536d051104502ae2b667` (paketin `3.0.1` etiket
commit'i, `2026-09-01T11:49:25Z`).

```
gh api repos/sindresorhus/slugify/commits/2acf5b3cadf7faed3928536d051104502ae2b667 --jq '{sha, date: .committer.date, message}'
```

**Tahmini süre:** 20-25 dk. **Zorluk gerekçesi:** tek dosyalık (`index.js`) bir fonksiyon;
zor kısım camelCase/kısaltma bölme (`HTMLEscape`, `APIs` gibi çoğul kısaltmalar) ve
transliterasyonu kütüphaneye devretme kararı — spec'te anlatılıyor ama testler görmeden
tüm kenar durumları tutturmak gerçek bir zorluk. 30 dakikalık tavanın altında kalır çünkü
kapsam tek fonksiyon ve iki bağımlılığa (`@sindresorhus/transliterate`,
`escape-string-regexp`) devredilebilir bir alt problem (Unicode→ASCII) içeriyor.

Kabul testi (`01-slugify.kabul.sh`) iki katman çalıştırır: (1) depodaki `test.js`'in
kendisi (`npx ava test.js`), (2) `test.js`'te geçmeyen, farklı dillerden (Yunanca,
Kiril, Korece — transliterasyonu olmayan bir dil dahil), NFC birleşik aksan
(`éclair` = `e` + U+0301) ve sayaç sıfırlama durumlarını kapsayan ayrı bir Unicode
kenar-durum seti. Bu ikinci katman, `test.js`'teki tam string'leri ezberleyip geçen
bir sahte çözümü yakalamak için var.

Referans doğrulama (bu depoda kalıcı değil, yalnız bu README'nin kanıtı): pinlenmiş
commit'teki gerçek `index.js` ile kabul testi **PASS**, `slugify(s){return s}` gibi
kırık bir gövdeyle **FAIL** verdi.

---

## 02 — pallets/click (hata düzeltme, Python)

**Pinlenen commit:** `a5f5aa6d4012d256ccca24638f2642fc371e9f77` ("Handle empty bytes in
echo (#3493)", `2026-05-21T22:46:00Z`) — gerçek hatanın düzeltildiği
`5ee8e3123d8ddece6c47eff9a7a7d4ca478c4f37` birleşme commit'inin bir önceki ebeveyni.

```
gh api repos/pallets/click/pulls/3482 --jq '{merged, merge_commit_sha, base: .base.sha}'
gh api repos/pallets/click/commits/5ee8e3123d8ddece6c47eff9a7a7d4ca478c4f37 --jq '.parents[0].sha'
```

**Hata:** issue [pallets/click#3449](https://github.com/pallets/click/issues/3449) —
`echo_via_pager` çağıran bir komut `CliRunner.invoke` ile test edildiğinde
`ValueError: I/O operation on closed file.` ile patlıyor (Click 8.4 regresyonu).
Kök neden `src/click/_termui_impl.py`'deki `_nullpager` fallback'inin, kendisine
verilmeyen (`CliRunner`'ın yakaladığı) bir akışı kapatması.

**Tahmini süre:** 15-20 dk. **Zorluk gerekçesi:** tek dosyada, issue'daki reprodüksiyon
kodu net; kök nedeni bulmak akışın nereden kapandığını (`get_pager_file` →
`_nullpager` → dönen nesnenin `close()`'u) izlemeyi gerektiriyor ama depo küçük ve
`grep` ile izi sürülebilir. 30 dakikalık tavanın belirgin şekilde altında.

Kabul testi (`02-click.kabul.sh`) çalışma dizini için `mktemp -d` ile ayrı, geçici bir
Python `venv` kurar; `click`'i o venv'e `pip install -e .` ile, `pytest`'i de o venv'e
`uv.lock`'ta kilitli `9.0.2` sürümüne sabitleyerek kurar (daha yeni pytest, `9.1.x`,
bu commit'te ilgisiz bir `parametrize` uyarısını hataya çevirip yanlış kırmızı
üretiyor). Ana makinenin `python`/`pip` kurulumuna dokunmaz; koşu bitince venv ve
geçici log/script dosyaları (`mktemp` ile üretilmiş, sabit ad yok) silinir — sıralı ya
da paralel koşularda birbirine sızmaz.

Önce depodaki `tests/` takımını bu venv'in `pytest`'iyle çalıştırır — tek istisna
`tests/test_termui.py::test_get_pager_file_nullpager_keeps_stringio_stream`, bu test
akış nesnesinin *kimliğiyle* ilgili eski bir varsayım taşıyor ve gerçek düzeltmeyle
(bkz. PR [#3482](https://github.com/pallets/click/pull/3482)) davranışı değişiyor, o
yüzden değerlendirmeden hariç tutuldu. Sonra issue'daki reprodüksiyon kodu birebir
çalıştırılır, istisnasız ve `"Hello, Click!\n"` çıktısıyla bitmesi beklenir.

Referans doğrulama (izole venv ile, 2026-09-05T00:10:28Z tekrarı): pinlenmiş commit +
gerçek PR düzeltmesi (yalnız `src/click/_termui_impl.py` diff'i) uygulanınca kabul
testi **PASS**; düzeltmesiz pin **FAIL** (aynı `ValueError` traceback'iyle) verdi. Her
iki koşuda da ana `python`'da `click`/`pytest` kurulu kalmadı, geçici venv dizini
koşu sonunda silindi.

**2026-09-05 düzeltmesi:** `VENV="$(mktemp -d)/click-kabul-venv"` deseni `mktemp -d`'nin
ürettiği dizinin kendisini silmiyordu — `cleanup` yalnız `$VENV` alt dizinini kaldırıyor,
üst dizin boş kalıp sistemde birikiyordu. `VENV_ROOT="$(mktemp -d)"` olarak ayrıştırıldı,
`cleanup` artık `$VENV_ROOT`'u siliyor; ayrıca `trap cleanup EXIT HUP INT TERM` eklendi ki
kabul testi sinyalle kesilirse de venv arkada kalmasın. Gerçek `click-check` klonuyla
tekrar çalıştırıldı, aynı `PASS` sonucu değişmeden alındı ve `mktemp -d` dizini koşu
sonrası sistemde kalmadığı doğrulandı. Aynı desen (`VENV_ROOT` + `trap`) 04 ve 05'te de
kullanıldı.

---

## 03 — chalk/wrap-ansi (refactor, JS)

**Pinlenen commit:** `c6b6259a58843e491e8703c5010a2a517b5f5738` (`10.0.1` sürümü,
`2026-08-17T22:40:33Z`, `main` dalının `HEAD`'i).

```
git ls-remote https://github.com/chalk/wrap-ansi.git HEAD refs/heads/main
gh api repos/chalk/wrap-ansi/commits/c6b6259a58843e491e8703c5010a2a517b5f5738 --jq '{sha, date: .commit.committer.date, message: .commit.message}'
```

**Tahmini süre:** 15-20 dk. **Zorluk gerekçesi:** kapsam `index.js` içindeki tek bir
fonksiyona (`applySgrResetCode`) daraltıldı — foreground/background/underlineColor SGR
sıfırlama kodları için üç neredeyse özdeş `if` bloğunu tek bir `Map` aramasına indirgemek.
Zorluk kodu bulmakta değil, tam sıfırlama (`ANSI_SGR_RESET`) ve modifier sıfırlamalarını
(`removeModifierStylesByClose`) yanlışlıkla aynı yapıya çekmeden davranışı birebir
korumakta. 30 dakikalık tavanın belirgin altında.

Kabul testi (`03-wrap-ansi.kabul.sh`) iki katman çalıştırır: (1) depodaki `test.js`
(`node --test test.js`, 80 test), (2) pinlenen commit'teki orijinal `wrapAnsi`
çalıştırılarak elde edilmiş, foreground/background/underline-color kombinasyonlarını
kapsayan 5 girdi/çıktı çiftiyle davranışın değişmediğini gösteren ayrı bir sav seti.
Kurulum çalışma dizininde (`npm install`), geçici dosyalar `mktemp` ile üretiliyor,
`trap cleanup EXIT HUP INT TERM` sinyalde de temizliyor.

Referans doğrulama (gerçekten çalıştırıldı, scratchpad'de izole klonla): pinlenen commit +
gerçek refactor (üç `if` bloğunun `Map`'e indirgenmiş hâli) ile kabul testi
`PASS: test.js yeşil (80 test) ve SGR sıfırlama davranışı değişmedi` verdi. Kırık bir
çözümle (foreground→background eşlemesi kasıtlı yanlış yapıldı) aynı kabul testi
`FAIL: depodaki mevcut test takımı (test.js) kırmızı` verdi — depodaki `test.js` takımı
bozukluğu davranış savlarına gerek kalmadan zaten yakaladı.

---

## 04 — jonschlinkert/gray-matter (hata düzeltme, JS)

**Pinlenen commit:** `e948648d45e304f6bdbc0f93857ae74c94073062` (`2.0.2` sürümü,
`2015-11-14T21:54:19Z`) — upstream düzeltmesinin (PR
[#32](https://github.com/jonschlinkert/gray-matter/pull/32), issue
[#31](https://github.com/jonschlinkert/gray-matter/issues/31), birleşme commit'i
`880549e18938defeef1ee00551b64c79b9f7c2fb`) bir önceki ebeveyni.

```
git clone https://github.com/jonschlinkert/gray-matter.git
git checkout e948648d45e304f6bdbc0f93857ae74c94073062
gh api repos/jonschlinkert/gray-matter/commits/e948648d45e304f6bdbc0f93857ae74c94073062 --jq '{sha, date: .commit.committer.date, message: .commit.message}'
```

**Hata:** girdi front-matter'dan sonra Windows satır sonuyla (`\r\n`) geliyorsa,
`index.js` yalnız tek `\n` karakterini strip ediyor, `\r\n`'i strip etmiyor; sonuçta
`content` alanının başında fazladan bir `\r\n` kalıyor (`"\r\ncontent here\r\n"` yerine
`"content here\r\n"` bekleniyor). Unix satır sonuyla (`\n`) sorun yok.

**Tahmini süre:** 15-20 dk. **Zorluk gerekçesi:** tek dosyada (`index.js`), reprodüksiyon
kodu net; kök neden front-matter'ı ayıran ayraçtan sonraki satır sonu strip mantığının
yalnız `\n`'i düşünmesi — `grep`/okuma ile hızlı bulunur. 30 dakikalık tavanın altında.

Kabul testi (`04-gray-matter.kabul.sh`) önce depodaki mevcut takımı (`npm test`, mocha,
2 testi zaten "pending") çalıştırır, sonra `mktemp` ile üretilen ayrı bir `.js`
dosyasında CRLF front-matter reprodüksiyonunu birebir çalıştırır ve `content`'in tam
olarak `"content here\r\n"` olmasını denetler. Kurulum çalışma dizininde tutulur, geçici
dosyalar `trap cleanup EXIT HUP INT TERM` ile temizlenir.

Referans doğrulama (gerçekten çalıştırıldı, scratchpad'de izole klonla): pinlenen commit +
gerçek düzeltme (`else if (con.charAt(0) === '\r' && con.charAt(1) === '\n') con =
con.substr(2);`) uygulanınca kabul testi
`PASS: mevcut test takımı yeşil ve CRLF front-matter reprodüksiyonu düzeldi` verdi.
Düzeltme geri alınıp yalnız pinlenen (bozuk) hâliyle çalıştırılınca
`FAIL: CRLF front-matter reprodüksiyonu hâlâ kırmızı` verdi, aynı hatalı çıktıyla
(`"\r\ncontent here\r\n"`).

---

## 05 — psf/requests, tek modül (refactor, Python)

**Pinlenen commit:** `dae7ef63b4df6eded86637f251fc4e3a06c3b479` (`main` dalının `HEAD`'i,
`2026-09-02T18:15:52Z`).

```
git ls-remote https://github.com/psf/requests.git HEAD refs/heads/main
gh api repos/psf/requests/commits/dae7ef63b4df6eded86637f251fc4e3a06c3b479 --jq '{sha, date: .commit.committer.date, message: .commit.message}'
```

**Tahmini süre:** 15-20 dk. **Zorluk gerekçesi:** büyük depoda (`psf/requests`) dar bir
kapsam — yalnız `src/requests/utils.py` içindeki `guess_json_utf` fonksiyonu, BOM/null-byte
sayımına dayalı iç içe `if`/`elif` zincirini sadeleştirme. Zorluk kod boyutunda değil,
depoda doğru dosyayı/fonksiyonu bulmakta ve 16 farklı BOM/null-byte kombinasyonu için
davranışı birebir korumakta. Kapsam bilinçli olarak tek fonksiyona daraltıldı (tüm
`utils.py` ya da modülün tamamı değil) ki 30 dakikalık tavanın belirgin altında kalsın;
kabul testi de yalnız `tests/test_utils.py`'ı çalıştırır (228 test, tamamen çevrimdışı,
~0.5 saniye) — `psf/requests`'in tam takımı ağ/`httpbin` gerektirdiği için hariç
tutuldu.

Kabul testi (`05-requests.kabul.sh`) 02-click ile aynı izole-venv + `trap` desenini
kullanır: `mktemp -d` ile ayrı bir kök dizin açar, içine venv kurar, `requests`'i
`pip install -e .` ile içe aktarır, `pytest`'i kurar. Önce `tests/test_utils.py`'ı
çalıştırır, sonra pinlenen orijinal `guess_json_utf`'ten gerçekten çalıştırılarak elde
edilmiş 16 girdi/çıktı çiftiyle davranışın değişmediğini ayrıca denetler. `trap cleanup
EXIT HUP INT TERM` venv ve geçici dosyaları sinyalde de temizler.

Referans doğrulama (gerçekten çalıştırıldı, scratchpad'de izole klonla — hem alt ajan
tarafından hem bu README'yi yazarken tarafımdan tekrarlandı): pinlenen commit + gerçek
refactor (`guess_json_utf`'in `_guess_json_utf_by_bom` + `_guess_json_utf_by_nulls` iki
yardımcıya bölünmüş hâli) ile kabul testi
`PASS: tests/test_utils.py yeşil ve guess_json_utf davranışı korunmuş` verdi (`228
passed, 1 skipped`). Kırık bir çözümle (`"utf-8"` dönüşü `"utf-8-BROKEN"` yapıldı) aynı
kabul testi `FAIL: tests/test_utils.py kırmızı` verdi.
