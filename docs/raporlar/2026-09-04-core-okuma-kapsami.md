# Core satır okuma kapsamı — 4 Eylül 2026

Bu bir okuma manifestidir; dosyada hata bulunmadığını veya her davranışın çalıştırıldığını söylemez.

- Güncel Core ürün kapsamı: **135 dosya, 26.923 LF-ayrımlı satır**. Son boş satır sayılır.
- İlk dondurulmuş görüntü: 26.720 satır. Altı dosyanın bütün farkı okunarak `61b91c829e11ec0bd9b95f218c4583b0f6e54a7d` durumuna taşındı.
- Temel görüntüde kapsanmamış satır aralığı: **0**.
- LICENSE ile core/assets/licenses/AGPL-3.0-or-later.txt aynı SHA-256 içeriktir; ikinci kopya birebir hash eşitliğiyle doğrulandı, iki fiziksel dosya da envantere dahildir.
- Sonradan gelen commit edilmemiş contract.js farkının **30 ek satırı da okundu**. Bu delta aşağıda ayrı tutulur; ana suite sonucu 61b91c8 içindir.
- Kaynak numaraları ana raporda 61b91c8 durumuna aittir. Sonraki canlı düzenlemelerde fonksiyon adı ve hash esas alınmalıdır.
- İnceleme sırasında başka çalışma commit/düzenleme yaptı; bunlar inceleyenin düzeltmeleri değildir.
- Üretilen bu raporlar ve yeni tanı betiği, incelenen eski 135 dosyanın sayısına sonradan eklenmemiştir.

## Kapsam dışı

Ignored `Teknesyum-Base/` tarihsel kopyasının yaklaşık 1.074 dosyası (~56 MB; .git/node_modules hariç) tam satır taramasından geçirilmedi. .git nesne veritabanı, ignored üretilmiş map dosyaları ve ignored tarihsel trash dosyaları da kapsam dışında. Takip edilen iki trash dosyası ve kapalı 16 log okundu. Dolayısıyla **diskteki her eski/arşiv dosyasını okudum** iddiası yoktur. Mevcut Core kaynakları, roller, hook’lar, CLI’lar, testler, README/kararlar/araştırmalar/raporlar ve mevcut SVG/lisans dosyaları kapsam içindedir.

## Dosya manifesti

“Tam+fark” ilk dosyanın tamamı ve sonradan gelen değişikliklerin tamamı okunmuş demektir.

| Dosya | Satır | Okuma | SHA-256 (ilk 16) | İlgili eleştiri |
|---|---:|---|---|---|
| [install.ps1](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/install.ps1:1) | 50 | Tam | `6c5eb2ecbfc6f66d` | G35 |
| [install.sh](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/install.sh:1) | 46 | Tam | `47678d5b6976f341` | Statik okuma; yeni bağımsız bulgu kaydedilmedi |
| [package.json](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/package.json:1) | 13 | Tam | `aac755af1ef40a5d` | G35–G38, G55 |
| [.claude-plugin/marketplace.json](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/.claude-plugin/marketplace.json:1) | 26 | Tam | `e21848bcf2a78349` | G35–G38, G55 |
| [core/.claude-plugin/plugin.json](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/.claude-plugin/plugin.json:1) | 12 | Tam | `48df6cec73271a6d` | G35–G38, G55 |
| [.gitignore](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/.gitignore:1) | 14 | Tam | `70d0dc10b6d41f48` | Statik okuma; yeni bağımsız bulgu kaydedilmedi |
| [.github/workflows/test.yml](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/.github/workflows/test.yml:1) | 26 | Tam | `c297c491febdbafc` | Statik okuma; yeni bağımsız bulgu kaydedilmedi |
| [core/hooks/hooks.json](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/hooks/hooks.json:1) | 159 | Tam | `a9e841ff7efa4a99` | Statik okuma; yeni bağımsız bulgu kaydedilmedi |
| [core/agents/worker.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/agents/worker.md:1) | 11 | Tam | `71a3ddb3e45ac8c6` | Statik okuma; yeni bağımsız bulgu kaydedilmedi |
| [core/skills/relay/SKILL.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/skills/relay/SKILL.md:1) | 148 | Tam | `5731fa64cbb82ef8` | Statik okuma; yeni bağımsız bulgu kaydedilmedi |
| [core/hooks/lib.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/hooks/lib.js:1) | 415 | Tam | `64b8cb38910864fa` | G20 |
| [core/hooks/schema.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/hooks/schema.js:1) | 109 | Tam | `dd173fb0974b3592` | G11 |
| [core/hooks/guard.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/hooks/guard.js:1) | 524 | Tam | `172250509911eab0` | G08, G09, G10 |
| [core/hooks/watch.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/hooks/watch.js:1) | 457 | Tam | `675415c10d9e3ba8` | G14, G17, G21, G22 |
| [core/hooks/seal.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/hooks/seal.js:1) | 232 | Tam | `adeb009f859f5fab` | G03, G04 |
| [core/hooks/cue.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/hooks/cue.js:1) | 90 | Tam | `d76b6b8853d11a3e` | G40 |
| [core/hooks/prefs.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/hooks/prefs.js:1) | 98 | Tam | `62204d389797cf55` | Statik okuma; yeni bağımsız bulgu kaydedilmedi |
| [core/hooks/notice.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/hooks/notice.js:1) | 43 | Tam | `8165230c0ae85a8b` | Statik okuma; yeni bağımsız bulgu kaydedilmedi |
| [core/hooks/notify.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/hooks/notify.js:1) | 258 | Tam | `12205ebaff3c5d85` | G41 |
| [core/tiers.json](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/tiers.json:1) | 119 | Tam | `b6f026a06016dc23` | G12–G18, G55 |
| [core/roles/advisor.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/roles/advisor.md:1) | 44 | Tam | `fa69d0d348c88fc1` | G12–G18, G55 |
| [core/roles/auditor.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/roles/auditor.md:1) | 53 | Tam | `c8b3b98631caa7f2` | G12–G18, G55 |
| [core/roles/builder.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/roles/builder.md:1) | 34 | Tam | `477d25478109eedb` | G12–G18, G55 |
| [core/roles/planner.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/roles/planner.md:1) | 31 | Tam | `d8ee480fe9408493` | G12–G18, G55 |
| [core/roles/scout.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/roles/scout.md:1) | 57 | Tam | `72dce162795e802a` | G12–G18, G55 |
| [core/roles/scribe.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/roles/scribe.md:1) | 39 | Tam | `563284cdb1cae3ef` | G12–G18, G55 |
| [core/scripts/advice.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/advice.js:1) | 183 | Tam | `c792b49f800ca026` | G23 |
| [core/scripts/bridge.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/bridge.js:1) | 43 | Tam | `78d74b813b39f2e8` | Statik okuma; yeni bağımsız bulgu kaydedilmedi |
| [core/scripts/verify-runner.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/verify-runner.js:1) | 37 | Tam | `85e722a1b2243b83` | Statik okuma; yeni bağımsız bulgu kaydedilmedi |
| [core/scripts/contract.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/contract.js:1) | 1891 | Tam+fark | `beec4b2499b8d5bd` | G01, G02, G05, G06, G07, G12, G13, G15, G16, G18, G19, G31, G32 |
| [core/scripts/risk.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/risk.js:1) | 178 | Tam | `39e291d0fd449283` | G30 |
| [core/scripts/handoff.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/handoff.js:1) | 339 | Tam | `be68509caa70bd89` | G24, G25 |
| [core/scripts/log.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/log.js:1) | 123 | Tam | `9bac7f4520991c53` | G26 |
| [core/scripts/doctor.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/doctor.js:1) | 228 | Tam | `91e2074c308f1839` | G34 |
| [core/scripts/setup.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/setup.js:1) | 242 | Tam | `0ec387787aed469f` | G36 |
| [core/scripts/update.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/update.js:1) | 135 | Tam | `8e863126c8f50a7b` | G37 |
| [core/scripts/release.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/release.js:1) | 199 | Tam | `c22ee41ba11685cb` | G38 |
| [core/scripts/map.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/map.js:1) | 408 | Tam | `a3581b245a47cfed` | G27, G28, G29 |
| [core/scripts/manset.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/manset.js:1) | 231 | Tam | `97362bd7888053da` | G42 |
| [core/scripts/scaffold.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/scaffold.js:1) | 193 | Tam | `99eeb526951120cf` | G39 |
| [core/scripts/statusline.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/scripts/statusline.js:1) | 495 | Tam | `22c30ce42d482493` | G33 |
| [core/strings.json](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/strings.json:1) | 263 | Tam | `01d5c57deb79900e` | Statik okuma; yeni bağımsız bulgu kaydedilmedi |
| [test/run.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/test/run.js:1) | 7 | Tam | `31c8e9721e730732` | G43–G45 / test sonuçları |
| [test/audit-regressions.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/test/audit-regressions.js:1) | 152 | Tam | `f2ebfd7813cd6f6f` | G43–G45 / test sonuçları |
| [test/verify-timeout.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/test/verify-timeout.js:1) | 29 | Tam | `2f41331a856f950f` | G43–G45 / test sonuçları |
| [tools/audit-evidence.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/tools/audit-evidence.js:1) | 101 | Tam | `7db3d25d82bfe8ba` | G46 |
| [.changes/cheap-first.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/.changes/cheap-first.md:1) | 62 | Tam+fark | `28919eb4627c7c68` | Statik okuma; yeni bağımsız bulgu kaydedilmedi |
| [docs/danisma/001-ucuz-once-tier.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/danisma/001-ucuz-once-tier.md:1) | 105 | Tam | `526fe974cfad5b5d` | Statik okuma; yeni bağımsız bulgu kaydedilmedi |
| [docs/danisma/002-denetci-ve-iki-basamak.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/danisma/002-denetci-ve-iki-basamak.md:1) | 134 | Tam | `169797e074a55e1c` | Statik okuma; yeni bağımsız bulgu kaydedilmedi |
| [test/all.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/test/all.js:1) | 2877 | Tam+fark | `fd880b2e6e0c0fef` | G43, G44, G45 |
| [README.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/README.md:1) | 660 | Tam+fark | `dad220e6fd63288d` | G55 |
| [README.tr.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/README.tr.md:1) | 652 | Tam+fark | `556944ab9a74788d` | Statik okuma; yeni bağımsız bulgu kaydedilmedi |
| [CHANGELOG.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/CHANGELOG.md:1) | 80 | Tam | `7a622794f91817b7` | Statik okuma; yeni bağımsız bulgu kaydedilmedi |
| [docs/COST-MODEL.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/COST-MODEL.md:1) | 99 | Tam | `348435f84e13ce1b` | G56 |
| [docs/BENCH.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/BENCH.md:1) | 91 | Tam | `640f75f6c66aed72` | G57 |
| [docs/DECISIONS.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/DECISIONS.md:1) | 600 | Tam | `318a28b4f19c41f0` | Statik okuma; yeni bağımsız bulgu kaydedilmedi |
| [logs/openlogs/.gitkeep](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/logs/openlogs/.gitkeep:1) | 2 | Tam | `8d2f41e3b19bffac` | 16 log matrisi |
| [logs/openlogs/closed/BUG-contract-js-verify-adimi-testhost-exe-yi-oldurmuyor.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/logs/openlogs/closed/BUG-contract-js-verify-adimi-testhost-exe-yi-oldurmuyor.md:1) | 59 | Tam | `be055c404a7a2522` | 16 log matrisi |
| [logs/openlogs/closed/BUG-core-eklenti-olarak-kuruluyken-kendi-deposunu-bulamiyor-gunlukler-maka.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/logs/openlogs/closed/BUG-core-eklenti-olarak-kuruluyken-kendi-deposunu-bulamiyor-gunlukler-maka.md:1) | 106 | Tam | `7e88a855f2325b28` | 16 log matrisi |
| [logs/openlogs/closed/BUG-plan-konseyi-dosya-adina-bagli-kararin-agirligina-degil.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/logs/openlogs/closed/BUG-plan-konseyi-dosya-adina-bagli-kararin-agirligina-degil.md:1) | 66 | Tam | `ffcdf0dd6c0a7309` | 16 log matrisi |
| [logs/openlogs/closed/BUG-spawnsync-timeout-surec-agacini-oldurmuyor.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/logs/openlogs/closed/BUG-spawnsync-timeout-surec-agacini-oldurmuyor.md:1) | 63 | Tam | `8164c4c20b53de74` | 16 log matrisi |
| [logs/openlogs/closed/BUG-suit-basssiz-avalonia-testlerinde-konak-sureci-cokerek-kosumu-yarida-k.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/logs/openlogs/closed/BUG-suit-basssiz-avalonia-testlerinde-konak-sureci-cokerek-kosumu-yarida-k.md:1) | 134 | Tam | `da953351f986fd3f` | 16 log matrisi |
| [logs/openlogs/closed/BUG-t0-dogrulamasi-sabit-uzerine-kurulu-ve-kendini-dolduran-testi-goremiyo.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/logs/openlogs/closed/BUG-t0-dogrulamasi-sabit-uzerine-kurulu-ve-kendini-dolduran-testi-goremiyo.md:1) | 83 | Tam | `4099c04175836cdc` | 16 log matrisi |
| [logs/openlogs/closed/BUG-t0-is-dagitmak-yerine-soru-sorup-projeyi-durdurdu.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/logs/openlogs/closed/BUG-t0-is-dagitmak-yerine-soru-sorup-projeyi-durdurdu.md:1) | 105 | Tam | `98a9eca0a580d074` | 16 log matrisi |
| [logs/openlogs/closed/BUG-t0-turu-siradaki-direktifi-vermeden-kapatiyor-ajan-bosta-bekliyor.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/logs/openlogs/closed/BUG-t0-turu-siradaki-direktifi-vermeden-kapatiyor-ajan-bosta-bekliyor.md:1) | 91 | Tam | `c8af7aeb318c88c7` | 16 log matrisi |
| [logs/openlogs/closed/BUG-trash-disiplini-yazili-ama-hicbir-yerde-olculmuyor.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/logs/openlogs/closed/BUG-trash-disiplini-yazili-ama-hicbir-yerde-olculmuyor.md:1) | 78 | Tam | `ca1ba3ad786aa575` | 16 log matrisi |
| [logs/openlogs/closed/BUG-zaman-asan-verify-zombi-testhost-birakiyor.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/logs/openlogs/closed/BUG-zaman-asan-verify-zombi-testhost-birakiyor.md:1) | 51 | Tam | `ced0a82038af7e1f` | 16 log matrisi |
| [logs/openlogs/closed/HATA-contract-guard-komut-metnine-takiliyor-hedef-yola-degil.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/logs/openlogs/closed/HATA-contract-guard-komut-metnine-takiliyor-hedef-yola-degil.md:1) | 18 | Tam | `4f54dbb16babc296` | G60 |
| [logs/openlogs/closed/HATA-imza-blogu-yeni-projelere-kendiliginden-gelmiyor.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/logs/openlogs/closed/HATA-imza-blogu-yeni-projelere-kendiliginden-gelmiyor.md:1) | 113 | Tam | `97fabbcc34648975` | 16 log matrisi |
| [logs/openlogs/closed/HATA-kullaniciya-verilen-silme-komutu-dogrulanmamis-yollardan-kuruldu.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/logs/openlogs/closed/HATA-kullaniciya-verilen-silme-komutu-dogrulanmamis-yollardan-kuruldu.md:1) | 157 | Tam | `72ae3b440c510972` | 16 log matrisi |
| [logs/openlogs/closed/HATA-paralel-ajanlar-ayni-git-indeksini-paylasti.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/logs/openlogs/closed/HATA-paralel-ajanlar-ayni-git-indeksini-paylasti.md:1) | 143 | Tam | `81bf1ee1b1f22252` | 16 log matrisi |
| [logs/openlogs/closed/HATA-shields-rozetinde-okunmayan-beyaz-yazi.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/logs/openlogs/closed/HATA-shields-rozetinde-okunmayan-beyaz-yazi.md:1) | 84 | Tam | `1dce1ed64613da8c` | 16 log matrisi |
| [logs/openlogs/closed/YONTEM-cift-dilli-readme.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/logs/openlogs/closed/YONTEM-cift-dilli-readme.md:1) | 112 | Tam | `d8de9a2ef21865f5` | 16 log matrisi |
| [docs/CLAUDE-HANDOFF.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/CLAUDE-HANDOFF.md:1) | 237 | Tam | `fd28d08196a34eef` | Statik okuma; yeni bağımsız bulgu kaydedilmedi |
| [docs/TRIAGE.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/TRIAGE.md:1) | 82 | Tam | `7f486466cf06b51c` | Statik okuma; yeni bağımsız bulgu kaydedilmedi |
| [docs/EKOSISTEM.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/EKOSISTEM.md:1) | 72 | Tam | `94cc9429d72134cf` | Statik okuma; yeni bağımsız bulgu kaydedilmedi |
| [docs/GRAPHIFY.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/GRAPHIFY.md:1) | 48 | Tam | `0d80eb91328ccca6` | Statik okuma; yeni bağımsız bulgu kaydedilmedi |
| [docs/diagram.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/diagram.md:1) | 47 | Tam | `96197118955c1830` | Statik okuma; yeni bağımsız bulgu kaydedilmedi |
| [docs/YOL-HARITASI.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/YOL-HARITASI.md:1) | 288 | Tam+fark | `74eca2e7b0ffdb11` | Statik okuma; yeni bağımsız bulgu kaydedilmedi |
| [docs/contracts/GORUS-dil-2.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/contracts/GORUS-dil-2.md:1) | 49 | Tam | `997647ed86480e4a` | G58 |
| [docs/contracts/GORUS-model-kademesi.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/contracts/GORUS-model-kademesi.md:1) | 2 | Tam | `2dfc1385f53d8607` | G58 |
| [docs/contracts/LOG.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/contracts/LOG.md:1) | 9 | Tam | `3f0260e4908194f9` | G58 |
| [docs/contracts/N-model-kademesi.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/contracts/N-model-kademesi.md:1) | 91 | Tam | `e52fa2bad7375e46` | G58 |
| [docs/contracts/O-kademe-tablosu.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/contracts/O-kademe-tablosu.md:1) | 139 | Tam | `605c1622cdb76482` | G58 |
| [docs/contracts/P-danisma-mimarisi.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/contracts/P-danisma-mimarisi.md:1) | 107 | Tam | `069aec09bb59bc93` | G58 |
| [docs/contracts/R-ajan-dili.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/contracts/R-ajan-dili.md:1) | 84 | Tam | `4b48062e9ef786b7` | G58 |
| [trash/S-isaretci-denetimi.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/trash/S-isaretci-denetimi.md:1) | 51 | Tam | `f3e3f2c823cdca09` | Statik okuma; yeni bağımsız bulgu kaydedilmedi |
| [trash/title.js](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/trash/title.js:1) | 29 | Tam | `4731327c8ace00fb` | Statik okuma; yeni bağımsız bulgu kaydedilmedi |
| [docs/contracts/T-evrim-plani.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/contracts/T-evrim-plani.md:1) | 455 | Tam | `c44789bdd172e1ec` | G58 |
| [docs/inceleme/_SABLON.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/_SABLON.md:1) | 41 | Tam | `241f033019db6755` | G48 |
| [docs/inceleme/adr.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/adr.md:1) | 151 | Tam | `ec42b4c245ecbdf7` | Araştırma matrisi |
| [docs/inceleme/aider-repomap.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/aider-repomap.md:1) | 139 | Tam | `2fd75c17cbdcf91e` | Araştırma matrisi |
| [docs/inceleme/ast-grep.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/ast-grep.md:1) | 142 | Tam | `e7deeda1e4218d1d` | Araştırma matrisi |
| [docs/inceleme/baglam-enjeksiyonu.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/baglam-enjeksiyonu.md:1) | 137 | Tam | `588fec6bae982d45` | Araştırma matrisi |
| [docs/inceleme/beads.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/beads.md:1) | 150 | Tam | `5d94f7c1d55c9600` | Araştırma matrisi |
| [docs/inceleme/git-native.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/git-native.md:1) | 171 | Tam | `756ba1ef63841b17` | Araştırma matrisi |
| [docs/inceleme/mem0.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/mem0.md:1) | 150 | Tam | `1fb01976d81306e1` | Araştırma matrisi |
| [docs/inceleme/repomix.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/repomix.md:1) | 120 | Tam | `5bd0f678ecc70521` | Araştırma matrisi |
| [docs/inceleme/serena.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/serena.md:1) | 143 | Tam | `f47a269af03ad7ec` | Araştırma matrisi |
| [docs/inceleme/spec-kit.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/spec-kit.md:1) | 149 | Tam | `c38f94fe9cfa80b2` | Araştırma matrisi |
| [docs/inceleme/openspec-taskmaster.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/openspec-taskmaster.md:1) | 194 | Tam | `4d5ab60411158f52` | Araştırma matrisi |
| [docs/inceleme/ccusage-ccstatusline.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/ccusage-ccstatusline.md:1) | 313 | Tam | `37e7b05846dcfad4` | Araştırma matrisi |
| [docs/inceleme/claude-flow.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/claude-flow.md:1) | 291 | Tam | `e6f703e68b1400df` | Araştırma matrisi |
| [docs/inceleme/semgrep-codeql.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/semgrep-codeql.md:1) | 249 | Tam | `22fadfa84f31781f` | Araştırma matrisi |
| [docs/inceleme/graphify.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/graphify.md:1) | 387 | Tam | `a1a66ccea600d71a` | Araştırma matrisi |
| [docs/inceleme/obsidian.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/obsidian.md:1) | 213 | Tam | `429f133df7b00c78` | Araştırma matrisi |
| [docs/inceleme/_OLCUM-graphify.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/_OLCUM-graphify.md:1) | 166 | Tam | `efb349600cd2275c` | G47 |
| [docs/inceleme/_OLCUM-obsidian.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/_OLCUM-obsidian.md:1) | 171 | Tam | `baba9baf8f6b9602` | G49 |
| [docs/inceleme/_SENTEZ.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/inceleme/_SENTEZ.md:1) | 507 | Tam | `d36f40156be347b2` | Araştırma matrisi |
| [docs/raporlar/2026-09-03-claude-vidshrink-prompt.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/raporlar/2026-09-03-claude-vidshrink-prompt.md:1) | 63 | Tam | `1151995120fd0561` | Önceki rapor matrisi |
| [docs/raporlar/2026-09-03-vidshrink-denetim.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/raporlar/2026-09-03-vidshrink-denetim.md:1) | 265 | Tam | `9ada510245aad999` | Önceki rapor matrisi |
| [docs/raporlar/denetci-maliyet-analizi.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/raporlar/denetci-maliyet-analizi.md:1) | 118 | Tam | `965d935fad6ca632` | G50 |
| [docs/raporlar/ek-72-ek-tur-sinif-atamasi.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/raporlar/ek-72-ek-tur-sinif-atamasi.md:1) | 98 | Tam | `267a732aed59f828` | Önceki rapor matrisi |
| [docs/raporlar/rele-israfi-124-sozlesmelik-olcum.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/raporlar/rele-israfi-124-sozlesmelik-olcum.md:1) | 336 | Tam | `73b7db34d99d5de3` | Önceki rapor matrisi |
| [docs/raporlar/rele-surec-kusurlari-127-sozlesmelik-olcum.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/raporlar/rele-surec-kusurlari-127-sozlesmelik-olcum.md:1) | 612 | Tam | `4525cbf3849c464f` | G51 |
| [docs/raporlar/vidshrink-core-onerileri.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/raporlar/vidshrink-core-onerileri.md:1) | 677 | Tam | `6b559b5dd721d915` | G53 |
| [docs/raporlar/vidshrink-tasnif.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/raporlar/vidshrink-tasnif.md:1) | 76 | Tam | `661e180a0c355da6` | G52 |
| [docs/raporlar/yetki-bosluklari.md](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/raporlar/yetki-bosluklari.md:1) | 120 | Tam | `76d6830572ee0cbe` | G54 |
| [docs/raporlar/2026-09-03-vidshrink-kanit.json](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/raporlar/2026-09-03-vidshrink-kanit.json:1) | 1624 | Tam | `3f9e350b1cb4cbca` | Önceki rapor matrisi |
| [assets/badge-lang.svg](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/assets/badge-lang.svg:1) | 15 | Tam | `dc2c10b97e374dba` | G59 / kaynak incelemesi |
| [assets/badge-lang.tr.svg](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/assets/badge-lang.tr.svg:1) | 15 | Tam | `bc2acfff3dfda3b0` | G59 / kaynak incelemesi |
| [assets/badge-license.svg](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/assets/badge-license.svg:1) | 21 | Tam | `facc6533e770601d` | G59 / kaynak incelemesi |
| [assets/badge-sponsor.svg](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/assets/badge-sponsor.svg:1) | 21 | Tam | `1862e7d90f75e552` | G59 / kaynak incelemesi |
| [assets/banner.svg](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/assets/banner.svg:1) | 37 | Tam | `b0e17def1cfd3021` | G59 / kaynak incelemesi |
| [assets/banner.tr.svg](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/assets/banner.tr.svg:1) | 37 | Tam | `f553f43a02439541` | G59 / kaynak incelemesi |
| [assets/flow-agents.svg](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/assets/flow-agents.svg:1) | 41 | Tam | `8c874fd49b4f8692` | G59 / kaynak incelemesi |
| [assets/flow-agents.tr.svg](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/assets/flow-agents.tr.svg:1) | 41 | Tam | `9e79a3aada3ab2bd` | G59 / kaynak incelemesi |
| [assets/flow-contract.svg](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/assets/flow-contract.svg:1) | 43 | Tam | `6fb908f1ad9312fd` | G59 / kaynak incelemesi |
| [assets/flow-contract.tr.svg](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/assets/flow-contract.tr.svg:1) | 43 | Tam | `50b9383c7a5b4edd` | G59 / kaynak incelemesi |
| [assets/flow-cost.svg](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/assets/flow-cost.svg:1) | 41 | Tam | `a8fb135e20edb716` | G59 |
| [assets/flow-cost.tr.svg](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/assets/flow-cost.tr.svg:1) | 41 | Tam | `fac492af30118e18` | G59 / kaynak incelemesi |
| [core/assets/badge-lang.svg](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/assets/badge-lang.svg:1) | 15 | Tam | `dc2c10b97e374dba` | G59 / kaynak incelemesi |
| [core/assets/badge-lang.tr.svg](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/assets/badge-lang.tr.svg:1) | 15 | Tam | `bc2acfff3dfda3b0` | G59 / kaynak incelemesi |
| [LICENSE](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/LICENSE:1) | 662 | Tam | `e0eedba615d5cd1b` | Statik okuma; yeni bağımsız bulgu kaydedilmedi |
| [core/assets/licenses/AGPL-3.0-or-later.txt](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/core/assets/licenses/AGPL-3.0-or-later.txt:1) | 662 | Birebir kopya doğrulandı | `e0eedba615d5cd1b` | G59 / kaynak incelemesi |

## Geç delta

`core/scripts/contract.js`: 1.921 satır; SHA-256 `e9dc404509e5c21fb1ce548d71160fb5b75d7c5a06977e56c84ab68429dc9bf1`.

Eklenen ikinci complete/dirtyOutside kontrolü önceki kontrolü tekrar ediyor; audit aşamasındaki kontrol kapsam taşmasını daha erken yakalamaya yardımcı. Bunlar untracked/yanlış checkout/post-verify değişimi sorununu çözmüyor. Builder rolü ve coreVersion alanları görünürlüğe katkı sağlar; `require('../../package.json')` kaynak repo yerleşimine bağlıdır ve yalnız `core/` kurulan paket yerleşiminde bulunmayabilir. Gerçek kurulu paket üzerinde ayrıca sınanmalıdır.

Bu 30 satırlık fark sonrası 12 tanı senaryosu yeniden çalıştırıldı: **12 sorun yeniden üretildi**; contract.js syntax kontrolü geçti. Ana 2.625 assertion kapsamı bu geç deltada yeniden koşulmadı.

Tam hash’ler, eski okuma aralıkları ve ham çıktılar [kanıt JSON’unda](C:/Users/Administrator/Desktop/Projeler/Teknesyum-Core/docs/raporlar/2026-09-04-core-tam-inceleme-kanit.json) bulunur.

