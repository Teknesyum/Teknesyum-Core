# chaseai-yt/claudex-loop

- MIT · plugin (`.claude-plugin/` + `.codex-plugin/`) · ★1703
- mekanizma: 0 kanca, 0 komut, 0 ajan, 4 skill (1.8-9.5 KB, toplam 21 KB), 1 pasif betik `scripts/validate.py` (54 satır)
- sıradan turda bağlama: CLAUDE.md yok; yalnız 4 skill açıklaması ~1.1 KB (~275 token). Kanca olmadığı için kanca çıktısı sıfır.
- premium: yok

## Ne yapar
Planı iki modele çapraz denetletir: host (Claude ya da Codex) planı yazar, diğeri bağımsız düşman gözüyle inceler, sınırlı bir revizyon turu döner. `claudex-route` ayrı ve bağımsız: bir görev için model önerir ve tek seferlik kapsamlı devir üretir.

## Core'a alınacak
- **fikir**: sınırlı revizyon döngüsü — inceleme turu sayısı baştan kapalı, sonsuz gidiş geliş yok. Core'un fable danışma akışında tur tavanı olarak kullanılabilir.
- **fikir**: `claudex-route` bağımsızlığı; README'de "Loop'tan bağımsızdır" diye açıkça yazılı, tek beceri tek işi yapar.
- **hiç**: kanca ve makine alınacak bir şey yok; iki CLI ve Python 3.10 bağımlılığı Core'un sıfır bağımlılık çizgisini bozar.

## Karar
Fikir notu — mekanizma tamamen skill metni; Core zaten fable ile ikinci görüş alıyor, iki CLI bağımlılığı bedava değil.
