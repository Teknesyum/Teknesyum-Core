# jnMetaCode/superpowers-zh

- MIT · plugin (Claude Code + 26 araç) · ★8026
- mekanizma: 1 kanca (SessionStart) · 0 komut · 20 skill · 0 ajan · 0 MCP
- sıradan turda bağlama: SessionStart kancası `using-superpowers/SKILL.md` dosyasının tamamını (4.446 B ≈ 1.100 token) `<EXTREMELY_IMPORTANT>` bloğu içinde enjekte ediyor; ayrıca 20 skill açıklaması toplam 5.235 B ≈ 1.300 token. Toplam ≈ 2.400 token, her oturumda.
- premium: yok; README ücretli kurs bağlantıları taşıyor.

## Ne yapar
Upstream superpowers'ın Çince sürümü: beyin fırtınası, TDD, sistematik hata ayıklama, plan yazma/yürütme, worktree, paralel ajan dağıtımı gibi 20 iş yöntemini skill olarak paketliyor. Kanca yalnız "skill'leri nasıl kullanacaksın" giriş metnini yüklüyor, gerisi Skill aracıyla isteğe bağlı açılıyor.

## Core'a alınacak
- pasif betik: `hooks/run-hook.cmd` — tek dosyada cmd/bash poliglot sarmalayıcı (`: << 'CMDBLOCK'`); Windows'ta Git Bash'i üç yerde arayıp bulamazsa sessizce 0 dönüyor. Core'un Windows kancaları için doğrudan alınabilir desen.
- kitap: kanca çıktı biçimi haritası — Claude Code `hookSpecificOutput.additionalContext`, Cursor `additional_context`, Copilot CLI üst düzey `additionalContext`; Claude Code ikisini de okuyup tekilleştirmediği için yalnız biri yazılmalı. Ölçülebilir, unutulunca çift bağlam maliyeti doğuruyor.
- fikir: iki kademeli yükleme (yalnız "nasıl kullanılır" girişi enjekte, gerisi talep üzerine) — Core'un raf mantığının aynısı, ama girişi bile enjekte etmemek Core'un daha ucuz sürümü.

## Karar
Al — yalnız `run-hook.cmd` deseni ve kanca çıktı biçimi kitabı; 2.400 token'lık oturum enjeksiyonu alınmaz.
