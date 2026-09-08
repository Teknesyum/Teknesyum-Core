# leeguooooo/claude-code-usage-bar

- MIT · plugin + PyPI CLI (`cs`) · ★365
- mekanizma: 0 kanca, 6 komut (statusbar, -doctor, -preview, -reset, -style, -theme), 0 ajan, 1 skill, 0 MCP
- sıradan turda bağlama: ~1,1 KB / ~280 token — tek skill açıklaması 1030 karakter (üç dilde anahtar kelime yığını), komut adları ayrıca listeleniyor; SKILL.md gövdesi 11 KB, yalnız çağrılınca
- premium: yok

## Ne yapar
Statusline'a resmî 5 saat / 7 gün kota çubuklarını, sıfırlanma sayacını, modeli, bağlam doluluğunu ve prompt-cache tazeliğini basar. 3 stil × 9 tema, isteğe bağlı maliyet ve git alanları; macOS'ta ayrıca masaüstü HUD. Render ~2,4 ms, arka planda kalıcı iki işçi süreç.

## Core'a alınacak
- fikir: prompt-cache geri sayımı (`cache 4m23s`) — bir sonraki turun tam fiyata mı düşeceğini gösterir; Core'un statusline'ı maliyet gösteriyor ama cache yaşını göstermiyor.
- fikir: kota projeksiyonu (`→NN%`, tükenme ETA'sı) — Core'un bench harcama disiplinine doğrudan yarar.
- hiç: skill açıklamasını üç dilde anahtar kelime listesine çevirme yaklaşımı — 1030 karakteri her turda ödemek Core ilkesine aykırı, karşı örnek olarak not.

## Karar
Fikir notu — statusline zaten Core'da var; alınacak olan iki alan (cache yaşı, tükenme ETA'sı), kod değil.
