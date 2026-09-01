# claude-flow

> Kanıt seviyesi: **kod** — npm tarball'ları indirildi (`claude-flow@3.38.20`,
> `@claude-flow/cli@3.38.20`, `@claude-flow/mcp@3.0.0-alpha.9`), dağıtılmış
> `dist/` kaynağı okundu, araç şemaları yerel bir tarayıcıyla ölçüldü.
> MCP sunucusunu stdio'dan gerçekten konuşturma denemesi **başarısız oldu**
> (`ERR_MODULE_NOT_FOUND`, tarball kendi başına çalışmıyor); dolayısıyla
> "çalıştırıldı" değil.

## Kimlik

Depo `ruvnet/claude-flow` **taşınmış**: GitHub API isteği `ruvnet/ruflo`'ya
dönüyor. Ürün adı da **Ruflo**. TypeScript (çekirdek motor Rust olarak
tanıtılıyor), MIT, `main`, arşivlenmemiş, son push 2026-09-01 — günlük hareket
var. Depo boyutu 540 MB.

npm'de eski ad hâlâ yayında ve iki paket aynı sürümü taşıyor:
`claude-flow@3.38.20` (26 doğrudan bağımlılık, 1808 dosya, 14.2 MB açılmış) ve
`ruflo@3.38.20` (tek bağımlılık: `@claude-flow/cli`). Toplam 382 yayınlanmış
sürüm; ilk yayın 2026-02-16. Bağımlılıklar arasında `express`, `helmet`,
`cors`, `express-rate-limit`, `bcryptjs`, `ws`, `zod`, `ajv`, `inquirer` ve
`@ruvector/rabitq-wasm` var — yani bir HTTP sunucusu, bir kimlik katmanı ve
bir WASM vektör kütüphanesi kurulumla birlikte geliyor.

Kurulum iki yoldan: Claude Code eklentisi (`/plugin install ruflo-core@ruflo`)
ya da CLI (`npx ruflo@latest init wizard`, veya `curl | bash`). Kancalar
yalnız CLI yolunda kuruluyor.

Ölçek karşılaştırması: Core Node, sıfır bağımlılık. Bu aday **26 doğrudan
bağımlılık ve 14 MB**.

## Çözdüğü dert

"Tek ajan büyük işte yetmiyor; onlarca uzman ajanı sürü hâlinde koşturmak,
aralarında kalıcı hafıza paylaştırmak ve hangi işin hangi modele gideceğini
kendiliğinden seçtirmek istiyorum."

## Veri akışı

**Sürü durumu** düz dosyada: `.claude-flow/swarm/swarm-state.json`, kilit
dosyasıyla korunan bir okuma-değiştirme-yazma döngüsüyle (`withSwarmStoreLock`).
İçinde `swarmId`, `topology`, `maxAgents`, `agents[]`, `tasks[]`, `config`.

**Hafıza** SQLite'ta: `.swarm/memory.db`, `sql.js` (WASM) üzerinden, üstüne
HNSW vektör indeksi. Kod iki kip bildiriyor — `sql.js + HNSW` ya da
`sqlite (bridge, brute-force cosine)`; ikincisi HNSW yoksa devreye giren
kaba-kuvvet kosinüs geri düşüşü. Eski JSON deposundan SQLite'a bir kerelik göç
var, `.migrated-to-sqlite` işaretçisiyle. Hafıza modele **kendiliğinden
görünmüyor**; `memory_search` / `memory_retrieve` araçları çağrılınca görünüyor
— yani hafızanın kendisi bağlam dışında, ama ona ulaşan 15 aracın şeması
bağlamın içinde.

**Yönlendirme** her kullanıcı istemi başında: `UserPromptSubmit` kancası
`hooks route --task "$PROMPT"` çağırıyor, o da `hooks_route` MCP aracına
gidiyor, o da anahtar-kelime + semantik eşleşmeyle bir ajan tipi ve model
öneriyor.

**Arka plan** ayrı: `SessionStart` bir daemon başlatıyor; varsayılan ayar
dosyası on işçi tanımlıyor (`map`, `audit`, `optimize`, `consolidate`,
`testgaps`, `ultralearn`, `deepdive`, `document`, `refactor`, `benchmark`) ve
bunlara `audit: 1h`, `optimize: 30m`, `consolidate: 2h`, `deepdive: 4h` gibi
zamanlamalar veriyor. Bu, oturum boyunca modelden bağımsız dönen bir süreç.

## Bağlam maliyeti

Üç ayrı kalem, üçü de sıradan turda ödeniyor.

**1. MCP araç kataloğu — ölçüldü.** `dist/src/mcp-tools/` altında 39 modülde
**358 benzersiz araç tanımı** buldum. Yalnız tel üstünde giden alanları
(`name` + `description` + `inputSchema`) ölçtüm:

| Alan | Bayt |
|---|---|
| İsimler | 6 159 |
| Açıklamalar | 109 106 |
| `inputSchema` gövdeleri | 154 853 |
| **Toplam** | **270 118** |

Araç başına ortalama 433 bayt şema, 305 bayt açıklama. Token'a çevirisi
**tahmin**: 4 bayt/token varsayımıyla **~67 500 token**, 3.5 bayt/token ile
~77 200. Projenin kendi kodu da aynı hesabı 4'e bölerek yapıyor, yani bu
tahmin onların ölçütüyle uyumlu.

Sunucunun varsayılanı `tools: 'all'`. Bir `--tools` seçicisi ve
`CLAUDE_FLOW_MCP_TOOLS` ortam değişkeni ile katalog daraltılabiliyor ama
**kapalı gelmiyor**. En pahalı tek araçlar: `metaharness_evolve` 3 596 bayt,
`agenticow_speculate` 3 218, `metaharness_flywheel` 2 921.

Dikkat: web arayüzü "210 araç" diyor, kaynakta 358 tanım var; fark muhtemelen
sunucunun varsayılan olarak bir alt kümeyi yayımlamasından. Yayımlanan alt küme
çalıştırılamadığı için **doğrulanamadı**; 358 üst sınırdır.

**2. Üretilen `CLAUDE.md` — ölçüldü.** `init` bir proje talimat dosyası yazıyor;
şablon metinlerinin toplamı **7 742 bayt**, tahminen **~1 900 token**. Başlıkları
arasında "Ruflo Capability Brain & Implementation Loop", "Swarm & Routing",
"3-Tier Model Routing", "Memory & Learning", "Background Workers", "Federation"
var. Bu, her turda sistem talimatı olarak taşınıyor.

**3. `UserPromptSubmit` kancasının çıktısı — tahmin.** Altın kuralı doğrudan
kesen yer burası. Varsayılan `settings.json`:

```json
"UserPromptSubmit": [{ "hooks": [{ "type": "command",
  "command": "[ -n \"$PROMPT\" ] && npx @claude-flow/cli@latest hooks route --task \"$PROMPT\" || true",
  "timeout": 5000 }] }]
```

Diğer kancaların hepsinde `2>/dev/null` var; **bunda yok** ve `--format json`
da yok. `routeCommand` gövdesi insana okunacak bir rapor basıyor:
`Routing task: ...` satırı, "Routing Method" listesi, "Semantic Matches"
skorları, çerçeveli bir "Primary Recommendation" kutusu ve üç sütunlu
"Alternative Agents" tablosu. `UserPromptSubmit` kancasının stdout'u Claude
Code'da modelin bağlamına eklenir. Satır sayısından **tahmini 250-500 token,
her turda**, kullanıcı sürü istesin istemesin.

**Bağlanılan olaylar:** `PreToolUse` (Write|Edit|MultiEdit, Bash, Task),
`PostToolUse` (aynı üçlü), `UserPromptSubmit`, `SessionStart` (iki komut:
daemon + oturum geri yükleme), `Stop`, `Notification`. Belgeler ayrıca "27
kanca"dan söz ediyor; varsayılan ayar dosyasında saydığım **11 komut, 6 olay**.

**4. Eklenti yolunun kendi kancaları — ölçüldü.** Yukarıdaki üç kalem CLI yolunu
anlatıyor; eklenti yolunun da ayrı bir kanca seti var:
`.claude-plugin/hooks/hooks.json` (3 966 bayt). `PreCompact` kancası modelin bağlamına
**düz metin basıyor** — komutun kendisi bu:

```bash
echo "🔄 Auto-Compact Guidance (Context Window Full):";
echo "   • All 54 agents available in .claude/agents/ directory";
echo "   • Batchtools optimization for 300% performance gains";
echo "⚡ Apply GOLDEN RULE: Always batch operations in single messages";
```

Depoda `.claude/agents/` altında **108** markdown var (831 192 bayt); kancanın modele
söylediği "54" sayısı deponun kendi durumuyla tutarsız. Aynı dosyanın kendi
`description` alanı şunu yazıyor: *"known-broken on native Windows"*, ve JSON'da
`"_legacy_unaudited_shim": true` alanı duruyor.

Deponun kendi kök `CLAUDE.md`'si ayrıca **66 757 bayt / 1493 satır** (bu, `init`'in
ürettiği 7 742 baytlık dosyadan farklı bir dosyadır). `.claude/commands/` altında 168
markdown (394 825 bayt), `.claude/skills/` altında 38 `SKILL.md`, depoda 40 plugin var.
README aynı belgede hem **"314 MCP tools"** hem **"~210 tools"** diyor; yukarıdaki 358
sayımı bu ikisinin de üstünde ve üst sınır olarak okunmalı.

**Sıradan turun toplamı — tahmin:** ~1 900 (CLAUDE.md) + ~250-500 (route
kancası) + katalog (kırpılmazsa ~67 500). Core'un sıradan turdaki karşılığı
sıfır.

## Core'daki karşılık

`relay` ile `swarm_init` aynı yeri hedefliyor, taban tabana zıt yoldan.

**Rol çözümü.** Core'da tek ajan tipi (`worker`) var, rol prompt'ta adı geçen
dosyayla belirleniyor, satır x profil `tiers.json`'daki hücreyi veriyor ve model
bunu **yeniden anlatmaz**, `contract.js tier --role builder --id T7` ile
çözer. Ruflo'da rol seçimi bir sınıflandırıcıya devredilmiş: `hooks_route`
anahtar kelime + semantik eşleşmeyle 60+ ajan tipinden birini öneriyor.
Core'unki deterministik ve sıfır token; Ruflo'nunki olasılıksal ve her turda
ödeniyor.

**Model/effort seçimi.** İkisi de üç kademeli. Ruflo'nun
`enhanced-model-router`'ı bir *karmaşıklık skoru* hesaplıyor (AST karmaşıklığı
+ metin sezgiseli + "mimari anahtar kelime" sayısı) ve eşiklerle kesiyor:
`haiku < 0.3`, `sonnet < 0.6`, `opus <= 1.0`; iki veya daha fazla mimari anahtar
kelime doğrudan Tier 3'e atlatıyor. Core aynı kararı **girdinin türünden değil,
rolün kimliğinden ve profilden** veriyor: `tiers.json`'da satır rol, sütun
profil, hücre `opus/medium`. Core'un ek olarak sahip olduğu, Ruflo'da hiç
olmayan şey **tavan** (`ceiling`), **tavan muafiyeti** (`auditor`, `advisor`)
ve **sinyaller yalnız yukarı iter, profil tavanı keser, hiçbir şey aşağı
çekmez** kuralı. Ruflo'da bir yönlendirme kararının üst sınırı yok.

**İş devri.** Core'un sözleşmesi `owns:` ile **dosya listesi** tutar; dizin
reddedilir, çünkü dizinin özeti içeriği değişince değişmez ve mühür yalan
söyler. Ajan ilk düzenlediği sözleşmeye bağlanır, sonra yalnız o `owns`
içine yazabilir. Ruflo'nun `swarm-state.json`'unda `agents[]` ve `tasks[]` var
ama **sahiplik alanı yok**; hangi ajanın hangi dosyaya yazabileceği veri
yapısında hiç kodlanmamış.

**Çakışma önleme.** Ruflo'da tek gerçek mekanizma dosya kilidi
(`withSwarmStoreLock`) — o da yalnız *durum dosyasının kendisini* koruyor,
ajanların ürün kodunu değil. Git seviyesindeki çakışma, Core'un SKILL.md'sinde
açıkça uyardığı şey ("iki yazar tek checkout'ta tek git indeksi paylaşır;
her eşzamanlı yazara bir worktree ver"), Ruflo'da üretilen CLAUDE.md'ye bir
öğüt olarak yazılmış ("Never allow two writers in one worktree") — yani
**modelin uyacağı bir cümle**, kapı değil. Core'da bu bir kapı.

**Hiç olmayan.** Ruflo'da `contract.js complete`'in karşılığı yok: `verify:`
adımlarının hepsinin 0 dönmesi, diff'ten hesaplanan risk, yüksek riskte
denetçinin ürettiği ve kullanımda tüketilen denetim kaydı, `status`'ün asla
geri gitmemesi. `swarm_shutdown` durumu `stopped`a çevirir, hiçbir şey
doğrulamaz.

**Core'da daha iyi.** Sıradan turun bedeli. Ruflo'nun bütün koordinasyonu
modelin bağlamından geçiyor — 358 araç şeması, 1 900 token'lık talimat dosyası
ve her istemde basılan yönlendirme raporu. Core'un koordinasyonu diskte:
`.claude/relay/contracts/*.md`, `live/*.json`, `audits/`. Model bunları ancak
açtığında görür; statusline ve `MessageDisplay` bandı zaten modele gitmez.

## Çalınabilir fikir

**1. Şema bütçesi ölçen ve eşikte alarm veren bir fonksiyon.**
`assessMcpSchemaOverhead(tools, contextWindowTokens)` kataloğu
`{name, description, inputSchema}` üçlüsüne indirip `JSON.stringify` ediyor,
baytı 4'e bölüp token tahmin ediyor, sonucu bağlam penceresine oranlıyor ve
oran **>= 0.20** ise `risk: 'high'` dönüyor (pencere bilinmiyorsa mutlak eşik
8 000 token). Mekanizma tam olarak bu: *serileştir -> böl -> orana bak -> eşikte
yüksek de*. Core'a `risk.js` yanında bir "bağlam riski" ölçütü olarak girer;
Core'un ölçeceği şey MCP şeması değil, bir sözleşmenin `owns:` kümesinin
okunduğunda kaç token edeceğidir — 8 dosyalık eşiği bayta çevirir.
**Altın kuralı ihlal eder mi — hayır.** Talep üzerine çalışır, çıktısı
`contract.js check`'in içinde kalır.

**2. Kataloğu daraltan seçici: yayımlanan ile çalıştırılabilen ayrımı.**
`filterAdvertisedMcpTools` seçiciyi üç biçimde kabul ediyor — tam ad, kategori,
ya da ad öneki (`memory` -> `memory_store`, `memory_search`...). Kritik nokta
kodun kendi yorumunda: *"Execution remains registered internally; only the
fixed per-request schema catalogue is reduced."* Yani araç çalışmaya devam
eder, sadece **modele anlatılmaz**. Bu ayrım — kayıtlı yetenek kümesi ile
ilan edilen yüzey kümesi iki ayrı şey — Core'un rol dosyalarına birebir
oturur: bir role tüm betikler kayıtlı kalır, prompt'unda yalnız o rolün önek
kümesi anlatılır.
**Altın kuralı ihlal eder mi — hayır.** Aksine, kuralı uygulayan mekanizmanın
ta kendisi.

**3. APSC: EMA uygunluk skoru -> sınırlı bir askıya alma kapısı.**
Sürüdeki tek gerçek davranış bu. `recordSwarmPheromoneSignal(signal)` her
görev sonucunu (`hooks_post-task`'ten geliyor) alıp ajan başına rol-farkında
üstel hareketli ortalama bir uygunluk skoru güncelliyor; `minSamples` dolana
kadar karar vermiyor, `minActiveAgents` altına inmiyor ve bir `dryRun` kipi
var. Karar üçlü: *keep / suspend / reactivate*. Sonra
`pheromoneAgentEligibility(agentId)` bunu `agent_execute`'un önünde bir
zamanlama kapısı olarak okuyor.
Core'un `live/_tally.json`'u bugün yalnız **sayıyor** ve `repeatFail` eşiğinde
modeli/effort'u yukarı itiyor. Çalınacak parça sayaç değil, üç mekanizma:
(a) ham sayaç yerine yumuşatılmış skor, (b) `minSamples` — kanıt yetmeden
karar yok, (c) `dryRun` — kapı kararını yazar ama uygulamaz, önce ölçersin.
`autoEffortCap` zaten (b)'nin kuzeni; eksik olan (a) ve (c).
**Altın kuralı ihlal eder mi — hayır.** `_tally.json` dosyada duruyor,
çözümleyici okuyor, model görmüyor.

**4. Araç açıklamasına "yerli araç ne zaman yanlış" cümlesini gömmek.**
Ruflo'nun her sürü aracının açıklaması aynı kalıpla bitiyor: *"Use when native
Task tool is wrong because... For independent one-shot subagents, native Task
is fine."* `memory_retrieve` de aynısını yapıyor: *"Use when native Read is
wrong because the value is not a file."* Mekanizma, aracın kendi şemasına
**rekabet ettiği yerli araca göre bir sınır çizmek** — model iki seçenek
arasında kalınca kararı prompt'tan değil şemadan alıyor. Core'un rol
dosyalarına ve `SKILL.md`'deki "Size" tablosuna aynı biçim uygulanabilir:
"tek dosya, tasarım kararı yok -> relay kurma" zaten bu cümlenin Türkçesi,
ama rol dosyalarının başında değil skill'in ortasında duruyor.
**Altın kuralı ihlal eder mi — hayır**, ama bedava da değil: Core'un rol
dosyaları yalnız ajan açıldığında okunur, T0'ın turunda değil. Cümle rol
dosyasına girerse bedel ajan başına ödenir, sıradan turda sıfır kalır.
Şemaya girerse — Core'un MCP aracı yok, zaten giremez.

**5. Yalnız *ilan edilen* kataloğu daraltan ortam değişkeni.**
`CLAUDE_FLOW_MCP_TOOLS` ile katalog kurulum dosyasına dokunmadan
kısılabiliyor, ve kodun yorumu `--tools` bayrağının değişkeni ezdiğini açıkça
söylüyor. Öncelik sırasının koda yazılmış olması (ayar < ortam < bayrak)
Core'un `profileOf`/`projectProfile` çözümlemesiyle aynı desen.
**Altın kuralı ihlal eder mi — hayır.**

## Ret adayı gerekçe

Girmeme ihtimalinin en güçlü nedeni: **çalınacak fikirlerin dördü de aynı tek
mekanizmanın parçaları ve o mekanizma Core'da zaten var.** Şema bütçesi,
katalog daraltma ve ortam değişkeni önceliği — üçü birden "modele ne
anlatılacağını sınırla" diyor, ki Core bunu sınırlamıyor, **hiç yapmıyor**:
sıradan turda yazılan token sıfır olduğu için bütçelenecek bir şey yok.
`assessMcpSchemaOverhead`'i Core'a taşımak, olmayan bir yükü ölçen bir ölçüm
aracı eklemek olur. Geriye tek gerçek yeni şey APSC'nin `dryRun`'ı ve
yumuşatılmış skoru kalıyor — bu da `tiers.json`'a iki alan, bir dosya değil.

İkinci neden: ölçtüğüm her sayı Core'un ölçütünün ters tarafında duruyor —
26 bağımlılık, 14 MB, 6 olaya bağlı 11 kanca, her istemde bağlama basılan bir
rapor. Aday ödünç alınacak bir bileşen değil, **kaçınılan şeyin ölçüsü**.

Üçüncü neden, dürüstlük payı: topoloji sözlüğü sekiz değer kabul ediyor
(`hierarchical`, `mesh`, `hierarchical-mesh`, `ring`, `star`, `hybrid`,
`adaptive`, `pheromone-adaptive`) ama `swarm-tools.js` dışında `.topology`
okuyan **her yer** ya ekrana basıyor ya `=== 'pheromone-adaptive'` filtresi
yapıyor. Yani sekiz topolojinin yedisi durum dosyasında saklanan bir etiket;
davranışı değiştiren tek değer sonuncusu. Sürü soyutlaması, koordinasyonu
diske de isteme de koymuyor — çoğunlukla hiçbir yere koymuyor.

## README cümlesi

Ruflo (formerly claude-flow) puts its coordination inside the model's context —
358 MCP tool schemas, a generated instruction file, and a routing report printed
on every prompt — where Core keeps the same coordination on disk in contracts
and agent records, so an ordinary turn costs nothing.
