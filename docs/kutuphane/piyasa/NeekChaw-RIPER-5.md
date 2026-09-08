# NeekChaw/RIPER-5

- lisans belirtilmemiş · metin paketi (kopyala-yapıştır prompt/kural) · ★2624
- mekanizma: 0 kanca, 0 komut, 0 ajan, 0 skill; iki klasör metin — `RIPER-5/` (protokol, EN 15.7 KB + CN) ve `Claude Code/` (7 ayrı prompt: iş akışı, git commit, derin düşünme, gereksinim toplama)
- sıradan turda bağlama: kurulum yok; kullanıcı metni Cursor kuralı ya da CLAUDE.md olarak yapıştırırsa ne kadarını yapıştırdıysa o. Protokolün tamamı ~15.7 KB (~3900 token).
- premium: yok

## Ne yapar
RIPER-5, modelin izinsiz kod değiştirmesini engellemeyi hedefleyen beş modlu bir davranış protokolü (Research, Innovate, Plan, Execute, Review): her turda hangi moddasın diye ilan ettirir, moddan çıkmayı yasaklar.

## Core'a alınacak
- **fikir**: mod ilanı — her yanıtın başında hangi aşamada olunduğunu tek satırla söyletmek. Core'un plan adımı ipucuyla akraba, ama ilan modelden gelir, kancadan değil.
- **hiç**: makine yok; 3900 tokenlik protokol metni Core'un sıradan tur bütçesiyle bağdaşmaz.

## Karar
Hayır — kurulabilir bir mekanizma yok, yalnız uzun prompt metni; Core'un plan ipucu aynı işi tek satırla yapıyor.
