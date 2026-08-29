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

---

## M — Fable'ın değerlendirmesi (advisor)

Her öneri tek tek geçirildi. Kararlar:

| Öneri | Karar | Gerekçe |
|---|---|---|
| L1 iddia testi | **Değiştir** | Cümle-teste birebir eşleme tek geliştiricide bürokrasiye döner. README'deki 5-6 çekirdek garantiyi test et, "her cümle" şartını at. |
| L2 tahminden kanıta | **Katıl** | Kabuk ayrıştırma kazanılamaz bir savaş; guard hız filtresi, karar seal'de. |
| L3 worktree | **Değiştir** | Kapanışı merge'e çevirmek çakışma çözme angaryası yükler, Windows köşeleri bol. Yalnız yüksek riskli sözleşmede opsiyonel, varsayılan değil. |
| L4 ölçü defteri | **Yarısına katıl** | Deftere yaz ve `stats` göster; "tablo veriden ayarlansın" ertelensin — n küçükken otomatik ayar gürültü kovalamaktır. |
| L5 G/B tehdit modeli | **Katıl** | Ucuz, dürüst; ayrımı zaten L2 doğuruyor. |
| L6 proje profili | **Katıl** | Küçük iş, bariz doğru. |
| L7 platform dürüstlüğü | **Katıl** | Bugün README'yi "Windows'ta test edildi"ye daralt, CI gelince genişlet. |
| L8 sürüm hattı | **Katıl** | 404 bunun kanıtı; ama CI yokken tek `release.js` yeter, hattı büyütme. |
| Sole: işlem + kurtarma | **Katıl** | Kapanış çok dosyaya dokunuyor, yarıda kesilme gerçek senaryo. |
| Sole: kanıt komuta bağlansın | **Katıl** | Sahte run-id deliğini kapatan en ucuz yol. |
| Sole: boş verify tanımı | **Katıl, genişlet** | Tek şema kontrolüyle biter; sözleşmenin tamamını yüklerken doğrula. |
| Sole: `plugin eval` katmanı | **Karşı çık** | Model davranış testi pahalı ve kararsız; deterministik kapı asıl garanti. Ürün olgunlaşınca. |

**Ağırlığından çökecekler:** L1'in tam biçimi, L3'ün varsayılan hâli, L4'ün otomatik ayar yarısı,
eval katmanı. Dördü de bakım yükü tek kişinin omzunda büyüyen altyapı.

**Listede olmayan, eklenenler:**

| # | Ne |
|---|---|
| M1 | **Asgari CI birçok maddenin ön koşulu.** Üç işletim sisteminde mevcut test dosyasını koşturan tek workflow; L7 ve L8'i bedavaya getirir. "CI yok" bir tercihti, artık engel. |
| M2 | **Atomik yazma yardımcısı.** `_tally` yarışını nokta yamayla değil, her kancanın kullandığı tek `writeAtomic` (tmp + rename) ile çöz. |
| M3 | **Setup yedeği.** `settings.json`'a dokunmadan önce `.bak`. Silme hatasının düzeltmesi ayrı, yedek ayrı sigorta. |
| M4 | **Uçtan uca duman testi.** Sahte bir sözleşmeyi `open → done` tam yaşam döngüsünde koşturan tek test; 2294 iddia birim seviyesinde, boru hattının bütününü kimse test etmiyor. |

**Kabul edilen sıra:**

`A (yayın) → settings.json silinmesi → kapı (sahte run-id, status merdiveni, Bash sahipliği)
→ guard'ın kapalı düşmesi → yarışlar (M2 ile) → L2 → Sole 1-3 → L5 / L6 / L7 / L8`

Fable'ın tek sıra değişikliği: kullanıcının tüm ayarını yok eden hata, kapının gevşekliğinden
acildir; F1 kapı düzeltmelerinin önüne alındı.

---

## N — Yetenek tablosu: sorun, çözüm, maliyet, piyasa

75 depo tarandı (Claude Code ekosistemi, ajan orkestrasyonu, kapı/politika araçları).
Karar filtresi: **genel kullanımda işe yarıyor mu, yoksa uç durumu mu çözüyor?** Uç durum
ne kadar zarif olursa olsun eleniyor. Base özellik şişmesinden öldü.

### Sözlük

- **Sözleşme** = iş emri dosyası: ne yapılacak, hangi dosyalara dokunulacak, bittiği hangi
  komutlarla kanıtlanacak.
- **Kapanış** = işin resmen bitmesi; betik kanıt komutlarını çalıştırır, geçerse iş biter.
- **Maliyet ne zaman ödenir:** (a) bir defa kurulumda · (b) her yeni sohbette bir kez ·
  (d) her mesajda · (e) her ajan adımında · (f) yalnız elle çağırınca · (g) iş kapanırken.
- **0 token** = model o özellik yüzünden tek kelime okumaz ya da yazmaz.
- **Şimdi** = değeri maliyetini açık ara aşıyor · **Sonra** = koşulu var · **Yapma** =
  değmiyor ya da ilkeyi bozuyor; listede duruyor ki fikir tekrar gelince cevap hazır olsun.

### Tablo

| Özellik | Sorun (bu yokken) | Çözüm | Yapım | Bakım | Çalışma | Genel/Uç | Piyasa | Skor | Karar |
|---|---|---|---|---|---|---|---|---|---|
| **reopen** | Yanlışlıkla "bitti" kapanan işi geri açmanın yolu yok; aynı işi yeni adla açıyorsun, geçmişi kopuyor | `contract.js reopen` işi geçmişiyle geri açar | 10 | **0** — bir durum geçişi, biter | 0 token, (f) | **Genel** | Backlog.md | 90 | **Şimdi** |
| **Ön kontrol** | İş aslında bitmişken ajan yine çağrılıp binlerce token yakıyor | Ajan açılmadan betik kanıt komutlarını koşar; geçiyorsa ajan hiç açılmaz | 15 | **0** | 0 token, komut süresi, ajan başlarken | **Genel** | go-task | 85 | **Şimdi** |
| **Tur bütçesi** | Aynı hatada dönen ajan sen fark edene kadar harcıyor; en pahalı vakalar bunlar | İşe azami tur yazılır, aşan durdurulur, iş "takıldı" olur | 20 | 10 — eşik ayarı | 0 token, (e) sayaç | **Genel** | **kimse** — aider'de bile yok | 85 | **Şimdi** |
| **Devir notu** | Yeni sohbette ya da başka bir YZ'de "neredeydik" baştan anlatılıyor | Betik mekanik kısmı yazar, model tek seferlik niyet satırlarını (tasarım aşağıda) | 25 | 10 | yazım tek sefer ~300 tok, okuma (f) | **Genel** | cline `/newtask` | 85 | **Şimdi** |
| **Token raporu** | "0 token" iddiası kanıtsız; ne harcandığı görünmüyor | Kapanış başına defter satırı + döküm komutu | 20 | 10 | 0 token, (g) | **Genel** | ccusage (18k) | 80 | **Şimdi** |
| **doctor** | Kurulum bozulunca sistem sessizce devre dışı kalıyor | Tek komut tüm kontrolleri koşar, kırığı basar | 20 | 20 | 0 token, (f) | **Genel** | brew doctor | 80 | **Şimdi** |
| **Sürüm niyet dosyası** | Sürüm elle basılıyor; kurulum linki 404'e gitti | Değişiklik başına md biriktir, yayında tek komutla topla | 20 | 5 | 0 token, (f) | **Genel** | changesets (12k) | 80 | **Şimdi** |
| **Duman testi** | Zincirin bütünü test edilmiyor, uçtan uca kırığı kullanıcı buluyor | Sahte iş açılıştan kapanışa gerçekten koşturulur | 30 | 20 — hat değişince kırılır (iyi ki) | 0 token | **Genel** | bats-core | 80 | **Şimdi** |
| **Seal ölçümü** | İzinsiz dosya yazımı tahminle yakalanıyor, kaçan oluyor | Adım önce/sonra ağacın parmak izi; fark işe kanıt yazılır | 35 | 15 | 0 token, ~50 ms, (e) | **Genel** — sahiplik ürünün ana vaadi | codeowners deseni | 80 | **Şimdi** |
| **Asgari CI** | Mac/Linux'ta çalışmadığı kullanıcı hatasıyla öğreniliyor | Her push'ta üç sistemde test | 20 | 25 | 0 token | **Genel** | herkes | 75 | **Şimdi** |
| **awesome-claude-code PR** | Eklentiyi kimse bulamıyor | Listeye tek PR | 5 | **0** | 0 | **Genel** | 53k yıldızlı vitrin | 75 | **Şimdi** |
| **needs:** | B işi, temeli A bitmeden başlıyor; ajan yarım temelde boşa dönüyor | A kapanmadan B başlatılamaz | 30 | 20 — döngü tespiti kalıcı | 0 token, (g) | **Genel** | task-master, Backlog.md | 70 | **Şimdi** |
| **Proje profili** | Kalite ayarı makine geneli; hobide premium yanıyor | Projedeki config makine ayarını ezer | 10 | **0** | 0 token, (b) | **Genel** | claude-code-router | 70 | **Şimdi** |
| **Proje DoD listesi** | Her işe aynı kanıt komutları elle kopyalanıyor | Proje geneli "bitti tanımı"; iş yalnız farkını beyan eder | 15 | 10 | 0 token, (g) | **Genel** | Backlog.md | 70 | Sonra — `needs:` oturunca |
| **Kurulum sihirbazı** | setup elle; bozuk settings.json faciası buradan çıktı | Soru-cevap kurulum, dokunmadan önce yedek | 25 | 15 | 0 token, (a) | **Genel** | claude-code-templates (30k) | 60 | Sonra — önce settings hatası |
| **Görev paketi** | Paralel ajanlar aynı dosyaları ayrı ayrı okuyor | İş dosyasına "önce şunu oku" listesi | 30 | 15 | ajan başına ~500-1500 tok | Genel ama **kanıtsız** | kimse | 55 | Sonra — ölçüm netleşince |
| **stale etiketi** | Unutulan işler listede birikiyor | X gün dokunulmayana "bayat" damgası | 10 | **0** | 0 token, (b) | Genel, düşük acı | Backlog.md | 55 | Sonra |
| **Bildirim** | Uzun işin bitmesini ekran başında bekliyorsun | Kapanışta Windows bildirimi | 10 | 5 | 0 token, (g) | Genel, konfor | claude-squad | 50 | Sonra |
| **Arşivleme** | Biten işler klasörde birikiyor | Biten iş `trash/`'e | 10 | **0** | 0 token, (g) | Genel, küçük | — | 50 | Sonra |
| **Verify sıralama** | Yavaş test başta, kırığı geç görüyorsun | Hızlı komut önce, ilk kırıkta dur | 10 | 5 | **eksi** — kapanış hızlanır | Genel, küçük | go-task | 50 | Sonra |
| **Worktree** | Paralel işler aynı klasörde, teoride ezişme | Riskli iş ayrı kopyada koşar | 60 | 50 — Windows, IDE, ortam kopyalama | disk + saniyeler | **Uç** | crystal #39 açık, #235 "proje öldü mü"; claude-squad #275 Windows'ta çöküyor | 25 | **Yapma** |
| **İş kirası** | İki pencere aynı işi alabilir | İş alınınca kilit | 20 | 20 | 0 token | **Uç** — tek geliştirici | claude-squad (başka amaçla) | 25 | **Yapma** |
| **Takılan-ajan bekçisi** | Dönmeyen ajan işi kilitliyor | Süre aşımı işareti | 20 | 15 | 0 token | **Uç** — tur bütçesi karşılıyor | kimse | 20 | **Yapma** |
| **audit verify** | Mühür zinciri kırılırsa elle bakmadan görülmüyor | Zinciri doğrulayan komut | 15 | 10 | 0 token, (f) | **Uç** | kimse | 20 | **Yapma** — asıl soru zincirin kendisi, bkz. Kesilecekler |
| **Grafik panosu** | Bağımlılık şeması görselleşmiyor | HTML çizim | 30 | 25 | 0 token, (f) | Uç | observability (1.5k, düşük talep) | 15 | **Yapma** |
| **Verify önbelleği** | Değişmeyen işte kanıt yine koşuyor | Hash aynıysa atla | 25 | 35 — yanlış atlama kapının itibarını yer | ms kazancı | Uç | go-task (kapı değil, koşucu) | 15 | **Yapma** — güvenli hâli ön kontrolde var |
| **Monorepo** | İş tek repoyla sınırlı | Çoklu repo | 70 | 55 | çözümleme yükü | Uç | claude-flow | 10 | **Yapma** |
| **Yönlendirme notu** | Model Core'un durumunu görmüyor (bilerek) | Tur başına bağlama satır | 10 | 5 | **(d) her mesajda token** | — | herkes — ve bu yüzden herkes şişkin | 0 | **Yapma** — kozumuz tam bu |

**Silinen madde — model düşürme.** Kullanıcı haklı: model zaten tabloda yazılı, yükseltme
geçici bir sapma; ayrı özellik değil. Tek satırlık kural yeter: *başarılı kapanış yükseltme
sayacını sıfırlar, model tabloya döner.* Üst üste başarısızlık eşiği ayrıca **3 → 2** iner.

### F — Devir notu tasarımı

Dosya: proje kökünde **`HANDOFF.md`**, `AGENTS.md`'den tek satır işaret edilir. Claude, Sole,
Codex — hangi YZ açarsa kökte bulur; format düz markdown, kimseye özel değil.

İki bölüm, iki ayrı yazar:

**Mekanik bölüm — betik yazar, 0 token.** Her iş kapanışında hook doldurur: açık işler ve
durumları, her birinin kanıt komutlarının son sonucu, son kapanan üç iş, değişen dosya adları
(git'ten). Model hiç karışmaz, her an günceldir.

**Niyet bölümü — model yazar, tek sefer.** Yalnız oturum biterken ya da compact öncesi, bir
kez: sonraki adım, açık kararlar, dikkat edilecekler — azami 6 satır, ~300 token. Sıradan
turda asla tetiklenmez. Başına tarih damgası; mekanik bölümden eskiyse betik "bu bölüm eski
olabilir" satırını kendisi ekler (0 token).

Okuma tamamen (f): isteyen okur. Toplam fatura oturum başına en fazla ~300 token — sürekli
serileştiren claude-flow / LangGraph modelinin tersi.

### G — Kesilecekler

Base özellik şişmesinden öldü; bu bölüm boş kalmayacak.

| Ne | Neden |
|---|---|
| **Mühürlü denetim zinciri → düz günlük** | Tek geliştiricinin kendine karşı kripto mührü tiyatro; sahte run-id zaten geçiyor, yani mühür güvence de vermiyor. Kayıt kalsın, kanıt "verify komutları + çıkış kodu" olsun, zincir katmanı kesilsin. |
| **Guard'ın Bash kara listesi** | `cd` ile aşılıyor. Koruma sanısı veren ama korumayan şey, olmayandan tehlikelidir. Seal ölçümü girince tamamen sil; girene kadar README'de "elden geldiğince" diye işaretle. |
| **MessageDisplay'in flush başına süreci** | Belge "mesaj başına bir" diyor, gerçek her flush. "En hafif eklenti" iddiasıyla çelişen tek kalem. Banner'ı statusline'a indir ya da gerçekten mesaj başına bire sabitle. |
| **map.js** | Import haritasını `graphify` skill'i zaten yapıyor; iki araç aynı soruya iki cevap verir. Kes, graphify'a işaret et. |

---

## O — Fable'ın kararı: sen olsan hangilerini eklerdin

Ölçüt tek: bu eklentiyi gören biri "bunu kurmalıyım" desin. Danışman değil sahip gözüyle.

### Eklerdim (12)

| Özellik | Neden | Yapım | Bu olmadan eksik mi? |
|---|---|---|---|
| **Seal ölçümü** | "Sahiplik zorlanır" vaadini tahminden ölçüme çevirir; ana iddia ancak bununla dürüst | 35 | **Evet** |
| **reopen** | Geri dönüşü olmayan kapı, kapı değil tuzaktır | 10 | **Evet** |
| **Tur bütçesi** | Kaçak döngüyü kesen tek eklenti oluruz — aider'de bile yok, vitrin cümlesine girer | 20 | **Evet** |
| **Token raporu** | "0 token" iddiasını sayıyla kanıtlar; kanıtsız iddia pazarlama, kanıtlısı ürün | 20 | **Evet** |
| **doctor** | Sessizce bozulan kanca sistemi güveni öldürür; tek komutluk teşhis geri verir | 20 | **Evet** |
| **Devir notu** | Herhangi bir YZ projeyi tek dosyadan devralır; oturum başı ~300 token tavan | 25 | **Evet** |
| **Ön kontrol** | Bitmiş işe ajan açmamak = kullanıcının cebinde kalan para | 15 | Hayır |
| **Proje profili** | Hobide premium yanmasın; iki saatlik iş | 10 | Hayır |
| **Duman testi** | Kullanıcı görmez ama her sürümün belkemiği | 30 | Hayır |
| **Sürüm niyet dosyası** | 404 bir kez yaşandı, ikincisi affedilmez | 20 | Hayır |
| **Asgari CI** | "Windows'ta test edildi"den "üç sistemde koşuyor"a geçiş | 20 | Hayır |
| **awesome-claude-code PR** | En iyi ürün bile bulunmazsa yüklenmez | 5 | Hayır |

### Eklemezdim

| Özellik | Neden hayır | İsteyen çıkarsa cevabım |
|---|---|---|
| Worktree | Piyasa kanıtı aleyhte: crystal ölüyor, claude-squad Windows'ta çöküyor; seal ölçümü aynı güvenceyi bedavaya verir | "Seal kaydında tek ihlal göster, konuşalım" |
| İş kirası | Tek geliştirici, tek pencere — çözdüğü sorun yaşanmıyor | "İki pencerede aynı işi ezdiğin bir vaka getir" |
| Takılan-ajan bekçisi | Tur bütçesi aynı deliği kapatıyor | "Tur bütçesinin yakalayamadığı takılma göster" |
| audit verify | Kendine karşı kripto denetim, tiyatro | "Zinciri zaten kesiyorum" |
| Grafik panosu · monorepo · verify önbelleği | Uç durum, şişkinlik, ya da kapının itibarını yiyen kısayol | "Hayır; Base'i bu iştah öldürdü" |
| stale · arşivleme · bildirim · verify sıralama | Dördü de hoş, hiçbiri "yüklenmeli" dedirtmez; her biri bir satır bakım | "Çekirdek oturunca konfor paketi olarak topluca bakarız" |
| Yönlendirme notu | Kırmızı çizgi; rakiplerden tek farkımız tam burası | "Hayır. Bu değişirse ürünün adı değişir" |
| **KES — mühür zinciri** | Sahte run-id geçerken hash zinciri güvence değil süs | "Düz günlük + komut kanıtı daha dürüst" |
| **KES — guard Bash kara listesi** | `cd` ile aşılıyor; korumayan koruma olmayandan tehlikeli | "Seal ölçümü yerine geçiyor" |
| **KES — map.js** | Graphify aynı işi yapıyor; bir soruya iki cevap olmaz | "Graphify'a işaret ediyorum" |
| **KES — MessageDisplay'in flush başı süreci** | "En hafif eklenti" iddiasıyla çelişen tek kalem | "Banner kalır, süreç mesaj başına bire iner" |

### Şüpheli — kanıt gelirse döner

| Özellik | Neden kararsız | "Ekle"ye döndüren kanıt |
|---|---|---|
| needs: | Paralel işin özü ama şema karmaşası getiriyor | Token raporu 30 günde **≥3 kez** "temel bitmeden başlayıp boşa dönen ajan" gösterirse |
| Görev paketi | Keşif tekrarı gerçek ama özet yazmak da token | Rapor, paralel ajan başına **≥2K token** tekrar okuma gösterirse |
| Proje DoD listesi | Kopyala-yapıştır verify gerçek mi, varsayım mı belirsiz | Son 10 iş dosyasının **≥7'sinde** aynı verify satırları çıkarsa |
| Kurulum sihirbazı | setup.js var; sihirbaz cila mı ihtiyaç mı | Kurulum kaynaklı **2 ayrı kullanıcı hatası** gelirse |

### Sonuç

**12 ekleme + 4 kesinti.** Altısı ürünü tamamlıyor, altısı güven ve dağıtım.

**Vaat cümlesi:** "Ajanlarına işi sözleşmeyle verir, 'bitti'ye testler karar verir, kaçak
harcamayı keser — ve sıradan turda modele tek kelime yazmadığı için bunların hepsi bedava."

**Not:** bugün **55** (özgün iki koz var ama kapı gevşek, iddialar kanıtsız, yayın kırık),
bu listeyle **85**. Farkı kapatan yeni özellik bolluğu değil; kapının gerçekten kapanması ve
her iddianın yanına kanıtının konması.

### Kesilecekler — kullanıcı sorusu üzerine düzeltme

**map.js kesilmiyor.** Fable'a "graphify aynı işi yapıyor" bilgisini ben verdim, oysa
graphify bu makinede kurulu değil. Kaynak: `builder.md:18` ajana "kaynak dosya açmadan önce
`.claude/relay/map.md` oku" diyor, `SKILL.md:131` haritayı üreten komutu tarif ediyor,
`guard.js:123` yeni proje sayımında `map.scan` kullanıyor. Kesilirse harita üreten hiçbir şey
kalmaz. Karar: kalsın; asıl sorunu F10 (akışta kimse otomatik çağırmıyor, elle çalıştırılıyor).

**Banner kalıyor.** Kesilme önerisi banner'a değil, `notice.js`'in her ekran flush'ında bir
node süreci başlatmasına. Ölçüldü: atılan ara flush **26 ms**, banner basan flush **31 ms**,
ikisi de **0 token**. `statusline.js` zaten tembel yükleniyor (`notice.js:37`), yani atma yolu
saf node açılışından ibaret. Geriye iki iş kalıyor: (1) D15'teki "mesaj başına tek çalışma"
cümlesi yanlış, düzeltilecek; (2) mesaj başına kaç flush geldiği ölçülmeden karar verilmeyecek
— sayaç `notice.js` içinden diske yazılır, 0 token. Sayı küçükse hiçbir şey değişmez.

---

## P — Uygulandı (v0.2.0)

Tümü testli: **2352 assertion, 0 hata**. Sürüm `v0.2.0` olarak kesildi ve yayınlandı.

### Kapı ve merdiven
| Ne | Neden | Nerede |
| --- | --- | --- |
| `submit` / `reopen` komutları, `open → active → submitted → done` merdiveni | Kapanış tek adımdı; yanlış kapanan işi geri almanın yolu yoktu | contract.js |
| Arşivlenen dosyaya `done` damgası | done/ altındaki dosya hâlâ "active" diyordu | contract.js |
| `owns` başlık biçiminin ayrıştırılması | README'nin gösterdiği `## owns` biçimini ayrıştırıcı hiç okumuyordu: ön sayfayı izleyen herkeste sahiplik kümesi boş, sınır sessizce kapalıydı | schema.js |
| Yazılmamış dosyayı sahiplenen sözleşme kapanamıyor | Okunamayan dosya boş sayılıyor, yapılmamış iş kapanıyordu | seal.js |
| `owns` kök dışına / mutlak yola çıkamıyor | Sınır denetiminden kaçış | seal.js |
| Uydurma `--run-id` reddi | Koşmamış bir ajan adıyla yüksek riskli kapanış mühürlenebiliyordu | seal.js |
| Tur tavanı 6 (`--force` ile aşılır) | Altıncı turdan sonra sorun ajanda değil sözleşmede | contract.js · tiers.json |

### Yarış ve maliyet
| Ne | Neden |
| --- | --- |
| Hata sayacı ajan başına (`byAgent`) | Tek sayaç vardı: bir ajanın Bash hatası herkesin modelini yükseltiyordu |
| Eşik 3 → 2 | Bile bile üçüncü turu beklemiyoruz |
| `merge()` ile yazım | `guard.bind` ile `watch` aynı dosyayı okuyup yazıyor, birbirinin alanını siliyordu |
| `PostToolUse`/`PostToolUseFailure` matcher'ı | Her `Read`/`Grep` çağrısında node açılıyordu; artık yalnız yazan araçlarda |
| `sweep()` yalnız oturum/ajan bitişinde | Her araç çağrısında dizin taranıyordu |

### Kullanıcı güvenliği
| Ne | Neden |
| --- | --- |
| `setup.js` okunamayan `settings.json`'ı ezmiyor, `.bak` bırakıyor | Yorum satırı olan bir ayar dosyası tamamen siliniyordu |
| `guard.js` relay'i olmayan projede açık düşüyor | Kancayı kuran ama relay kullanmayan kullanıcının işi bloke oluyordu |

### Yeni araçlar (çağrılmadıkça çalışmaz, 0 token)
| Ne | Ne işe yarar |
| --- | --- |
| `handoff.js` → `.claude/relay/HANDOFF.md` | Projenin nerede olduğu: açık sözleşmeler, son kapanışlar, dal, baş. Mekanik kısmı SessionEnd kancası yazar (bedelsiz), niyet paragrafı elle bir kez. Herhangi bir model okur |
| `contract.js precheck --id` | Ajan açmadan önce verify koşar; zaten geçiyorsa iş bitmiştir |
| `doctor.js` | Kurulum sağlam mı: sürümler, tablo, roller, kancalar, statusline, defter |
| `release.js` | Sürüm hafızadan değil `.changes/` notlarından: iki manifest + dört dosyadaki kurulum satırı + changelog birlikte hareket eder |
| `.claude/relay/config.json` | Proje kendi profilini tutar; premium makinede eco depo eco kalır |
| `.github/workflows/test.yml` | Üç işletim sisteminde test |

### Kesilenler
| Ne | Ne yapıyordu | Niye kaldırdık |
| --- | --- | --- |
| Guard'ın Bash kara listesi (`READ_CMDS`, `GIT_SAFE`, `readsOnly`, `allowed`) | Bash komut metninde `contracts/done` ve `relay/audits` arıyor, yazan komutları reddediyordu | Düz metin eşleşmesiydi: `cd .claude/relay/contracts; mv T7.md done/` hiçbir parçada bu diziyi taşımadığı için geçiyordu, buna karşılık defteri okuyan bir `python` tek satırı reddediliyordu. Korumayan koruma, olmayandan tehlikelidir; üstelik her Bash çağrısında bir node açtırıyordu. Bash kanca matcher'ından da düştü |

### Kesilmedi — gerekçesiyle
**Mühür (kayıt–ağaç bağı).** Kesme gerekçesi "sahte run-id zaten geçiyor, yani mühür güvence
vermiyor" idi. B1'de o açık kapandı: artık kayıt gerçekten koşmuş bir denetçiyi göstermek
zorunda. Gerekçe ortadan kalkınca kesim net bir kayıp oluyor: `headSha` + `diffHash`,
denetimden sonra değişen ağaçla kapanışı engelliyor, çalışma anı maliyeti kapanışta tek
hash, ve testi var. Yine de kesilsin denirse tek commit: kararı sen ver.
