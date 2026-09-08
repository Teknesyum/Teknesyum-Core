# lucasrosati/claude-code-memory-setup

- MIT · metin paketi (rehber README) + 2 pasif betik · ★968
- mekanizma: 0 kanca / 0 eklenti / 0 MCP; `scripts/claude_to_obsidian.py` (11.549 B) ve `sync_claude_obsidian.sh`; kurulum sonucu bir Obsidian kasası, bir `CLAUDE.md` ve `/save` `/resume` komutları
- sıradan turda bağlama: deponun kendisi 0 B; kurulum kullanıcının global `CLAUDE.md`sine kasa yolu + kural bloğu ekliyor, rehber README 23.820 B (~6k token, wc -c) ama modele girmez
- premium: yok (Obsidian ve Graphify ücretsiz, AST modunda 0 token)

## Ne yapar
İki ayrı sorunu ayrı katmana bölüyor: oturumlar arası unutkanlığı Obsidian Zettelkasten kasası (kararlar, "ne kararlaştırıldı"), her oturumda kod tabanını yeniden okumayı Graphify bilgi grafiği (yapı, "kod nasıl kurulu") çözüyor. Sohbet geçmişi Python betiğiyle kasaya aktarılıyor.

## Core'a alınacak
- kitap: ölçülü karşılaştırma tablosu — 126 TS dosyalı projede 332 düğüm, 258 kenar, 172 KB graph.json; ~40 dosya yeniden okuma ~20k token yerine tek grafik sorgusu ~280 token. Core'un `graphify` alışkanlığını rakama bağlayan hazır kanıt.
- kitap: "beyan edilen bellek / yapısal harita" ayrımı ve tek kasa kuralı (proje başına kasa bilgiyi parçalar) — Core'un `docs/` + `map.js` ayrımıyla birebir örtüşüyor.
- fikir: sohbet dökümünü atomik nota çeviren pasif aktarım betiği; Core'un `docs/netlestirme/` kayıtları için aynı boru hattı.

## Karar
Al — kurulum turda ek yük getirmiyor (grafik sorgusu ~280 token), Core'un zaten kullandığı graphify'ı ölçülü bir kitap ve aktarım betiğiyle tamamlıyor.
