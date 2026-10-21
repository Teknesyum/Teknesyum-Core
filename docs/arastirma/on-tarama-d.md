# Ön Tarama — MCP Sunucuları Ve CLI Karşılıkları

| Proje (link) | Yıldız | Son Commit | Ne Yapıyor | Her Tur Maliyeti | Bize Ne Katar | Ön Puan |
|---|---|---|---|---|---|---|
| [openclaw/mcporter](https://github.com/openclaw/mcporter) | 5080 | 2026-10-20 | MCP sunucularını TypeScript API'si ya da tek komutluk CLI olarak çağırtır. | Yok | MCP araç tanımlarını bağlama koymadan, yalnız çağrıldığında bash üzerinden MCP kullanma yolu verir. | Yüksek |
| [philschmid/mcp-cli](https://github.com/philschmid/mcp-cli) | 1280 | 2026-02-05 | MCP sunucularını komut satırından keşfedip çağıran hafif CLI. | Yok | Araç şemalarını isteğe bağlı çeker; MCP'nin her tur şema maliyetini CLI çağrısına çevirir. | Yüksek |
| [microsoft/playwright-cli](https://github.com/microsoft/playwright-cli) | 14435 | 2026-10-19 | Playwright eylemlerini (gezin, tıkla, ekran görüntüsü, seçici üret) CLI olarak sunar. | Yok | Tarayıcı işini MCP araç tanımı olmadan, yalnız çağrılınca bash ile yaptırır. | Yüksek |
| [microsoft/markitdown](https://github.com/microsoft/markitdown) | 191383 | 2026-10-20 | Office, PDF ve diğer belgeleri Markdown'a çeviren Python aracı ve CLI. | Yok | Belge okumayı tek komuta indirir; yalnız çağrıldığında maliyet doğar. | Yüksek |
| [tobi/qmd](https://github.com/tobi/qmd) | 30520 | 2026-10-15 | Notlar ve belgeler için tamamen yerel mini CLI arama motoru. | Yok | Kütüphane/raf notlarında aramayı model dışında, deterministik bir komutla yapar. | Yüksek |
| [bytebase/dbhub](https://github.com/bytebase/dbhub) | 3697 | 2026-10-21 | Postgres, MySQL, SQLite vb. için az araçlı, jeton bilinçli veritabanı MCP sunucusu. | Seçmeli | Veritabanı MCP'sinin araç tanımını küçük tutar; yalnız gerektiğinde eklenebilir. | Yüksek |
| [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) | 91441 | 2026-10-19 | Resmî referans MCP sunucuları (filesystem, git, fetch, memory vb.). | Var | Referans uygulama; kendi araç tanımları her tur bağlamda kalır. | Düşük |
| [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) | 38455 | 2026-10-19 | Playwright'ı MCP sunucusu olarak sunar. | Var | Tarayıcı araçları her turda tanım olarak yüklenir; CLI karşılığı daha uygun. | Düşük |
| [ChromeDevTools/chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp) | 53927 | 2026-10-21 | Kodlama ajanlarına Chrome DevTools erişimi verir. | Var | Ağ ve konsol hata ayıklama kazandırır ama tanım maliyeti sürekli. | Orta |
| [github/github-mcp-server](https://github.com/github/github-mcp-server) | 33811 | 2026-10-21 | GitHub'ın resmî MCP sunucusu. | Var | gh CLI zaten aynı işi çağrılınca yapıyor. | Düşük |
| [lightpanda-io/browser](https://github.com/lightpanda-io/browser) | 36811 | 2026-10-21 | Yapay zeka ve otomasyon için tasarlanmış hafif başsız tarayıcı. | Yok | Playwright/CDP arkasında düşük kaynaklı tarayıcı motoru; yalnız kullanılınca çalışır. | Orta |
| [browser-use/browser-use](https://github.com/browser-use/browser-use) | 118723 | 2026-10-20 | Yapay zeka tarayıcı ajanları için Python kütüphanesi ve bulut API'si. | Yok | Ajan döngüsü içeren ağır bir çerçeve; bizde hazır kullanım değeri sınırlı. | Düşük |
| [firecrawl/firecrawl-mcp-server](https://github.com/firecrawl/firecrawl-mcp-server) | 7656 | 2026-10-21 | Firecrawl'ın resmî MCP sunucusu: ara, kazı, tara. | Var | Web okuma sağlar ama araç sayısı fazla ve API anahtarı ister. | Düşük |
| [firecrawl/firecrawl](https://github.com/firecrawl/firecrawl) | 193629 | 2026-10-21 | Web verisini yapay zeka için temiz içeriğe çeviren servis. | Yok | API tabanlı, ücretli; kazıma ihtiyacında dışarıdan çağrılır. | Düşük |
| [docling-project/docling](https://github.com/docling-project/docling) | 69248 | 2026-10-21 | Belgeleri (PDF, Office) üretken yapay zekaya hazır biçime çevirir. | Yok | PDF yapısı çıkarma gerektiğinde CLI ile çağrılır; markitdown'a güçlü alternatif. | Orta |
| [docling-project/docling-mcp](https://github.com/docling-project/docling-mcp) | 776 | 2026-10-19 | Docling'i MCP üzerinden ajanlara açar. | Var | Belge okumanın MCP sürümü; CLI varken gereksiz tanım yükü. | Düşük |
| [datalab-to/marker](https://github.com/datalab-to/marker) | 40570 | 2026-10-19 | PDF'i hızlı ve doğru biçimde Markdown ve JSON'a çevirir. | Yok | Karmaşık PDF için kalite; yalnız çağrıldığında çalışır. | Orta |
| [opendataloader-project/opendataloader-pdf](https://github.com/opendataloader-project/opendataloader-pdf) | 29752 | 2026-10-21 | Yapay zekaya hazır PDF ayrıştırıcı. | Yok | PDF çıkarmada yerel, çağrılınca çalışan seçenek. | Orta |
| [xberg-io/xberg](https://github.com/xberg-io/xberg) | 9438 | 2026-10-21 | Rust çekirdekli, 106 biçimden metin ve tablo çıkaran belge zekâsı aracı. | Yok | Tek ikiliyle çoklu biçim okuma; derin bakılmalı. | Orta |
| [SylphxAI/anymd](https://github.com/SylphxAI/anymd) | 1047 | 2026-10-21 | Her dosyayı (PDF, Office, görsel OCR, ses) temiz Markdown'a çevirir. | Yok | Tek komutla çok biçim; markitdown ile örtüşür. | Orta |
| [jgravelle/jcodemunch-mcp](https://github.com/jgravelle/jcodemunch-mcp) | 2793 | 2026-10-21 | Tree-sitter ile sembol düzeyinde kod getirme MCP sunucusu. | Var | Kod keşfini jetonla ucuzlatır ama araç tanımları sürekli yüklenir. | Orta |
| [jgravelle/jdocmunch-mcp](https://github.com/jgravelle/jdocmunch-mcp) | 206 | 2026-10-21 | Belgeleri bölüm indeksiyle jeton verimli arayan MCP sunucusu. | Var | Doküman aramada dilim getirir; MCP tanım maliyeti var. | Orta |
| [ast-grep/ast-grep-mcp](https://github.com/ast-grep/ast-grep-mcp) | 484 | 2026-10-20 | ast-grep yapısal aramayı MCP olarak sunar. | Var | ast-grep CLI zaten çağrılınca aynı işi yapar. | Düşük |
| [wrale/mcp-server-tree-sitter](https://github.com/wrale/mcp-server-tree-sitter) | 309 | 2026-05-21 | Tree-sitter ile kod ayrıştırma MCP sunucusu (arşivlenmiş). | Var | Arşivlendi; fikir jcodemunch'ta sürüyor. | Düşük |
| [mcollina/mcp-ripgrep](https://github.com/mcollina/mcp-ripgrep) | 78 | 2025-04-29 | ripgrep'i MCP sunucusu olarak sarar. | Var | rg zaten Grep aracında var; ek değer yok. | Düşük |
| [wonderwhy-er/DesktopCommanderMCP](https://github.com/wonderwhy-er/DesktopCommanderMCP) | 10087 | 2026-10-21 | Terminal denetimi, dosya araması ve diff düzenleme MCP sunucusu. | Var | Yerleşik araçlarla örtüşür. | Düşük |
| [googleapis/mcp-toolbox](https://github.com/googleapis/mcp-toolbox) | 16700 | 2026-10-21 | Veritabanları için açık kaynak MCP sunucusu (Google). | Var | Çok veritabanı desteği; tanım yükü ve kurulum ağırlığı. | Düşük |
| [crystaldba/postgres-mcp](https://github.com/crystaldba/postgres-mcp) | 3414 | 2026-08-17 | Postgres için yapılandırılabilir okuma/yazma ve performans analizi. | Var | Postgres performans analizi için tek amaçlı. | Düşük |
| [benborla/mcp-server-mysql](https://github.com/benborla/mcp-server-mysql) | 2169 | 2026-07-27 | MySQL'e salt okunur erişim sağlayan MCP sunucusu. | Var | Bizde MySQL yok; genel fayda sınırlı. | Düşük |
| [runekaagaard/mcp-alchemy](https://github.com/runekaagaard/mcp-alchemy) | 421 | 2026-10-15 | SQLAlchemy ile ilişkisel veritabanlarına MCP erişimi. | Var | Çoklu veritabanı sürücüsü; dbhub daha hafif. | Düşük |
| [motherduckdb/mcp-server-motherduck](https://github.com/motherduckdb/mcp-server-motherduck) | 533 | 2026-10-07 | DuckDB ve MotherDuck için yerel MCP sunucusu. | Var | CSV/Parquet sorgulama için DuckDB ilgi çekici; CLI ile de yapılır. | Orta |
| [mongodb-js/mongodb-mcp-server](https://github.com/mongodb-js/mongodb-mcp-server) | 1146 | 2026-10-21 | MongoDB ve Atlas için MCP sunucusu. | Var | Bizde MongoDB yok. | Düşük |
| [IBM/mcp-context-forge](https://github.com/IBM/mcp-context-forge) | 4672 | 2026-10-21 | MCP, A2A ve REST için ağ geçidi, kayıt ve vekil. | Var | Kurumsal ağ geçidi; bizim ölçeğe ağır. | Düşük |
| [metatool-ai/metamcp](https://github.com/metatool-ai/metamcp) | 2717 | 2026-06-22 | MCP sunucularını tek yerde toplayan toplayıcı ve ağ geçidi. | Seçmeli | Araçları tek uçtan sunarak tanım sayısını yönetebilir. | Orta |
| [supercorp-ai/supergateway](https://github.com/supercorp-ai/supergateway) | 2919 | 2026-10-21 | stdio MCP sunucularını HTTP/SSE üzerinden sunar. | Yok | Taşıma köprüsü; maliyet kategorisine etkisi yok. | Düşük |
| [sparfenyuk/mcp-proxy](https://github.com/sparfenyuk/mcp-proxy) | 2798 | 2026-10-14 | Streamable HTTP ile stdio MCP taşımaları arasında köprü. | Yok | Taşıma köprüsü; doğrudan kazanç yok. | Düşük |
| [mcpjungle/MCPJungle](https://github.com/mcpjungle/MCPJungle) | 1307 | 2026-08-02 | Tüm MCP sunucularını tek noktadan yöneten kayıt/ağ geçidi. | Seçmeli | Sunucuları açıp kapatmayı kolaylaştırır. | Orta |
| [docker/mcp-gateway](https://github.com/docker/mcp-gateway) | 1611 | 2026-09-23 | Docker MCP CLI eklentisi ve ağ geçidi. | Seçmeli | Sunucuları izole çalıştırır; Docker bağımlılığı getirir. | Düşük |
| [agentgateway/agentgateway](https://github.com/agentgateway/agentgateway) | 5446 | 2026-10-20 | Ajanlar ve MCP sunucuları için yeni nesil vekil. | Var | Altyapı katmanı; bizim işimize uzak. | Düşük |
| [universal-tool-calling-protocol/code-mode](https://github.com/universal-tool-calling-protocol/code-mode) | 1601 | 2026-08-25 | Ajanın MCP/UTCP araçlarını kod yürüterek çağırmasını sağlar. | Seçmeli | Araç tanımlarını bağlamdan çıkarıp kodla çağırma fikrini taşır. | Orta |
| [portofcontext/pctx](https://github.com/portofcontext/pctx) | 282 | 2026-10-20 | Araçları ve MCP'leri sanal alanda çalışan koda çevirerek jeton tasarrufu yapar. | Seçmeli | Kod yürütme ile az jetonlu araç çağrısı; fikir bizim ilkeyle uyumlu. | Orta |
| [f/mcptools](https://github.com/f/mcptools) | 1630 | 2025-12-18 | MCP sunucularıyla konuşan komut satırı arayüzü. | Yok | CLI olarak MCP çağırma; mcporter'a alternatif. | Orta |
| [wong2/mcp-cli](https://github.com/wong2/mcp-cli) | 446 | 2026-06-08 | MCP için CLI denetleyicisi. | Yok | Sunucu şemasını incelemek için hafif araç. | Düşük |
| [modelcontextprotocol/inspector](https://github.com/modelcontextprotocol/inspector) | 11112 | 2026-10-21 | MCP sunucularını test eden görsel araç. | Yok | Geliştirme/ölçüm sırasında sunucu doğrulamaya yarar. | Düşük |
| [PrefectHQ/fastmcp](https://github.com/PrefectHQ/fastmcp) | 28156 | 2026-10-21 | Python'da hızlıca MCP sunucusu ve istemcisi yazma çerçevesi. | Yok | Kendi küçük araç tanımlı MCP'mizi yazmak gerekirse zemin. | Düşük |
| [mcp-use/mcp-use](https://github.com/mcp-use/mcp-use) | 10791 | 2026-10-21 | MCP uygulamaları ve sunucuları için tam yığın çerçeve. | Yok | Çerçeve; bize doğrudan fayda yok. | Düşük |
| [rust-mcp-stack/rust-mcp-sdk](https://github.com/rust-mcp-stack/rust-mcp-sdk) | 198 | 2026-10-19 | Rust için hızlı asenkron MCP araç takımı. | Yok | Küçük ikili MCP yazmak için temel. | Düşük |
| [tadata-org/fastapi_mcp](https://github.com/tadata-org/fastapi_mcp) | 12022 | 2025-11-24 | FastAPI uç noktalarını MCP aracına çevirir. | Var | Web uygulaması odaklı; ilgisiz. | Düşük |
| [ref-tools/ref-tools-mcp](https://github.com/ref-tools/ref-tools-mcp) | 1183 | 2026-10-01 | Kodlama ajanlarına kütüphane belgelerini bağlamı şişirmeden getirir. | Var | context7 benzeri; tanım yükü sürer. | Düşük |
| [idosal/git-mcp](https://github.com/idosal/git-mcp) | 8472 | 2026-05-08 | Herhangi bir GitHub projesi için uzak MCP sunucusu. | Seçmeli | Uzak, kurulumsuz; yalnız eklenirse maliyetli. | Orta |
| [cyanheads/git-mcp-server](https://github.com/cyanheads/git-mcp-server) | 242 | 2026-09-26 | Git işlemlerini MCP olarak sunar. | Var | git CLI yeterli. | Düşük |
| [vivekVells/mcp-pandoc](https://github.com/vivekVells/mcp-pandoc) | 583 | 2026-08-15 | Pandoc ile belge biçimi dönüştürme MCP'si. | Var | pandoc CLI doğrudan çağrılabilir. | Düşük |
| [zcaceres/markdownify-mcp](https://github.com/zcaceres/markdownify-mcp) | 2997 | 2026-09-25 | Hemen her şeyi Markdown'a çeviren MCP sunucusu. | Var | markitdown CLI varken tanım yükü gereksiz. | Düşük |
| [haris-musa/excel-mcp-server](https://github.com/haris-musa/excel-mcp-server) | 4253 | 2026-10-21 | Excel dosyası oluşturma/düzenleme MCP sunucusu (Excel gerekmez). | Var | Elektronik tablo işi seyrek. | Düşük |
| [AgentDeskAI/browser-tools-mcp](https://github.com/AgentDeskAI/browser-tools-mcp) | 7329 | 2026-10-16 | Tarayıcı günlüklerini IDE'ye aktarır. | Var | Chrome DevTools MCP ile örtüşür. | Düşük |
| [hangwin/mcp-chrome](https://github.com/hangwin/mcp-chrome) | 12498 | 2026-01-06 | Chrome eklentisi tabanlı MCP sunucusu; gerçek oturumu kullanır. | Var | Oturumlu tarayıcı ilginç ama tanım yükü var. | Düşük |
| [steel-dev/steel-browser](https://github.com/steel-dev/steel-browser) | 7851 | 2026-10-20 | Ajanlar için açık kaynak tarayıcı API'si ve sanal alan. | Yok | Barındırılan tarayıcı; yerel işimize ağır. | Düşük |
| [executeautomation/mcp-playwright](https://github.com/executeautomation/mcp-playwright) | 5669 | 2025-12-13 | Playwright MCP'nin topluluk sürümü, API testi de içerir. | Var | Resmî sürümle örtüşür. | Düşük |
| [tavily-ai/tavily-mcp](https://github.com/tavily-ai/tavily-mcp) | 2447 | 2026-10-15 | Gerçek zamanlı arama, çıkarma, tarama MCP sunucusu. | Var | API anahtarı gerekir; WebSearch zaten var. | Düşük |
| [exa-labs/exa-mcp-server](https://github.com/exa-labs/exa-mcp-server) | 5157 | 2026-10-19 | Exa ile web arama ve tarama MCP sunucusu. | Var | WebSearch ile örtüşür. | Düşük |
| [brave/brave-search-mcp-server](https://github.com/brave/brave-search-mcp-server) | 1515 | 2026-10-21 | Brave Search MCP sunucusu. | Var | WebSearch ile örtüşür. | Düşük |
| [jae-jae/fetcher-mcp](https://github.com/jae-jae/fetcher-mcp) | 1088 | 2026-01-14 | Playwright ile sayfa içeriği getirme MCP sunucusu. | Var | WebFetch ile örtüşür. | Düşük |
| [jina-ai/reader](https://github.com/jina-ai/reader) | 12180 | 2026-05-22 | URL'ye r.jina.ai öneki ekleyerek LLM dostu metin verir. | Yok | Anahtarsız tek URL ile sayfa okuma; yalnız çağrılınca maliyet. | Orta |
| [simonw/datasette](https://github.com/simonw/datasette) | 11519 | 2026-10-13 | Veriyi keşfetme ve yayınlama çok amaçlı aracı. | Yok | SQLite'ı CLI/HTTP ile açar; MCP olmadan sorgulama. | Orta |
| [ggozad/haiku.rag](https://github.com/ggozad/haiku.rag) | 633 | 2026-10-21 | Yerel ajan tabanlı RAG; Docling ayrıştırma ve MCP sunucusu. | Seçmeli | Yerel belge arama; MCP isteğe bağlı. | Orta |
| [qdrant/mcp-server-qdrant](https://github.com/qdrant/mcp-server-qdrant) | 1552 | 2026-09-04 | Qdrant vektör veritabanı MCP sunucusu. | Var | Vektör altyapısı gerektirir. | Düşük |
| [awslabs/mcp](https://github.com/awslabs/mcp) | 9803 | 2026-10-21 | AWS için açık kaynak MCP sunucuları. | Var | Bulut altyapımız yok. | Düşük |
| [supabase/mcp](https://github.com/supabase/mcp) | 2966 | 2026-10-21 | Supabase'i ajanlara bağlar. | Var | Supabase kullanmıyoruz. | Düşük |
| [jamessoubry/stow](https://github.com/jamessoubry/stow) | 1 | 2026-08-23 | Büyük araç çıktısını SQLite FTS5 ile saklayıp arayan yerel MCP. | Seçmeli | Büyük çıktıyı bağlam dışında tutma fikri; RTK'yı tamamlar. | Orta |
| [p-vbordei/shack-semantic-cache](https://github.com/p-vbordei/shack-semantic-cache) | 0 | 2026-05-21 | Araç sonuçlarını argüman normalleştirerek SQLite'ta önbelleğe alan MCP. | Seçmeli | Tekrarlı araç çağrılarını önbellekle; küçük ama zekice. | Orta |

## Gözden Kaçan Fikirler

- Asıl kazanç MCP'yi atmak değil, MCP'yi CLI'ye çevirmek: mcporter ve philschmid/mcp-cli şemayı yalnız çağrıldığında çeker, her tur tanım maliyeti sıfırlanır.
- Kod-çalıştırma yaklaşımı (pctx, code-mode) araç tanımlarını bağlamdan çıkarıp koda gömüyor; Cloudflare ve Anthropic'in aynı yöndeki çalışmalarıyla birlikte ayrı bir derin incelemeye değer.
- Belge okumada (markitdown, docling, marker, opendataloader-pdf, anymd) MCP sürümleri gereksiz; CLI olanlar bedavaya yakın. Hangisinin Türkçe PDF'te daha iyi çıktığı bench ile ölçülebilir.
- stow ve shack-semantic-cache gibi minik projeler (büyük çıktıyı bağlam dışı saklama, araç sonucu önbelleği) RTK'nın tamamlayıcısı olabilecek zekice fikirler taşıyor; kodları küçük, fikir ödünç alınabilir.
- Araç sayısı az tutulmuş veritabanı sunucusu dbhub, 'jeton bilinçli' tasarımıyla bu kategoride model olabilir; diğer DB MCP'leri bizde konu dışı.
