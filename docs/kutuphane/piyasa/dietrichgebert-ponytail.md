# DietrichGebert/ponytail

- MIT · plugin (Claude Code marketplace, npm) · ★131878
- mekanizma: 3 kanca (SessionStart, SubagentStart, UserPromptSubmit) · 6 komut · 6 skill · 0 ajan · 0 MCP
- sıradan turda bağlama: SessionStart kancası her oturumda 5.229 karakterlik kural metnini enjekte ediyor (`node -e` ile `getPonytailInstructions()` çıktısı ölçüldü, üç kipte de aynı) ≈ 1.300 token; ayrıca 6 skill açıklaması 2.907 B ≈ 700 token. Toplam ≈ 2.000 token, her oturumda, iş olsun olmasın.
- premium: yok; README'de ölçüm ve bağış bağlantısı var, ücretli katman yok.

## Ne yapar
"Tembel kıdemli geliştirici" kipi: her yanıtta en kısa çalışan çözümü dayatır. Çekirdeği bir "merdiven" — bu şey var olmalı mı, kod tabanında zaten var mı, stdlib yapıyor mu, platform yapıyor mu; ilk tutan basamakta dur. `ponytail:` yorumlarıyla bilerek ertelenen işleri bir borç defterine topluyor.

## Core'a alınacak
- kitap: "merdiven" (YAGNI sıralaması) tek sayfalık raf metni olarak; Core'un kendi sadelik kuralıyla aynı hizada, ama enjekte edilmeden istenince okunur.
- fikir: borç defteri — kodda bırakılan bilinçli kestirmeyi işaretleyip sonra tek betikle toplama; Core'un `log.js` mantığına yakın, pasif betik olarak yazılabilir.
- hayır: kanca mimarisi; oturum başına 2.000 token sabit maliyet Core'un sıfır ilkesini doğrudan çiğniyor.

## Karar
fikir notu — içerik (merdiven, borç defteri) değerli, taşıma biçimi (her oturumda 2.000 token enjeksiyon) Core ilkesine aykırı.
