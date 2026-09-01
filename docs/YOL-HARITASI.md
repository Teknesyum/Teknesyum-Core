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
- [ ] **8. Fable'ın önerdiği üç kapı.** (kullanıcı onayı bekliyor)
      watch.js Stop: submitted sözleşme varken tur kapanmasın;
      aynı kapıda "?" ile biten tur + atanmamış iş varsa tek atış uyarı;
      guard.js Bash: submitted/active sözleşme varken git merge/push bloklansın.
      Artı üç metin satırı: SKILL.md Reporting, SKILL.md advisor, roles/auditor.md.
- [ ] **6. Ekosistem raporu.** Büyük MCP'ler, skill'ler, plugin'ler ve benzer
      projeler bizim mentalitemize (maliyet, sözleşme, denetim) uyuyor mu.
      Obsidian, graph tabanlı araçlar vb. kurulmalı mı. Bizim eklenti onların
      yaptığının ne kadarını yapıyor. Maliyet karşılaştırmalı, detaylı.
- [ ] **7. Graphify durumu.** Base'de "kısmen eklendi" denmişti, Base terk edildi.
      Core'da var mı, yok mu, gömülü mü. Skill listesinde görünmüyor. Netleştir.

## Bitenler

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
