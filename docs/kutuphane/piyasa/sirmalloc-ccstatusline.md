# sirmalloc/ccstatusline

- MIT · CLI (npx `ccstatusline`, `settings.json` statusLine alanına takılır) · ★12803
- mekanizma: 0 kanca · 0 komut · 0 ajan · 0 skill · 0 MCP · 91 widget (`src/widgets/`), 2 hazır yapılandırma şablonu (`configTemplates/official-cc.json`, `personal-cc.json`)
- sıradan turda bağlama: 0 token — statusline çıktısı terminale basılır, modele gitmez. Yapılandırma bir TUI'den yapılır, konuşmaya hiç girmez.
- premium: yok.

## Ne yapar
Claude Code statusline'ını biçimlendirir: model, git dalı/SHA/PR/CI durumu, bağlam yüzdesi ve çubuğu, sıkıştırma sayacı, önbellek okuma/yazma ve isabet oranı, blok zamanlayıcı, haftalık kullanım. Powerline desteği, temalar, çok satır.

## Core'a alınacak
- fikir: `CompactionCounter`, `CacheHitRate`, `ContextPercentageUsable`, `BlockResetTimer` — Core'un statusline'ı sayıyor ama bu dördü yok; hepsi modele sıfır token'a mal olan ölçüm.
- pasif betik: `configTemplates/*.json` deseni — statusline yapılandırmasını kod değil veri olarak tutmak; Core'un `setup.js`'i aynısını yapabilir.
- kitap: widget listesi, "statusline'a ne konabilir" rafı olarak; 91 widget piyasadaki tam envanter.

## Karar
Al — Core'un statusline ilkesiyle birebir aynı ("durum statusline'da, model görmez"); ölçüm fikirleri sıfır token'a alınabilir.
