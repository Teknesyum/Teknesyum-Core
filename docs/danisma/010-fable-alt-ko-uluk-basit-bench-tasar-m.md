# Fable altı koşuluk basit bench tasarımı

- soran: T0
- danisilan: fable
- tarih: 2026-09-05

## Sorulan

C:/Users/Teknesyum/.claude/plugins/cache/teknesyum/teknesyum-core/0.15.0/roles/advisor.md dosyasını oku ve onu izle.

Depo kökü: C:\Users\Teknesyum\Desktop\Projeler\Teknesyum Core
Soran: T0, opus. Senin koltuğun: fable/medium.

## Kullanıcının isteği, kendi cümleleriyle

"3 kez tekrar etmeyeceğiz, 1 kez tekrar yeter. İnanılmaz kaliteli bir bench olmasına gerek yok, sistemimizin düzgün düşük maliyetle çalıştığını görelim yeterli."

"Benim istediğimi kanıtlayan çok daha basit bir bench tasarla, 6 koşu ile bu iş çözülebilsin."

## Soru

**Altı koşuyla** kullanıcının istediğini kanıtlayan bir bench tasarla. İspatlanacak sav: Teknesyum Core düzgün çalışıyor ve maliyeti makul. Yayınlanabilir bir kıyas değil, çalışır olduğunun kanıtı isteniyor.

Şunları söyle: altı koşu hangi hücrelere dağılır, her koşu ne üretir, ve altı sayıdan hangi çıkarım **dürüstçe** yapılabilir — hangisi yapılamaz. Bir de: altı koşu bu savı gerçekten kanıtlıyor mu, yoksa daha az koşuyla daha dürüst bir şey mi kurulabilir.

## Elindeki olgular — ölçüldü, varsayım değil

**Kimlik engeli.** `claude -p` ile açılan hiçbir çocuk süreç kimlik doğrulayamıyor. Üç deneme yapıldı, üçü de `Not logged in · Please run /login` ve kod 1 verdi: (a) boş `CLAUDE_CONFIG_DIR`, (b) `~/.claude.json` tamamı kopyalanmış geçici dizin, (c) `CLAUDE_CONFIG_DIR` hiç ayarlanmadan, gerçek `~/.claude` ve tam ortam miras alınarak. Kimlik oturumu barındıran sürecin içinde. Yani otonom koşu, kullanıcı yeni bir kimlik sağlamadan **mümkün değil**.

**Alt ajan yolu.** T0 alt ajan açabiliyor, onlar T0'ın kimliğiyle koşuyor, ek kimlik istemiyorlar. Token kullanımları `~/.claude/projects/<proje>/<oturum>/subagents/agent-*.jsonl` içinde model bazında kayıtlı ve ölçülebiliyor. Ama iki kısıt var: (1) alt ajana **effort verilemiyor**, yalnız model seçilebiliyor — yani `sonnet/low`, `sonnet/medium`, `sonnet/high` koltukları birbirinden ayrılamıyor, eco/normal/premium ayrımı çöküyor. (2) Core'un kancaları oturum düzeyinde; bir alt ajan "native" diye açılsa bile `guard.js`, `watch.js`, `cue.js` yürürlükte. `guard.js` sözleşmeye bağlı olmayan ajanı kısıtlamıyor ama tamamen yok da sayılamaz.

**Hazır olan takım.** Beş görev dondurulmuş, her birinin gerçek 40 haneli commit pini ve kabul testi var; kabul testleri kol etiketi görmüyor, 0/1 dönüyor, referans doğrulaması yapılmış (gerçek çözümle PASS, çözümsüz FAIL). Görevler: `slugify` (yeşil alan, JS), `click` (hata düzeltme, Python), `wrap-ansi` (refactor, JS), `gray-matter` (hata düzeltme, JS), `requests` (refactor, Python). Maliyet toplayıcı dört kalemi (girdi, çıktı, cache yazma, cache okuma) model bazında topluyor, alt ajanları da sayıyor, mükerrer mesaj kimliklerini eliyor. Tarife fiyat sayfasından doğrulanmış.

**Ölçek bilgisi.** Bugünkü bu oturumun tamamı — kurulum, yedi sözleşme, iki danışma turu, kırk küsur tur — 39,62 dolar tuttu. Tek görevlik bir koşunun maliyeti hiç ölçülmedi, elimizde tek veri noktası yok.

**Önceki tasarım.** Tam bench 5 görev × 6 kol × 3 tekrar = 90 koşu, pilot 2 × 6 × 3 = 36. Altı kol: eco/normal/premium ve her birinin aynı koltukta koşan native eşi. Durma kuralı medyan $ üstünde ve en az iki görevde tutmayı şart koşuyor.

Türkçe yaz. Kod yazma, dosya oluşturma; tek çıktın rol dosyandaki üç başlıklı ve en fazla 20 satırlık mesaj.

## Donen

## Call

Altı koşu: beş görevin her biri **bir kez Core'la** (aynı koltuk, aynı model, tekrar yok), altıncı koşu beş sonuç geldikten sonra seçilir — maliyeti ortanca çıkan görev, sözleşmesiz alt ajanla bir kez. Her koşu iki sayı üretir: kabul testi 0/1 ve dört kalemli dolar (T0'ın kendi turları dahil).

## Why

Sav "çalışıyor" ise kanıt beş görev tipinde beş geçiş; sav "makul maliyet" ise kullanıcının ihtiyacı bir kıyas değil, ilk kez göreceği mutlak rakam — bugün elde sıfır veri noktası var. Kol çeşitlemesi (eco/normal/premium, native eşleri) effort verilemediği ve kancalar oturumda kaldığı için zaten ölçülemiyor; o eksene koşu harcamak yalan sayı üretir. Altıncı koşu yalnız çıpa: "Core kaç kat" sorusuna tek nokta, yön verir, oran vermez.

Dürüstçe söylenebilecek: Core beş tipte X/5 geçti, görev başına $A–$B tuttu, ortanca görevde çıplak alt ajan $C. Söylenemeyecek: varyans (n=1), kademeler arası fark, "native" ile gerçek kıyas (kancalar açık), beş görev dışına genelleme. Daha az koşuyla daha dürüstü: beş koşu, altıncıyı atlamak — çıpa tek nokta olduğu için kaybı küçük.

## Missed

Aynı oturumda ardışık koşular prompt cache'ten beslenir; ikinci görevden itibaren maliyet yapay düşer. Ya her görev ayrı oturumda ya da cache okuma kalemi ayrı raporlanıp yalın girdi+çıktı ile de verilsin.

Her koşu öncesi ağaç pine sıfırlanmalı (`git checkout <pin> && git clean -fdx`); önceki koşunun kalıntısı kabul testini geçirebilir. Bir görev FAIL verirse tekrar edilmez — bulgu olarak kalır; "1 kez tekrar yeter" cümlesi başarısızlığı yeniden koşma hakkı değildir.

Orkestratör maliyeti Core'un maliyetidir: yalnız alt ajan jsonl'leri toplanırsa Core ucuz görünür. T0'ın kendi oturum dosyasındaki koşu aralığı da sayılmalı.
