# Aider repo map

> Kanıt seviyesi: kod (`aider/repomap.py` okundu), depo verisi `gh api` ile alındı

## Kimlik

Depo `Aider-AI/aider`, dil Python, lisans Apache-2.0. Doğrudan bağımlılık listesi
(`requirements/requirements.in`) 35 kalem; kilitlenmiş dosyada 110 satır pin var —
aralarında `networkx<3.5`, `grep_ast`, `diskcache`, `litellm`, `fastapi` gibi ağır
kalemler bulunuyor. Son commit 2026-05-22 (bakımda).

Kurulum biçimi: **repo map bağımsız bir ürün değil**. Aider'ın kendi CLI sohbet
programının içindeki bir modül; MCP'si, eklentisi ya da ayrı CLI'ı yok. "Kurmak"
demek aider'ı kurmak ya da `repomap.py` algoritmasını yeniden yazmak demektir.

## Çözdüğü dert

"Modele hangi dosyaları vereceğimi ben seçmek istemiyorum; deponun bana bu iş için
en önemli olan iskeletini, verdiğim token bütçesine sığacak kadarını göstersin."

## Veri akışı

Diskteki kaynak dosyaları okur. Her dosyayı **tree-sitter** ile ayrıştırıp dile özgü
`.scm` sorgularını çalıştırır; yakalamalardan `name.definition.` olanı `"def"`,
`name.reference.` olanı `"ref"` etiketi sayar. Yalnız tanım sorgusu olan dillerde
(C++ gibi) referansları **Pygments** lexer'ıyla `Token.Name` üzerinden geri doldurur.

Çıkardığı etiketlerden `networkx.MultiDiGraph` kurar: düğüm dosya, kenar
"referans veren dosya → tanımlayan dosya". Kenar ağırlığı çarpanlarla ayarlanır —
konuşmada anılan tanıtıcı `mul *= 10`, ≥8 karakterlik snake/kebab/camel tanıtıcı
`mul *= 10`, `_` ile başlayan özel tanıtıcı `mul *= 0.1`, 5+ dosyada tanımlı
tanıtıcı `mul *= 0.1`, sohbetteki dosyadan gelen referans `use_mul *= 50`,
referans sayısı `math.sqrt(num_refs)` ile ölçeklenir. Hiç referansı olmayan tanım
`weight=0.1` ile kendine bir kenar alır.

Ardından **kişiselleştirilmiş PageRank**: kişiselleştirme vektörü sohbetteki
dosyalara ve anılan dosyalara `100 / len(fnames)` payı verir, anılan tanıtıcıların
yol bileşenleriyle eşleşen dosyalara ek pay ekler. Sonuç, dosya başına önem sırası.

Üç katmanlı önbellek:

1. **Tags cache** — `diskcache.Cache` (SQLite), disk üzerinde
   `.aider.tags.cache.v{CACHE_VERSION}` klasörü. Kayıt biçimi
   `{"mtime": file_mtime, "data": tags_list}`; dosya mtime'ı değişince yeniden
   ayrıştırır. SQLite hatasında sessizce `dict()`'e düşer.
2. **Map cache** — bellek içi sözlük; anahtar
   `(chat_fnames, other_fnames, max_map_tokens, mentioned_fnames, mentioned_idents)`.
   Tazeleme siyaseti `refresh` ayarıyla: `"auto"`, `"manual"`, `"always"`, `"files"`.
3. **Tree cache** — işlenmiş ağaç, anahtar `(rel_fname, sorted_lines_of_interest, mtime)`.

Güncelleme zamanı: **her istek üzerine**, ama önbellek sayesinde çoğu turda yalnız
değişen dosyalar yeniden ayrıştırılır. Aider'ın kendi akışında harita her LLM
isteğine yeniden yazılır.

## Bağlam maliyeti

Core açısından **pasif yük sıfırdır**, çünkü kurulacak bir MCP ya da skill yok;
aider ayrı bir programdır ve Claude Code oturumuna hiç girmez.

Aider'ın kendi akışında maliyet açıktır ve koda gömülüdür: `max_map_tokens`
varsayılanı **1024 token** ve bu harita her istekte prompta girer — Core'un maliyet
sınıflandırmasında bu **C sınıfıdır** (her turda yazar).

Bütçeye sığdırma yöntemi: `lower_bound=0`, `upper_bound=num_tags` arasında ikili
arama; her orta noktada ağaç kurulur, token sayılır, `ok_err=0.15` (%15) hata payı
içine düşen ilk sonuç ya da bütçe altındaki en iyi sonuç kabul edilir.

Algoritmayı Core'a taşımanın maliyeti (**tahmin**): tree-sitter WASM/native
bağımlılığı + PageRank uygulaması; sıfır bağımlılık ilkesini bozmadan yapılırsa
saf JS PageRank ~60 satır, sembol çıkarımı ise regex'e düşer.

## Core'daki karşılık

- `map.js` **aynı ailedendir ama daha ucuzdur**: regex tabanlı import taraması,
  düğüm dosya, kenar import. Tree-sitter yok, sembol yok, PageRank yok.
- Core'da **hiç olmayan** iki şey: (a) sembol düzeyinde tanım/referans çıkarımı,
  (b) önem sıralaması ve **token bütçesine sığdırma**. `map.js` çıktısı bütçesizdir:
  `## Edges` bölümü dosya sayısıyla doğrusal büyür, kırpma yoktur.
- Core'da **daha iyi** olan: çıktı modelin bağlamına kendiliğinden girmez, diske
  (`.claude/relay/map.md` + `map.json`) yazılır ve yalnız okunmak istendiğinde okunur.
  Ayrıca `map.json` içindeki `_map.head` alanı haritayı **git HEAD'ine mühürler**;
  `staleness()` `rev-list --count at..HEAD` ile "kaç commit bayat" der. Aider'ın
  mtime tabanlı tazeliğinden daha ucuz ve daha anlamlı bir tazelik ölçüsüdür.

## Çalınabilir fikir

1. **Bütçeye ikili arama ile sığdırma.** Çıktının kendisini değil, çıktıya giren
   **öğe sayısını** ikili aramayla ayarlamak; `ok_err` gibi bir hata payıyla erken
   durmak. `map.js`'in `## Edges` bölümüne doğrudan uygulanabilir: `--budget N`
   ile satır sayısı değil token sayısı hedeflenir.
   **Altın kuralı ihlal eder mi — hayır.** Çıktı yine diske yazılır; bütçe yalnız
   dosyanın boyunu küçültür, yani ihlal riskini azaltır.

2. **Kişiselleştirilmiş PageRank yerine ağırlıklı in-degree yükseltmesi.**
   `map.js` şu an hub'ları ham `from.length` ile sıralıyor. PageRank'in özü
   "önemli dosyanın işaret ettiği dosya da önemlidir"; saf JS'te 20 iterasyonluk
   güç yöntemi bağımlılık gerektirmez. Kişiselleştirme vektörü Core'da doğal
   olarak **sözleşmenin `owns` listesi** olur: açık sözleşmenin dokunduğu dosyalar
   kişiselleştirme payını alır, harita o işe göre sıralanır.
   **Altın kuralı ihlal eder mi — hayır.** Hesap `map.js` çalıştırıldığında olur,
   sonuç diske yazılır.

3. **Kenar ağırlığı çarpanları.** "Özel tanıtıcı 0.1", "5+ dosyada tanımlı tanıtıcı
   0.1", "uzun ve konvansiyonlu isim ×10" — yani **gürültülü sinyali sıfırlamak
   yerine bastırmak**. Core'un `risk.js`'i şu an ikili çalışıyor (`high`/`low`,
   sebep listesi). Aynı çarpan mantığı risk skoruna uygulanabilir: hassas yol ×10,
   test dosyası ×0.1, üretilmiş dosya ×0.1.
   **Altın kuralı ihlal eder mi — hayır.** `risk.js` zaten yalnız kapıda çalışıyor.

4. **Üç katmanlı önbellek ve sürümlü önbellek adı.** `.aider.tags.cache.v{N}` —
   önbellek biçimi değişince ad değişir, eski önbellek kendiliğinden ölür,
   göç kodu yazmaya gerek kalmaz. `map.json` şeması değişirse aynı desen
   (`_map.schema` alanı ya da dosya adında sürüm) bedava güvenlik verir.
   **Altın kuralı ihlal eder mi — hayır.** Tamamen disk tarafı.

5. **Bozulmaya karşı sessiz düşüş.** SQLite açılmazsa `dict()`'e düşmek; yani
   önbellek katmanı asla programı düşürmez. `map.js` şu an `map.json` okunamazsa
   `who` komutunda hata veriyor; aynı desen "harita yoksa taze kur" olabilir.
   **Altın kuralı ihlal eder mi — hayır.**

## Ret adayı gerekçe

Değerli olan kısım (sembol düzeyinde def/ref çıkarımı) **tree-sitter'a bağlıdır** ve
Core'un sıfır bağımlılık ilkesi bunu doğrudan yasaklar. Tree-sitter'sız yeniden
yazılırsa geriye kalan şey `map.js`'in zaten yaptığı regex taramasıdır; yani
algoritmanın taşınabilir kısmı ile Core'un mevcut kısmı büyük ölçüde çakışır ve
geriye yalnız iki soyut fikir (bütçeye ikili arama, ağırlıklı sıralama) kalır.
Bir fikri almak için bir ürünü incelemek gerekmez.

İkincisi, aider'ın bu haritayı **her isteğe yazması** Core'un altın kuralının tam
karşıtıdır; mekanizma alınırken bu alışkanlığın da alınması gerçek bir risktir.

## README cümlesi

Aider's repo map ranks a repository's symbols with tree-sitter and PageRank and
injects the result into every model request; Core's `map.js` computes the same
shape of dependency graph with zero dependencies and writes it to disk, where it
costs nothing until you ask for it.
