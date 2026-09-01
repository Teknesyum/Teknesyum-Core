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

- [ ] **1. Sole raporu.** Prompt yazıldı, kullanıcı yapıştıracak. Sole üç başlıkta
      rapor yazacak: bug avı, banner görünümü (renk/başlık/alternatif ücretsiz
      protokol), maliyet artmadan daha fazla detay. Rapor gelince işlenecek.
- [ ] **3. Banner görünümü — benim araştırmam.** Başlık gibi görünmesi istendi,
      görünmüyor. Kırmızı yazı / beyaz dolgu mümkün mü. MessageDisplay dışında
      bağlama yazmayan başka kanal var mı. Sole'nin bulgusuyla karşılaştırılacak.
- [ ] **4. Banner detayı — benim araştırmam.** Maliyet artmadan çok daha fazla
      bilgi verilebilir mi. Sole'nin bulgusuyla karşılaştırılacak.
- [ ] **9. Sole'nin bulduğu 12 hata.** Sırayla düzeltilecek: notify.js `sessionFile`
      tanımsız (ses hiç çalmıyor) · ses alt sürecinin hata dönüşü başarı sayılıyor ·
      schema.js `block()` CRLF'de owns/verify okumuyor · durum JSON'larında oku-yaz
      yarışı · rename hatası yutulunca bağlama ve tavan düşüyor · geç olay bitmiş
      ajanı canlı gösteriyor · dropSnapshot hatası yutuluyor · `stash create` hatası
      sessizce HEAD'e düşüyor · git diff hatası riski low yapıyor · release.js
      git status/add hatasını yutuyor · banner bütçesi `### ` başlığını saymıyor ·
      log.js slug'ı `İ` harfini bozuyor. Şüpheliler: ledger appendFileSync yarışı,
      _stale.json çift kayıt.
- [ ] **10. Banner yeniden tasarımı.** Sole ölçtü: `###` başlık render edilmiyor,
      ANSI renk çalışıyor (`ESC[31;47m`), markdown ve HTML çalışmıyor. Kullanıcı
      çok daha ayrıntılı banner istiyor — ne ajanı, nereye, ne için, ne kadar
      ilerlemiş. Eklenebilecekler (hepsi mevcut okumalardan): geçen süre, tavan
      kullanımı (18/60), tur, sözleşme kimliği, sahipsiz sayısı, yüksek risk.
      Uzun görev adları kısaltılacak.
- [ ] **6. Ekosistem raporu.** Büyük MCP'ler, skill'ler, plugin'ler ve benzer
      projeler bizim mentalitemize (maliyet, sözleşme, denetim) uyuyor mu.
      Obsidian, graph tabanlı araçlar vb. kurulmalı mı. Bizim eklenti onların
      yaptığının ne kadarını yapıyor. Maliyet karşılaştırmalı, detaylı.
- [ ] **7. Graphify durumu.** Base'de "kısmen eklendi" denmişti, Base terk edildi.
      Core'da var mı, yok mu, gömülü mü. Skill listesinde görünmüyor. Netleştir.

## Bitenler

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
