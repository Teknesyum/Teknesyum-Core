# ReflexioAI/claude-smart

- Apache-2.0 · plugin (npx kurucu, Claude Code + Codex + OpenCode) · ★775
- mekanizma: 18 kanca betiği 6 olayda (Setup, SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, Stop, SessionEnd) · 11 komut · 0 ajan · 19 skill
- sıradan turda bağlama: skill açıklamaları 6.0 KB (~1.5 bin token, `awk /^description:/ | wc -c`); ayrıca UserPromptSubmit her turda arka uç servisine sorup ilgili öğrenimleri enjekte eder — sıradan tur sıfır değil.
- premium: var — "Managed Reflexio" bulut kipi (paylaşımlı durum, kimlik doğrulama, yerel arka uç yok); yerel kip ücretsiz ve `~/.reflexio/` altında.

## Ne yapar
Düzeltmeleri ve işe yarayan yolları yakalayıp kalıcı skill'e çevirir: repoya özel kurallar proje skill'i, genel örüntüler paylaşılan skill olur. Arka planda sürekli bir servis (`backend-service.sh`) çalıştırır, semantik arama yapar; claude-mem'e karşı ölçüm raporu (`EXPERIMENT.md`) yayımlar.

## Core'a alınacak
- **fikir**: kendi mekanizmasını rakibiyle ölçüp `EXPERIMENT.md` olarak yayımlaması — Core'un `bench/rapor.md` alışkanlığının pazarlama karşılığı, README'de tek satır iddia yerine ölçüm bağlantısı.
- **fikir**: aynı eklentinin üç barındırıcıya (`hooks.json` + `codex-hooks.json`) tek kaynaktan üretilmesi; Core ileride Codex'e bakarsa kanca tanımını çoğaltmadan çevirme deseni hazır.
- hiç (mekanizma olarak): kalıcı arka uç servisi + her turda enjeksiyon, Core'un sıfır-token ilkesinin tam zıddı.

## Karar
Fikir notu — öğrenme mekanizması Core ilkesine aykırı (sürekli servis, her tur enjeksiyon), yalnız ölçümü yayımlama alışkanlığı alınır.
