# nilbuild/claude-statusline

- MIT · CLI (npx tek komut, `~/.claude/statusline.sh` yazıyor) · ★1390
- mekanizma: 2 dosya — `bin/statusline.sh` (13260 B) ve `bin/install.js` (4700 B); 0 kanca, 0 komut, 0 skill, 0 ajan, 0 MCP
- sıradan turda bağlama: **0 token** — statusline çıktısı modele hiç gitmiyor, yalnız kullanıcı görüyor. Dilim 39'da ölçtüğüm tek gerçek sıfır
- premium: yok

## Ne yapar
Claude Code statusline'ını kuruyor: kalan limit (curl ile çekiliyor), dizin, git dalı. Kurulumda eski statusline'ı yedekliyor, `--uninstall` yedeği geri koyuyor. jq, curl, git gerektiriyor.

## Core'a alınacak
- **fikir**: **kur/geri-al simetrisi** — kurulum eski ayarı yedekliyor, kaldırma yedeği geri koyuyor. Core'un `setup.js`'i makine ayarı yapıyor; aynı yedek/geri-al davranışı orada yok.
- **fikir**: limit göstergesi — kalan kullanım oranını statusline'a koymak; Core'un durum satırı zaten modele görünmez, oraya maliyet bilgisi eklemek bedava.
- **hiç**: betiğin kendisi alınmaz (bash + jq; Core'un ortamı PowerShell/Node).

## Karar
Fikir notu — sıfır bağlam maliyetiyle Core ilkesine en uygun örnek, ama işlevi Core'un mevcut statusline'ıyla örtüşüyor; yalnız yedek/geri-al ve limit göstergesi alınır.
