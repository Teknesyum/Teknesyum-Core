# Weizhena/Deep-Research-skills

- MIT · metin paketi (elle kopyalanan skill + ajan) · ★2125
- mekanizma: 20 SKILL.md (4 dil/araç varyantı × 5 skill: `research`, `research-deep`, `research-add-fields`, `research-add-items`, `research-report`), 1 ajan (`web-search-agent.md`) + modülleri, kanca 0, komut 0, MCP 0; tek Python bağımlılığı `pyyaml`
- sıradan turda bağlama: tek varyant kurulursa 5 açıklama ≈ 660 B ≈ 170 token (20 açıklamanın toplamı 2.646 B, dörde bölündü). Gövde 13.762 B yalnız tetiklenince okunur.
- premium: yok

## Ne yapar
İki fazlı araştırma iş akışı: önce genişletilebilir taslak üretilir, sonra derin inceleme yapılır; her aşamada insan onayı beklenir. Arama işi ayrı bir alt ajana verilir, ana bağlam şişmez. RhinoInsight makalesinden esinlenmiş.

## Core'a alınacak
- kitap: iki fazlı araştırma yönergesi — taslak sonra derinleşme, her fazda insan kapısı. Core'un piyasa taraması gibi işlerinde doğrudan kullanılır.
- fikir: aramayı alt ajana verip ana bağlama yalnız sonucu almak — Core'un "geniş aramayı Explore'a ver" kuralının somut şablonu.
- fikir: skill'in dört varyantı ayrı klasörde tutulup kurulumda biri seçiliyor; Core'un dil ikizleri için ucuz düzen.

## Karar
Fikir notu — mekanizma skill + ajan kurulumu, Core bunu kurmaz; iki fazlı yönerge metni rafa alınabilir.
