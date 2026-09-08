# GaoSSR/best-claude-hud

- Apache-2.0 · CLI (npm, önceden derlenmiş Rust ikili) · ★762
- mekanizma: statusline programı; kanca 0, komut 0, ajan 0, skill 0, MCP 0
- sıradan turda bağlama: 0 — statusline çıktısını model görmez, yalnız kullanıcı görür (Core'un kendi statusline'ıyla aynı sözleşme)
- premium: yok

## Ne yapar
Claude Code'un resmî `statusLine` JSON verisini okuyup terminale tek satır HUD basıyor: model ve canlı akıl yürütme seviyesi, başlangıç dizini (geçici cwd değişimlerinde kaymıyor), git dalı/kirlilik/ahead-behind, bağlam penceresi kullanımı (resmî alan yoksa canlı transkriptten geri düşüyor), isteğe bağlı kullanım/limit/maliyet segmentleri. `--setup` ile ayarı kendi yazıyor.

## Core'a alınacak
- **fikir**: bağlam penceresi kullanımını resmî `statusLine` alanından okuma, alan sıfır/eksikse transkriptten hesaplama. Core'un statusline'ı da aynı veriye bakıyor; geri düşme mekanizması eksikse alınır.
- **fikir**: "başlangıç dizini" segmenti — cwd değişse de sabit kalan proje kökü. Core'un AGENTS.md'sinde geçen "oturum üst klasörde açılırsa statusline proje kökünü bekler" sorununun tam çözümü.
- **hiç**: Rust ikilisi ve npm dağıtımı Core'a girmez.

## Karar
Fikir notu — iki statusline davranışı (bağlam geri düşmesi, sabit proje kökü) Core'un statusline'ına alınabilir.
