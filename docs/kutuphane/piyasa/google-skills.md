# google/skills

- APACHE-2.0 · kurulum biçimi: plugin + metin paketi (`npx skills add google/skills`) · ★19651
- mekanizma: 137 SKILL.md, 0 kanca, 0 komut, 0 ajan, 0 MCP; `.claude-plugin/marketplace.json` + tek `plugins/cloud`
- sıradan turda bağlama: hepsi kurulursa 6046 B açıklama (~1.5k token, `grep -h "^description:" | wc -c`). Ama depo bunu **istemiyor**: yalnız `finding-google-skills` kurulur → 1 açıklama, ~130 token
- premium: yok

## Ne yapar
Google ürünleri için 137 skill. Kritik olan sayı değil, dağıtım biçimi: `finding-google-skills` adlı ~4 KB'lik tek bir "bulucu" skill kuruluyor; katalog `index.json` (80962 B, 137 kayıt, üretilmiş dosya) depoda duruyor ve **istenince** raw URL'den çekiliyor. Bulucu açıklamaları yönlendirme ölçütü olarak okuyup en çok 3 kaydı seçiyor, yalnız onların `entrypoint`'ini indiriyor.

## Core'a alınacak
- **Fikir + pasif betik — raf kataloğu.** Kütüphanenin 14 rafı için üretilmiş `index.json` (ad · açıklama · entrypoint). `??` öneki rafları tek tek taramak yerine katalogtan eşleştirir; boşta maliyet sıfır kalır, raf sayısı büyüdükçe de sabit kalır.
- **Kitap — güvenli çekim kuralları.** Bulucunun metni: dönen yanıt JSON olarak ayrışmıyorsa başarı sayılmaz; sertifika hatası kesindir, `curl -k` / `-SkipCertificateCheck` / `ServicePointManager` geri çağrısı ile tekrar denenmez; katalog oturum dışına taşınmaz. Windows PowerShell 5.1 karşılığı ayrıca yazılmış.
- **Fikir — en çok 3 eşleşme sınırı.** Rafın kendisi "en fazla üçünü aç" diyor; Core'un `??` turunda da aynı tavan.

## Karar
Al — 137 rafı sıfır boşta maliyetle taşıyan katalog+bulucu deseni, Core'un kütüphanesinin büyüme sorununu doğrudan çözüyor.
