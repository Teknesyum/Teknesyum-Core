# zilliztech/claude-context

- MIT · MCP sunucusu (+ VSCode ve Chrome eklentisi) · ★12504
- mekanizma: 0 kanca · 0 komut · 0 ajan · 0 skill · 1 MCP sunucusu (index/search araçları) · 4 paket (core, mcp, vscode-extension, chrome-extension)
- sıradan turda bağlama: kurulursa MCP araç şemaları kadar; deponun kendi CLAUDE.md'si 6317 B, AGENTS.md 9 B
- premium: yok, ama Zilliz Cloud (Milvus) ve OpenAI embedding anahtarı gerektiriyor — dış servise bağımlı

## Ne yapar
Kod tabanını vektör veritabanına gömüp (Milvus/Zilliz) anlamsal arama sunar; "tüm depoyu bağlam yapmak yerine ilgili parçayı getir" iddiası. Merkle ağacıyla artımlı yeniden indeksleme yapar.

## Core'a alınacak
- **fikir** — artımlı indeks: Merkle ağacı ile yalnız değişen dosyaları yeniden işleme. Core'un `map.js` import haritası her seferinde baştan tarıyor.
- **fikir** — "bağlamı büyütme, arama sonucu getir" ilkesinin ölçülmüş savunusu; Core'un raf mantığıyla aynı yön.
- hiç (üçüncü madde) — geri kalanı bulut veritabanı ve API anahtarı gerektirdiği için Core'a giremez.

## Karar
hayır — dış vektör veritabanı ve ücretli embedding zorunluluğu Core'un yerel, sıfır bağımlılık çizgisini bozar; yalnız artımlı indeks fikri not.
