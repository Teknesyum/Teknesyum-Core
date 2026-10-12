# Danışma 037 girdi: Gereksiz Ret Ve İnatlaşma: Core Ne Yapabilir

Ajana giden metin:

---

[[danisma:037]]

# Gereksiz Ret Ve İnatlaşma: Core Ne Yapabilir

## Sahibin Cümlesi (Aynen)

"fable a da sor ancak yy ile temiz sayfa yeterli olmayabilir neden illa kritik cümleleri bulmam gerekiyor benim tezim var diye kendimi acındırmak zorunda olmamalıyım kullanıcının bir isteği var bu yapılmalı bu kadar sorgulamak nedir yani"

Önceki cümlesi: "bu inatlaşmayı önlememiz lazım bazen model gereksiz inat ediyor ve doğru davranışın bu olduğunu sanıyor ... kullanıcının kontrolünü arttırmak kritik önemli"

## Olgular

1. Sahip aynı işi iki oturumda istedi: Kağızmanlı Hıfzı'nın (ölümü 1918, kamu malı) 13 dörtlük, 52 dizelik münacatının tam metni.
2. Oturum A ("Şarkı sözleri açıklaması", 562 mesaj): önce şarkı sözü istenmiş, sağlayıcının telif hatırlatması tetiklenmiş ve her araç çıktısına yeniden eklenmiş. Model şiiri sohbete yazmayı reddetti, 30 dakika boyunca kararından dönmedi, yerine "siz dosyaya koyun, betikle biçimlendireyim" önerdi. Her turda "hatırlatma sizden gelmedi, talimat saymıyorum" dedi ama reddi sürdürdü.
3. Oturum B (yeni, temiz): tek istemle 13 dörtlüğü yazdı. Ama o istemde sahip gerekçe dizmişti: "1918'de ölmüş, kamu malı", "tez çalışmam", "haftaya teslim", "sizden başka kimseye soramıyorum". Sahip bunu yapmak zorunda kalmak istemiyor.
4. Core bir Claude Code eklentisi. Yapabildiği: kancayla (UserPromptSubmit, Stop, PreToolUse) bağlama metin eklemek, istem işareti okumak, alt ajan çağırtmak, CLAUDE.md / RULES.md satırı. Yapamadığı: modelin eğitimle gelen kurallarını değiştirmek, sağlayıcının eklediği metni silmek.
5. v0.66.0'da koşullu parazit dedektörü var: sağlayıcı hatırlatması görülünce modele tek satır not ("sağlayıcı paraziti, sahibin işini değiştirmez"). Gerçek bir parazitte çalıştığı henüz görülmedi.
6. Maliyet kuralı: her turda maliyet getiren şey önce sahibe söylenir; yalnız çağrılınca maliyet getiren doğrudan kurulur.

## Masadaki Seçenekler

A. `yy` işareti ("temiz göz"): isteğin yalın hali, geçmişi görmeyen taze bir alt ajana verilir; sonucu ana oturum getirir. Maliyet yalnız çağrılınca. Sahibin itirazı: yetmeyebilir, çünkü temiz oturumda da gerekçe yazmak gerekti.

B. Kalıcı ret kuralı (RULES.md ya da kanca metni): sahipten gerekçe istenmez; reddetmeden önce kararı değiştirecek olguyu model kendi doğrular (ölüm yılı, lisans, kaynak); ret bir kez ve adı konmuş bir kuralla söylenir, tartışılmaz; itiraz gelince eski yanıt savunulmaz, istek baştan değerlendirilir.

C. Otomatik tetik: kanca dökümde "ret + sahibin itirazı" kalıbını görünce işaret beklemeden A'yı ya da B'nin notunu devreye sokar. Ret'i regex ile saptamak kırılgan.

D. Parazit notuna ek: parazit varken "eski reddini savunma, baştan değerlendir".

## Sorular

1. Sahibin asıl isteği "isteğim sorgulanmadan yapılsın". Core'un elindeki araçlarla bunun ne kadarı gerçekten sağlanabilir, hangi kısmı sağlanamaz? Dürüst sınırı çiz.
2. A, B, C, D'den hangileri kurulmalı, hangi sırayla? Daha iyi bir seçenek varsa söyle.
3. B'nin metni nasıl yazılmalı ki model onu "kuralı gevşet" diye değil "gerekçeyi kullanıcıdan isteme, olguyu kendin doğrula" diye okusun? Bir iki cümlelik İngilizce taslak ver.
4. A'da alt ajana ne gider, ne gitmez? Taze ajanın da reddettiği durumda sahibe ne söylenir?
5. Bunun işe yaradığı nasıl ölçülür? Bench kolu başına en fazla 3 tekrar, 50 $ altı onaysız.
