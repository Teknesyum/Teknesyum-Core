Bir Node.js (ESM, `"type": "module"`) paketi olarak, verilen dizindeki `index.js` dosyasına
bir `slugify` fonksiyonu yaz. Dizinde şu dosyalar hazır ve **değiştirilmeyecek**:
`package.json`, `test.js`, `overridable-replacements.js`, `index.d.ts`. Senin işin yalnızca
`index.js` dosyasını yazmak. `npm install` çalıştırmak serbest; `package.json` içindeki
`@sindresorhus/transliterate` ve `escape-string-regexp` bağımlılıklarını kullanabilirsin,
Unicode harflerin ASCII karşılığını kendin çıkarmana gerek yok.

`index.js` şunları export etmeli:

- `export default function slugify(string, options)` — bir metni "slug" haline getirir
  (URL, dosya adı ya da HTML id için uygun, küçük harf, tire ile ayrılmış ASCII metin).
- `export function slugifyWithCounter()` — `slugify(string, options?)` imzasına sahip yeni
  bir fonksiyon döndürür; bu fonksiyon aynı slug'ı ikinci kez üretirse sonuna `-2`, `-3`...
  ekler (sayaç slug bazında tutulur). Döndürülen fonksiyonun bir de `.reset()` metodu olur,
  çağrılınca sayaçları sıfırlar.

`options` alanları ve varsayılanları:

- `separator` (string, varsayılan `'-'`) — kelimeleri ayıran karakter.
- `lowercase` (boolean, varsayılan `true`) — sonucu küçük harfe çevir.
- `decamelize` (boolean, varsayılan `true`) — `fooBar` gibi camelCase metni `foo bar`
  gibi ayrı kelimelere böl. Art arda büyük harfli kısaltmalar da (`HTMLEscape`,
  `parseXMLDocument`, `APIs` gibi çoğul biten kısaltmalar dahil) kendi içinde doğru
  kelimelere bölünmeli.
- `customReplacements` (dizi dizisi, varsayılan
  `[['&', ' and '], ['🦄', ' unicorn '], ['♥', ' love ']]`) — orijinal metin üstünde, her
  türlü dönüşümden önce uygulanan bul-değiştir kuralları. Kullanıcı aynı anahtarla
  (mesela `'&'`) kendi kuralını verirse varsayılanın yerine geçer, vermezse varsayılan
  kalır. Değiştirilen metnin başında/sonunda boşluk varsa bu boşluklar tire ile ayrılmış
  ayrı kelime sınırı üretir.
- `preserveLeadingUnderscore` (boolean, varsayılan `false`) — `true` ise metin `_` ile
  başlıyorsa bu alt çizgi slug'da korunur.
- `preserveTrailingDash` (boolean, varsayılan `false`) — `true` ise metin `-` ile
  bitiyorsa bu tire slug'da korunur.
- `preserveCharacters` (string dizisi, varsayılan `[]`) — burada listelenen karakterler
  slug'dan silinmez. Sözcük sonundaki iyelik/kesme eki kesmesi (`'s`, `'t`) yine de
  silinir, `preserveCharacters` bunu etkilemez.
- `locale` (string, varsayılan `undefined`) — transliterasyon için dile özgü kural;
  doğrudan `@sindresorhus/transliterate` paketine aktarılabilir.
- `transliterate` (boolean, varsayılan `true`) — `false` ise Unicode karakterler ASCII'ye
  çevrilmez, oldukları gibi (küçük harfe çevrilmiş biçimde) kalır.

Örnekler:

```
slugify('I ♥ Dogs') //=> 'i-love-dogs'
slugify('  Déjà Vu!  ') //=> 'deja-vu'
slugify('fooBar 123 $#%') //=> 'foo-bar-123'
slugify('Conway’s Law') //=> 'conways-law'
slugify('я люблю единорогов') //=> 'ya-lyublyu-edinorogov'
slugify('BAR and baz', {separator: '_'}) //=> 'bar_and_baz'
slugify('Déjà Vu!', {lowercase: false}) //=> 'Deja-Vu'
slugify('fooBar', {decamelize: false}) //=> 'foobar'
slugify('_foo_bar', {preserveLeadingUnderscore: true}) //=> '_foo-bar'
slugify('foo-bar-', {preserveTrailingDash: true}) //=> 'foo-bar-'
slugify('foo_bar#baz', {preserveCharacters: ['#']}) //=> 'foo-bar#baz'
slugify('Déjà Vu', {transliterate: false}) //=> 'déjà-vu'
```

`slugifyWithCounter` kullanımı:

```
const slugify = slugifyWithCounter();
slugify('foo bar'); //=> 'foo-bar'
slugify('foo bar'); //=> 'foo-bar-2'
slugify.reset();
slugify('foo bar'); //=> 'foo-bar'
```

Bitirdiğinde `npx ava test.js` komutu bu dizinde hatasız (tüm testler yeşil) geçmeli.
Ekstra bağımlılık kurman gerekirse `npm install <paket>@<sürüm>` ile kur, `package.json`
dosyasının `dependencies` alanına elle dokunma; `npm install` zaten oradaki
`@sindresorhus/transliterate` ve `escape-string-regexp` sürümlerini kuracaktır.
