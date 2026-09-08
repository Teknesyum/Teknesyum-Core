# nextlevelbuilder/ui-ux-pro-max-skill

- MIT · plugin + npm CLI · ★126034
- mekanizma: 0 kanca · 0 komut · 0 ajan · 7 skill · 0 MCP · asıl motor `search.py` (BM25 + regex melez arama) ve CSV veri tabanı
- sıradan turda bağlama: yalnız 7 SKILL.md frontmatter açıklaması, ~2,5 KB / ~650 token; gövde 61 KB ve veri 3,7 MB (18 CSV: styles, colors, typography, ux-guidelines, icons, charts, 22 stack) hiç yüklenmiyor, betikle sorgulanıyor
- premium: yok; PayPal bağışı ve uupm.cc sitesi

## Ne yapar
UI/UX kararlarını (79 stil, 192 palet, 74 font çifti, 119 UX kuralı, 25 grafik türü, 22 teknoloji yığını) yerel CSV'lerde tutar; ajan bunları okumaz, `python3 search.py "<sorgu>" --domain style` diye sorgular ve yalnız dönen satırlar bağlama girer.

## Core'a alınacak
- **pasif betik** — kütüphaneye BM25 arayıcı: 14 raf markdown'ını baştan sona okutmak yerine `kutuphane.js ara "<sorgu>"` ile yalnız eşleşen bölümü döndürmek. Core'un raf mantığının tam ölçekli kanıtı: 3,7 MB veri, 650 token bağlam.
- **fikir** — bilgiyi markdown yerine CSV/satır biçiminde tutma; satır başına bir olgu, arama ucuz, kısmi dönüş doğal.
- **fikir** — `data-provenance.json`: her verinin kaynağı ve tarihi ayrı dosyada. Core raflarında "bu bilgi nereden, ne zaman" izi yok.

## Karar
Al — Core'un raf ilkesinin en iyi uygulanmış örneği; arayıcı betik fikri doğrudan `kutuphane.js`e girer.
