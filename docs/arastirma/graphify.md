# Graphify Ve Rakipleri: Kod Grafiği Araçları Gerçekte Ne Kazandırır

Tarih: 2026-10-21. Hiçbir araç kurulmadı ve çalıştırılmadı. Bilgiler kaynak koddan, README dosyalarından ve GitHub API'sinden okundu.

İlke: Tek seferlik maliyet sorun değil. Her turda ödenen her şey şüpheli.

## Kısa Hüküm

İnsanlar aptal değil, biz de değiliz. İki taraf farklı şeyleri ölçüyor.

Graphify'ın yıldızı görsel bir harita, kolay kurulum ve "71.5x" manşeti için verildi. Bu manşetteki ölçümün karşılaştırma tabanı, tüm kod tabanını okumak. Hiçbir ajan böyle çalışmıyor.

Grep+Read ile çalışan bir ajana karşı bağımsız bir ölçüm yok. Kullanıcıların yaptığı iki ölçüm ya başa baş çıkmış ya da Graphify aleyhine (aşağıda).

Yine de VidShrink'te bir yer var: katmanlar arası çok adımlı sorular ve refactor öncesi etki analizi. Burada denemeye değer. Ama `graphify install` ile değil, çağrıldığında çalışan bir komutla denenmeli.

## Proje Envanteri (git ls-files)

| Proje | Kod dosyası | Dil | Not |
|---|---|---|---|
| VidShrink | 1043 `.cs` + 72 `.axaml` | C# / Avalonia | ~291 bin satır C#. 510 dosya `tests/`, ~470 üretim dosyası (App 255, Core 157, Ffmpeg 32). Ayrıca 862 `.md` var, 587'si `docs/` altında |
| DustyBytes | 328 `.cs` | C# / Avalonia | |
| CodeXray | 241 `.ts` + 41 `.tsx` | TypeScript | |
| Quizloop | 155 `.ts` + 45 `.tsx` | TypeScript | 172 `.md` |
| Runly | 153 `.cs` | C# | |

İki dilin ikisi de Graphify'da ve rakiplerinde tree-sitter (kaynak kodu sözdizimi ağacına çeviren ayrıştırıcı kütüphane) ile destekleniyor.

Graphify'ın C# için ayrıca `csharp_dispatch.py` ve `interface_dispatch.py` dosyaları var. Yani arayüz üzerinden yapılan çağrıları çözmeye çalışıyor. Bunun DI (bağımlılık enjeksiyonu) yoğun kodda ne kadar isabetli olduğu ölçülmedi.

## 1. Graphify

- Depo: [Graphify-Labs/graphify](https://github.com/Graphify-Labs/graphify). Eski adresi `safishamsi/graphify` buraya yönleniyor.
- Durum: **130.740 yıldız**, 12.569 fork, **1.570 açık issue**. Depo 2026-04-03'te açılmış, son push 2026-10-20. Varsayılan dal `v8`.

### Ne Yapıyor

Kodu, dokümanları, PDF'leri ve görselleri tek bir bilgi grafiğine çeviriyor. Ajan bu grafiği komut satırından sorguluyor.

### İndeksleme

- **Kod:** tree-sitter AST ile işleniyor; **LLM kullanılmıyor**, yani ücretsiz. Dosyalar arası `calls`, `imports` ve `inherits` kenarları çözülüyor. README ~40 dil olduğunu söylüyor.
- **Doküman, PDF ve görsel:** Asistanın modeliyle ya da bir API ile anlamsal geçişten geçiyor. **Bu kısım LLM maliyeti doğuruyor.**
- **Kümeleme:** Leiden algoritmasıyla topluluklar çıkarılıyor.
- **Kenar etiketleri:** Her kenar `EXTRACTED` ya da `INFERRED` olarak işaretleniyor.
- **Önbellek:** SHA256 anahtarlı. `graphify update .` yalnızca AST'yi yeniden kuruyor ve API maliyeti yok.
- **Git hook'ları:** `graphify hook install` post-commit, post-checkout, post-merge ve post-rewrite hook'ları yazıyor. Bunlar grafiği arka planda yeniden kuruyor. Kaynak: [hooks.py](https://github.com/Graphify-Labs/graphify/blob/v8/graphify/hooks.py). Bu hook'lar modele hiçbir şey göndermiyor.

### Depolama

Çıktılar `graphify-out/` altında:

- `graph.json`
- `GRAPH_REPORT.md`
- `graph.html`: vis.js ile etkileşimli görünüm
- isteğe bağlı `wiki/`

### Sorgu Anında Modele Ne Gidiyor

- `graphify query "<soru>"`: Soruya göre seçilen alt grafiği `NODE`/`EDGE` satırları olarak basıyor. `--budget` varsayılanı 2000 token.
- `graphify explain "<düğüm>"`: Düğümün en fazla 20 bağlantısını gösteriyor.
- `graphify path A B`: İki düğüm arasındaki en kısa yolu gösteriyor.
- Kaynak: [cli.py](https://github.com/Graphify-Labs/graphify/blob/v8/graphify/cli.py).

### Token Maliyeti Nerede Oluşuyor

**Tek seferlik:**

- AST taraması ücretsiz.
- Doküman geçişi LLM kullanıyor. VidShrink'teki 862 `.md` dosyası dahil edilirse ciddi bir tek seferlik fatura çıkar.

**Her turda** (`graphify install` ve `graphify claude install` sonrası; kaynak: [install.py](https://github.com/Graphify-Labs/graphify/blob/v8/graphify/install.py)):

1. **CLAUDE.md'ye kalıcı bölüm.** Proje CLAUDE.md'sine `## graphify` bölümü yazılıyor ([always_on/claude-md.md](https://github.com/Graphify-Labs/graphify/blob/v8/graphify/always_on/claude-md.md)). Bölüm yaklaşık 190 kelime, kabaca 250–300 token. Her turda bağlamda duruyor.
2. **Skill açıklaması.** Skill listesinde her turda görünüyor. Küçük bir maliyet.
3. **PreToolUse hook'ları.** `Bash|Grep` ve `Read|Glob` çağrılarında `graphify hook-guard` çalışıyor. Grafik varsa modele `additionalContext` enjekte ediyor. Metin şöyle başlıyor: "MANDATORY: graphify-out/graph.json exists. You MUST run `graphify query`…". Ardından en fazla 5 eşleşen düğüm ekleniyor.
   - Oturum başına en fazla 5 dürtme var (`GRAPHIFY_HOOK_NUDGE_CAP`).
   - Strict modda ilk ham `Read` oturum başına bir kez reddediliyor.
   - **Asıl dolaylı maliyet şu:** Dürtme, modeli her biri yaklaşık 2K token tutan `query` çağrılarına yöneltiyor.

### İddia Edilen Tasarruf ve Mekanizması

**"71.5x fewer tokens per query".** Ölçüm 52 dosyalık karışık bir korpusta yapılmış (Karpathy depoları, 5 makale, 4 görsel).

[benchmark.py](https://github.com/Graphify-Labs/graphify/blob/main/graphify/benchmark.py) okununca hesap şöyle çıkıyor:

- **Taban:** Korpusun tamamının token sayısı. Kelime sayısı verilmezse `düğüm sayısı × 50 kelime` diye tahmin ediliyor.
- **Sorgu tarafı:** Alt grafik metninin `karakter / 4` değeri.
- **Sorular:** Beş sabit soru, örneğin "how does authentication work".

Yani karşılaştırılan şey "tüm depoyu bağlama yığmak" ile "bir alt grafik". Grep ile hedefli okuma yapan bir ajanla karşılaştırma yapılmıyor.

Aynı README küçük korpuslarda kazancın 5.4x (4 dosya) ve ~1x (6 dosya, httpx) olduğunu kendisi yazıyor.

**[BENCHMARKS.md](https://github.com/Graphify-Labs/graphify/blob/v8/BENCHMARKS.md)** daha dürüst bir kod testi içeriyor:

- ERPNext (~1M satır) üzerinde grep/read/list ajanına karşı key-fact kapsamı %82.0'a karşı %70.8.
- Ancak **yalnızca 6 soru** var.
- Graphify tarafının token değeri ~140K/sorgu. **Grep tarafının token sayısı verilmemiş.** Yani bu test tasarruf değil, isabet iddiası.
- Testi yazarlar kendi koşturmuş. Bağımsız bir tekrarı yok.

### Bağımsız Ölçüm

[Issue #985](https://github.com/Graphify-Labs/graphify/issues/985) hâlâ açık ve maintainer yanıt vermemiş:

- **1.484 dosyalık korpus:** "Claude Code tek başına benzer sonucu aynı ya da daha az tokenla veriyor". Her `query` çağrısı ~2K token tutuyor, bir iş akışında toplam 8K+ token.
- **Büyük .NET monoreposu, aynı model ve aynı görev:** Graphify MCP taban çizgisinden **1.6–1.9x daha pahalı** çıkmış. Cevaplar "daha zayıf, kısmi" bulunmuş. İndeksleme o kadar büyük gelmiş ki kapsam 6 projeye indirilmiş.
- Contributor'lardan biri bulguyu yeniden üretmek istediğini söylemiş. Ekim'de MCP araçlarında düzeltmeler gelmiş.

Bu bulgular anekdot düzeyinde. Ama kendi testini yapan iki bağımsız kullanıcının ikisi de tasarruf bulamamış. .NET örneği VidShrink'e en yakın durum.

## 2. GitNexus

- Depo: [abhigyanpatwari/GitNexus](https://github.com/abhigyanpatwari/GitNexus). **47.984 yıldız**, son push 2026-10-21, TypeScript.
- **Lisans: PolyForm Noncommercial.** Ticari kullanımda dikkat gerekiyor.

**Mekanizma:**

- tree-sitter ile ayrıştırma, LadybugDB grafik veritabanı, Leiden kümeleme, BM25 tam metin araması.
- İsteğe bağlı embedding (`--embeddings`).
- Veri `<repo>/.gitnexus/` altında tutuluyor.
- MCP üzerinden **19 araç** sunuyor: `query`, `context`, `impact`, `trace`, `rename`, `cypher` vb.

**Her turda maliyet:**

- `setup`, Claude Code'a PreToolUse ve PostToolUse hook'ları yazıyor. Aramaları grafik bağlamıyla zenginleştiriyor.
- `analyze`, AGENTS.md ve CLAUDE.md'ye kalıcı bir bölüm yazıyor. `--skip-agents-md` ile kapatılabiliyor.
- 19 MCP aracı ve skill'ler de ekleniyor.

**Tasarruf:** Sayısal bir token iddiası yok. Yalnızca "10 sorgu yerine tek çağrı" gibi niteliksel bir iddia var.

**Güçlü yanı:** `impact` (değişikliğin etki alanı) ve `rename` önizlemesi refactor işine doğrudan hizmet ediyor.

## 3. codebase-memory-mcp

- Depo: [DeusData/codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp). **47.071 yıldız**, son push 2026-10-21, C dilinde tek statik binary.

**Mekanizma:**

- Binary'ye gömülü tree-sitter gramerleri.
- Bellekte SQLite, sonuç `~/.cache/codebase-memory-mcp/` altına yazılıyor.
- **17 MCP aracı:** `search_graph`, `trace_path`, `detect_changes`, `get_code_snippet`, `get_architecture` vb.

**Her turda maliyet:** Kurulum epey ağır.

- `~/.claude.json` dosyasına MCP kaydı.
- Talimatlar, bir skill ve 3 ajan.
- **SessionStart, SubagentStart ve PreToolUse (Grep/Glob/Bash) hook'ları.** Bunlar engellemiyor, `additionalContext` enjekte ediyor.

**Tasarruf iddiası:**

- Kendi preprint'leri: 31 depoda "dosya dosya keşfe göre 10x daha az token, 2.1x daha az araç çağrısı".
- Eski bir 5 sorguluk ölçüm: ~3.400'e karşı ~412.000 token.
- Taban çizgisi yine "dosya dosya okumak". Bağımsız bir doğrulama yok.
- README tasarrufun yalnızca belirli kapsamda geçerli olduğunu kendisi söylüyor ve "kendi iş yükünüzü ölçün" diye bir rehber veriyor. Bu dürüst bir tavır.

## 4. Serena

- Depo: [oraios/serena](https://github.com/oraios/serena). **30.543 yıldız**, son push 2026-10-20, Python.

**Mekanizma:**

- Grafik kurmuyor. **LSP (dil sunucusu protokolü, IDE'lerin "tanıma git" ve "referansları bul" özelliklerinin altındaki altyapı)** kullanıyor.
- Yani tree-sitter tahmini değil, derleyici düzeyinde sembol çözümü yapıyor.
- Araçları:
  - Bulma: `find_symbol`, `find_referencing_symbols`, `get_symbols_overview`
  - Düzenleme: `replace_symbol_body`, `insert_after_symbol`, `rename`

**Her turda maliyet:**

- MCP araç tanımları ve başlangıç talimatları.
- Bellek dosyaları isteğe bağlı.
- Claude Code içinde temel dosya ve kabuk araçları varsayılan olarak kapalı geliyor. Yani çakışan araçlar elenmiş.

**Tasarruf:** "Çok daha token verimli" deniyor ama sayı verilmiyor. Değerlendirme ~20 rutin görev ve niteliksel geri bildirimden oluşuyor.

**C# için anlamı:** Roslyn tabanlı bir dil sunucusuyla referans bulma isabeti tree-sitter grafiğinden yüksek olur. Özellikle arayüz, DI ve partial class'larda fark eder.

## 5. Repomix

- Depo: [yamadashy/repomix](https://github.com/yamadashy/repomix). **28.944 yıldız**, son push 2026-10-18.

**Mekanizma:**

- Depoyu tek bir XML ya da Markdown dosyasına paketliyor. Secretlint ile gizli bilgi taraması yapıyor.
- `--compress` seçeneği tree-sitter ile yalnızca imzaları bırakıp gövdeleri atıyor. Bu seçenek deneysel.
- MCP araçları: `pack_codebase`, `grep_repomix_output`, `read_repomix_output`.

**Maliyet:**

- Paket bağlama yığılırsa çok büyük bir tek seferlik maliyet çıkar. VidShrink'te imkânsıza yakın.
- MCP ile kullanılırsa araç tanımları her turda yer kaplar.

**Tasarruf:** `--compress` için "~70%" deniyor, yöntem yok. Ayrıca karşılaştırma ham paketle yapılıyor, ajanla değil.

**Gerçek kullanım alanı:** Başka bir modele ya da sohbete bir defalık bağlam vermek. Ajanlı çalışma için tasarlanmamış.

## 6. Aider Repo Map (Kıyas İçin)

- [aider.chat/docs/repomap](https://aider.chat/docs/repomap.html). Depo [Aider-AI/aider](https://github.com/Aider-AI/aider): **49.679 yıldız**. Son push 2026-05-22, yani yavaşlamış.

**Mekanizma:**

- tree-sitter etiketleri çıkarılıyor. Dosyalar düğüm, bağımlılıklar kenar oluyor. Bir grafik sıralama algoritmasıyla en önemli imzalar seçiliyor.
- `--map-tokens` varsayılanı 1K.

**Maliyet:** Harita **her istekle birlikte gönderiliyor**. Bu, ilkemizin tam olarak şüphelendiği türden bir her tur maliyeti. Dosya eklenmemişse bütçe 1K'yı aşabiliyor.

Bu sınıfın en eski fikri bu. Claude Code bunun yerine isteğe bağlı aramayı seçti.

## (Ek) claude-context

- Depo: [zilliztech/claude-context](https://github.com/zilliztech/claude-context). 12.632 yıldız, son push 2026-07-14.

**Mekanizma:**

- AST ile parçalama.
- Embedding: OpenAI, Voyage, Ollama ya da Gemini.
- Vektör veritabanı: Milvus ya da Zilliz Cloud.
- Hibrit arama (BM25 + vektör). 4 MCP aracı var.

**Tasarruf:** "Aynı isabette ~40% token düşüşü" deniyor.

**Dezavantaj:** Kod parçaları dışarıdaki bir embedding servisine gidiyor, ayrıca bulut veritabanı bağımlılığı var. Kişisel projeler için gereksiz bir dış bağımlılık.

## Karşılaştırma Tablosu

| Araç | Yıldız | Son push | Kalıcı katman | Her turda yük (önerilen kurulumla) | Bağımsız ölçüm |
|---|---|---|---|---|---|
| Graphify | 130.7K | 2026-10-20 | tree-sitter grafik + LLM doküman geçişi | CLAUDE.md bölümü (~250–300 tok) + skill açıklaması + Grep/Read hook dürtmesi | Yok. Kullanıcı testleri başa baş ya da aleyhte |
| Aider repo-map | 49.7K | 2026-05-22 | tree-sitter + sıralama | **Her istekte ~1K tok harita** | Yok |
| GitNexus | 48.0K | 2026-10-21 | tree-sitter + grafik DB (+embedding) | CLAUDE.md/AGENTS.md + 19 MCP aracı + Pre/Post hook | Yok, sayısal iddia da yok |
| codebase-memory-mcp | 47.1K | 2026-10-21 | tree-sitter + SQLite | 17 MCP aracı + SessionStart/PreToolUse hook + skill | Yalnızca kendi preprint'i |
| Serena | 30.5K | 2026-10-20 | LSP (indeks yok) | MCP araçları + talimat | Yok |
| Repomix | 28.9K | 2026-10-18 | Yok (tek seferlik paket) | MCP kullanılırsa araç tanımları | Yok |
| claude-context | 12.6K | 2026-07-14 | Embedding + vektör DB | 4 MCP aracı | Yok |

Not: Bu Claude Code sürümünde MCP araç şemaları ertelenmiş geliyor (ToolSearch ile yükleniyor). Bu yüzden her turda yalnızca araç adları yer kaplıyor. Ama sunucu talimatları ("MCP Server Instructions") her turda tam metin olarak bağlamda duruyor. Hook'lar ve CLAUDE.md bölümleri de her turda yer kaplıyor.

## Yıldız Neyi Ölçer, Neyi Ölçmez

**Ölçtükleri:**

- **Merak ve demo etkisi.** `graph.html` ekran görüntüsü alınacak kadar çarpıcı bir görsel.
- **Manşet sayı.** "71.5x" kolay paylaşılıyor.
- **Platform genişliği.** 20 topic var: Claude Code, Codex, Cursor, Gemini vb. Her ekosistemin listesine giriyor.
- **Kurulum kolaylığı.** Tek komutla kuruluyor.

Graphify 6.5 ayda 130K yıldıza ulaştı. Bu hız, kullanım değil viral yayılma göstergesi.

**Ölçmedikleri:**

- Grep ajanına karşı net token kazancı.
- Görev başarısı.
- Yıldız verenlerin aracı bir ay sonra hâlâ kullanıp kullanmadığı.

1.570 açık issue ve maintainer'ın yanıt vermediği "#985 Claude Code tek başına yetiyor" başlığı, yıldız ile memnuniyetin ayrı şeyler olduğunu gösteriyor.

Claude Code ekibinin kendi deneyimi de var. Boris Cherny'ye göre erken sürümde yerel vektör RAG denendi, ajanlı arama daha iyi çıktı ([OfficeChai](https://officechai.com/ai/claude-researcher-explains-how-agentic-search-performed-better-than-rag-for-code-generation/)). Ama bu kendi ifadesiyle de çoğunlukla izlenime dayalı. Kesin bir kanıt değil.

## Hangi Durumda Gerçekten Kazandırır

**Kazandırdığı yer: çok adımlı yapısal sorular.**

- Örnekler: "Bu ayar UI'dan FFmpeg argümanına kadar hangi katmanlardan geçiyor?", "X arayüzünü değiştirirsem kim kırılır?", "A ile B arasındaki yol ne?"
- Grep ajanı bunun için 6–15 arama ve okuma zinciri kurar. Grafik bunu tek çağrıda verir.
- Proje ne kadar büyük ve katmanlıysa fark o kadar büyür. Kabaca 400–500+ üretim dosyası ve 3+ katman gerekir. VidShrink bu sınırın içinde.

**Refactor öncesi etki analizi.**

- Fayda var, ama burada asıl doğru araç LSP: Serena ya da IDE'nin Roslyn'i.
- tree-sitter grafiği, DI ve arayüz üzerinden yapılan çağrılarda kenarları kaçırabilir ya da `INFERRED` olarak tahmin eder.
- Tahmine dayalı bir etki listesi refactor'da tehlikeli.

**Kazandırmadığı yer: tam metin arama.**

- Örnekler: hata mesajı, ayar anahtarı, TODO, bayrak adı.
- Burada grep yenilmez. Grafik yalnızca araya ekstra bir adım sokar.

**Kazandırmadığı yer: küçük ve orta projeler (100–330 dosya).**

- Quizloop, Runly, CodeXray ve DustyBytes bu grupta.
- Explore ajanı 2–4 çağrıda doğru dosyaya varır. Grafik sorgusu ~2K token tutar ve ardından yine dosya okumak gerekir.
- Graphify'ın kendi tablosu da 6 dosyada ~1x diyor.

**Kazandırmadığı yer: tek dosyalık değişiklik ve tanıdık depo.**

- Model zaten nereye bakacağını biliyorsa grafik saf ek yük.

**Ters etki yaptığı yer: kalıcı kurulum.**

- CLAUDE.md bölümü ve hook dürtmesi her turda yük bindirir.
- Hook'un "MANDATORY / You MUST" dili, gerekmeyen sorularda bile modeli `query` çağırmaya iter.
- .NET monoreposunda ölçülen 1.6–1.9x pahalılığın büyük olasılıkla kaynağı bu.

## VidShrink'te Denemeye Değer Mi

Evet, ama dar ve ölçülü bir deneme olarak. Kalıcı kurulum olmamalı.

En ucuz plan:

1. **`graphify install`, `graphify claude install` ve `graphify hook install` çalıştırılmaz.** Böylece CLAUDE.md'ye, settings.json'a ve git hook'larına hiçbir şey yazılmaz. Her turdaki yük sıfır kalır.
2. **Grafik yalnızca `src/` üzerinde kurulur** (~470 üretim `.cs` dosyası).
   - `docs/` (587 `.md`), `.claude/` ve `tests/` dışarıda bırakılır.
   - Böylece doküman için LLM geçişi olmaz ve maliyet sıfır kalır.
   - Grafik AST'den kurulur. Testler grafiği iki katına çıkarır ama yapısal soruya bir şey katmaz.
3. **A/B ölçümü** (`bench/run.js` düzeniyle). 4–5 gerçek ve çok adımlı VidShrink sorusu seçilir.
   - **Kol A:** Mevcut düzen (Grep + Explore).
   - **Kol B:** Aynı soru, istemde "önce Bash ile `graphify query/explain/path` kullan" talimatıyla.
   - Kol başına en fazla 3 tekrar yapılır. Ölçülenler: toplam token, araç çağrısı sayısı, cevabın doğruluğu (dosya ve sembol isabeti).
   - Maliyet bench yetki sınırının (50 $) çok altında kalır.
4. **Karar kuralı:**
   - B, en az 2 soruda hem daha ucuz hem en az A kadar doğru çıkarsa, Teknesyum'a **yalnızca çağrıldığında çalışan** bir skill ya da işaret eklenir. Her turdaki yükü sadece skill açıklaması olur, ~30 token.
   - Aksi halde konu kapatılır.
5. **Paralel kontrol:** Refactor odaklı sorular için Serena'nın C# LSP'si aynı istemle bir kol olarak eklenebilir. Ama yalnızca istem içinde tek seferlik açılmalı. Kalıcı bir MCP kaydı yapılmamalı.

Kurulumun kendisi (`pipx install graphifyy`) sizin onayınızla yapılır. Bu raporda hiçbir şey kurulmadı.

## Yan Bulgu

Global `~/.claude/CLAUDE.md` dosyasında "Large or unfamiliar codebase → **graphify** (`/graphify .`, then query the graph)" satırı var.

Ama bu makinede graphify kurulu değil: `~/.claude/skills/` altında yok, PATH'te yok, VidShrink'te `graphify-out/` yok.

Bu satır her turda okunuyor ve var olmayan bir araca yönlendiriyor. Ya satır silinmeli ya da yukarıdaki deneme sonucuna göre "çağrıldığında" diye güncellenmeli.

## Kaynaklar

- Graphify: [depo](https://github.com/Graphify-Labs/graphify), [benchmark.py](https://github.com/Graphify-Labs/graphify/blob/main/graphify/benchmark.py), [BENCHMARKS.md](https://github.com/Graphify-Labs/graphify/blob/v8/BENCHMARKS.md), [install.py](https://github.com/Graphify-Labs/graphify/blob/v8/graphify/install.py), [cli.py](https://github.com/Graphify-Labs/graphify/blob/v8/graphify/cli.py), [hooks.py](https://github.com/Graphify-Labs/graphify/blob/v8/graphify/hooks.py), [claude-md.md](https://github.com/Graphify-Labs/graphify/blob/v8/graphify/always_on/claude-md.md), [Issue #985](https://github.com/Graphify-Labs/graphify/issues/985)
- [GitNexus](https://github.com/abhigyanpatwari/GitNexus), [codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp), [Serena](https://github.com/oraios/serena), [Repomix](https://github.com/yamadashy/repomix), [Aider repo map](https://aider.chat/docs/repomap.html), [claude-context](https://github.com/zilliztech/claude-context)
- Bağlam: [Hora de Codar: Graphify ou grep](https://horadecodar.com.br/?p=43650), [OfficeChai: agentic search vs RAG](https://officechai.com/ai/claude-researcher-explains-how-agentic-search-performed-better-than-rag-for-code-generation/), [knolli.ai alternatifler listesi](https://knolli.ai/post/graphify-alternatives)
- Yıldız ve tarih bilgileri: GitHub API, 2026-10-21.
