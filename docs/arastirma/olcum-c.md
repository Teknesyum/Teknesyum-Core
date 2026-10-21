# Ölçüm C: Belirleyici Araçlar

Tarih 2026-10-21. Plan S/S1, C kolu. Ham veri `bench/olcum-c.jsonl` (42 satır). Kurulumların hepsi
`C:\Users\Administrator\olcum-dis\<araç>\` altında. Hook kuranlar yalnız yalıtılmış HOME/CLAUDE_CONFIG_DIR'e
kuruldu; `~/.claude/settings.json` mtime 13:09'da kaldı, dokunulmadı. Deneyler kopyalarda yapıldı:
`kopya/Teknesyum-Core @08f6120`, `kopya/VidShrink @031b6f291`, `kopya/DustyBytes @79d9765`.

Sınıf (S): Gerçek = iddianın en az yarısı tuttu; Kısmi = bir kısmı tuttu; Balon = tutmadı ya da tersine döndü.
Her tur yükü = aracın sıradan bir turda modelin bağlamına eklediği bayt.

## Özet Tablo

| Araç | Sınıf | Her Tur Yükü | Core Karşılığı |
|---|---|---|---|
| knip | Kısmi | 0 | map.js (yetim) |
| fallow | Kısmi | 0 | map.js |
| betterleaks | Gerçek | 0 | yok |
| ripsecrets | Ölçülemedi | — | yok |
| scc | Gerçek | 0 | yok |
| cc-safety-net | Kısmi | 0 (ret: 429 B) | yasak.js |
| dcg | Kısmi | 0 (ret: 5152 B) | yasak.js |
| claudeignore | Kısmi | 0 (senkron anında 320 B) | yok |
| skill-scanner | Kısmi | 0 | yok |
| tokencost | Balon | 0 | maliyet.js |
| ttok | Balon | 0 | maliyet.js |
| promptfoo | Gerçek | 0 | yok |
| ccusage | Gerçek | 0 | maliyet.js |
| unclog | Ölçülemedi | — | yok |
| claude-crusts | Gerçek | 0 (kanca kapalıyken) | count.js bağlam yüzdesi |
| cc-cache-monitor | Kısmi | 0 (+ komut açıklaması ~230 B) | yok |
| claude-pace | Gerçek | 0 | statusline |
| mcp-cli | Kısmi | 0 (skill 3446 B, çağrılınca) | yok |
| mcporter | Kısmi | 0 | yok |
| playwright-cli | Kısmi | 0 (skill 15428 B, çağrılınca) | yok |
| dbhub | Gerçek | MCP olarak şema 1187 B | yok |
| communique | Ölçülemedi | — | yok |

## Core İçin Çıkan Bulgu

Core'un `bench/maliyet.js` hesabı, 1 saatlik TTL ile yazılan önbelleği 5 dakikalık fiyattan sayıyor.
Üç oturumda Core USD değeri %8-20 eksik çıktı. 1 saatlik yazmayı 2× girdi fiyatıyla sayınca sonuç
ccusage ile kuruşu kuruşuna aynı oldu. Örneğin fd5896c9 oturumunda 1h yazma 1.032.408 token, 5m yazma 58.653 token.
`docs/tarife.json`'a `cacheYazma1h` kalemi ve `usage.cache_creation.ephemeral_1h_input_tokens` okuması gerekiyor.

## knip

- **İddia:** Kullanılmayan dosya, export ve bağımlılıkları bulur.
- **Kurulum:** npm `knip` 6.42.1, resmi depo webpro-nl/knip, 18.2 MB, `--ignore-scripts`.
- **Kapsam:** VidShrink ve DustyBytes C# olduğu için kapsam dışı.

| Ölçüm | Değer |
|---|---|
| Süre (3 tekrar, Core) | ~540 ms |
| Bulgu, yapılandırmasız | 76 (50 dosya, 26 export) |
| 20 bulguluk örnekte yanlış pozitif | 15/20; 26 export bulgusunun hepsi yanlış |
| Bulgu, tek satır `knip.json` girişiyle | 12, bunların 5'i doğru |

- **Doğru bulgular:** `test/bench-kosu.js`, `test/bench-maliyet.js`, `test/bench-onkontrol.js` (test/run.js bunları çalıştırmıyor), `tools/audit-evidence.js`, `tools/full-review-probes.js`.
- **Her tur yükü:** 0.
- **Hüküm:** Yapılandırmayla Core map.js'in kaçırdığı 3 yetim testi buluyor, ama hooks.json girişlerini bilmediği için çıplak hâli gürültülü. İsteğe bağlı bir denetim komutu olarak alınabilir.

## fallow

- **İddia:** Hızlı ölü kod, tekrar ve karmaşıklık analizi. next.js'te 20558 dosyayı 2,95 sn'de taradığını söylüyor.
- **Kurulum:** npm `fallow` 3.34.1, 92.4 MB.

| Ölçüm | Değer |
|---|---|
| Süre (3 tekrar) | 775 / 417 / 419 ms |
| Bulgu | 56 |
| 20 bulguluk örnekte yanlış pozitif | 15/20, knip ile aynı |
| Ek çıktılar | 28 klon grubu (%4,05), eşiği aşan 300 fonksiyon (108'i kritik) |

- **Notlar:** Telemetri isteğe bağlı. Hız iddiası kendi depolarımızda sınanamadı.
- **Her tur yükü:** 0.
- **Hüküm:** knip ile aynı ölü kod sonucu veriyor; artısı tekrar ve karmaşıklık raporu. Core'da karşılığı yok ama acil bir boşluk da değil.

## betterleaks

- **İddia:** Dizinde ve git geçmişinde sır taraması.
- **Kurulum:** `betterleaks_1.9.0_windows_x64.zip`, GitHub sürümü, 10.124.912 B.

| Depo | Süre | Bulgu | Yanlış Pozitif |
|---|---|---|---|
| Core dir / git | 330-470 / 895 ms | 0 / 0 | — |
| VidShrink dir | 480-680 ms | 44 | 44/44 (40'ı Locales "Password" etiketi) |
| VidShrink git | 4267 ms | 47 | 46/47 |
| DustyBytes | — | 0 | — |
| Core + 5 sahte sır (3 tekrar) | 414-594 ms | 5/5 yakaladı | 0 |

- **Olası gerçek sır:** VidShrink geçmişinde bir tane var: `docs/arastirma/opensubtitles-istemci-kutuphaneleri.md`, commit 5df2536c, satır 63, 32 karakterlik "Api-Key". Değeri burada yazılmadı.
- **Her tur yükü:** 0.
- **Hüküm:** Sahte sırların hepsini yakaladı, geçmişte bir olası gerçek anahtar buldu. Core'da sır tarayıcı yok; çağrılınca çalışan bir komut olarak alınmaya değer.

## ripsecrets

- **İddia:** Hızlı sır tarama.
- **Kurulum:** `cargo install --git`, hem main hem v0.1.11 Windows'ta derlenmedi (`std::os::unix`, E0433). Windows ikilisi yok.
- **Sınıf:** Ölçülemedi.
- **Hüküm:** Windows'ta kurulamıyor; betterleaks onun işini görüyor.

## scc

- **İddia:** Hızlı ve doğru satır ve karmaşıklık sayımı.
- **Kurulum:** `scc_Windows_x86_64.zip` v4.1.0, 7.244.303 B.

| Depo | Süre (3 tekrar) | Toplam Satır, Bağımsız Sayımla |
|---|---|---|
| Core | 58-64 ms | JS 12043, birebir aynı |
| VidShrink | 75-80 ms | C# 291208, birebir aynı |
| DustyBytes | 51-55 ms | C# 48541, birebir aynı |

- **Her tur yükü:** 0.
- **Hüküm:** Hızlı ve doğru; Core'da karşılığı yok, rapor betiklerinde kullanılabilir.

## Komut Koruyucuları

30 komut, Core yasak.js setiyle aynı: 18 tehlikeli, 12 zararsız. Araç Bash.

| Koruyucu | Yakalama | Yanlış Alarm | Süre | Ret Mesajı |
|---|---|---|---|---|
| Core yasak.js | 17/18 | 2/12 | ~35 ms | 169 B |
| cc-safety-net 2.6.16 (npm, 2.1 MB) | 13/18 | 0/12 | 69 ms | 429 B |
| dcg v0.15.3 (zip 6.321.575 B) | 15/18 | 2/12 | 29 ms | 5152 B ort. (en çok 7000) |

- **yasak.js:**
  - Kaçırdığı: `git checkout -- .`
  - Yanlış alarmları: `echo "rm -rf /"` ve `grep -r "git push --force"`.
- **cc-safety-net:**
  - Kaçırdıkları: Remove-Item -Recurse -Force, `rmdir /s /q`, `chmod -R 777 /`, `gh repo delete`, Format-Volume.
  - Araç PowerShell olunca 14/18.
  - Yalıtılmış kurulumda kancası PreToolUse, matcher yok, yani her araç çağrısında çalışıyor. Skill'i `disable-model-invocation` ile kapalı.
- **dcg:**
  - Kaçırdıkları: `chmod 777`, `gh repo delete`, `git push origin :main`.
  - Yanlış alarmları: proje içinde `rm -rf node_modules` ve `rm -rf ./build`.
  - Araç PowerShell olunca 14/18.
- **Hüküm:** İkisi de yasak.js'in yakalamasını geçemiyor. cc-safety-net'in yanlış alarmı 0, bu yüzden onun zararsız ayrımı (echo/grep içindeki metin) yasak.js'e örnek olabilir. dcg'nin 5 KB'lık ret mesajı her retti modele yük bindiriyor.

## claudeignore

- **İddia:** gitignore kurallarını sandbox `denyRead` listesine ve PreToolUse kancasına aktararak tüm araçlarda dosya erişimini keser.
- **Kurulum:** `claudeignore_windows_amd64.zip` v0.1.4-alpha, 1.654.165 B.
- **Deney ortamı:** Kopya depo `kopya/ci-depo`, yalıtılmış HOME. `init` etkileşimli olduğu için `sync` ve `install-hook` ayrı çalıştırıldı.

| Ölçüm | Değer |
|---|---|
| Yerleşik araçlarda yakalama | 5/7 (Read .env, id.pem, Edit, Grep secrets, Glob secrets/*) |
| Kaçan | `Read secrets\a.txt` (Windows yolu, yasaklı klasörün içi) |
| Bash `cat .env` | geçti; sandbox Windows'ta yok |
| Yanlış alarm | 0/4 |
| guard süresi / ret mesajı | ~85 ms / 85-94 B |
| UserPromptSubmit `check` | 460 ms; 0 B, yalnız senkron gerektiğinde 320 B systemMessage |
| Proje kancası | 252 B (ikili PATH'te değilse kurulum hatırlatması) |

- **Hüküm:** Yerleşik araçlarda çoğunlukla çalışıyor. Ama Windows'ta Bash koruması yok ve klasör içi Windows yolunu kaçırıyor. Core'da okuma yasağı yok; fikir alınabilir, araç olduğu gibi alınmaz.

## skill-scanner

- **İddia:** Skill'lerde prompt injection, veri sızdırma ve kötü kod tespiti.
- **Kurulum:** PyPI `cisco-ai-skill-scanner` 2.3.0, uv venv, 387.6 MB.
- **Kendi README'si:** Kurallar tek başına kötü skill'lerin yalnız ~%8'ini yakalıyor.

| Ölçüm | Değer |
|---|---|
| 5 kötü örnek (statik + davranış) | 2/5 yakalandı (injection, base64 exec + env sızdırma) |
| Kaçan | `~/.ssh`'ı curl ile gönderen betik (yalnız LOW), bashrc/crontab kalıcılığı, doğal dille sızdırma |
| 10 temiz skill | 1/10 yanlış alarm (skill-creator, CRITICAL) |
| Süre | ~7,2-7,7 sn |
| LLM hakemi | anahtar gerekir — ölçülemedi |

- **Hüküm:** LLM'siz hâli zayıf. Core bu işi yapmıyor ve bu hâliyle almaya değmez.

## tokencost ve ttok

- **İddia:** Çevrimdışı token sayımı (tiktoken) ve maliyet tahmini.
- **Kurulum:** PyPI `tokencost` 0.1.26 (26.9 MB) ve `ttok` 1.0 (6.3 MB).
- **Gerçek değer nasıl bulundu:** Metinli ve metinsiz alt ajanın ilk çağrı girdisi farkı. sonnet-5-5 ve opus-5-5 aynı sayıyı verdi (en: 1008 ve 1008).

| Metin (3000 B) | Gerçek Claude | ttok o200k | Sapma | tokencost gpt-4o | Sapma |
|---|---|---|---|---|---|
| İngilizce md | 1008 | 726 | -28,0% | 721 | -28,5% |
| Türkçe md | 1633 | 1347 | -17,5% | 1083 | -33,7% |
| JS | 1749 | 1114 | -36,3% | 1114 | -36,3% |
| JSON | 952 | 699 | -26,6% | 698 | -26,7% |

- **Süre:** ttok ~450 ms, tokencost ~1,8-2,1 sn.
- **tokencost'un Claude yolu:** Anthropic sayım API'sini istiyor; anahtar gerekir — ölçülemedi. Fiyat tablosunda opus-5 ve sonnet-5 satırı yok.
- **Hüküm:** Claude token'ını %17-36 eksik sayıyorlar. Core usage'ı doğrudan okuduğu için bunlara gerek yok. Sınıf Balon.

## ccusage

- **İddia:** Claude Code günlüklerinden token ve maliyet raporu.
- **Kurulum:** npm `ccusage` 20.0.37, 5.0 MB.
- **Deney:** 3 transkript yalıtılmış klasöre kopyalandı.

| Oturum | Token, Core'a Göre | ccusage USD | Core USD | 1h-TTL Düzeltmeli USD |
|---|---|---|---|---|
| fd5896c9 | %0 sapma | 15.6612 | 12.5640 | 15.6612 |
| 85a3c31c | %0 sapma | 6.8658 | 5.7194 | 6.8658 |
| c0fc84d3 | %0 sapma | 49.3924 | 45.8471 | 49.3992 |

- **Süre:** ilk koşu 21 sn (fiyat yükleme), sonra ~390 ms.
- **Kapsam uyarısı:** Gerçek HOME'da codex ve gemini günlüklerini de okuyor (yalnız okuma).
- **Hüküm:** Token sayımı Core ile birebir aynı, USD'de ise ccusage doğru, Core eksik. Araç alınmaz; Core'un tarifesi düzeltilir.

## unclog

- **İddia:** Kurulu agent, skill ve MCP'lerin her tur token'ını gösterir.
- **Kurulum:** PyPI `unclog` 0.3.0, 12.8 MB.
- **Durum:** README "macOS or Linux" diyor. Windows'ta yalnız `--help` çalıştı, komut listesi boş. Ayrıca araç etkileşimli ve silme odaklı.
- **Sınıf:** Ölçülemedi (bütçe tavanına gelince durdu).
- **Hüküm:** Core'un "sıradan tur 0 B" ölçüsü bu işi zaten görüyor.

## claude-crusts

- **İddia:** Bağlam dökümü, israf tespiti, sıkıştırma önerisi.
- **Kurulum:** npm `claude-crusts` 0.8.1, 1.0 MB.

| Oturum | crusts Bağlam | Gerçek Son Bağlam | Sapma | Süre |
|---|---|---|---|---|
| fd5896c9 | 92284 | 91435 | +0,9% | 292 ms |
| 85a3c31c | 105856 | 105707 | +0,1% | 380 ms |
| c0fc84d3 | 99659 | 98790 | +0,9% | 390 ms |

- **İsraf bulguları:** 19. Tekrar okuma ve bayat okuma isabetli görünüyor; "kullanılmayan sonuç" türü sezgisel.
- **Her tur yükü:**
  - `status` kancası her turda ~230 ms sürüyor ve 50 B yazıyor (kullanıcıya).
  - auto-inject UserPromptSubmit kancası yalnız sıkıştırma eşiğinde metin ekliyor; varsayılan kapalı.
- **Hüküm:** Ölçüsü doğru, analizi isteğe bağlı çalışıyor. Core'un bağlam yüzdesinin üstüne israf dökümü veriyor; ilham alınabilir, kurmaya gerek yok.

## cc-cache-monitor

- **İddia:** PostToolUse kancası ~45 ms (değişiklik yoksa <5 ms), önbellek uçurumu tespiti, statusline.
- **Kurulum:** git clone Todmy/cc-cache-monitor, 205 KB. `install.sh` çalıştırılmadı; betik doğrudan koşturuldu.

| Ölçüm | Değer |
|---|---|
| Kanca süresi (3 oturum × 3) | 298-675 ms (iddia 45 ms) |
| Hızlı yol (değişiklik yok) | 451-602 ms (iddia <5 ms) |
| Uçurum tespiti (artımlı örnek) | 3/3 |
| Oturum maliyeti | yalnız son 200 satır (4,78 $; tam oturum 15,66 $) |

- **Statusline:** Anthropic rate-limit API'si için OAuth ve python3 istiyor; ölçülmedi.
- **Her tur yükü:** Kanca modele 0 B yazıyor. `/usage-details` komut açıklaması ~230 B.
- **Hüküm:** Uçurum tespiti çalışıyor ama süre iddiası Windows'ta 7-13× tutmuyor. Core'da karşılığı yok; fikir olarak kaydedilir.

## claude-pace

- **İddia:** 5 saatlik ve 7 günlük kota tempo farkı (⇡/⇣).
- **Kurulum:** npm `claude-pace` 0.9.5, 23.6 KB.

| Kullanım / Kalan | Beklenen Fark | Çıkan Fark |
|---|---|---|
| %60 / 30 dk | ⇣30 | ⇣30 |
| %60 / 240 dk | ⇡40 | ⇡40 |
| %20 / 120 dk | ⇣40 | ⇣40 |

- **Süre:** 291-602 ms.
- **Her tur yükü:** Statusline modele girmiyor, 0.
- **Hüküm:** Hesap doğru; Core'un statusline'ına tempo farkı eklemek için iyi bir örnek.

## MCP→CLI Köprüleri: mcp-cli, mcporter, playwright-cli

**Önemli:** Claude Code MCP araç şemalarını erteliyor. Her turda bağlama yalnız araç adları giriyor;
şema ToolSearch ile bir kez yükleniyor. Bu yüzden "her turda şema yükü" iddiası bugün çoğunlukla geçersiz.

- **mcporter:** npm 0.16.0, 59.4 MB.
- **mcp-cli:** kaynak 1.9 MB + bun 96.4 MB + SDK 21 MB. Windows ikilisi yok.
- **playwright-cli:** npm `@playwright/cli` 0.1.22, 18.8 MB. Playwright MCP aynı pakette (`playwright mcp`).
- **Tarayıcı:** msedge, headless; sayfa yerel 127.0.0.1.

| Ölçüm | MCP | CLI |
|---|---|---|
| Playwright şeması (25 araç) | 17616 B, ~3747 o200k (~5100 Claude token) | skill açıklaması ~90 B; SKILL.md 15428 B çağrılınca |
| Aynı iş (aç, snapshot, doldur, tıkla, oku, kapat) | 1668 B çıktı | 1629 B çıktı |
| dbhub şeması (2 araç) | 1187 B | `info` 544 B + 358 B |
| dbhub sorgusu | 369 B | 369 B |
| Çağrı süresi | — | mcp-cli 0,87-1,07 sn; mcporter 4,2 sn |

- **mcp-cli kusuru:** Sunucunun stderr'ini (~1,7 KB banner) de basıyor; `2>&1` kullanan ajan bunu okur.
- **Hüküm:** Sayfa ve sorgu çıktısı iki yolda aynı. Kazanç yalnız şema ertelenmemişse ortaya çıkıyor. Claude Code'da ertelemeyle kazanç birkaç yüz bayta iniyor. Sınıf Kısmi; Core için gerek yok.

## dbhub

- **İddia:** Tek MCP sunucusuyla birçok veritabanı.
- **Kurulum:** npm `@bytebase/dbhub` 1.5.0, 91.2 MB. Node 22.5+ `node:sqlite` gerekiyor.
- **Deney:** SQLite demo veritabanı (3 satır); `execute_sql` doğru 2 satırı döndü.
- **Her tur yükü:** MCP olarak 1187 B şema (ertelenirse yalnız ad).
- **Hüküm:** Çalışıyor; Core'un işi değil.

## promptfoo

- **İddia:** İstem ve çıktı için doğrulamalı test.
- **Kurulum:** npm `promptfoo` 0.124.1, 1.30 GB (ağır).
- **Deney:** Anahtarsız `echo` ve `exec` sağlayıcıyla 4 vaka, 11 doğrulama; 11'i de doğru hükmedildi. Süre 2,5 sn.
- **Dikkat:** `icontains` Türkçe "İ" harfinde yerel duyarsız; "SİPARİŞİN" eşleşmedi.
- **Her tur yükü:** 0.
- **Hüküm:** Çalışıyor ama 1,3 GB; Core'un kendi test koşucusu bu boyda bir işe ihtiyaç duymuyor.

## communique

- **İddia:** LLM ile sürüm notu.
- **Kurulum:** `communique-x86_64-pc-windows-msvc.zip` v1.6.2, 4.034.097 B.
- **Durum:** `generate --dry-run` GitHub remote'u olmayan kopyada "cannot parse GitHub repo" verdi. README Anthropic ya da OpenAI anahtarı istiyor.
- **Sınıf:** anahtar gerekir — ölçülemedi.
- **Hüküm:** Ölçülmeden alınmaz.

## İndirmeler

| Ad | Kaynak | Boyut |
|---|---|---|
| betterleaks_1.9.0_windows_x64.zip | GitHub sürümü | 10.124.912 B |
| scc_Windows_x86_64.zip v4.1.0 | GitHub sürümü | 7.244.303 B |
| claudeignore_windows_amd64.zip v0.1.4-alpha | GitHub sürümü | 1.654.165 B |
| dcg-x86_64-pc-windows-msvc.zip v0.15.3 | GitHub sürümü | 6.321.575 B |
| communique-x86_64-pc-windows-msvc.zip v1.6.2 | GitHub sürümü | 4.034.097 B |
| npm (knip, fallow, cc-safety-net, ccusage, claude-crusts, claude-pace, mcporter, @playwright/cli, @bytebase/dbhub, promptfoo) | npm, `--ignore-scripts`, repository alanı resmi depoyla eşleşiyor | yukarıda araç başına |
| PyPI (ttok, tokencost, unclog, cisco-ai-skill-scanner) | uv venv | yukarıda araç başına |
| @modelcontextprotocol/sdk 1.25.2 (mcp-cli için) | npm, bun | 21 MB |
| git clone cc-cache-monitor, mcp-cli | GitHub | 205 KB, 1.9 MB |

## Harcama

| Kalem | USD |
|---|---|
| Token ölçümü alt ajanları (5 sonnet, 2 opus) | 0,13 |
| Kol yürütücüsü (opus, 1h TTL fiyatıyla) | 7,63 |
| Toplam | 7,76 (tavan 8 $) |

Tavana yaklaşıldığı için durdu. Kalan işler: unclog'un Windows'ta denenmesi, dcg'nin yalıtılmış `install` kurulumu,
cc-cache-monitor statusline'ı ve claudeignore'un `init` akışı.
