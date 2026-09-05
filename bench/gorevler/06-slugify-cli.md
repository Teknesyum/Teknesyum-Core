---
repo: https://github.com/sindresorhus/slugify.git
sha: 2acf5b3cadf7faed3928536d051104502ae2b667
---

Çalışma dizininde `sindresorhus/slugify` paketinin `2acf5b3cadf7faed3928536d051104502ae2b667`
commit'ine pinlenmiş bir kopyası var (`index.js` içindeki `slugify` fonksiyonu hazır ve
çalışıyor; `npm install` çalıştırmak serbest). Pakete bir komut satırı aracı ekle.

Görev dört parçadan oluşur, hepsi bitmeden iş bitmiş sayılmaz:

1. **`cli.js`** — paketin kökünde, ESM (`"type": "module"`), `#!/usr/bin/env node` satırıyla
   başlayan, `index.js`'teki `slugify`'ı kullanan bir komut satırı aracı.
2. **`package.json`** — `"bin": {"slugify": "./cli.js"}` girdisi. Mevcut alanlar ve
   bağımlılıklar değişmez; **yeni çalışma zamanı bağımlılığı eklenmez** (argüman ayrıştırma
   elle yazılır ya da Node'un yerleşik `util.parseArgs`'ı kullanılır).
3. **`readme.md`** — `## CLI` başlıklı yeni bir bölüm: kurulum, kullanım ve bayraklar.
4. **Testler** — `test-cli.js` adında yeni bir ava test dosyası; aracı `node cli.js ...` ile
   alt süreç olarak çalıştırıp aşağıdaki davranışları doğrular. Mevcut `test.js` değişmez ve
   yeşil kalır.

Aracın davranışı:

- **Girdi:** komut satırı argümanı olarak verilen metin (`slugify "Hello World"`); argüman yoksa
  standart girdi okunur, her satır ayrı slug'lanır ve ayrı satırda basılır (boş satırlar
  atlanır). Ne argüman ne stdin varsa (stdin boş) standart hataya kısa bir mesaj yazılır ve
  çıkış kodu **1** olur.
- **Çıktı:** slug, standart çıktıya, sonunda tek `\n` ile.
- **Bayraklar:** `--separator <s>` (varsayılan `-`), `--no-lowercase`, `--no-decamelize`,
  `--preserve-leading-underscore`, `--preserve-trailing-dash`; her biri `slugify`'ın aynı adlı
  seçeneğine karşılık gelir. `--help` (`-h`) kullanım metnini standart çıktıya yazar, çıkış
  kodu 0. Bilinmeyen bayrakta standart hataya mesaj, çıkış kodu **2**.
- **Sayaç yok:** aynı slug'ın tekrarı numaralanmaz; `slugifyWithCounter` kullanılmaz.

Örnekler (kabul edilen çıktılar):

```
slugify "Hello World"                       → hello-world
slugify "Hello World" --separator _         → hello_world
slugify "fooBar" --no-decamelize            → foobar
slugify "Hello World" --no-lowercase        → Hello-World
slugify "_foo" --preserve-leading-underscore → _foo
printf 'Foo Bar\nDéjà Vu!\n' | slugify      → foo-bar  (satır 1)
                                              deja-vu  (satır 2)
```

Tasarım kararları (dosya düzeni, argüman ayrıştırma, stdin okuma biçimi) senin. Bittiğinde
`npx ava test.js test-cli.js` yeşil olmalı. Git komutu çalıştırma, commit atma.
