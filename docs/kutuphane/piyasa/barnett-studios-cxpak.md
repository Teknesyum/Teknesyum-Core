# Barnett-Studios/cxpak

- MIT OR Apache-2.0 · CLI (Rust, cargo/brew/Docker) + plugin + MCP · ★27
- mekanizma: 0 kanca, 4 komut (`clean`, `diff`, `overview`, `trace`), 0 ajan, 3 skill, 1 MCP sunucu (`plugin/.mcp.json`, `lib/ensure-cxpak-serve`)
- sıradan turda bağlama: CLAUDE.md yok, kanca yok. Yüklü kalan yalnız 3 skill açıklaması, toplam 519 B ≈ ~130 token (frontmatter `description` satırları sayıldı). MCP kurulduysa araç tanımları eklenir; `setup` skill'i MCP'yi ancak istenince bağlıyor.
- premium: yok

## Ne yapar

43 dili tree-sitter ile indeksleyip yazılı bağımlılık grafiği kuruyor, sonra token bütçesine sığan "brifing paketi" üretiyor: mimari, gelenekler, risk profili, veri katmanı. Slogan "token yerine CPU harcar". `cxpak visual` tek dosyalık, dış varlık istemeyen, çevrimdışı çalışan bir D3 panosu üretiyor; her sayı gerçek bir hesaba geri izleniyor.

## Core'a alınacak

- **fikir**: doğrudan Core'un "angarya işte önce deterministik araç ara" kuralının ürünleşmiş hâli. `map.js`'in yaptığı import haritasının bir üst basamağı; `graphify` yerine ya da yanında değerlendirilebilir.
- **betik**: `cxpak diff` — değişen dosyaların bağımlılık komşuluğunu token bütçesiyle çıkarıyor. Core'da `map.js .` çıktısını diff'e daraltan pasif bir kip aynı işi görür.
- **fikir**: 3 skill × ~130 token karşılığında tüm depo bilgisi — kademeli açılımın en ucuz örneklerinden; ölçü Core'un kendi rakamlarıyla karşılaştırılabilir.

## Karar

fikir notu — Rust CLI kurulumu Core'un kapsamı dışında, ama diff'e daraltılmış bağımlılık paketi fikri `map.js` için doğrudan uygulanabilir.
