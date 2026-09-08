# anthropics/claude-plugins-official

- lisans: Apache 2.0
- kurulum biçimi: plugin (marketplace üzerinden `/plugin install`)
- mekanizma: depo 40+ birinci-taraf eklenti barındırıyor, 6'sında hooks.json var. Seçilen 5:
  claude-security (UserPromptExpansion banner + PostToolUse/PostToolUseFailure metrik, koşullu `if` ile yalnız kendi python scriptini yakalıyor), explanatory-output-style (SessionStart, sabit metin basar), learning-output-style (SessionStart, daha uzun sabit metin), ralph-loop (Stop, döngü state dosyası varsa çıkışı engeller), security-guidance (SessionStart + UserPromptSubmit + PostToolUse(Edit/Write/git commit/push/gt) + Stop, asyncRewake ile arka planda LLM incelemesi). Komut/ajan sayısı eklentiye göre değişir: security-guidance 0 komut/0 ajan salt kanca; hookify 4 komut + 1 ajan; claude-security 7 ajan + 1 workflow.js; ralph-loop 3 komut.
- sıradan turda bağlama: hooks.json'ların kendisi çalışma anında okunmuyor, hook stdout'u giriyor. explanatory/learning SessionStart'ta ~1-2 KB (≈300-500 token) sabit metni her oturum başında ekliyor — sıfır değil, oturum başına bir kere. security-guidance SessionStart'ta ensure_agent_sdk.py çalıştırıyor (kurulum/venv kontrolü, çıktısı genelde sessiz) ve UserPromptSubmit'te her turda security_reminder_hook.py çalışıyor — bu turda ekstra çıktı üretmiyorsa 0, üretiyorsa değişken. ralph-loop ve claude-security'nin kancaları koşullu/duruma bağlı (state dosyası yoksa ya da `if` eşleşmiyorsa hook hemen exit 0, bağlama bir şey eklemiyor).
- premium: yok — depo tamamen ücretsiz birinci ve üçüncü taraf eklenti kataloğu; marketplace.json'da fiyat/tier alanı yok.

## Ne yapar
Anthropic'in resmi eklenti pazarı: 500+ girişi tek `marketplace.json`'da listeleyip `/plugin install` ile kurulum sağlıyor. Kendi içindeki birkaç eklenti (security-guidance, claude-security, hookify, ralph-loop, output-style'lar) kanca mekanizmasının farklı desenlerini örnekliyor: sabit-metin enjeksiyonu, koşullu asenkron arka plan incelemesi, döngü kilidi. Kurulum sırası değişmiyor — README `/plugin install {isim}@claude-plugins-official` diyor.

## Kullanıcıya nasıl hissettirir
explanatory/learning sessiz şekilde SessionStart'ta ton değiştiriyor, banner yok. security-guidance ve claude-security bulgu bulunca Stop/PostToolUse sonrası "rewake" ile arka planda konuşuyor — normal turda görünmüyor, yalnız bulgu varsa. ralph-loop döngü aktifken çıkışı engelleyip kendi state dosyasından devam ediyor.

## Core'a alınacak
- fikir: security-guidance'ın `asyncRewake` + `if` (komut deseni eşleşince tetikle) deseni — Core'un "eşikte bir kez konuş" ilkesiyle örtüşüyor, PostToolUse'u her seferinde değil yalnız `git commit`/`git push` gibi anlarda konuşturmak için örnek alınabilir.
- fikir: ralph-loop'un Stop hook'unda proje-scoped state dosyası + session_id izolasyonu — çoklu oturum çakışmasını çözen temiz bir desen, handoff.md mekanizmasına referans olabilir.
- hiç: explanatory/learning-output-style'daki sabit metin enjeksiyonu Core'un pasif kütüphane ilkesine ters (her oturumda zorla bağlam yükler), alınmaz.

## Ölçülecek
- security-guidance deseni denenirse: `if` filtresiz vs filtreli PostToolUse'un ortalama tur başı ek token'ı bench ile ölçülür.
- ralph-loop deseni denenirse: state dosyası varken/yokken Stop hook'un çalışma süresi (ms) ölçülür.

## Karar
fikir notu — mekanizmalar (asyncRewake+if, session-scoped state) referans değerinde ama doğrudan alınacak kod/kitap yok.
