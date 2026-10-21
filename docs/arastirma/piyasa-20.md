# Piyasa Taraması: Claude Code Ekosistemindeki 22 Proje

Tarih: 2026-10-21. Yıldız ve son commit değerleri GitHub API'sinden (`gh api repos/...`) aynı gün okundu; "son commit" son push tarihidir. Hiçbir şey kurulmadı ya da indirilmedi. Mekanizma ve her-tur maliyeti sütunları README taramasına dayanır; kodu çalıştırıp ölçmedim. Emin olmadığım yerlerde "doğrulanmadı" yazdım.

Ölçüt: Core ilkesi gereği her turda bağlama giren şey şüphelidir (MCP araç tanımı, SessionStart/UserPromptSubmit ile enjekte edilen metin, hep yüklü skill). Yalnız çağrılınca maliyet doğuran şey serbesttir.

## Tablo

| # | Proje | Yıldız | Son Commit | Kategori | Mekanizma | Her-Tur Maliyeti | Puan |
|---|-------|--------|------------|----------|-----------|------------------|------|
| 1 | [headroomlabs-ai/headroom](https://github.com/headroomlabs-ai/headroom) | 76,9k | 2026-10-21 | Çıktı sıkıştırma | Araç çıktısı, log, JSON ve dosyayı modele gitmeden sıkıştıran kütüphane, proxy ve MCP sunucusu. Orijinali saklar, `headroom_retrieve` ile geri getirir. | Proxy kipinde yok. MCP kipinde 3 araç tanımı (her tur). | Fikrini Çal |
| 2 | [mksglu/context-mode](https://github.com/mksglu/context-mode) | 31,5k | 2026-10-21 | Çıktı sıkıştırma, hafıza | Büyük araç çıktısını sandbox'a alıp yerel FTS5 dizinine koyar, modele yalnız özet ve arama verir. 6 hook (SessionStart, PreCompact dahil) ve 11 MCP aracı. | Var: 11 araç tanımı ve SessionStart'ta yönlendirme metni. | Fikrini Çal |
| 3 | [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) | 102k | 2026-10-21 | Hafıza, oturum devri | Hook'larla araç kullanımını kaydeder, yapay zekâyla sıkıştırıp SQLite'a yazar, yeni oturumda ilgili özeti enjekte eder. Arama 3 katmanlı: dizin, zaman çizgisi, tam kayıt. | Var: SessionStart enjeksiyonu ve 4 MCP aracı. Arka plan işçisi ayrı model çağrısı harcar. | Fikrini Çal |
| 4 | [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman) | 114k | 2026-10-21 | Çıktı sıkıştırma | Modeli kısa, "mağara adamı" üslubunda yanıtlatan skill ve proxy; yanıt token'ını azaltır. README'ye göre 65 yüzdeye kadar (kendi ölçümü). | Var: kip kuralı her turda. Girdi tarafı "read less" ayrı. | Geç |
| 5 | [teamchong/pxpipe](https://github.com/teamchong/pxpipe) | 7,5k | 2026-10-20 | Bağlam tasarrufu | Eski bağlam metnini görüntü sayfalarına çevirip gönderir, son turlar metin kalır. | Proxy; bağlam metni yok. Doğruluk riski var, doğrulanmadı. | Geç |
| 6 | [tirth8205/code-review-graph](https://github.com/tirth8205/code-review-graph) | 32,3k | 2026-10-16 | Repo haritası | Tree-sitter ile kod grafı, artımlı güncelleme, MCP ile dar dilim verir. README: 208k kaynak token yaklaşık 3k'ya iner. Tek dosyalık küçük işte grafik fazladan yük olabilir. | Var: MCP araçları ve kural dosyasına eklenen yönerge. | Geç (graphify ile örtüşür) |
| 7 | [oraios/serena](https://github.com/oraios/serena) | 30,5k | 2026-10-20 | Repo haritası | Dil sunucusuyla anlamsal okuma ve düzenleme araçları sunan MCP. | Var: çok sayıda araç tanımı. | Geç |
| 8 | [yamadashy/repomix](https://github.com/yamadashy/repomix) | 28,9k | 2026-10-18 | Repo haritası | Repoyu tek dosyada toplayıp (isteğe bağlı sıkıştırarak) çıktılar. | Yok, çağrılınca çalışır. | Geç (iş akışımıza uymuyor) |
| 9 | [ccusage/ccusage](https://github.com/ccusage/ccusage) | 19,1k | 2026-10-21 | Maliyet izleme | Claude Code'un yerel JSONL günlüklerini okuyup günlük, aylık ve oturum maliyetini ve 5 saatlik blokları raporlar. Statusline kipi de var. | Yok. Yerel okur, ağ yok. | Al |
| 10 | [sirmalloc/ccstatusline](https://github.com/sirmalloc/ccstatusline) | 13,4k | 2026-10-19 | Statusline | Düzenlenebilir bileşenli (model, git dalı, maliyet, blok sayacı) statusline biçimleyici. | Yok. | Geç (Core zaten kendi statusline'ına sahip) |
| 11 | [jarrodwatts/claude-hud](https://github.com/jarrodwatts/claude-hud) | 28,7k | 2026-10-19 | Statusline | Statusline komutu; bağlam, hız sınırı, prompt önbelleği, çalışan araç ve alt ajan ve todo ilerlemesini transkriptten okuyup gösterir. Eşik ayarı var (yüzde belli değeri geçince göster). | Yok. | Fikrini Çal |
| 12 | [Maciek-roboblog/Claude-Code-Usage-Monitor](https://github.com/Maciek-roboblog/Claude-Code-Usage-Monitor) | 8,8k | 2026-07-05 | Maliyet izleme | Terminalde gerçek zamanlı token ve yakma hızı tahmini, limit uyarısı. | Yok. | Geç (ccusage ve Core yeter) |
| 13 | [thomaschill/unclog](https://github.com/thomaschill/unclog) | 36 | 2026-04-25 | Bağlam denetimi | MCP sunucularını, skill'leri ve CLAUDE.md şişkinliğini tarar, bağlamı yiyenleri listeler. | Yok, çağrılınca çalışır. | Fikrini Çal |
| 14 | [Abinesh-L/claude-crusts](https://github.com/Abinesh-L/claude-crusts) | 83 | 2026-10-17 | Bağlam denetimi | Bağlam penceresini çözümleyip boşa giden token'ı bulur ve yapıştırılabilir düzeltme komutu verir; API çağrısı yapmaz. | Yok. | Fikrini Çal (13 ile birlikte) |
| 15 | [nizos/tdd-guard](https://github.com/nizos/tdd-guard) | 2,4k | 2026-10-12 | Test ve doğrulama | PreToolUse hook'u düzenlemeyi durdurup testsiz kod yazımını engeller; ihlalde modele gerekçe döner. | Bağlama metin eklemez; her düzenlemede doğrulayıcı çağrı maliyeti var. | Fikrini Çal |
| 16 | [parcadei/Continuous-Claude-v3](https://github.com/parcadei/Continuous-Claude-v3) | 3,9k | 2026-01-26 | Oturum devri | 30 hook, defter (ledger) ve devir dosyalarıyla durumu oturumlar arası taşır; UserPromptSubmit'te ilgili skill ipuçlarını enjekte eder. | Var: her prompt'a enjeksiyon, 109 skill. | Geç (devir fikri Core'da var) |
| 17 | [obra/superpowers](https://github.com/obra/superpowers) | 302,8k | 2026-10-21 | Prompt ve kural yönetimi | Skill kütüphanesi (TDD, plan, inceleme) ve SessionStart'ta enjekte edilen önyükleme skill'i. | Var: SessionStart enjeksiyonu ve skill açıklamaları. | Geç |
| 18 | [affaan-m/ECC](https://github.com/affaan-m/ECC) (everything-claude-code) | 285k | 2026-10-20 | Prompt ve kural yönetimi | Çok sayıda ajan, skill, kural ve hook paketi. Adı ve konumu depo yönlendirmesiyle geldi, içeriği doğrulanmadı. | Büyük olasılıkla var (hep yüklü kural ve skill), doğrulanmadı. | Geç |
| 19 | [wshobson/agents](https://github.com/wshobson/agents) | 41,4k | 2026-10-19 | Alt ajan orkestrasyonu | Çok sayıda hazır alt ajan ve skill, eklenti olarak seçmeli kurulur. | Kurulan her ajanın açıklaması her tur araç listesine girer. | Geç |
| 20 | [ruvnet/ruflo](https://github.com/ruvnet/ruflo) (eski claude-flow) | 78k | 2026-10-21 | Alt ajan orkestrasyonu | MCP üzerinden sürü tarzı ajan orkestrasyonu, Ocak 2026'da yeniden adlandırıldı. | Var: ağır MCP yüzeyi. | Geç |
| 21 | [smtg-ai/claude-squad](https://github.com/smtg-ai/claude-squad) | 8,6k | 2026-08-20 | Alt ajan orkestrasyonu | tmux ve git worktree ile birden çok ajanı ayrı dallarda paralel yönetir; Claude Code'un dışında çalışan arayüz. | Yok. | Geç (bizim işimiz tek ajan, alt ajanla örtüşmüyor) |
| 22 | [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) | 56,1k | 2026-10-21 | Liste | Hook, eklenti, komut ve ajan listesi; yeni araçları izlemek için kaynak. | Yok. | Kaynak olarak izle |

Kısa not: karşılaştırma için bulunan ama listeye girmeyenler: karanb192/claude-code-hooks (547 yıldız, "context hogs" dosya başına token sıralaması), disler/claude-code-hooks-multi-agent-observability (1,6k, hook olay izleme), anothervibecoder-s/claudecode-harness (223).

## Bizimle Karşılaştırma

RTK bash çıktısını süzüyor. Okuma, WebFetch ve MCP çıktısı için eşdeğer bir süzgecimiz yok; headroom ve context-mode tam bu boşluğu hedefliyor. Ancak ikisinin de en iyi kipi MCP'dir ve MCP araç tanımı her turda bağlama girer. Bu yüzden doğrudan kurmak ilkemize aykırı; çıkarılacak olan fikirdir: "büyük çıktıyı sakla, modele tutamaç ver, istenirse geri getir".

Statusline tarafında ccstatusline ve claude-hud Core'un yaptığına denk. claude-hud'dan alınacak şey eşik mantığı: değer yüzdeyi aşmadıkça gösterme. Bu Core'un "bir eşikte bir kez konuş" ilkesiyle zaten uyumlu.

Hafıza tarafında claude-mem en popüler çözüm ama ağır: arka plan işçisi, ayrı model çağrısı, SessionStart enjeksiyonu. Raf ve devir notu ile Core aynı işi sıfır ek model maliyetiyle yapıyor. Alınacak tek şey 3 katmanlı arama düzeni (dizin, zaman çizgisi, tam kayıt).

## En Değerli 5 Öneri

1. **headroom: Fikrini Core'a taşı.** Neden: geri alınabilir sıkıştırma (orijinali diske yaz, modele özet ve tutamaç ver). RTK'nin kapsamadığı Read, WebFetch ve JSON çıktısına uygulanabilir, hook ile yapılır, bağlama sabit metin eklemez. MCP/proxy kipini kurmayız.
2. **context-mode: Fikrini Core'a taşı.** Neden: PostToolUse çıktısını sandbox'a alıp arama ile erişme fikri güçlü ve oturum kaybı için PreCompact kancası değerli. 11 MCP aracı ve SessionStart yönlendirme metni her tur maliyeti olduğundan kurulmaz.
3. **ccusage: Doğrudan kur (çağrılınca).** Neden: yerel günlükleri okur, bağlama sıfır maliyet, Core'un sayacını ve bench harcamasını bağımsız doğrulamak için iyi. `npx` ile yalnız gerektiğinde çalıştırılır; kalıcı kurulum gerekmez.
4. **unclog ve claude-crusts: Fikrini Core'a taşı.** Neden: tam olarak "hangi MCP, skill ve CLAUDE.md her turda ne kadar yer tutuyor" sorusunu cevaplıyor. Çağrılınca çalışan bir Core komutu (örn. `bagla-denetim`) olarak yazılırsa bu araştırmanın ilkesini otomatik uygular. Çok küçük depolar olduğu için doğrudan kurmak yerine fikir alınır.
5. **tdd-guard: Fikrini Core'a taşı.** Neden: yol haritasında sıradaki K1 Stop kapısı ile aynı iş (doğrulama olmadan durmayı engelle). Hook'un ihlal gerekçesini modele geri verme biçimi örnek alınır. Doğrulayıcı model çağrısı her düzenlemede maliyet doğurduğundan Core'da deterministik (test komutu çıkış kodu) yapılmalı.

Altıncı sıra: claude-mem'in 3 katmanlı arama düzeni, raf okuma akışına uygulanabilir.

## Kaynaklar

- GitHub API (yıldız, son push): https://api.github.com/repos/{sahip}/{depo}, tabloda her projenin linki
- Arama sonuçları: https://trendshift.io/repositories/14804, https://gittrend.io/repo/wshobson/agents, https://docs.claude-mem.ai/introduction, https://www.augmentcode.com/learn/claude-mem-46k-stars-persistent-memory-claude-code, https://claudelog.com/claude-code-mcps/ccstatusline, https://vibeindex.ai/plugins/karanb192/claude-code-hooks/context-hogs
- README taraması: her projenin GitHub README'si (hook, MCP, enjeksiyon ifadeleri)

Sınırlar: Hacker News ve r/ClaudeAI doğrudan taranmadı; arama aracı bu iki kaynağı sonuç olarak döndürmedi. Yıldız sayıları anlık görüntüdür. Her-tur maliyeti sütunu README'den çıkarım; ölçülmüş değil.
