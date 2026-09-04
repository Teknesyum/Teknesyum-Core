# 004 — Prompt Zenginleştirme

Danışılan: Fable. Tarih: 2026-09-04. Kayıt elle yazıldı; danışmayı otomatik yazan yol bu
turda tetiklenmedi (açık sözleşme yoktu).

## Sorulan (tam metin)

Teknesyum Core adlı bir Claude Code eklentisinin tasarım kararında görüşünü istiyoruz. Kod
yazmanı istemiyoruz; hangi seçeneği kurmamız gerektiğine dair kısa ve gerekçeli bir hüküm
istiyoruz. Cevabın tamamı Türkçe olsun.

## Sistem

Core, ajan işini "sözleşme" denen dosyalara bölüyor. Kancalar sınırı zorluyor, roller işi
yapıyor. Rollerden biri `advisor`: tek soru, tek görüş, dosya yok, plan yok. Asıl model
(T0) onu istediği anda açabiliyor; açılan her danışma `docs/danisma/` altına soru ve cevap
tam metniyle yazılıyor.

Projenin altın kuralı maliyet: **sıradan bir turda hiçbir kanca modelin bağlamına tek token
yazmıyor.** Statusline ve banner yalnız çizim; ölçüm diske gidiyor.

## İstenen

Kullanıcı bir "prompt zenginleştirme" işlevi istiyor: bazı promptlar doğrudan T0'a
gitmeden önce advisor tarafından zenginleştirilip öyle verilsin. Hangi promptun
zenginleştirileceğinin kararı T0'a bırakılabilir.

## Mekanizma (ölçülmüş)

Claude Code'un `UserPromptSubmit` kancası `hookSpecificOutput.updatedInput` alanıyla
kullanıcının promptunu **değiştirebiliyor**; `systemMessage` ile bağlama ek metin
yazabiliyor. Varsayılan zaman aşımı 30 saniye. Eklentinin `cue.js` kancası zaten bu olayda
koşuyor.

`UserPromptExpansion` da var; yalnız slash komutu genişlemesinde tetikleniyor.

## Bilinen maliyet

Bu depoda tutulan gerçek bir advisor turu: **51.094 token, 0 araç çağrısı, 56 saniye.**
Yani kancadan koşan bir zenginleştirme, tetiklendiği her promptta yaklaşık bir dakika
kullanıcıyı bekletir ve 30 saniyelik kanca zaman aşımını aşma riski taşır.

## Seçenekler

**A — Kancada otomatik.** `UserPromptSubmit` içinde ucuz bir sınıflandırıcı (regex ya da
küçük model) promptu ölçer; "zengin" sayılanlar advisor'a gidip `updatedInput` olarak
dönüyor. Kullanıcı hiçbir şey yapmıyor. Bedeli: her tetiklemede gecikme, zaman aşımı riski,
ve altın kuralın delinmesi — kanca artık bağlama yazıyor.

**B — İşaretle tetikle.** Zenginleştirme yalnız kullanıcı istediğinde: promptun başına bir
işaret (`??` gibi) ya da bir slash komutu. Kanca işareti görüp advisor'ı çağırıyor,
zenginleşmiş metni `updatedInput` olarak veriyor. Maliyet opt-in, altın kural sıradan turda
korunuyor. Bedeli: kullanıcı ne zaman değerli olduğunu kendi bilmek zorunda.

**C — Modelsiz zenginleştirme.** Kanca hiç model çağırmıyor; promptun yanına deterministik
olgular ekliyor: açık sözleşmeler, dal, son hata günlüğü satırları, bayat harita uyarısı.
Sıfır gecikme, sıfır model parası. Bedeli: bu bir "zenginleştirme" değil, bağlam
enjeksiyonu — ve her turda bağlama token yazdığı için altın kuralı yine deliyor.

**D — Hiçbiri.** T0 zaten advisor'ı istediği anda açabiliyor ve açtığı her danışma
kaydediliyor. Belirsiz bir prompt geldiğinde T0'ın yapacağı şey zaten bu. Yeni bir kanca
kurmuyoruz.

## Sorular

1. A, B, C, D ya da bir karması — hangisini kurmalıyız, neden?
2. "Hangi prompt zenginleştirilmeli" kararını modele bırakmak doğru mu? Model kendi
   promptunun eksik olduğunu, o promptu okumadan önce bilebilir mi?
3. Kurmadan önce toplamamız gereken bir sayı var mı?
4. Gözden kaçırdığımız, daha ucuz ya da daha doğru bir beşinci yol var mı?

Kısa yaz. Hükmü başa koy.

## Gelen cevap (tam metin)

## Hüküm

**D, üstüne B'nin en ince hali.** Yeni kanca kurma; T0 zaten advisor'ı açabiliyor ve kayıt ediliyor. Kullanıcı elle istemek isterse yalnız `??` işareti: kanca işareti görür, advisor'ı çağırır, `updatedInput` verir. A ve C reddedilir.

**1. Hangisi?** D + dar B. A altın kuralı deler ve 56 sn'lik tur 30 sn'lik kanca sınırına sığmaz; tek bir zaman aşımı kullanıcının promptunu sessizce yutar, bu geri alınamaz bir kötü deneyim. C zenginleştirme değil bağlam enjeksiyonu; her turda yazar, kural bozulur, ve T0 aynı olguları gerektiğinde `git`/dosya ile zaten okuyor. B'nin bedeli ("kullanıcı ne zaman değerli olduğunu bilmeli") aslında doğru yerde duran bir bedel: eksik promptu en iyi promptu yazan bilir.

**2. Kararı modele bırakmak?** Hayır. Model promptu okumadan promptun eksik olduğunu bilemez; okuduktan sonra ise zaten T0'dır ve advisor'ı açması D'dir. "Okumadan önce sınıflandır" dediğiniz an A'nın küçük modeli ya da regex'i çıkar, ikisi de 51k tokenlik bir turu tetiklemek için fazla kaba bir tetik. Karar ya kullanıcıda (`??`) ya da okumuş T0'da olur; ikinci bir katman gereksiz.

**3. Toplanacak sayı:** `docs/danisma/` altındaki mevcut kayıtlardan iki oran: (a) T0'ın kendiliğinden açtığı danışmaların kaçında cevap sonraki adımı değiştirdi, (b) kullanıcının sonradan "keşke önce sorsaydı" dediği tur sayısı. (a) düşükse D yeter, B bile fazladır. (b) sıfırsa ihtiyaç hayalidir. Ayrıca `updatedInput` ile 30 sn içinde dönen tek bir gerçek ölçüm olmadan B'yi de kurmayın; 56 sn ölçülmüş, 30 sn sınır, aritmetik şimdilik B'yi de düşürüyor.

**4. Beşinci yol:** Zenginleştirmeyi promptun *önüne* değil *arkasına* koyun. `??` işaretli prompt kancada bekletilmez; olduğu gibi T0'a gider, kanca yalnız `systemMessage` ile "bu turda advisor'ı aç, cevabı bekle" der. T0 advisor'ı normal Agent çağrısıyla açar, 30 sn sınırı kalkar, altın kural yalnız işaretli turda ve tek satırla bükülür, kayıt mekanizması değişmez. Kanca sıfır model çağırır; iş roller arasında kalır. Mevcut `cue.js`'e bir satır, yeni kanca yok.

## Ajan

`ad67ceea26a4d845a`, 53.990 token, 2 araç çağrısı, 31 sn.

## İkinci tur — sorulan (tam metin)

Kullanıcı senin beşinci yolunu benimsedi ama bir yerini değiştirdi; ona da hüküm vermeni istiyor. Cevabın tamamı Türkçe, yirmi satırı geçme, hükmü başa koy.

Kullanıcının istediği tam şekil:

`??` ile başlayan bir prompt geldiğinde, prompt otomatik olarak advisor'a gidiyor. Advisor'ın görevi görüş vermek değil, **promptu zenginleştirmek**: teknik detayları netleştirip, eksik kalan yerleri doldurup zenginleşmiş promptu T0'a veriyor. T0 sonra o zengin promptla süreci yönetiyor.

Yani senin önerinden farkı: advisor bir görüş üretmiyor, promptun kendisini yeniden yazıyor.

Bunun üç yerini sormak istiyorum:

1. `advisor` rolü bu işi yapmalı mı, yoksa bu ayrı bir rol mü? `core/roles/advisor.md` şöyle diyor: "One question, one opinion. No plan, no code, no files." ve "You are told the goal, the acceptance and the raw evidence — never the asker's draft answer or the earlier attempts, because an opinion that has already seen the answer is not one." Prompt zenginleştirme bu tanıma sığıyor mu?

2. Promptu **kullanıcı adına** yeniden yazan bir katman tehlikeli mi? Advisor kullanıcının ne istediğini yanlış anlarsa, T0 artık kullanıcının cümlesini değil advisor'ın cümlesini görüyor. Asıl metin de bağlamda dursun mu, yoksa yerini alsın mı? Kullanıcı zenginleşmiş promptu onaylamadan iş başlamalı mı?

3. Advisor kod tabanını okumadan teknik detayı nasıl netleştirecek? Rol dosyası "no files" diyor. Okuma hakkı verirsek maliyet ne olur, vermezsek zenginleştirme boş laf mı olur?

Ayrıca: bu şekilde kurulacaksa hangi rolün, hangi modelin ve hangi çıktı biçiminin doğru olduğunu söyle. Kurulmamalıysa onu söyle.

## İkinci tur — gelen cevap (tam metin)

## Hüküm

**Bu şekilde kurulmasın.** Kullanıcının cümlesini T0 görmeden başka bir modelin yeniden yazması, kabul edilebilir kazancı olmayan bir bilgi kaybı. `??` kalsın ama anlamı "önce advisor'a sor" olsun, "promptu değiştir" değil. Kurulacaksa: ayrı rol, T0'dan ucuz model, çıktı promptun *eki*, asıl metin dokunulmaz.

**1. Advisor mı?** Hayır. Advisor'ın tanımı görüş, ve tanımın kalbi "cevabı görmemiş olmak". Zenginleştirme tam tersi: cevabı yazmaya başlamak. Aynı role iki iş verirseniz ikisi de bulanır; gerekiyorsa `clarifier` gibi ayrı bir rol, tek yetkisi "soru üret, olgu ekle, cümleyi silme".

**2. Tehlike:** Evet, ve büyük. Yanlış anlama T0'a değil kullanıcıya faturalanır, kullanıcı da kaynağı göremez. Asıl metin mutlaka bağlamda dursun; `updatedInput` ile yerine geçmesin, altına ek olarak gelsin. Onay: zenginleştirici cümleyi *değiştirmiyor*, yalnız ekliyorsa onay gereksiz; değiştiriyorsa onaysız iş başlamamalı, o zaman da kancada beklemek yerine T0'a "ilk cevabın bu ek, onay iste" demek daha ucuz.

**3. Dosya okumadan teknik detay:** Boş laf olur; "netleştirme" genel tavsiyeye döner. Okuma hakkı verilirse maliyet ölçülmüş turun (51k, 56 sn) katı olur ve T0 aynı dosyaları ikinci kez okur. Bunun yerine zenginleştiriciye yalnız ucuz, hazır olgular verin: açık sözleşmeler, `map.js` çıktısı, son günlük satırları. Kod okuyacak olan T0'dır.

**Kurulursa:** rol `clarifier` (yeni, ≤20 satır); model tier'ın en ucuzu, T0'dan kesinlikle ucuz; çıktı biçimi: `## Soru` (en çok üç açık soru) + `## Olgu` (hazır bağlamdan alınmış maddeler), asıl prompt üstte olduğu gibi. Kanca model çağırmasın, `systemMessage` ile T0'a "önce clarifier'ı aç" desin; 30 sn sınırı böylece dokunulmaz.

**Kaçırılan:** Kullanıcının asıl derdi muhtemelen "T0 sormadan dalıyor". Bu bir rol sorunu değil, T0'ın kuralı: belirsiz istekte tek soru sor, sonra başla. O kural bir satır; yeni rol sıfır token.

## Ajan (ikinci tur)

`ad67ceea26a4d845a`, 49.521 token, 0 araç çağrısı, 27 sn.

## Üçüncü tur — sorulan (tam metin)

Kullanıcı senin itirazlarını kabul etti ve bir revizyon önerdi; ona da hüküm ver. Türkçe, yirmi satırı geçme, hükmü başa koy.

Revizyon: zenginleştirmeyi başka bir model değil, konuya zaten hâkim olan **T0** yapıyor. `??` ile başlayan bir prompt geldiğinde T0 bunu "bu konuda Fable'a danış" emri olarak okuyor: promptu kendisi zenginleştiriyor — teknik detayları netleştiriyor, ölçülmüş sayıları ve seçenekleri koyuyor — sonra bu zenginleşmiş soruyu advisor'a (Fable) gönderiyor, cevabı kayda geçirip kullanıcıya aktarıyor.

Yani `??` yeni bir rol açmıyor; var olan advisor yolunu bir kısayola bağlıyor. Kullanıcının cümlesi hiç değişmiyor, T0 onu okuyup soruyu yazıyor.

Bu tam olarak bu oturumda elle olan şey: kullanıcı "fable'a danış" dedi, T0 soruyu yazdı, sen cevapladın, kayıt `docs/danisma/004` olarak düştü.

Sorular:

1. Bu revizyon doğru mu? Senin "kaçırılan" maddendeki "T0'ın kuralı bir satır" tespitiyle aynı şey mi, yoksa fazladan bir şey mi getiriyor?

2. Kısayolun bedeli: ölçülmüş her advisor turu yaklaşık 50 bin token ve yarım dakika. `??` yazmak bunu tek karakterle tetiklemeyi çok kolaylaştırıyor. Bu tehlikeli mi — kullanıcı farkında olmadan pahalı bir turu sık sık açar mı? Kısayolun bir eşiği ya da bir uyarısı olmalı mı?

3. Bu bir kanca işi mi, yoksa yalnız T0'ın talimatına yazılan bir satır mı? Kanca kurmanın buradaki tek kazancı ne olurdu?

4. `??` işareti doğru işaret mi? Kullanıcının gerçekten sorduğu bir soruyla (`?` ile biten cümle) karışır mı?

## Üçüncü tur — gelen cevap (tam metin)

## Hüküm

**Doğru; kurun, ama kanca değil talimat olarak.** Bu, bu oturumda zaten çalışan yolun adı konmuş hali: kullanıcı cümlesi bozulmuyor, soruyu konuya hâkim T0 yazıyor, advisor cevabı görmeden görüş veriyor, kayıt düşüyor. Rol tanımı, altın kural ve 30 sn sınırı hiçbirine dokunulmuyor.

**1.** "Kaçırılan" maddemle aynı şey değil; onun tamamlayıcısı. O madde T0'ın *kendiliğinden* sormasıydı; `??` kullanıcının "bu sefer kesin sor" demesi. Fazladan getirdiği tek şey bir sözleşme: `??` görülünce advisor atlanamaz. Bu iyi bir fazlalık, çünkü T0'ın "gerek yoktu" deyip geçmesini kapatıyor.

**2.** Tehlike düşük, ama sıfır değil. Tetik ucuz, tur pahalı. Eşik koymayın; uyarı da koymayın, çünkü `??` yazan zaten bunu istiyor. Bunun yerine bedeli *görünür* yapın: T0 cevabı aktarırken tek satırla "danışma 004, 51k token, 56 sn" yazsın. Farkındalık uyarıyla değil faturayla gelir. Bir ay sonra `docs/danisma/` sayısı ve kaç tanesinin sonraki adımı değiştirdiği, eşik gerekip gerekmediğini söyler.

**3.** Yalnız talimat satırı. Kanca kurmanın buradaki tek kazancı "T0 işareti kaçıramaz" garantisi olurdu; bunun bedeli sıradan turda `cue.js`'e regex, `??`'lı turda `systemMessage`, yani altın kurala bir istisna daha. T0 başında `??` olan bir promptu kaçırıyorsa sorun kancada çözülmez. Kanca yok.

**4.** `??` yeterince ayırt edici: cümle *başında* çift soru işareti doğal Türkçe'de ya da İngilizce'de yok; `?` ile biten soruyla karışmaz. Tek risk yapıştırılmış metnin `??` ile başlaması, ihmal edilebilir. Alternatif olarak `fable:` de olur ama `??` daha kısa ve dilden bağımsız. Kalsın.

**Kaçırılan:** T0'ın yazdığı soruyu kullanıcı görmeli. Kayıt bunu zaten yapıyor; yalnız cevapla birlikte soru dosyasının yolu da aktarılsın ki kullanıcı "yanlış soru soruldu" diyebilsin. Zenginleştirmenin tek gerçek riski bu, ve tek satırlık bir yol linkiyle kapanıyor.

## Ajan (üçüncü tur)

`ad67ceea26a4d845a`, 51.414 token, 0 araç çağrısı, 23 sn.

## Dördüncü tur — sorulan (tam metin)

Kullanıcı `??`'nin anlamını düzeltti; hızlı hüküm ver. Türkçe, on beş satırı geçme, hüküm başa.

Yanlış anladığımız şey: `??` "bu konuda advisor'a danış" değil. Kullanıcının kastı şu:

`??` ile başlayan prompt geldiğinde, T0 işe başlamadan önce **advisor türünde bir ajan** (yani fable, en başta koşan tür) kullanıcının promptunu okuyup **uygun şekilde zenginleştiriyor**; T0'ın gidişatı bu zenginleştirmeye göre yönleniyor. Yani konu hakkında görüş almak değil, isteğin kendisini netleştirmek. Bir nevi prompt zenginleştirme.

Senin ikinci turdaki `clarifier` tarifin buna yakın: çıktı promptun *eki*, asıl cümle dokunulmaz, `## Soru` + `## Olgu`. Farkı: kullanıcı bunu ucuz modelle değil, advisor türüyle (fable) yapmak istiyor.

Sorular:

1. Bu, ikinci turdaki `clarifier` tarifinle aynı şey mi? Aynıysa fable'ı bu işe koşmak doğru mu, yoksa ucuz model şartın duruyor mu?

2. Zenginleştirme T0'ın "gidişatını yönlendiriyor" — bu, T0'ın kullanıcının asıl cümlesinden kopması riski mi? Nasıl bağlarız?

3. Çıktı biçimi ne olsun? İkinci turdaki `## Soru` + `## Olgu` yeterli mi, yoksa "gidişatı yönlendirmek" için başka bir başlık gerekir mi?

4. Bu ajan kod tabanını okumalı mı? Üçüncü turda "kod okuyacak olan T0'dır" demiştin; ama zenginleştirme dosya görmeden yapılıyorsa yine boş laf olur mu?

Kullanıcı bunu hemen kurmamı istiyor, o yüzden kısa ve uygulanabilir yaz.

## Dördüncü tur — gelen cevap (tam metin)

## Hüküm

**Kurun, ama fable yalnız `??`'li turda ve sınırlı girdiyle.** Evet, bu ikinci turdaki `clarifier`; farkı modeli. Ucuz model şartım "her turda koşacak" varsayımındaydı; kullanıcı tetiklediği için o şart düşer. Fable'ın gördüğü kadar iyi görmek istiyorsanız fable koşsun; bedel opt-in.

**1.** Aynı şey. Fable doğru, tek koşul: advisor rolünü kullanmayın, `clarifier` diye ≤20 satırlık ayrı rol açın, `tier: advisor`, model fable. Advisor "cevabı görmemiş görüş"tür; clarifier soruyu netleştirir; ikisi aynı dosyada olmasın.

**2.** Risk gerçek, bağ üç kural: (a) asıl cümle üstte, olduğu gibi, T0'ın önce okuduğu şey; (b) clarifier cümleyi yeniden yazmaz, yalnız ekler; (c) ek ile cümle çelişirse cümle kazanır, bu satır clarifier rol dosyasında ve T0 talimatında ikisinde de yazsın. T0 çelişki görürse tek soruyla kullanıcıya döner.

**3.** `## Soru` + `## Olgu` + bir üçüncü: `## Yol` — en çok üç madde, "önce X, sonra Y, Z'yi yapma" biçiminde. Gidişatı yönlendiren budur; plan değil, sıra ve yasak. Toplam ≤15 satır.

**4.** Okumasın; ama boş kalmasın. Girdi olarak T0 hazır olguları verir: `git status`, açık sözleşmeler, `map.js` çıktısı, son günlük satırları, promptun adını andığı dosyaların ilk 30 satırı. Sınırlı okuma T0'ın seçtiği dosyalarla olur, clarifier'ın kendi seçtiğiyle değil. Böylece "no files" duruyor, çıktı da somut kalıyor.

**Kaçırılan:** Kayıt. Her `??` turu `docs/danisma/` değil ayrı bir klasöre, `docs/netlestirme/NNN`; girdi ve ek verbatim, üstüne token ve süre. Bir ay sonra sayı eşik gerekip gerekmediğini söyler.

## Ajan (dördüncü tur)

`ad67ceea26a4d845a`, 53.159 token, 0 araç çağrısı, 21 sn.
