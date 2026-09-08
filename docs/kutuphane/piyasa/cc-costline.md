# Ventuss-OvO/cc-costline

- lisans yok (LICENSE dosyası yok — kullanılamaz) · CLI (`npm i -g cc-costline`) · ★28
- mekanizma: 0 komut, 0 ajan, 0 skill, 0 MCP; `install` `~/.claude/settings.json`'a
  statusline komutu + oturum-sonu kancaları yazıyor. Kaynak 6 dosya:
  `cli.ts statusline.ts refresh.ts collector.ts calculator.ts cache.ts`
- sıradan turda bağlama: 0 KB — depoda CLAUDE.md (8,2 KB) ve AGENTS.md (2,7 KB) var ama
  bunlar kendi geliştirmesi için, kurulumla kullanıcıya geçmiyor; statusline çıktısı
  modele gitmiyor.
- premium: yok (ccclub liderlik tablosu isteğe bağlı)

## Ne yapar

Statusline'a maliyet, 5 saatlik ve 7 günlük kota yüzdesi, 7/30 günlük dönem harcaması ve
liderlik sırası ekliyor. Maliyeti `~/.claude/projects/**/*.jsonl` dosyalarını artımlı
tarayarak hesaplıyor, ağır işi kilit dosyası arkasında ayrılmış bir arka plan sürecine
atıyor, `render` yalnız önbellek okuyor.

## Core'a alınacak

- fikir: artımlı jsonl tarama + kilitli arka plan yenileme. Core bench maliyetini elle
  topluyor; aynı desen 50 $ eşiğini otomatik ölçebilir.
- fikir: kota yüzdesini stdin'den okuyup yoksa API'ye düşme sırası — ölçüm ucuz kalıyor.

## Karar

Hayır — lisans yok, kod alınamaz; iki desen fikir notu olarak kalır.
