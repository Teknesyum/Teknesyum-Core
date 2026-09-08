# labzink/cc-probeline

- MIT · plugin (marketplace) + Go ikili · ★11
- mekanizma: 1 kanca (SessionStart/startup), 3 komut, 0 ajan, 0 skill, 0 MCP; statusline ayrı süreç
- sıradan turda bağlama: 0 KB / ~0 token — depoda `CLAUDE.md` yok, skill yok; tek kanca `hooks/hooks.json` içinde `command -v cc-probeline >/dev/null || printf ...` yani ikili kuruluysa hiçbir şey basmıyor
- premium: yok; ücretsiz, ağ çağrısı yok, günde bir fiyat tablosu tazeleme opsiyonel

## Ne yapar
Diskteki oturum günlüğünü okuyup her turu, her alt ajanı ve her önbellek yeniden kurulumunu
fiyatlandıran bir statusline. Toplamlar Claude Code'dan, tur kırılımı yerel fiyat tablosundan
hesaplanıyor; API anahtarı ve telemetri istemiyor.

## Core'a alınacak
- **fikir — koşullu tek satır kanca**: `hooks.json` içinde kabuk koşulu (`command -v X || printf`)
  ile ikili yoksa tek satır, varsa sıfır token. Core'un "eşikte bir kez konuş" ilkesinin en ucuz
  biçimi; JS süreci bile başlatmıyor.
- **fikir — `internal/hint` deseni**: uyarılar iki sınıfa ayrılmış: geçici (2 dk pencere, en yeni
  kazanır) ve kalıcı (config hatası, çözülene dek). Core'un eşik uyarılarında "bir kez sordum,
  bir daha sormam" yerine kullanılabilecek olgun bir kural.
- **fikir — fiyat tablosu dosyada**: `assets/prices.json` + günlük tazeleme; Core'un maliyet
  sayımı modele fiyat sordurmadan aynı yolu kullanabilir.

## Karar
Fikir notu — ürün Go ikilisi, alınmaz; ama koşullu-kanca ve iki sınıflı uyarı deseni Core'un
ilkesiyle birebir örtüşüyor.
