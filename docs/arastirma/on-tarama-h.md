# Ön Tarama — Kod Kalitesi ve Güvenlik (Dalga 2)

| Proje (link) | Yıldız | Son Commit | Ne Yapıyor (tek cümle) | Her Tur Maliyeti (Var/Yok/Seçmeli) | Bize Ne Katar (tek cümle) | Ön Puan (Yüksek/Orta/Düşük) |
|---|---|---|---|---|---|---|
| [webpro-nl/knip](https://github.com/webpro-nl/knip) | 12,486 | 2026-10-21 | JS/TS projelerinde kullanılmayan dosya, bağımlılık ve export bulur. | Yok | core/ içindeki ölü JS kodunu ve gereksiz npm bağımlılığını elle çağırarak bulur; bağlama girmez. | Yüksek |
| [fallow-rs/fallow](https://github.com/fallow-rs/fallow) | 5,203 | 2026-10-21 | Tek Rust ikilisiyle TS/JS deposu için karmaşıklık, kopya, mimari ve ölü kod raporu üretir. | Yok | Tek komutla core/ için karmaşıklık ve kopya raporu verir; bench/rapor.md’ye eklenebilir. | Yüksek |
| [betterleaks/betterleaks](https://github.com/betterleaks/betterleaks) | 2,287 | 2026-10-20 | Gitleaks yazarının yeni gizli anahtar tarayıcısı; depoda sızmış sırları arar. | Yok | Sürüm çıkarma betiğine tek satırlık "sır sızdı mı" kapısı olarak eklenir; model görmez. | Yüksek |
| [sirwart/ripsecrets](https://github.com/sirwart/ripsecrets) | 911 | 2025-12-15 | Commit öncesi gizli anahtarı çok hızlı yakalayan tek ikili. | Yok | Stop kapısına veya sürüm betiğine milisaniyelik sır denetimi ekler. | Yüksek |
| [yn400/v4-pro](https://github.com/yn400/v4-pro) | 3 | 2026-09-24 | Yapay zekâ kodundaki uydurma bağımlılık, yutulan hata ve boş gövdeli fonksiyonu yakalayan kalite kapısı. | Yok | Stop kapısı için hazır "AI sloppy kod" kural listesi fikri verir (uydurma paket, boş gövde, yer tutucu). | Yüksek |
| [cisco-ai-defense/skill-scanner](https://github.com/cisco-ai-defense/skill-scanner) | 2,616 | 2026-10-20 | Ajan skill dosyalarını komut enjeksiyonu ve tehlikeli kalıplar için tarar. | Yok | Raf ve kütüphaneye eklenen üçüncü taraf skill notlarını eklemeden önce elle taratmak için. | Yüksek |
| [boyter/scc](https://github.com/boyter/scc) | 8,835 | 2026-10-21 | Kod satırı sayar, döngüsel karmaşıklık ve maliyet tahmini ekler. | Yok | Statusline veya bench raporuna dosya boyutu/karmaşıklık sayısı eklemek için tek ikili, bağlama girmez. | Yüksek |
| [snyk/agent-scan](https://github.com/snyk/agent-scan) | 3,155 | 2026-10-21 | Yapay zekâ ajanları, MCP sunucuları ve skill’ler için güvenlik tarayıcısı. | Yok | Kurulu MCP ve skill listesini tek seferde denetler; çağrılınca çalışır. | Orta |
| [cisco-ai-defense/mcp-scanner](https://github.com/cisco-ai-defense/mcp-scanner) | 1,096 | 2026-10-20 | MCP sunucularını tehdit ve zafiyet için tarar. | Yok | Bizim hiç MCP’miz yok; yalnız kullanıcının kurduklarını denetleme aracı olarak değerli. | Düşük |
| [jdx/hk](https://github.com/jdx/hk) | 1,275 | 2026-10-21 | Git kancaları ve lint işlerini paralel yöneten hızlı yönetici. | Yok | Sürüm öncesi lint/format kancalarını tek yapılandırma dosyasında toplama fikri. | Orta |
| [evilmartians/lefthook](https://github.com/evilmartians/lefthook) | 8,928 | 2026-10-19 | Hızlı, bağımlılıksız Git kancası yöneticisi. | Yok | Commit öncesi kontrolleri paralel koşturma deseni; Stop kapısına örnek. | Orta |
| [typicode/husky](https://github.com/typicode/husky) | 35,356 | 2026-03-19 | JS projeleri için Git kancası kurucu. | Yok | Zaten betiklerimizle aynı işi yapıyor; yeni bir şey katmaz. | Düşük |
| [pre-commit/pre-commit](https://github.com/pre-commit/pre-commit) | 15,646 | 2026-10-20 | Çok dilli commit öncesi kanca çerçevesi. | Yok | Kanca deposu fikri; bizde zaten kendi kancalarımız var. | Düşük |
| [qltysh/qlty](https://github.com/qltysh/qlty) | 3,200 | 2026-10-20 | 70’ten fazla analiz aracını tek CLI’da birleştiren lint, format, güvenlik ve bakım ölçer. | Yok | Tek yapılandırmayla çoklu denetim; npm test’e tek komut olarak bağlanabilir. | Orta |
| [crate-ci/typos](https://github.com/crate-ci/typos) | 4,197 | 2026-10-06 | Kaynak kodda ve belgelerde yazım hatası bulan hızlı Rust aracı. | Yok | İki README ve docs yazım denetimi için sürüm betiğine eklenir. | Orta |
| [streetsidesoftware/cspell](https://github.com/streetsidesoftware/cspell) | 1,701 | 2026-10-20 | Kod için yazım denetleyici. | Yok | typos’a alternatif; Türkçe sözlük gerektiğinden daha ağır. | Düşük |
| [kucherenko/jscpd](https://github.com/kucherenko/jscpd) | 6,431 | 2026-10-21 | 220’den fazla dilde kopya kod bulucu. | Yok | Kopya kod yüzdesini bench raporuna yazabilir. | Orta |
| [terryyin/lizard](https://github.com/terryyin/lizard) | 2,563 | 2026-10-20 | Çok dilli basit karmaşıklık ölçer. | Yok | Fonksiyon bazlı karmaşıklık; fallow veya scc yeterliyse gerekmez. | Düşük |
| [jendrikseipp/vulture](https://github.com/jendrikseipp/vulture) | 4,854 | 2026-10-12 | Python’da ölü kod bulur. | Yok | Bizde Python az; yalnız betikler için. | Düşük |
| [osprey-oss/deptry](https://github.com/osprey-oss/deptry) | 1,495 | 2026-10-21 | Python projesinde kullanılmayan ve eksik bağımlılıkları bulur. | Yok | Python tarafı çok küçük, gerek yok. | Düşük |
| [albertas/deadcode](https://github.com/albertas/deadcode) | 177 | 2026-06-21 | Python’da ölü kodu bulur ve otomatik siler. | Yok | Otomatik silme fikri ilginç ama dilimiz JS. | Düşük |
| [bnjbvr/cargo-machete](https://github.com/bnjbvr/cargo-machete) | 1,386 | 2026-10-19 | Kullanılmayan Rust bağımlılıklarını hızla bulur. | Yok | Bizde Rust yok. | Düşük |
| [google/osv-scanner](https://github.com/google/osv-scanner) | 11,220 | 2026-10-21 | Kilit dosyalarını OSV veritabanıyla karşılaştırıp zafiyetli bağımlılığı bulur. | Yok | npm bağımlılık denetimi; çağrılınca çalışır, sürüm öncesi bağımlılıkları denetler. | Orta |
| [aquasecurity/trivy](https://github.com/aquasecurity/trivy) | 38,563 | 2026-10-21 | Konteyner, depo ve altyapı için zafiyet, sır ve yapılandırma tarayıcısı. | Yok | Bizim ölçeğimiz için fazla geniş. | Düşük |
| [anchore/grype](https://github.com/anchore/grype) | 13,061 | 2026-10-19 | Konteyner ve dosya sistemi için zafiyet tarayıcısı. | Yok | Konteynerimiz yok. | Düşük |
| [anchore/syft](https://github.com/anchore/syft) | 9,707 | 2026-10-19 | Yazılım malzeme listesi (SBOM) üretir. | Yok | Sürümlere SBOM eklemek mümkün ama ihtiyaç yok. | Düşük |
| [gitleaks/gitleaks](https://github.com/gitleaks/gitleaks) | 30,181 | 2026-09-30 | Depoda gizli anahtar arayan yaygın tarayıcı. | Yok | betterleaks’in öncülü; aynı iş. | Orta |
| [trufflesecurity/trufflehog](https://github.com/trufflesecurity/trufflehog) | 28,619 | 2026-10-20 | Sızmış kimlik bilgilerini bulur ve canlı doğrular. | Yok | Doğrulama özelliği güçlü ama ağa çıkar; sürüm betiğinde dikkatle. | Orta |
| [Yelp/detect-secrets](https://github.com/Yelp/detect-secrets) | 4,653 | 2026-04-02 | Sır sızıntısını önleyen, taban çizgisi tutan kurumsal araç. | Yok | Taban çizgisi dosyası fikri; yanlış alarmı bastırmak için. | Düşük |
| [GitGuardian/ggshield](https://github.com/GitGuardian/ggshield) | 2,008 | 2026-10-21 | 500’den fazla sır türünü yakalayan kanca ve CLI. | Yok | Hesap ve ağ gerektirir, ilkemize uymaz. | Düşük |
| [semgrep/semgrep](https://github.com/semgrep/semgrep) | 17,161 | 2026-10-21 | Kod desenlerine göre hafif statik analiz motoru. | Yok | Kendi kurallarımızı (ör. "kancada console.log yok") desenle yazmaya yarar. | Orta |
| [opengrep/opengrep](https://github.com/opengrep/opengrep) | 3,207 | 2026-10-20 | Semgrep’in açık kaynak çatalı. | Yok | Semgrep ile aynı katkı. | Düşük |
| [astral-sh/ruff](https://github.com/astral-sh/ruff) | 50,205 | 2026-10-21 | Çok hızlı Python linter ve biçimlendirici. | Yok | Python betiklerimiz az. | Düşük |
| [biomejs/biome](https://github.com/biomejs/biome) | 25,979 | 2026-10-21 | JS/TS için tek araçta lint ve biçimlendirme. | Yok | core/ için hızlı lint; prettier ve eslint yerine tek ikili. | Orta |
| [oxc-project/oxc](https://github.com/oxc-project/oxc) | 23,155 | 2026-10-21 | Rust ile yazılmış JS araç seti; oxlint içerir. | Yok | Çok hızlı lint, npm test’e eklenebilir. | Orta |
| [eslint/eslint](https://github.com/eslint/eslint) | 27,570 | 2026-10-20 | JS için standart linter. | Yok | Zaten bilinen; yeni katkı yok. | Düşük |
| [prettier/prettier](https://github.com/prettier/prettier) | 52,375 | 2026-10-21 | Görüşlü kod biçimlendirici. | Yok | Yeni katkı yok. | Düşük |
| [dprint/dprint](https://github.com/dprint/dprint) | 4,108 | 2026-10-21 | Eklenti tabanlı biçimlendirme platformu. | Yok | Prettier alternatifi, katkısı sınırlı. | Düşük |
| [sverweij/dependency-cruiser](https://github.com/sverweij/dependency-cruiser) | 7,313 | 2026-10-19 | Modül bağımlılıklarını kurallarla doğrular ve görselleştirir. | Yok | core/ içinde "hooks, scripts’i çağıramaz" gibi mimari kuralı yazmaya yarar. | Orta |
| [pahen/madge](https://github.com/pahen/madge) | 10,176 | 2026-01-21 | Modül bağımlılık grafiği ve döngü bulucu. | Yok | Döngüsel import tespiti; küçük ve tek amaçlı. | Düşük |
| [zizmorcore/zizmor](https://github.com/zizmorcore/zizmor) | 6,743 | 2026-10-21 | GitHub Actions iş akışları için güvenlik analizi. | Yok | Sürüm iş akışımız varsa tek komutla denetler. | Orta |
| [rhysd/actionlint](https://github.com/rhysd/actionlint) | 4,343 | 2026-07-16 | GitHub Actions iş akışı sözdizimi denetleyici. | Yok | İş akışı hatasını commit öncesi yakalar. | Düşük |
| [koalaman/shellcheck](https://github.com/koalaman/shellcheck) | 40,207 | 2026-10-19 | Kabuk betikleri için statik analiz. | Yok | Betik hatalarını yakalar; PowerShell’e değil sh’ye bakar. | Düşük |
| [step-security/harden-runner](https://github.com/step-security/harden-runner) | 1,289 | 2026-10-19 | GitHub Actions çalıştırıcısında ağ ve dosya hareketini izleyen ajan. | Yok | CI’ya bağlı; yerel akışımıza girmez. | Düşük |
| [AikidoSec/safe-chain](https://github.com/AikidoSec/safe-chain) | 1,802 | 2026-10-20 | npm ve pip kurulumlarını kötü amaçlı paket için süzen sarmalayıcı. | Yok | Kurulum anında devreye girer; yeni bağımlılık eklerken koruma. | Orta |
| [lirantal/npq](https://github.com/lirantal/npq) | 1,795 | 2026-10-07 | npm paketini kurmadan önce güvenlik denetimi yapar. | Yok | Yeni bağımlılık eklemeden önce elle çağrılan sigorta. | Orta |
| [DataDog/guarddog](https://github.com/DataDog/guarddog) | 1,231 | 2026-10-19 | Kötü amaçlı PyPI ve npm paketlerini tanımlar. | Yok | Tedarik zinciri denetimi; küçük bağımlılık listemizde ağır. | Düşük |
| [lirantal/lockfile-lint](https://github.com/lirantal/lockfile-lint) | 870 | 2026-10-09 | npm kilit dosyasındaki güvensiz kaynakları yakalar. | Yok | package-lock güvenliği için tek satırlık kontrol. | Orta |
| [ossf/scorecard](https://github.com/ossf/scorecard) | 5,771 | 2026-10-19 | Açık kaynak deposunun güvenlik sağlığını puanlar. | Yok | Yayınladığımız depoyu sürüm öncesi puanlamak için. | Orta |
| [trailofbits/skills](https://github.com/trailofbits/skills) | 7,670 | 2026-10-20 | Güvenlik araştırması ve açık bulma için Claude Code skill paketi. | Seçmeli | Her skill açıklaması bağlama girer; yalnız fikirleri raf notu olarak almak daha ucuz. | Orta |
| [hyhmrright/brooks-lint](https://github.com/hyhmrright/brooks-lint) | 1,541 | 2026-10-19 | On iki klasik kitaba dayanan yapay zekâ kod inceleme skill’i. | Seçmeli | Çürüme riski sınıflandırması iyi bir kontrol listesi fikri; skill olarak her turda yük. | Orta |
| [HexmosTech/git-lrc](https://github.com/HexmosTech/git-lrc) | 1,471 | 2026-10-11 | Her git commit’te diff için yapay zekâ incelemesi koşturur. | Seçmeli | Commit anında çalışan kanca modeli; model çağrısı ücretli olduğundan sınırlı kullanılır. | Düşük |
| [The-PR-Agent/pr-agent](https://github.com/The-PR-Agent/pr-agent) | 13,524 | 2026-10-21 | Orijinal açık kaynak PR inceleyici ajan. | Yok | PR akışımız tek kişilik, gerek yok. | Düşük |
| [mattzcarey/shippie](https://github.com/mattzcarey/shippie) | 2,511 | 2026-10-21 | Genişletilebilir kod inceleme ve QA ajanı. | Yok | CI’da çalışır, yerel akışa katkısı yok. | Düşük |
| [reviewdog/reviewdog](https://github.com/reviewdog/reviewdog) | 9,682 | 2026-10-21 | Herhangi bir analiz çıktısını PR yorumuna çeviren köprü. | Yok | PR yorumu kullanmıyoruz. | Düşük |
| [antonellof/s0-cli](https://github.com/antonellof/s0-cli) | 4 | 2026-04-24 | Klasik tarayıcıları ve LLM’i birleştirip güvenlik ile "vibe-code" sorunlarını sınıflayan ajan CLI. | Yok | Yapay zekâ çöpü desen listesi (sahte kimlik doğrulama, uydurma import) için kaynak. | Orta |
| [cheickmec/smellcheck](https://github.com/cheickmec/smellcheck) | 2 | 2026-03-25 | Python kod kokusu bulucu, 60 AST denetimi ve yeniden düzenleme kataloğu. | Yok | Koku ve yeniden düzenleme eşleşmesi fikri; bizde Python az. | Düşük |
| [openqa-cn/codexqa](https://github.com/openqa-cn/codexqa) | 235 | 2026-10-03 | Cursor, Claude Code ve Codex için on yerel doğrulama skill’i. | Seçmeli | Değişimin etki alanını izleme fikri güzel; skill yüklü kalırsa her tur maliyeti. | Düşük |
| [SunWeb3Sec/llm-sast-scanner](https://github.com/SunWeb3Sec/llm-sast-scanner) | 289 | 2026-08-22 | Ajanlara 34 zafiyet sınıfında yapılandırılmış açık arama skill’i. | Seçmeli | Zafiyet sınıfı kontrol listesi fikir olarak alınabilir. | Düşük |
| [NodeSecure/js-x-ray](https://github.com/NodeSecure/js-x-ray) | 288 | 2026-10-19 | JS/Node için kötü amaçlı desen ve tehlikeli kod yakalayan SAST. | Yok | Eklenti/paket kodunu çalıştırmadan analiz etmek için. | Orta |
| [santhreal/keyhog](https://github.com/santhreal/keyhog) | 109 | 2026-10-20 | GPU hızlandırmalı gizli anahtar tarayıcı; git geçmişi, konteyner ve tarayıcı varlıklarını kapsar. | Yok | Betterleaks ile aynı iş, GPU gereksiz. | Düşük |
| [praetorian-inc/titus](https://github.com/praetorian-inc/titus) | 747 | 2026-10-20 | Go kütüphanesi ve CLI olarak yüksek performanslı sır tarayıcı. | Yok | Aynı işi yapan çok araç var, farkı yok. | Düşük |
| [taradepan/reaper](https://github.com/taradepan/reaper) | 2 | 2026-02-21 | Rust ile yazılmış, sıfır yanlış alarm hedefli Python ölü kod bulucu. | Yok | Yanlış alarmsız ölü kod aramasında güven verir ama Python. | Düşük |
| [itaymendel/indent-complexity](https://github.com/itaymendel/indent-complexity) | 2 | 2026-03-24 | Girinti derinliğiyle dilden bağımsız karmaşıklık ölçer. | Yok | Ayrıştırıcı gerektirmeyen çok ucuz karmaşıklık ölçüsü fikri; statusline için ilginç. | Orta |
| [crenoxhq/crenox](https://github.com/crenoxhq/crenox) | 28 | 2026-10-19 | Bağımlılıksız statik derlenmiş commit öncesi sır tarayıcı. | Yok | ripsecrets benzeri; daha yeni ve küçük. | Düşük |
| [rust-lang/rust-clippy](https://github.com/rust-lang/rust-clippy) | 13,585 | 2026-10-19 | Rust için lint koleksiyonu. | Yok | Bizde Rust yok. | Düşük |
| [golangci/golangci-lint](https://github.com/golangci/golangci-lint) | 19,462 | 2026-10-20 | Go linter toplayıcı. | Yok | Bizde Go yok. | Düşük |
| [openrewrite/rewrite](https://github.com/openrewrite/rewrite) | 3,806 | 2026-10-21 | Kaynak kodda toplu otomatik yeniden düzenleme. | Yok | Java ağırlıklı, bize uzak. | Düşük |
| [codemod/codemod](https://github.com/codemod/codemod) | 1,116 | 2026-10-21 | Çok adımlı kod dönüşümlerini yazıp paylaşmaya yarayan CLI. | Yok | Toplu dosya değişikliklerini modele sormadan yapma fikri. | Orta |
| [facebook/jscodeshift](https://github.com/facebook/jscodeshift) | 10,040 | 2026-10-13 | JS için codemod aracı. | Yok | Deterministik toplu yeniden yazım; model yerine araç ilkesine uyar. | Orta |
| [promptfoo/promptfoo](https://github.com/promptfoo/promptfoo) | 26,227 | 2026-10-21 | İstem ve ajan testi ile kırmızı takım taraması. | Yok | Bench ölçümüne benzer; bizim bench/run.js zaten var. | Düşük |
| [NVIDIA/garak](https://github.com/NVIDIA/garak) | 9,634 | 2026-10-20 | LLM zafiyet tarayıcısı. | Yok | Model değil eklenti geliştiriyoruz, uzak. | Düşük |
| [pypa/pip-audit](https://github.com/pypa/pip-audit) | 1,380 | 2026-10-19 | Python bağımlılıklarını bilinen zafiyetler için denetler. | Yok | Python yok denecek kadar az. | Düşük |
| [Checkmarx/kics](https://github.com/Checkmarx/kics) | 2,722 | 2026-10-20 | Altyapı kodunda güvenlik açığı bulur. | Yok | Altyapı kodumuz yok. | Düşük |
| [mozilla/cargo-vet](https://github.com/mozilla/cargo-vet) | 998 | 2026-10-06 | Rust için tedarik zinciri güven kayıtları. | Yok | Güven kaydı fikri ilginç ama Rust. | Düşük |

## Gözden Kaçan Fikirler

- Hepsi çağrılınca çalışan ikililer: knip, fallow, scc ve betterleaks bağlama girmez; sürüm betiğine ve Stop kapısına tek satır olarak eklenir, model görmez.
- v4-pro ve s0-cli’nin "yapay zekâ çöpü" desen listesi (uydurma import, yutulan hata, boş gövde, yer tutucu) Stop kapısına bir kural kümesi olarak alınabilir.
- Skill tarayıcıları (cisco skill-scanner, snyk agent-scan) raf ve kütüphaneye üçüncü taraf not eklemeden önce elle çağrılacak bir güvenlik süzgeci olabilir.
- indent-complexity gibi ayrıştırıcısız ölçüler statusline için bedava karmaşıklık göstergesi olabilir.
- Skill biçiminde gelen incelemeciler (brooks-lint, trailofbits/skills, codexqa) her turda açıklama yükü getirdiğinden yalnız fikir olarak alınmalı.
