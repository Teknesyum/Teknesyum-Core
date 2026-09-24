# UI Tarama — Hareket ve Akıcılık

Brif: `docs/ajan/ui-tarama/brif.md`. Önce dört raf dosyası okundu: `ui-duzeni.md`, `ui.md`,
`kabuk-standardi.md`, `guncelleme-paneli.md`. `ui-duzeni.md`'nin "Hareket" bölümü (yalnız
transform/opacity, 0 ms odak halkası, iskelet yükleme, gizli açılan pencere, sonsuz döngü
yalnız ilerleme kapsamında, `prefers-reduced-motion` döngüleri durdurur, canlı günlük en
yeni satırı parlak) ve `guncelleme-paneli.md`'nin tavan kuralı, iki renkli geçiş + tarama
ışığı, bildirim ömrü zaten kurallı; burada tekrar önerilmedi.

## Taranan Depolar

| Depo | Lisans | Yıldız | Karar | Neden |
| --- | --- | --- | --- | --- |
| motiondivision/motion (framer-motion) | MIT | 33.7k | al | Spring/tween ayrımı ve FLIP tabanlı layout animasyonu (`layout`, `AnimatePresence popLayout`) somut davranış kuralı verdi. |
| pmndrs/react-spring | MIT | 29.2k | uyarla | "Yalnız yay, eğri yok" felsefesi ilke olarak alınır; `tension/friction` preset sayıları projeye taşınmaz (token değil). |
| formkit/auto-animate | MIT | 13.9k | al | Ekle/çıkar mikro-animasyonu kaynak kodda da yalnız `transform`+`opacity` kullanıyor; şablon adayı. |
| emilkowalski/sonner | MIT | 13.0k | al | Bildirim ömrü / duraklama mimarisi mevcut raf kuralıyla birebir örtüşüyor; kaynak kod şablon adayı. |
| emilkowalski/vaul | MIT | 8.6k | al | Çekmece hız-eşikli kapama ve sınırda sönümleme; `templates/kur` çekmece/panel için taşınabilir. |
| emilkowalski/skills (`review-animations`, `animate`) | MIT | 40.5k | al | En yoğun, sayısal gerekçeli kaynak; süre/eğri/kesinti/performans kurallarının çoğu buradan süzüldü. |
| material-components/material-web (M3 motion token'ları) | Apache-2.0 | 11.3k | al | Süre/eğri/yay token taksonomisi (short/medium/long, standard/emphasized) — yapı alınır, sayı yalnız "token önerisi" satırına. |
| carbon-design-system/carbon | Apache-2.0 | 9.5k | al | "Productive/expressive" süre ayrımı ve süreyi mesafeye göre ölçekleme fikri. |
| microsoft/fluentui (`react-motion` token'ları) | MIT | 20.3k | al | Global süre/eğri token seti; isimlendirme deseni (`duration*`, `curve*`) referans. |
| AvaloniaUI/Avalonia (+ avalonia-docs) | MIT | 31.5k | al | Yığının yerel ayağı için `CrossFade`/`PageTransition` soyutlaması doğrudan kullanılabilir. |
| kristerkari/stylelint-high-performance-animation | MIT | 87 | al | Mevcut "yalnız transform/opacity" kuralını derleme zamanında denetleyen hazır araç. |
| Apple HIG — Motion (developer.apple.com) | doküman, telif Apple'a ait | — | uyarla | "Amaçlı hareket" ve azaltılmış hareket ilkesi sayı vermeden alınır. |
| rauno.me / Devouring Details (Rauno Freiberg) | kişisel yazı, telif yazara ait | — | uyarla | Kesintiye açıklık (interruptibility) ilkesinin ikinci, bağımsız tanığı — Kowalski kaynağını doğrular. |
| View Transitions API (web platformu / MDN) | platform API, lisans yok | — | uyarla | Tauri+React web görünümünde sayfa/sekme geçişi için tarayıcı düzeyinde mekanizma; `prefers-reduced-motion` kapatma deseni alınır. |
| GoogleChromeLabs/view-transitions-toolkit | Apache-2.0 | 191 | ele | Örnekler tanıtım amaçlı; rafın "gösterişli efekt girmez" kısıtının ötesinde sahne efektleri sunuyor. |
| airbnb/lottie-web | MIT | 32.1k | ele | After Effects kaynaklı karmaşık vektör sahne motoru — "davranış kitaplığı alınır, görsel sahne asla" ve "yalnız transform/opacity" kısıtlarıyla temelden çelişiyor. |
| animations.dev (Emil Kowalski'nin ücretli kursu) | ücretli, ayrı repo yok | — | ele | İçerik zaten `emilkowalski/skills` deposundaki `STANDARDS.md`'de ücretsiz ve alıntılanabilir biçimde özetli; ayrıca taranmadı. |

## Kural Adayları

**Kural:** Süre, bileşenin ekrandaki rolüne göre kademelenir: değer/simge geri bildirimi en
kısa, açılır menü/seçici orta, pencere/çekmece en uzun basamakta durur.
**Kaynak:** emilkowalski/skills `skills/review-animations/STANDARDS.md` ("Duration" tablosu) ·
material-components/material-web `tokens/versions/latest/sass/_md-sys-motion.scss`
(short/medium/long/extra-long) · carbon-design-system/carbon `packages/styles/scss/_motion.scss`.
**Token önerisi:** `--tk-duration-feedback: 100–160ms (emilkowalski/skills STANDARDS.md)`,
`--tk-duration-menu: 150–250ms (aynı kaynak)`, `--tk-duration-panel: 200–500ms (aynı kaynak)`,
karşılaştırma için Carbon `$transition-base: 250ms` (`packages/styles/scss/_motion.scss`) ve
M3 `$duration-medium2: 300ms` (`_md-sys-motion.scss`).
**Denetim:** Yeni bileşen eklenirken `--tk-duration-*` seçimi bu üç basamaktan hangisine
girdiği yorum satırıyla belirtilir; ekran görüntüsünde geçiş süresi DevTools Animasyon
panelinde ölçülür.

**Kural:** Eğri, hareketin türüne göre seçilir: ekrana giren/çıkan öğe hızlı başlar ve
yavaşlar, ekran içinde yer değiştiren/şekil değiştiren öğe yavaş-hızlı-yavaş gider, vurgu/renk
geçişi standart eğriyi kullanır, sabit tekrarlı döngü doğrusal gider; ekrana giren hiçbir öğe
yavaş başlayan eğriyle açılmaz.
**Kaynak:** emilkowalski/skills `STANDARDS.md` ("Easing" bölümü, karar sırası) · material-web
`_md-sys-motion.scss` (`$easing-standard`, `$easing-emphasized-decelerate`,
`$easing-emphasized-accelerate`).
**Token önerisi:** `--tk-ease-out: cubic-bezier(0.23,1,0.32,1) (emilkowalski/skills STANDARDS.md)`,
`--tk-ease-in-out: cubic-bezier(0.77,0,0.175,1) (aynı kaynak)`, karşılaştırma M3
`$easing-standard: cubic-bezier(0.2,0,0,1)` ve `$easing-emphasized-decelerate:
cubic-bezier(0.05,0.7,0.1,1)` (`_md-sys-motion.scss`).
**Denetim:** `rg "ease-in[^-]" --type css --type ts` ile UI kodunda tek başına `ease-in`
kullanımı aranır; bulunursa giriş/çıkış dışı bir kullanım olup olmadığı gözden geçirilir.

**Kural:** Ekrana giren öğe sıfır ölçekten değil, hafifçe küçültülmüş ve saydam durumdan
başlar; iletişim kutusu bu kuraldan muaftır, ekran ortasında sabit kalır.
**Kaynak:** emilkowalski/skills `STANDARDS.md` ("Physicality") · formkit/auto-animate
`src/index.ts` (`add()` fonksiyonu, `scale(.98)`→`scale(1)` anahtar kareleri).
**Token önerisi:** `--tk-scale-enter: 0.9–0.97 (emilkowalski/skills STANDARDS.md)`; auto-animate
kaynağı `scale(.98)` kullanıyor (`formkit/auto-animate src/index.ts`, satır ~615).
**Denetim:** `rg "scale\\(0\\)|scale\\(0,0\\)" --type css --type ts` taraması; ekran
görüntüsünde giriş animasyonunun ilk karesinde öğenin tamamen yok olmadığı, küçük ve saydam
başladığı gözle denetlenir.

**Kural:** Açılır menü/işlem kutusu, tetikleyici öğeden büyür; ölçek merkezi ekran ortası
değil tetikleyicinin konumudur.
**Kaynak:** emilkowalski/skills `STANDARDS.md` ("Physicality" → "Origin-aware popovers",
Base UI örneği).
**Token önerisi:** `-` (sayı yok, `transform-origin` konum değişkenidir).
**Denetim:** Açılır menü farklı ekran kenarlarından tetiklendiğinde büyüme yönünün
tetikleyiciye göre değiştiği ekran görüntüsüyle doğrulanır.

**Kural:** Hızla ve tekrar tetiklenebilen öğe (bildirim, açma/kapama anahtarı, sürüklenen
panel) CSS geçişiyle (`transition`) canlanır, anahtar kare (`@keyframes`) ile değil; öğe
kesintiye uğrarsa animasyon o anki konumundan devam eder, baştan sıçramaz.
**Kaynak:** emilkowalski/skills `STANDARDS.md` ("Interruptibility") · motiondivision/motion
`docs/react-animation` (keyframe'de `null` ile mevcut konumdan devam) · emilkowalski/vaul
`src/constants.ts` (`TRANSITIONS` sabiti, `easing`-tabanlı geçiş).
**Token önerisi:** `-` (mekanizma seçimi, sayı yok).
**Denetim:** `rg "@keyframes" --type css` ile bulunan animasyonların tekrar tetiklenebilir
bileşenlere (bildirim, anahtar, sürükleme) bağlı olup olmadığı kontrol edilir; bağlıysa
`transition`e çevrilir.

**Kural:** Liste öğesi eklenip çıkarılırken ya da yeniden sıralanırken kalan öğeler yeni
konumlarına kayarak gider, sıçramaz; çıkan öğe akıştan hemen düşer ve kalanların düzenini
etkilemez.
**Kaynak:** motiondivision/motion — FLIP tekniği ve `AnimatePresence mode="popLayout"`
(`docs/react-layout-animations`) · formkit/auto-animate `src/index.ts` (konum farkını ölçüp
`transform` ile telafi eden çekirdek algoritma).
**Token önerisi:** `-`.
**Denetim:** Bir listeye ortadan öğe eklenip silinirken komşu öğelerin aniden zıplamadığı,
yumuşak kaydığı ekran görüntüsü dizisiyle (3-4 kare) denetlenir.

**Kural:** Görünür bir sayı değiştiğinde eski değerden yeniye tek seferde atlamaz; ara
değerlerden geçerek ya da basamak bazında kayarak değişir.
**Kaynak:** motiondivision/motion, sayı animasyonu örneği (`docs/react-animate-number`,
`examples/react-number-counter`) — yay (`useSpring`) ile ara değerlerden geçirme deseni.
**Token önerisi:** `-`.
**Denetim:** Hızlı art arda değişen bir sayaç (örn. ilerleme yüzdesi, satır sayısı) ekran
kaydında basamakların sıçramadan aktığı gözlenir.

**Kural:** Sürükleyerek kapatma/kaydırma, yalnız kat edilen mesafeyle değil hızla da karar
verir; kısa ama hızlı bir hareket de eylemi tamamlar.
**Kaynak:** emilkowalski/vaul `src/constants.ts` (`VELOCITY_THRESHOLD`) · emilkowalski/sonner
`src/index.tsx` (`SWIPE_THRESHOLD`, hız hesabı `swipeAmount/timeTaken`) · emilkowalski/skills
`STANDARDS.md` ("Gestures & drag" → momentum dismissal).
**Token önerisi:** `--tk-swipe-velocity: 0.11 px/ms (emilkowalski/sonner src/index.tsx,
satır ~348)`; karşılaştırma emilkowalski/vaul `VELOCITY_THRESHOLD: 0.4` (`src/constants.ts`).
**Denetim:** Çekmece/bildirim bileşeninde hızlı-kısa bir sürükleme ile kapanmanın tetiklendiği
elle test edilir; yalnız mesafe eşiği kalmışsa kural ihlal edilmiş sayılır.

**Kural:** `will-change` yalnız birkaç yüz milisaniye içinde canlanacağı bilinen öğeye,
canlanmadan hemen önce verilir ve animasyon bitince kaldırılır; sayfa geneline ya da kalıcı
olarak verilmez.
**Kaynak:** web.dev "Animations and performance" (derleme: `<a
href="https://web.dev/articles/animations-and-performance">web.dev/articles/animations-and-performance</a>`) —
katman şişmesi ve bellek maliyeti uyarısı.
**Token önerisi:** `-`.
**Denetim:** `rg "will-change" --type css --type ts` ile bulunan her kullanımın koşullu
eklenip animasyon bitince temizlendiği (statik/kalıcı olmadığı) kontrol edilir.

**Kural:** Tauri+React yığınında animasyon kütüphanesinin transform kısayolları (`x`, `y`,
`scale` gibi ayrık prop'lar) yerine tam `transform` dizgesi ya da CSS/WAAPI tercih edilir;
kısayollar ana iş parçacığında hesaplanır ve yük altında kare düşürür.
**Kaynak:** emilkowalski/skills `STANDARDS.md` ("Performance" → Framer Motion shorthands).
**Token önerisi:** `-`.
**Denetim:** `rg "animate=\\{\\{\\s*(x|y|scale):" --type tsx` taramasıyla kısayol kullanımı
bulunur; yoğun listede (çok satırlı günlük, uzun tablo) kaydırma sırasında kare düşüşü
DevTools Performance panelinde ölçülür.

**Kural:** Avalonia tarafında sekme/sayfa değişimi elle yazılan opacity/margin animasyonu
yerine çerçevenin kendi `PageTransition`/`CrossFade` soyutlamasıyla verilir.
**Kaynak:** AvaloniaUI/avalonia-docs `docs/graphics-animation/page-transitions.md` ·
`Avalonia.Animation.CrossFade` API dokümanı.
**Token önerisi:** `-`.
**Denetim:** `rg "PageTransition|CrossFade" --type xaml --type cs` ile kullanımın var olduğu,
elle `Opacity` animasyonu yazan başka bir kod yolunun olmadığı doğrulanır.

## Çelişkiler

**Bulgu:** Yüksek frekanslı, klavye tetikli eylemlerde (komut paleti açma/kapama, kısayolla
sekme değiştirme — günde 100+ kez tekrar edenler) animasyon tamamen kaldırılmalı.
**Kaynak:** emilkowalski/skills `STANDARDS.md` ("Should it animate?" frekans tablosu) — gerekçe:
sık tekrarlanan eylemde animasyon yavaş ve kopuk hissettirir, kullanıcı zaten sonucu bekliyor
olmaz.
**Raf tarafı:** `ui-duzeni.md` "Hareket temeldir, süs değil: panel, sekme, liste değişimi...
canlanır. 'Gerekli görünmedi' gerekçe sayılmaz" — gerekçe: programın çalıştığını her zaman
göstermek, sessiz/ani durum değişikliğini hata saymak.
**Değerlendirme:** İki taraf da haklı olduğu bağlamda haklı; çelişki yalnız *çok yüksek
frekanslı, klavye tetikli* alt kümede var (örn. sekmeler arası `Ctrl+Tab`, komut paleti). Karar
bana bırakılır — rafa madde olarak eklenmez, yalnız burada işaretlenir.

## Şablon Adayları

- **Sonner bildirim zamanlayıcısı** (`emilkowalski/sonner`, MIT) — `src/index.tsx` içindeki
  `TOAST_LIFETIME`/duraklama durum makinesi, `guncelleme-paneli.md`'deki bildirim ömrü kuralıyla
  örtüşüyor; `templates/` altında bildirim bileşeni için taban alınabilir.
- **Vaul çekmece sürükleme mantığı** (`emilkowalski/vaul`, MIT) — `src/constants.ts` +
  `use-snap-points.ts` içindeki hız-eşikli kapama ve sınırda sönümleme; Kur/durum panelinin
  çekilebilir gövdesi ya da mobil şerit için taşınabilir davranış.
- **auto-animate çekirdeği** (`formkit/auto-animate`, MIT) — `src/index.ts`, sıfır
  yapılandırmalı, yalnız `transform`+`opacity` kullanan liste ekle/çıkar/taşı motoru; günlük
  satırı, sekme listesi gibi jenerik liste bileşenleri için düşünülebilir.
