# Base ile Core Arasındaki Fark: Ölçüm Denetimi

Tarih: 2026-09-06. Base `187bdb9` (`teknesyum/` altı), Core 0.19.0. Soru: Base'de olup Core'da olmayan her parça için "ölçüldü mü, daha ucuz sürümü var mı, ölçülmeli mi" cevabı.

Kural: sıradan turda bağlama sıfır bayt. Daha ucuz sürümü yazılabilen parça önce yazılır sonra ölçülür; yazılamayan olduğu gibi ölçülür; pahalılığı bilinen parça ölçülmeden atlanır, gerekçesi yazılır. Bench harcaması `bench/deney/base-fark.karar.md`, kanca gecikmesi `bench/gecikme.md`.

## Tablo

| # | Base parçası | Core'da | Ölçüm | Daha ucuz sürüm | Karar |
|---|---|---|---|---|---|
| 1 | Röle becerisi: isteği sınıflandırma, ölçü satırı, ajan planı (SKILL.md 20 KB + 100 KB referans) | K0 kuralı + plan ipucu | rapor §2, §8 u0-hepsi (4–8 kat), §9 | K0 zaten ucuz sürüm | kapalı |
| 2 | Öncül tarama: 1/10/50 depo, scout ajanları, mekanik kapı | `scout.js brief`, tek çağrı, kapılı | yok | Core sürümü zaten ucuz | ölçmeden atla: sıradan turda 0; bench görevleri öncül istemiyor, ölçüm kazanç gösteremez; 50 depo pahalılığı bilinen |
| 3 | Üç platform standardı + `platform-denetim.js` | yok | yok | betik model çağırmaz | atla: betik 0 token; kural metni beceriyle giriyor, u0'da ölçüldü |
| 4 | Sözleşmeler, tamamlama kapısı, denetim kaydı, `done/` koruması | test kaydı + ağaç özeti (0.19) | §8 u0, u3-guard (sinyal yok) | 0.19 test kaydı | kapalı |
| 5 | `live/` izleri ve kendiliğinden devam | handoff | §4, §6, §7 | handoff | kapalı |
| 6 | Düzeltme döngüsü: denetçi 1–3 aynı ajan, 4–5 güçlü model | yok | u0 içinde; ucuz sürümü u4-verify §8 ret | u4-verify | kapalı |
| 7 | Görev paketleri, oturum dışı işçi, beş satır teslim | yok | yok | yok | atla: çok oturum ve elle yapıştırma, bench ölçemez; büyük iş için tasarlandı |
| 8 | Yedi ajan tanımı (942 B tanım her turda sistem isteminde) | `agency.js` koltuk, istenince | u0 | istenince yükleme | atla: aritmetik yeter, ~240 token/tur cache okuması |
| 9 | Plan konseyi (fable + opus planner), premium profili, ikinci görüş | `??` netleştirme, tek çağrı | yok | `??` | ölçmeden atla: iki fable/opus ajanı pahalılığı bilinen; `??` yalnız istenince |
| 10 | On beş slash komutu (1026 B tanım + 502 B beceri tanımı her oturumda) | betikler | yok | betik sürümü zaten Core | atla: ~400 token/oturum cache okuması, aritmetik yeter |
| 11 | `/scan` sertifika: öncül sayısı, `kapsam.json`, mühür, belge | `scan.js` yedi kontrol | yok | `scan.js` | atla: model çağırmaz; `kapsam.json` kancası bağlama 0 yazar, gecikmesi tabloda |
| 12 | Ajan izleme (takılma, döngü) + tur makbuzu | süreç sayacı | §8 u5-kapi | süreç sayacı | kapalı |
| 13 | `/save` `/load` `/saveall` `/loadall` | handoff | §4, §6, §7 | handoff | kapalı |
| 14 | `/rc` uzaktan kumanda | yok | yok | yok | atla: masaüstü yardımcısı, model maliyeti komut tanımından ibaret (10) |
| 15 | UI standardı: `/uisetup`, `/uicheckup`, teknesyum-ui becerisi 60 KB | ayrı depo, kurulu değil | yok | ayrı eklenti | atla: ~15k token yalnız UI işinde yüklenir; bench'te UI görevi yok, ayrı depo kararı verildi |
| 16 | Statusline: plan limitleri, sözleşme, ajan süresi | statusline | §1 kanca baytı 0 | - | kapalı: modele gitmez |
| 17 | Sözdizim denetimi: Write/Edit sonrası `node --check` / `JSON.parse`, yalnız bozuksa tek satır | yok | **bu tur: c3-sozdizimi** | yok, zaten sessiz | bench sonucuna göre, aşağıda |
| 18 | `.lsp.json`: typescript-language-server kaydı | yok | **bu tur: c4-lsp** | yok, tek dosya | bench sonucuna göre, aşağıda |
| 19 | PostCompact: açık sözleşme ve rota yeniden besleme | yok | yok | yok | atla: bench görevleri kompaksiyona ulaşmaz; Claude Code özeti + handoff aynı işi görür |
| 20 | StopFailure kaydı (rate limit, aşırı yük) | yok | yok | - | atla: günlük, 0 token |
| 21 | Dil talimatı: SessionStart'ta bir kez additionalContext (~100 karakter) | strings.json, modele talimat yok | yok | - | atla: ~25 token/oturum |
| 22 | Her istekte ölçü hükmü zorunluluğu (UserPromptSubmit) | yok | §8 u1-cue benzeri: pahalı, sinyal yok | - | kapalı |
| 23 | `kapsayici.js`: üst klasörde açılan oturum, hafıza taşıma, aktif proje modele | kural: projede aç | yok | kural | atla: bench kökte koşar, yol hiç girmez |
| 24 | `ekran-kapisi.js`: computer-use / Windows-MCP kapısı | yok | gecikme 39 ms/Bash | - | atla: bağlama 0, bench'te ekran aracı yok |
| 25 | `beep.js` | `notify.js` | - | - | kapalı |
| 26 | `ozel.js` özel ayna, `/pusla` | elle | - | - | atla: 0 model |
| 27 | `/rule` | RULES.md elle | - | - | atla: 0 model |
| 28 | `harita.js` | `map.js` | - | - | kapalı |
| 29 | Repo hijyeni: DCO, CONTRIBUTING, biome, CI, install.sh | kısmen | - | - | atla: 0 model, ayrı iş |

## Kanca gecikmesi, model dışı

Aynı yük, on tekrar, medyan; `bench/gecikme.md`. Boş `node -e 0` 33 ms.

| çağrı | Base | Core | c3 eklenince |
|---|---|---|---|
| Bash başına | contract-guard 38 + ekran-kapisi 39 + relay-watch 77 = 154 ms | loop 36 + count 38 = 74 ms | 74 ms |
| Write başına | contract-guard 71 + relay-watch 105 = 176 ms | prefs 42 + count 62 = 104 ms | 169 ms |
| istem başına | relay-watch 76 ms | 0 | 0 |
| Stop | relay-watch 93 ms | count 62 ms | 62 ms |

## Bench sonucu

Deney dosyası `bench/deney/base-fark.json`, karar `bench/deney/base-fark.karar.md`, ham `bench/base-fark.jsonl`. Koltuk sonnet/low, n=3, hiçbir koşul beklentiyle çelişmedi, ikinci tur koşulmadı. 4.19 $ (9 koşu).

| koşul | görev | taban | 1. tur $ | ortalama | yön | kabul | kanca ateşlendi |
|---|---|---|---|---|---|---|---|
| c3-sozdizimi | 06 | 0.37 | 0.36 / 0.30 / 0.35 | 0.34 | esit | 3/3 | 0 |
| c3-sozdizimi | 07 | 0.74 | 0.60 / 0.77 / 0.72 | 0.70 | esit | 3/3 | 0 |
| c4-lsp | 06 | 0.37 | 0.49 / 0.34 / 0.25 | 0.36 | esit | 3/3 | LSP aracı 0 çağrı |

Karar:

- 17 sözdizim denetimi: altı koşuda model bir kez bile bozuk dosya yazmadı, satır hiç girmedi; maliyet 0, sinyal 0. Girmiyor, `bench/varyant/c3-sozdizimi` altında duruyor. Bozuk yazımın sık olduğu bir görev çıkarsa aynı dosyayla tek komut.
- 18 .lsp.json: üç koşuda LSP aracı hiç çağrılmadı, maliyet gürültü içinde. Girmiyor; kullanıcının makinesinde typescript-lsp resmi eklentisi zaten kayıtlı, ikinci kayıt uyarı üretir.

Sonuç: Base ile Core arasındaki 29 farkın 13'ü daha önce ölçülmüş, 2'si bu turda ölçüldü, 14'ü gerekçesiyle ölçülmeden atlandı. Ölçülüp Core'a giren parça yok.
