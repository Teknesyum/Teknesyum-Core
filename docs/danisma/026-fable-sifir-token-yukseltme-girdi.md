# Danışma 026 — Sıfır tokenli yükseltme desenleri (girdi)

Fable'a olduğu gibi giden metin.

---

Sen Teknesyum Core'un karar ortağısın. Dosya okuma; olgular aşağıda. Cevabın Türkçe olsun.

## Sahibin sözü (olduğu gibi)

"birde ucuza yüksek kalite aramıyor değiliz ancak kaliteyi aşırı ucuza alabileceksek bu yönteme
başvuruyoruz projede altın inek yok dedim zaten / misal bir sonnet ajanın başarısız olması
durumunda opusa geçmesi 0 tokenle de yapılabilir sanki bu tarz desenleri düşünmemiz gerekir
fable a sorarak araştıracağız"

## Olgular

- Core bir Claude Code eklentisi. Altın kural: sıradan tur native kadar tutar, kanca bağlama
  yazmaz. Maliyet sınıfları: Z hiç yazmaz, A yalnız çağrılınca/olay olunca yazar, B oturum
  başına şema, C her turda öder. Core Z ve A gönderir.
- Uyarı kuralı: her turda maliyet getiren özellik önce "~%X artış, ekleyelim mi" diye sorulur;
  yalnız olay anında maliyet getiren özellik doğrudan yapılır.
- Elimizdeki araçlar:
  - Agent aracı `model` parametresi alır (haiku/sonnet/opus/fable). Ajan kendi bağlamında
    koşar, ana pencereyi şişirmez, faturaya düşer.
  - Kancalar: PreToolUse (Agent eşleştirici var, `scout.js` burada), PostToolUse (araç
    cevabını görür, `additionalContext` ile modele tek satır yazabilir), SubagentStop, Stop
    (`decision: block` + `reason`, `stop_hook_active` ile döngü önlenir; `dur.js` kanıt kapısı
    böyle), UserPromptSubmit, SessionStart. `systemMessage` kullanıcıya satır basar, modele
    gitmez (v0.29.0'da bütün kancalar "Teknesyum Core > …" basıyor).
  - Kanca kendisi ajan başlatamaz; yalnız modele söyleyebilir ya da bir aracı reddedebilir.
    Betik `claude -p --model opus` ile başsız bir oturum açabilir (bağlama girmez, faturaya
    girer).
  - `count.js` testleri ve çıkış kodlarını ağaç karmasıyla kaydediyor; `dur.js` kod değişip
    hiçbir şey koşmadıysa Stop'u bir kez kesiyor.
- HydraFusion (GitHub Copilot CLI, 2026-09-05 civarı duyuru): Single / Cascade / Critique.
  Cascade: ucuz model dener, kalite kapısı sonucu kabul etmezse güçlü modele geçer. Her
  cascade isteğinde ucuz model ödenir; orkestrasyon her turda çalışır (C sınıfı). Bildirilen
  sonuç (Opus 5 tabanına göre): TerminalBench 2.1 +4,9 puan / %67 ucuz; DeepSWE -1,5 / %36
  ucuz; CheckpointBench -0,1 / %65 ucuz.
- Core'da bugün otomatik "başarısız oldum, yükseliyorum" mekanizması yok; `ff` fable danışması
  model ya da kullanıcı tetikli.

## Soru

1. Başarısız alt ajanın daha güçlü modele yükselmesi Core'da hangi desenle **olay anında
   yalnız** (Z/A sınıfı) kurulur? Başarısızlık nasıl tokensiz saptanır (test çıkış kodu,
   ajan cevabının biçimi, SubagentStop, ağaç karması…)? Yükseltmeyi kim başlatır?
2. Aynı ailede "kaliteyi çok ucuza alan" başka desenler var mı (ör. ucuz model + deterministik
   kapı, yalnız düşen parçayı yeniden koşturmak, önbellekli ikinci görüş)? En fazla beş tane,
   her birinin maliyet sınıfıyla.
3. Bunlardan hangi 1-3'ünü önerirsin, hangi sırayla? Her biri için: nerede duracağı (kanca,
   betik, ajan tanımı, CLAUDE.md satırı), sıradan tura etkisi, nasıl ölçüleceği (bench kol
   başına en çok 3 tekrar).
4. Kaçınılması gerekenler: hangi desen C sınıfına kayar ya da sessizce maliyeti bozar?

Kısa ve karar veren bir cevap istiyorum; gerekçeyi tek satırla ver.
