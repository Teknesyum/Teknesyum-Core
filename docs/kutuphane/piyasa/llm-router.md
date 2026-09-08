# ypollak2/llm-router

- MIT · CLI (pip `llm-routing`, ayrıca MCP kipi) · ★77
- mekanizma: 0 kanca · 0 skill · 0 ajan; Claude Code, Cursor, Codex, Gemini CLI önüne geçen tek yönlendirici. API anahtarı istemiyor, çalışma biçimini değiştirmiyor.
- sıradan turda bağlama: 0 — Claude Code'a metin enjekte etmiyor, istemi model katmanına dağıtıyor.
- premium: yok (MIT), ama sattığı şey abonelik kotası tasarrufu

## Ne yapar
Rutin istemleri ücretsiz/ucuz modellere, ağır olanları abonelik modeline yönlendiriyor; amaç Claude Pro/Max kotasını günün sonuna saklamak. Kurulum tek satır, mevcut akışta değişiklik yok.

## Core'a alınacak
- fikir: istem zorluğuna göre katman seçimi — Core'un bench koltukları (low/medium/high) zaten elle yapılan hâli; otomatik sınıflandırma notu.
- fikir: "kota ne zaman tükeniyor" ölçümü; Core'un maliyet altın kuralına statusline verisi olarak eklenebilir.

## Karar
Fikir notu — model yönlendirme Core'un alanı değil, ama istem zorluğuna göre katman seçimi ve kota ölçümü not edilecek iki fikir.
