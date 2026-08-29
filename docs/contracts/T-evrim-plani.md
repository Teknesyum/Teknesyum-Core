# T — Evrim planı

Dört kol paralel tarandı: kapı/guard/seal, orkestrasyon, kurulum/araçlar, test/doküman.
Aşağıdaki her madde tek bir sözleşmeye dönüşecek büyüklükte. Sıra önem sırasıdır.

Doğrulananlar: v0.1.12 etiketi yok (son etiket v0.1.9), `sessionFile` lib.js'te yok,
`checkAuditor` kayıt yoksa null dönüyor, `\*\.csproj` deseni ölü.

---

## A — Yayın kırık (bugün)

| # | Ne | Nerede |
|---|---|---|
| A1 | README'deki kurulum komutu var olmayan `v0.1.12` etiketine gidiyor; kuran herkes 404 alır. Etiketi at ya da URL'i v0.1.9'a çek. | README.md:71,77 · install.ps1:2 · install.sh:3 |
| A2 | Sürüm üç yerde farklı: package.json 0.1.4, plugin.json 0.1.12, kurulum betikleri v0.1.9. Tek kaynak plugin.json olsun, testte eşitlik iddiası dursun. | package.json:3 |
| A3 | `curl \| bash` yolunda setup hiç sorulmuyor: node'un stdin'i boru, `isTTY` false, betik "No TTY" basıp çıkıyor. Linux/macOS kurulumu config yazmadan bitiyor. | setup.js:186 · install.sh:38 |
| A4 | Etkileşimli setup soruları ham anahtar basıyor: ekranda `ask.lang >` görünüyor. `t(q.ask)` çağrılmamış; ayrıca `ask.lang`'ın Türkçesi İngilizce kopyası. | setup.js:163 · strings.json:2 |

## B — Kapı gerçekten kapanmıyor

| # | Ne | Nerede |
|---|---|---|
| B1 | Uydurma `--run-id` denetimi tamamen atlıyor: kayıt yoksa `checkAuditor` null (=sorun yok) dönüyor. Yüksek riskli sözleşme sahte denetimle mühürlenir. Kayıt yoksa reddet. | seal.js:93 |
| B2 | `cd` ile mühür kırılıyor: guard Bash'te düz metin `contracts/done`, `relay/audits` arıyor. `cd .claude/relay/contracts && mv T7.md done/` hiçbir parçada bu diziyi taşımıyor, geçiyor. Metin eşleşmesi yerine cwd + hedef yol çözümlemesi. | guard.js:294,299 |
| B3 | `owns` kök dışına çıkabiliyor: `../../` ya da mutlak yol reddedilmiyor; hem digest'e giriyor hem sınır denetiminden geçiyor. | seal.js:52 · guard.js:254 |
| B4 | Ajan sözleşme dosyasına hiç dokunmazsa `rec.contract` boş kalıyor ve sınır denetimi o oturumda tümüyle kapanıyor. Task açılışında prompt'taki sözleşme yolundan bağla. | guard.js:222 |
| B5 | `owns:` blok sözdizimini (`owns:` + alt satırda `- a`) tanımıyor; liste boş kalıyor, sınır denetimi sessizce kapanıyor. Kullanıcı fark etmiyor. | schema.js:28 |
| B6 | Risk yeni ve commit'lenmiş dosyayı görmüyor: `git diff --numstat HEAD` izlenmeyeni saymıyor, commit sonrası fark sıfırlanıyor, `git commit` guard'da serbest. 5000 satırlık yeni dosya `low` çıkıyor. | risk.js:18 · guard.js:316 |
| B7 | `owns`'ta yazıp hiç yaratılmayan dosya kapanışı durdurmuyor; okunamayan dosya boş kabul ediliyor, yapılmamış iş mühürlenebiliyor. | seal.js:52 |
| B8 | `verify` adımları kapı dışında, `shell:true` ile ve üç regex'lik kara listeyle çalışıyor; `verify: [true]` her şeyi kapatır. En azından adım öncesi/sonrası digest karşılaştır, boş/`true` adımı işaretle. | contract.js:65,79 |
| B9 | `\*\.csproj` deseni hiçbir zaman eşleşmiyor — geri döndürülemez dosya listesinde ölü satır. | risk.js:10 |

## C — Yarış durumları (paralel ajanda kanıyor)

| # | Ne | Nerede |
|---|---|---|
| C1 | `live/<ajan>.json` iki yerden oku-değiştir-yaz ediliyor; sıra ters gelince `contract` alanı düşüyor ve o ajanın sınır denetimi kapanıyor. Yazmadan önce yeniden oku ve birleştir. | guard.js:229 · watch.js:69,113 |
| C2 | `_tally.json` relay geneli: A ajanının hataları B'nin modelini yükseltiyor, A'nın başarısı B'nin sayacını sıfırlıyor. Sayaç sözleşme/ajan kırılımına insin. | watch.js:35 · contract.js:408 |
| C3 | Aynı sözleşmeyi iki ajan kapatabiliyor; `done/` kontrolü ile `rename` arasında kilit yok, ikincisi ham ENOENT yığını basıyor, deftere iki satır düşebiliyor. `audits/<id>.lock` ile `wx`. | contract.js:59,528 |
| C4 | İki açık sözleşme aynı dosyayı sahiplenebiliyor; çakışma kontrolü yok, sonuç denetim ile kapanış arasında "owned files changed" hatası olarak suçsuz yere patlıyor. Açılışta kesişim kontrolü. | schema.js:7 |
| C5 | `PostToolUse` kancası matcher'sız: her Read/Grep sonrası node süreci ve tüm `live/` taraması. Matcher'ı daralt, `sweep`'i oturum başına al. | hooks.json:41 · watch.js:135 |

## D — Yaşam döngüsünde delik

| # | Ne |
|---|---|
| D1 | İptal/yeniden açma yok. Yanlış verify ile kapanan iş için tek çare yeni ID; eski-yeni bağı kaydedilmiyor. `contract.js reopen --id --reason` (round++, deftere `reopened`). |
| D2 | Terk edilmiş sözleşme temizlenmiyor: ajan ölünce `active` sonsuza dek kalıyor, live kaydı 24 saatte siliniyor. `contract.js stale` listesi. |
| D3 | Bağımlılık/sıra kavramı yok. `needs: [T3]` alanı + kapanışta ön koşul kontrolü. |
| D4 | Sözleşme *oluşturma* komutu yok: `new`/`list` yok, t0 elle Write ediyor, ID çakışma kuralı yazılı değil. `contract.js new --id --goal --owns --verify` ve `list`. |
| D5 | Kapanış öncesi kuru koşu yok: `contract.js check --id` (ne geçer, ne kalır, risk ne çıkar) — ret yemeden görülebilsin. |

## E — Orkestrasyon boşlukları

| # | Ne | Nerede |
|---|---|---|
| E1 | `ui-builder` rolü listede var, dosyası bu depoda yok; o rolle açılan ajan rol dosyasını okuyamaz. Ya ince bir dosya koy ya "UI eklentisi kuruluysa" notu. | SKILL.md:107 · tiers.json:40 |
| E2 | `normal` profilde advisor kapalı ama SKILL "kapı yok, iste yeter" diyor. Varsayılan profil normal — yani advisor pratikte hiç açılmıyor. Ya satır eklensin ya hücre açılsın. | SKILL.md:116 · tiers.json:62 |
| E3 | SKILL t0'a "model/effort'ü live kaydına yaz" diyor; guard `live/`'a yazmayı reddediyor. Sonuç: statusline'da model alanı hep boş. Kaydı watch.js kendisi yazsın. | SKILL.md:112 · guard.js:206 |
| E4 | Ajanlar birbirine kör: dönen metin hiçbir yerde toplanmıyor, `_issues.log` yalnız SKILL'de geçiyor, kodda ne yazılıyor ne okunuyor. `submit --return` ile dönüşü kapıdan yazdır. | SKILL.md:144 |
| E5 | Rol seti eksik: bağımsız test yazan yok (yapıcı kendi testini yazıyor), düşük riskte okuyup rapor eden gözden geçiren yok, refactor ve API dokümanı rolü yok. | core/roles/ |
| E6 | Tur akışı yazılı değil: `round`'u kim artırır, `submitted` sözleşmeyi kim `complete` eder, Checkpoint nasıl sıfırlanır. | SKILL.md |
| E7 | Sinyallerin yarısı yalnız not üretiyor: `roundAdvisorRequired` hiçbir kapıyı zorlamıyor, kota yalnız eco'da, `roundModelBump` yalnız riskten muaf satırlarda. Ya bağla ya tablodan çıkar. | tiers.json:84,97 · contract.js:236,246 |
| E8 | Merdivende ölü hücre: `haiku` ve `fable/high` satırlarına ulaşan bir soran yok; `advisor.md` hâlâ olmayan `advisorPair` anahtarını gösteriyor. | tiers.json:111,114 · advisor.md:22 |
| E9 | Bayatlama penceresi üç ayrı yerde farklı (5 dk / 12 sa / 24 sa). Uzun test koşan ajan banner'dan düşüyor. Tek sabit lib.js'e. | statusline.js:19 · cue.js:7 · watch.js:16 |
| E10 | Banner "dikkat" uyarısı takılabiliyor ve C2 yüzünden başka ajanın hatasını gösterebiliyor; model hücresi title-case'e giriyor. | statusline.js:174,164 |
| E11 | Sözleşme ID deseni iki yerde farklı: statusline `^[A-Za-z]{1,4}\d{1,4}$`, cue tüm `.md`'leri sayıyor. Tek yerde tanımla. | statusline.js:29 · cue.js:36 |

## F — Kurulum ve kullanıcı deneyimi

| # | Ne | Nerede |
|---|---|---|
| F1 | setup, bozuk `settings.json`'ı parse edemezse `{}` üzerine yazıp kullanıcının tüm ayarlarını siliyor; mevcut statusline sorulmadan eziliyor. Parse hatasında dur, yedek al, onay sor. | setup.js:100 |
| F2 | `notify.js` ölü: `sessionFile` lib.js'te yok, çağrı TypeError veriyor, `catch{}` yutuyor. Ses hiç çalmıyor. | notify.js:6,50 |
| F3 | guard beklenmedik istisnada "kapalı düşüyor": relay'i olmayan sıradan bir projede bile tüm Write/Edit/Bash bloke olabilir. Relay yoksa açık düş. | guard.js:8 |
| F4 | Statusline sürüme özgü yolu settings'e gömüyor; yükseltmede eski dizin silinince ölüyor. Yerel geliştirme kopyasında bridge sürüm klasörü bulamıyor. | setup.js:103 · bridge.js:8 |
| F5 | Göç yok: config'de şema sürümü yok, sonradan eklenen sorular yükseltmede yazılmıyor, `pluginDir` eski sürümü gösteriyor. | setup.js:117 |
| F6 | `install.sh` `set -e` ile tekrar kurulumda ilk adımda ölüyor; `install.ps1` yerel exe hata kodunu yakalamıyor, başarısız kurulumda devam ediyor. | install.sh:4,17 · install.ps1 |
| F7 | Node yoksa kurulum tamamlanıyor ama on iki kancanın hepsi `node` ile başlıyor; her araç çağrısında kanca düşüyor. Node yoksa kurma. | install.*:24 |
| F8 | `prefs.js` yeni kullanıcıda tümüyle ölü kod (dosya yoksa çıkıyor, kurulum bu dosyayı hiç yazmıyor); mesajları `t()` dışında, İngilizce sabit. | prefs.js:58,92 |
| F9 | `log.js close` onaysız siliyor; günlükler Core klonu varsa eklentinin deposuna, yoksa `~/.claude`'a düşüyor — iki farklı yer. | log.js:80 · lib.js:187 |
| F10 | `map.js` akışta çağıran bulamıyor (yalnız guard'ın dosya sayımı); `log.js` yalnız dar bir TR/EN regex ipucuyla tetikleniyor. | guard.js:123 · cue.js:27 |
| F11 | `.gitattributes` yok: Windows'ta klonlanan `install.sh` CRLF olup çalışmıyor; dosyada çalıştırma biti de yok. | — |

## G — Test, CI, sürüm

| # | Ne |
|---|---|
| G1 | CI yok. `node test/all.js` çalıştıran tek işli bir workflow (ubuntu + windows) — bağımlılık sıfır, maliyeti yok. |
| G2 | Test gerçek depoya sızıyor: `testNoContextWrites` watch'ı `process.cwd()` ile çalıştırıp geliştirme deposunun `live/` dizinine kayıt yazıyor (şu an 25+ artık dosya). Fixture kökünde çalıştır. |
| G3 | Sekiz geçici dizin hiç silinmiyor; tek fixture üzerinde 16 test sıraya bağımlı, tek testi ayrı koşmak mümkün değil. |
| G4 | Süreye bağlı iddia (`spent < 40`) yüklü makinede rastgele kırmızı; okunan dosya sayısıyla ölç. |
| G5 | Testi hiç olmayan dosyalar: `notify.js`, `log.js`, `map.js`. `seal.js` yalnız dolaylı; `risk.js`'in yalnız `irreversible()`'ı; `setup.js`'in asıl işi (statusline yazma) hiç. |
| G6 | guard'ın Bash yüzeyi yüzeysel test ediliyor: `mv`, `cp`, `>>`, `sed -i`, `python -c`, tırnaklı yollar, `&&` zinciri denenmemiş — B2 tam da burada. |
| G7 | CHANGELOG yok; on beş etiket var, değişiklik kaydı yalnız commit başlıklarında. |
| G8 | README "her sürüm iki kurulum betiğinin SHA-256'sını yayımlar" diyor, yayımlanmış sağlama yok. |
| G9 | On altı kaynak dosyanın hiçbirinde SPDX satırı yok; scaffold başkasının deposuna lisans yazıyor, kendi deposunda uygulanmamış. Üçüncü parti bağımlılık yok, uyum yüzeyi temiz. |

## H — Doküman temizliği

| # | Ne |
|---|---|
| H1 | `docs/contracts/` altındaki N, O, P, R teslim edilmiş ama yerinde duruyor; R hâlâ `status: submitted`. İki `GORUS-*` dosyası kabuk. Kurala göre `trash/`'e. |
| H2 | `P-danisma-mimarisi.md` hâlâ konseyi ve `councilMemberOverride`'ı şart koşuyor — kodun tersini söyleyen canlı belge gibi duruyor. |
| H3 | `TRIAGE.md` "Core is English-only" diyor; dil ayarı canlı ve test edilmiş. Ayrıca `beep.js` ve `denetim-kaydi.js` adları eskimiş. |
| H4 | `COST-MODEL.md` `PostToolUseFailure` ve `MessageDisplay` satırlarını taşımıyor; kanca envanteri eksik. |

## I — Sonraki dönem, yeni yetenek

| # | Ne |
|---|---|
| I1 | `contract.js stats`: kaç sözleşme, kaç ret, ortalama tur, hangi verify en çok düşüyor. Kapının işe yaradığını kapının kendisi göstersin. |
| I2 | Sürüm yayınlama betiği: sürümü tek kaynaktan yaz, etiketi at, SHA-256'ları yayımla, CHANGELOG satırını üret. A1/A2 bir daha olmasın. |
| I3 | Sözleşme şablonu ve şema doğrulaması: `new` komutuyla üretilen iskelet + yazma anında şema hatasını söyleyen kanca (B5 sessiz kalmasın). |
| I4 | Ajan dönüş defteri: her ajanın döndürdüğü metin `live/<id>.return.md`, t0 bunu okuyup birleştirsin (E4'ün karşılığı). |
| I5 | `doctor` komutu: sürüm eşitliği, statusline yolu, node/git varlığı, bozuk config, artık `live/` kaydı — hepsini tek çıktıda söylesin. |
