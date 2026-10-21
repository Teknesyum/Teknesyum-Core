# Ölçüm Turu A Kolu: Sıkıştırma Ve Dönüştürme Araçları

Tarih: 2026-10-21. Plan: `docs/plan.md` S ve S1. Ham veri: `bench/olcum-a.jsonl` (55 satır).
Çalışma dizini: `C:\Users\Administrator\olcum-dis\` (derlem, varyant, betik, parca).

## Özet Tablo

| Araç | Sınıf | Ölçülen Token Değişimi (Ham'a Göre) | Olgu Doğruluğu | Bize |
|---|---|---|---|---|
| headroom | Gerçek | −26 % (5 öğe toplamı); JSON −56 %, log −10 % | 13/15 (ham 15/15) | Al yalnız çağrılınca |
| toon | Kısmi | −18 % (pretty JSON'a göre), +8,5 % (kompakt JSON'a göre) | 3/3 | Geç |
| distil | Kısmi | −88…−99,9 % ama içerik tutamaca gidiyor | 1/15 (expand'siz) | Geç |
| context-diff | Gerçek | sıkıştırıcı değil; çözümleyici | sayılar bizimkiyle birebir | Geç |
| markitdown | Gerçek | PDF −54 %, DOCX −92 % (ham XML'e göre) | 5/5 (yerelle aynı) | Al yalnız çağrılınca |
| pxpipe | Kısmi | −79 % (5 öğe, 3 tekrar ortalaması) | 31,5/45 = %70 | Geç |
| caveman | Kısmi | yalnız k3'te −64 %; diğer 4 öğe 0 % | 2/3 (sıkıştırdığı öğelerde) | Geç |

## Yöntem Ve Sapmalar

- **`claude -p` çalışmadı.** Yalıtılmış CLAUDE_CONFIG_DIR, boş dizin ve varsayılan yapılandırma denendi. Hepsi "OAuth session expired" döndü. Yerine her ölçüm bir alt ajanla koştu (`bench-low`, Sonnet 5.5). Gerçek usage ajan dökümünden (`subagents/agent-*.jsonl`) okundu, `bench/maliyet.js` mantığıyla (mesaj kimliği başına en büyük usage).
- **Haiku kullanılamadı.** Alt ajan kancası "Haiku sahipsiz çağrılmaz" diye reddetti. Bu yüzden token sayıları Sonnet 5.5 tokenizer'ı ile ölçüldü.
- **İçerik tokeni hesabı.** Ajan dosyayı 20.000 karakterlik parçalar halinde `node yaz.js <parça>` ile okudu (Bash çıktı tavanının altında kalmak için). İçerik tokeni şöyle bulundu:
  - (son tur bağlamı − ilk tur bağlamı) − 1.976 (ilk araç çağrısından sonra bir kez eklenen sabit metin) − çağrı başına (araç çağrısı çıktısı + 39).
  - Boş dosyayla yapılan 4 çağrılık kalibrasyonda bu formül −39 verdi, yani hata ±40 token.
- **Olgu soruları.** Her öğe için 3 olgu sorusu soruldu, cevap anahtarına göre 0 / 0,5 / 1 puanlandı. Belirleyici varyantlar 1 kez koştu. Kayıplı olanlar (pxpipe, headroom, caveman) 2–3 kez koştu ve sonuçlar tutarlıydı.
- **Bir koşu geçersiz.** k5 ham r1'de ajan son parçaya `| head -c 300` ekledi; koşu yinelendi. Geçersiz satır `ham-gecersiz` adıyla jsonl'da duruyor.
- **k6 S3 sayılmadı.** Yazdırılan PDF bench bölümünü içermiyor; o soru kaynakta yok.
- **k1 kesik.** `dotnet test` testhost'ta asıldı. Derlem ilk 600 satırla sınırlı ve RTK'nın `rtk dotnet test` süzgeci yeniden koşturulamadı.
- **Yan etki.** headroom yalıtma girişimine karşın `~/.headroom/ccr_store.db` (16 KB) oluşturdu. Kanca proje dışı silmeyi engellediği için dosya duruyor; sahibin silmesi gerekir.

## Derlem

| Öğe | Dosya | Bayt | Ham Token (Sonnet 5.5) | Kaynak |
|---|---|---|---|---|
| k1 | k1-test-cikti.txt | 88.153 | 50.219 | VidShrink `dotnet test` normal ayrıntı, 600 satır |
| k2 | k2-git-log.txt | 21.206 | 9.733 | Teknesyum-Core `git log --stat -n 40 08f6120` |
| k3 | k3-json.json | 63.948 | 35.137 | `bench/taban.jsonl` → pretty JSON dizisi, 210 kayıt |
| k4 | k4-readme.md | 27.183 | 11.102 | VidShrink README |
| k5 | k5-kod.cs | 73.940 | 31.507 | VidShrink `EditExport.cs`, 1.334 satır |
| k6 | k6-belge.pdf | 267 KB | 14.630 (Read ile yerel PDF) | README → gh markdown → Edge PDF |
| k7 | k7-belge.docx | 66,5 KB | 145.827 (ham `document.xml`) | Aynı HTML → Word COM |

## RTK Tabanı

| Öğe | RTK Komutu | Token | Doğru |
|---|---|---|---|
| k1 | `rtk log` | 558 | 0/3 (başarısızlıkları kaybediyor, hepsini "Başarılı" gösteriyor) |
| k2 | `rtk git log --stat` | 4.356 (−55 %) | 1,5/3 |
| k3 | `rtk json` | 102 | 0/3 (yalnız şema ve ilk kayıt) |
| k4 | `rtk read` | = ham | — |
| k5 | `rtk read -l minimal` | 26.193 (−17 %) | 3/3 |

## Headroom

- **İddia:** README'deki kanıt tablosu sağlayıcı tokenizer'ı ve çevrimdışı `compress()` ile ölçülmüş:
  - Code search 17.199→13.597 (−21 %)
  - SRE 55.957→24.340 (−57 %)
  - Codebase exploration 58.801→33.895 (−42 %)
  - Issue triage 46.067→32.429 (−30 %)
  - Toplam −41 %. Ayrıca "tekrarlı JSON ve loglarda %90".
- **Kıyas tabanı:** sıkıştırılmamış mesaj geçmişi.
- **Depo:** headroomlabs-ai/headroom, 76.941 yıldız, Apache-2.0.
- **Kurulum:**
  - PyPI `headroom-ai==0.41.0[code,ml]`, sentencepiece ve tiktoken ile; venv 1,2 GB.
  - HF modelleri `chopratejas/kompress-v2-base` ve `answerdotai/ModernBERT-base` (tokenizer dosyaları), 860 MB, `olcum-dis/headroom/hf`.
  - Depo 94,7 MB (klonlanmadı).
- **Ölçüm:** `compress(msgs, model="claude-haiku-4-5")`, ML modeli yüklü.

| Öğe | Ham | RTK | headroom | Değişim | Doğru (r1 / r2) |
|---|---|---|---|---|---|
| k1 log | 50.219 | 558 | 45.257 | −10 % | 2/3 / 2/3 |
| k2 git | 9.733 | 4.356 | 6.492 | −33 % | 2/3 / 2/3 |
| k3 JSON | 35.137 | 102 | 15.546 | −56 % | 3/3 |
| k4 md | 11.102 | = ham | 10.796 | −3 % | 3/3 |
| k5 kod | 31.507 | 26.193 | 23.544 | −25 % | 3/3 |

- **Her tur yükü:**
  - MCP modunda 3 araç tanımı, yaklaşık 1.024 bayt metin (JSON şemasıyla ~1,3 KB).
  - Proxy modu araç ekler (`headroom_retrieve`), metin eklemez.
  - Model kendisi bir kez ~3,5–6,3 s yükleniyor.
- **Sınıf: Gerçek.** Toplamda −26 %, iddianın (−41 %) yarısından fazlası. "%90 JSON/log" kısmı tutmadı: log −10 %, JSON −56 %.
- **Kayıp:** k1'de toplam "Başarısız" sayısı, k2'de commit hash'i düştü.
- **Bize:** Al yalnız çağrılınca — büyük JSON araç çıktısında RTK'nın aksine bilgiyi koruyarak yarıya indiriyor. Bedeli 2 GB kurulum.

## Toon

- **İddia:** pretty JSON'a göre −42,6 % (2.474 / 4.308), doğruluk 72,2 / 71,4. Kompakt JSON'a göre −14,5 %. README, düzensiz veride kompakt JSON'un kazandığını kendisi söylüyor.
- **Depo:** toon-format/toon, 25.535 yıldız, MIT.
- **Kurulum:** npm `@toon-format/cli@4.4.0`, 97 KB, `--prefix olcum-dis/toon --ignore-scripts`.

| Öğe | Pretty (Ham) | Kompakt JSON | RTK | toon | Doğru |
|---|---|---|---|---|---|
| k3 | 35.137 | 26.532 (−24,5 %) | 102 (0/3) | 28.777 (−18 %) | 3/3 |

- **Not:** CLI kendi tahmini olarak −28,4 % basıyor. Bayt olarak toon (50.392) kompakt JSON'dan (43.786) büyük. Veri düzensiz (isteğe bağlı alanlar).
- **Her tur yükü:** 0.
- **Sınıf: Kısmi.** Pretty'ye göre −18 %, iddianın yarısının (21,3) altında. Kompakt JSON'a göre tersine döndü (+8,5 %).
- **Bize:** Geç — aynı işi bedelsiz kompakt JSON daha iyi yapıyor.

## Distil

- **İddia:**
  - Bakımcının kendi trafiğinde fatura −8,3…−9,2 %.
  - SWE-bench Lite'ta eşit maliyet (çözülen görev başına 0,0393 / 0,0387 $).
  - Sunulan yolda −2,0 puan başarı.
- **Depo:** dshakes/distil, 20 yıldız, lisans NOASSERTION (PyPI rozeti).
- **Kurulum:** PyPI `distil-llm==1.58.0`, wheel 1,13 MB, venv 4 MB, `DISTIL_HOME=olcum-dis/distil/home`.
- **Ölçüm:** `compress_messages`, OpenAI tarzı dize araç mesajı (Anthropic liste biçimine dokunmuyor). Her öğe tek tutamaçlı (`handle`) özet taslağına iniyor.

| Öğe | Ham | RTK | distil | Doğru |
|---|---|---|---|---|
| k1 | 50.219 | 558 | 4.579 | 1/3 |
| k2 | 9.733 | 4.356 | 68 | 0/3 |
| k3 | 35.137 | 102 | ~0 | 0/3 |
| k4 | 11.102 | = ham | 1.440 | 0/3 |
| k5 | 31.507 | 26.193 | 705 | 0/3 |

- **Her tur yükü:** proxy'nin eklediği `distil_expand` tanımı 601 bayt. MCP modunda 3 araç, 2.910 bayt.
- **Sınıf: Kısmi.** Fatura iddiası bizde ölçülemedi: proxy bir API anahtarı ister, bu yüzden "anahtar gerekir — ölçülemedi". Ölçülebilen kısım da tasarrufun ancak `distil_expand` gidiş-dönüşleriyle kullanılabildiğini gösteriyor; expand'siz 1/15.
- **Bize:** Geç.

## Context-Diff

- **İddia:** sayısal tasarruf iddiası yok. Oturum JSONL'sinden tur tur token şelalesi, "2 saniye", sıfır bağımlılık.
- **Depo:** yubinkim444/context-diff, 1 yıldız, MIT.
- **Kurulum:** PyPI `context-diff==0.1.1`, wheel 9 KB, venv 260 KB.
- **Ölçüm:**
  - k7 hamxml ajan dökümünde 117 ms. Bağlam dizisi bizim hesapla birebir aynı (9.535 → 159.173).
  - 53,7 MB'lık oturumda 599 ms.
  - Kusurlar:
    - Tek mesajı birden çok satıra bölüyor (13 gerçek tura 16 satır).
    - İlk turun sistem yükünü "assistant text" diye etiketliyor.
    - stdout'a reklam satırı basıyor, bu da `--json` çıktısını boruda bozuyor.
- **Her tur yükü:** 0 (çevrimdışı çözümleyici).
- **Sınıf: Gerçek.** Hız ve doğruluk iddiası tuttu.
- **Bize:** Geç — `bench/maliyet.js` aynı sayıyı zaten veriyor.

## Markitdown

- **İddia:** sayı yok; "Markdown conventions are also highly token-efficient".
- **Depo:** microsoft/markitdown, 191.385 yıldız, MIT.
- **Kurulum:** PyPI `markitdown[pdf,docx]==0.1.8`, wheel 90 KB, venv 188 MB.

| Öğe | Taban | Taban Token | markitdown | Değişim | Doğru (Taban / Araç) |
|---|---|---|---|---|---|
| k6 PDF | Read ile yerel PDF | 14.630 | 6.797 | −54 % | 2/2 / 2/2 |
| k7 DOCX | ham `document.xml` | 145.827 | 11.207 | −92 % | 3/3 / 3/3 |

- **Not:**
  - Dönüşüm süresi PDF'te 3,6 s, DOCX'te 1,3 s.
  - DOCX'teki görseller data-URI yer tutucusuna dönüşüyor.
  - DOCX md'si (11.207) özgün README'ye (11.102) çok yakın.
- **Her tur yükü:** 0 (CLI).
- **Sınıf: Gerçek.**
- **Bize:** Al yalnız çağrılınca — PDF ve DOCX okurken aynı doğrulukla yarı ya da onda bir token.

## Pxpipe

- **İddia:**
  - Uçtan uca fatura ~59–70 % düşük.
  - Görselde ~3,1 karakter/token, metinde ~1.
  - SWE-bench Lite iki kolda 10/10, Pro'da 14/19 ve 15/19. README kayıplı olduğunu kendisi yazıyor.
- **Depo:** teamchong/pxpipe, 7.542 yıldız, MIT.
- **Kurulum:**
  - npm `pxpipe-proxy@0.15.0`, açılmış hali 16,4 MB, node_modules 46 MB.
  - `export --model claude-haiku-4-5`, HOME `olcum-dis/pxpipe/home`'a yönlendirildi.
  - Çıktı: 1.568 px PNG sayfaları ve olgu sayfası (factsheet).
- **Ölçüm:** ajan `prompt.txt` dosyasını (olgu sayfası dahil) ve PNG sayfalarını okudu. 3 tekrar yapıldı.

| Öğe | Sayfa | Ham | RTK | pxpipe (ort.) | Değişim | Doğru (r1 / r2 / r3) |
|---|---|---|---|---|---|---|
| k1 | 4 | 50.219 | 558 | 9.239 | −82 % | 2 / 2 / 2 |
| k2 | 1 | 9.733 | 4.356 | 3.772 | −61 % | 1,5 / 2 / 2 |
| k3 | 4 | 35.137 | 102 | 6.135 | −83 % | 1 / 1 / 2 |
| k4 | 2 | 11.102 | = ham | 3.270 | −71 % | 3 / 2,5 / 3 |
| k5 | 4 | 31.507 | 26.193 | 6.431 | −80 % | 2 / 3 / 2,5 |

- **Toplam:** −79 % token. Doğruluk 31,5/45 = %70, ham 15/15.
- **Kayıplar:**
  - Bir koşuda yanlış hash kendinden emin verildi (0a4d9bd).
  - k3'te iki koşuda en yüksek ms yanlış okundu.
  - Sayımlar ("12 civarı", "10") hiç tutmadı.
- **pxpipe'ın kendi tahmini:** metin tokenlerini Sonnet tokenizer'ına göre ~2 kat düşük tahmin ediyor (k1: 23.543 / 50.219).
- **Her tur yükü:** 0 (proxy ya da dışa aktarım).
- **Sınıf: Kısmi.** Token iddiası tuttu (−79 % ≥ −59…−70 %). Eşit başarı iddiası tutmadı (%70 olgu doğruluğu).
- **Bize:** Geç — tam değer (hash, sayı) okuyan işimizde sessiz yanlış üretiyor.

## Caveman

- **İddia:**
  - "Tüm oturumda %33,2 daha az girdi tokeni".
  - Dosya başına CSV/Log/YAML/Test/JSON −98,5…−99,1 % (sorguya duyarlı Simulate ile). HTML +9,9 %.
  - Auto ile "%54 daha ucuz".
  - Kuralların her tur ~1.160 girdi tokeni tuttuğunu kendisi yazıyor.
- **Depo:** JuliusBrussee/caveman, 113.970 yıldız, Apache-2.0.
- **Kurulum:**
  - npm `@caveman-ai/cli@4.0.1`, 1,7 MB.
  - Depo `v4.0.1` klonu, 34 MB.
  - GitHub sürümü `bin-v4.0.1`'den `caveman-engine_win32_amd64`, 30,4 MB. SHA256 `checksums.txt` ile eşleşti.
  - `CAVEMAN_HOME=olcum-dis/caveman/home`.
- **Ölçüm:** CLI `compress` sorgu almıyor, bu yüzden README'deki sorguya duyarlı sayılar bu yolla üretilemiyor.

| Öğe | Ham | RTK | caveman | Değişim | Doğru (r1 / r2) |
|---|---|---|---|---|---|
| k1 | 50.219 | 558 | dokunmadı ("code" sandı); zorla log −2 %, terminal −5 % (bayt) | ~0 % | — |
| k2 | 9.733 | 4.356 | auto dokunmadı; zorla `log` 4.485 | −54 % | 2/3 / 2/3 |
| k3 | 35.137 | 102 | 12.562 (elision, `lossless_to_model:false`) | −64 % | 2/3 / 2/3 |
| k4 | 11.102 | = ham | dokunmadı ("html" sandı); zorla text 0 % | 0 % | — |
| k5 | 31.507 | 26.193 | dokunmadı | 0 % | — |

- **Derlem toplamı (auto):** 137.698 → 115.123, −16,4 %.
- **Her tur yükü:** etkinlik kuralı 1.314 bayt her tur (~330 token). `/caveman` açılınca SKILL.md 4.678 bayt.
- **Sınıf: Kısmi.**
  - Oturum iddiasının (−33,2 %) yarısına yakın (−16,4 %), ama altında.
  - Dosya başı −98 % iddiası bizde Balon (en iyi −64 %, bilgi kaybıyla).
- **Bize:** Geç — tür algısı derlemin 4/5'ini atlıyor, sıkıştırdığında olgu düşürüyor.

## Harcama

- **Ölçüm alt ajanları:** 3,63 $ (48 koşu, Sonnet 5.5, tarife `docs/tarife.json`).
- **Yönetici ajan:** 13,79 $ (Opus 5.5). Sıkıştırma öncesi kurulum ve derlem hazırlığı dahil, 5 dk TTL tarifesiyle hesaplandı.
- **Kol toplamı:** ~17,4 $. Bu, 12 $ tavanını aştı. Aşım, yönetici bağlamının büyümesinden geliyor; ölçümün kendisi 3,6 $.
- **Kalan iş:**
  - Bütçe bittiği için ek tekrar yapılmadı.
  - distil'in fatura iddiası ve caveman'ın oturum iddiası canlı oturum ve API anahtarı istiyor; ölçülmedi.
