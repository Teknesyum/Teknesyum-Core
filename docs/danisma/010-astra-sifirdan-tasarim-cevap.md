# Astra'nın Sıfırdan Tasarımına Cevap

- tarih: 2026-09-06
- girdi: [docs/astra.md](../astra.md) (Astra, Core a6f11ff / Base 187bdb9 üzerinden)
- cevaplayan: Fable 5.1, karar ortağı sıfatıyla
- kodda doğrulanan olgular: `handoff.js` görevi ilk istemden alır (`firstPrompt`); `count.js` test sonucunu çıktıda `FAIL|Error:|failed` aramayarak "geçti" sayar, çıkış kodu ve test sayısı yok; dosya sayacı yalnız Edit/Write yollarını tutar, kabukla yazılan dosya sayılmaz; statusline `N✓` toplamı gösterir. Astra'nın bu dört eleştirisi doğru.
- maliyet: bu makineden 0 token (dosya okuma + bu metin)

## 1. Eski relay'in başka adla döndüğü yerler

Üç yerde dönüyor, üçü de kesilir.

- **§5 "gözlem kaydı": proje/worktree/oturum/iş kimliği, başlangıç Git durumu, süreç ve doğrulama kayıtları, çok oturumlu kayıt noktası, `resume`'un doğru olanı seçmesi.** Bu, sözleşme dosyasının adı değişmiş hali: makine bir "iş" kavramı tutuyor ve ona kayıt bağlıyor. Bench §4/§7'de kazancı sağlayan şey iş kimliği değil, `task` + `next_action` metniydi. Kes: kayıt, oturum başına tek durum dosyası olarak kalır (bugünkü `state-<sid>.json`), iş kimliği yok, kayıt noktası birleştirme yok. İki oturum aynı projede ise iki devir dosyası değil, tek devir + hangi oturumun yazdığı satırı yeter.
- **§7 "doğrulama kaydı + ağaç parmak izi + bayatlık":** mührün "biz mühür değiliz" diyen hali. Parmak izi tutmak için izlenmeyen dosyaları, bağımlılık girdilerini ve koşu sırasında ağacın değişip değişmediğini izlemek gerekir; bu `verify-runner` + `seal`in maliyetidir ve §8'de +%51 ile reddedildi. Kes: kayıt üç alan tutar, aşağıda (soru 4).
- **§4 "kısa çalışma usulü" (`workflows/work.md`) ve §8 "bir kez kurulan tercihle otomatik Fable":** ikisi de "iş bunu gerektirince" diye bir tetikleyiciye dayanıyor; tetikleyiciyi kim çözer? Model çözerse sıradan turda o kararı vermek için bir kural okur, makine çözerse eşik sayacı geri gelir ve `cue` +%38'e döner. Kes: usul dosyası yok, K0'ın beş satırı zaten bu. Fable otomatik açılmaz (soru 3).

`hooks/adapter.js` + `lib/state.js` + `lib/evidence.js` ayrımı da fazla; bugünkü dört kanca dosyası aynı sorumlulukları taşıyor. Yeniden ad koymak teslim değildir.

## 2. Sessiz kaydın karşılamadığı ihtiyaç

En küçük eksik: **devir dosyasındaki `task`, ilk istemdir; sonradan gelen kullanıcı yönlendirmesi kaybolur.** "Unutma" ihtiyacının kırıldığı yer burası, Astra haklı. En ucuz düzeltme: `handoff.js` transkriptteki **son üç kullanıcı mesajını** `## steer` başlığı altına aynen kopyalar. Maliyet: sıradan turda 0 bayt; SessionEnd'de bir transkript okuması; devam eden oturumda modele en çok üç kısa mesaj kadar ek okuma. Bunun dışında sessiz kayıt "dürttürme" ihtiyacını zaten karşılıyor; "doğru teslim et" ihtiyacını hiçbir kayıt karşılamaz, onu K0'ın "bitince çalıştır" satırı ve modelin kendisi karşılar.

## 3. Fable çağrısının sınırı

Astra'nın "bir kez kurulan tercihle otomatik" önerisi dar değil; "önemli tasarım düğümü" tanımını model yapar ve bu, çağrıyı kurala bağlamaktır. Onay istemeden daraltmanın somut yolu: **tetikleyici kullanıcı metnidir, kural değil.** Bugün `??` ve "danış" ile zaten böyle. Tek ek: `docs/plan.md` yazılırken model plana `## karar` başlığı koyarsa ve altında iki seçenek varsa, bir sonraki `??` o başlığı paket olarak alır. Fable hâlâ yalnız kullanıcı `??` yazınca açılır, ama paket hazır olduğu için soru tek satırdır. Çağrı sayısı sınırı: `scout.js`teki kapı deseni (`[[oncul:NNN]]` + PreToolUse reddi) `advice.js`e taşınır; aynı soru numarasına ikinci çağrı kesilir. Bu, Astra'nın "yalnız metinsel talimat yaptırım değildir" şartını karşılar.

## 4. Doğrulama kaydını mühürsüz güvenilir tutmak

Kayıt yalnız makinenin kesin bildiği üç şeyi tutar: **komut, çıkış kodu, HEAD + `git status --porcelain` özetinin karması.** Çıkış kodu Bash'ten alınır (`tool_response` içinde var); alınamazsa `bilinmiyor`. Çıktı metninde `FAIL` aramak kaldırılır. Test sayısı aranmaz; "0 test geçti" için tek kural: çıkış kodu 0 ama çıktı boşsa `bilinmiyor`. Statusline `N✓` toplamı yerine son kaydı `geçti / kaldı / bilinmiyor` gösterir; karma bugünkü HEAD+porcelain'den farklıysa `bayat`. Parmak izi, tazelik izleme, koşu sırasında ağaç kontrolü yok. Bu kayıt anlamsal doğruluk iddiası taşımaz; onu zaten yalnız kabul betiği verir.

## 5. İlk teslim daha küçük

| Tut | Çıkar | Sonra |
|---|---|---|
| count.js sayaç (statusline), handoff.js, notify, statusline, scan.js, scout.js kapısı, loop.js | `lib/evidence`, iş kimliği, kayıt noktası birleştirme, `work.md`, otomatik Fable, ağaç parmak izi, worktree/paralellik kuralı | `## steer` (soru 2), çıkış kodlu test kaydı (soru 4), `??` kapısı (soru 3), plan ipucu varsayılan kapalı **ölçüm sonra** |

Plan ipucu için ölçüm zaten kuruldu: `bench/cikarma.js`, K0'sız iki kol (ipucu açık/kapalı) + K0'lı susturulmuş kol + "Küçük iş" satırsız kol, sonnet/low, 10 koşu. Sonuç gelmeden ipucu kapatılmaz.

**En ucuz yanlışlama deneyi:** görev 06, "devam" koşulu, üç kol × iki tekrar = altı koşu: native, native + bugünkü `handoff.md` (elle verilir), Core + `## steer` eklenmiş `handoff.md`. Astra'nın istediği ayrım budur: belgenin faydası ile eklentinin ek faydası. Tahmini bedel taban maliyetten türetilir: 06 koşusu 0,35–0,40 $, altı koşu ≈ 2,5 $. Kazanç oranı yazmıyorum; ölçülmedi.
