# rpamis/comet

- MIT · kurulum: plugin + npm CLI (`@rpamis/comet`, saf Node runtime, Bash/WSL gerektirmiyor) · ★2971
- mekanizma: 36 `SKILL.md` (13 skill kökü) · 12 `.mjs` runtime betiği (guard, state, yaml-validate, handoff, hook-router, resume-probe) · kanca yönlendiricisi tek dosya (üretilmiş, 637 KB) · ajan/MCP yok, çok oturumlu Codex/Agent Teams çağırıyor
- sıradan turda bağlama: kendi `CLAUDE.md` 16.3 KB + `AGENTS.md` 15.8 KB ve 36 skill açıklaması; ölçülen 12 açıklamanın ortalaması ~150 karakter. Kurulu hâlde kabaca 32 KB metin + ~6 KB açıklama ≈ **~9k token** — Core'un ilkesinin tam tersi.
- premium: yok (dokümanlar ve dashboard açık)

## Ne yapar
İhtiyaçtan arşive kadar süren uzun işleri kesintiden sonra devam ettirilebilir kılan iki iş akışı (güçlü modeller için Native, OpenSpec+Superpowers beş fazlı Classic) sunar. Faz geçişleri modelin "bitti" demesine değil, durum dosyasını denetleyen betiklere bağlıdır. Ayrıca skill üretme, paketleme ve Pass@k/Pass^k ile değerlendirme aracı içerir.

## Core'a alınacak
- **fikir — geçişi model değil betik onaylar**: `comet-guard.mjs` / `comet-yaml-validate.mjs` / `comet-state.mjs` faz çıkışında görev, durum alanı ve kanıt kontrol ediyor. Core'un devir notu ve plan eşiği için aynı deterministik kapı kurulabilir.
- **fikir — tek yapılandırmadan yönlendirme**: `/comet` yalnız `.comet/config.yaml` okuyup hangi akışa gideceğine karar veriyor, iş büyüklüğünden tahmin etmiyor; router bir olayda **en çok bir** guard çağırıyor. Core'un önek kancalarında (`??`, `pp`) aynı "tahmin yok, tek dosya karar verir" kuralı.
- **fikir — saf Node runtime**: Windows'ta Bash/WSL olmadan çalışıyor; Core'un kabuk bağımsızlığı hedefiyle örtüşen kanıt.

## Karar
Fikir notu — mekanizma dersleri değerli ama kurulum ~9k token bağlam yüklüyor; Core'a hiçbir parçası olduğu gibi alınmaz.
