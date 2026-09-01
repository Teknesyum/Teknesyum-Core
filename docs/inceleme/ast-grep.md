# ast-grep

> Kanıt seviyesi: doküman (kural yapılandırma kılavuzu) + kod (`Cargo.toml`
> çalışma alanı okundu), depo verisi `gh api` ile alındı

## Kimlik

Depo `ast-grep/ast-grep`, dil **Rust** (edition 2024, rust-version 1.88), lisans
MIT, sürüm 0.45.3. Çalışma alanı `crates/*` altında ayrışıyor: `core`, `config`,
`language`, `dynamic`, `lsp`, `outline`. Çalışma alanı bağımlılıkları küçük ve
sıradan: `tree-sitter 0.27`, `regex`, `serde`, `serde_yaml`, `schemars`, `ignore`,
`dashmap`, `bit-set`, `thiserror`, `anyhow` (artı dil başına tree-sitter
gramerleri). Son commit 2026-08-31 (etkin bakımda).

Kurulum biçimi: **tek ikili CLI** (`ast-grep`, kısa adı `sg`). npm, cargo ve
paket yöneticileriyle kurulur; ayrıca `crates/lsp` sayesinde editör için bir dil
sunucusu olarak da çalışabiliyor. **MCP değil, eklenti değil, model yok.**

## Çözdüğü dert

"`console.log`'u regex'le arayıp yanlış yerleri yakalamaktan bıktım; kodun
yapısına göre ara, ve bulduğunu yine yapıya göre değiştir."

## Veri akışı

Dosya sistemini kendi tarar (`ignore` crate'i sayesinde `.gitignore`'a uyar), her
dosyayı tree-sitter ile ayrıştırır, deseni **AST üzerinde** eşler. Kalıcı bir
indeks tutmaz — her çalıştırma taze ayrıştırmadır; hız Rust'tan ve paralellikten
gelir, önbellekten değil.

İki kip:

- **Tek atışlık**: `ast-grep run -p '<desen>'`, isteğe bağlı `-r '<yeniden yazım>'`.
  Desen dilinde meta değişkenler (`$A`, `$$$ARGS`) kodun kendi sözdizimiyle yazılır;
  ayrı bir sorgu dili öğrenmek gerekmez.
- **Kural dosyası**: YAML. Doğrulanmış zorunlu alanlar `id`, `language`, `rule`;
  yanında `message`, `fix`, `severity` gibi alanlar (kılavuzun başvuru bölümünde
  `note`, `files`, `ignores`, `constraints`, `utils` da geçiyor — **bu ikinci küme
  doğrulanmadı**). `rule` nesnesi üç kategoriyi birleştirir:
  - atomik: `pattern`, `kind`, `regex`
  - ilişkisel: `inside`, `has` (`stopBy`, `field` ile), `precedes`, `follows`
  - bileşik: `all`, `any`, `not`, `matches`

  Temel ilke tek cümle: bir düğüm, kural nesnesindeki **bütün alanları** sağlamalı.

Kural klasörleri `sgconfig.yml` içinde `ruleDirs` ile bildirilir; `ast-grep scan`
bu kuralları depo üstünde çalıştırır, `ast-grep test` kuralların kendi testlerini
koşar. Çıktı insan için renkli, makine için `--json`.

Güncelleme zamanı: **talep üzerine**. Saklanan tek kalıcı şey kuralların kendisi
(git'te duran YAML dosyaları).

## Bağlam maliyeti

**Pasif yük: 0 token.** Kurulu olması modelin bağlamına hiçbir şey yazmaz — ne
şema, ne açıklama, ne kanca. Core'un sınıflandırmasında saf **A sınıfı**, hatta
`gh` ile aynı raftadır.

Çağrı başı yük tamamen çıktının boyudur ve **eşleşme sayısıyla** orantılıdır,
depo boyuyla değil. Tipik bir `ast-grep scan` çıktısı **tahmin 50–500 token**;
`--json` ile makine tarafında filtrelenirse daha da az. Grep'e göre asıl kazanç
token değil **yanlış pozitifin ortadan kalkmasıdır**: eşleşme sayısı düştüğü için
okunacak dosya da düşer.

Kural dosyaları git'te durur, bağlama girmez; yalnız yazılırken okunur.

## Core'daki karşılık

- **Yapısal arama Core'da yok.** `map.js` regex'le import satırı yakalar
  (`JS_IMPORT`, `JS_REQUIRE`, `PY_IMPORT`, `CS_USING`); bu, ast-grep'in yaptığı
  işin en dar ucudur ve regex olduğu için yorum içindeki, dizedeki, koşullu
  import'ları ayırt edemez.
- **Yapısal yeniden yazım da yok.** Core hiçbir yerde kodu dönüştürmez; toplu
  değişikliği model yapar. RULES.md'nin "angarya işte önce deterministik araç ara"
  maddesinin şu an karşılıksız kalan yarısı budur.
- **Core'da daha iyi olan:** kural *kapısı*. ast-grep kuralları uyarı üretir ama
  hiçbir şeyi durdurmaz; Core'un `contract.js complete` verify adımları
  çalıştırıp çıkış koduna bakar. Yani ast-grep'in eksiği tam olarak Core'un fazlası.
- `risk.js` ile akrabalık: ikisi de "desen listesi + eşleşince sebep" mantığıyla
  çalışıyor. `risk.js`'in deseni yol regex'i, ast-grep'inki AST.

## Çalınabilir fikir

1. **Kural nesnesinin üç katmanlı gramerı: atomik / ilişkisel / bileşik.**
   `risk.js` bugün düz bir regex dizisi (`HIGH_PATHS`, `IRREVERSIBLE_PATHS`,
   `IRREVERSIBLE_COMMANDS`) ve tek birleştirme kipi var: "herhangi biri eşleşirse".
   ast-grep'in gramerı bunu `all` / `any` / `not` ile bileşik hale getirir ve
   ilişkisel bir eksen ekler (`inside`: "şu klasörün altındaysa"). Somut kazanç:
   "`hooks/` altında **ve** test dosyası **değil**" gibi kural bugün yazılamıyor.
   Veri yapısı olarak alınacak olan **kuralın veri olması**, koda gömülü dizi
   olmaması.
   **Altın kuralı ihlal eder mi — hayır.** Kurallar diskte, değerlendirme kapıda.

2. **`ast-grep test`: kuralın kendi testi.** Her kuralın yanında eşleşmesi ve
   eşleşmemesi gereken örnekler durur. `risk.js`'in eşikleri (`DIFF_LIMIT=300`,
   `FILE_LIMIT=8`) ve yol regex'leri bugün örneksiz; bir regex sessizce
   genişlediğinde kimse fark etmez. Aynı desen: `test/` altında
   "şu yol high vermeli, şu yol low vermeli" tablosu.
   **Altın kuralı ihlal eder mi — hayır.**

3. **`sgconfig.yml` + `ruleDirs`: kuralın nerede yaşadığını tek dosya söyler.**
   Kuralları koda değil, adı bildirilmiş bir klasöre koymak; araç klasörü tarar.
   Core'da karşılığı, `risk.js`'in gömülü desenlerini proje köküne taşınabilir
   kılmak olur — her projenin kendi hassas yolları farklıdır ve bugün Core'unkiler
   sabittir.
   **Altın kuralı ihlal eder mi — hayır.**

4. **Meta değişkenli desen dili (`$A`, `$$$ARGS`).** Sorgu, hedef dilin kendi
   sözdizimiyle yazılır; ayrı bir dil yok. Bu bir *arayüz* fikridir ve Core'un
   sözleşme `verify` adımlarına uyar: adımlar bugün ham kabuk komutu; desen
   tabanlı bir adım biçimi ("şu desen diff'te görünmesin") komut yazmadan
   kural koymayı mümkün kılar.
   **Altın kuralı ihlal eder mi — hayır**, adımlar çalıştırma anında koşuluyor.

5. **`--json` ikinci çıktı biçimi.** Her komutun insan çıktısının yanında makine
   çıktısı olması. `map.js` bunu zaten yapıyor (`map.md` + `map.json`);
   `risk.js` ve `contract.js` için de aynı ikilik, bu betikleri modelin okumadan
   birbirine bağlamasını sağlar.
   **Altın kuralı ihlal eder mi — hayır.**

## Ret adayı gerekçe

Core **sıfır bağımlılıklı Node'dur**; ast-grep derlenmiş bir Rust ikilisidir ve
platform başına ayrı dağıtım ister. Core onu zorunlu kılarsa "sıfır bağımlılık"
iddiası düşer; isteğe bağlı kılarsa Core'un her yolunun "ast-grep varsa şöyle,
yoksa böyle" diye çatallanması gerekir — bakım maliyeti, kazandığı kesinlikten
büyük olabilir.

İkincisi, ast-grep'i **kurmak** ile ondan **fikir almak** arasındaki fark burada
en büyüktür: yukarıdaki beş fikrin dördü (kural gramerı, kural testi, kural
klasörü, ikili çıktı biçimi) ast-grep hiç kurulmadan `risk.js` ve `contract.js`
içinde uygulanabilir. Kurmayı gerektiren tek şey AST doğruluğudur ve bunun
kanıtlanmış bir ihtiyaç olarak günlüğe düşmesi gerekir —
`EKOSISTEM.md`'nin "sorun kanıtlanmadan araç alınmaz" ölçüsü.

## README cümlesi

ast-grep is a compiled binary that gives you AST-accurate search and rewriting,
which is genuinely better than regex — but Core is dependency-free Node, and the
parts of ast-grep worth having are its rule grammar and its rule tests, both of
which you can write yourself without installing anything.
