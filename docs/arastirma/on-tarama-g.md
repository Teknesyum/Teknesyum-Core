# Ön Tarama — Yığına Yakın Yapay Zeka Araçları (G)

| Proje (link) | Yıldız | Son Commit | Ne Yapıyor (tek cümle) | Her Tur Maliyeti (Var/Yok/Seçmeli) | Bize Ne Katar (tek cümle) | Ön Puan (Yüksek/Orta/Düşük) |
|---|---|---|---|---|---|---|
| [CursorTouch/Windows-MCP](https://github.com/CursorTouch/Windows-MCP) | 9761 | 2026-10-20 | Windows masaüstünü MCP ile ajana açar (tıklama, yazma, ekran okuma). | Var | Windows otomasyonu için referans; ama araç tanımları her tura girer. | Düşük |
| [CoplayDev/unity-mcp](https://github.com/CoplayDev/unity-mcp) | 15258 | 2026-10-19 | Unity Editor'ü MCP köprüsüyle LLM'e bağlar (sahne, asset, script). | Var | Unity için olgun köprü; her tur araç şeması yükü getirir. | Düşük |
| [IvanMurzak/Unity-MCP](https://github.com/IvanMurzak/Unity-MCP) | 4510 | 2026-10-20 | Unity için MCP araçları, skill ve CLI; token tasarrufunu öne çıkarır. | Seçmeli | CLI yolu çağrıldığında maliyetli; Unity kullanılırsa tek aday. | Orta |
| [Coding-Solo/godot-mcp](https://github.com/Coding-Solo/godot-mcp) | 6233 | 2026-04-16 | Godot'yu MCP ile başlatır, çalıştırır, hata çıktısını yakalar. | Var | Godot hata çıktısı fikri; MCP yükü var. | Düşük |
| [tugcantopaloglu/godot-mcp](https://github.com/tugcantopaloglu/godot-mcp) | 493 | 2026-10-09 | Godot 4.x için 157 araçlı MCP (GDScript ve C#). | Var | C# Godot desteği; 157 araç tanımı her tura ağır gelir. | Düşük |
| [tomyud1/godot-mcp](https://github.com/tomyud1/godot-mcp) | 440 | 2026-10-17 | Godot eklentisi ve MCP sunucusu ile yapay zeka destekli oyun geliştirme. | Var | Standart köprü, yeni bir şey eklemez. | Düşük |
| [youichi-uda/godot-mcp-pro](https://github.com/youichi-uda/godot-mcp-pro) | 629 | 2026-09-24 | 162 MCP aracıyla Godot 4 sahne, animasyon, fizik, çalışma anı analizi. | Var | Çalışma anı analizi fikri; araç sayısı yüzünden pahalı. | Düşük |
| [regiellis/godot-mcp-go](https://github.com/regiellis/godot-mcp-go) | 69 | 2026-10-09 | Godot'yu terminalden derler, inceler, test eder; ajan aynı komutları kullanır. | Yok | MCP yerine CLI: yalnız çağrılınca maliyet, ilkemize birebir uyar. | Yüksek |
| [ryanmazzolini/minimal-godot-mcp](https://github.com/ryanmazzolini/minimal-godot-mcp) | 48 | 2026-10-20 | Godot LSP'yi MCP'ye köprüleyip GDScript doğrulaması yapar. | Var | Tek amaçlı, küçük şema; yine de her turda tanım. | Düşük |
| [FlamxGames/godot-ai-assistant-hub](https://github.com/FlamxGames/godot-ai-assistant-hub) | 319 | 2026-09-01 | Godot editörüne gömülü yapay zeka sohbeti, kod okuma ve yazma. | Yok | Ajan oturumuna girmez; bağımsız yardımcı. | Düşük |
| [IvanMurzak/Godot-MCP](https://github.com/IvanMurzak/Godot-MCP) | 299 | 2026-10-20 | Godot için C# yazılmış MCP entegrasyonu. | Var | C# tarafı ilgi çekici, MCP yükü var. | Düşük |
| [htdt/godogen](https://github.com/htdt/godogen) | 7177 | 2026-10-16 | Godot, Bevy, three.js oyunlarını Claude Code ile uçtan uca üreten üretici. | Seçmeli | Skill tabanlı oyun üretim akışı; yalnız Godot işinde kullanılır. | Orta |
| [jame581/GodotPrompter](https://github.com/jame581/GodotPrompter) | 855 | 2026-10-14 | Godot 4 için alan odaklı ajan skill çerçevesi. | Seçmeli | Skill'ler isteğe bağlı yüklenir; Godot işinde yararlı. | Orta |
| [gamedev-skills/awesome-gamedev-agent-skills](https://github.com/gamedev-skills/awesome-gamedev-agent-skills) | 2131 | 2026-10-09 | Godot, Unity, Unreal için 74 oyun skill'i ve yönlendirici. | Seçmeli | Yönlendirici yalnız gerektiğinde skill yükler; maliyetsizlik ilkesine uygun tasarım. | Yüksek |
| [Besty0728/Unity-Skills](https://github.com/Besty0728/Unity-Skills) | 1876 | 2026-10-21 | REST API üzerinden Unity editörünü skill'lerle yönetir. | Seçmeli | MCP yerine skill+REST; çağrıldığında maliyet. | Orta |
| [Donchitos/Claude-Code-Game-Studios](https://github.com/Donchitos/Claude-Code-Game-Studios) | 27023 | 2026-10-19 | Claude Code'u 49 ajan ve 72 skill ile oyun stüdyosuna çevirir. | Seçmeli | Orkestrasyon fikirleri; hep yüklü ajan sayısı ilkemize ters. | Düşük |
| [AnkleBreaker-Studio/unity-mcp-server](https://github.com/AnkleBreaker-Studio/unity-mcp-server) | 522 | 2026-10-06 | 268 araçlı Unity MCP sunucusu. | Var | Araç sayısı ağır; bize katkısı yok. | Düşük |
| [isuzu-shiranui/UnityMCP](https://github.com/isuzu-shiranui/UnityMCP) | 336 | 2026-10-08 | Editör kendi HTTP MCP'sini sunar, terminalden de sürülür. | Seçmeli | Ek süreç yok ve terminal kipi var. | Orta |
| [FunplayAI/funplay-unity-mcp](https://github.com/FunplayAI/funplay-unity-mcp) | 265 | 2026-10-08 | Unity için kod çalıştırma, ekran görüntüsü ve oyun modu otomasyonu. | Var | Oyun testi otomasyonu; MCP yükü. | Düşük |
| [undreamai/LLMUnity](https://github.com/undreamai/LLMUnity) | 1730 | 2026-04-29 | Unity içinde yerel LLM ile oyun karakterleri üretir. | Yok | Oyun içi LLM, geliştirme aracı değil. | Düşük |
| [chongdashu/unreal-mcp](https://github.com/chongdashu/unreal-mcp) | 2099 | 2025-04-22 | Unreal Engine'i doğal dille MCP ile kontrol eder. | Var | Unreal bizim yığında yok. | Düşük |
| [kajisho5/ffmpeg-skill](https://github.com/kajisho5/ffmpeg-skill) | 2034 | 2026-10-21 | Kodlama ajanına 42 FFmpeg aracı, makine okunur sözleşme ve MCP verir; bulut ve anahtar yok. | Seçmeli | Yerel FFmpeg düzenleme ve çıktı doğrulaması; CLI olarak çağrılınca maliyetli. | Yüksek |
| [KyaniteLabs/kinocut](https://github.com/KyaniteLabs/kinocut) | 215 | 2026-10-21 | FFmpeg tabanlı korumalı video düzenleme MCP sunucusu, kalite kapıları. | Var | Kalite kapısı ve makbuz fikri; MCP olarak ağır. | Orta |
| [burningion/video-editing-mcp](https://github.com/burningion/video-editing-mcp) | 294 | 2025-10-09 | Video Jungle üzerinden video düzenleme MCP'si. | Var | Bulut bağımlı; bize uymaz. | Düşük |
| [jordanrendric/claude-video-vision](https://github.com/jordanrendric/claude-video-vision) | 1393 | 2026-10-14 | ffmpeg ile kare çıkarıp Whisper ile ses çözerek Claude'a video izletir. | Seçmeli | Video anlama katmanı; yalnız çağrıldığında devrede. | Orta |
| [HUANGCHIHHUNGLeo/claude-real-video](https://github.com/HUANGCHIHHUNGLeo/claude-real-video) | 2248 | 2026-10-08 | Videoyu sahne farkındalıklı kareler ve zaman damgalı transkripte çevirir. | Yok | PyPI komut satırı aracı; çağrılmadıkça sıfır maliyet, video işine uyar. | Yüksek |
| [Hainrixz/editor-pro-max](https://github.com/Hainrixz/editor-pro-max) | 274 | 2026-03-26 | Remotion ve Claude Code ile doğal dilden video düzenler. | Seçmeli | Remotion akışı örneği; FFmpeg yerine React. | Düşük |
| [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) | 68778 | 2026-10-21 | HTML yaz, video üret; ajanlar için tasarlanmış. | Yok | HTML'den video: React/Electron bilgisiyle uyumlu, maliyet yalnız çalışınca. | Orta |
| [nexu-io/html-video](https://github.com/nexu-io/html-video) | 4728 | 2026-06-21 | HTML, CSS ve veriden dizüstünde MP4 üretir. | Yok | Programatik video; Hyperframes benzeri. | Düşük |
| [veedstudio/open-edit](https://github.com/veedstudio/open-edit) | 1698 | 2026-10-07 | Ajan güdümlü altyazı, hareketli grafik ve render hattı. | Seçmeli | Altyazı ve render hattı fikri. | Düşük |
| [jub0t/Concat](https://github.com/jub0t/Concat) | 10184 | 2026-10-21 | Yerel, ücretsiz CapCut alternatifi; JSON-RPC API ve MCP ile betiklenir. | Seçmeli | Betiklenebilir editör; JSON-RPC ile araç tanımı tura girmez. | Orta |
| [modelscope/FunClip](https://github.com/modelscope/FunClip) | 6433 | 2026-10-08 | Transkripsiyon ve LLM destekli kırpma yapan yerel video aracı. | Yok | Kırpma işleri için yerel çalışır. | Düşük |
| [jipraks/yt-short-clipper](https://github.com/jipraks/yt-short-clipper) | 1048 | 2026-09-20 | Uzun YouTube videolarını 9:16 kısa kliplere çeviren Windows uygulaması. | Yok | Windows ve FFmpeg uyumlu, ayrı araç. | Düşük |
| [Anil-matcha/AI-Youtube-Shorts-Generator](https://github.com/Anil-matcha/AI-Youtube-Shorts-Generator) | 5527 | 2026-10-11 | Uzun videolardan kısa klip üreten Opus Clip alternatifi. | Yok | Aynı tür; yeni fikir yok. | Düşük |
| [FireRedTeam/FireRed-OpenStoryline](https://github.com/FireRedTeam/FireRed-OpenStoryline) | 3547 | 2026-07-31 | Niyet güdümlü yapay zeka video düzenleme ajanı. | Yok | Ajan tabanlı kurgu; bizim hatta yok. | Düşük |
| [0xsline/OpenChatCut](https://github.com/0xsline/OpenChatCut) | 2580 | 2026-10-20 | Sohbetle yerel çok izli zaman çizelgeli video düzenleyici, MCP destekli. | Seçmeli | Ajan skill'li düzenleyici. | Düşük |
| [HKUDS/VideoAgent](https://github.com/HKUDS/VideoAgent) | 1959 | 2026-07-22 | Video anlama, düzenleme ve yeniden yapım için ajan çerçevesi. | Yok | Araştırma niteliğinde. | Düşük |
| [20000419/fauxnix](https://github.com/20000419/fauxnix) | 995 | 2026-10-15 | Bash komutlarını deterministik olarak PowerShell'e çevirir; WSL gerekmez. | Seçmeli | Bash alışkanlığını PowerShell'e çeviren, model dışı katman; RTK hook yaklaşımına benzer. | Yüksek |
| [sbroenne/mcp-server-excel](https://github.com/sbroenne/mcp-server-excel) | 830 | 2026-10-21 | Gerçek Excel'i MCP veya CLI ile otomatikleştirir. | Seçmeli | CLI kipi var; Windows COM otomasyonu. | Düşük |
| [shuyu-labs/Windows-MCP.Net](https://github.com/shuyu-labs/Windows-MCP.Net) | 233 | 2025-11-27 | .NET ile yazılmış Windows masaüstü otomasyon MCP'si. | Var | C# örneği; MCP yükü. | Düşük |
| [carquiza/RoslynMCP](https://github.com/carquiza/RoslynMCP) | 65 | 2025-06-24 | Roslyn ile C# kod analizi, sembol ve bağımlılık gezintisi MCP'si. | Var | C# kod gezinti fikri; her tur şema yükü. | Orta |
| [modelcontextprotocol/csharp-sdk](https://github.com/modelcontextprotocol/csharp-sdk) | 4592 | 2026-10-20 | MCP için resmi C# SDK. | Yok | Kendi araçlarımızı C#'ta yazarsak temel. | Düşük |
| [tryAGI/LangChain](https://github.com/tryAGI/LangChain) | 1078 | 2026-10-20 | LangChain'in C# uygulaması. | Yok | .NET'te ajan çerçevesi; ihtiyacımız değil. | Düşük |
| [microsoft/ai-dev-gallery](https://github.com/microsoft/ai-dev-gallery) | 1510 | 2026-10-17 | Windows geliştiricilerine yerel modelli yapay zeka örnekleri. | Yok | WinUI örnekleri; doğrudan kazanç yok. | Düşük |
| [microsoft/mcp-gateway](https://github.com/microsoft/mcp-gateway) | 890 | 2026-10-16 | MCP sunucuları için ters vekil ve yönetim katmanı. | Var | Birden çok MCP yönetimi; yükü azaltmaz. | Düşük |
| [unoplatform/uno](https://github.com/unoplatform/uno) | 10080 | 2026-10-21 | C# ve XAML ile çok platformlu yerli uygulama platformu. | Yok | Yapay zeka aracı değil, platform. | Düşük |
| [wieslawsoltes/ChatGPT](https://github.com/wieslawsoltes/ChatGPT) | 1482 | 2024-12-30 | Avalonia ile yazılmış C# ChatGPT istemcisi. | Yok | Avalonia örneği; eski. | Düşük |
| [halilural/electron-mcp-server](https://github.com/halilural/electron-mcp-server) | 71 | 2026-08-06 | Electron uygulamalarını DevTools protokolüyle otomatikleştirir ve ekran görüntüsü alır. | Var | Electron arayüz testi; MCP yükü. | Orta |
| [amafjarkasi/electron-mcp-server](https://github.com/amafjarkasi/electron-mcp-server) | 91 | 2026-10-16 | Electron uygulamalarını CDP ile hata ayıklayan MCP sunucusu. | Var | Aynı alan; yük var. | Düşük |
| [vastsa/PI-Desktop](https://github.com/vastsa/PI-Desktop) | 7093 | 2026-10-21 | Electron ve Rust çekirdekli yerel kodlama ajanı masaüstü uygulaması. | Yok | Electron+ajan mimarisi örneği. | Düşük |
| [NanmiCoder/cc-haha](https://github.com/NanmiCoder/cc-haha) | 15092 | 2026-10-21 | Claude Code için yerel öncelikli çok ajanlı masaüstü çalışma tezgahı. | Yok | Arayüz fikirleri alınabilir. | Düşük |
| [matt1398/claude-devtools](https://github.com/matt1398/claude-devtools) | 3991 | 2026-09-26 | Claude Code oturum günlüklerini, araç çağrılarını ve token kullanımını inceler. | Yok | Günlükten okur, modele girmez; bench ve sayaç için ek veri. | Orta |
| [Javis603/token-monitor](https://github.com/Javis603/token-monitor) | 3232 | 2026-10-21 | 46'dan fazla kodlama aracında token, maliyet ve limit izleyen masaüstü parçacığı. | Yok | Sayaç çalışmamızla örtüşür; model dışı. | Orta |
| [Kuddev/pebrel](https://github.com/Kuddev/pebrel) | 3550 | 2026-10-21 | Windows için GPU hızlandırmalı, yapay zeka destekli terminal. | Yok | Windows terminal; doğrudan kazanç yok. | Düşük |
| [Helvesec/rmux](https://github.com/Helvesec/rmux) | 2664 | 2026-08-09 | Herhangi bir CLI veya TUI'yi koddan süren Rust çoklayıcı, Windows destekli. | Yok | Ajan CLI sürme altyapısı. | Düşük |
| [ShunmeiCho/cc-clip](https://github.com/ShunmeiCho/cc-clip) | 177 | 2026-10-01 | SSH üzerinden uzak Claude Code'a görüntü yapıştırmayı sağlar (Windows destekli). | Yok | Makineler arası çalışma için ilginç. | Düşük |
| [dickwu/apple-design-skill](https://github.com/dickwu/apple-design-skill) | 1725 | 2026-10-15 | Flutter, Tauri, Electron için HIG tabanlı arayüz denetim skill'i. | Seçmeli | Arayüz denetimi; teknesyum-ui ile örtüşür. | Düşük |
| [OpenCoworkAI/open-codesign](https://github.com/OpenCoworkAI/open-codesign) | 8091 | 2026-10-21 | Claude Design alternatifi: istemden prototip üretir. | Yok | Tasarım üretici, maliyet yalnız kullanılınca. | Düşük |
| [tt-a1i/archify](https://github.com/tt-a1i/archify) | 86725 | 2026-10-21 | Fikir veya kod tabanından etkileşimli diyagram üreten ajan skill'i. | Seçmeli | Diyagram skill'i; kod tabanı haritası için yararlı. | Orta |
| [data-goblin/power-bi-agentic-development](https://github.com/data-goblin/power-bi-agentic-development) | 1061 | 2026-10-17 | Power BI için Claude Code ve Copilot skill ve ajan pazarı. | Seçmeli | Alanımız dışı. | Düşük |
| [elithril/blender-kiln](https://github.com/elithril/blender-kiln) | 54 | 2026-10-21 | Metinden veya fotoğraftan Blender ile üretime hazır 3D varlık üreten eklenti. | Seçmeli | Oyun varlığı hattı; alana uzak. | Düşük |
| [Natfii/UnrealClaude](https://github.com/Natfii/UnrealClaude) | 942 | 2026-06-26 | Unreal Engine 5.7 için Claude Code CLI entegrasyonu. | Seçmeli | Unreal bizim yığında yok. | Düşük |
| [WhiteTowerAI/ohmygame](https://github.com/WhiteTowerAI/ohmygame) | 991 | 2026-10-21 | Yapay zekayla oyun yapmak için açık kaynak stüdyo. | Yok | Oyun üretim akışı. | Düşük |
| [EthanYoQ/AI-Novel-Writer](https://github.com/EthanYoQ/AI-Novel-Writer) | 1704 | 2026-10-20 | Yapay zeka destekli uzun roman yazma masaüstü uygulaması. | Yok | Alan dışı. | Düşük |

## Gözden Kaçan Fikirler

- Godot ve Unity tarafında MCP köprüleri çoğunlukla her tura araç şeması yükler; CLI olarak sunanlar (godot-mcp-go) ilkemize daha yakın.
- FFmpeg ve video tarafında öne çıkan örüntü: makine okunur sözleşmeli CLI ve doğrulama adımı (kendi çıktısını kontrol eden araç); çağrılmadıkça sıfır maliyet.
- Yönlendirici (router) skill deseni (awesome-gamedev-agent-skills): tek küçük giriş, gerisi isteğe bağlı yüklenir; raf yapımıza uyarlanabilir.
- fauxnix gibi deterministik çeviri katmanları (bash -> PowerShell) model dışı çalışır; RTK hook'una benzer bir Windows uyumluluk hook'u fikri verir.
- Günlükten okuyan izleyiciler (claude-devtools, token-monitor) modele hiç girmez; sayaç ve bench için ham veri kaynağı olabilir.
