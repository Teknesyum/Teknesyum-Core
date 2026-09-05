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
