# Nutlope/hallmark

- MIT · kurulum biçimi: metin paketi (tek skill klasörü) · ★28284
- mekanizma: 1 SKILL.md, 0 kanca, 0 komut, 0 ajan, 0 MCP; yanında 106 dosyalık `references/` (859 KB)
- sıradan turda bağlama: yalnız frontmatter `description` (277 B, ~70 token). Gövde 68018 B (~17k token) sadece etkinleşince; `references/` istenince
- premium: yok (Together AI imzalı, ücretli katman yok)

## Ne yapar
Yapay zekâ ürünü gibi görünen arayüzü reddeden bir tasarım paketi. 21 tema, 4 fiil (varsayılan / `audit` / `redesign` / `study`), çıktı teslim edilmeden önce 58 kapılı bir "slop testi" ve altı eksende ön-eleştiri. Gövde büyük ama boşta hiçbir maliyeti yok: tek skill + yanına yığılmış pasif referans kitaplığı.

## Core'a alınacak
- **Kitap — teslim öncesi kapı listesi.** `references/slop-test.md`: her yanıtı "hayır" olması gereken kapılar + önce çalıştırılan 6 eksenli öz-eleştiri (herhangi bir eksende <3 ise revizyon turu, üçüncü tur brief'in yanlış olduğunun işareti). Alan tasarım ama iskelet alandan bağımsız; Core'un kendi teslim kapısı için doğrudan uyarlanır.
- **Fikir — 1 skill + 106 pasif referans.** 859 KB'lik bilgi, boşta 70 token. Core'un "raf" ilkesinin ★28k'lık doğrulaması; raf içi dosya bölme ölçüsü (kapılar / tarifler / temalar ayrı dosya) buradan alınabilir.
- **Kitap — çıktı sözleşmesi.** `references/contract.md`: mevcut global stylesheet **append-only**, token'lar tek yerde ve semantik adla. `teknesyum-ui` kurulana kadar geçici bir zemin.

## Karar
Al — kapı listesi ve ön-eleştiri iskeleti raf olarak alınabilir, üstelik mimarisi Core'un ilkesiyle birebir.
