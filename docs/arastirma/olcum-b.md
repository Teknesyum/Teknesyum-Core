# Ölçüm Turu B Kolu: Kod Bağlamı Ve Arama Araçları

Tarih: 2026-10-21. Plan: `docs/plan.md` S ve S1. Ham veri: `bench/olcum-b.jsonl` (koşu başına bir satır). Koşu ve toplama betiği: `bench/olcum-b.js`. Cevap dosyaları: `C:\Users\Administrator\olcum-dis\cevaplar\`.

İlke: dışarıdan hiçbir şey ölçmeden alınmaz; yıldız kanıt değildir. Her sayısal iddia kendi ölçümümüzle karşılaştırıldı ve üç sınıftan birine kondu. **Gerçek**: iddianın en az yarısı tuttu. **Kısmi**: bir fayda var ama iddianın yarısına ulaşmıyor. **Balon**: ölçümde fayda yok ya da tersine döndü.

## Kısa Hüküm

Hiçbir araç iddiasının yarısına ulaşmadı. Sayısal iddiası olan iki aracın ölçümü şöyle:

- **graphify:** "71.5x" ve bugünkü "%80 daha az token" iddiasına karşı ölçülen kazanç ortalama %21 $ ve %22 token.
- **code-review-graph:** "~63x" iddiasına karşı ölçülen kazanç %18. Bu kolun ajanları aracı 12 koşunun yalnız 3'ünde çağırdı.

Bütün araç kolları tabandan biraz ucuz çıktı (−%9 ile −%21 arası). Ama tasarrufun büyük kısmı tek sorudan geliyor: Q2'de taban pahalı ve dalgalıydı. Q1'de araç kollarının dördü tuzağa düşüp yanlış metodu gösterdi; taban düşmedi.

Toplam harcama 7,43 $, bütçe 20 $.

## Deney Zemini

VidShrink'in `src/` klasörü `C:\Users\Administrator\olcum-dis\vidshrink-kopya\src\` altına kopyalandı: 475 dosya, C# ve Avalonia. Gerçek projeye dokunulmadı.

Dört soru yazıldı. Cevap anahtarı koşulardan önce kodu okuyarak çıkarıldı.

### Q1 Ayar Zinciri (Katmanlar Arası, Çok Adımlı)

> Gelişmiş ayarlardaki ses kanalı seçimi (ComboBox CmbAdvAudioChannels, ör. "Mono") FFmpeg komut satırındaki `-ac` argümanına kadar hangi dosya ve metotlardan geçiyor? Zinciri sırayla ver. `-ac` argümanını listeye gerçekte hangi metot ekliyor?

Anahtar:

1. `MainWindow.axaml:871`, `CmbAdvAudioChannels`.
2. `MainWindow.axaml.cs`, `ApplyAdvancedOptions` (2425/2448): seçim `PlanOptions.AudioChannels` alanına yazılır.
3. `PlanCalculator.BuildDetailedCore` (391; switch 555-583): değer `EncodePlan.AudioChannels` alanına geçer.
4. `FfmpegArguments.Build` (552): 557'de `ForOutput`, 653'te `OutputArguments` çağrılır.
5. `StreamMapping.ForOutput` (938) → `Decide` (946). Ardından `StreamPlan.OutputArguments` (281) → `AudioCodecArguments` (350). **`-ac` 361. satırda ekleniyor.**
6. `EncodeRunner.EncodeArguments` (894/899).
7. Tuzak: `ConversionArguments.AddAudio` (645) de `-ac` ekliyor. Ama o Dönüştür sekmesinin yolu (`CmbConvertChannels`), bu ComboBox'ın değil.

### Q2 Kabuk Menüsü (Katmanlar Arası, Çok Adımlı)

> Windows Gezgini sağ tık menüsündeki hızlı küçültme girdisi (ör. "Gmail (25 MB)") tıklandığında istek hangi dosya ve metotlardan geçerek FFmpeg argümanlarının kurulduğu yere ulaşıyor? Kayıt defterine yazılan komutun biçimi ne, ve `--kucult` argümanı hangi hedef MB değerlerini kabul ediyor?

Anahtar:

1. Kayıt komutu `"exe" --kucult <mb> "%1"`. Yazan yerler: `ShellRegistration.WriteMenus` (155/205) ve `ShellMenu.cs:167`.
2. `Program.cs` → `ShellShrinkStartup.From` → `ShrinkRequestResolver.Resolve`.
3. Kabul edilen hedefler `AcceptedShrinkTargetsMegabytes` (`ShellIntegration.cs:88`) içinde: 8/16/20/25/50/100 ve eski 250/500/1000/2000/1024/2048.
4. `App.axaml.cs:137` → `ShrinkJobWindow` (883'te `PlanCalculator.Build`, 898'de `EncodeRunner.RunAsync`) → `EncodeRunner:899` → `FfmpegArguments.Build`.
5. Uygulama zaten açıksa istek `ControlBridge.Check` yolundan geçer.

### Q3 Refactor Etki Analizi

> `StreamMapping.Decide` metodunun imzasını değiştirirsem src/ altında onu doğrudan çağıran metotlar (dosya + metot) hangileri, ve bu çağıranları çağıran metotlar (bir seviye yukarı) hangileri? Aynı adlı başka sınıfların Decide metotlarını karıştırma.

Anahtar:

- Doğrudan çağıranlar: `PlanCalculator.BuildDetailedCore` (608) ve `StreamMapping.ForOutput` (946).
- Bir seviye yukarı: `BuildDetailed` (350), `FfmpegArguments.Build` (557), `EncodeRunner.RunEncodeAsync` (485), `CliApp.ProcessFileAsync` (372) ve `CliApp.AudioOptionNotes` (820).

### Q4 Sembol Bulma

> Ses izini videoyla hizalamak için yeniden kodlanan ses izine varsayılan olarak verilen FFmpeg ses süzgeci metni hangi sabitte tanımlı (dosya, sınıf, ad) ve değeri tam olarak ne?

Anahtar: `StreamMapping.cs`, `StreamMapping.SesHizalama = "aresample=async=1:first_pts=0"` (satır 375).

## Yöntem

Her koşu yalıtılmış bir alt ajanda yapıldı. Ajan türü `bench-low`: model sonnet, effort low, araçlar Read, Write, Edit, Bash, Glob, Grep.

İki kol karşılaştırıldı:

- **Taban kolu** aynı istemle çalıştı. İstemde "Yerleşik Grep, Glob ve Read araçlarını kullan" satırı vardı.
- **Araç kolu** aynı istemle çalıştı. O satırın yerinde aracın tam yolunu veren tek satırlık kullanım notu vardı: "Önce Bash ile <araç> çalıştır, yetmezse yerleşik araçlara geç".

Her soru × kol en fazla 3 kez koşuldu. Taban kolu bir kez koşuldu ve bütün araçlara karşı ortak taban olarak kullanıldı.

Metrikler:

- Token: girdi, çıktı, önbellek yazma ve önbellek okuma.
- $: `bench/maliyet.js` mantığıyla hesaplandı. Her `message.id` için her kalemin en büyüğü alındı; fiyatlar `docs/tarife.json` dosyasından okundu.
- Süre.
- Doğruluk: önce `olcum-b.js` anahtar regex'iyle otomatik puanlandı, sonra Q1 cevapları elle notlandı.
- Ajanın aracı gerçekten çağırıp çağırmadığı: Bash komutlarında aracın exe adı arandı.

### Yöntem Sapmaları

- **`claude -p` yerine alt ajan.** Yalıtılmış `CLAUDE_CONFIG_DIR` ile `claude -p` bu makinede kimlik doğrulayamadı. Koşular bu yüzden Agent aracıyla `bench-low` alt ajanında yapıldı. Sonuç olarak oturum hook'ları (RTK, Teknesyum) iki kolda da aynı biçimde etkindi. Kıyas adil, ama mutlak token sayıları "çıplak claude -p"den biraz yüksek.
- **Taban kolunda Explore yok.** `bench-low` ajanı alt ajan açamadığı için taban yalnız Grep, Glob ve Read kullandı.
- **Model `claude-sonnet-5-5`.** Bu modelin satırı `docs/tarife.json` içinde yoktu. 2026-10-21'de claude-api bilgi tablosundan eklendi; satır başına $/MTok: girdi 2, çıktı 10, önbellek okuma 0,2. Önbellek yazma 5 dakika için 1,25 × girdi = 2,5 olarak türetildi. Fiyatlar resmi fiyat sayfasından doğrudan okunmadı, bu yüzden mutlak $ değerleri bu tarifeye bağlı. Kollar arası oranlar etkilenmez.
- **Pilot.** İlk graphify koşusu eski, öneri kipindeki notla yapıldı; ajan graphify'ı çağırmadı. Bu satır (`agent-a7b92904…`) özete katılmadı.
- **code-review-graph kurulumu.** `build` komutu "repo_root does not look like a project root" hatası verdi. Kopyanın içine boş bir `.code-review-graph` dizini açılarak aşıldı.
- **Otomatik puan yumuşak.** Regex Q1'de `ConversionArguments` tuzağını yakalamıyor. Q1 cevapları elle notlandı (aşağıdaki doğruluk tablosu el notudur).

## Araçlar: İddia, Künye, Kurulum

Kurulumların hepsi `C:\Users\Administrator\olcum-dis\<araç>\` altında yalıtıldı. Ayar, CLAUDE.md ya da git hook yazan komutların hiçbiri (`graphify install`, `hook install` ve benzerleri) çalıştırılmadı. Hiçbir MCP sunucusu kurulmadı.

| Araç | Depo | Yıldız | Lisans | Sayısal İddia (Kıyas Tabanı) |
|---|---|---|---|---|
| graphify | Graphify-Labs/graphify | 130.796 | Apache-2.0 | Eski README "71.5x"; bugün "80% fewer tokens" (ham dosya okumaya karşı). Issue #985'teki bağımsız ölçüm aracı 1,6–1,9x daha pahalı buldu. |
| probe | probelabs/probe | 732 | Apache-2.0 | Sayısal iddia yok |
| ast-grep | ast-grep/ast-grep | 16.303 | MIT | Sayısal iddia yok |
| claude-context | zilliztech/claude-context | 12.632 | MIT | ~%40 token azalması (aynı geri getirme kalitesinde) |
| code-review-graph | tirth8205/code-review-graph | 32.295 | MIT | Medyan ~63x, aralık 35x–358x; taban bütün korpusu bağlama koymak |
| codebase-memory-mcp | DeusData/codebase-memory-mcp | 47.075 | MIT | 10x daha az token, 2,1x daha az araç çağrısı |
| qmd | tobi/qmd | 30.521 | MIT | Sayısal iddia yok |
| coding_agent_session_search | Dicklesworthstone/coding_agent_session_search | 1.188 | NOASSERTION | — |

### Kurulum Ve İndeks

| Araç | Paket Ve Kaynak | Kurulum Boyutu | İndeks Maliyeti |
|---|---|---|---|
| graphify | `graphifyy` 0.9.93 (README'deki ad), PyPI, uv venv | 134 MB | 10,2 s; 41 MB; 11.365 düğüm; LLM token'ı yok |
| probe | `@probelabs/probe` 0.6.0-rc342, npm, `npm --prefix` | 343 MB | İndeks yok |
| ast-grep | `@ast-grep/cli` 0.51.0, npm, `npm --prefix` | 104 MB | İndeks yok |
| code-review-graph | `code-review-graph` 2.3.9, PyPI, venv | 260 MB | 39,4 s; 72 MB; 475 dosya, 8.002 düğüm, 40.864 kenar; LLM token'ı yok |
| codebase-memory-mcp | v0.12.1 GitHub release, `codebase-memory-mcp-windows-amd64.zip`; sha256 `4e4e0f16…dedcc0` | zip 46,3 MB; açılmış 366 MB | Çalışmadı (aşağıda) |
| qmd | `@tobilu/qmd` 2.8.3 (README `npm install -g @tobilu/qmd`), npm, `npm install --prefix`; 158 paket, 21 s | 860 MB | 2,2 s; 12 MB sqlite; yalnız BM25. `embed` çalıştırılmadı, LLM token'ı yok. Koleksiyon "vs", maske `**/*.cs`, 474 dosya. |
| claude-context | Kurulmadı | — | Zilliz ve OpenAI anahtarı gerekir — ölçülemedi |
| coding_agent_session_search | Kurulmadı | — | Kapsam dışı: kod değil, ajan oturum geçmişi arıyor |

### codebase-memory-mcp Neden Çalışmadı

İkili her komutta "could not load saved runtime settings" hatasıyla durdu.

Neden: `C:\Users\Administrator` dizininin ACL'inde bir app-container SID'i (S-1-15-3-…) var. Aracın ata dizin güvenlik denetimi (`cbm_daemon_ipc_private_directory_secure`) bu yüzden dizini reddediyor. Bilinen açık issue'lar: #1533 ve #1574.

Denenip işe yaramayanlar:

- `CBM_CACHE_DIR` ve `CBM_RUNTIME_DIR` değişkenleri.
- Yalnız kullanıcıya açık ACL'li ayrı bir dizin.
- `HOME`, `USERPROFILE` ve `APPDATA` yalıtımı.

Kayıt: "çalıştırılamadı (Windows dizin güvenlik denetimi, v0.12.1)".

Yan etki: araç boş bir `C:\Users\Administrator\.cache\codebase-memory-mcp` dizini açtı. İçinde dosya yok.

## Ölçüm Tablosu

Her kol için 12 koşu yapıldı: 4 soru × 3 tekrar. Token sütunu dört kalemin toplamıdır: girdi, çıktı, önbellek yazma, önbellek okuma.

### Kol Ortalamaları

| Kol | Ort. $ | Tabana Göre | Ort. Süre | Ort. Token | Aracı Çağıran Koşu | Doğru (Q1 El Notu Dahil) |
|---|---|---|---|---|---|---|
| taban | 0,118 | — | 36 s | 161.787 | — | 12/12 |
| graphify | 0,093 | −%21 | 35 s | 126.571 | 12/12 | 11/12 |
| qmd | 0,095 | −%19 | 37 s | 135.811 | 12/12 | 11/12 |
| code-review-graph | 0,097 | −%18 | 37 s | 134.368 | 3/12 | 12/12 |
| ast-grep | 0,100 | −%15 | 42 s | 148.219 | 12/12 | 11/12 |
| probe | 0,107 | −%9 | 43 s | 163.070 | 11/12 | 11/12 |

### Soru Başına Ortalama $ (Süre)

| Soru | taban | graphify | probe | ast-grep | crg | qmd |
|---|---|---|---|---|---|---|
| Q1 Ayar | 0,120 (36 s) | 0,078 (34 s) | 0,107 (53 s) | 0,115 (48 s) | 0,116 (48 s) | 0,098 (35 s) |
| Q2 Kabuk | 0,181 (42 s) | 0,140 (41 s) | 0,138 (48 s) | 0,128 (46 s) | 0,153 (44 s) | 0,128 (39 s) |
| Q3 Etki | 0,108 (45 s) | 0,102 (47 s) | 0,133 (51 s) | 0,107 (52 s) | **0,067 (36 s)** | 0,110 (56 s) |
| Q4 Sembol | 0,063 (23 s) | 0,054 (19 s) | 0,050 (18 s) | 0,051 (22 s) | 0,055 (21 s) | 0,045 (20 s) |

### Doğruluk

Q2, Q3 ve Q4'te bütün kollar 3/3 doğru.

Q1 elle notlandı. Ölçüt: `-ac` argümanını ekleyen metot olarak `StreamMapping.AudioCodecArguments` gösterilmeli; tuzak olan `ConversionArguments.AddAudio` gösterilmemeli.

| Kol | Q1 Doğru | Tuzağa Düşen Koşu |
|---|---|---|
| taban | 3/3 | — |
| graphify | 2/3 | r1 |
| probe | 2/3 | r2 |
| ast-grep | 2/3 | r3 |
| code-review-graph | 3/3 | — (aracı Q1'de hiç çağırmadı) |
| qmd | 2/3 | r1 |

### Aracın Kendisi Ne Yaptı

- **graphify:** Kullanıldı ama sorgu çoğu zaman sembolü bulamadı (ör. `StreamMapping.Decide`). Ajan grep'e döndü. Q1'deki ucuzluk (0,078 $) gerçek; Q3'te fark yok.
- **probe:** İlk arama çoğu zaman çok büyük ya da ilgisiz bir çıktı döndürdü. Bu yüzden Q1 ve Q3'te tabandan pahalı ve yavaş.
- **ast-grep:** Sabit tanımlarını ve XAML desenlerini bulamadı. Ajan yerleşik araçlarla tamamladı.
- **code-review-graph:** Ajanlar aracı Q1 ve Q4'te hiç çağırmadı (0/3), Q2'de 1/3, Q3'te 2/3 çağırdı. `callers_of` sorgusunun kullanıldığı Q3 bütün turun en belirgin kazancı: taban 0,108 $ ve 45 s, crg 0,067 $ ve 36 s (−%38). Q1'de crg ile taban aynı maliyette; bu beklenen sonuç, çünkü crg kolu orada fiilen taban gibi çalıştı.
- **qmd:** .cs dosyalarında BM25 çoğu zaman tek ya da ilgisiz bir parça döndürdü. Ajan grep ile tamamladı.

### Dikkat

Araç kolunun notu "önce aracı dene, yetmezse yerleşik araçlara geç" kipindeydi. Bu yüzden ölçülen fark, "aracın yanında grep de var" durumunun farkıdır; yalnız araçla çalışmanın farkı değildir.

Taban Q2'de yüksek ve dalgalı çıktı (0,181 $). Q2 ortalamadan çıkarılırsa araç kollarının kazancı belirgin biçimde daralıyor. Tekrar sayısı 3 olduğu için %10'un altındaki farklar gürültü sınırındadır.

## Her Tur Sabit Yükü

MCP kurulmadığı için araç tanımı yükü sıfır. Her tura binen tek ek yük, istemdeki tek satırlık kullanım notu.

"İlk Çağrı Girdisi", ajanın ilk API çağrısında giden girdi token'ıdır; sistem istemi, araç tanımları ve görev metni buna dahildir.

| Kol | Not (Bayt) | İlk Çağrı Girdisi (Ort. Token) | Tabana Göre Fark |
|---|---|---|---|
| taban | 0 | 8.865 | — |
| ast-grep | 317 | 9.049 | +184 |
| probe | 362 | 9.056 | +191 |
| graphify | 377 | 9.029 | +164 |
| qmd | 439 | 9.120 | +255 |
| code-review-graph | 503 | 9.135 | +270 |

Bu yük, ilk çağrıdaki girdinin %2–3'ü kadar. Not, aracı kullanmayan turlarda da ödeniyor; kalıcı bir CLAUDE.md satırı olsaydı her turda ödenirdi.

## Sınıflama

| Araç | İddia | Ölçülen | Sınıf | Tek Cümle Hüküm |
|---|---|---|---|---|
| graphify | 71.5x / %80 daha az token | −%21 $, −%22 token; Q1'de 2/3 doğru | **Kısmi** | Graphify.md'deki karar kuralı sağlandı: Q2, Q3 ve Q4'te hem daha ucuz hem eşit doğru. Ama kazanç iddianın yarısına (%40) ulaşmıyor; yalnız istenince çağrılan, isteğe bağlı bir araç olarak alınabilir. |
| code-review-graph | ~63x | −%18 $; Q3'te −%38 | **Balon** | 63x'in yanına yaklaşmadı, ajanlar aracı çoğu soruda çağırmadı. Tek gerçek kazanç `callers_of` ile yapılan refactor etki analizi. |
| probe | Yok | −%9 $, Q1 ve Q3'te pahalı | **İddia Yok** | Gürültü sınırında; ilk arama çıktısı büyük, alınmasına gerek yok. |
| ast-grep | Yok | −%15 $ | **İddia Yok** | Yapısal arama C# sabitlerinde ve XAML'de işe yaramadı; ek değer görülmedi. |
| qmd | Yok | −%19 $ | **İddia Yok** | Kod için BM25 grep'ten iyi değil; fark büyük ölçüde Q2'deki taban dalgasından geliyor. |
| codebase-memory-mcp | 10x / 2,1x | — | **Ölçülemedi** | Windows'ta dizin güvenlik denetimi yüzünden v0.12.1 çalışmıyor. |
| claude-context | ~%40 | — | **Ölçülemedi** | Anahtar gerekir (Zilliz ve OpenAI). |
| coding_agent_session_search | — | — | **Kapsam Dışı** | Kod değil, oturum geçmişi arıyor. |

## Harcama

| Kol | Koşu | $ |
|---|---|---|
| taban | 12 | 1,419 |
| graphify | 12 + 1 pilot | 1,121 + 0,089 |
| probe | 12 | 1,284 |
| ast-grep | 12 | 1,201 |
| code-review-graph | 12 | 1,169 |
| qmd | 12 | 1,146 |
| **Toplam** | 73 | **7,43** |

Bütçe 20 $ idi, aşılmadı. İndekslerin hiçbiri LLM token'ı harcamadı.
