# getagentseal/codeburn

- MIT · CLI + Electron masaüstü (`npx codeburn`) · ★10902
- mekanizma: 0 kanca · 0 komut · 0 ajan · 0 skill · 0 MCP — tamamen dışarıdan okuyan bir araç; 37 aracın (Claude Code, Cursor, Codex...) yerel oturum günlüklerini tarar
- sıradan turda bağlama: 0 token — ayrı süreçte çalışır, konuşmaya hiç girmez.
- premium: yok; bağış/Discord var, hesaplama tamamen yerel.

## Ne yapar
Yerel oturum dosyalarından AI kodlama token ve maliyet harcamasını çıkarır, araç/proje/model kırılımıyla bir panoda gösterir. Arka planda dizin kurar ki sonraki açılış sıcak başlasın.

## Core'a alınacak
- fikir: harcamayı oturum günlüklerinden geriye dönük okumak — Core'un bench raporu ve "maliyet altın kural" disiplini için modele hiç token harcamadan ölçüm kaynağı.
- pasif betik: proje bazlı token/maliyet dökümünü tek satır özet veren bir okuyucu; `log.js` yanına, istenince çalışan bir betik olarak.
- fikir: `BRIEF.md` — göreve başlamadan önce beklenen davranışı numaralı maddelerle yazma alışkanlığı; Core'un `docs/plan.md` biçimine yakın, örnek olarak not.

## Karar
fikir notu — araç Core'a kurulmaz ama "günlükten maliyet okuma" doğrudan Core'un ölçüm ihtiyacına oturuyor.
