# Fable: plugin'in varlık kararı

- soran: T0
- danisilan: fable
- tarih: 2026-09-05

## Sorulan

C:/Users/Teknesyum/.claude/plugins/cache/teknesyum/teknesyum-core/0.15.0/roles/advisor.md dosyasını oku ve onu izle. Başlıklar Türkçe: `## Karar`, `## Gerekçe`, `## Kaçırdığın`. Depo kökü: C:\Users\Teknesyum\Desktop\Projeler\Teknesyum Core. Soran: T0. Koltuğun: fable/medium. Kod yazma, dosya yazma; en fazla 45 satır. Bu, projenin var olup olmayacağına dair karar; sıradan bir tur değil.

Kullanıcının mesajı, aynen: "ya açıkcası nasıl bir düzen kurarız ne yaparız hangisi en mantıklısı ben çözemedim senin karar vermeni istiyorum / nihai gayemiz senin beğeneceğin bir plugin oluşturmak e bu gaye için en mantıklısı senin kararlarını uygulamak olurdu teknik tarafı iyice incele ve memnun olacağın bir düzenek inşa etmeye çalış burdaki memnuniyetinden kasıtım ölçümlerin hava cıva çıkmaması ödediğimiz bedele çok mantıklı karşılıklar alabilmek ben hala bilemiyorum bu plugin ne işe yarıyor o kadar repo incelettim işe yarayan yönleri tek bir pluginde toparlamak için o kadar pluginin hiç biri mi işe yarayan bişey değil hepsi mi maliyeti ikiye katlayarak yapıyor işlerini tam yetki sende proje sana emanet gerçekten imkansızsa native takılalım ne biliyim". Bir önceki mesajı: "birbirine karışmayan iki ajan paralel çalışabiliyorsa çalıştırabilmeli, kendi inisiyatifi, projenin tahmini süresini %50-%25'e düşürmek amaç olmalı paralel destekleyen bir iş ise".

Bugün ölçülenler (hepsi dosyada, docs/raporlar/2026-09-05-*.md):
1. Eklentinin varlığı: taze oturumda ilk önbellek yazımı +~90 token/tur (13.394 vs 13.301). Sıfıra yakın. Kullanıcının kendi CLAUDE.md+RULES.md'si +3,3k/tur.
2. Tek dosyalık 5 görevde Core vs native (taze oturum, sonnet/low, n=1): +1,6 / +2,3 / +16 / +30 / +48%; ama aynı ayarın kendi tekrarları arası oynaklık aynı büyüklükte ($0,29 vs $0,53). Tek koşu %5'i çözemez; ~20 koşu/kol gerekir.
3. Relay tek oturum içinde katlanmış akış (sözleşme prompt'ta, kanca mühürlüyor): ajan +%16 medyan (n=6; ~%8'i ajanın kabul betiğini kendisi de koşturması — bilinçli, kırmızı complete bir T0 turu yakar), T0 koşu başına 1 tur (native 2). T0 turu ajanın tamamından 4-8 kat büyük olduğunda toplam Core < native.
4. Tehdit deneyi: 6 kol, 0/6 ihlal iki kolda da — kapı o ölçekte hiçbir şey satın almadı.
5. Relay taze oturumda kendiliğinden tetiklenmiyor (4 dosyalı görevde bile, CLAUDE.md'li bile): model açıklama satırından karar veriyor, "ağır mekanizma" diye okuyor. Açıklama düzeltildi (boyut kuralı + paralel), yeni koşu sürüyor.
6. Otopsi: ajan bedelinin %56-80'i Edit öncesi keşif (grep/sed), iki kolda da; Core bunu azaltmıyor.
7. agency-agents: 273 rol metni, rol başına ~3,4k token, orkestrasyon yok; pasif katalog olarak sıfır bedelle bağlanabilir. Bukalemun (tek uzun ömürlü ajan) pahalı, reddedildi.
8. Deterministik parçalar (sıfır model bedeli): owns kapısı, verify kapısı complete'te, kanca mührü, manşet, hata günlüğü, bench/maliyet.js, map.js.

Benim (T0) eğilimim, sen görmeden: Core'un varlık sebebi tek ajanlı iş değil (orada native'i yenmek tanım gereği imkânsız, satın alacak şey yok). Varlık sebebi **paralel, kapılı iş**: iş bağımsız parçalara bölündüğünde ajanlar aynı anda koşar (duvar saati), her biri owns ile kutulanır (çarpışma yok), her biri verify ile kapanır (yeşil olmadan "bitti" yok). Boşta bedel ~90 token. O zaman doğru bench: tek dosyalık hata düzeltme değil, 3 bağımsız parçalı bir görev; ölçü duvar saati + pass@1 + $, native ardışık'a karşı. $'da +10-30 beklerim, sürede −50. Kullanıcıya "bu plugin duvar saati ve doğrulanmış kapanış satın alır, dolar değil" demek.

Sorular:
1. Bu çerçeve doğru mu, yoksa kendimi mi kandırıyorum? "Native takılalım" cevabı ne zaman doğru olur — hangi ölçüm çıkarsa?
2. Paralel bench görevi nasıl olmalı (kaç parça, hangi depo tipi, kabul nasıl, parçaların gerçekten bağımsız olduğunu nasıl kanıtlarız)? Eşik: süre ve $ için önceden ne yazılmalı?
3. Bugünkü Core'da paralel akışın çalışması için eksik olan ne (T0'ın bölme kararı, kanca, verify çakışması, aynı depoda iki ajanın npm install çakışması vb.)?
4. Kesilmesi gereken kalan parçalar? (advisor/auditor/manset/log/map — hangisi bu çerçevede hâlâ hak ediyor?)
5. Kaçırdığım?

## Donen

## Karar
Çerçeve doğru ama yarım. Core'un satın aldığı şey duvar saati **ve** doğrulanmış kapanış; fakat duvar saati Core'un değil, Agent tool'un malı — native de üç ajanı paralel koşturur. Core'un tekil payı yalnız kapılar (owns, verify, mühür). O yüzden bench iki karşılaştırma ister: Core-paralel vs native-paralel (kapıların bedeli) ve Core-paralel vs native-ardışık (duvar saati). "Native takılalım" kararı şu çıkarsa doğru: native-paralel pass@1 ≥ Core-paralel pass@1 ve $ farkı >%15, 3 görev × ≥10 koşu. Kullanıcıya bunu bugün söyle; kaçırılan varsa fark %5'in altında olur diye altına yaz.

## Gerekçe
Tek ajanlı işte Core'un kaybettiği (2, 6) ve boşta bedelin sıfır olduğu (1) ölçüldü; kalan iddia kapıların yanlış "bitti"yi engellemesi, o da yalnız çarpışma/eksik doğrulama üreten görevde görünür. Tehdit deneyi (4) sıfır ihlal verdiyse kapı henüz para etmiyor; bench görevinin bilerek çakışma barındırması gerekir. Kullanıcının "ne işe yarıyor" sorusuna dolar cevabı yok; tek dürüst cevap "pass@1 ve süre".

## Kaçırdığın
- Bench görevi: 3 parça, gerçek küçük npm/Node deposu (test koşabilen), parçalar farklı dosyalara yazar ama **bir ortak dosyaya** (index/export) da dokunur — bağımsızlık kanıtı diff'lerin dosya kümelerinin kesişmemesi + `git merge` çakışmasız; kabul = `npm test` yeşil, T0 tek tur. Eşik önceden: süre ≤%55 native-ardışık, $ ≤%130 native-paralel, pass@1 ≥ native.
- Bağımlılık çakışması: `npm install` aynı depoda iki ajanla yarışır; her ajana worktree (`isolation: worktree`) ver, merge'ü T0 yap. Bu bugün Core'da yok ve relay'in ilk gerçek eksiği.
- T0 bölme kararı: model tek dosyalık işi bölmez, paralel işi "ağır" okur (5). Bölmeyi modele değil kurala bırak: map.js'ten dosya-küme ayrıklığı çıkıyorsa ≥2 parça, çıkmıyorsa relay hiç açılmasın.
- Kesim: advisor kalır (bu tur örneği), auditor sadece yüksek riskte kalır, map.js bölme kararının motoru olduğu için terfi eder; manşet ve log kullanıcı okumuyorsa trash/.
- Otopsi bulgusunu (6) ıskaladın: bedelin %56-80'i keşif; paralel kol sayısı kadar keşif tekrarlanır, yani Core-paralel 
ı ardışıktan da pahalı çıkabilir. map.js'in özetini ajan prompt'una koymak keşfi keser — tek gerçek $ kazancı burada.
- Kullanıcının asıl cümlesi "gerçekten imkansızsa native takılalım": karar eşiğini o yazmadı, sen yazıyorsun; eşiği koşudan önce docs'a mühürle, yoksa sonuç ne çıkarsa yorumlanır.
