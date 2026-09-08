# zscole/adversarial-spec

- MIT · plugin (marketplace) + Python/litellm · ★556
- mekanizma: 1 komut (`/adversarial-spec`), `skills/` klasörü var; kanca 0, ajan 0, MCP 0. Dış API anahtarı zorunlu (OPENAI/OPENROUTER/GEMINI)
- sıradan turda bağlama: 0 — yalnız komut çağrıldığında çalışıyor; ama çalıştığında her turda birden çok dış modele paralel istek atıyor (maliyet Claude aboneliği dışında)
- premium: yok, ama üçüncü parti API maliyeti kullanıcının

## Ne yapar
Bir ürün belgesini (PRD ya da teknik şartname) birden çok LLM'e paralel eleştirtiyor; Claude hem sentezleyici hem bağımsız eleştirmen olarak katılıyor. Döngü tüm modeller ve Claude hemfikir olana kadar sürüyor, sonunda kullanıcı inceleme süresi ve nihai belge.

## Core'a alınacak
- **fikir**: "Claude yalnız orkestra şefi değil, bağımsız eleştirmen" kuralı. Core'un fable danışma akışında (`advice.js`) model danışmanı çağırıp cevabı olduğu gibi aktarıyor; kendi bağımsız itirazını da yazması netleştirmeyi güçlendirir.
- **fikir**: yakınsama ölçütü — "hepsi hemfikir olana kadar" döngüsü ve tur sayısı tavanı. Core'un danışma kayıtlarında (`docs/danisma/`) tek tur var; tavanlı ikinci tur ucuz bir iyileştirme.
- **hiç**: çok modelli paralel çağrı Core'un maliyet altın kuralına aykırı; kod alınmaz.

## Karar
Fikir notu — tek uygulanabilir parça, danışma akışına "Claude kendi itirazını da yazsın" kuralı.
