# educlopez/ui-craft

- MIT · plugin + CLI + MCP · ★318
- mekanizma: 0 kanca, 26 komut, 3 ajan, 4 üst skill (ağaçta 217 `SKILL.md`, gerisi alt referans), 1 MCP sunucu (`ui-craft-mcp`)
- sıradan turda bağlama: CLAUDE.md yok, AGENTS.md 721 B (yalnız depo içi friction-log politikası, kurulumda gelmiyor), kanca yok. Yüklü kalan: 4 skill açıklaması 1294 B ≈ ~320 token + 26 komut adı. MCP kurulursa araç tanımları ayrıca eklenir.
- premium: yok; ücretsiz, satılan bir katman yok

## Ne yapar

AI kodlama ajanına eksik olan tasarım bilgisini veren bir "design engineering" paketi: anti-slop UI kuralları, tema ön ayarları, 10 maddelik kabul çıtası, Nielsen sezgiselleri × 6 tasarım yasası ile puanlanabilir kritik. Dört basamaklı merdiven kuruyor — sor / yönlendir (`/craft`, `/critique`) / kalıcılaştır (`/brief`, `/tokens`) / zorla (CI kapısı, 0-100 skor). Yığından bağımsız.

## Core'a alınacak

- **fikir**: "merdiven" modeli — basamak 0'da kurulum dışında hiçbir şey yapmadan fayda, üst basamaklar istenince. Core'un "sıfır token, istenince oku" ilkesinin ürünleşmiş hâli; README'de nasıl anlatıldığı örnek alınabilir.
- **kitap**: 592 KB'lik skill ağacından 4 açıklamanın yüklü kalması — kademeli açılım örneği; arayüz rafı açılırsa kabul çıtası (10 madde) ve puanlama şeması bölüm olur.
- **fikir**: `.uicraftrc.json` + `/tokens` ile proje token'larını okuyup renk uydurmayı engelliyor; teknesyum-ui kurulmadan önce aynı fikir Core'da kullanılabilir.

## Karar

fikir notu — arayüz standardı ayrı depoda olduğu için içerik alınamaz, ama kademeli açılım ve renk uydurmama kapısı doğrudan Core ilkeleriyle örtüşüyor.
