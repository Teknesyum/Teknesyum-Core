# Obsidian + Obsidian MCP

> Kanıt seviyesi: doküman

Obsidian'ın kendi dokümantasyonu, üç MCP köprüsünün README'leri ve cyanheads
köprüsünün araç tanımı kaynak dosyaları okundu. Hiçbiri kurulup çalıştırılmadı;
token sayıları kaynak dosya ölçümünden türetilmiş **tahmin**dir.

## Kimlik

Obsidian: kapalı kaynak masaüstü uygulaması. Verisi açık — bir vault, içinde düz
`.md` dosyaları olan sıradan bir klasördür. Uygulama silinse dosyalar kalır.

Üç köprü incelendi:

- `cyanheads/obsidian-mcp-server` — TypeScript, v3.5.0, 6 runtime bağımlılığı,
  son itme 2026-08-22, Apache-2.0. 14 araç. Obsidian **Local REST API** eklentisine
  bağlanır (`http://127.0.0.1:27123`), yani Obsidian açık olmalıdır.
- `MarkusPfundstein/mcp-obsidian` — Python, son itme 2026-08-31, MIT. 7 araç.
  Aynı REST eklentisine bağlanır.
- `StevenStavrakis/obsidian-mcp` — TypeScript, son itme 2026-08-27, MIT. 12 araç.
  Eklenti istemez, **doğrudan dosya sistemine** yazar; Obsidian kapalıyken de çalışır.

Kurulum biçimi: MCP sunucusu (stdio), Claude Code `mcp` yapılandırmasına eklenir.
İlk ikisi ayrıca bir Obsidian community plugin kurulumu ve bir API anahtarı ister.

## Çözdüğü dert

"Notlarım Obsidian'da; modele her seferinde kopyala-yapıştır yapmadan onları
okutmak, aratmak ve içine yazdırmak istiyorum."

## Veri akışı

**Vault formatı.** Vault = klasör. Notlar UTF-8 markdown. Bağlantı sözdizimi
`[[Not Adı]]`, `[[Not#Başlık]]`, `[[Not|görünen ad]]`. Not başında `---` ile
sınırlı YAML frontmatter (properties): `tags`, `aliases`, keyfi anahtarlar.
Etiketler ayrıca gövdede `#etiket` olarak geçebilir; hiyerarşik (`#a/b`).

**`.obsidian/` klasörü.** Vault kökünde, yalnızca *tercihler*: `app.json`,
`appearance.json`, `hotkeys.json`, `workspace.json`, `graph.json` (grafik
görünümünün **ayarları** — filtre, renk, kuvvet katsayıları), `plugins/`,
`themes/`. Burada bağlantı verisi, backlink tablosu ya da indeks **yoktur**.

**Grafik nereden geliyor.** Obsidian bir metadata cache tutar: her dosyanın
başlıkları, etiketleri, frontmatter'ı ve bağlantıları. Bu cache **IndexedDB**'de,
yani uygulamanın kendi tarayıcı depolamasında durur — vault'un içinde değil, git'e
girmez, taşınmaz. Kaynak gerçeği hep markdown dosyalarıdır; cache dosyalardan
yeniden üretilir (Ayarlar → Dosyalar ve bağlantılar → Rebuild cache). Yani graph
view ve backlink paneli **runtime'da türetilmiş** görünümlerdir, diskte duran bir
grafik dosyası değil.

**Köprünün akışı.** Model → MCP aracı → (a) Local REST API eklentisi → Obsidian
süreci → dosya, ya da (b) doğrudan dosya sistemi. cyanheads köprüsü kendi
ifadesiyle durumsuzdur: cache yok, her çağrı REST'e gider. Güncelleme "talep
üzerine"; arka planda dönen bir indeks yok.

**cyanheads araç seti (14).**

| Araç | Ne yapar |
|---|---|
| `obsidian_get_note` | Notu getirir: ham içerik, yapılandırılmış (içerik + frontmatter + etiket + stat, `includeLinks` ile giden bağlantılar), belge haritası (başlık iskeleti) veya tek bölüm |
| `obsidian_list_notes` | Bir yol altındaki not ve klasörleri listeler; `recursive`, `depth` (varsayılan 2, en fazla 20), 1000 kayıt tavanı, uzantı ve `nameRegex` süzgeci |
| `obsidian_list_tags` | Vault'taki tüm etiketleri kullanım sayılarıyla, hiyerarşik ebeveynleriyle listeler |
| `obsidian_search_notes` | Arama: düz metin, JSONLogic ifadesi, veya Omnisearch eklentisi varsa BM25 sıralı. `contextLength`, `pathPrefix`, imleçli sayfalama |
| `obsidian_write_note` | Dosya veya bölüm oluşturur/değiştirir (`overwrite`) |
| `obsidian_append_to_note` | Dosyanın veya belirli bir bölümün sonuna ekler |
| `obsidian_patch_note` | Başlık, blok referansı veya frontmatter hedefli cerrahi ekleme/öne ekleme/değiştirme |
| `obsidian_replace_in_note` | Not içinde ara-değiştir; toplu `replacements[]`, regex, kapsam, harf duyarlılığı |
| `obsidian_manage_frontmatter` | Tek YAML anahtarında atomik get/set/delete |
| `obsidian_manage_tags` | Etiket ekle/çıkar/listele; frontmatter veya satır içi |
| `obsidian_delete_note` | Dosyayı kalıcı siler (onay ister) |
| `obsidian_open_in_ui` | Notu Obsidian arayüzünde açar |
| `obsidian_list_commands` | Komut paletindeki komutları listeler (opt-in) |
| `obsidian_execute_command` | Komut paleti komutunu ID ile çalıştırır (opt-in) |

**MarkusPfundstein araç seti (7):** `list_files_in_vault`, `list_files_in_dir`,
`get_file_contents`, `batch_get_file_contents`, `search` / `complex_search`,
`patch_content`, `append_content`, `delete_file`, artı periyodik not araçları
(`get_periodic_note`, `get_recent_periodic_notes`).

**Modele görünen kısım.** Dosya adları, klasör ağacı, not gövdesi, frontmatter,
etiketler ve arama isabetleri. Bu kadar.

Grafik görünümü modele **ulaşmıyor**. Hiçbir köprüde `get_backlinks`,
`get_graph`, `neighbors` gibi bir araç yok. `includeLinks` yalnız **giden**
bağlantıları verir ve onu da notun metnindeki `[[...]]`'lardan çıkarır. Ters yön
(backlink) ancak arama aracına regex vererek taklit edilir — cyanheads dokümanı
bunu açıkça JSONLogic örneğiyle önerir: `[[Hedef Not]]` desenini içerikte arat.
Yani model, Obsidian'ın hesapladığı grafiği okumaz; grep sonucundan kendi
kurar. IndexedDB'deki cache MCP yüzeyinde hiç yoktur.

## Bağlam maliyeti

**Pasif (her turda, araç şemaları).** cyanheads'in 14 aracının tanım dosyaları
toplam ~145 KB TypeScript. Ölçülen dört dosyada `.describe()` metinleri + zod
alan adları kaynak boyutunun %17–%28'i (write-note %76 ile aykırı). Bu oranla
şemaya giden metin ~36 KB ≈ **8.000–12.000 token** — **tahmin**. Bu her sıradan
turda, hiç kullanılmasa da bağlamdadır.

MarkusPfundstein'ın 7 aracı çok daha kısa açıklamalı: ~**1.200–2.000 token**
(**tahmin**). StevenStavrakis'in 12 aracı arası bir yerde, ~**3.000–5.000**
(**tahmin**).

**Çağrı başı.**

- `obsidian_list_notes`, 200 dosyalık bir vault, düz liste: ~**1.600–2.500 token**
  (dosya başı ~8 token yol + JSON sarmalayıcı) — **tahmin**.
- Aynı araç 1000 kayıt tavanında: ~**10.000–15.000 token** — **tahmin**.
- `obsidian_get_note` raw: notun kendi boyutu. 400 kelimelik not ≈ **550 token**.
  `full` biçimi frontmatter + stat + etiket sarmalayıcısıyla ~**%20 fazlası**.
- `obsidian_search_notes`, `contextLength: 100`, 20 isabet: ~**700–1.000 token**.
- `obsidian_list_tags`, 300 etiket: ~**900 token** — **tahmin**.

Yani tipik bir "notlarımda X'i bul ve oku" turu: 8–12k pasif + ~1k arama +
~600 okuma ≈ **10–14k token**, bunun %80'i hiç kullanılmayan şema.

## Core'daki karşılık

`map.js` ile aynı ailedendir: ikisi de regex'le dosyalardan bir bağlantı grafiği
çıkarır. Fark yönde — `map.js` `import`/`require` tarar, Obsidian `[[wiki-link]]`.
Fark yerde — `map.js` sonucu `.claude/relay/map.md`'ye **diske** yazar ve model
istediğinde okur; Obsidian sonucu IndexedDB'de tutar ve modele hiç vermez.

Core'da hiç olmayan kısım: **ters bağlantı tablosu**. `map.js` "A neyi import
ediyor"u verir; "A'yı kim import ediyor"u vermez. Obsidian'ın backlink paneli tam
olarak bu tablodur ve Obsidian bunu tek geçişte, çıkan bağlantıları ters
çevirerek üretir.

Core'da daha iyi olan: maliyet modeli. Core'un hiçbir organı sıradan turda şema
taşımaz; `map.md` yalnız okunduğunda ödenir. MCP köprüsünde 8–12k token, araç
kullanılmayan turlarda da bağlamdadır.

Sözleşme kapısı, `risk.js` ve `audits/ledger.jsonl`'ın Obsidian tarafında
karşılığı yok — köprüler yazma araçlarını (`delete_note`, `write_note`) onay
metniyle korur, kayıt tutmaz.

## Çalınabilir fikir

1. **Ters bağlantı tablosunu tek geçişte üret.** İleri bağlantıları toplarken
   `backlinks[hedef].push(kaynak)` biriktir; ikinci tarama yapma. `map.js`
   zaten tüm dosyaları bir kez geziyor, ters tablo bedavaya gelir.
   Altın kuralı ihlal eder mi — **hayır** (üretim betikte, çıktı diskte).

2. **Kaynak gerçeği dosyada, indeks atılabilir tutmak.** Obsidian cache'i
   vault'un dışında tutar ve bozulunca "rebuild" der; hiçbir karar cache'e
   bağlı değildir. `map.md` için aynı sözleşme: silinebilir, yeniden üretilebilir,
   git'e girmesi zorunlu değil.
   Altın kuralı ihlal eder mi — **hayır**.

3. **Frontmatter'ı ayrı bir düzlem olarak ele almak.** Obsidian `---` bloğunu
   gövdeden ayırıp yalnız o düzlemde atomik get/set/delete yapar
   (`obsidian_manage_frontmatter`). Core'un rapor ve görev paketleri için aynı
   ayrım: makinenin okuduğu alanlar başta YAML'de, nesir aşağıda; betik yalnız
   başlığı ayrıştırır, gövdeyi hiç okumaz.
   Altın kuralı ihlal eder mi — **hayır**.

4. **Kademeli getirme biçimleri.** `obsidian_get_note`'un `format` parametresi
   aynı notu dört ayrı ağırlıkta verir: ham, yapılandırılmış, **belge haritası**
   (yalnız başlık iskeleti), tek bölüm. Belge haritası fikri Core'a doğrudan
   uyar: uzun bir dokümanı okumadan önce başlık iskeletini üret, model hangi
   bölümü isteyeceğine ona bakarak karar versin.
   Altın kuralı ihlal eder mi — **hayır**.

5. **Kayıt tavanı + imleçli sayfalama.** `list_notes` 1000 kayıtta,
   `depth` 2'de durur; `search_notes` `cursor` döndürür. Sınırsız çıktı yerine
   tavan + devam anahtarı, bağlam patlamasını araç seviyesinde engeller.
   Altın kuralı ihlal eder mi — **hayır**.

6. **Yazma araçlarını cerrahi tutmak.** `patch_note` hedefi başlık, blok
   referansı veya frontmatter anahtarıdır — satır numarası değil. Konum yerine
   **isimle** hedefleme, dosya değişince bozulmaz.
   Altın kuralı ihlal eder mi — **hayır**.

## Ret adayı gerekçe

- Pasif maliyet altın kuralla doğrudan çelişir: 14 araçlık şema, aracın hiç
  çağrılmadığı turlarda da ~8–12k token (**tahmin**) taşır.
- Core saf Node ve sıfır bağımlılıktır; olgun köprü 6 npm bağımlılığı, ayrıca
  bir Obsidian community plugin ve bir API anahtarı ister.
- İki köprü Obsidian'ın **açık olmasını** şart koşar — betiklerin çalışması
  bir masaüstü uygulamasının durumuna bağlanır.
- Getirdiği asıl değer (grafik, backlink) MCP yüzeyine hiç çıkmıyor; modele
  ulaşan şey dosya listeleme, okuma, arama ve yazmadan ibaret.
- Aynı yüzeyin büyük kısmı `rg` + `cat` ile zaten mevcut ve pasif maliyeti sıfır:
  Bash aracı bağlamda hazır durur, ek şema taşımaz.
- Vault kilidi yok ama kurulum kilidi var: notların değeri markdown'da, köprünün
  değeri erişimde — erişim zaten var.

**Sayısal karşılaştırma — aynı iş, iki yol.**

| İş | MCP köprüsü | `rg` |
|---|---|---|
| Pasif, her tur | 8–12k token (**tahmin**) | 0 |
| "X geçen notları bul" | `search_notes` ~700–1.000 token | `rg -l "X" vault/` → 12 yol ≈ **100 token** |
| "X'e backlink verenler" | `search_notes` + JSONLogic regex ~800 token | `rg -l "\[\[X(\||#|\])" vault/` ≈ **100 token** |
| Not okuma | `get_note` ≈ boyut + %20 | `cat` ≈ boyut |
| Dosya ağacı | `list_notes` ~1.600–2.500 token | `rg --files vault/` ≈ aynı, ~1.600 |
| Etiket sayımı | `list_tags` ~900 token | `rg -o "#[\w/]+" -N --no-filename vault/ \| sort \| uniq -c` ≈ **aynı** |

Çağrı başı maliyetler benzer büyüklükte; ayrımı yaratan pasif yük. 8–12k token
pasif yük, çağrı başı ~800 token'lık aramaların **10–15 tanesine** eşittir — yani
köprü, turda ondan fazla vault sorgusu yapılmadıkça `rg`'den pahalıdır.

Karşı tarafta `rg`'nin vermediği iki şey var: Obsidian açıkken dosyaya yazmanın
uygulamayla çakışmaması, ve Omnisearch'ün BM25 sıralaması (`rg` alaka sırası
bilmez, satır sırası bilir).

## README cümlesi

An Obsidian vault is already a plain folder of markdown files, so `rg` reads it
for zero passive tokens — and the link graph the bridge would justify itself with
never crosses the MCP boundary anyway.
