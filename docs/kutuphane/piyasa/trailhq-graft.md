# trailhq/Graft

- MIT · CLI + MCP + Claude Code derin tümleşimi (`npm i -g @nanonets/graft`, `graft init`) · ★6108
- mekanizma: `graft init` `.claude/` içine kanca(lar) ve bir statusline yazıyor (sayı README'de verilmiyor, "hooks" çoğul) · MCP sunucusu 1 · komut/ajan/skill 0 · CLI alt komutları: `init`, `build`, `grep`, `map`, `viz`
- sıradan turda bağlama: sıfır değil — kanca "her isteme eşleşen düğümleri çekiyor", yani her turda grafik parçası bağlama giriyor; miktar isteme göre değişken, README rakam vermiyor. Grafiğin kendisi `graft/` altında dosya ve `.gitignore`'a ekleniyor.
- premium: yok (MIT); nanonets barındırılan sürümü ayrı.

## Ne yapar
Depoyu bir kod grafiğine indeksler ve ajanın her görevde sıfırdan keşif yapmasını engeller: her isteme ilgili düğümleri iliştirir, her turdan sonra grafiği arka planda tazeler. `graft grep`/`graft map` ile yönelim, `graft viz` ile görselleştirme.

## Core'a alınacak
- fikir: `graft init --dry-run` — dokunacağı her dosyayı önce gösterip hiçbir şey yazmama; Core'un `setup.js` ve `scaffold.js` için doğrudan alınacak davranış.
- fikir: grafiği `node_modules` gibi yerel, yeniden üretilebilir önbellek sayıp `.gitignore`'a atmak, paylaşılanı yalnız `.claude/` kablosu bırakmak — Core'un `map.js` çıktısı için aynı ayrım.
- fikir (karşı örnek): her turda düğüm enjekte etmek Core'un sıfır-token ilkesine aykırı; Core'da karşılığı `graphify` gibi istenince sorgulanan grafik olmalı.

## Karar
fikir notu — grafik yaklaşımı Core'un `graphify` yolunu doğruluyor ama her turda bağlam yazan kanca modeli alınamaz; `--dry-run` ve önbellek ayrımı alınır.
