# shinpr/claude-code-workflows

- MIT · plugin (4 ayrı marketplace eklentisi) · ★679
- mekanizma: 121 skill, 91 ajan, 0 kanca, 0 MCP; 330 dosya; 4 plugin.json (dev-skills, dev-workflows, -frontend, -fullstack)
- sıradan turda bağlama: skill frontmatter 23.827 B + ajan frontmatter 38.788 B = 62,6 KB ≈ 15.600 token, hepsi kurulu eklentiye göre; ayrı eklentilere bölerek bunu düşürmeye çalışıyor (yalnız birini kur)
- premium: yok

## Ne yapar
Sorunu "keşif" değil "yakınsama" olarak tanımlıyor: Claude bir hesap kurtarma akışı tasarlarken gerçek ama alakasız bir tutarsızlık bulup işi oradan kaçırabiliyor. Reçeteler (`/recipe-implement`, `/recipe-design`, `/recipe-review`) onaylanmış sonuca kilitliyor; kapsam onaylandıktan sonra rutin kararları sormuyor.

## Core'a alınacak
- kitap: "yakınsama sorunu" tanımı ve maliyet kapısı — "iş akışı ajan çağrısı ve artefakt ekler, bu maliyeti hak etmeli; ne zaman kullanılır" listesi. RULES.md'deki "önce fiyatla" kuralının iş akışı düzeyindeki karşılığı.
- fikir: eklentiyi hedefe göre bölme (backend / frontend / fullstack) — 15,6 KB frontmatter'ı kullanıcı başına üçe bölmenin tek yolu; Core'un raf ayrımıyla aynı mantık.
- hayır: 91 ajan + 121 skill; Core hiçbir şeyi ajan/skill olarak kurmuyor.

## Karar
Fikir notu — 15,6k token sabit gider ilkeye aykırı, ama "yakınsama" çerçevesi ve iş akışını fiyatlama listesi rafa yazılacak kadar net.
