# UI Tarama — Tasarım Sistemleri ve Cila (Düzen, Tipografi, Durumlar)

Kapsam: boş durum, hata durumu, iskelet yükleme, yoğunluk kipleri, tipografik ölçek ve
`tabular-nums`, hizalama ızgarası, sayı/tarih biçimi, kenarlık/ayraç, koyu temada yükseklik
gösterimi, odak halkası, düğme sıradüzeni. Renk ve hareket başka ajanların kapsamında;
burada yalnız sayısız, gözle/`rg` ile denetlenebilir kurallar var.

## Taranan Depolar

| Depo | Lisans | Yıldız | Karar | Neden |
|---|---|---|---|---|
| shadcn-ui/ui | MIT | 124.449 | uyarla | İskelet ve boş durum bileşen deseni davranış olarak alınabilir; görsel teması (shadcn temalı renk/köşe) alınmaz. |
| vercel/geist | genel repo yok (kapalı kaynak) | - | uyarla | Herkese açık `vercel.com/geist` dokümanı kaynak; `tabular-nums` sayı kuralı doğrudan uygulanabilir. |
| primer/react | MIT | 3.903 | uyarla | GitHub'ın üretim tipografi/kenarlık kuralları olgun ve token tabanlı. |
| primer/primitives | MIT | 408 | ele | Sadece JSON token kaynağı; kendi token'larımızla çakışır, doğrudan alınmaz. |
| carbon-design-system/carbon | Apache-2.0 | 9.478 | al | Boş durum ve ızgara kuralları net, sayısız yazılabilir öneriler taşıyor. |
| microsoft/fluentui (Fluent 2) | NOASSERTION | 20.289 | uyarla | Yoğunluk kipi (Compact/Standard) kavramı net tanımlı; lisans belirsiz olduğundan kod değil yalnız desen alınır. |
| Shopify/polaris | NOASSERTION (repo arşivlenmiş) | 6.171 | ele | Dokümantasyon `shopify.dev`'e taşınmış, çoğu sayfa 404/yönlendirme; canlı kaynak değil. |
| Atlassian Design System (atlassian.design) | herkese açık dokümantasyon, repo yok | - | al | Koyu temada yükseklik = yüzey tonu + gölge ikilisi kuralı doğrudan bizim "gölge rengi icat etme" kısıtımıza uyuyor. |
| JetBrains New UI (jetbrains.com/help) | dokümantasyon, repo yok | - | uyarla | Compact Mode tanımı yoğunluk kipi adayı için iyi bir emsal. |
| radix-ui/themes | MIT | 8.716 | ele | Erişilebilirlik/odak sayfası bu taramada 404 verdi; kaynak doğrulanamadı, aday üretilmedi. |
| tailwindlabs/tailwindcss-typography | MIT | 6.473 | ele | `prose` eklentisi uzun metin (makale) tipografisi için; Teknesyum arayüzü uzun metin göstermiyor, odak alanı dışı. |
| Laws of UX (lawsofux.com) | içerik, kod değil | - | uyarla | Hizalama/gruplama yasaları (Common Region, Proximity) ızgara kuralına gerekçe olarak kullanılabilir; doğrudan kural değil. |
| Refactoring UI (refactoringui.com) | içerik, kod değil | - | uyarla | "Kenarlığı azalt, yüzey tonuyla ayır" ve "taban çizgisi hizası" ilkeleri sayısız uygulanabilir. |

## Kural Adayları

**Kural:** Boş durum; neden boş olduğunu değil sonraki adımı anlatan bir gövde metni ve tek
birincil eylem taşır, birincil eylem her zaman dolu/boş fark etmeksizin sayfanın aynı
konumunda durur.
**Kaynak:** Carbon Design System, Empty states pattern — carbondesignsystem.com/patterns/empty-states-pattern
**Token önerisi:** -
**Denetim:** Boş durum ekran görüntüsünde birincil eylem düğmesinin, aynı görünümün dolu
halindeki eşdeğer düğmeyle aynı konumda olduğu karşılaştırılır; `rg "EmptyState"` ile
bulunan her bileşende ikinci bir çağrı-eylem düğmesi olmadığı denetlenir.

**Kural:** Birden çok eylem sunan boş/hata durumlarında eylemler arasında görsel bir
sıradüzen kurulur (biri birincil, diğerleri ikincil); ikisi de aynı ağırlıkta gösterilmez.
**Kaynak:** Carbon Design System, Empty states pattern — carbondesignsystem.com/patterns/empty-states-pattern
**Token önerisi:** -
**Denetim:** Ekran görüntüsünde birden fazla düğme varsa yalnız birinin dolgulu/vurgulu
diğerlerinin kenarlıklı ya da metin düğmesi olduğuna bakılır.

**Kural:** Sayı gösteren her metin (miktar, süre, boyut, yüzde, tarih/saat) sabit genişlikli
rakamla (`tabular numbers`) dizilir; kayan genişlikli rakam animasyonlu ya da liste halinde
sayı gösteren hiçbir yerde kullanılmaz.
**Kaynak:** Vercel Geist, Typography — vercel.com/geist/typography (Label metin stilinde
"Tabular is used when conveying numbers for consistent spacing")
**Token önerisi:** -
**Denetim:** `rg "tabular-nums|font-variant-numeric"` ile sayı gösteren bileşenlerde
(ilerleme yüzdesi, günlük saat damgası, dosya boyutu) kullanıldığı aranır; kullanılmayan
sayı alanı ekran görüntüsünde yan yana iki farklı basamak genişliğiyle karşılaştırılır.

**Kural:** Koyu temada katman (kart üstü panel, açılır menü, iletişim kutusu) rengi renkli
gölgeyle değil, bir üst katmanın daha açık yüzey tonuyla ve gerektiğinde ince kenarlıkla
ayırt edilir; gölge yalnız en üstteki taşınabilir/kaplama katmanlarda kenarlıkla birlikte
kullanılır.
**Kaynak:** Atlassian Design System, Elevation foundation — atlassian.design/foundations/elevation
**Token önerisi:** -
**Denetim:** Panel/kart bileşenlerinde `box-shadow` yerine `background`/`border` farkının
katman derinliğini taşıdığı `rg "box-shadow"` ile aranan yerlerde, her `box-shadow`'un
yanında bir yüzey tonu değişikliği de olduğu denetlenir.

**Kural:** Yoğunluk kipi (sıkışık/ferah) yalnız satır yüksekliği, iç boşluk ve simge boyutunu
değiştirir; yazı boyutu ve bilgi hiyerarşisi kipten bağımsız sabit kalır.
**Kaynak:** JetBrains New UI, Compact Mode — jetbrains.com/help/idea/new-ui.html; Fluent 2,
Standard/Compact density — fluent2.microsoft.design/design-tokens
**Token önerisi:** `--tk-density-row-height`, `--tk-density-padding` gibi ayrı bir katman
altında tutulmalı (kaynakta somut piksel değeri yok, yalnız kavram var).
**Denetim:** Sıkışık kip açıkken ekran görüntüsünde yazı boyutunun değişmediği, yalnız
satır aralığı ve dolgunun küçüldüğü ölçülür.

**Kural:** Metin gövdesinde satır uzunluğu belli bir karakter sayısını aşmaz; günlük/liste
gibi tek satırlık teknik metinler bu kurala tabi değildir.
**Kaynak:** Primer Design System, Typography foundations — primer.style/foundations/typography
("lines around 80 characters or less")
**Token önerisi:** `--tk-measure-max: ~80ch (Primer, primer.style/foundations/typography)`
**Denetim:** Yardım metni/açıklama alanlarında `rg "max-width.*ch|measure"` deseni aranır;
yoksa ekran görüntüsünde bir paragrafın satır uzunluğu göz kararıyla karşılaştırılır.

**Kural:** Kenarlık, yüzeyleri ayırmanın son çaresidir; önce yüzey tonu farkı ya da boşluk
denenir, kenarlık yalnız ikisi yetersiz kaldığında eklenir.
**Kaynak:** Refactoring UI, "Use fewer borders" ilkesi — refactoringui.com
**Token önerisi:** -
**Denetim:** Bileşen ağacında art arda gelen `border` kullanımı `rg "border(-\w+)?:\s*var\(--tk-border"` ile sayılır; komşu iki kapsayıcı hem yüzey tonu hem kenarlık taşıyorsa gözden geçirilir.

**Kural:** Düğme sıradüzeni beşi geçmez: birincil (tek, alan başına bir tane), varsayılan/ikincil,
sessiz/üçüncül (yalnız zaten tıklanabilir olduğu belli araç çubuğu gibi bağlamlarda), uyarı
(geri dönüşü riskli işlem) ve tehlike (yalnız kalıcı/geri alınamaz işlem, her zaman son onay).
**Kaynak:** Atlassian Design System, Button — atlassian.design/components/button/examples
**Token önerisi:** -
**Denetim:** Bir ekranda birden fazla dolgulu/vurgulu düğme olmadığı, tehlike düğmesinin
yalnız geri alınamaz eylemlerde (silme vb.) göründüğü `rg "variant=.danger.|variant=.primary."` ile taranan bileşenlerde denetlenir.

## Çelişkiler

**Bulgu:** Atlassian Design System, "raised" ve "overlay" katmanlarda yüzey tonu değişikliğine
ek olarak gölgenin de zorunlu eşlik etmesini istiyor ("Always pair elevation.surface.raised
with elevation.shadow.raised").
**Raf kuralı:** `ui-duzeni.md` satır 30 — geçişlerde yalnız `transform` ve `opacity` canlanır,
`transition` içine `box-shadow`/`background` girmez; bu statik gölge kullanımını yasaklamıyor
ama rafın genel yönü "dışa parıltı 24 px boş alan ister, yoksa `/50` kenar kullanılır" (satır 19)
diyerek gölge yerine kenarlığı öne çıkarıyor.
**Değerlendirme:** Çelişki hafif — raf saydam/parıltılı gölgeyi sınırlıyor, Atlassian'ın
önerdiği düz (renksiz, blur'suz) gölge farklı bir şey olabilir. Kural adayına alınmadı,
yalnız burada not edildi; karar rafın sahibine bırakıldı.

## Şablon Adayları

- **Skeleton (iskelet yükleme) bileşeni** — shadcn/ui, `components/ui/skeleton` — MIT.
  Davranış deseni (gelecek düzeni tutan blok + animasyonlu opaklık) `ui-duzeni.md` satır 28
  ("Yükleme, gelecek düzeni tutan iskelet gösterir; döner çark değil") ile zaten birebir
  örtüşüyor; kopyalanacak olan yalnız yapı (className ile boyutlanan blok deseni), renk/köşe
  shadcn temasından alınmaz.
- **Empty state anatomisi** (ikon/illüstrasyon yok zorunluluğu — başlık + gövde + tek birincil
  eylem) — Carbon Design System pattern dokümanı, Apache-2.0. Kod bileşeni değil, yalnız
  yapı şablonu olarak `templates/` altına düzen (layout) örneği eklenebilir.
