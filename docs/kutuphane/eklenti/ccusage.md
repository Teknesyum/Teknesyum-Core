# ryoppippi/ccusage

- lisans: MIT
- kurulum biçimi: CLI (npm/bun paketi `ccusage`; statusline'a `settings.json` üzerinden komut olarak bağlanıyor)
- mekanizma: plugin/kanca yok. Node CLI (`apps/ccusage/src/cli.js`) + Rust çekirdek (`rust/crates/ccusage*`). Alt komutlar: `daily`, `session`, `blocks`, `statusline` vb. Claude Code entegrasyonu yalnız `statusLine.command` alanına `bunx/npx ccusage statusline` yazmaktan ibaret — Core'daki hook mimarisiyle aynı düzlemde değil.
- sıradan turda bağlama: 0 — CLAUDE.md yok (boş dosya), yalnız 55 satırlık AGENTS.md (repo geliştirme notu, kullanıcıya kurulmuyor). Kullanıcı tarafında hiçbir zaman-yüklü metin yok; statusline komutu her istemde bir kez çalışıp tek satır stdout üretiyor (~50-100 token, Core'un statusline'ı gibi modele girmiyor).
- premium: yok. Tamamen açık kaynak, sponsorluk linki var, satılan katman yok.

## Ne yapar
Yerel `~/.claude/projects/**/*.jsonl` (ve diğer ajan CLI'ları) transcript dosyalarını tarayıp token/maliyet raporu çıkarır (daily/session/blocks). `statusline` komutu aynı veriyi anlık okuyup güncel oturum maliyeti, günlük toplam, 5 saatlik blok ve "burn rate"i tek satırda basar. Fiyatlandırmayı LiteLLM'in `model_prices_and_context_window.json` dosyasından (varsayılan: yerel önbellek, `--no-offline` ile canlı çekim) alıp token sayılarıyla çarpar.

## Kullanıcıya nasıl hissettirir
Tamamen statusline'da tek satır: emoji + oturum maliyeti + günlük toplam + blok kalan süresi + burn-rate göstergesi. Sessiz, sohbete hiç karışmıyor; yalnız `ccusage <komut>` çağrıldığında terminale tablo basıyor.

## Core'a alınacak
- fikir: JSONL'den maliyet hesaplama yöntemi (mesaj başı model+usage alanlarını LiteLLM fiyat tablosuyla çarpıp toplama) — Core'un kendi maliyet/gain ölçümü için model referansı olabilir.
- fikir: yerel disk önbellekli + `--no-offline` opsiyonel canlı fiyat çekimi deseni — token fiyatları güncel kalsın, ama varsayılan hızlı/offline kalsın.
- hiç: statusline entegrasyonu doğrudan taşınmaz — Core zaten kendi statusline'ını rtk/plugin üzerinden çözmüş, ayrı bir dış CLI bağımlılığı eklemez.

## Ölçülecek
- Core'un kendi statusline maliyet hesaplaması ile ccusage'ın LiteLLM tablo yöntemi karşılaştırılıp fark varsa (özellikle cache-read/write fiyatlandırması) not edilebilir.

## Karar
fikir notu — kod/kanca alınmaz, yalnız JSONL+LiteLLM fiyat tablosu maliyet hesabı yöntemi referans olarak kaydedildi.
