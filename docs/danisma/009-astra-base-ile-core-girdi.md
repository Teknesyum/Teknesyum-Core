# 009 — GPT Astra'ya: Base İle Core Arasındaki Fark (Girdi)

Bu metin olduğu gibi GPT Astra'ya yapıştırılır. Astra dosya göremez; gereken her olgu burada.

---

Sen bağımsız bir gözsün. Aşağıda iki yazılımı, aralarındaki farkı ve ölçümleri anlatıyorum.
Sonunda dört soru var. Görüş değil, karar verilebilir cevap istiyorum; bilmediğin yerde
"bilmiyorum, şöyle ölçülür" de, uydurma.

## Bağlam

Claude Code, Anthropic'in terminal ajanı. Eklentiler ona **kanca** (araç çağrısından önce/sonra
koşan betik), **statusline** (modelin görmediği durum satırı), **ajan tanımı** ve **komut**
ekleyebilir. Kritik ayrım: kancanın stdout'a yazdığı her bayt modelin bağlamına girer ve
her turda yeniden okunur; statusline'a yazılan bedava.

Aynı yazar iki eklenti yazdı.

## Teknesyum Base (v2.66) — "istediğimizi yaptığımız proje"

Sınırsız sürüm. Özellikleri:

- **Sözleşme makinesi**: iş parçalara bölünür, her parça bir sözleşme dosyası; yönetici ajan
  planlar, yazmaz; işçi ajanlar yazar; **denetçi** ajan kabul eder ya da reddeder.
- **Düzeltme döngüsü**: red 1-3. turda aynı ajanla sürer, 4-5. turda daha güçlü modelle yeni
  ajan, tavanda karar kullanıcıya.
- **Ön çalışma**: sıfırdan projede ilk sözleşmeden önce benzer depolar paralel `scout`
  ajanlarıyla okunur, tek rapora "alındı / bilerek reddedildi / şüpheli" diye yazılır.
- **Üç profil** (eco/normal/premium) ve **tarife tablosu**: hangi rol hangi modelde hangi
  çabayla koşar. Premium'da **plan meclisi**: aynı brifinge iki planlayıcı (iki farklı
  model), yazma aracı yok. **İkinci görüş**: tek düğümde tek ajan tek soru.
- **`/scan <profil>`**: projeyi profile karşı salt okunur tarar, eksikleri sayar; model çağırmaz.
- **Görev paketleri**: büyük iş oturum dışında paket olarak koşar.
- **Görünür yönlendirme**: her gerçek olayda kanca bir satır basar
  ("sözleşme 4/7 bitti · 3 açık · kaldığım yerden sürdürüyorum").
- **Kesintiden kurtulma**: ajan başlangıç/bitişi kancayla `live/` altına yazılır; oturum
  kaydet/yükle komutları.
- **UI checkup**, **telefondan sürme** (`/rc`), kod haritası (`harita.js`), 9 kanca, 6 rol,
  bir işçi ajan, bir beceri.

## Teknesyum Core (v0.16.4) — "çıkarma sürümü"

Base'in 0.15 hattından yola çıkıp neredeyse her şeyin çıkarıldığı sürüm. Kalanlar:

- **Sayar**: her Write/Edit sonrası dokunulan dosya ve satır sayılır. Eşik: 5 dosya ya da
  150 değişen satır ya da riskli tek yol (`migrations/`, `auth`, lock dosyası, `.github/`…).
  Eşik altında bağlama **0 bayt**. Eşik aşılınca ve `docs/plan.md` yoksa **oturumda bir kez**
  tek satır: "5 dosyaya dokunuldu ve plan yok. docs/plan.md yaz ya da atla de."
- **Gösterir**: statusline'da dosya/satır, plan var mı, testler, bağlam yüzdesi, bekleyen
  devir, 30 dakikadan uzun süreçler (⏳).
- **Sınırlar**: sınırsız `until/while … sleep` döngüsü Bash'ten önce reddedilir, tek satırla.
- **Devreder**: bağlam %60'ı geçince ya da oturum bitince makine `handoff.md` yazar
  (görev, değişen dosyalar, koşan testler, plan); iki bölüm modele bırakılır (kararlar,
  sonraki adım). Yeni oturum "devam" deyince bir satır: "Devam: .claude/handoff.md".
- **Çalar**: model kullanıcıyı beklerken ses.
- **Danışır**: `??` ile başlayan istem, iş başlamadan bir danışman koltuğuna netleştirme
  sorar; alışveriş tam metin `docs/danisma/` altına yazılır. Kanca değil, CLAUDE.md'de kural.
- **İstenince koşan betikler**: import haritası, hata günlüğü, `agency.js` (273 kişilik bir
  açık ajan deposundan istenince tek koltuk okur — hiçbiri ajan olarak kurulmaz, roster
  bağlama girmez), kurulum, doktor, sürüm kesme.
- CLAUDE.md'ye önerilen beş satırlık kural: "Tek dosya ve bildiğin iş: yap. Beş ve üstü
  dosya: önce docs/plan.md. Bilmediğin kütüphane: yazmadan önce oku. Bitince çalıştır,
  çıktıyı göster. Küçük iş: bunların hiçbiri."

6 olay, 5 kanca dosyası. Yalnız `count.js` bağlama yazabilir; test takımı bunu denetler.

## Ölçümler (sonnet/low koltuk, temiz config, aynı görevler iki kolda)

- **100 sıradan tur** (araçsız soru-cevap), eklenti açık vs kapalı: kanca baytı iki kolda 0.
  Core tur başına +207 token (p50) / +427 (p95) fazla okur — bu CLAUDE.md'deki beş satırın
  bedeli, tamamı cache okuması, 0,0001 $.
- **Görev 02-05** (küçük kod işleri, n=5): medyan maliyet farkı ±%3, gürültü; kabul iki kolda
  tam.
- **Görev 06** (4 dosya, ~185 satır, n=3): native 0,34 $ 3/3 kabul; core 0,37 $ 3/3, kanca
  3/3 sessiz.
- **Uyarının tek başına bedeli**: ~450 token, 0,0007 $, ek araç çağrısı yok.
- **Kesilen oturum** (6 turda kesilip yeni oturumda yalnız "devam"): native 0/3 bitirdi,
  core 3/3; ikinci oturum core 0,33 $ vs native 0,11 $ — pahalı çünkü iş yapıyor,
  native "iyi görünüyor" deyip duruyor.
- **0.15 (Base hattı) bütünüyle geri takılınca**: aynı görevlerde 4-8 kat maliyet
  (görev 06: 2,92 $ vs 0,37 $; 13,9 dk; 7 alt ajan), kabul aynı. Ret.
- **0.15 parçaları tek tek geri takılınca** (karar kuralı koşudan önce yazıldı: taban
  aralığında kalırsa sinyal yok, 1,5 kat üstüyse ret): her istemde sayım satırı +%38;
  geniş risk ipucu +%18 (model "atla" dedi, bir tur ekledi); Stop'ta `npm test` +%51 ret;
  Write/Edit eşik kapısı sinyal yok (iki kolda da model zaten plan yazıyordu). Hiçbiri
  kabul sütununu oynatmadı, hiçbiri girmedi.
- Bench toplamı ~40 $.

## Yazarın kendi eşleştirmesi (bugün, 0 $)

Base'in 24 bölümü Core ile eşleştirildi. Altısı zaten Core'da (statusline, devir, harita,
ikinci görüş, üst klasör uyarısı, kancalar). Beşi ölçülüp girmedi (yukarıda). Altısı bilerek
çıkarıldı (kaydet/yükle, telefon, rapor, kural, premium komutu). Maliyet modeline sığan tek
kalıp "istenince koşar, kanca yok, sıradan turda 0 bayt" — `agency.js` bu kalıbın kanıtı.
Bu kalıba oturan üç aday: **A** profil taraması (`scan.js`, salt okunur, model çağırmaz),
**B** ön çalışma taraması (bir ajan, sonnet/low, istenince), **C** plan meclisi (CLAUDE.md'ye
dört satır, iki ajan, yalnız plan gerektiren işte). Kullanıcı A'yı seçti, gerisini bu
cevaba göre.

## Sorular

1. Base ile Core arasındaki farkın **gerçek sebebi** ne? Yazarın tezi: "model yerine seçen
   makine kabul sütununu oynatmıyor, sadece pahalıya geliyor." Bu tezde delik var mı? Ölçüm
   tasarımında (sonnet/low, küçük görevler, n=3-5) fark göstermeyecek bir kör nokta var mı —
   örneğin Base'in avantajı ancak büyük/uzun işte mi çıkar, ve bu nasıl ucuz ölçülür?
2. Base'den Core'a, **sıradan turun maliyetini artırmadan** eklenebilecek, yazarın listesinde
   olmayan bir şey görüyor musun? Kalıp: kanca yok ya da kanca 0 bayt; istenince koşar.
3. A/B/C adaylarından hangisi değer, hangisi değmez, neden? Özellikle B ve C'nin "istenince"
   olması yeterli koruma mı, yoksa model bunları kendiliğinden çağırıp maliyeti şişirir mi?
4. Core'un şu anki halinde **fazla** olan bir şey var mı — çıkarılması gereken?

Cevabı şu başlıklarla ver: `## Olgu` (kabul ettiğin/reddettiğin tezler), `## Kör nokta`
(ölçümün göremeyeceği şey ve ucuz ölçüm yolu), `## Ekle` (madde madde, her birinin
tur maliyeti tahmini), `## Çıkar`, `## A/B/C kararı`. Türkçe yaz, kısa tut.
