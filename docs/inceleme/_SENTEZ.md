# Sentez — 16 inceleme raporunun envanteri

> Bu belge **envanterdir, hüküm değildir.** Hiçbir satırı "girer / girmez / önce şunu
> yapalım" demez. Kaynak: `docs/inceleme/` altındaki 16 rapor (`_SABLON.md` hariç),
> tümü tam okundu; eşleştirme için `map.js`, `risk.js`, `log.js`, `contract.js`,
> `statusline.js`, `doctor.js` kaynakları da okundu.

Rapor başına kanıt seviyesi:

| Rapor | Kanıt |
|---|---|
| `git-native.md` | çalıştırıldı (bu depoda ölçüldü) |
| `graphify.md` | çalıştırıldı (bu depoda ölçüldü) |
| `claude-flow.md` | kod (tarball indirildi, şema baytları ölçüldü; MCP konuşturulamadı) |
| `ccusage-ccstatusline.md` | kod (kaynak okundu, çalıştırılmadı) |
| `semgrep-codeql.md` | kod + **git karşılıkları bu depoda çalıştırıldı** |
| `aider-repomap.md` | kod (`repomap.py`) |
| `serena.md` | kod + doküman |
| `ast-grep.md` | doküman + kod (`Cargo.toml`) |
| `adr.md` | doküman + kod (yereldeki karşılıklar) |
| `baglam-enjeksiyonu.md` | doküman + kod (betik okundu, çalıştırılmadı) |
| `mem0.md` | doküman + kod (istem dosyası) |
| `spec-kit.md` | doküman + kod (komut şablonları) |
| `beads.md` | doküman |
| `obsidian.md` | doküman |
| `openspec-taskmaster.md` | doküman |
| `repomix.md` | doküman |

---

## 1. Fikir envanteri

Ham madde sayısı 97; mükerrerler birleştirildikten sonra **74 fikir**. "Kaç projede"
sütunu, fikrin **bağımsız olarak kaç adayda** görüldüğüdür. "Kanıt" sütunu, fikri
taşıyan raporun kanıt seviyesidir (birden çok raporda geçiyorsa en yükseği).
"Kaba büyüklük" Core tarafındaki uygulamanın satır tahminidir — hiçbir raporda
ölçülmedi, **hepsi tahmin**.

| # | Fikir (mekanizma) | Kaynak proje | Kaç projede | Dokunduğu organ | Altın kuralı ihlal | Kanıt | Satır |
|---|---|---|---|---|---|---|---|
| 1 | Çıktıya token bütçesi; aşıldığında kaç öğenin kırpıldığını ve bütçenin nasıl büyütüleceğini yazmak (Repomix varyantı: uyarı değil **hata**) | aider, graphify, Obsidian, Repomix | **4** | map.js, kapı | hayır | çalıştırıldı | 30-60 |
| 2 | `bytes/4` ile tokenizer'sız maliyet tahmini; serileştir → böl → orana bak → eşikte "yüksek" de | context-hogs, Repomix, Ruflo | **3** | risk.js, statusline | hayır | kod | 20-40 |
| 3 | Kümülatif maliyet defteri (koşu / sözleşme başına gerçekleşen token ve süre) | graphify (`cost.json`), ccusage | **2** | denetim defteri | hayır (rapor sıradan turda bağlama yazılırsa **evet**) | çalıştırıldı | 40-70 |
| 4 | Maliyetin klasör ağacı olarak dağılımı (`--token-count-tree`) | Repomix | 1 | statusline/bant, map.js | hayır | doküman | 20-30 |
| 5 | Önce iskelet sonra gövde: iki aşamalı okuma (sembol özeti / belge haritası / imzayı tut gövdeyi at) | Serena, Obsidian, Repomix | **3** | map.js | hayır | kod | 60-120 |
| 6 | Üretilen çıktı otorite değildir: silinebilir, yeniden üretilir, elle düzenlenmez | Obsidian, Taskmaster, Repomix | **3** | map.js, done/ | hayır | doküman | 0-15 (kural) |
| 7 | `blocked-by` kenarı + türetilmiş "hazır iş" sorgusu (`bd ready` / `next_task`) | beads, Taskmaster+OpenSpec | **2** | contract.js/kapı | hayır | doküman | 50-90 |
| 8 | Çakışmayan kimlik: artan sayaç yerine hash (`bd-a3f8`), ya da numarayı hiç zorunlu tutmamak | beads, log4brains | **2** | contract.js | hayır | doküman | 10-20 |
| 9 | Kimlik kuralının tek yerde, kelimesi kelimesine tanımlanması (yoksa hayalet ikizler) | graphify | 1 | contract.js, relay | hayır | çalıştırıldı | 10-20 |
| 10 | Kuralı koddan **veri dosyasına** çıkarmak; kural klasörünü tek dosya bildirsin (`sgconfig.yml`/`ruleDirs`) | ast-grep, Semgrep | **2** | risk.js | hayır | kod | 40-80 |
| 11 | Kuralı sayısal ağırlığa bağlamak: ikili `high/low` yerine çarpan ya da 0-10 severity, eşik toplamı | Semgrep (SARIF), aider (kenar çarpanları) | **2** | risk.js | hayır | kod | 30-50 |
| 12 | Kural gramerı: atomik / ilişkisel (`inside`) / bileşik (`all`,`any`,`not`) | ast-grep | 1 | risk.js | hayır | doküman | 60-100 |
| 13 | Kuralın kendi testi: yanında eşleşmesi ve eşleşmemesi gereken örnekler | ast-grep | 1 | risk.js, test/ | hayır | doküman | 40-80 |
| 14 | Her komutun insan çıktısının yanında makine çıktısı (`--json`) | ast-grep | 1 | risk.js, contract.js | hayır | doküman | 20-40 |
| 15 | Desen tabanlı `verify` adımı ("şu desen diff'te görünmesin"), ham kabuk komutu yerine | ast-grep | 1 | contract.js/kapı | hayır | doküman | 30-60 |
| 16 | Diff'te dosya durumu sınıfı (`--name-status --diff-filter=ACDMRT`) riske katılsın; silme/rename farklı risk | git, Semgrep | **2** | risk.js | hayır | **çalıştırıldı** | 15-25 |
| 17 | Diff satır aralığı tablosu; hunk başlığı kapsayan fonksiyon adını taşır. Kesişim testi: `range.start <= loc.end && loc.start <= range.end` | git, CodeQL | **2** | risk.js | hayır | **çalıştırıldı** (7 hunk) | 30-50 |
| 18 | Risk tabanı `HEAD` değil `merge-base` olmalı (dalda biriken commit riskten kaçıyor) | git, Semgrep | **2** | risk.js | hayır | **çalıştırıldı** (27 ms) | 5-10 |
| 19 | İki sentinel: `{yol,0,0}` = tüm dosya riskli; `["",0,0]` = hiçbir şey değişmedi, tüm uyarıları kes | CodeQL | 1 | risk.js | hayır | doküman | 10-15 |
| 20 | Kirli çalışma ağacında karşılaştırmayı **iptal etmek** (baseline yalan söyler) | Semgrep | 1 | contract.js/kapı, seal.js | hayır | kod | 10-15 |
| 21 | `git worktree` ile kullanıcının ağacını kirletmeden baseline okumak | Semgrep | 1 | risk.js, relay | hayır | kod | 20-40 |
| 22 | Pahalı ikinci geçişi yalnız aday dosyalara daraltmak; aday yoksa hiç koşmamak | Semgrep | 1 | contract.js (`orphans()`) | hayır | kod | 10-20 |
| 23 | Bulgu parmak izi (`ci_unique_key` / `partialFingerprints`) → "bu sorun tekrar etti" ölçülebilir olur | Semgrep/SARIF | 1 | log.js | hayır | doküman | 20-30 |
| 24 | Opsiyonel dedektör deseni: araç kuruluysa çağır ve skora kat, değilse kendi sezgisiyle devam | Semgrep | 1 | risk.js, doctor.js | hayır | doküman | 25-40 |
| 25 | Tarihsel oynaklık sinyali: `rev-list --count HEAD -- <f>` + son dokunma tarihi | git | 1 | risk.js | hayır | **çalıştırıldı** (22 ms) | 15-25 |
| 26 | Birlikte-değişme (co-change) ile **eksik `owns`** yakalama: %70+ beraber değişen dosya `owns`'ta yoksa uyar | git | 1 | contract.js `check` | hayır | **çalıştırıldı** (112 ms) | 40-70 |
| 27 | `git log -L '/^function X/,/^}/:file'` ile fonksiyon düzeyi tarihçe — dosyayı baştan okumaya alternatif | git | 1 | relay (scout rolü) | hayır | **çalıştırıldı** (26 ms) | 0-10 (komut) |
| 28 | `--follow` ile `trash/` sürekliliği: taşınan dosya R100 rename görülüyor, tarihçe kaybolmuyor | git | 1 | map.js, log.js | hayır | **çalıştırıldı** | 10-20 |
| 29 | Eşzamanlılık uyarısı: `git log --all --since=1.day -- <owns>` başka bir ref aynı dosyaya dokunmuşsa kanıtla söyle | git | 1 | contract.js, relay | hayır | **çalıştırıldı** (3 satır) | 20-30 |
| 30 | `[P]` iddiasını hesaplamak: açık sözleşmelerin `owns` kümeleri kesişmiyorsa paralel, kesişiyorsa hayır (`contract.js overlap`) | Spec Kit | 1 | contract.js, relay | hayır | doküman | 30-50 |
| 31 | Atomik sahiplenme (`--claim`): durum değişimi ve atama tek işlemde, yarış koşulsuz | beads | 1 | contract.js, relay | hayır | doküman | 20-40 |
| 32 | Çok sinyalli etki yarıçapı: import kenarı (kesin) + `git grep` (kaba) + defter tarihçesi birleştirilip tek sıra üretilir | git, mem0 | **2** | map.js, contract.js `check` | hayır | **çalıştırıldı** (import 1 / grep 8 dosya) | 40-70 |
| 33 | Ağırlıklı sıralama / kişiselleştirilmiş PageRank; kişiselleştirme vektörü = açık sözleşmenin `owns` listesi | aider | 1 | map.js | hayır | kod | 50-80 |
| 34 | Deterministik küme adlandırma: topluluğu **en yüksek dereceli üyesinin** adıyla an, eşitliği id ile kır | graphify | 1 | map.js | hayır | **çalıştırıldı** | 15-25 |
| 35 | Kümeleme/çıktı öncesi grafiği kanonik sıraya sokmak (dosya sistemi sırası sonuca sızmasın) | graphify | 1 | map.js | hayır | çalıştırıldı | 10-20 |
| 36 | Küçülme koruması: yeni çıktı eskisinden az düğüm içeriyorsa **yazma**; eski dosya okunamıyorsa da yazma | graphify | 1 | map.js | hayır | çalıştırıldı | 15-25 |
| 37 | Bozulmada sessiz düşüş: önbellek açılmazsa boş sözlüğe düş, program asla düşmesin | aider | 1 | map.js | hayır | kod | 10-20 |
| 38 | Sürümlü önbellek/şema adı (`.cache.v{N}`, `_map.schema`) — biçim değişince eski kendiliğinden ölür | aider | 1 | map.js | hayır | kod | 5-10 |
| 39 | İki eksenli bayatlama damgası: **yapısal** hash ile **denetlenmiş** hash ayrı; biri taze diğeri bayat olabilir | graphify | 1 | denetim defteri, map.js | hayır | çalıştırıldı | 30-50 |
| 40 | "Ancak çıktı ürettiyse damgala" + yarım kalanın **eski damgasını da sil** | graphify | 1 | kapı, denetim defteri | hayır | çalıştırıldı | 20-30 |
| 41 | Salt okunur bütünlük teşhisi: sarkan uç / eksik uç / kendine-döngü sayılır, **asla durdurmaz** | graphify | 1 | doctor.js, map.js | hayır | çalıştırıldı | 25-40 |
| 42 | Ayrık güven cetveli: modelden sürekli 0-1 skoru değil beş değerden biri istenir; hiçbiri uymuyorsa AMBIGUOUS | graphify | 1 | denetim kaydı (`--verification`) | hayır | çalıştırıldı | 10-20 |
| 43 | Durum alanı + `supersedes` bağı; çelişen kayıt güncellenmez, **yerine geçilir** (zıtlık = sil+ekle, incelme = güncelle) | log4brains/adr-tools, mem0 | **2** | log.js, DECISIONS.md, denetim defteri | hayır | kod | 30-60 |
| 44 | Karar kaydının makine yüzü nesir değil satır olsun: `decisions.jsonl` — `{id,title,status,supersedes,headSha,at}` | adr | 1 | denetim defteri | hayır | kod | 30-50 |
| 45 | İndeks/dizin üretimini betiğe vermek (`adr generate toc`; adlandırılmış bellek listesi) — sabit metni model yazmaz | adr, Serena | **2** | scaffold.js, docs/ | hayır (Serena varyantı her oturuma yazdırırsa **evet**) | doküman | 30-50 |
| 46 | Metadatayı kayda kopyalamak yerine git geçmişinden türetmek (tarih, yazar, commit) | log4brains, git | **2** | denetim defteri, seal.js | hayır | kod | 15-25 |
| 47 | Zaman-farkında getirme: `ledger --topic <yol>` — o dosyayı `owns`'unda geçiren kapanmış sözleşmeler yeniden eskiye | mem0 | 1 | denetim defteri | hayır | doküman | 25-40 |
| 48 | `core` / `archival` ayrımını bir **sınıflandırma kuralı** olarak adlandırmak: "bu her istemde bulunmalı mı?" | Letta/MemGPT | 1 | altın kuralın kendisi (belge) | hayır (kuralın genelleştirilmiş hâli) | doküman | 0 (kural) |
| 49 | Async kanca bayrağı (`"async": true`) — kanca turu bloklamaz, yan etkisini arkada yazar | context-hogs | 1 | kancalar | hayır (gecikmeye dokunur) | kod | 0-5 (ayar) |
| 50 | Boş nesne sözleşmesi: kanca hep çalışır, hep `{}` döner; tek bir `emitSilent()` yardımcısı kuralı mekanizmaya çevirir | context-hogs | 1 | kancalar, hooks/lib.js | hayır | kod | 10-20 |
| 51 | `systemMessage` kanalı: kullanıcıya görünen, modele girmeyen resmî kanal | context-hogs | 1 | statusline/bant | hayır | kod | 10-20 |
| 52 | Defter tavanı (`LEDGER_CAP`) + oturum sonunda tek geçişte budama | context-hogs | 1 | denetim defteri | hayır | kod | 15-25 |
| 53 | Kademeli açığa çıkarma: bağlama tam veri değil kimlikli bir **indeks** yazılır, ayrıntı araçla çekilir | claude-mem | 1 | (kanca yolu) | **EVET** — tur başı token yazar; yalnız SessionStart'a hapsedilirse "sıradan tur" dışında kalır | doküman | — |
| 54 | Kayıtlı yetenek ile **ilan edilen** yüzey ayrımı: araç çalışmaya devam eder, yalnız modele anlatılmaz (`ToolMarkerOptional`, `filterAdvertisedMcpTools`) | Ruflo, Serena | **2** | relay (rol dosyaları) | hayır (kuralı uygulayan mekanizma) | kod | 30-50 |
| 55 | Öncelik sırasının koda yazılması: ayar < ortam değişkeni < bayrak | Ruflo | 1 | relay (`profileOf`) | hayır | kod | 10-20 |
| 56 | EMA ile yumuşatılmış uygunluk skoru + `minSamples` (kanıt yetmeden karar yok) + `dryRun` (kararı yaz, uygulama) | Ruflo (APSC) | 1 | `tiers.json`, `live/_tally.json` | hayır | kod | 40-70 |
| 57 | Aracın kendi tanımına "**yerli araç ne zaman yanlış**" sınır cümlesini gömmek | Ruflo | 1 | relay (rol dosyaları) | hayır (rol dosyasına girerse; şemaya girse **evet** ama Core'un MCP aracı yok) | kod | 0-10 (metin) |
| 58 | Delta biçimi: `ADDED` / `MODIFIED` / `REMOVED` — tam kopya değil yalnız fark; kapanışta birleştirme adımı | OpenSpec | 1 | contract.js/kapı, denetim defteri | hayır | doküman | 50-90 |
| 59 | Ayrık iki dizin — `specs/` gerçek, `changes/` öneri — ve karışma anı tek geçit: **archive** | OpenSpec | 1 | contract.js (`contracts/` ↔ `done/`) | hayır | doküman | 30-60 |
| 60 | Arşive tarih öneki (`YYYY-MM-DD-<ad>`): kronoloji dosya adından okunur | OpenSpec | 1 | done/ | hayır | doküman | 5-10 |
| 61 | Kapanan işin belli bir yaştan sonra tek satıra indirilip ayrı arşive taşınması ("semantik bellek çürümesi") | beads | 1 | done/, denetim defteri | hayır (önce `trash/` kuralıyla uzlaştırılmalı) | doküman | 30-50 |
| 62 | Karmaşıklık puanı → **açılışta** bölme eşiği: `owns` 8 dosyayı aşan sözleşme açılırken "ikiye böl" uyarısı | Taskmaster | 1 | contract.js, risk.js | hayır | doküman | 15-25 |
| 63 | Anayasa dosyası: numaralı MUST/SHOULD maddeleri; denetim bulgusu maddeye **atıfla** adlandırılır | Spec Kit | 1 | denetim defteri, `auditor` rolü | hayır (enjekte edilirse **evet** — sınır burada) | doküman | 20-40 + metin |
| 64 | Kapsama eşlemesi: her `## Acceptance` maddesi en az bir `verify:` adımına eşlenmeli; eşlenmeyeni `check` söyler | Spec Kit | 1 | contract.js/kapı | hayır | doküman | 30-50 |
| 65 | Faz iskeleti: kurulum → engelleyen temel → hikâye fazları → cilalama; temel bitmeden hikâye sözleşmesi açılmaz | Spec Kit | 1 | relay, PLAN.md | hayır | doküman | 0-20 (şablon) |
| 66 | `converge` / `discovered-from`: bitiş bir beyan değil bir **fark hesabı**; kapanmayan madde yeni sözleşme taslağına, türeyen iş `from: T7` kenarına dönüşür | Spec Kit, beads | **2** | contract.js (`close`), denetim defteri | hayır | doküman | 40-70 |
| 67 | Sır taraması üretim hattına gömülü; kapatmak için **açık bayrak** gerekir (`--no-security-check`) | Repomix (Secretlint) | 1 | risk.js, kapı | hayır | doküman | 30-60 |
| 68 | Tek dosya + sabit ad + üzerine yazma; sürüm tutma, birikme olmasın | Repomix | 1 | map.js, handoff.js | hayır | doküman | 0-10 (kural) |
| 69 | Ters bağlantı tablosunu tek geçişte üretmek (`backlinks[hedef].push(kaynak)`) | Obsidian | 1 | map.js | hayır | doküman | 5-10 |
| 70 | Frontmatter'ı ayrı bir düzlem saymak: makinenin okuduğu alanlar başta YAML'de, nesir aşağıda; betik gövdeyi hiç okumaz | Obsidian | 1 | contract.js, rapor/görev paketleri | hayır | doküman | 20-40 |
| 71 | Yazmayı **isimle** hedeflemek (başlık, blok referansı, frontmatter anahtarı), satır numarasıyla değil | Obsidian | 1 | contract.js, log.js | hayır | doküman | 30-60 |
| 72 | Yetenek etiketleri (`ToolMarkerCanEdit`, `ToolMarkerSymbolicEdit`): eylemi **yolla değil yeteneğiyle** sınıflamak | Serena | 1 | risk.js, contract.js | hayır | kod | 30-50 |
| 73 | Tek yazma kapısı; yeni yazan yüzey eklenirse aynı tek noktadan geçme kuralı korunmalı (Serena'nın `read_only` hatasından ders) | Serena | 1 | contract.js/kapı | hayır | kod | 0 (kural) |
| 74 | Statik aranabilir karar sitesi (`log4brains build`) | log4brains | 1 | denetim defteri | hayır | doküman | — (52 MB Next.js ağacı; çalınabilir olan site değil, onu besleyen indeks) |

**Toplam: 74 fikir. 18'i birden fazla projede bağımsız olarak görüldü** (## 1, 2, 3, 5,
6, 7, 8, 10, 11, 16, 17, 18, 32, 43, 45, 46, 54, 66).

**Altın kuralı ihlal eden: 1** (#53). **Koşullu ihlal (uygulama biçimine bağlı): 4**
(#3, #45, #57, #63).

### Rapor boş bırakan başlıklar

Hiçbir rapor "Çalınabilir fikir" başlığını boş bırakmadı. `_SABLON.md` doğal olarak
boştur (şablondur, aday değildir).

---

## 2. Organ organ eşleştirme

### `map.js` — import haritası
**Dokunan fikirler:** 1, 4, 5, 6, 28, 32, 33, 34, 35, 36, 37, 38, 39, 41, 68, 69.

**Bugünkü eksiği (raporlardan):**
- Çıktı **bütçesiz**: `## Edges` bölümü dosya sayısıyla doğrusal büyür, kırpma yok
  (`aider-repomap.md`). `map.md` bir bütün olarak okunuyor, ~10 KB ≈ 2.550 token
  (`graphify.md`).
- Sembol düzeyi yok: `contains`, `calls`, `method`, `inherits` kenarları hiç yok
  (`graphify.md` tablosu; `serena.md`; `aider-repomap.md`).
- `map.json` **koşulsuz eziliyor** — yarım bir tarama iyi bir haritayı sessizce
  küçültebilir (`graphify.md` #4). Şema sürümü yok (`aider-repomap.md` #4).
- `who` komutu `map.json` okunamazsa hata veriyor; "harita yoksa taze kur" düşüşü yok
  (`aider-repomap.md` #5).
- Hub'ları listeliyor ama **adlandırmıyor** (`graphify.md` #5). Kenar sırası kanonik
  değil (`graphify.md` #9).
- `obsidian.md` #1 "Core'da ters bağlantı tablosu hiç yok" diyor. **Çelişki:** `map.js`
  her düğümde `from[]` tutuyor ve `who` bunu basıyor. Raporun iddiası kodla uyuşmuyor;
  ikisi de burada yazılıdır.

**Core'un burada üstün olduğu:** `_map.head` ile git HEAD'ine mühürleme ve
`rev-list --count at..HEAD` ile "kaç commit bayat" ölçüsü — aider'ın mtime tazeliğinden
ve graphify'ın `built_at_commit`'inden daha anlamlı (`aider-repomap.md`, `graphify.md`).

### `contract.js` / kapı
**Dokunan fikirler:** 1 (hata varyantı), 7, 8, 9, 15, 20, 22, 26, 29, 30, 31, 40, 58,
59, 62, 64, 66, 70, 71, 73.

**Bugünkü eksiği:**
- **Sözleşmeler birbirini tanımıyor**: `blocked-by` alanı yok, "hangi sözleşme hazır?"
  sorusunun makine cevabı yok (`beads.md`, `openspec-taskmaster.md`).
- İki sözleşme **aynı dosyayı `owns`'una yazabilir** ve bunu kimse söylemez
  (`spec-kit.md` #2).
- Kimlik artan sayaç (`T1`, `T7`) — iki dalda çakışma riski (`beads.md` #1, `adr.md` #5).
- `## Acceptance` maddeleri ile `verify:` adımları arasında **kapsama eşlemesi yok**;
  `verify: []` kaçış kapısı denetlenmiyor (`spec-kit.md` #3).
- `complete()` kirli çalışma ağacını kontrol etmiyor (`semgrep-codeql.md` #4).
- `orphans()` `owns`'taki **her** dosya için `git grep` çalıştırıyor; daraltma yok
  (`semgrep-codeql.md` #6).
- `close --reason` kalan işi hiçbir yere kaydetmiyor (`spec-kit.md` #5);
  `## Checkpoint`'teki bloker kapanışta buharlaşıyor (`beads.md` #3).
- `## Acceptance` kapanışta hiçbir yere birleşmiyor — defter "ne oldu" der, "sistem
  artık ne yapıyor" demez (`openspec-taskmaster.md` #1).
- Sahiplenme örtük; açık `claim` adımı yok (`beads.md` #5).

**Core'un burada üstün olduğu:** taranan 16 adayın **tek gerçek kapısı**. `verify:`
adımları çalıştırılır ve çıkış koduna bakılır; risk `git diff --numstat`'tan hesaplanır;
yüksek riskte `headSha` + `diffHash` ile mühürlenmiş, kullanıldığında **tüketilen** bir
denetim kaydı istenir; durum makinesi yönlüdür, geri gitmez. `owns:` bir dosya listesidir
ve dizin reddedilir — "görev takibi"nden "yetki sınırı"na geçiş.

### `risk.js`
**Dokunan fikirler:** 2, 10, 11, 12, 13, 14, 16, 17, 18, 19, 21, 24, 25, 32, 62, 67, 72.

**Bugünkü eksiği:**
- `gitNumstat()` yalnız `--numstat`: **satır aralığı yok, dosya durumu (A/M/D/R) yok**,
  taban `HEAD` (merge-base değil) (`semgrep-codeql.md`, `git-native.md`).
- Sinyaller **statik**: yol deseni, dosya sayısı (>8), satır sayısı (>300). Dosyanın
  tarihçesi hiç sorulmuyor (`git-native.md`).
- `HIGH_PATHS` yedi regex, **JS sabitine gömülü**; her projenin hassas yolları farklıdır,
  Core'unkiler sabittir (`ast-grep.md` #3, `semgrep-codeql.md` #7).
- Tek birleştirme kipi: "herhangi biri eşleşirse". `all`/`any`/`not` ve `inside` yok —
  "`hooks/` altında **ve** test dosyası değil" kuralı bugün yazılamıyor (`ast-grep.md` #1).
- Sonuç ikili (`high`/`low`), **sıfır granülerlik** (`semgrep-codeql.md` #7).
- Eşikler (`DIFF_LIMIT`, `FILE_LIMIT`) ve yol regex'leri **örneksiz/testsiz**; bir regex
  sessizce genişlerse kimse fark etmez (`ast-grep.md` #2).
- Hassas *yol* biliniyor, hassas *içerik* aranmıyor (`repomix.md` #4).
- `stat === null` durumu sentinellerin yalnız yarısı (`semgrep-codeql.md` #3).

**Ölçülü uyarı:** `git-native.md` dokuz fikrin hepsi alınırsa dosyanın iki-üç katına
çıkacağını, bugün 96 satır ve tek sorumluluğu olduğunu yazıyor. Aynı rapor `-w` boşluk
filtresinin bu depoda hiçbir şeyi ayırt etmediğini ölçtü.

### Denetim defteri (`audits/ledger.jsonl`)
**Dokunan fikirler:** 3, 39, 40, 42, 43, 44, 46, 47, 52, 58, 61, 63, 66, 74.

**Bugünkü eksiği:**
- **Budama yok** — context-hogs `LEDGER_CAP` ile sınırlıyor. Aynı rapor bunun kanıt için
  tehlikeli olduğunu da yazıyor: "budama istatistik için doğru, kanıt için tehlikeli"
  (`baglam-enjeksiyonu.md` #4 ve ret gerekçesi — **iki yönlü değerlendirme aynı raporda**).
- Kararın **durumu ve yerine geçme bağı yok**: `DECISIONS.md`'de D11 "yapılmayan banner",
  D12 "emekliye ayrılan başlık çubuğu" aslında superseded/rejected kayıtlar ama durum
  yalnız başlık nesrinde yaşıyor (`adr.md`).
- İndeks üreten hiçbir şey yok; 599 satırlık `DECISIONS.md` yalnız `grep`'le taranıyor
  (`adr.md` #3).
- Sözleşme başına **gerçekleşen maliyet** yazılmıyor (`graphify.md` #10,
  `ccusage-ccstatusline.md` #4).
- Denetimin bayatlama ekseni tek: yapısal değişiklikle denetim geçerliliği ayrılmıyor
  (`graphify.md` #2). "Yarım kalanın eski damgasını da sil" kuralının ikinci yarısı yok
  (`graphify.md` #3).
- Model öz-değerlendirmesi (`--verification`) serbest metin; ayrık cetvel yok
  (`graphify.md` #8).

**Core'un burada üstün olduğu:** ledger satırını **model yazmaz, kapı yazar**;
`headSha` ve `diffHash` `seal.js` içinde hesaplanır, dışarıdan verilemez
(`audit()`: "headSha and diffHash were computed here, not supplied"). ADR araçlarının
hiçbirinde, beads'te, Taskmaster'da böyle bir mühür yok (`adr.md`, `mem0.md`).

### `relay` (ajan dağıtımı, `tiers.json`)
**Dokunan fikirler:** 9, 21, 27, 29, 30, 31, 54, 55, 56, 57, 65.

**Bugünkü eksiği:**
- `live/_tally.json` yalnız **sayıyor**; yumuşatılmış skor (EMA), `minSamples` ve
  `dryRun` yok. `autoEffortCap` `minSamples`'ın kuzeni (`claude-flow.md` #3).
- Rol dosyalarında "yerli araç ne zaman yanlış" sınır cümlesi yok; karşılığı olan
  "tek dosya, tasarım kararı yok → relay kurma" satırı **rol dosyasının başında değil,
  skill'in ortasında** (`claude-flow.md` #4).
- "İki yazıcı bir checkout'u paylaşır" uyarısı bir cümle; `git log --all` ile kanıta
  bağlanmıyor (`git-native.md` #5).
- Faz iskeleti (temel bitmeden hikâye açılmaz) yok (`spec-kit.md` #4).

**Core'un burada üstün olduğu:** rol çözümü **deterministik ve sıfır token** —
`contract.js tier --role builder --id T7`, `tiers.json` satır×profil hücresi; Ruflo'da
aynı karar bir sınıflandırıcıya devredilmiş ve her turda ödeniyor. Core'da ayrıca
**tavan**, **tavan muafiyeti** ve "sinyaller yalnız yukarı iter, profil tavanı keser"
kuralı var; Ruflo'da bir yönlendirme kararının üst sınırı yok (`claude-flow.md`).

### `log.js` — hata günlüğü
**Dokunan fikirler:** 23, 28, 43, 71.

**Bugünkü eksiği:**
- Bir `BUG-` kaydı, sonradan gerçek sebebin başka olduğu anlaşıldığında **düzeltilmiyor,
  tarihçesi bozuluyor**; `superseded-by` alanı yok (`mem0.md` #1).
- `_issues.log` serbest metin; parmak izi olmadığı için "bu sorun tekrar etti"
  ölçülemiyor (`semgrep-codeql.md` #8).

**Core'un burada üstün olduğu:** `log.js` formatı zaten mini bir durum makinesi
(`**State:** open` → `close` siler → `archive` durumu `closed` yapıp taşır). `adr.md`'nin
tespiti: **"durumlu kayıt" deseni Core'da bir kez yazılmış, ama yalnız hatalara
uygulanmış.** Ayrıca slug tabanlı adlandırma numara çakışması tuzağına düşmüyor.

### `statusline.js` / `MessageDisplay` bandı
**Dokunan fikirler:** 2, 3, 4, 49, 50, 51.

**Bugünkü eksiği:**
- `build(input)` stdin JSON'ını alıyor ama **yalnız `input.workspace.current_dir`
  kullanıyor**. `model`, `cost`, `context_window`, `rate_limits` alanlarına hiç bakmıyor —
  "Claude Code bedava veriyor, Core almıyor" (`ccusage-ccstatusline.md`).
- Bağlam doluluğu gösterilmiyor; formül on satır ve raporda tam yazılı:
  `(input + cache_creation + cache_read) / context_window_size`, `output_tokens` **dahil
  değil**. Autocompact eşiği `× 0.8`.
- Core hiçbir yerde çıktısının kaç token ettiğini ölçmüyor — ne `map.md`, ne sözleşme
  dosyaları, ne handoff (`repomix.md`).

**Core'un burada üstün olduğu:** bant zaten `systemMessage` mantığıyla çalışıyor
(ekrana, modele değil) ve Core hiçbir yere ağa çıkmıyor — ccusage LiteLLM ve models.dev'e,
ccstatusline anthropic.com'a çıkıyor. Ayrıca Claude Code'da **tek `statusLine` komut
yuvası** var; ikisi aynı anda işgal edemez.

### `doctor.js`
**Dokunan fikirler:** 24, 41.

**Bugünkü eksiği:**
- `map` kontrolü var ama graphify'ın Adım 4.5'i gibi bir **grafik bütünlük teşhisi** yok:
  çözülemeyen import, kendine-import, `map.json`'da olup diskte olmayan dosya sayısı tek
  satırda basılabilir — asla durdurmadan (`graphify.md` #7).
- Opsiyonel dış araç dedektörü yok (`semgrep --version` varsa kat, yoksa devam)
  (`semgrep-codeql.md` #9).

---

## 3. Yakınsayan bulgular

Birden fazla **bağımsız** projede aynı şekilde çıkan gözlemler:

| # | Gözlem | Hangi raporlarda |
|---|---|---|
| A | **Kapılar çalıştırmayla değil model yönergesiyle zorlanıyor.** Durum bir alandır, yazılır ve olur; hiçbir şey koşulmaz | `spec-kit.md` (`/analyze` "çözmenizi **öneririm**"; `- [x]`'i işi yapan ajan koyar), `openspec-taskmaster.md` (`set_task_status` bir alan yazar; OpenSpec arşivi eksik görevde **bloke etmez, uyarır**), `beads.md` (`in_progress`→`done` için bir şey kanıtlamak gerekmez), `claude-flow.md` ("Never allow two writers in one worktree" üretilen CLAUDE.md'de bir **öğüt**), `ast-grep.md` (kural uyarı üretir, hiçbir şeyi durdurmaz), `serena.md` (`read_only` bayrağı 1.7'ye kadar bazı araç kümelerinde **uygulanmamış**) |
| B | **MCP taşıyıcısı sıradan turda pasif şema vergisi yazar** — araç hiç çağrılmasa da | `obsidian.md` (14 araç, 8-12k token, tahmin), `serena.md` (~28 araç, 4-10k, tahmin), `openspec-taskmaster.md` (7 çekirdek araç, 1.5-3k, tahmin), `repomix.md` (4 araç, 800-1800, tahmin), `claude-flow.md` (358 araç tanımı, **270.118 bayt ölçüldü** ≈ 67.500 token tahmin) |
| C | **Oturum açılışında yönerge/preamble enjeksiyonu** ikinci sabit kalem | `beads.md` (`bd prime` **~1-2k**, üstüne CLAUDE.md çakışmasından oturum başına ~300 token boşa), `claude-flow.md` (üretilen CLAUDE.md **7.742 bayt ≈ 1.900 token ölçüldü** + her istemde 250-500'lük route raporu), `openspec-taskmaster.md` (init bloğu 200-600, tahmin), `serena.md` (`initial_instructions`), `baglam-enjeksiyonu.md` (claude-mem: son 10 oturum + 50 gözlem ≈ 2.500-3.000, tahmin) |
| D | **Değerli olan kısım tree-sitter/AST'ye bağlı; sıfır bağımlılıkla alınamaz.** Eşik tam olarak `imports` ile `calls` arasında: import regex'le alınır, çağrı alınmaz | `aider-repomap.md`, `ast-grep.md`, `graphify.md` (ilişki tablosu satır satır), `repomix.md` (`--compress`), `semgrep-codeql.md` |
| E | **Durum düz dosyada mı, veritabanında mı — otorite kayması eleştirisi** | `beads.md` (otoritatif olan Dolt; `issues.jsonl` yalnız gölge), `openspec-taskmaster.md` (Taskmaster'da JSON otorite, markdown türetilmiş; OpenSpec'te tersi), `obsidian.md` (grafik IndexedDB'de, vault'un dışında, git'e girmez), `spec-kit.md` (durum **tümüyle markdown** — dört adayın Core'a en yakını) |
| F | **Çıktı bütçesi ve dürüst kırpma**: sınırsız çıktı yerine tavan + ne kadarının kesildiğinin söylenmesi | `graphify.md` (`[!] TRUNCATED: showing 28 of 28 nodes (~2000-token budget)`), `repomix.md` (`--token-budget` aşılınca **hata**), `obsidian.md` (1000 kayıt tavanı + imleçli sayfalama), `aider-repomap.md` (ikili arama + `ok_err=0.15`) |
| G | **Diff'i daraltmak ucuz ve büyük kazanç**: tam diff yerine `--numstat` / `--name-status` / hunk aralığı | `git-native.md` (**ölçüldü: 32.584 bayt → 542 bayt, 60 kat**; "`risk.js`'in bugün `--numstat` seçmesi doğru seçim"), `semgrep-codeql.md` (Semgrep baseline'ı yalnız bulgu çıkan dosyalarda koşar; CodeQL `restrictAlertsTo` ile aralığı **kuralın içine veri olarak** enjekte eder) |
| H | **Artan sayaçlı kimlik iki dalda çakışır** | `beads.md` (hash tabanlı `bd-a3f8`), `adr.md` (log4brains numaralandırmayı **bilerek zorunlu tutmuyor**, birleşme çakışmasını azaltmak için) |
| I | **Bağımlılık grafiği ve "hazır iş" hesabı Core'da yok** | `beads.md` (`blocked-by` + `bd ready`), `openspec-taskmaster.md` (`dependencies` + `next_task`), `spec-kit.md` (`[P]` işareti dosya ayrıklığından türer) |
| J | **Ağırlık, Core'un sıfır bağımlılık duruşuyla çelişiyor** | `adr.md` (52 MB `@log4brains/web`), `claude-flow.md` (26 bağımlılık, 14,2 MB), `semgrep-codeql.md` (47-67 MB / 400 MB-1,7 GB), `serena.md` (~34 Python bağımlılığı), `repomix.md` (28 çalışma zamanı bağımlılığı), `graphify.md` (22 tree-sitter grameri + networkx/numpy), `mem0.md` (LLM + embedding + vektör deposu), `obsidian.md` (6 npm + community plugin + API anahtarı) |
| K | **Sahiplik (hangi ajan hangi dosyaya yazabilir) hiçbir adayda veri yapısında yok** | `claude-flow.md` (`swarm-state.json`'da sahiplik alanı yok), `openspec-taskmaster.md` ("iki araçta da bir görevin hangi dosyalara dokunacağı yazılı değildir"), `serena.md` ("`owns` listesi Serena'da karşılıksız") |

---

## 4. Core'un ölçülen üstünlükleri

Taramada karşılığı **bulunamayan** Core özellikleri, "bu yok" denen rapor referansıyla:

| Core özelliği | Nerede "bu yok" dendi |
|---|---|
| **Çalıştırılan kapı** — `verify:` adımlarının hepsi 0 dönmeli, çıkış koduna bakılır | `openspec-taskmaster.md`: "Bu üçlü içinde tek gerçek kapı Core'da." · `spec-kit.md`: "Spec Kit modele 'kontrol et' diyor, Core kabuğa 'çalıştır' diyor." · `claude-flow.md`: "Ruflo'da `contract.js complete`'in karşılığı yok." · `beads.md`: "beads'in grafiği daha zengin, Core'un kapısı daha sert." · `ast-grep.md`: "ast-grep'in eksiği tam olarak Core'un fazlası." · `ccusage-ccstatusline.md`: "İkisi de ölçer, hiçbir şeyi durdurmaz." |
| **Diff'ten hesaplanan risk** (hassas yol, >8 dosya, >300 satır) | `beads.md`, `claude-flow.md`, `openspec-taskmaster.md`, `spec-kit.md` — dördünde de karşılığı yok. `adr.md`: "ADR dünyasında ağırlık diye bir kavram yok, her kayıt eşit." |
| **`headSha` + `diffHash` mührü — betik hesaplar, dışarıdan verilemez** | `adr.md`: "ADR araçlarının hiçbirinde kaydın doğruluğunu bağlayan böyle bir mühür yok — metin ne derse odur." · `mem0.md`: "mem0'ın belleği bir modelin yargısıdır; Core'un defteri bir dosya digest'idir. Biri ikna edilebilir, diğeri edilemez." |
| **Kullanıldığında tüketilen denetim kaydı** | `claude-flow.md`, `spec-kit.md`, `beads.md`, `serena.md` — hiçbirinde yok |
| **`owns:` dosya listesi = yetki sınırı; dizin reddedilir** | `claude-flow.md`: "`swarm-state.json`'da sahiplik alanı yok." · `openspec-taskmaster.md`: "'görev takibi'nden 'yetki sınırı'na geçiştir ve iki adayda da karşılığı yok." · `serena.md`: "hangi ajanın hangi dosyaya dokunabileceği kavramı yok." |
| **Yönlü durum makinesi** (`open→active→submitted→done`, geri dönüş yok) | `openspec-taskmaster.md`: "Taskmaster'ın altı durumu serbestçe dolaşılabilir bir kümedir; Core'unki yönlüdür. Core burada daha sıkı." |
| **Sıradan turda 0 token** | `beads.md` ("Core 0, beads ~1-2k"), `claude-flow.md` ("Core'un sıradan turdaki karşılığı sıfır"), `openspec-taskmaster.md` ("Core 0; OpenSpec birkaç yüz; Taskmaster binler"), `obsidian.md`, `serena.md`, `repomix.md` |
| **`map.json`'ın git HEAD'ine mühürlenmesi + "kaç commit bayat"** | `aider-repomap.md`: "Aider'ın mtime tabanlı tazeliğinden daha ucuz ve daha anlamlı bir tazelik ölçüsü." · `graphify.md`: "graphify'ın `built_at_commit` alanı var ama 'kaç commit bayat' ölçüsü yok." |
| **Rol×profil deterministik tier çözümü + tavan + tavan muafiyeti** | `claude-flow.md`: "Core'un ek olarak sahip olduğu, Ruflo'da hiç olmayan şey tavan, tavan muafiyeti ve 'sinyaller yalnız yukarı iter' kuralı. Ruflo'da bir yönlendirme kararının üst sınırı yok." |
| **Ağa hiç çıkmama** | `ccusage-ccstatusline.md`: "Core bugün hiçbir yere çıkmıyor; bu bir özellik." |
| **Markdown otoritesi — git diff'te okunur, elle düzeltilir, ikili gerektirmez** | `beads.md`: "Core'un 'tek gerçek dosyadır' tercihi burada bilerek alınmış bir tavizdir, eksiklik değil." · `openspec-taskmaster.md`: "OpenSpec'te git diff'i anlamlıdır; Taskmaster'da yeniden sıralanmış bir nesne ağacıdır." |
| **Tek kapanış yolu (tek nokta)** | `serena.md`: "`contract.js complete` dışında kapanış yolu olmaması bu dersin zaten uygulanmış hâli." |
| **Çıktı depo boyuyla değil ilişki sayısıyla büyür** | `repomix.md`: "Repomix çıktısı deponun tam boyudur." |
| **Kanca susar; ölçüm deftere ve statusline'a gider** | `baglam-enjeksiyonu.md`: "Core'un altın kuralı ile context-hogs'un 'PostToolUse `{}` döner' dalı aynı kararın iki uygulaması." · `claude-flow.md`: "Core'un koordinasyonu diskte." |
| **`log.js`'in durumlu kayıt deseni** | `adr.md`: Core'da "durumlu kayıt" deseni bir kez yazılmış — ama yalnız hatalara uygulanmış (üstünlük ve eksik aynı cümlede) |

---

## 5. Core'un ölçülen eksikleri

### 5.1 Sıfır maliyetle yapılabilecekler

Adayların yaptığı, Core'un yapmadığı ve model/ağ/kalıcı süreç gerektirmeyenler:

| Eksik | Kaynak | Fikir # |
|---|---|---|
| Sözleşmeler arası `blocked-by` kenarı ve "hazır iş" sorgusu | `beads.md`, `openspec-taskmaster.md` | 7 |
| `owns` kümeleri kesişim denetimi (iki sözleşme aynı dosyayı sahiplenebiliyor) | `spec-kit.md` | 30 |
| `risk.js` diff'te A/M/D/R sınıfını görmüyor | `git-native.md`, `semgrep-codeql.md` | 16 |
| `risk.js` satır aralığı ve değişen fonksiyon adı bilmiyor (hunk başlığında bedava) | `git-native.md`, `semgrep-codeql.md` | 17 |
| Risk tabanı `HEAD`, `merge-base` değil — dalda biriken commit riskten kaçıyor | `git-native.md`, `semgrep-codeql.md` | 18 |
| Risk sinyallerinde tarihçe yok (oynaklık, son dokunma, birlikte-değişme) | `git-native.md` | 25, 26 |
| Risk kuralları koda gömülü, projeye taşınabilir değil | `ast-grep.md`, `semgrep-codeql.md` | 10 |
| Risk sonucu ikili; sayısal ağırlık/eşik toplamı yok | `semgrep-codeql.md`, `aider-repomap.md` | 11 |
| Risk eşiklerinin ve regex'lerinin testi yok | `ast-grep.md` | 13 |
| Diff'te sır/anahtar deseni aranmıyor (yalnız hassas *yol* biliniyor) | `repomix.md` | 67 |
| Çıktı bütçesi ve kırpma yok; `map.md` sınırsız büyüyor | `aider-repomap.md`, `graphify.md`, `Repomix`, `Obsidian` | 1 |
| Core hiçbir yerde çıktısının kaç token ettiğini ölçmüyor | `repomix.md`, `baglam-enjeksiyonu.md`, `ccusage-ccstatusline.md` | 2, 4 |
| `statusline.js` stdin'deki `model`/`cost`/`context_window`/`rate_limits` alanlarını hiç okumuyor | `ccusage-ccstatusline.md` | (formül raporda hazır) |
| Denetim defterinde budama/tavan yok | `baglam-enjeksiyonu.md` (aynı rapor bunun kanıt için tehlikeli olduğunu da yazıyor) | 52 |
| `DECISIONS.md`'de durum alanı, `supersedes` bağı ve indeks yok | `adr.md` | 43, 44, 45 |
| `log.js`'te `superseded-by` yok; bir kayıt yanlışlandığında tarihçe bozuluyor | `mem0.md` | 43 |
| `_issues.log` parmak izsiz — "bu sorun tekrar etti" ölçülemiyor | `semgrep-codeql.md` | 23 |
| `map.json` koşulsuz eziliyor (küçülme koruması yok), şema sürümü yok, okunamayınca `who` hata veriyor | `graphify.md`, `aider-repomap.md` | 36, 38, 37 |
| `done/` birikime dönüşmüyor; tarih öneki yok; kapanmayan kabul maddesi kayda geçmiyor | `openspec-taskmaster.md`, `spec-kit.md`, `beads.md` | 59, 60, 66 |
| `## Acceptance` ↔ `verify:` kapsama eşlemesi yok; `verify: []` kaçış kapısı denetlenmiyor | `spec-kit.md` | 64 |
| `complete()` kirli çalışma ağacını kontrol etmiyor | `semgrep-codeql.md` | 20 |
| `orphans()` her `owns` dosyası için `git grep` çalıştırıyor; daraltma yok | `semgrep-codeql.md` | 22 |
| Sözleşme kimliği artan sayaç — dal çakışmasına açık | `beads.md`, `adr.md` | 8 |
| `live/_tally.json` yalnız sayıyor; yumuşatma, `minSamples`, `dryRun` yok | `claude-flow.md` | 56 |
| `map.js` hub'ları listeliyor ama adlandırmıyor; kenar sırası kanonik değil | `graphify.md` | 34, 35 |
| `doctor.js`'te grafik bütünlük teşhisi yok | `graphify.md` | 41 |
| Denetimde ayrık güven cetveli yok (`--verification` serbest metin) | `graphify.md` | 42 |

### 5.2 Sıfır maliyetle **yapılamayacaklar**

Özünde model çağrısı, kalıcı süreç ya da derlenmiş bağımlılık gerektirenler:

| Yetenek | Neden sıfır maliyetle olmuyor | Kaynak |
|---|---|---|
| Sembol düzeyinde tanım/referans, `calls` / `method` / `inherits` kenarları | tree-sitter (ya da eşdeğer AST) şart; regex `calls`'ta çöker | `aider-repomap.md`, `graphify.md`, `ast-grep.md` |
| AST doğruluğunda arama ve **yapısal yeniden yazım** | Derlenmiş Rust ikilisi; platform başına dağıtım | `ast-grep.md` |
| Semantik ilişkiler: `conceptually_related_to`, `shares_data_with`, `rationale_for`, hyperedge | Tanımı gereği anlam gerektirir; graphify tablosunda "hayır" olarak işaretli | `graphify.md` |
| Olgu çıkarımı, embedding, benzerlikle getirme, LLM ile çelişki çözümü | Her `add()` en az iki model çağrısı, her `search()` bir embedding | `mem0.md` |
| LSP tabanlı sembol okuma/düzenleme | Dil sunucusu süreci + ısınma süresi + ~34 bağımlılık | `serena.md` |
| Arka planda dönen daemon işçiler (`audit: 1h`, `optimize: 30m`, `deepdive: 4h`) | Oturum boyunca dönen kalıcı süreç | `claude-flow.md` |
| PRD ayrıştırma ve karmaşıklık puanlaması | Aracın kendi model çağrıları → API anahtarı bağımlılığı | `openspec-taskmaster.md` |
| Dosyalar/prosedürler arası taint analizi | Semgrep'in ücretli motorunda; OSS taint yalnız dosya içi | `semgrep-codeql.md` |
| Özel depoda CodeQL veritabanı üretimi | **Lisans yasaklıyor**; tek muafiyet ücretli GitHub Advanced Security | `semgrep-codeql.md` |
| BM25 / alaka sıralı arama | `rg` satır sırası bilir, alaka sırası bilmez; Omnisearch eklentisi gerekir | `obsidian.md` |
| Aranabilir statik karar sitesi | 52 MB Next.js ağacı ve 28 bağımlılık; sıfır bağımlılık kuralının sonu | `adr.md` |
| ADR nesir gövdesi | Kaydın kendisi pahalı: MADR şablonu 50-90 satır ≈ 600-1000 token **üretim** | `adr.md` |
| Topluluk adlandırmanın anlamlı hâli | Deterministik hub adı bedava (fikir #34); anlamlı 2-5 kelimelik ad model ister | `graphify.md` |

---

## 6. Boş çıkanlar

"Çalınabilir fikir" sütunu **zayıf kalan** adaylar ve raporun verdiği neden. README'nin
"neden kurmanıza gerek yok" bölümüne malzeme:

| Aday | Neden zayıf (rapordan) |
|---|---|
| **Ruflo / claude-flow** | "Çalınacak fikirlerin dördü de aynı tek mekanizmanın parçaları ve o mekanizma Core'da zaten var." Şema bütçesi, katalog daraltma, ortam değişkeni önceliği — üçü de "modele ne anlatılacağını sınırla" diyor; Core sıradan turda sıfır yazdığı için **bütçelenecek bir şey yok**. Geriye APSC'nin `dryRun`'ı ve yumuşatılmış skoru kalıyor: `tiers.json`'a iki alan. Ayrıca sekiz topolojinin yedisi davranışı değiştirmeyen bir etiket |
| **Repomix** | "Çözdüğü dert Core'da yok." Tek dosyaya paketlemenin sebebi dosya sistemine erişemeyen bir sohbet penceresidir; Claude Code Read/Grep/Glob'a sahip. MCP kipi hem pasif şema vergisi hem sınırsız `tool_result` şişmesi getiriyor |
| **Obsidian MCP** | "Getirdiği asıl değer (grafik, backlink) MCP yüzeyine hiç çıkmıyor." Modele ulaşan şey listeleme/okuma/arama/yazmadan ibaret ve bunun büyük kısmı `rg` + `cat` ile zaten var. Rapor sayısal karşılaştırma yapıyor: pasif 8-12k token, çağrı başı ~800 — köprü, turda **ondan fazla** vault sorgusu yapılmadıkça `rg`'den pahalı |
| **mem0** | Mekanizmanın özü LLM çağrısı: her yazma iki model çağrısı, her okuma bir embedding. Modelsiz kalan tek şey "sinyal birleştirme" fikri. Üstelik "belleğin doğruluğu bir modelin yargısına emanet" — Core'un tüm mimarisi "modelin beyanına güvenme, diff'e bak" üzerine kurulu; bellek katmanı bu ilkeyi tersine çeviriyor |
| **Serena** | Dört fikrin biri **ders** (`read_only`'nin tek noktadan uygulanması — Core'da zaten uygulanmış), biri Core'da hâlihazırda var (`.claude/relay` = `.serena`). Geriye iki fikir kalıyor ve ikisi de LSP'siz uyarlama. Karşılığında 28 araç şeması + `initial_instructions` ve **sözleşme kapısını bilmeyen ikinci bir yazma yolu** geliyor |
| **ADR araç ailesi** | "Tetikleme anı Core'unkinden zayıf": her araçta kayıt **elle bir komutla** doğar, git kancası ya da CI tetiklemesi hiçbirinde yok. Core'un değerli tarafı tam tersi — `complete` kapısı kayıt yazmadan kapanmıyor. Ayrıca format eşleşmiyor (MADR bir seçenek karşılaştırma formatı) ve mühür yok |
| **aider repo map** | "Değerli olan kısım tree-sitter'a bağlı ve Core'un sıfır bağımlılık ilkesi bunu doğrudan yasaklıyor." Tree-sitter'sız yeniden yazılırsa geriye `map.js`'in zaten yaptığı regex taraması kalıyor; elde iki soyut fikir. Ayrıca haritayı **her isteğe yazması** altın kuralın tam karşıtı |
| **Spec Kit** | "Kapısı model yönergesiyle zorlanıyor; Core'a kazandıracağı katılık değil, ondan alacağı katılık var." Tek özellik için altı komut ve yarım düzine artefakt; her biri sonraki komutta yeniden bağlama okunuyor (çağrı başına tahmin 5-12k) |
| **OpenSpec** | Doğrulaması var ama arşivleme **eksik görevlerde bloke etmiyor, yalnız uyarıyor**; CI ya da git kancası yok. "Fikir olarak delta biçimi taşınabilir, araç olarak taşıyıcı gereksizdir" |
| **Taskmaster** | İki bağımsız sebep üst üste: MCP taşıyıcısı sıradan turda binlerce token, artı **depo dört aydan uzun süredir hareketsiz** (son push 2026-04-28) ve lisans NOASSERTION görünüyor. PRD ayrıştırma kendi model çağrılarını yapıyor |
| **CodeQL** | "Lisans kapıyı kapatıyor." Lisans metni açık kaynak olmayan depolarda veritabanı üretmeyi ve otomatik analizi birebir yasaklıyor; bir eklentinin kullanıcıyı lisans ihlaline sokması kabul edilemez. Ayrıca 400 MB-1,7 GB ve dakikalar süren derleme |
| **Semgrep** | "Gücü ücretli tarafta": OSS taint yalnız dosya içi, Core'un sorduğu soru tanımı gereği dosyalar arası. Severity dünyası ikiye bölünmüş; dış şemaya bağlanmanın bedeli var |
| **beads** | Fikirler taşınabilir, taşıyıcı taşınamaz: beads'i almak Core'un durumunu markdown'dan **Dolt**'a taşımak demek. `bd prime` + SessionStart kancası "mekanizma olarak bile alınamaz — Core'un tek ayırt edici vaadi o kancanın yazmadığı 1-2k token'dır" |
| **claude-mem** | Açılışta binlerce token yazıyor ve toplam bütçe tavanı dokümante değil |
| **ast-grep** *(kısmi)* | Araç olarak zayıf değil, ama beş fikrin **dördü ast-grep hiç kurulmadan** `risk.js` ve `contract.js` içinde uygulanabiliyor. Kurmayı gerektiren tek şey AST doğruluğu ve bunun kanıtlanmış bir ihtiyaç olarak günlüğe düşmesi gerekiyor |
| **graphify** *(kısmi)* | Fikir bakımından en zengin rapor (10 madde), ama "Core'a taşımak yeni bir yetenek açmıyor, yalnız mülkiyeti değiştiriyor" — zaten kullanıcı seviyesinde kurulu ve her oturumda erişilebilir. Sembol düzeyi ayrım yabancı kod tabanlarında değerli, Core'un kendi bakımında değil |
| **git'in kendisi** | Tek "boş çıkmayan ama fazla dolu" aday: dokuz fikrin hepsi alınırsa 96 satırlık `risk.js` iki-üç katına çıkar. Ayrıca ham churn yanıltıcı (en çok değişen iki dosya `README.md` 54 ve `README.tr.md` 52), genç depoda co-change 2-3 ile istatistik değil gürültü, `-w` filtresi bu depoda hiçbir şeyi ayırt etmedi |

---

## 7. README'ye aday cümleler

Her raporun kendi İngilizce tek cümlesi. Dil düzeltmeleri yapıldı; anlam değiştirilmedi.

1. **ADR araçları** — Core already writes a decision record the moment a contract closes,
   machine-sealed with the commit and diff it describes, so there is nothing to install
   and no command to remember.
2. **aider repo map** — Aider's repo map ranks a repository's symbols with tree-sitter and
   PageRank and injects the result into every model request; Core's `map.js` computes the
   same shape of dependency graph with zero dependencies and writes it to disk, where it
   costs nothing until you ask for it.
3. **ast-grep** — ast-grep is a compiled binary that gives you AST-accurate search and
   rewriting, which is genuinely better than regex — but Core is dependency-free Node, and
   the parts of ast-grep worth having are its rule grammar and its rule tests, both of
   which you can write yourself without installing anything.
4. **context-hogs / claude-mem** — Core's hooks stay silent by contract: every ordinary
   turn returns an empty object, and what gets measured goes to an append-only ledger and
   the status line — never to the model.
5. **beads** — You do not need to install this: Core already tracks work as gated markdown
   contracts whose status is verified by running your own commands rather than asserted in
   a database, and it does it without injecting a kilobyte of workflow preamble into every
   session.
6. **ccusage / ccstatusline** — You do not need to install either of these: Claude Code
   already hands the status line the context-window and cost figures they spend most of
   their code reconstructing from transcripts, and Core's status line is the one command
   slot you have — so the ten-line formula is worth taking, and the package is not.
7. **Ruflo / claude-flow** — Ruflo (formerly claude-flow) puts its coordination inside the
   model's context — 358 MCP tool schemas, a generated instruction file, and a routing
   report printed on every prompt — where Core keeps the same coordination on disk in
   contracts and agent records, so an ordinary turn costs nothing.
8. **git'in kendisi** — You do not need to install this, and you never could: git is
   already in the repository, and everything Core wants from it — diff size, file churn,
   changed line ranges, what historically changes alongside a file — comes back in under a
   tenth of a second from commands that write to a script variable rather than to the
   model's context.
9. **graphify** — You do not need graphify to work on Core: `map.js` answers the
   file-level questions this repository actually raises, in zero dependencies and zero
   tokens — reach for graphify when you are reading someone else's codebase at symbol
   level, not this one.
10. **mem0 / Letta** — You do not need to install this: Core keeps its memory as an
    append-only, hash-sealed ledger of closed contracts rather than as model-inferred facts
    in a vector store, so there is nothing to embed, no API key to hold, and nothing that
    can be forgotten by a wrong inference.
11. **Obsidian MCP** — An Obsidian vault is already a plain folder of markdown files, so
    `rg` reads it for zero passive tokens — and the link graph the bridge would justify
    itself with never crosses the MCP boundary anyway.
12. **OpenSpec / Taskmaster** — You do not need to install this: Core keeps the same
    spec-to-task discipline in one markdown contract whose acceptance is executed at close
    and whose status never reaches the model as tool definitions or a preamble, so an
    ordinary turn still costs zero tokens.
13. **Repomix** — Repomix exists to carry a whole repository into a chat window that cannot
    read files; Claude Code already reads files, and Core's job is to keep that reading
    small, so packing the repo into one context blob solves a problem you do not have.
14. **Semgrep / CodeQL** — You do not need to install these: CodeQL's licence forbids the
    private repositories most of this runs in, Semgrep's cross-file analysis is behind its
    paid engine, and the one idea that pays — restricting rules to the line ranges the diff
    actually touched — is a four-line git command Core can run itself.
15. **Serena** — Serena buys cheaper reads by paying a permanent per-session tax in tool
    schemas and by opening a second write path that never passes a contract gate; Core
    keeps reads cheap through targeted search and keeps every write behind one gate, so the
    trade is not one you need to make.
16. **GitHub Spec Kit** — You do not need to install this: Core turns intent into work
    through a single gated contract whose acceptance is executed rather than reviewed, so
    you get the discipline of a spec chain without carrying six markdown artifacts back
    into context at every step.

---

## Ek: raporlar arası çelişkiler ve tek taraflı sayılar

- **Ruflo araç sayısı:** `claude-flow.md` kaynakta **358** tanım buldu, web arayüzü
  "210 araç" diyor; fark doğrulanamadı, 358 üst sınır olarak yazıldı.
- **Ruflo kanca sayısı:** belgeler "27 kanca" diyor, varsayılan ayar dosyasında sayılan
  **11 komut, 6 olay**.
- **Ters bağlantı tablosu:** `obsidian.md` "Core'da hiç olmayan kısım: ters bağlantı
  tablosu" diyor; `map.js` her düğümde `from[]` tutuyor ve `who` bunu basıyor.
- **mem0 çelişki felsefesi:** kaynak kodda dört olaylı (`ADD/UPDATE/DELETE/NONE`) istem
  duruyor, güncel doküman "tek geçişli, yalnız-ADD, çelişki zamansal akıl yürütmeyle"
  diyor. İkisi de depoda mevcut; hangisinin varsayılan olduğu doğrulanmadı.
- **Defter budaması:** `baglam-enjeksiyonu.md` #4 budamayı çalınabilir fikir olarak
  yazıyor, aynı raporun ret gerekçesi "budama istatistik için doğru, kanıt için tehlikeli"
  diyor. İkisi de burada duruyor.
- **`bytes/token` oranı:** `claude-flow.md` 4 bayt/token ile ~67.500, 3,5 ile ~77.200
  veriyor; `graphify.md` ve `obsidian.md` 4 bayt/token kullanıyor. Hiçbiri gerçek
  tokenizer değil.
- **Bağlam penceresi paydası:** ccusage ve ccstatusline ikisi de bulunamayınca
  **200.000**'e düşüyor; rapor "model 1M bağlamlıysa yüzde beş kat yanlış çıkar" diyor.
