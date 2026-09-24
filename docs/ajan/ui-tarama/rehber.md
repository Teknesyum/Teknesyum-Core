# Cila Rehberleri, Ajan Becerileri ve Denetleyiciler

Ana ajan raporu yazmadan kapandı; bu dosya üç alt ajanın (A: rehberler ve beceriler,
B: erişilebilirlik denetleyicileri, C: performans ve tasarım sistemi) dönüşlerinden derlendi.

## Taranan Depolar

| Depo | Lisans | Yıldız | Karar | Neden |
|---|---|---|---|---|
| vercel-labs/web-interface-guidelines | MIT | 891 | al | Somut, çerçeveden bağımsız kurallar |
| raunofreiberg/interfaces | yok | 1946 | uyarla | Lisanssız; yalnız fikir düzeyinde |
| anthropics/skills frontend-design | ayrı LICENSE.txt | 177722 | uyarla | İlke düzeyinde, ölçü az |
| nextlevelbuilder/ui-ux-pro-max-skill | MIT | 129985 | ele | Şüpheli yıldız artışı, görsel tema odaklı |
| BehiSecc/awesome-claude-skills | - | - | not | "Superdesign" fikri |
| VoltAgent/awesome-claude-design | - | - | ele | Estetik katalog |
| dequelabs/axe-core | MPL-2.0 | 7545 | al | Çalışma anı kontrast ve erişim motoru |
| jsx-eslint/eslint-plugin-jsx-a11y | MIT | 3619 | al | Derleme anı JSX denetimi |
| YozhikM/stylelint-a11y | MIT | 438 | uyarla | Az bakımlı; kurallar teyitle |
| GoogleChrome/lighthouse | Apache-2.0 | 30797 | al | axe sarmalayıcı, CI'de koşar |
| microsoft/accessibility-insights-web | MIT | 953 | ele | axe tekrarı; Tab Stops fikri not |
| web.dev INP / CLS | - | - | al | Yanıt ve kayma bütçeleri |
| Atlassian motion | - | - | al | Süre sınıfları |
| Shopify Polaris loading | - | - | al | İskelet ve çark ayrımı |
| bradtraversy/design-resources-for-developers | MIT | 67010 | ele | Bağlantı listesi, kural yok |
| mobbin.com | - | - | ele | Yalnız ekran galerisi |

## Kural Adayları

- **Kural:** Her metin, gerçekten üstünde durduğu zemine karşı ölçülür; siyaha değil. Normal metin 4.5:1, büyük metin 3:1 altına düşmez.
  **Kaynak:** axe-core `color-contrast-evaluate.js`; Lighthouse `color-contrast`. **Token önerisi:** `--tk-contrast-min: 4.5; --tk-contrast-large-min: 3 (WCAG AA)`. **Denetim:** çalışma anında axe `color-contrast`; Avalonia'da görsel ağaç yürüyüşü.
- **Kural:** Etkileşim yanıtı (INP) bütçe içinde kalır; bir olay işleyicisi ana iş parçacığını uzun görevle tutmaz.
  **Kaynak:** web.dev/articles/inp. **Token önerisi:** `--tk-inp-budget: 200ms (web.dev)`. **Denetim:** `web-vitals onINP` günlüğü; 50 ms üstü uzun görev.
- **Kural:** Düzen kayması (CLS) bütçe içinde; medya boyutu önceden bilinir, sonradan gelen içerik üstteki içeriği itmez.
  **Kaynak:** web.dev/articles/cls. **Token önerisi:** `--tk-cls-budget: 0.1 (web.dev)`. **Denetim:** `onCLS`; `<img>` genişlik/yükseklik ya da aspect-ratio taşır.
- **Kural:** Mutasyon isteği bütçeyi aşıyorsa yükleme göstergesi zorunludur.
  **Kaynak:** web-interface-guidelines. **Token önerisi:** `--tk-mutation-budget: 500ms (Vercel)`. **Denetim:** ağ günlüğü.
- **Kural:** Dokunma/tıklama hedefi en küçük ölçünün altına düşmez.
  **Kaynak:** axe `target-size`; Vercel. **Token önerisi:** `--tk-target-min: 24px masaüstü (WCAG 2.5.8)`. **Denetim:** axe `target-size` açıkça etkinleştirilir.
- **Kural:** `:hover` tanımlanan her seçicinin `:focus-visible` eşi vardır; `outline: none` yalnız yerine görünür halka konmuşsa.
  **Kaynak:** stylelint-a11y `selector-pseudo-class-focus`, `no-outline-none`. **Token önerisi:** -. **Denetim:** stylelint kuralı.
- **Kural:** Animasyon ya da geçiş taşıyan her stil dosyasında `prefers-reduced-motion` karşılığı vardır.
  **Kaynak:** stylelint-a11y `media-prefers-reduced-motion`. **Token önerisi:** -. **Denetim:** stylelint kuralı.
- **Kural:** `transition: all` yazılmaz.
  **Kaynak:** Vercel. **Token önerisi:** -. **Denetim:** `rg "transition:\s*all"` sıfır.
- **Kural:** `tabIndex` sıfırdan büyük olmaz, `autoFocus` kullanılmaz, tıklanabilir öğe klavye olayı taşır, yalnız simgeli düğme `aria-label` taşır.
  **Kaynak:** eslint-plugin-jsx-a11y. **Token önerisi:** -. **Denetim:** ESLint `error`.
- **Kural:** Metin içeriği yüklenirken iskelet, yalnız tipografik olmayan içerik için çark.
  **Kaynak:** Polaris loading. **Token önerisi:** -. **Denetim:** kod incelemesi.
- **Kural:** Hata metni ne olduğunu ve nasıl düzeleceğini söyler; boş ve hata ekranı bir sonraki adımı sunar.
  **Kaynak:** Vercel "no dead ends"; frontend-design. **Token önerisi:** -. **Denetim:** ekran görüntüsü.
- **Kural:** Uygulamada en çok iki yazı ailesi.
  **Kaynak:** frontend-design. **Token önerisi:** -. **Denetim:** `rg "font-family"` benzersiz sayısı.
- **Kural:** Uzun süren işlem iptal edilebilir.
  **Kaynak:** ui-ux-pro-max (düşük güven). **Token önerisi:** -. **Denetim:** ekran görüntüsü.

## Çelişkiler

- Rafın mevcut `contrast` tarayıcı kuralı rengi yalnız siyaha karşı ölçer ve paletteki rengi hiç ölçmez. Açık mavi dolgu üstüne koyu mavi yazı bu yüzden geçer. Kural adayı 1 bunu kökten değiştirir.
- Rauno "animasyon ≤200 ms" der, Atlassian giriş-çıkışa 150-400 ms verir; sayı token'a gider, kitap sınıfı yazar.

## Şablon Adayları

- `axe-core` (MPL-2.0) — yalnız denetim betiğine bağımlılık olarak, ürün koduna değil.
- `eslint-plugin-jsx-a11y` ve `stylelint-a11y` yapılandırma parçası (MIT).
