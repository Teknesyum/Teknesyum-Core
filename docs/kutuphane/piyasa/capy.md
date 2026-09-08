# serpro69/capy

- ELv2 (NOASSERTION) · MCP sunucusu + Claude Code eklentisi (Go) · ★10
- mekanizma: 10 MCP aracı, kanca olayları `PreToolUse` yönlendirmesi + rehberlik + güvenlik + alt ajan enjeksiyonu (`internal/hook`), `.mcp.json` tek sunucu; komut/ajan/skill yok
- sıradan turda bağlama: MCP araç tanımları her turda yüklü (10 araç ≈ 2-4 KB, ~500-1000 token) + kancanın enjekte ettiği yönlendirme metni. Ayrıca kendi `CLAUDE.md`'si dört dosyayı `@` ile içeri alıyor (AGENTS.md 5725 B tek başına ≈ 1430 token).
- premium: yok, ama ELv2 ticari kullanımı kısıtlar.

## Ne yapar
Ham araç çıktısını bağlam penceresine sokmadan yalıtılmış alt süreçte tutar, SQLite FTS5 + BM25'e
indeksler; model gerekeni `capy_search` ile ister. Geçmiş oturum dökümleri şifreli bir kasada
arşivlenir, Claude Code'un 30 günlük silmesinden sonra da aranabilir.

## Core'a alınacak
- fikir: ölçüm dürüstlüğü — depo "bayt tasarrufu gösteriş metriğidir" deyip NIAH ile olgu kurtarma ölçüyor (sıkıştırma %49,8, olgu kurtarma 0,983). Core'un `bench/` raporu aynı ayrımı yapabilir.
- fikir: büyük araç çıktısını bağlama değil diske yazıp yalnız yolu/özeti döndürme — Core'un "sıradan turda sıfır token" ilkesinin araç çıktısı tarafındaki karşılığı.
- hiç: MCP sunucusu, şifreli SQLite ve zorunlu anahtarlar Core'un pasif ilkesini bozar.

## Karar
Fikir notu — mekanizması ağır ve her turda araç tanımı yüklüyor; alınacak olan ölçüm yöntemi ve çıktı-diske-yaz kalıbı.
