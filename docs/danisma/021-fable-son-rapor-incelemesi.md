# Fable son rapor incelemesi

- soran: T0
- danisilan: fable
- tarih: 2026-09-05

## Sorulan

C:/Users/Teknesyum/.claude/plugins/cache/teknesyum/teknesyum-core/0.15.0/roles/advisor.md dosyasını oku ve onu izle. Başlıklar Türkçe: `## Karar`, `## Gerekçe`, `## Kaçırdığın`.

Depo kökü: C:\Users\Teknesyum\Desktop\Projeler\Teknesyum Core
Soran: T0. Senin koltuğun: fable/medium.

Bu, ameliyatın son turu. Senin 020'deki eleştirin (ortalama eksik, 4-tur sayısı mühürsüz akışa aitti, "kuralı değiştirmek ürünü eğmek" ifadesi yanlış atfedildi, "yapısal sınır" tek bir sabitti, `risk: high` opus'a da yükseltiyor, korpus kontrolü ölçülemez) uygulandı ve düzeltilmiş kuralla üç koşu daha yapıldı.

Oku: `docs/raporlar/2026-09-05-ameliyat-sonuc.md` (tam), `docs/COST-MODEL.md` satır 36-50, `docs/danisma/020-*.md` (kendi önceki eleştirin).

Ham sayılar (ajan tarafı, aynı metin, sonnet/low, taze klon, bağımsız kabul):
- native n=3: 11/9/12 tur, $0,1079/0,0940/0,1151
- Core KAT3-5 (eski kural, mühür kapanmadı): 10/10/15 tur, $0,1068/0,1106/0,1403
- Core KAT6-8 (düzeltilmiş kural, üçü de kancadan mühürlendi, done/ status: done): 16/17/9 tur, $0,1599/0,1709/0,0815
- Core 6 koşu: medyan $0,1255 (+%16), ortalama $0,1283 (+%21). Kabul 6/6 PASS.
- T0: native 2 tur/koşu, Core KAT6-8 1 tur/koşu (bekleme + ölçüm + sonraki dispatch tek mesajda). T0 turu bu oturumda $0,52-0,95.
- Önceden yazılan eşik: T0 turu Core ≤ native VE ajan $ farkı ≤ +%5 (istisnai %10). Birincisi tuttu, ikincisi tutmadı.

Kullanıcının hedefi: "her ölçekte hava cıva olmayan, native'e göre ≤%5 tüketimli plugin"; "burada hiçbir şey kutsal inek değil"; "hava cıva diyorsan plugin yapmaktan vaz mı geçeyim".

Senden istenen, net olarak:
1. Rapor bu haliyle kullanıcının önüne dürüst mü — +%16'yı örtbas eden ya da abartan bir cümle var mı? Satır numarasıyla göster.
2. "+%16 gürültü, n=6 %5'i çözemez, 40 koşu ~25$ gerekir" tezi sağlam mı, yoksa kendimi kandırıyor muyum? Core'un ajan tarafında native'de olmayan gerçek bir bedel kaynağı görüyor musun (prompt'taki 1,2k karakterlik blok, "sözleşme dosyasına dokunma" cümlesinin ajanı dolaştırması, guard kancasının her yazımda koşması vb.)? Varsa bunu bir sonraki 40 koşudan ÖNCE nasıl ayrıştırırsın?
3. Kullanıcıya ne önerilmeli: (a) 40 koşuyu yap, (b) sonuçla yetin ve plugin'i bu sınırlarda kullan, (c) vazgeç. Tek cevap, gerekçesiyle.
4. Kaçırdığım ne var?

Kısa yaz; kararı ilk satırda ver.

## Donen

## Karar
Vazgeçme, 40 koşuyu da şimdi yapma: (b) — plugin'i çizilen sınırda kullan; öncesinde sıfır dolarlık iki iş var: uzun koşuların transkript otopsisi ve koşu başına **toplam** (T0 + ajan) bedel hesabı.

## Gerekçe
Rapor dürüst; +%16 örtülmüyor (s.64 +%48'i bile açık yazıyor, s.75 "tutmadı" kalın). Eğilen tek yer s.93-95: "ajanda sıfır ek tur" ve "oynaklık Core'dan bağımsız" — n=6 %5'i çözemiyorsa bağımsızlığı da kanıtlayamaz; s.85-86 "nedeni turlar" da neden turların arttığını sormadan kapatıyor. Bir de s.54-56: havuzlama gerekçesi doğru ama küçük sayıyı veren seçim de o; bunu söyle.
Gürültü tezi istatistik olarak ayakta, ama dağılım gürültü şeklinde değil: Core 9/10/10 | 15/16/17 iki kümeli, native 9-12 sıkı. İki kümeli dağılım "modelin keyfi" değil, bazen girilen bir yol demektir — sözleşme dosyasına/`.claude/relay`'e bakma denemesi, guard reddi sonrası dolaşma, "dokunma" cümlesinin merak uyandırması. 1,2k blok önbellekten okunur, para orada değil; para o yolda. Üç uzun koşunun araç çağrı dizisini native'inkiyle yan yana koy, fazla turlar nereye gidiyor bak — diskte duruyor, bedeli sıfır. Yol çıkarsa düzelt, sonra ölç; çıkmazsa gürültü tezi ancak o zaman hak edilir.
Kullanıcının hedefi toplam tüketim, raporun hiçbir satırı toplamı hesaplamıyor: T0 turu $0,5-0,95 iken native 2 tur ≈ $1-1,9, Core 1 tur ≈ $0,5-0,95; ajan $0,12'lik. Koşu başına toplamda Core native'in altında görünüyor — "hava cıva" sorusunun cevabı bu satırda, rapora girmeli (T0 turunun bağlam boyu farkını ayrıca göstererek).

## Kaçırdığın
- ~25
ın 20
ı T0 turu; ajan kolları `bench-low` ile tek T0 turunda 5'er dispatch edilirse 40 koşu ≈ 6-8$. Tahmin tasarım seçimiyle şişmiş.
- Native tabanı önceki oturumdan, kollar iç içe koşmadı; sonraki ölçümde kollar dönüşümlü koşmalı.
- `docs/danisma/020` "Dönen: cevap bekleniyor" — rapor s.144 onu kanıt diye gösteriyor ama benim önceki görüşüm kayıtta yok. Kanıt kuralı gereği o dosya doldurulmadan rapor kapanmaz.
