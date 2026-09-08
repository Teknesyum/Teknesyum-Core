# github/awesome-copilot

- MIT · kurulum biçimi: plugin pazarı (Copilot CLI / VS Code'a kayıtlı marketplace) · ★38771
- mekanizma: yüzlerce ajan, instruction, skill, kanca, workflow ve plugin; sayım depo değil site üzerinden (`awesome-copilot.github.com`). Klonlanmadı — ölçüm README ve `llms.txt` üzerinden
- sıradan turda bağlama: paket seçmeli kurulduğu için sabit değil. `instructions` dosyaları **dosya deseniyle** yükleniyor (`applyTo` glob), yani ilgisiz turda sıfır
- premium: yok

## Ne yapar
Copilot için topluluk kataloğu: ajanlar, dosya desenine bağlı kodlama standartları (instructions), varlıklarını da taşıyan skill klasörleri, kancalar, workflow'lar ve bunları demetleyen plugin'ler. Makine tarafı için `llms.txt` yayınlıyor; kurulum tek tek değil, paket ("plugin") düzeyinde.

## Core'a alınacak
- **Fikir — dosya desenine bağlı yükleme.** Instruction'lar `applyTo` glob'uyla yalnız o dosya türüne dokunulduğunda bağlama giriyor. Core'un kancası "sayar, eşikte konuşur" — aynı mantığın bilgi tarafı: raf, ilgili dosya deseni açıldığında önerilir, sıradan turda sıfır.
- **Fikir — `llms.txt` yayınlama.** Katalogun makine okunur özeti ayrı dosyada. google/skills'teki `index.json` ile aynı çözüm, Core'un kütüphanesi için ikinci tanık.
- **Fikir — paket düzeyinde kurulum.** Tek tek raf yerine demet; Core'un 14 rafı büyüdüğünde bölme ekseni.

## Karar
Fikir notu — Copilot'a bağlı, alınacak dosya yok; `applyTo` deseni ve makine okunur katalog iki not.
