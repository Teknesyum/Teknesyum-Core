# gastownhall/beads

- lisans: MIT
- kurulum biçimi: plugin (+ ayrı CLI ikilisi `bd`, ayrıca ayrı bir Python paketi olarak MCP sunucusu)
- mekanizma: 2 kanca (SessionStart, PreCompact — ikisi de `bd prime` çalıştırır); 28 komut (`/beads:create`, `ready`, `close`, `dep`, `sync`...), 1 ajan (task-agent.md), 1 skill (beads)
- sıradan turda bağlama: SKILL.md frontmatter description ~500 karakter (~130 token, her zaman yüklü). Asıl yük hook çıktısı: `bd prime` her SessionStart ve her PreCompact'ta çalışır ve tam iş akışı rehberini + hafızaları basar — eşik yok, her turda konuşur (Core'un "eşikte bir kez konuş" ilkesinin tersi). Boyutu projeye göre değişken, `--memories-only` ile kısaltılabilir ama varsayılan kısılmamış.
- premium: yok; tamamen MIT, Dolt tabanlı depo yerel/ekip senkronu ücretsiz

## Ne yapar
Dolt destekli, bağımlılık grafiği olan bir görev takipçisi; sıkıştırma (compaction) sonrası bağlamı SessionStart/PreCompact kancalarıyla geri yükler. TodoWrite'ın oturum-ötesi hali: "2 hafta sonra lazım mı" testiyle bd/TodoWrite ayrımı yapıyor. Ayrı bir MCP sunucusu (`integrations/beads-mcp`, Python) ajanların `ready`/`claim`/`show` gibi araçları çağırmasına izin veriyor.

## Kullanıcıya nasıl hissettirir
Her oturum başında ve her sıkıştırmada sessizce değil, tam bir rehber metni basarak "hatırlatıyor" — statusline değil, doğrudan konuşma bağlamına yazıyor. Komutlar `bd` CLI'sini sarmalıyor, çıktı CLI'nin kendi biçimi.

## Core'a alınacak
- fikir: "sıkıştırma sonrası bağlam kaybı" sorununa PreCompact kancasıyla otomatik özet/hafıza enjeksiyonu — Core'da handoff.md elle yapılıyor, burada otomatik.
- kitap: bd/TodoWrite ayrım testi ("2 hafta sonra lazım mı") — roadmap disiplini kitabına küçük bir madde olabilir.
- Mekanizmanın geri kalanı (Dolt deposu, 28 komut, ayrı MCP sunucusu) Core'un kapsamı dışında; bunlar bağımsız bir issue-tracker ürünü.

## Ölçülecek
- PreCompact'ta otomatik bağlam enjeksiyonu Core'a girerse: eklenen token/tur ile mevcut elle-handoff'un token/tur karşılaştırması.

## Karar
fikir notu — otomatik sıkıştırma-sonrası hafıza enjeksiyonu fikri değerli ama mekanizmanın tamamı (Dolt, 28 komut, ayrı CLI ikilisi) Core'un "pasif kütüphane" ilkesine ağır; alınacaksa yalnız fikir düzeyinde.
