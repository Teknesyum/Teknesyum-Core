# T — Evrim planı

Dört kol paralel tarandı: kapı/guard/seal, orkestrasyon, kurulum/araçlar, test/doküman.
Aşağıdaki her madde tek bir sözleşmeye dönüşecek büyüklükte. Sıra önem sırasıdır.

**Kaynaktan doğruladıklarım** (elle, ajan raporuna güvenmeden): `v0.1.12` etiketi ne
yerelde ne `origin`'de var — `git ls-remote --tags origin` en son `v0.1.9` diyor, yani
README'deki kurulum komutu gerçekten 404. `contract.js` hiçbir yerde `status:` okumuyor.
`checkAuditor` kayıt yoksa null dönüyor. `sessionFile` lib.js'te yok. `*.csproj` deseni ölü.
`PostToolUse` ve `PostToolUseFailure` matcher'sız. `wireStatusline` bozuk settings'i `{}`
sayıp üstüne yazıyor. `privateRepo` yalnız soruluyor ve saklanıyor, kullanan yok.

**Düzelttiğim hata:** D5 yanlıştı, `check` komutu zaten var. Aşağıda üstü çizili.

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
| D5 | ~~Kuru koşu yok~~ — **yanlıştı, geri alındı.** `contract.js check --id [--run]` zaten var (contract.js:719, help satırında). Bunu doğrulamadan yazmışım. Sole haklı. |

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

---

## J — Sole'un devir belgesinden gelen, yukarıda olmayanlar

`docs/CLAUDE-HANDOFF.md` ayrı bir tarama. Örtüşenler yukarıda; bunlar yalnız orada:

| # | Ne | Nerede |
|---|---|---|
| J1 | **Merdiven kapıda yok.** `complete` hiçbir yerde `status:` okumuyor (grep: tek eşleşme yok, ikisi de spawn sonucu). `open` bir sözleşme doğrudan kapanıyor, arşivlenen dosya `status: active` yazılı kalıyor. Belgelediğimiz `open → active → submitted → done` merdiveni yalnız metinde var. | contract.js:459-551 |
| J2 | Edit denetimi yalnız `new_string`'e bakıyor; sonuçta oluşan belgeye bakmadığı için zorunlu alanı **silen** düzenleme geçiyor. | guard.js:50-93 |
| J3 | Bash hiçbir zaman `owns`'a karşı denetlenmiyor — yalnız kapının kendi dizinleri korunuyor. Bağlı bir ajan kabuktan istediği kaynağı değiştirebilir; `watch.js` yalnız Write/Edit ile değişen dosyayı kaydettiği için iz de kalmaz. Denetçinin "yazdı mı" kontrolü de kabuğu görmüyor. | guard.js:222-262 · watch.js:90-102 |
| J4 | Hedef proje dışına düşünce `relayRoot(..., {git:false})` null dönüyor ve sınır sessizce yok oluyor. | guard.js |
| J5 | `owns` yinelenen girdiyi, dizini ve büyük/küçük harf çakışmasını da kabul ediyor (B3'ün geniş hâli). | schema.js · seal.js |
| J6 | `map.js` dil kapsamı iddiadan dar: JS/TS iyi, Python/C# kısmi, Go/Rust yok — oysa risk kuralları o dilleri sayıyor. Önce dil örneği, sonra iddia. | map.js · risk.js:8 |
| J7 | `contract.js validate [--all]`: ajan token harcamadan önce şema, sahiplik çakışması, bağımlılık, verify taşınabilirliği ve defter tutarlılığı denetlensin. (D5'in geniş hâli.) | — |
| J8 | Kurtarma akışı: devam edilebilir sözleşmeleri listele, öksüz live kaydını ve yarım işlemi bağdaştır. Tamamlanmayı asla tahmin etme. | — |

---

## K — Sole'un planından gelen, J'de de olmayanlar

| # | Ne |
|---|---|
| K1 | **`owns` dışında değişen dosya hiç bakılmıyor.** Mühür yalnız `owns`'taki dosyaların digest'ini tutuyor; sınırın dışına taşan değişiklik kapanışta görünmüyor. Kapanış, sözleşmenin değiştirdiği dosya kümesini kanıtlasın. |
| K2 | **Kapanış işlem değil.** Rename, denetim tüketimi ve deftere yazma arasında çöküş yarım durum bırakıyor; kurtarma yok. Günlük dosyası + idempotent kurtarma. |
| K3 | **Denetim kanıtı komuta bağlı değil.** `--verification "..."` serbest metin; denetçinin komutu gerçekten çalıştırdığını göstermiyor. Kanıt, verify komutlarına ve çıkış koduna bağlansın; kanıt koşu başladıktan sonra üretilmiş olsun. |
| K4 | **`verify: []` yapısal olarak tanımsız.** Çalıştırılabilir kabul kanıtı olmayan sözleşme sessizce düşük riskli oluyor. Boş verify, insan denetimi rotası zorunlu kılsın. |
| K5 | **Hata imzası yok, yalnız sayaç var.** D8 "aynı verify adımı, aynı imza" diyor; watch yalnız ardışık hataları sayıyor ve tek araç adı tutuyor. |
| K6 | **İstenen model/efor doğrulanmıyor.** `fable` yoksa, takma ad geldiğinde, yeni efor kademesi çıktığında ne olacağı tanımsız. |
| K7 | **`privateRepo` ölü söz.** Soruluyor, config'e yazılıyor, hiçbir yerde kullanılmıyor — D4 ve README aksini ima ediyor. Ya uygula ya soruyu kaldır. |
| K8 | **Node "isteğe bağlı" değil.** On iki kancanın hepsi node ile başlıyor; node yoksa ürün tezi çalışmıyor. README'de zorunlu yaz. |
| K9 | **`MessageDisplay` mesaj başına bir kez çalışmıyor.** Her ekran flush'ında node başlıyor, `notice.js` ancak başladıktan sonra ara flush'ları eliyor. D15'teki "mesaj başına tek çalışma" yanlış; uzun akışta p50/p95 ölçülmeli. Token maliyeti sıfır kalıyor, süreç maliyeti kalmıyor. |
| K10 | **Kurulum yeniden üretilebilir değil.** Etiketli betik indiriliyor, sonra sabitlenmemiş marketplace ekleniyor ve o anki eklenti kuruluyor. İkisinden biri: ya sabitleyin ya belgede doğruyu yazın. |
| K11 | **Marketplace açıklaması eksik** — `claude plugin validate .` uyarıyor. |
| K12 | **2294 iddianın büyük kısmı kademe matrisi.** Senaryo sayısı ile matris sayısı ayrı raporlansın; README'deki sayı olduğundan güçlü bir izlenim veriyor. |
| K13 | **Model davranışı için eval yok.** Deterministik test, skill'e uyulduğunu kanıtlamıyor: iş bölme, kabul özeti, rol seçimi, advisor körlüğü, blocker dönüşü, sıkıştırma sonrası devam. `claude plugin eval` ile ayrı katman. |

## L — Yön: bundan sonra nereye

Kusur listesi bitince proje hâlâ "kuralları olan bir betik yığını" olur. Aşağıdakiler
Core'u bir kontrol düzlemine çeviren yapısal adımlar; her biri kendi sözleşmesini hak ediyor.

**L1 — İddia testi.** README ve SKILL'deki her söz bir teste bağlansın (`test/claims.js`):
cümle → iddia kimliği → çalışan iddia. Bağı olmayan cümle README'ye giremesin. Denetçi satan
bir ürünün kendi metnini denetlememesi, bu turda üç kez yakalandı; kural hâline gelsin.

**L2 — Tahminden kanıta.** `guard` komutu okuyup ne yapacağını tahmin ediyor; kabuk bu şekilde
güvenilir biçimde ayrıştırılamaz (B2, J3 bunun kanıtı). Yön: guard hızlı ve kaba kalsın, asıl
karar `seal`'de kanıtla verilsin — ajan adımından önce ve sonra sahiplenilen ağacın ve relay
dizininin anlık görüntüsü, fark sözleşmeye işlensin. Tahmin eden kapı yerine ölçen kapı.

**L3 — Sözleşme başına worktree.** Paralel yazma sorunlarının (C1–C4, J3) kökten çözümü,
her sözleşmeye kendi git worktree'sini vermek: sahiplik yapıdan gelir, çakışma imkânsızlaşır,
kapanış birleştirme olur. Maliyeti ve Windows davranışı ölçülmeden karar verilmesin, ama
masada dursun — tek tek yama yapmaktan ucuza gelebilir.

**L4 — Yönlendirmeyi ölçüye bağla.** Kademe tablosu şu an birinin yazdığı bir kanaat. Her
kapanış (rol, model, efor, tur sayısı, düşen verify adımı, süre) deftere düşsün; `stats`
bunu göstersin. Tablo veriden ayarlansın. Bunun tur başına maliyeti sıfır, çünkü hepsi
diskte ve kapanış anında.

**L5 — Tehdit modeli belgesi.** Maliyet sınıflarında (S/O/C/Z) yaptığımızı güvenlikte de
yap: her mekanizma **G** (garanti) veya **B** (elden geldiğince) diye işaretlensin.
`guard` B'dir, `seal` G'dir. README bunu böyle söylesin; "kum havuzu değil" satırı bu
tablonun özeti olsun.

**L6 — Proje başına profil.** Profil şu an makine geneli. Aynı anda birden çok depoda
çalışan biri için doğru yer `.claude/relay/config.json`. Makine ayarı varsayılan kalsın,
proje ezsin.

**L7 — Platform dürüstlüğü.** A3 gösteriyor ki macOS/Linux kurulumu hiç denenmemiş. İki yol:
CI'da gerçekten denemek ya da README'de desteklenen platformu daraltmak. Üçüncüsü yok.

**L8 — Sürüm hattı tek komut.** Sürümü tek kaynaktan yaz, etiketle, sağlamaları yayımla,
CHANGELOG satırını üret, sürüm sapmasında CI kırılsın. A1/A2 bir daha yaşanmasın.
