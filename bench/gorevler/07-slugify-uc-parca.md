---
repo: https://github.com/sindresorhus/slugify.git
sha: 2acf5b3cadf7faed3928536d051104502ae2b667
---

Çalışma dizininde `sindresorhus/slugify` paketinin `2acf5b3cadf7faed3928536d051104502ae2b667`
commit'ine pinlenmiş bir kopyası var (`index.js` içindeki `slugify` hazır ve çalışıyor;
`npm install` serbest; yeni çalışma zamanı bağımlılığı **eklenmez**). Pakete üç özellik ekle.
Üçü de bitmeden iş bitmiş sayılmaz.

### Parça A — komut satırı aracı

- `cli.js` (kökte, ESM, `#!/usr/bin/env node`), `index.js`'teki `slugify`'ı kullanır.
- `package.json`'a `"bin": {"slugify": "./cli.js"}`; başka alan değişmez.
- Davranış: argüman metni slug'lanır (`slugify "Hello World"` → `hello-world`); argüman yoksa
  stdin satır satır (boş satır atlanır); ikisi de yoksa stderr mesajı + çıkış **1**.
  Bayraklar: `--separator <s>`, `--no-lowercase`, `--no-decamelize`; `--help` çıkış 0 ve
  "separator" geçer; bilinmeyen bayrak çıkış **2**.
- `test-cli.js` (ava): aracı `node cli.js …` ile alt süreç olarak sınar.
- `readme.md`'ye `## CLI` bölümü.

### Parça B — `maxLength` seçeneği

- `index.js`: `options.maxLength` (sayı, varsayılan sınırsız). Slug bu uzunluğu aşarsa
  kesilir; kesim bir ayırıcının ortasına denk gelmez ve sonuç ayırıcıyla bitmez
  (`slugify('foo bar baz', {maxLength: 7})` → `foo-bar`; `{maxLength: 6}` → `foo`;
  `{maxLength: 3}` → `foo`). `slugifyWithCounter` da aynı seçeneği kabul eder; sayaç eki
  (`-2`) sınıra **dahil değildir** (`foo-2` üretilebilir).
- `index.d.ts`: seçeneğin tipi ve açıklaması.
- `test-maxlength.js` (ava): yukarıdaki örnekler ve sayaç durumu.
- `readme.md`'de `##### maxLength` alt başlığı, öbür seçeneklerin yanında.

### Parça C — Türkçe ve Almanca özel karakter tabloları

- `overridable-replacements.js`: `ı→i`, `İ→I`, `ğ→g`, `Ğ→G`, `ş→s`, `Ş→S`, `ö→o`, `Ö→O`,
  `ü→u`, `Ü→U`, `ç→c`, `Ç→C` ve `ä→ae`, `ö→oe`, `ü→ue`, `ß→ss` çiftleri **iki ayrı dışa
  aktarım** olarak: `export const turkishReplacements = [...]` ve
  `export const germanReplacements = [...]` (varsayılan dışa aktarım olduğu gibi kalır;
  varsayılan davranış değişmez, `slugify('Ölçü')` bugün ne veriyorsa onu vermeye devam eder).
- `index.js`'e dokunulmaz; kullanıcı bu tabloları `customReplacements` ile verir. Türkçe tablo
  `ö→o`, `ü→u` der (varsayılan transliterasyon `oe`, `ue` verir), Almanca tablo `oe`, `ue`, `ss`:
  `slugify('Ölçü birimi', {customReplacements: turkishReplacements})` → `olcu-birimi`,
  `slugify('İstanbul Şişli', {customReplacements: turkishReplacements})` → `istanbul-sisli`,
  `slugify('Straße Köln', {customReplacements: germanReplacements})` → `strasse-koeln`,
  tablo verilmeden `slugify('Ölçü')` → `oelcue` (bugünkü davranış, değişmez).
- `test-replacements.js` (ava): yukarıdaki dört örnek.
- `readme.md`'ye `## Language tables` bölümü.

Ortak kurallar: `test.js` değişmez ve yeşil kalır; bittiğinde
`npx ava test.js test-cli.js test-maxlength.js test-replacements.js` yeşil olmalı. Git komutu
çalıştırma, commit atma. Tasarım kararları (dosya düzeni, argüman ayrıştırma, kesme algoritması)
senin.
