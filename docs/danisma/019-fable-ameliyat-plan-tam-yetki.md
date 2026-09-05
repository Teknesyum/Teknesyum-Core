# Fable ameliyat planı tam yetki

- soran: T0
- danisilan: fable
- tarih: 2026-09-05

## Sorulan

C:/Users/Teknesyum/.claude/plugins/cache/teknesyum/teknesyum-core/0.15.0/roles/advisor.md dosyasını oku ve onu izle. Başlıklar Türkçe: `## Karar`, `## Gerekçe`, `## Kaçırdığın`.

Depo kökü: C:\Users\Teknesyum\Desktop\Projeler\Teknesyum Core
Soran: T0, opus. Senin koltuğun: fable/medium.

Dosya okuyabilirsin, okumalısın da. Bu turda sana **tam yetki** verildi: neyi keseceğine, neyi bırakacağına, hangi ölçümü koşacağıma sen karar veriyorsun.

## Kullanıcının cümlesi

"Şimdi ne gerekiyorsa yap. Core ciddi bir operasyon geçirsin, ta ki tüm ölçümlerde hava cıva çıkmayana kadar. Maksimum izin verdiğim tüketim %5, çok istisnai %10'lara çıkabilir, ancak %5'lerle yakalamamız lazım native'i. Tüm yetki Fable'da, istediği yeri değiştirsin, istediği ölçümü yapsın. Uzun bir aradan sonra bana rapor verirsin."

Kullanıcıya şunu söyledim ve arkasındayım: ölçüm istediğini söyleyene kadar tekrarlanırsa o ölçüm değil ayar olur. O yüzden eşikleri koşudan **önce** yazacağım ve sonuç ne çıkarsa onu getireceğim. Sen de planı buna göre kur.

## Sabit kısıt

**Native'e göre toplam tüketim farkı ≤ %5**, istisnai olarak %10. Bu tavan ajan tarafı + koordinatör tarafı toplamı için geçerli. Bugün ölçülen: ajan tarafında fark ölçülemedi, koordinatör tarafında koşu başına +1 tur (toplu yapılmazsa +2). Bir koordinatör turunun bedeli oturum bağlamıyla büyüyor.

## Geçen turda sen ne dedin

Bırakma, küçült. Çekirdek üç parça: `owns` guard'ı, `verify` kapısı, ledger/handoff kaydı. Kesilecekler: manşet, OWED, fan-in sinyali, `raise:` mührü, round-4 danışman zorunluluğu, güncelleme kontrolü, banner ayrıntısı. Kanıtlanacak tek şey: 3 paralel ajan, aynı ağaç, örtüşen dosya; native çakışma ≥2/5 → guard kalır, ≤1/5 → guard da gider.

## Sana bir düzeltme

`verify` kapısının arkasında gözlemsel kanıt olarak "124 sözleşmede 54'ü kapıda döndü" dedin. Rakamı doğruladım, gerçek — ama kaynağı `docs/raporlar/rele-israfi-124-sozlesmelik-olcum.md` ve o raporun kendi hükmü tersi yönde: başlığı "rölenin **israfı**", ve diyor ki *"harcamanın en büyük tek kalemi düzeltme turu; bu turların çoğu koddaki hatadan değil, raporu özetleyen cümlenin veriden kaymasından açıldı"*. En pahalı kusur 22 sözleşmede tekrarlayan manşet kayması: tablo doğru, tabloyu özetleyen cümle yanlış ("33 ölçü" denmiş, sayım 32).

Bunun iki sonucu var: o 72 ek turun çoğu gerçek kod hatası yakalamadı, **ve** yakaladığı şeyi `verify` kapısı yakalayamaz — kapı komut çalıştırır, bir cümlenin kendi tablosuyla çeliştiğini göremez. Onu yakalayan denetçi turu. Yani o kanıt `verify`ye değil denetçiye ait. Planını bu düzeltmeyle kur.

## Senden istediğim

Sıralı ve uygulanabilir bir ameliyat planı. Her adımda: ne kesilecek/değişecek, hangi savla korunacak, ve hangi ölçüm hangi eşikle koşulacak. Eşikler koşudan önce yazılacak.

Özellikle şunları karara bağla:

1. Kesim listesi kesinleşsin — hangi dosya/özellik gider, hangisi kalır, ve `verify` kapısının gerekçesi düzeltmemden sonra hâlâ ayakta mı.
2. %5 tavanını tutturmak için koordinatör tarafında ne değişmeli? Sözleşme yazma ve kapanış turlarını nasıl sıfıra yaklaştırırım — şablon, betik, yoksa mekanizmayı tümden değiştirmek mi?
3. Paralel deneyin tam tasarımı: kaç ajan, hangi dosya örtüşmesi, kaç tekrar, ve **koşudan önce yazılmış eşikler**. Guard kalır/gider kararını hangi sayı verir.
4. Sıra: önce kesim mi, önce ölçüm mü? Hangi adımdan sonra bana "yeter" deme noktası gelir.

Türkçe yaz. Kod yazma, dosya oluşturma; tek çıktın rol dosyandaki üç başlıklı ve en fazla 20 satırlık mesaj.

## Donen

## Karar
Düzeltmen kabul: `verify` kapısı gözlemsel kanıtsız kalıyor, ama bedeli sıfır tur olduğu için (komut `complete` içinde koşar) kalır — gerekçesi "yakaladı" değil "bedava". Kanıtı olan şey denetçi (72 ek turun 33'ü = manşet 17 + eksik test 16, `ek-72-ek-tur-sinif-atamasi.md`), ama turu 95-100k token: %5 tavanı altında zorunlu olamaz, yalnız `risk: high` ve kullanıcı isteğinde açılır. Geçen turda kestiğim `manset.js`i geri alıyorum: en pahalı kusuru (22 sözleşme) sıfır model bedeliyle yakalayan tek deterministik parça, `complete` içinde kalır.
Kesim: OWED, fan-in sinyali, `raise:` mührü, round-4 danışman zorunluluğu, `update.js`, banner ayrıntısı, `advice.js` dışı danışma kanalı → `trash/`. Kalan: guard (deney sonucuna bağlı), verify+manset (`complete` içinde), ledger/handoff, denetçi (isteğe bağlı).
Koordinatör: sözleşme dosyası T0'ın yazdığı ayrı tur olmaktan çıkar — sözleşme gövdesi Agent prompt'unun içinde gider, `watch.js` PostToolUse'ta dosyayı o metinden üretir. Kapanış `closure.js` SubagentStop'ta `complete`i kendisi koşar; T0 yalnız sonucu okur. Hedef: koşu başına T0 turu Core = native = 2. Bu mekanizma değişikliğidir, şablon değil; şablon turu kısaltır, sıfırlamaz.
Sıra: (1) kesim — ölçülen yolda değiller, sadece bakım; (2) kanca katlaması + pilotu 3 tekrar yeniden koş; (3) paralel deney. "Yeter" noktası (2)'nin sonunda gelir; (3) tavanı değil guard'ı karara bağlar.

## Gerekçe
Bir T0 turu $0,23 (350k cache okuma), bir ajan koşusu $0,10: tek fazla T0 turu tek başına +%200'dür. %5 ancak T0 tur sayısı eşitlenince ulaşılır; ajan tarafındaki +%15,6 cache dışı token ≈ $0,003, tavanın içinde.
Eşikler (koşudan önce): adım 2 — 3 koşuda T0 turu 3/3'te Core=native ve ajan $ medyan farkı ≤ +%5 → tavan tutuldu, aksi hâlde katlama başarısız, düzeltme yok, rapor. Adım 3 — 3 ajan `sonnet/medium`, her biri kendi dosyasına + üçünün de düzenlemesi gereken tek ortak dosyaya (dışa aktarım listesi/indeks) iş alır; 2 kol × 5 tekrar. Çakışma tanımı: ortak dosyayı ≥2 ajanın yazması **veya** birleşik ağacın kabul testini geçmemesi. Native çakışma ≥2/5 → guard kalır; ≤1/5 → guard `trash/`. Core kolunda guard delinmesi >0 ya da birleşik test <4/5 → "guard çalışıyor ama işe yaramıyor", yine gider. Maliyet ≈ 30 ajan × $0,12 + ~10 T0 turu ≈ $7; kullanıcının kural gereği bu sayıyı görmesi gerekir.

## Kaçırdığın
Kancaya katlanan kapanış başarısız verify'da ne yapacak — sonucu ajan sonucuna iliştirip T0'ı bir tura zorlamak native'in de ödediği turdur, ayrı sayılmaz; ama otomatik "geri gönder" döngüsü kurulursa tavan sessizce delinir, kurma. Ayrıca 72 turun 13'ü "ürün kriteri karşılanmadı" ve 8'i T0'ın kendi kapsam hatası: bunları hiçbir mekanizma önlemez, bench'te mekanizmaya yazılmasınlar.
