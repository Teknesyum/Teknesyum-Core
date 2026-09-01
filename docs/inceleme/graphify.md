# graphify

> Kanıt seviyesi: çalıştırıldı

SKILL.md (42,3 KB) ve sekiz `references/*.md` dosyası tümüyle okundu; kurulu Python paketi
(`graphifyy` 0.9.39, 41.224 satır) kaynak düzeyinde incelendi; Core'un kendi `core/`
ağacının kopyası üzerinde `graphify update .` ve `graphify query` çalıştırılıp üretilen
`graph.json` şeması ölçüldü.

## Kimlik

`Graphify-Labs/graphify`, PyPI'de `graphifyy` 0.9.39, Apache-2.0. Python ≥3.10.
Kurulum burada `uv tool install` ile; `graphify` ve `graphify-mcp` iki giriş noktası.

Bağımlılıklar: `networkx`, `numpy`, `rapidfuzz` ve **22 ayrı tree-sitter dil grameri**
(python, js, ts, go, rust, java, c, cpp, ruby, c-sharp, kotlin, scala, php, swift, lua,
zig, powershell, elixir, objc, julia, verilog, groovy). İsteğe bağlı: `graspologic`
(Leiden), `gemini` ekstrası, Whisper.

İki kurulum biçimi aynı anda: **skill** (`SKILL.md` + `references/`, 109 KB, ajan okur)
ve **CLI** (Python paketi, ajan çağırır). Paket kendi skill metnini 15 farklı ajan
platformu için ayrı ayrı taşıyor (`skill-codex.md`, `skill-aider.md`, ...) — `graphify
install --platform claude` bunu ilgili config dizinine kopyalar.

## Çözdüğü dert

"Bu yabancı kod tabanında ne neye bağlı, hangi parçalar bir küme oluşturuyor — dosyaları
tek tek açmadan sor."

## Veri akışı

Boru hattı dokuz adım. Kaynak: disk (kod, md, pdf, görüntü, video), GitHub URL'i
(`graphify clone`), `graphify add <url>` ile indirilen sayfa. Çıktı `graphify-out/`
altında kalıcıdır: `graph.json`, `graph.html`, `GRAPH_REPORT.md`, `manifest.json`,
`cache/`, `cost.json`.

### Deterministik / model ayrımı — adım adım

| # | Adım | Ne yapıyor | Model çağırır mı |
|---|---|---|---|
| 0 | `clone` / merge | git clone, çok depo birleştirme | hayır |
| 1 | yorumlayıcı bulma | uv → pipx → aktif venv sırayla dener, yolu `.graphify_python`'a yazar | hayır |
| 2 | `detect()` | dosya tarama + tür sınıflama (code/document/paper/image/video), kelime sayımı, hassas dosya eleme | hayır |
| 2 | daraltma kararı | >500 dosya veya >2M kelimede ilk seviye alt klasörleri sayıp kullanıcıya sorma | ajan sorar, çıkarım yok |
| 2.5 | `transcribe` | Whisper ile ses/video → metin | hayır (yerel ASR) |
| **3A** | **AST çıkarımı** | tree-sitter ile düğüm + kenar; `extract.py` 6.617 satır, dile özel çözümleyiciler (`symbol_resolution`, `ruby_resolution`, `pascal_resolution`, `scip_ingest`) | **hayır — 0 token** |
| 3B0 | önbellek yoklaması | `check_semantic_cache`, dosya içeriği + **çıkarım istemi dosyasının kendisi** üzerinden anahtarlama | hayır |
| **3B** | **semantik çıkarım** | 20-25 dosyalık öbekler halinde alt ajanlara dağıtım (ya da `GEMINI_API_KEY` varsa Gemini) | **evet — yalnız doc/paper/image için** |
| 3C | birleştirme | AST düğümleri önce, semantik düğümler id ile tekilleştirilerek | hayır |
| 4 | `build_from_json` + `cluster` + `analyze` + `report` + `to_json` | NetworkX grafiği, Leiden/Louvain, god node, cohesion, rapor | hayır |
| 4.5 | `diagnose_extraction` | sarkan/eksik uç, kendine-döngü, çöken kenar sayımı; salt okunur, asla durdurmaz | hayır |
| 5 | topluluk adlandırma | SKILL akışında ajan 2-5 kelimelik ad yazar | **evet — ama deterministik yedeği var** |
| 6 | `export html` / `obsidian` / `wiki` / `svg` / `graphml` / `neo4j` | biçim dönüşümü | hayır |
| 9 | `save_manifest` + `cost.json` | mtime + hash damgası, kümülatif token defteri | hayır |
| — | `query` / `path` / `explain` / `affected` | graph.json üzerinde BFS/DFS, en kısa yol, ters geçiş | traversal hayır; **cevabı cümleye çeviren ajan evet** |

**Ölçüm:** Core'un `core/` ağacı (33 dosya, ~29.421 kelime) üzerinde `graphify update .`
**3,17 saniyede** bitti ve **485 düğüm / 1142 kenar / 25 topluluk** üretti. Raporun kendi
satırı: `Token cost: 0 input · 0 output`. Kod-yalnız bir gövdede model hiç devreye
girmiyor — Adım 3B tümüyle atlanıyor, Adım 5'in yerini `label_communities_by_hub`
alıyor (topluluğu en yüksek dereceli üyesinin adıyla anıyor; eşitlikte id'ye göre
kırılıyor, yani tekrarlanabilir). Üretilen topluluk adları gerçekten böyleydi:
`contract.js`, `statusline.js`, `Role: auditor`, `Relay`.

Yani ALTIN KURAL açısından kritik olan cümle şu: **graphify'ın pahalı olduğu yer kod
değil, düzyazıdır.** `docs/GRAPHIFY.md`'deki "semantik katman dosya başına model çağrısı"
ifadesi doğru ama eksik — o katman yalnız `document`, `paper`, `image` türlerinde
tetikleniyor, `code` türünde hiç açılmıyor.

### Grafik şeması (`graph.json`, ölçülmüş)

NetworkX `node_link_data` biçimi. Üst düzey anahtarlar:
`directed`, `multigraph`, `graph`, `nodes`, `links`, `hyperedges`, `built_at_commit`.

Varsayılan `directed: false`, `multigraph: false` — yön `--directed` ile açılır; kapalıyken
gerçek uçlar kenarda `_src`/`_tgt` olarak saklanır ve dışa aktarımda geri konur.

**Düğüm alanları** (485/485 dolu): `id`, `label`, `file_type`, `source_file`,
`source_location`, `_origin`, `community`, `community_name`, `norm_label`; çağrılabilir
düğümlerde ayrıca `_callable` (305/485).

```json
{"label":"logCue()","file_type":"code","source_file":"core/hooks/cue.js",
 "source_location":"L32","_callable":true,"_origin":"ast",
 "id":"core_hooks_cue_logcue","community":14,"community_name":"cue.js",
 "norm_label":"logcue()"}
```

`file_type` kapalı bir kümedir, `validate.py` altı değeri kabul eder:
`code`, `document`, `paper`, `image`, `rationale`, `concept`. Ayrı bir "düğüm tipi" alanı
yok — tip bilgisi `file_type` + `_callable` + `_origin` üçlüsüne dağılmış. `_origin`
düğümün AST'den mi model çıkarımından mı geldiğini söyler; ölçtüğüm koşuda 485/485 `ast`.

Düğüm id'si içerik-bağımsız ve deterministik: depo-göreli yolun uzantısız hâli +
sembol adı, hepsi `[a-z0-9_]`'e indirgenip `_` ile birleştirilir
(`src/auth/session.py` + `ValidateToken` → `src_auth_session_validatetoken`). Bu kural
SKILL'in semantik istemine de kelimesi kelimesine yazılmış — AST ile modelin **aynı
sembol için aynı id'yi** üretmesi bu sayede sağlanıyor; tutmazsa hayalet ikizler oluşuyor.

**Kenar alanları** (1142/1142): `source`, `target`, `relation`, `confidence`,
`confidence_score`, `source_file`, `source_location`, `weight`, `_origin`; 809'unda
ayrıca `context`.

Ölçülen ilişki dağılımı — hepsi AST kaynaklı:

| relation | adet | güven |
|---|---|---|
| `calls` | 565 | EXTRACTED |
| `contains` | 333 | EXTRACTED |
| `indirect_call` | 140 | INFERRED (0,5) |
| `imports` | 81 | EXTRACTED |
| `imports_from` | 23 | EXTRACTED |

Güven üç kademeli ve sayıya çevriliyor: `EXTRACTED 1.0`, `INFERRED 0.5`, `AMBIGUOUS 0.2`.
Modelin ürettiği kenarlarda bu skor sürekli bir aralık değil, **ayrık bir cetvel**:
0,95 / 0,85 / 0,75 / 0,65 / 0,55 — istemde bunun gerekçesi de yazılı, sürekli aralık
verildiğinde üretimde dağılımın %50'si 0,5'e %40'ı 0,85 üstüne çöküyormuş.

AST tarafının tanıdığı ilişki sözlüğü (`SEMANTIC_RELATIONS` + `DEFAULT_AFFECTED_RELATIONS`):
`imports`, `imports_from`, `re_exports`, `dynamic_import`, `calls`, `indirect_call`,
`contains`, `method`, `references`, `inherits`, `extends`, `implements`, `mixes_in`,
`embeds`, `uses`. Model tarafının ek olarak üretebildikleri: `conceptually_related_to`,
`shares_data_with`, `semantically_similar_to`, `rationale_for`, `cites`.

`hyperedges` ayrı bir üst düzey dizidir — üç ve daha fazla düğümü tek bir akışa bağlar
(`participate_in` / `implement` / `form`). Yalnız model üretir, öbek başına en fazla 3.

### Topluluk kümeleme

`cluster.py`. Önce `graspologic.partition.leiden`, `random_seed=42`, `trials=1`,
`resolution` ayarlanabilir. `graspologic` kurulu değilse **NetworkX'in yerleşik
`louvain_communities`**'ine düşer (`seed=42`, `threshold=1e-4`, `max_level=10`).

Girdi grafiği kümelemeden önce **yeniden kurulur**: düğümler `str`'e göre, kenarlar
`(kaynak, hedef, sıralı-json(nitelikler))` üçlüsüne göre sıralanarak yeni bir `nx.Graph`'a
konur. Amaç açık — dosya sistemi sırasının sonuca sızmasını engelleyip koşular arası
tekrarlanabilirlik sağlamak.

Kümeleme sonrası iki düzeltme var: grafiğin **%25'inden büyük** topluluklar (en az 10
düğümse) bölünüyor; **cohesion < 0,05** olan topluluklar (en az 50 düğümse) yeniden
bölünüyor. Cohesion tanımı yalın: topluluk içi gerçek kenar / mümkün kenar
(`n(n-1)/2`) — yani alt grafiğin yoğunluğu.

`remap_communities_to_previous` topluluk kimliklerini bir önceki atamayla kesişim
büyüklüğüne göre açgözlü eşleştiriyor; bu olmasa her yeniden kümelemede numaralar
kayardı ve etiketler yanlış topluluğa yapışırdı. `community_member_sigs` her topluluğun
üye listesinin sha256'sını tutuyor — sonraki `cluster-only`, hangi topluluğun gerçekten
değiştiğini bu parmak izinden anlıyor ve yalnız onu yeniden adlandırıyor.

`god_nodes` sade derece sıralaması, ama dosya düğümlerini, kavram düğümlerini, JSON
anahtarlarını ve dil yerleşiklerini eliyor. `surprising_connections` çok dosyalı
gövdede dosya-aşırı kenarları AMBIGUOUS → INFERRED → EXTRACTED sırasıyla veriyor; tek
kaynaklı gövdede **kenar arası betweenness centrality**'ye geçiyor.

### `--update` artımlı güncelleme

`manifest.json` dosya başına üç alan tutuyor (ölçülmüş):

```json
"core/hooks/cue.js": {"mtime": 1788291415.868,
                      "ast_hash": "7ae1b4f6720f02bfcfb90344b6e3c70c",
                      "semantic_hash": ""}
```

**İki ayrı bayatlama ekseni.** `ast_hash` yapısal katman için, `semantic_hash` model
katmanı için. Bir dosya AST açısından taze olup semantik açıdan bayat olabilir — kod-yalnız
koşuda `semantic_hash` bilerek boş bırakılıyor. Manifest anahtarları **tarama köküne
göreli** tutuluyor; mutlak yol yazılsaydı depo klonlanınca her dosya "değişmiş" görünürdü.

`detect_incremental` mtime + hash karşılaştırıp `new_files` (değişen alt küme) ve
`deleted_files` üretiyor. Akış sonra ikiye ayrılıyor: değişen dosyaların **hepsi kod
uzantılıysa** `code_only: True` yazdırılıp Adım 3B tümüyle atlanıyor — hiç alt ajan
dağıtılmıyor. Aksi hâlde tam boru hattı.

Birleştirme `build_merge` ile doğrudan `graph.json` üzerinden, NetworkX gidiş-dönüşü
olmadan yapılıyor (yön korunsun diye). İki farklı temizlik var ve karıştırılmamaları
kodda ayrıca uyarılmış: **silinen** dosyalar `prune_sources` ile düşürülüyor;
**değişen** dosyalar ise "yeniden çıkarımda değiştir" kuralıyla, yani yeni öbeklerdeki
her `source_file` birleştirmeden önce tabandan atılarak.

Damgalamada dikkate değer bir incelik var: bir dosya ancak **gerçekten çıktı ürettiyse**
manifest'e damgalanıyor. Öbeği başarısız olan belge damgasız kalıyor ki sonraki
`--update` onu yeniden kuyruğa alsın; damgalansaydı "yapıldı" sayılıp içeriği kalıcı
olarak kaybolurdu. Bu koşuda dağıtılıp damgalanmayan dosyaların eski `semantic_hash`'i
de ayrıca siliniyor — yoksa taşınmış damga onları "değişmemiş" gösterirdi.

Üstüne iki koruma daha: `to_json` yeni grafik mevcut `graph.json`'dan **daha az düğüm**
içeriyorsa yazmayı reddediyor (mevcut dosya okunamıyorsa da reddediyor — güvenli tarafa
düşüyor), ve yazma `write_json_atomic` ile yapılıyor.

## Bağlam maliyeti

**Pasif (sıradan tur): 0 token.** Kanca yok, MCP sunucusu varsayılan değil. Tek kalıcı
yük, skill listesinde duran açıklama satırı — **tahmin ~70 token**. Bu açıklama üstelik
kendi kendini kapatacak biçimde yazılmış: "`graphify-out/` yoksa ve kullanıcı istemediyse
bu skill'i açma".

Skill açıldığında:

| Yüklenen | Boyut | Token (tahmin, 4 kr/token) |
|---|---|---|
| `SKILL.md` | 42,3 KB | ~10.600 |
| `references/extraction-spec.md` (yalnız doc/paper/image varsa) | 8,0 KB | ~2.000 |
| `references/query.md` (yalnız query akışında) | 13,5 KB | ~3.400 |
| `references/update.md` (yalnız `--update`) | 10,4 KB | ~2.600 |
| diğer beş referans | 12,4 KB | ~3.100 |

Çağrı başı — **ölçülmüş, tahmin değil**:

| İşlem | Çıktı | Token |
|---|---|---|
| `graphify update .` (33 dosya, kod-yalnız) | 5 satır | ~60, model çağrısı 0 |
| `graphify query "..."` | 6.432 karakter | **~1.600** (varsayılan `--budget 2000`) |
| `GRAPH_REPORT.md` okumak | 6,6 KB | ~1.650 |
| `graph.json` okumak | **546 KB** | ~136.000 — bağlama hiç girmez, girmemeli |
| `graph.html` | 426 KB | ekran, bağlam değil |

Semantik katman ölçülemedi (kod-yalnız gövdede tetiklenmiyor). SKILL'in kendi tahmin
formülü: `ceil(dosya/22)` alt ajan, öbek başına ~45 s. Her alt ajan 20-25 belgeyi tam
okuyor — **tahmin**: 20 belge × ~2.000 token = öbek başına ~40.000 girdi token.

Buradaki asıl mimari karar şu: 546 KB'lik grafik hiçbir zaman bağlama girmiyor, CLI onu
sorguluyor ve **çıktı bir token bütçesiyle kırpılıyor**. Bütçe aşıldığında sessizce
kesmiyor — `[!] TRUNCATED: showing 28 of 28 nodes (~2000-token budget)` diye kaç düğümün
kesildiğini ve bütçenin nasıl büyütüleceğini yazıyor.

## Core'daki karşılık

Karşılık `map.js` (278 satır). Aynı kaynak ağaç üzerinde iki araç:

| | `map.js` | `graphify update` |
|---|---|---|
| ölçüm | 133 dosya · 112 kenar · 0 döngü · 57 öksüz | 485 düğüm · 1142 kenar · 25 topluluk |
| süre | anlık | 3,17 sn |
| model | 0 | 0 (kod-yalnız gövdede) |
| ayrım gücü | **dosya** | **sembol** (fonksiyon, sınıf, sabit) + dosya + md başlığı |
| ayrıştırma | 5 regex (`JS_IMPORT`, `JS_REQUIRE`, `PY_IMPORT`, `CS_USING`, `CS_NS`) | 22 tree-sitter grameri |
| diller | 8 uzantı (js/jsx/mjs/cjs/ts/tsx/py/cs) | 22 dil |
| çıktı | `map.md` 10 KB + `map.json` 30 KB | `graph.json` 546 KB + html + rapor |
| bağımlılık | **sıfır** | networkx + numpy + rapidfuzz + 22 gramer |
| kurulum | Node, zaten var | ayrı Python araç zinciri |

`map.js`'in graphify'da karşılığı olmayan yanı: **`git` damgalı bayatlama.** `map.json`
içine `_map.head` olarak HEAD yazılıyor, `who` çağrıldığında `git rev-list --count
at..HEAD` ile kaç commit geride kalındığı hesaplanıp ekrana basılıyor. graphify'ın
`built_at_commit` alanı var ama "kaç commit bayat" ölçüsü yok; onun bayatlaması dosya
başına mtime + hash. İki yaklaşım farklı sorulara cevap veriyor: `map.js` "harita bir
bütün olarak ne kadar eski", graphify "hangi dosyayı yeniden işlemem gerekiyor".

`map.js`'in ikinci üstünlüğü `who` altkomutu: tek dosyanın gelen/giden kenarlarını
~10 satırda basıyor — **tahmin ~60 token**. Bu, graphify'ın `--budget` fikrinin
sertleştirilmiş hâlidir; bütçe ayarlanabilir değil, sabit ve küçük.

Core'da hiç olmayanlar: sembol düzeyi ayrım, `calls` kenarı, topluluk kümeleme,
cohesion ölçüsü, güven kademesi, artımlı manifest, sağlık teşhisi, küçülme koruması.

`map.js`'te olan ve graphify'ın raporunda tam karşılığı olmayan: **öksüz dosya listesi**
(Core'un ölçümünde 57 tane) ve **dış paket sözlüğü** (`ext` alanı).

### İlişki tipleri — kenar kenara

| graphify ilişkisi | modelsiz elde edilebilir mi | ne gerekir | `map.js`'te |
|---|---|---|---|
| `imports` | evet | regex yeter | **var** (`to`) |
| `imports_from` | evet | regex yeter | var (`to` içinde erir) |
| `contains` (dosya → sembol) | evet | AST ya da sağlam regex | yok |
| `re_exports` | evet | AST (regex `export * from`'da yanılır) | yok |
| `dynamic_import` | evet | AST; `import()` regex'i yanlış pozitif verir | kısmen (`JS_REQUIRE`) |
| `calls` | evet | AST + kapsam çözümü — regex burada çöker | yok |
| `method` | evet | AST | yok |
| `inherits` / `extends` / `implements` | evet | AST | yok |
| `references` (tip imzaları) | evet | AST + gürültü elemesi | yok |
| `indirect_call` | evet, ama sezgisel | AST + isim eşleme; INFERRED işaretlenmeli | yok |
| `uses` / `mixes_in` / `embeds` | evet | dile özel AST | yok |
| `cites` | kısmen | belge içi atıf regex'i kırılgan | yok |
| `conceptually_related_to` | **hayır** | anlam | yok |
| `shares_data_with` | **hayır** | anlam | yok |
| `semantically_similar_to` | **hayır** | anlam | yok |
| `rationale_for` (bir kararın *niçin*i) | **hayır** | anlam | yok |
| hyperedge (3+ düğümlü akış) | **hayır** | anlam | yok |

Tablonun okunuşu: graphify'ın **kod üzerinde** ürettiği her ilişki tipi modelsiz elde
edilebilir — Core'un ölçülen koşusunda 1142 kenarın 1142'si zaten `_origin: ast` idi.
Model yalnız düzyazının, kararların ve görüntülerin anlamına dokunduğunda gerekiyor.
Aradaki eşik regex ile AST arasında: `imports` regex ile alınır, `calls` alınmaz.

## Çalınabilir fikir

**1 — Çıktıya token bütçesi ve dürüst kırpma.**
`query` çıktısı sabit bir bütçeye göre kesiliyor ve kesildiğinde kaç düğümün elendiğini,
bütçenin nasıl büyütüleceğini yazıyor. `map.js who` bugün doğal olarak kısa; ama
`map.md` bir bütün olarak okunuyor (10 KB, ~2.550 token). Aynı sözleşme `map.js`'e
konabilir: bir eşik, aşıldığında "N kenardan M'i gösteriliyor" satırı.
**Altın kuralı ihlal eder mi — hayır.** Talep üzerine çalışan bir çıktının biçimi.

**2 — İki eksenli bayatlama damgası.**
graphify dosya başına `ast_hash` **ve** `semantic_hash` tutuyor; biri taze olup diğeri
bayat olabiliyor. Core'un `staleness()` fonksiyonu tek eksenli — HEAD eşit mi, değil mi.
Sözleşme defterine uyarlanabilir hâli: bir dosyanın *yapısal* durumu ile *denetlenmiş*
durumu ayrı damgalar. Yapısı değişmemiş bir dosya için eski denetim geçerli sayılır,
değişmişse denetim düşer.
**Altın kuralı ihlal eder mi — hayır.** Diskteki bir alan; okunması istendiğinde okunur.

**3 — "Ancak çıktı ürettiyse damgala" kuralı.**
Başarısız öbek manifest'e yazılmıyor ki sonraki koşu onu yeniden kuyruğa alsın;
üstüne, dağıtılıp damgalanmayan dosyaların eski damgası da siliniyor. Bu tam olarak
`contract.js complete`'in kapı mantığının tersten ifadesi: **iş yarım kaldıysa "yapıldı"
işareti konmaz, ve eski "yapıldı" işareti de kaldırılır.** İkinci yarısı Core'un
denetim defterinde açıkça yok.
**Altın kuralı ihlal eder mi — hayır.** Kapı davranışı, bağlam yazımı değil.

**4 — Küçülme koruması (`to_json` #479).**
Yeni grafik eskisinden az düğüm içeriyorsa yazma reddediliyor; mevcut dosya *okunamıyorsa*
da reddediliyor — belirsizlikte güvenli tarafa düşülüyor. `map.js` bugün `map.json`'ı
koşulsuz eziyor. Yarım bir tarama (izin hatası, kilitli dosya) iyi bir haritayı sessizce
küçültebilir.
**Altın kuralı ihlal eder mi — hayır.** Yazma kapısı.

**5 — Deterministik topluluk adlandırma (`label_communities_by_hub`).**
Bir kümeyi **en yüksek dereceli üyesinin adıyla** anmak, eşitliği id'ye göre kırmak.
Model çağrısı gerektirmiyor ve okunabilir çıkıyor — Core üzerinde ürettiği adlar
`contract.js`, `statusline.js`, `Role: auditor` oldu. `map.js` bugün hub'ları listeliyor
ama **adlandırmıyor**; aynı sıralamadan bedava bir küme adı üretilebilir.
**Altın kuralı ihlal eder mi — hayır.** Saf derece hesabı.

**6 — Kimlik kuralının tek yerde tanımlanması.**
Düğüm id'si (`yol_uzantısız + sembol`, `[a-z0-9_]`) hem AST çıkarıcısında hem modele
verilen istemde **kelimesi kelimesine aynı** yazılmış; tutmazsa hayalet ikizler oluşuyor.
Core'da bunun karşılığı sözleşme kimliği: hem `contract.js` hem relay skill hem denetim
defteri aynı id'yi üretmeli.
**Altın kuralı ihlal eder mi — hayır.**

**7 — Salt okunur bütünlük kapısı (Adım 4.5).**
`diagnose_extraction` sarkan uç, eksik uç, kendine-döngü ve çöken kenar sayıyor;
**asla durdurmuyor**, yalnız görünür kılıyor. Core'da `doctor.js`'in yaptığına yakın
ama `map.js` için yok: çözülemeyen import, kendine-import, `map.json`'da olup diskte
olmayan dosya sayısı tek satırda basılabilir.
**Altın kuralı ihlal eder mi — hayır.** Ekrana yazar.

**8 — Ayrık güven cetveli.**
Modelden 0-1 arası sürekli bir skor istemek yerine beş değerden birini seçtirmek
(0,95 / 0,85 / 0,75 / 0,65 / 0,55) ve hiçbiri uymuyorsa AMBIGUOUS işaretletmek.
Gerekçe istemde ölçümle yazılı: sürekli aralık verildiğinde dağılım iki uca çöküyor.
`risk.js` riski diff'ten sayıyla hesaplıyor; modelin öz-değerlendirme verdiği her yerde
(denetim kaydındaki `--verification`) bu desen geçerli.
**Altın kuralı ihlal eder mi — hayır.**

**9 — Kümeleme öncesi grafiği kanonik sıraya sokmak.**
Düğümleri `str`'e, kenarları `(kaynak, hedef, sıralı-json)` üçlüsüne göre sıralayıp yeni
bir grafiğe koymak — dosya sistemi sırasının sonuca sızmasını engelliyor. `map.js` `scan()`
sonunda `sort()` yapıyor, yani yarısı zaten var; kenar sırası için karşılığı yok.
**Altın kuralı ihlal eder mi — hayır.**

**10 — Kümülatif maliyet defteri (`cost.json`).**
Her koşunun tarihi, girdi/çıktı token'ı ve dosya sayısı biriktiriliyor; rapor
"bu koşu / tüm zamanlar" diye iki satır basıyor. Core'un `COST-MODEL.md`'si bir belge;
bu onun ölçülen hâli. Denetim defterine sözleşme başına gerçekleşen maliyet eklenebilir.
**Altın kuralı ihlal eder mi — hayır**, defter diskte durduğu ve statusline'a düştüğü
sürece; rapor sıradan turda bağlama yazılırsa **evet**.

## Ret adayı gerekçe

Core saf Node ve sıfır bağımlılık. graphify Python ≥3.10 ve 22 tree-sitter grameri
getiriyor; gömmek Core'un kurulumunu bir Python araç zincirine bağlar ve "eklenti bedava"
cümlesini geçersiz kılar.

Sürüm eksenleri bağımsız ilerliyor (graphify 0.9.39, Core 0.7.x) ve graphify'ın hız
tempoları farklı — okunan kod #2575'e kadar giden sorun numaraları taşıyor.

`graphify-out/` 546 KB `graph.json` + 426 KB `graph.html` bırakıyor. Core'un `map.js`'i
30 KB ile aynı depoda kalıyor ve `.gitignore`'da; graphify'ın çıktısı ayrı bir yaşam
döngüsü ister.

İşlev kesişimi de tam değil: `map.js` dosya düzeyinde soruya (kim kimi import ediyor,
hangi dosya öksüz) zaten cevap veriyor ve bu Core'un kendi büyüklüğündeki bir depoda
sorulan sorunun tamamı. Sembol düzeyi ayrım yabancı ve büyük kod tabanlarında değerli —
Core'un kendi bakımında değil.

Son olarak graphify zaten kullanıcı seviyesinde kurulu ve her oturumda erişilebilir;
Core'a taşımak yeni bir yetenek açmıyor, yalnız mülkiyeti değiştiriyor.

## README cümlesi

You do not need graphify to work on Core: `map.js` answers the file-level questions this
repository actually raises, in zero dependencies and zero tokens — reach for graphify when
you are reading someone else's codebase at symbol level, not this one.
