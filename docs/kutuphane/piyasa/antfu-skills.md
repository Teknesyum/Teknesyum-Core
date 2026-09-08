# antfu/skills

- MIT · kurulum biçimi: metin paketi (`pnpx skills add antfu/skills`) · ★5863
- mekanizma: 19 SKILL.md (607 dosya, 3446 KB), 0 kanca, 0 komut, 0 ajan, 0 MCP; 1 üretici betik (`scripts/cli.ts`)
- sıradan turda bağlama: 19 açıklama = 3891 B (~970 token, `grep -h "^description:" skills/*/SKILL.md | wc -c`); gövdeler 1515-37704 B, yalnız eşleşince
- premium: yok

## Ne yapar
Vite/Nuxt ekosistemi için raf koleksiyonu. Asıl değeri içerik değil üretim zinciri: kaynak depolar git submodule olarak `sources/` altına klonlanıyor (vuejs/docs, nuxt, vite, unocss, vitest...), `instructions/<ad>.md` içindeki kısa yönelim dosyasıyla birlikte skill üretiliyor, çıktı `skills/<ad>/GENERATION.md` dosyasına **kaynak git SHA'sı** yazılarak damgalanıyor. Kendi rafını üretenler için `vendor/` altında yalnız senkron (`SYNC.md`).

## Core'a alınacak
- **Pasif betik — kaynak SHA damgası.** Her raf, damıtıldığı üst kaynağın SHA'sını yanına yazsın. Tazeleme o zaman baştan okuma değil, iki SHA arası diff; `kutuphane.js fetch` için ölçülebilir tasarruf.
- **Fikir — üç kaynak tipi ayrımı.** Üretilen (kaynak deposu var, rafı yok) / senkronlanan (kendi rafını yayınlıyor, kopyala) / elle yazılan. Core'un 14 rafı bugün tek torbada; bu ayrım hangi rafın nasıl tazeleneceğini kendiliğinden söylüyor.
- **Fikir — `instructions/<ad>.md`.** Raf başına 5 satırlık görüş dosyası; üretim promptu kaynaktan ayrı durur, kaynak değişince görüş korunur.

## Karar
Al — raf üretimi ve tazelemesi için SHA damgası + kaynak tipi ayrımı, kütüphaneye doğrudan giren iki mekanizma.
