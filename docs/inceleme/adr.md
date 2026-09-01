# Karar kaydı otomasyonu (log4brains / adr-tools)

> Kanıt seviyesi: doküman | kod

Yereldeki karşılıklar koddan okundu (`contract.js`, `seal.js`, `risk.js`, `log.js`,
`DECISIONS.md`). Dış araçların hiçbiri kurulmadı; onlar doküman + npm registry seviyesinde.

## Kimlik

**log4brains** — TypeScript/Node, npm `log4brains@1.1.0` (17 Aralık 2024), `node >= 18`,
global CLI olarak kurulur. Kök paket 7 bağımlılık; ama iş `@log4brains/core` (18 bağımlılık,
469 KB) ve `@log4brains/web` (28 bağımlılık, **52 MB** açılmış — içi Next.js) tarafında.

**adr-tools** (npryce) — saf bash + Makefile, bağımlılıksız; `doc/adr` altına numaralı
markdown yazar. README'de "yerini log4brains aldı" notu var, geliştirme durgun.

**pyadr** — Python/Poetry, `pyadr` + `git adr` sarmalayıcısı. **dotnet-adr** — .NET global
tool. **adr-manager** — GitHub'a bağlanan web formu. **adr-log** — sadece `index.md` üreten
CLI. Hepsi ayrı bir ikili; hiçbiri Claude Code eklentisi değil, hiçbirinin kancası yok.

## Çözdüğü dert

"Bu mimariyi neden böyle seçtiğimizi altı ay sonra kimse hatırlamıyor; karar git
geçmişinde bir yerde ama okunacak halde değil."

## Veri akışı

Tetikleyici **her araçta elle bir komuttur**: `log4brains adr new`, `adr new`,
`pyadr new`. Komut, şablondan bir markdown dosyası üretir ve editörü açar; metni insan
(ya da ajan) yazar. Git kancası ya da CI tetiklemesi hiçbirinde yok — pyadr'ın `git adr`
sarmalayıcısı bile dal açıp commit atar, yani yine elle çağrılır.

Depolama düz dosyadır: `docs/adr/NNNN-baslik.md`. Durum makinesi dosyanın **içinde**
metin olarak durur — `proposed / accepted / rejected / deprecated / superseded`. adr-tools
`adr new -s 12` ile yeni kaydı yazarken eski kaydın durumunu "superceded" yapar; pyadr
`accept`/`reject` durumu ve tarihi dosyada günceller (`supersede`/`deprecate` hâlâ
uygulanmamış).

Format iki koldan gider: **Nygard** (Context / Decision / Status / Consequences,
adr-tools) ve **MADR 2.1.2+** (frontmatter'da `status`, `date`, `deciders`, gövdede
seçenek karşılaştırması — log4brains, pyadr, adr-manager, VS Code eklentisi).

Aranabilirlik üç katmanda: (1) dosya adındaki artan numara sıralamayı verir, (2) `adr
generate toc` / `adr-log` / `pyadr toc` bir `index.md` üretir, (3) log4brains
`preview` ile canlı sunucu, `build` ile aranabilir statik site kurar — zaman tüneli,
etiket, tam metin arama. log4brains metadatanın bir kısmını **git geçmişinden** çıkarır:
oluşturma/değişme tarihi, yazar, commit; bu yüzden sığ klon (`--depth`) ile yanlış çalışır.
Numaralandırmayı da bilerek zorunlu tutmaz — birleşme çakışmasını azaltmak için.

## Bağlam maliyeti

**Pasif (sıradan tur): 0 token.** Hiçbiri kanca değil, hiçbiri oturuma bağlanmıyor. Bu
tarafta altın kuralla çatışma yok.

**Çağrı başı** (**tahmin**, ölçülmedi):

- `log4brains adr new` — çıktısı bir yol satırı, ~20 token. Asıl yük ajanın **ADR gövdesini
  yazması**: MADR şablonu doldurulmuş halde 50-90 satır ≈ **600-1000 token üretim**.
- `adr generate toc` / `pyadr toc` — indeks dosyası çıktısı; ajan okumazsa ~15 token,
  okursa kayıt başına ~15 token × kayıt sayısı.
- `log4brains build` — model hiç okumaz, 0 token; disk maliyeti ayrı (52 MB `web` paketi).
- Sonradan bir kararı **okumak**: kayıt başına 400-800 token; site değil dosya okunur.

Yani pahalı olan araç değil, **kaydın kendisi**. Core'un `ledger.jsonl` satırı bu işi
~40 token'lık tek satırla yapar; ADR ise nesir olduğu için bir mertebe pahalı.

## Core'daki karşılık

Core'da karar kaydı **iki yerde ve ikisi de yarım**: makine tarafı
`.claude/relay/audits/ledger.jsonl` (kim/ne/hangi HEAD), insan tarafı `docs/DECISIONS.md`
(599 satır, D1-D16, elle yazılmış, tetikleyicisi yok).

| | log4brains / adr-tools | Core |
|---|---|---|
| Tetikleme anı | elle komut (`adr new`); kanca/CI yok | `ledger.jsonl`: **otomatik**, `contract.js complete` kapısında; `audits/<id>-<round>.json`: `contract.js audit` elle; `DECISIONS.md`: tümüyle elle |
| Format | Nygard ya da MADR markdown; durum makinesi dosya içinde metin | ledger: JSONL, alanlar `id, round, risk, verify[], auditorRunId, headSha, at`; denetim kaydı: `contractId, auditorRunId, headSha, diffHash, owns, verification, result, createdAt`; DECISIONS.md: serbest markdown, durum alanı **yok** |
| Aranabilirlik | numaralı dosya adı + üretilen `index.md` + statik site + tam metin | ledger `grep`/`jq`; `contract.js ledger` done/ ile defteri karşılaştırır; DECISIONS.md yalnız `grep`; indeks üreten hiçbir şey yok |

Core'da **hiç olmayan**: bir kararın durumu (öneri → kabul → yürürlükten kalktı →
yerine geçildi) ve kararlar arası **yerine geçme bağı**. `DECISIONS.md`'de D11 "yapılmayan
banner", D12 "emekliye ayrılan başlık çubuğu" — bunlar aslında superseded/rejected
durumundaki kayıtlar ama durum yalnız başlık nesrinde yaşıyor, makine göremiyor.

Core'un **daha iyi** olduğu yer tetikleme ve kanıt: ledger satırını model yazmaz, kapı
yazar; `headSha` ve `diffHash` `seal.js` içinde hesaplanır, dışarıdan verilemez
(`audit()` bunu açıkça söylüyor: "headSha and diffHash were computed here, not supplied").
ADR araçlarının hiçbirinde kaydın doğruluğunu bağlayan böyle bir mühür yok — metin ne
derse odur. Ayrıca `risk.js` kararın **önemini** diff'ten ölçer; ADR dünyasında ağırlık
diye bir kavram yok, her kayıt eşit.

`log.js` üçüncü kenar: onun formatı zaten mini bir durum makinesi — `**State:** open`,
`close` siler, `archive` durumu `closed` yapıp `closed/` altına taşır. Yani Core'da
"durumlu kayıt" deseni **bir kez yazılmış**, ama yalnız hatalara uygulanmış.

## Çalınabilir fikir

1. **Yerine geçme bağı (`supersedes: D11`).** `adr new -s 12` deseni: yeni kaydı yazarken
   eski kaydın durumunu makine günceller, iki yönlü bağ kurar. `DECISIONS.md` başlıklarına
   tek satırlık bir durum alanı (`Durum: yürürlükte | yerine D14 geçti | uygulanmadı`)
   eklemek, `grep '^Durum:'` ile taranabilir bir karar durumu verir. — altın kuralı ihlal
   eder mi: **hayır** (dosya içi metin, kanca yok).

2. **Karar defteri satırı, nesir değil.** ADR'nin pahalı yanı gövdesi; ucuz yanı
   frontmatter'ı. Bir `decisions.jsonl` — `{id, title, status, supersedes, headSha, at}` —
   `ledger.jsonl` ile aynı append-only mekanizmayı (`ledgerAppend`) kararlara uygular;
   nesir `DECISIONS.md`'de kalır, makinenin okuduğu satır 40 token olur. — ihlal eder mi:
   **hayır** (yalnız disk; model isterse okur).

3. **`toc` üretimi: indeks modelin değil betiğin işi.** `adr generate toc` / `adr-log`
   deseni, `scaffold.js`'in "sabit metinleri model yazmaz" ilkesiyle birebir aynı.
   599 satırlık `DECISIONS.md`'nin başına D1-D16 tek satırlık dizini bir betik yazabilir;
   model dosyanın tamamını okumadan hangi kararın nerede olduğunu görür. — ihlal eder mi:
   **hayır**.

4. **Git geçmişinden metadata çıkarma.** log4brains kaydın tarihini/yazarını dosyaya
   yazdırmaz, `git log`'dan okur. Core'da karşılığı hazır: `seal.js` zaten
   `git diff --name-status` ve `rev-parse HEAD` çalıştırıyor. Bir kararın "ne zaman, hangi
   commit'te" bilgisi kaydın içine kopyalanmak yerine `headSha`'dan türetilebilir —
   `ledger.jsonl` bunu zaten yapıyor, `DECISIONS.md` yapmıyor. — ihlal eder mi: **hayır**
   (talep üzerine çalışan betik).

5. **Numarasız dosya adı, birleşme çakışmasını azaltmak için.** log4brains'in artan numarayı
   zorunlu tutmama gerekçesi: iki dal aynı numarayı alır, çakışır. Core'un sözleşme
   kimlikleri (`T7`) aynı riski taşıyor; `log.js`'in slug tabanlı adlandırması ise zaten
   bu tuzağa düşmüyor. — ihlal eder mi: **hayır**.

6. **Statik site (`log4brains build`).** — ihlal eder mi: **hayır** ama bedeli 52 MB'lık
   bir Next.js ağacı ve sıfır-bağımlılık kuralının sonu; mekanizma olarak çalınabilir olan
   şey site değil, onu besleyen indeks.

## Ret adayı gerekçe

- **Tetikleme anı Core'unkinden zayıf.** Her araçta kayıt elle bir komutla doğar. Core'un
  değerli tarafı tam tersi: `complete` kapısı kayıt yazmadan kapanmaz. Elle çağrılan bir
  komut eklemek, zaten elle yazılan `DECISIONS.md`'nin üstüne bir ikili daha koymak olur.
- **Bağımlılık bedeli.** log4brains'in çalışan yüzü `@log4brains/web`, 52 MB ve 28
  bağımlılık. Core saf Node ve sıfır bağımlılık; bu araç kurulum biçimiyle o kuralı
  taşıyamaz. adr-tools bash'tir, Windows PowerShell hattında ayrı bir yük.
- **Format eşleşmiyor.** MADR bir seçenek karşılaştırma formatıdır (options, pros/cons);
  `DECISIONS.md`'nin fiilî şekli "karar + maliyet sınıfı + gerekçe + Fable itirazı" — daha
  kısa ve projeye özgü. Şablonu değiştirmek 599 satırı yeniden yazmak demek.
- **Mühür yok.** Core'un denetim kaydında `diffHash` ve `headSha` betik tarafından
  hesaplanır; ADR dosyasında karşılığı yoktur, metin doğrulanmaz.
- **Çakışan kapsam.** Aranabilirlik ihtiyacı 16 kayıtlık tek bir dosyada `grep` ile
  karşılanıyor; statik site kurmanın kazandırdığı şey bu ölçekte belirsiz.

## README cümlesi

Core already writes a decision record at the moment a contract closes — machine-sealed with
the commit and diff it describes — so there is nothing to install and no command to remember.
