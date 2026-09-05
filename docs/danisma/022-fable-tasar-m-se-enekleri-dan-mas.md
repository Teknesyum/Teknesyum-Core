# Fable tasarım seçenekleri danışması

- soran: T0
- danisilan: fable
- tarih: 2026-09-05

## Sorulan

C:/Users/Teknesyum/.claude/plugins/cache/teknesyum/teknesyum-core/0.15.0/roles/advisor.md dosyasını oku ve onu izle. Başlıklar Türkçe: `## Karar`, `## Gerekçe`, `## Kaçırdığın`. Depo kökü: C:\Users\Teknesyum\Desktop\Projeler\Teknesyum Core. Soran: T0. Koltuğun: fable/medium. Kod yazma, dosya yazma; en fazla 40 satır.

Kullanıcının bugünkü mesajı, aynen:
"konuştuğum şey net a pcsinde core yüklü b pcsinde değil ikiside aynı görevi veriyor misal chess960 yaz dedi a pcsi ne bedel ödedi karşılığında ne aldı objektif olarak verimli bir iş mi yaptı yoksa hava cıvaya mı sattı o maliyeti bunu hisle değil ölçümle ortaya koy / agency ajanının veritabanını kullanmak istiyorum normalde pasif olucak ama advisör rolümüz gerektiğinde yada talep edildiğinde ordaki rollerden birinin altyapısını okuyup o şekilde olaya yaklaşabilecek bu tarz bir sistemin dizaynını kapsamlı incele maliyet artışı için en ufak toleransımızın olmadığını zaten biliyorsun / diğer bir nokta bütün ajanları kaldırıp sadece 1 işçi aşanı oluştursak işçi de aynı mantıkla bizim komutumuzla ilgili dosyayı okuyup o role bürünse bunun maliyeti toparlama ihtimali nedir / bir diğer fikrim yine tek işçi tipi olsun rollere bürünüp rollerden arınsın iş bitene kadar hiç kapanmasın bukalemun gibi bi advisor oluyor sonra advisorlüğü unutup işçi olup iş yapıyor gibi bi sistem"

Olgular (T0 topladı):
- Core'da zaten TEK ajan tipi var: `agents/worker.md` (10 satır): "Your prompt names a role file. Read it before anything else". Roller `core/roles/*.md`: advisor 2.893 B, auditor 2.480, builder 894, planner 964, scout 1.656, scribe 1.063 (toplam ~2.500 token). Bench koşuları için ayrıca `bench-low/medium/high` agents var (ölçüm için, üründe yok).
- Bugünkü ölçüm (aynı görev, sonnet/low, taze klon): ajan native n=3 medyan $0,1079 / 11 tur; Core n=6 medyan $0,1255 (+%16), ort. +%21. Otopsi: hiçbir Core ajanı relay'e bakmadı; tek belgelenebilir Core bedeli ajanın kabul betiğini kendisi de koşturması (~1 tur, %8, 6'da 5); kalan fark Edit öncesi keşif oynaklığı (Core 9/10/10 | 15/16/17 tur, native 9-12). T0: Core 1 tur/koşu, native 2. T0 turu $0,5-0,95 (bağlam 350-440k), ajan koşusu ~$0,12. Toplamda Core native'in altında görünüyor ama T0 taban ölçümü eski oturumdan.
- Bütün ölçümler TEK dev oturumun içinde yapıldı (T0 bağlamı şişmiş). Kullanıcının istediği A/B "iki ayrı PC" ölçümü hiç yapılmadı. Yapılabilir: `claude -p --bare "<görev>"` (kanca/eklenti/LSP yok) = B kolu; `claude -p "<görev>"` eklenti açık = A kolu; ikisi de taze oturum, her oturumun jsonl'i `bench/maliyet.js` ile dolara çevrilir (T0 + alt ajanlar dahil). Görev adayları: bench/gorevler/01-05 (dondurulmuş, kabul betikli) ya da kullanıcının "chess960 yaz" (kabul betiği yok, çıktı kalitesi ölçülemez).
- agency-agents (msitarzewski): 273 rol metni, medyan ~3.400 token/rol (builder'ımızın 15 katı), orkestrasyon/kapı/maliyet yok, `model:` yok. Bir rolü çağırmak system prompt'a +3.170 token → 11 turluk koşuda ≈ +%20. 273'ünü `~/.claude/agents`'a kurmak her T0 turuna ~18k token sabit yük. Rapor: docs/raporlar/2026-09-05-agency-agents-kiyas.md.
- Claude Code kısıtları: alt ajan alt ajan açamaz; bir alt ajan SendMessage ile yeniden uyandırılabilir (bağlamı korur, bağlam büyüdükçe tur başına cache-read artar); guard bağlanması ajan kimliği başına tek sözleşme.

Sorular, her biri için tek karar:
1. A/B "iki PC" ölçüm protokolü: yukarıdaki `--bare` tasarımı geçerli mi? Eşik ne olmalı, kaç tekrar, hangi görev (chess960 mi dondurulmuş görevler mi), ne ölçülsün (toplam $, tur, pass, süre)? "A ne satın aldı" tarafı nasıl sayılsın (mühür, sınır, verify, günlük — hangisi ölçülebilir)? Bedel tahminini de ver.
2. agency-agents pasif veritabanı + advisor'ın talep üzerine bir rolü okuması: sıfır ek tüketimle tasarlanabilir mi (kullanıcı toleransı sıfır)? Nasıl, nerede durur, ne zaman okunur? Yoksa hayır mı?
3. "Tüm ajanları kaldır, tek işçi rol dosyasını okusun": bu zaten mevcut tasarım mı? Öyleyse kullanıcıya bunu nasıl söyleriz ve kalan kazanç nerede (bench agents? rol dosyası boyutu?).
4. Bukalemun: tek uzun ömürlü ajan, iş bitene dek kapanmaz, advisor→builder rol değiştirir. Maliyet: bağlam birikimi vs. yeniden okuma tasarrufu; guard tek-sözleşme kısıtı; "rolden arınma" bir modelde gerçekten olur mu? Sayıyla: ne zaman ucuz, ne zaman pahalı.
5. Kaçırdığımız?

## Donen

## Karar
1. `--bare` protokolü geçerli, ama kol tanımı yanlış: B = `claude -p --bare`, A = eklenti açık; her ikisi de taze oturum. Görev: dondurulmuş 01-05 (kabul betikli), chess960 değil. n=5/görev/kol. Eşik: A'nın toplam 
ı B'nin +%10'unu aşarsa "hava cıva". Ölç: toplam $ (T0+alt), tur, pass, süre. "A ne aldı": yalnız sayılabilenler — pass oranı, ilk denemede geçen sözleşme sayısı, günlük/mühür satırı adedi. Bedel: 5 görev × 2 kol × 5 = 50 koşu × ~$0,15 ≈ $8.
2. Evet, sıfır maliyetle: depoyu `~/.claude/teknesyum-ozel/agency/` altına klonla, hiçbir şey `~/.claude/agents`'a girmesin. advisor rolüne tek satır: "prompt `@agency:<rol>` içeriyorsa o dosyayı oku". Okuma yalnız o çağrıda, +3.170 token o tura sınırlı. Tetik yoksa bedel sıfır.
3. Evet, bu zaten mevcut tasarım (worker.md + roles/*.md). Kullanıcıya "istediğin şey 0.14'ten beri çalışıyor" de, `agents/` dizinini göster. Kalan kazanç: bench-* üç agent üründen ayrı klasöre (her T0 turuna sabit yük), advisor 2.893 B'yi 1.500'e kırp.
4. Bukalemun pahalı. Rol okuma tasarrufu ~1.000 token/rol; bağlam birikimi tur başına cache-read (100k bağlamda $0,03/tur). Ucuz: ≤3 rol geçişi ve toplam ≤15 tur. Pahalı: 15+ tur sonrası her tur yeniden okumadan daha maliyetli. "Rolden arınma" olmaz — advisor cevabı bağlamda kalır, builder onu görür. Guard tek-sözleşme: ikinci sözleşmeye geçemez. Hayır.

## Gerekçe
Bugünkü +%16 tek oturumdan, şişmiş T0 bağlamından; taze A/B olmadan sayı yok. Rol dosyası bir kez okunur, bağlam her tur okunur; bu asimetri bukalemunu öldürür. agency rolleri pasif dosyayken bedel sıfır, agents'a girince sabit.

## Kaçırdığın
- A/B'de T0 modeli sabitlenmeli (aynı model, aynı effort); yoksa kol farkı model farkı olur.
- `--bare` CLAUDE.md'yi de kesiyor mu? Kesiyorsa B kolu kullanıcı kurallarını da kaybediyor; "core yok" ile "kural yok" ayrıştırılmalı, üçüncü kol gerekebilir.
- chess960'ı kullanıcı istedi: kabul betiği olmadan bile tur/$ ölçülebilir; 01-05 yanına n=3 ile ekle, kalite ölçülmez diye reddetme.
- Cache: A kolunda eklenti system prompt'u cache'e girer, ilk koşu pahalı, sonrakiler ucuz; n=5'te ilk koşuyu ayrı raporla.
