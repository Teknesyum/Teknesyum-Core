# headroomlabs-ai/headroom

- APACHE-2.0 · kurulum biçimi: CLI / kütüphane (pypi `headroom-ai`, npm `headroom-ai`) · ★70634
- mekanizma: 0 skill, 0 komut, 0 ajan; ajanın okuduğu her şeyi (araç çıktısı, log, RAG parçası, dosya, konuşma geçmişi) modele gitmeden önce sıkıştıran bir katman + kendi modeli (`kompress-v2-base`). MCP adı ilan edilmiş
- sıradan turda bağlama: Claude Code bağlamına hiçbir şey yazmıyor; ara katman olarak çalışıyor. README'nin kendi ölçüsü: 55957 token'lık istem → 24340 token
- premium: kod açık; barındırılan doküman/servis ve model tarafı şirket ürünü

## Ne yapar
Ajanın gördüğü metni modele ulaşmadan sıkıştırıyor; iddiası %20-55 daha az token ve kritik satırların (örnekte 67. maddedeki FATAL) bayt bayt korunması. Claude Code dahil birçok ajanla uyumluluk tablosu var.

## Core'a alınacak
- **Fikir — sıkıştırma değil, yüklememe.** Core'un ilkesi zaten "sıradan turda sıfır"; Headroom aynı sorunu ters uçtan, okunanı ezerek çözüyor. İki yaklaşımın kesişimi tek yerde: **araç çıktısı**. RTK'nın yaptığı iş bu; Headroom'un ölçüm biçimi (öncesi/sonrası token, korunması şart satırların bayt eşitliği testi) `bench/` için alınabilir.
- **Fikir — "kritik satır bayt bayt korunur" testi.** Sıkıştıran her katmanın kabul testi olmalı; Core'un RTK kullanımında böyle bir test yok.
- hiç (kurulacak bir şey yok)

## Karar
Fikir notu — Core'a kurulacak bir parçası yok; değeri, sıkıştırmayı ölçen kabul testi fikri.
