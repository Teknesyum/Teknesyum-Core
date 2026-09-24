# UI Tarama — Başsız Davranış Kitaplıkları

Brif: `docs/ajan/ui-tarama/brif.md`. Önce dört raf dosyası okundu:
`ui-duzeni.md`, `ui.md`, `kabuk-standardi.md`, `guncelleme-paneli.md`.

## Taranan Depolar

| Depo | Lisans | Yıldız | Karar | Neden |
|---|---|---|---|---|
| radix-ui/primitives | MIT | 19.3k | al | Dialog/Menu/Tooltip odak ve klavye davranışı için en dolgun, doğrudan test edilebilir kaynak |
| adobe/react-spectrum (React Aria) | Apache-2.0 | 15.9k | al | `FocusScope` ile odak tuzağı/geri odak deseninin referans anlatımı |
| floating-ui/floating-ui | MIT | 32.8k | al | `useDismiss`, `useTypeahead`, `useListNavigation` — hazır, çerçeve bağımsız etkileşim kancaları |
| pacocoursey/cmdk | MIT | 13.0k | al | Komut paleti filtre/boş-durum/ilk-öğe-seçili deseninin somut örneği |
| bvaughn/react-resizable-panels | MIT | 5.4k | al | Ayırıcı hedef boyutu (fare/dokunmatik ayrımı) ve klavye ile boyutlandırma |
| TanStack/virtual | MIT | 7.1k | al | Sanal liste overscan ve `scrollToIndex` hizalama sözleşmesi |
| clauderic/dnd-kit | MIT | 17.7k | al | Klavye sensörü + ekran okuyucu canlı bölge duyuru deseni |
| JohannesKlauss/react-hotkeys-hook | MIT | 3.5k | uyarla | Kod alınmaz, "scope" ilkesi (aktif olmayan sekmenin kısayolu tetiklenmez) alınır |
| w3c/aria-practices (WAI-ARIA APG) | W3C Document License | 1.35k | uyarla | Kod deposu değil, kalıp kaynağı; Dialog/Listbox/Menu desenleri doğrulama için kullanıldı |
| ariakit/ariakit | MIT | 8.6k | ele | Radix + React Aria'nın kapsadığı alanı tekrarlıyor; Combobox sayfası yönlendirme yüzünden derinlemesine incelenemedi, ayırt edici davranış doğrulanamadı |
| tailwindlabs/headlessui | MIT | 28.7k | ele | Aynı APG desenlerini uyguluyor, Radix/React Aria'dan ayrışan bir davranış kuralı çıkmadı |
| mui/base-ui | MIT | 11.0k | ele | Radix ekibinin yeni işi; dokümantasyonu sığ tarandı, ayırt edici bir davranış kuralı doğrulanamadı — ileride tekrar bakılabilir |
| chakra-ui/zag | MIT | 5.2k | ele | Durum makinesi yaklaşımı ilginç ama ürettiği davranış kuralları zaten Radix/React Aria kaynaklı; bağımsız yeni kural çıkmadı |
| TanStack/table | MIT | 28.4k | ele | Veri/durum modeli (sıralama, sayfalama); odak-klavye-erişilebilirlik kapsamına girmiyor |

## Kural Adayları

**Kural:** İletişim kutusu açıldığında odak içeri taşınır, Tab kutunun dışına çıkmaz (odak tuzağı), kapanınca odak açan denetime döner.
**Kaynak:** radix-ui/primitives, [Dialog docs](https://www.radix-ui.com/primitives/docs/components/dialog); adobe/react-spectrum, [FocusScope](https://react-aria.adobe.com/FocusScope)
**Token önerisi:** -
**Denetim:** Kutu açıkken son öğeden Tab'a devam edince odak ilk öğeye dönmeli; ekran görüntüsünde/`document.activeElement` ile kutunun dışına sızmadığı doğrulanır.

**Kural:** Esc iletişim kutusunu kapatır ve odağı açan denetime geri verir; hedef kodda açıkça seçilir, tarayıcı varsayılanına bırakılmaz.
**Kaynak:** radix-ui/primitives, Dialog docs; w3c/aria-practices, [Dialog (Modal) Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
**Token önerisi:** -
**Denetim:** Esc sonrası `document.activeElement` açan düğme olmalı.

**Kural:** Açılır menüde ok tuşları öğeler arasında gezinir, Home/End uca atlar, sağ/sol ok alt menüyü klavyeyle açıp kapatır.
**Kaynak:** radix-ui/primitives, [Dropdown Menu docs](https://www.radix-ui.com/primitives/docs/components/dropdown-menu); w3c/aria-practices, Menu Button pattern
**Token önerisi:** -
**Denetim:** Fare hiç kullanılmadan yalnız ok tuşlarıyla alt menüye inilip çıkılabilmeli.

**Kural:** Açılır listede art arda yazılan harfler bir dizeye birikir ve o dizeyle başlayan sonraki öğeye odaklanır; dize bir duraklamadan sonra sıfırlanır.
**Kaynak:** floating-ui/floating-ui, [useTypeahead](https://floating-ui.com/docs/useTypeahead)
**Token önerisi:** `--tk-typeahead-reset-ms: 750 (floating-ui useTypeahead resetMs varsayılanı)`
**Denetim:** Ardışık harflere basınca doğru öğeye gidilmeli; token süresinden uzun bekleyip tekrar yazınca dize sıfırlanmalı.

**Kural:** Araç ipucu fareyle üstüne gelindiğinde gecikmeli açılır; bir ipucu açıkken komşu öğeye geçişte gecikme kısalır.
**Kaynak:** radix-ui/primitives, [Tooltip docs](https://www.radix-ui.com/primitives/docs/components/tooltip) (`delayDuration`/`skipDelayDuration`)
**Token önerisi:** `--tk-tooltip-delay-ms: 700 (Radix Tooltip delayDuration varsayılanı)`; `--tk-tooltip-skip-delay-ms: 300 (Radix Tooltip skipDelayDuration varsayılanı)`
**Denetim:** İlk ipucu gecikmeli açılmalı; art arda komşu öğeler üzerinde gezinirken sonraki ipuçları belirgin şekilde daha hızlı açılmalı.

**Kural:** Komut paletinde ilk eşleşen öğe otomatik seçili gelir, sonuç yoksa boş-durum mesajı gösterilir, filtre girildikçe liste anında güncellenir.
**Kaynak:** pacocoursey/cmdk, [README](https://github.com/pacocoursey/cmdk)
**Token önerisi:** -
**Denetim:** Palet açılır açılmaz bir öğe zaten vurgulu olmalı; alakasız metin yazınca boş-durum metni görünmeli.

**Kural:** Açılır kutu/menü dışına tıklama ve Esc varsayılan olarak kapatır; sayfanın kendi kaydırması (arka plan scroll) tek başına kapatmaz.
**Kaynak:** floating-ui/floating-ui, [useDismiss](https://floating-ui.com/docs/useDismiss)
**Token önerisi:** -
**Denetim:** Kutu açıkken sayfayı kaydır — açık kalmalı; dışına tıkla ya da Esc'e bas — kapanmalı.

**Kural:** Sanal liste görünür alanın hemen ötesini önceden render eder (overscan); belirli bir öğeye kaydırma başa/ortaya/sona hizalama seçeneği taşır.
**Kaynak:** TanStack/virtual, [Virtualizer API](https://tanstack.com/virtual/latest/docs/api/virtualizer)
**Token önerisi:** `--tk-virtual-overscan-count: 1 (TanStack Virtual varsayılanı; performansa göre projede yükseltilebilir)`
**Denetim:** Hızlı kaydırmada boş/beyaz kare görünmemeli; programatik kaydırma hedefi görünür alana getirmeli.

**Kural:** Sürükle-bırak klavyeyle de yapılabilir (odakla, seç, ok tuşuyla taşı, onayla) ve her adım ekran okuyucuya canlı bölge ile duyurulur.
**Kaynak:** clauderic/dnd-kit, [Accessibility guide](https://docs.dndkit.com/guides/accessibility)
**Token önerisi:** -
**Denetim:** Fare hiç kullanılmadan bir öğe klavyeyle taşınabilmeli; ekran okuyucu açıkken (Narrator/NVDA) adım duyurusu gelmeli.

**Kural:** Panel ayırıcısının tıklanabilir/sürüklenebilir alanı görsel çizgisinden geniştir; dokunmatik girişte fare girişinden daha büyük hedef ayrılır.
**Kaynak:** bvaughn/react-resizable-panels, [`resizeTargetMinimumSize` dokümanı](https://github.com/bvaughn/react-resizable-panels) (Apple İnsan Arayüzü Kılavuzu'na atıfla)
**Token önerisi:** `--tk-resize-hit-target-desktop-px: 27`, `--tk-resize-hit-target-touch-px: 37` (react-resizable-panels dokümanının aktardığı Apple HIG önerisi: masaüstünde 20pt/27px, dokunmatikte 28pt/37px)
**Denetim:** Ayırıcı çizgisinin birkaç piksel dışından tıklayınca da sürükleme başlamalı; DevTools'ta görsel genişlik ile tıklama alanı karşılaştırılır.

**Kural:** Tıklanabilir/dokunulabilir her hedef en az 24×24 CSS piksel kaplar; daha küçükse çevresinde eşdeğer boş alan bırakılır ya da metin-içi bağlantı gibi istisna kapsamına girer.
**Kaynak:** W3C WCAG 2.2, [Target Size (Minimum) 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
**Token önerisi:** `--tk-min-target-px: 24 (WCAG 2.5.8 AA eşiği)`
**Denetim:** Küçük ikon düğmeleri DevTools'ta seçilir, hesaplanan kutu ≥24×24px olmalı ya da komşu hedeflerle çakışmayan 24px çevre payı bulunmalı.

**Kural:** Kısayol tuşları etkileşim kapsamına (scope) bağlıdır; aktif olmayan sekme/panelin kısayolu tetiklenmez.
**Kaynak:** JohannesKlauss/react-hotkeys-hook, [Scopes](https://github.com/JohannesKlauss/react-hotkeys-hook#scopes) — kod değil, ilke alındı
**Token önerisi:** -
**Denetim:** İki sekme aç, birindeki kısayolu diğer sekme odaktayken tetiklemeyi dene — tetiklenmemeli.

## Çelişkiler

Bu taramada rafın mevcut kurallarıyla doğrudan çelişen bir bulgu çıkmadı. İki noktada
pekiştirme var (yeni kural olarak yazılmadı, mevcut kural tekrar edilmiyor):
- Radix `AlertDialog` da Esc'te otomatik kapanıyor ve dışa tıklamayı görmezden geliyor —
  `ui-duzeni.md`'deki "Onay kutusu arka plana tıklamayı yok sayar ... Esc ikisini de kapatır"
  satırıyla aynı yönde.
- Taranan kitaplıkların hiçbiri odak halkasına giriş gecikmesi eklemiyor —
  `ui-duzeni.md`'deki "Odak halkası 0 ms'de belirir" ile çelişmiyor.

## Şablon Adayları

- **Odak tuzağı + geri odak birimi** — kaynak deseni: React Aria `FocusScope`
  (adobe/react-spectrum, Apache-2.0) ve Radix `Dialog` (MIT). `templates/odak-tuzagi`.
- **Tipahead yardımcı fonksiyonu** — kaynak: floating-ui `useTypeahead` (MIT).
  `templates/tipahead`.
- **Dışarı-tıklama/Esc kapatma politikası** — kaynak: floating-ui `useDismiss` (MIT).
  `templates/kapat-disari`.
- **Komut paleti iskeleti** (filtre + boş durum + ilk öğe seçili) — kaynak: cmdk (MIT).
  `templates/komut-paleti`.
- **Sürükle-bırak klavye sensörü + canlı bölge duyurusu** — kaynak: dnd-kit accessibility
  guide (MIT). `templates/surukle-birak`.
- **Panel ayırıcı hedef boyutu politikası** (fare/dokunmatik ayrımı) — kaynak:
  react-resizable-panels (MIT) + Apple HIG referansı. `templates/panel-ayirici`.

Her ödünç, kopyalanmadan önce `docs/licenses.md`'ye kaynağıyla yazılır (`ui-duzeni.md`
kapsam kuralı).
