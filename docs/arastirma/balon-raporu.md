# Balon Raporu: Ölçmeden Giriş Yok

Tarih: 2026-10-21. Plan: `docs/plan.md` bölüm S ve S1. Kaynaklar: `olcum-a.md`, `olcum-b.md`, `olcum-c.md`, `olcum-d.md` (yıldız sayısı bulunmayanlar için `piyasa-20.md` ve `on-tarama-*.md`).

## Ne İnceledik

Ekosistemde 515 proje tarandı, bunlardan 49'u yüksek aday çıktı. Ölçüm turunda adaylar dört kola bölündü ve toplam 55 araç dosyalara girdi. Bunların 47'si için en az bir ölçüm yapıldı; 8'i ölçülemedi.

Kollar: A sıkıştırma ve dönüştürme (7 araç), B kod bağlamı ve arama (8), C belirleyici araçlar (22), D orkestrasyon ve diğerleri (18).

Yöntem: her araç `C:\Users\Administrator\olcum-dis\<araç>` altında yalıtılmış kuruldu. Davranış ölçümü A/B biçiminde, tabana karşı yapıldı ve kol başına en fazla 3 tekrar koşuldu. Sınıf kuralı: Gerçek, iddianın en az yarısı tuttu; Kısmi, bir kısmı tuttu; Balon, tutmadı ya da tersine döndü.

Harcama: A yaklaşık 17,4 $ (12 $ tavanı aştı; aşım yönetici ajanın bağlam büyümesinden, ölçümün kendisi 3,6 $), B 7,43 $, C 7,76 $, D 0 $. Toplam yaklaşık 32,6 $, bütçe 50 $.

Ölçüm sınırları:

- `claude -p` oturum açamadı ("OAuth session expired"). Koşular alt ajanlarla yapıldı, usage alt ajan dökümlerinden okundu. Mutlak token sayıları çıplak `claude -p`den biraz yüksek olabilir; kollar arası oran etkilenmez.
- Model gerektiren davranış ölçümleri D kolunda "kimlik yok" diye yapılamadı (tdd-guard, claude-handoff, beads, fleetmates A/B'leri).
- Anahtar isteyenler ölçülemedi: claude-context, distil'in fatura iddiası, skill-scanner'ın LLM hakemi, communique, tokencost'un Claude yolu.
- Windows'ta çalışmayanlar: ripsecrets (derlenmedi), codebase-memory-mcp (dizin güvenlik denetimi), unclog.
- Kapsam dışı: coding_agent_session_search (kod değil, oturum geçmişi arıyor); raporda Ölçülemedi sayıldı.
- B kolunda tekrar sayısı 3 olduğundan %10'un altındaki farklar gürültü sınırındadır.

## Büyük Tablo

Yıldız sayıları ilgili rapordan ya da `piyasa-20.md` / `on-tarama-*.md` satırından alındı. "yok" olan yerde sayı bulunamadı.

Hüküm sütunu: Al = yalnız çağrılınca; Geç; Core = Core zaten yapıyor.

| Araç | Yıldız | İddia | Ölçülen | Sınıf | Hüküm |
|---|---|---|---|---|---|
| headroom | 76.941 | Toplam -%41; tekrarlı JSON ve logda %90 | Toplam -%26; JSON -%56, log -%10; olgu 13/15 | Gerçek | Al |
| toon | 25.535 | Pretty JSON'a göre -%42,6 | -%18 (pretty'ye göre), +%8,5 (kompakt JSON'a göre) | Kısmi | Geç |
| distil | 20 | Fatura -%8,3...-%9,2 | Fatura ölçülemedi (anahtar); expand'siz olgu 1/15 | Kısmi | Geç |
| context-diff | 1 | Sayısal iddia yok; hız ve doğruluk | Hız ve doğruluk tuttu; sayılar bizimkiyle birebir | Gerçek | Core |
| markitdown | 191.385 | Sayı yok | PDF -%54, DOCX -%92, doğruluk aynı | Gerçek | Al |
| pxpipe | 7.542 | Fatura -%59...-%70 | Token -%79 ama olgu doğruluğu %70 | Kısmi | Geç |
| caveman | 113.970 | Oturumda -%33,2; dosya başı -%98 | Derlemde -%16,4; en iyi -%64, bilgi kaybıyla | Kısmi | Geç |
| graphify | 130.796 | 71.5x / -%80 token | -%21 $, -%22 token; Q1'de 2/3 doğru | Kısmi | Al |
| probe | 732 | Yok | -%9 $, Q1 ve Q3'te tabandan pahalı | İddia yok | Geç |
| ast-grep | 16.303 | Yok | -%15 $, C# sabit ve XAML'de işe yaramadı | İddia yok | Geç |
| claude-context | 12.632 | ~-%40 token | Anahtar gerekir | Ölçülemedi | Geç |
| code-review-graph | 32.295 | ~63x | -%18 $ (Q3'te -%38); aracı 12 koşunun 3'ünde çağırdılar | Balon | Geç |
| codebase-memory-mcp | 47.075 | 10x token, 2,1x çağrı | Windows'ta çalışmadı (v0.12.1) | Ölçülemedi | Geç |
| qmd | 30.521 | Yok | -%19 $, fark çoğunlukla Q2 taban dalgası | İddia yok | Geç |
| coding_agent_session_search | 1.188 | Yok | Kapsam dışı | Ölçülemedi | Geç |
| knip | 12.486 | Ölü kod bulur | Yapılandırmasız 76 bulgu, 15/20 yanlış; yapılandırmayla 3 yetim test buldu | Kısmi | Al |
| fallow | 5.203 | Hızlı ölü kod, tekrar, karmaşıklık | knip ile aynı sonuç, 15/20 yanlış; artısı klon ve karmaşıklık raporu | Kısmi | Geç |
| betterleaks | 2.287 | Sır taraması | 5/5 sahte sırrı yakaladı; geçmişte 1 olası gerçek sır | Gerçek | Al |
| ripsecrets | 911 | Hızlı sır tarama | Windows'ta derlenmedi | Ölçülemedi | Geç |
| scc | 8.835 | Hızlı ve doğru satır sayımı | Üç depoda sayılar birebir, 51-80 ms | Gerçek | Al |
| cc-safety-net | 1.714 | Yıkıcı komutları engeller | 13/18 yakalama, 0/12 yanlış alarm | Kısmi | Core |
| dcg | 6.197 | Yıkıcı komutları engeller | 15/18 yakalama, 2/12 yanlış alarm; ret 5.152 B | Kısmi | Core |
| claudeignore | 6 | Tüm araçlarda dosya erişimini keser | Yerleşik araçlarda 5/7; Windows'ta Bash'te koruma yok | Kısmi | Geç |
| skill-scanner | 2.616 | Kötü skill tespiti | 2/5 yakalama, 1/10 yanlış alarm; LLM'siz zayıf | Kısmi | Geç |
| tokencost | 2.004 | Çevrimdışı token ve maliyet | Claude token'ını %17-36 eksik sayıyor | Balon | Core |
| ttok | 407 | Çevrimdışı token sayımı | Claude token'ını %17-36 eksik sayıyor | Balon | Core |
| promptfoo | 26.227 | Doğrulamalı istem testi | 11/11 doğru hüküm; 1,30 GB kurulum | Gerçek | Geç |
| ccusage | 19.100 | Günlükten token ve maliyet | Token Core ile birebir; USD'de ccusage doğru, Core eksik | Gerçek | Core |
| unclog | 36 | Her tur yükünü gösterir | Windows'ta komut listesi boş | Ölçülemedi | Geç |
| claude-crusts | 83 | Bağlam dökümü ve israf tespiti | Bağlam sapması +%0,1...+%0,9 | Gerçek | Geç |
| cc-cache-monitor | 5 | Kanca ~45 ms, uçurum tespiti | Kanca 298-675 ms (7-13x yavaş); uçurum 3/3 | Kısmi | Geç |
| claude-pace | 240 | Kota tempo farkı | 3/3 beklenen fark | Gerçek | Geç |
| mcp-cli | 1.280 (*) | Şema yükünü CLI'ye çevirir | Sayfa ve sorgu çıktısı aynı; Claude Code şemayı zaten erteliyor | Kısmi | Geç |
| mcporter | 5.080 | Şema yükünü CLI'ye çevirir | Aynı; çağrı 4,2 sn | Kısmi | Geç |
| playwright-cli | 14.435 | MCP'siz tarayıcı işi | MCP şeması ~17,6 KB, CLI skill'i çağrılınca 15,4 KB; çıktı aynı | Kısmi | Geç |
| dbhub | 3.697 | Tek MCP, çok veritabanı | Sorgu doğru; şema 1.187 B | Gerçek | Geç |
| communique | 122 | LLM ile sürüm notu | Anahtar gerekir | Ölçülemedi | Geç |
| bonsai | 9 | Yalnız güvenli worktree'yi siler | Dirty, locked, untracked'ı silme adayı gösterdi; koruyan git'ti | Balon | Geç |
| claude-worktree-hooks | 29 | Sayı yok | Windows'ta bozuk, lisanssız | İddia yok | Geç |
| fleetmates | 3 | Thinking -%72-76, ~40k token | Kimlik yok; sabit yük 9,6 KB/tur | Ölçülemedi | Geç |
| Archon | 23.737 | Sayı yok | Çalıştırılamadı | İddia yok | Geç |
| claude-code-action | 9.596 | Sayı yok | Çalıştırılamadı | İddia yok | Geç |
| reviewd | 70 | Sayı yok | Çalıştırılamadı | İddia yok | Geç |
| sloppy | 160 | "33 kural" | PHP yok, çalıştırılamadı | İddia yok | Geç |
| claude-multisession | 3 | ~0,5 s/prompt, ~366 ms/araç | Prompt gecikmesi tuttu, araç gecikmesi ~%40 fazla | Gerçek | Geç |
| beads | 28.065 | prime 1-2k token; MCP'ye göre 10-50x ucuz | prime 1,6-1,8k tok tuttu; her tur ~9,4 KB; 10-50x ölçülemedi | Kısmi | Core |
| claude-handoff | 65 | Oturumun %20-40'ı kurtarılır | Depoda ölçüm yok; her devirde ~38 KB okutuyor | Balon | Core |
| hatel | 0 | Sayı yok | Çalıştırılmadı | İddia yok | Geç |
| tdd-guard | 2.363 | Sayı yok | A/B yapılamadı; her düzenlemede model çağrısı | İddia yok | Core |
| context-mode | 31.533 | -%98 bağlam | Ham çıktıya karşı -%98 doğru; ilk dönüşte 0/3 tam; sabit yük ~10k tok | Kısmi | Geç |
| godot-mcp-go | 69 | 56k token, `typed=false` ile ~490 | Godot ve Go yok | Ölçülemedi | Geç |
| ffmpeg-skill | 2.034 | 42 araç; 100/100 yönlendirme | 42 araç doğrulandı; MCP yolu ~15,8k-45k tok | Kısmi | Geç |
| claude-real-video | 2.248 | Az tokenla video okutma | 1 fps'e göre kare sayısında -%84; ev dizinine yazdı | Gerçek | Geç |
| fauxnix | 995 | 270 vakada Git Bash ile aynı çıktı | 269/270; bağımsız set 8/10 | Gerçek | Geç |
| v4-pro | 3 | 35/35; temiz kodda P0 yanlış pozitif yok | 35/35 ama 1 P0 yanlış pozitif; P1 gürültülü | Gerçek | Geç |

(*) İki ayrı mcp-cli deposu var; `C` raporu hangisini kurduğunu yazmıyor. Yıldız, `on-tarama` satırındaki philschmid/mcp-cli değeri (1.280), wong2/mcp-cli için 446.

## Balon Sayacı

Balon ve Kısmi sınıflı 23 aracın yıldızları toplamı 423.297. Yani yaklaşık 423 bin yıldız, ölçüldüğünde iddianın yarısına ulaşmayan ya da tutmayan bir iddiaya verilmiş.

Bu sayı yıldızın kanıt olmadığını gösterir. En büyük paylar graphify (130.796), caveman (113.970) ve code-review-graph (32.295).

| Sınıf | Araç Sayısı | Yıldız Toplamı |
|---|---|---|
| Gerçek | 14 | 332.045 |
| Kısmi | 18 | 388.517 |
| Balon | 5 | 34.780 |
| Ölçülemedi | 8 | 62.036 |
| İddia yok | 10 | 83.511 |
| Toplam | 55 | 900.889 |
| Balon + Kısmi | 23 | 423.297 |

Not: hatel'in yıldızı 0, gerisi raporlardan. mcp-cli için philschmid değeri kullanıldı (tabloda işaretli); wong2 olsaydı toplam 834 düşerdi.

## Core'a Karşı

Core'un karşılığı olan alanlarda sonuç şöyle.

- **Komut kapısı:** yasak.js 17/18 yakaladı (2/12 yanlış alarm), cc-safety-net 13/18 (0/12), dcg 15/18 (2/12). Core kazandı. Tek ödünç: cc-safety-net'in echo ve grep içindeki metni ayırması, yasak.js'in iki yanlış alarmını giderir.
- **Maliyet:** token sayısında ccusage ile Core birebir aynı. USD'de ccusage kazandı, Core eksik hesaplıyordu (bkz. Core'da Bulunan Hata). tokencost ve ttok Claude token'ını %17-36 eksik saydı; Core burada kazandı.
- **Oturum çözümleyici:** context-diff, maliyet.js ile birebir aynı bağlam dizisini verdi. Berabere, araca gerek yok.
- **Bağlam yüzdesi:** claude-crusts, Core'un count.js'inden %0,1-0,9 sapıyor. Berabere; crusts'ın artısı israf dökümü.
- **Ölü kod:** map.js'in kaçırdığı 3 yetim test dosyasını knip (tek satır yapılandırmayla) buldu. Bu alanda araç kazandı, çıplak hâli ise gürültülü (15/20 yanlış).
- **Devir:** handoff.js 0 B/tur ve deterministik. claude-handoff 776 B açıklama taşıyor, çağrılınca ~38 KB okutuyor; kalite A/B yapılamadı (kimlik yok).
- **İş defteri:** jobs.md aynı 5 işi 172 B ile tutuyor. beads her tur ~9,4 KB taşıyor. 10-50x iddiası jobs.md'ye karşı ölçülemedi.
- **Çıktı sıkıştırma:** headroom, RTK'ya göre bilgiyi daha iyi koruyor (RTK k1 ve k3'te 0/3), ama 2 GB kurulum bedeli var. context-mode ham çıktıya karşı -%98 tutarken sabit ~10k tok yük ve düşük ilk isabetle Core'u geçemedi.
- **Stop kapısı:** tdd-guard her düzenlemede model çağrısı yapıyor; Core K1 modelsiz kalacak. A/B yapılamadı.

## Alınanlar

Aşağıdakiler yalnız çağrılınca çalışır, her tur yükü 0'dır. Karar sahibindir.

- **headroom:** büyük JSON araç çıktısını bilgiyi koruyarak yarıya indiriyor. Bedeli 2 GB kurulum. MCP kipinde 3 araç tanımı her tur yük bindirir, bu yüzden MCP olarak değil çağrılınca (kütüphane ya da CLI) kullanılmalı.
- **markitdown:** PDF ve DOCX okurken aynı doğrulukla yarı ile onda bir token. CLI, yük 0.
- **graphify:** iddianın yarısına ulaşmadı ama Q2, Q3 ve Q4'te hem ucuz hem eşit doğru. Yalnız istenince çağrılan, isteğe bağlı araç olarak. Q1'de tuzağa düştü (2/3).
- **betterleaks:** sahte sırların tamamını yakaladı. Sürüm betiğine tek satırlık kapı olabilir.
- **scc:** üç depoda satır sayımı birebir doğru, 51-80 ms. Rapor betiklerinde kullanılabilir.
- **knip:** yapılandırmayla Core'un kaçırdığı yetim testleri buluyor. İsteğe bağlı denetim komutu olarak.

Yalnız fikri alınabilecekler (araç kurulmaz): claude-pace'in tempo farkı, cc-cache-monitor'ın uçurum tespiti, claudeignore'un okuma yasağı, claude-crusts'ın israf dökümü.

### Kurulu Yerleri

Altısı da ölçüm sırasında resmi kaynaktan kuruldu ve yerinde bırakıldı; PATH'e, ayarlara ya da herhangi bir CLAUDE.md'ye eklenmedi, her tur yükü 0. Çağırmak için tam yol:

| Araç | Çalıştırılabilir | Boyut |
|---|---|---|
| headroom | `C:\Users\Administrator\olcum-dis\headroom\.venv\Scripts\headroom.exe` | 2,1 GB |
| markitdown | `C:\Users\Administrator\olcum-dis\markitdown\.venv\Scripts\markitdown.exe` | 191 MB |
| graphify | `C:\Users\Administrator\olcum-dis\graphify\venv\Scripts\graphify.exe` | 185 MB |
| betterleaks | `C:\Users\Administrator\olcum-dis\betterleaks\betterleaks.exe` | 34 MB |
| scc | `C:\Users\Administrator\olcum-dis\scc\scc.exe` | 25 MB |
| knip | `C:\Users\Administrator\olcum-dis\knip\node_modules\.bin\knip.cmd` | 23 MB |

`olcum-dis` altındaki öteki klasörler ölçüm artığıdır; sahip onaylarsa silinir.

## Yan Etkiler

Yalıtım kuralına uymayan araçlar:

- **context-mode** ilk çalıştırmada gerçek `~/.claude/settings.json` dosyasına yazdı (SessionStart kancası, `enabledPlugins` girişi, `~/.claude/hooks/context-mode-cache-heal.mjs`, `~/.claude/context-mode/`). Geri alındı; iki giriş çıkarıldı, dosyalar `olcum-dis\context-mode\yan-etki\` altına taşındı, `settings.json` ve `~/.claude.json` içinde "context-mode" geçmiyor. Sonraki koşular kum ortamında yapıldı.
- **claude-real-video** `USERPROFILE`'ı yok sayıp `C:\Users\Administrator\.crv\memory.db` yazdı. `olcum-dis\claude-real-video\yan-etki\crv-dizini` altına taşındı.
- **headroom** `~/.headroom/ccr_store.db` (16 KB) oluşturdu. Kanca proje dışı silmeyi engellediği için dosya duruyor; sahibin silmesi gerekir.
- **codebase-memory-mcp** boş bir `C:\Users\Administrator\.cache\codebase-memory-mcp` dizini açtı; içinde dosya yok.
- v4-pro klondaki `RESULTS.md` dosyasını değiştirdi (klon içi, zararsız).

Olası sır bulgusu: betterleaks, VidShrink git geçmişinde 32 karakterlik bir "Api-Key" buldu. Dosya `docs/arastirma/opensubtitles-istemci-kutuphaneleri.md`, commit 5df2536c, satır 63. Değer bu rapora yazılmadı. Gerçek bir anahtarsa sağlayıcıda yenilenmesi gerekir.

## Core'da Bulunan Hata

`bench/maliyet.js`, 1 saatlik önbellek yazmasını 5 dakikalık fiyatla sayıyordu. Üç oturumda Core'un USD değeri %8-20 eksik çıktı. Örnek: fd5896c9 oturumunda Core 12,5640 $, ccusage 15,6612 $.

1 saatlik yazma 2x girdi fiyatıyla sayılınca sonuç ccusage ile kuruşu kuruşuna aynı oldu (fd5896c9 ve 85a3c31c). Üçüncü oturumda (c0fc84d3) düzeltmeli değer 49,3992 $, ccusage 49,3924 $.

Düzeltme: `bench/maliyet.js` artık `usage.cache_creation.ephemeral_1h_input_tokens` değerini ayrı okuyor ve 1 saatlik yazmayı 2x girdi fiyatıyla sayıyor (tarifede `cacheYazma1s` kalemi varsa onu kullanır). 2x çarpanı resmi claude-api başvuru tablosundan: "Cache writes cost 1.25× for 5-minute TTL, 2× for 1-hour TTL". Testi `test/bench-maliyet.js`.
