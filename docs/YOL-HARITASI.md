# Yol Haritası

Kullanıcının istediği, henüz bitmemiş işler. Buraya yalnız **kullanıcının söylediği**
şeyler yazılır; ben kendi fikrimi buraya eklemem. Bir madde bitince silinmez,
`[x]` işaretlenir ve bitiş sürümü yazılır. Compact bu dosyayı unutturamaz.

Kural: her tur başında bu dosya okunur, sıradaki madde alınır, biter, onay istenir.
Aynı anda tek madde açık kalır.

## Değişmez ilkeler

- **Altın kural: maliyet.** Mümkünse 0. Sıradan bir turda hiçbir kanca modelin
  bağlamına token yazmaz. Bir özellik bunu bozuyorsa özellik değildir.
- **Fable karar ortağıdır**, sadece denetçi değil. Plan kurulurken —
  seçim yapılmadan önce — görüşü alınır. Önemli işte onay makamı da olabilir;
  ama birincil rolü karar ve plan.
- Bu disiplin diğer projelerde de aynı: kullanıcının istekleri bir yol haritası
  dosyasına yazılır, maliyeti minimum tutulur, unutulmaz.

## Açık maddeler

- [ ] **VidShrink saha raporları (17 madde).** Tasnif ve fiyat:
      [vidshrink-tasnif.md](raporlar/vidshrink-tasnif.md). Tek kök beş raporu birden
      kapatıyor: `relayRoot` cwd'den tırmanıyor, `git rev-parse --git-common-dir`
      sormalı. Sonra kapı ölçümü (reddedilen çağrı hiçbir yere yazılmıyor). Sıra ve
      fiyat orada; kurulacak olanı kullanıcı seçer.

- [ ] **Denetçi neden hiç açılmıyor.** Ölçüm ve fiyat:
      [denetci-maliyet-analizi.md](raporlar/denetci-maliyet-analizi.md). Bulgu: denetçi
      VidShrink'te 25/25 yüksek riskli sözleşmede açıldı ve gerçek KRİTİK yakaladı (T84,
      T100, T102). Açılmadığı yer Core'un kendisi — bu depoda hiç sözleşme yok. Asıl
      açık tetikte: `risk.js` diff'in şeklini ölçüyor, doğruluğunu değil. Önerilen sıra
      önce deterministik kesişim kontrolü (sıfır token), sonra haiku "okur" (sözleşme
      başı ~1 sent). İkisi de fan-in ve plancı damgası ölçülmeden kurulmayacak.

- [ ] **teknesyum-ui deposu.** Arayüz standardı ayrı depoda ve kurulu değil; her arayüz
      işinde renk/ölçü kullanıcıya soruluyor.

Fable'ın sıraladığı on madde kapandı; ikinci sıra aşağıda, koşulları dolmadı.

**Ertelendi — en sona.** Bench pilotu (`docs/BENCH.md`, plan hazır, betik yazılmadı).
Karar 2026-09-02: mekanizma daha oturmadan ölçüm anlamsız. Bench, her şey bittiğinde
en son iş.

İkinci sıra (koşulu dolmadı): #64 kabul↔verify kapsam eşlemesi, #42 ayrık güven ölçeği,
#26 birlikte-değişim (depo genç), #43/#44 DECISIONS.md durumu ve `supersedes`, #67 diff'te
sır taraması. ast-grep tek koşullu aday; koşul (günlükte kanıtlanmış AST isabet ihtiyacı)
dolmadı.

### Sınamadan eklenen ilke

**Tazelik kanıtı okura bırakılmaz.** Üretilmiş her çıktı, tüketildiği anda betik tarafından
güncelliğe karşı denetlenir; bayatsa bunu çıktının ilk satırında söyler. Sessiz bayat çıktı,
yanlış çıktıdır.

**Bir tur, KRİTİK olmadan açılmaz.** Ölçüldü: 124 sözleşmenin 54'ü ek tur gördü, toplam
72 tur. Turun bedeli bir yapıcı artı bir denetçi; stil, daha iyi bir ad, "şunu da test
etseydik" borçtur, tur değil.

**Danışman eşiği tur 3.** VidShrink'in düzeltilmiş sayımı: eski kuralın lafzı tur 4'ü
bağlıyordu, tur 3'e geçen 14 sözleşmenin 14'ünde danışman yok. Manşet kayması tur 2'de
8/54, tur 3–4'te 9/18 — kod kusuru bir turda kapanıyor, cümle kusuru kapanmıyor. Eşik
bu yüzden bir basamak aşağıda.

**Tur, defterin saydığı şeydir.** Gövdedeki `round` alanı elle düzenlenebiliyordu ve
54 sözleşmenin 4'ünde defterle uyuşmuyordu; o sözleşmelerde denetim kaydı yanlış adın
altında aranıyor demektir.

## Bitenler

- [x] **Ucuz-önce'nin sessiz açığı (Fable, 001).** Fable'ın bulgusu: "mevcut sinyaller
      opus'a ulaşıyor" cümlesi yanlıştı. Sinyallerin hepsi gürültülü — risk, tur, araç
      hatası. Sessiz hata ise şu: küçük, makul ama yanlış bir diff `verify`'ı geçer, risk
      `low` çıkar, denetçi hiç açılmaz. Fable'ın iki basamağı da kuruldu.
      (a) **fan-in** — `owns` içindeki bir dosyayı 5+ dosya içeri alıyorsa builder ve
      ui-builder ucuz-önce'den muaf; veri `map.json`'dan okunuyor, taze tarama yok.
      (b) **plancı damgası** — sözleşmedeki `raise:` satırı, aynı sayfada bir `why:`
      varsa modeli yükseltiyor. `model:` alanı ne koştuğunu tutmaya devam ettiği için
      ayrı bir alan seçildi. İkisi de profil tavanının altında kalıyor. 10 yeni sav.
      Damga oranı üçte biri geçerse ucuz-önce kurgudur; defterden görülecek.

- [x] **Danışma kaydı.** Fable'a ne sorulduğu ve ne döndüğü yalnızca sohbette kalıyordu;
      kullanıcı ikisini de tam metin görmek istedi, haklı olarak — gördüğü veri arttıkça
      yönlendirmesi isabetli oluyor. `advice.js` eklendi: `watch.js` dağıtım anında tavan
      modele ya da `advisor` rolüne giden çağrının istemini `docs/danisma/NNN-konu.md`
      dosyasına yazıyor, `SubagentStop` anında da cevabı ajanın kendi transkriptinden
      dolduruyor. İki yarı da soran modelin elinden geçmiyor. Sıradan iş kayıt bırakmıyor.
      Kural `RULES.md` içine de yazıldı. 11 yeni sav.

- [x] **Borç defteri.** Turun ortasında verilen söz bağlamla birlikte gidiyordu; bir Fable
      danışması tam böyle düştü. `.claude/relay/OWED.md` açıldı: en fazla üç satır, her
      biri altmış karakter, tarihli. `handoff.js owe --add` yazıyor, `owe --done <n>
      --because "..."` kapatıyor ve gerekçe `HANDOFF.md` içinde **Closed debts** altına
      düşüyor. Listeyi her istem `cue.js` üzerinden geri getiriyor, zaten var olan işaret
      dizisinin başında; boş defterin bedeli yok, `CAP = 200` değişmedi. Zaman aşımı yok,
      üç günlük borç `stale` diye işaretleniyor. Dosyayı el yazamıyor, `guard.js`
      engelliyor. Tasarım Fable ile birlikte kararlaştırıldı. 17 yeni sav.

- [x] **Kapı mühürde değil dağıtımda.** Fable'ın itirazı: mühür anında yakalamak parayı
      geri getirmiyor, üstelik açmaz doğuruyor — sinyalsiz bir sözleşme hiç
      mühürlenemezdi. Kapı `Agent`/`Task` çağrısının önüne alındı: `watch.js` zaten o
      olayı görüyordu, artık `contract.js overDispatch` ile modeli hücreye karşı ölçüp
      tek token harcanmadan reddediyor. Mühür yine bakıyor ama reddetmiyor, aşımı
      `live/problems.log`'a yazıyor. `envPinned()` ayrıca kabuk profillerine de bakıyor
      (`.bashrc`, `.zshrc`, `.profile`, `.bash_profile`) — Fable'ın gösterdiği açık.
      Fable'ın onaylamadığı tek şey kalmadı; `sonnet/high` seçimi ise ölçülmeden kalıcı
      sayılmayacak. Deneyin şekli de Fable'dan (001): 156'lık örnek kontrol değil, başka
      bir rejim. Tek kollu 20-30 sözleşme yerine **sözleşme id'sinin tek/çiftine göre
      alternatif** — tek opus/medium, çift sonnet/high, aynı projede aynı iki hafta.
      Sözleşme başına kaydedilecek: dağıtılan model ve efor (rapordan değil kapıdan),
      hücreyi belirleyen sinyal, `owns` sayısı, en yüksek fan-in, nihai diff satırı, tur,
      araç hatası, denetçi açıldı mı, tur başına builder+denetçi bedeli ve bugün olmayan
      bir sütun: **köken** — sonraki bir `reopen --critical` ya da `log.js` kaydı bu
      sözleşmenin mühürlediği dosyayı adlandırırsa o tur buraya yazılır. Pencere, son
      sözleşmeden 20 sözleşme sonra kapanır. **Geri dönme eşiği:** sonnet kolunun yeniden
      açılma oranı opus kolunu 15 puandan fazla geçerse; sonnet kolunda üç ya da daha
      fazla geri yüklenmiş geç kusur varken opus kolunda sıfır ya da bir varsa; ya da
      mühürlenen sözleşme başına atfedilen bedel sonnet kolunda opus kolunun en az %25
      altında değilse. Kol başına 15 ile yalnız büyük etkiler görülür; null sonuç
      "doğru" değil, "bariz biçimde yanlış değil" demektir ve README'ye böyle yazılır.

- [x] **Çivilenmiş kaçış kolu.** Makinede `TEKNESYUM_GATE_OPEN=1` kullanıcı ortam
      değişkeni olarak kalıcı duruyordu; ana dal kapısı bütün oturumlarda fiilen
      kapalıydı. Kol artık tek komutluk: `lib.js` içindeki `envPinned()` değişkenin
      kayıt defterine yazılıp yazılmadığına bakıyor, yazılmışsa `guard.js` kolu yok
      sayıyor ve engel metni sebebini söylüyor. Makinedeki değer silindi. 3 yeni sav.
      Bulgu bir dış incelemeden geldi, ölçümle doğrulandı.

- [x] **Ucuz başlangıç.** VidShrink'te 156 sözleşme ölçüldü: 118'i opus'ta koşmuş, 59'u
      1. turda ve `risk:` alanı bile yokmuş. Hepsi `builder` ya da `ui-builder` olarak
      dağıtılmış; `scout` hiç kullanılmamış. Sebep iki katmanlıydı — premium'un builder
      hücresi `opus/medium`'du, ve relay skill'inin boy tablosunda ölçüm işi için satır
      yoktu, o yüzden her şey builder'a düşüyordu. Üçü de düzeltildi: premium farkı artık
      modelde değil eforda (`sonnet/high`), `scout` ölçüm/bench/rapor işini de kapsıyor,
      ve mühür sözleşmenin `model:` alanını okuyup hücrenin üstündeki modeli sinyalsiz
      kabul etmiyor. Tırmanma yolları duruyor: tekrarlanan hata, 3. tur, risk high.
      9 yeni sav. Fable'a beş kez soruldu, beşinde de 529 döndü; erişilebilir olunca
      tasarım ona bir daha götürülecek.

- [x] **Bitiş sesi.** İki kusur vardı. Ses `Stop` olayına doğrudan bağlıydı ve `async`
      çalışıyordu; kapı turu bloklasa bile — teslim edilmiş sözleşme ya da dağıtılmamış
      iş varken — ding çalıyor, tur ise devam ediyordu. Şimdi sesi `watch.js` veriyor:
      yalnız kapı turu bırakırsa. İkincisi, sesin işi uzun işten sonra çağırmaktı ama
      üç saniyelik cevapta da çalıyordu; tek fren art arda gelen `Stop`ları yutan 10
      saniyelik pencereydi. Kullanıcının kararı: eşik olmasın, ses sıra kullanıcıya
      geçtiği an çalsın. `cue.js` istemin saatini yine de damgalıyor ve
      `events.done.minMs` isteyene açık, ama varsayılan sıfır. 10 yeni sav.

- [x] **Tur defterden sayılıyor, devir notu sıkıştırmadan önce tazeleniyor.**
      `round` alanı elle düzeltilebildiği için 54 yeniden açılan sözleşmenin 4'ünde
      gövdeyle defter uyuşmuyordu (%7); mühür artık turu defterdeki `reopened`
      satırlarından sayıyor ve gövde onunla çelişirse kapanmıyor. Defterin hiç
      duymadığı sözleşme muaf, yani devralınan ağaç kapanmaya devam ediyor. Ayrıca
      `PreCompact` kancası bağlandı: sıkıştırmadan hemen önce `handoff.js` aynı
      `HANDOFF.md`'yi tazeliyor. Fikir kullanıcının, biçimi Fable'ın kararı — yeni
      dosya yok, bağlama tek token yazılmıyor, not diske düşüyor. 5 yeni sav, takım
      2.545'te yeşil.

- [x] **Manşet kayması, danışman ve kapının yönü.** VidShrink günlüğündeki en pahalı
      kusur sınıfı kapatıldı: sözleşme bir `.md` sahipleniyorsa `manset.js` düzyazıdaki
      her sayıyı aynı bölümün tablosuna/listesine bağlıyor (`manset: off` ile muaf).
      Üçüncü turdan itibaren `reopen --advisor <id>` zorunlu ve id'nin rolü danışman
      olmalı — "iki turdan sonra Fable'a danışılsın" kuralı ilk kez koda döndü. Denetçi
      artık istemindeki rolden tanınıyor (tür değil), `audit --dry-run` imza yetkisini
      bedeli ödenmeden söylüyor, kayıtsız mühür bunu tek satırla itiraf ediyor. Kapı
      `main`'e ulaşan işi durduruyor, çalışma dalını bırakıyor, heredoc'u kesiyor ve
      PowerShell'i de görüyor. Tur tavanı 6 → 5. 27 yeni sav, takım 2.540'ta yeşil.

- [x] **Rölenin israfı: iki raporun sekiz kusuru.** (v0.7.4) `docs/raporlar/` altındaki
      124 ve 127 sözleşmelik ölçümler işlendi. Kapatılanlar: düz dizge `verify` (sıfır
      adım, sessiz mühür), sıfır test toplayan adım, iki verify koşusunun birbirini
      ölçmesi (koşum kilidi), KRİTİK'siz açılan tur, ölü dosya uyarısının yanlış alarmı
      (2/2 yanlıştı; test ve docs notu artık hiç sorulmuyor, kod içe aktaranından
      aranıyor). 8 yeni sav, takım 2.508'de yeşil.
- [x] **Banner ajanla uyanıyor.** Banner yalnız `.claude/relay/` varken konuşuyordu ve o
      klasörü yalnız `contract.js` yaratıyordu; sözleşmesiz çalışan her oturumda —yani
      araştırmanın tamamında— banner sustu. Ajan çağrısı artık klasörü kendisi doğuruyor.
      Foot bandı da head'in tekrarı olmaktan çıktı: ya biten iş, ya "seni bekliyor".

- [x] **On madde, Fable'ın sırasıyla.** (v0.7.4) On altı proje incelendi
      (`docs/inceleme/`), 74 fikir envanterlendi (`_SENTEZ.md`), iki kontrollü ölçüm
      yapıldı; hiçbir dış araç kurulmadı. 25 yeni sav, takım 2.494'te yeşil. İki kapı
      Fable'ın künt halinden daraltıldı: kesişim yalnızca **değişmiş** ortak dosyayı
      sayıyor, kirli ağaç yalnızca **çalıştırılabilir** dosyayı engelliyor.

- [x] **1. Risk temeli `merge-base`.** (`risk.js gitNumstat`) Dalda biriken commit'ler
      bugün riskten kaçıyor; bu eksik değil **yanlış** cevap.
- [x] **2. Diff'te A/M/D/R sınıfı.** (`--name-status --diff-filter`) Silme ile eklemeyi
      aynı ağırlıkta saymak riski yanıltıyor.
- [x] **3. Hunk başlığından fonksiyon adı + satır aralığı.** (`risk.js`) Ölçüldü: 32.584 →
      542 bayt, 60× daralma.
- [x] **4. Bağlam doluluğu statusline'da.** (`statusline.js build`) Veri zaten stdin'de,
      okunmuyor.
- [x] **5. `complete()` kirli ağaç kontrolü.** (`contract.js`) Kirli ağaç belirsiz bir
      ağacı mühürlüyor.
- [x] **6. `owns` kesişim kontrolü.** (`contract.js`) İki açık sözleşme aynı dosyayı
      sahiplenebiliyor.
- [x] **7. `blocked-by` ve hazır-iş sorgusu.** (`contract.js`)
- [x] **8. map.json küçülme koruması + şema sürümü + `who` yedeği.** (`map.js`)
- [x] **9. Bayatlık protokolü.** `staleness()` var, kimse okumuyor: uyarı `map.md`'nin ilk
      satırına ve statusline'a bassın.
- [x] **10. map.md çıktı bütçesi ve dürüst kırpma.** (`map.js emit`) Dört bağımsız projede
      görülen tek ortak desen.

- [x] **6. Ekosistem raporu.** (`docs/EKOSISTEM.md`) Maliyet dört sınıfa ayrıldı;
      Core tamamen Z (sıfır). Karar: hiçbir şey kurulmuyor. Obsidian, kalıcı bellek
      MCP'leri, RAG ve GitHub-MCP kurma; graphify ve LSP koşullu; Windows-MCP
      varsayılan kapalı olsun. Gerçek boşluk iki tane: kod tabanı anlama (graphify
      kapatıyor) ve oturumlar arası hafıza (yerleşik hafıza + yol haritası kapatıyor).
      Altın kuralı sessizce bozmanın beş yolu ve her birinin ölçüsü yazıldı.
      Fable'a danışıldı; hükümler onun.
- [x] **7. Graphify durumu.** (`docs/GRAPHIFY.md`) Core'da değil, hiç olmadı.
      `~/.claude/skills/graphify` (v0.9.39) olarak kullanıcı seviyesinde kurulu, o
      yüzden her oturumda görünür. Base'in "kısmen eklendi" dediği şey grafik değil
      import haritasıydı; o parça `core/scripts/map.js` olarak Core'da. Ayrı kalır:
      Core Node ve sıfır bağımlılık, graphify Python ve çağrı başına maliyet.
- [x] **11. Açık günlüklerin hepsi.** (v0.7.3) On üç kayıt okundu, gerekçesiyle
      kapatıldı: coreRepo makarası (setup + log.js sesi + doctor `logs` satırı),
      verify zaman aşımının süreç ağacı (`killTree`), Stop kapısının soru şartının
      kaldırılması, trash ölçüsü (`orphans`), plan konseyinin tetiği, denetçinin
      eklenen sahte assertion kontrolü, paralel yazarların git indeksi, rozet
      kontrastı, imza bloğu. Biri Core kaydı değildi (Avalonia konağı), o da
      gerekçesiyle kapandı.
- [x] **1/3/4. Sole raporu ve banner araştırması.** Rapor geldi, 12 hatanın hepsi
      işlendi (madde 9). Ölçülen: `###` başlık render **edilmiyor**, markdown ve
      HTML de çalışmıyor; **ANSI çalışıyor** — renk, kalın, ters video, yani
      "beyaz dolgu üstüne kırmızı yazı" `ESC[31;47m` ile mümkün. Bağlama yazmayan
      diğer kanallar: statusline, Notification kancası, `terminalSequence` (yalnız
      OSC). Ücretsiz **olmayanlar**: `additionalContext`, SessionStart/
      UserPromptSubmit stdout, kanca stderr/exit 2. Detay maliyeti artırmadan
      artıyor, çünkü hepsi zaten diskteki kayıtlardan okunuyor — madde 10.
- [x] **10. Banner yeniden tasarımı.** (04a881a) İki satır: üstte kim oturuyor
      — `2× Haiku-Low İzci · SZL12 R2 · 5 dk sessiz` —, altında dallarda ne
      yapıyor: `└ rozet metni duzeni · adım 12 · son: statusline.js`. Fiil dolgusu
      (`Atandı`, `Yapılıyor`) ve `###` öneki gitti. Renk 256 renkli: mark camgöbeği,
      koltuk mor, uyarı macenta; değerler boyasız kaldığı için kimlik, dosya adı ve
      sözleşme başlığı olduğu gibi okunuyor. `NO_COLOR` hepsini siliyor. En çok üç
      satır, her satır 120 karakter. Fable'ın kararı olduğu gibi uygulandı;
      `steps` oranlanmadı (birimler farklı, yalan söylerdi).
- [x] **9. Sole'nin bulduğu 12 hata.** (04a881a, f2234f8, 2314093) Hepsi kapandı:
      notify.js üç düzeltme · schema.js CRLF · log.js slug · banner bütçesi artık
      görünür uzunluktan hesaplanıyor · merge() kilit alıyor (ölçüldü: kilitsiz 12
      artıştan 2-9'u kayboluyordu, kilitli 12/12) · write() rename'i tekrar deniyor
      ve sonucu döndürüyor · biten alt ajanı geç olay diriltmiyor · dropSnapshot,
      `stash create`, `git diff` ve release.js'in git hataları artık sessiz düşmüyor.
      Şüphelilerden `_stale.json` çift kaydı gerçekti, kilide alındı; ledger
      appendFileSync tek satırlık O_APPEND yazımı, hata değil.
- [x] **8. Fable'ın üç kapısı.** watch.js Stop kapısı (submitted teslim + soruyla
      biten tur), guard.js Bash kapısı (git merge/push), SKILL.md ve auditor.md
      satırları. `TEKNESYUM_GATE_OPEN=1` kaçış yolu duruyor.
- [x] **5. Altın kural denetimi.** İhlal yok. Bağlama yazan tek yüzey `cue.js`;
      o da yalnız "log yaz" cümlesinde ve açık sözleşmeli oturum açılışında
      konuşuyor. Kancaların hepsi ~30 ms, çıktıları boş.
- [x] **3c/4c. Dil düğmesi ve karar notu.** (2c6d244) `assets/badge-lang.svg` +
      `.tr.svg` iki yarımlı EN|TR düğmesi; `scaffold.js langlink` yazıyor.
      YONTEM günlüğü `docs/DECISIONS.md` D16 oldu, günlük arşive alındı.
- [x] **a. Trash disiplini.** (2c6d244) `contract.js complete` kapanışta ağacın
      artık adını anmadığı sahipli dosyaları listeliyor, `trash/` gösteriyor.
- [x] **2. openlogs denetimi.** (3dcfbf3) setup `coreRepo`yu yazıyor, günlük nereye
      düştüğünü söylüyor, `log close/archive` öneki ne olursa olsun buluyor.
      Guard günlüğü kapandı. Şüpheliler kullanıcıya soruldu.
