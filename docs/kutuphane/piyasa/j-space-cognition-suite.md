# Tiger3807861189/J-Space-Cognition-Suite-V3.7

- Apache-2.0 · tek Agent Skill (metin paketi) + iki python betiği · ★3016
- mekanizma: 1 skill girişi (`j-space/SKILL.md`, 17.115 B), 9 modül, 4 referans, `jspace.py` (35.981 B) durum defteri denetleyicisi, `verify_suite.py`, 33.777 B'lik test; 0 kanca, 0 komut, 0 MCP
- sıradan turda bağlama: yalnız frontmatter `description` ≈ 1.050 B ≈ ~260 token; SKILL.md tetiklenince, modüller ve referanslar istenince yükleniyor (dosya boyutları `git/trees` API'sinden okundu)
- premium: yok

## Ne yapar
Modelin "iç çalışma alanı" olduğu önermesini kurup görevi sınıflandıran ve dokuz modülden gerekli olana yönlendiren bir çıkarım-zamanı kontrol paketi: derin akıl yürütme, yönlendirilmiş odak, öz izleme, kapasite, kısayol notasyonu. Ağırlık ve eğitim değişmiyor; her şey istem katmanında.

## Core'a alınacak
- kitap: tek giriş + seçmeli modül yükleme mimarisi — giriş dosyası önermeyi kurar, görevi sınıflandırır, yalnız gereken modülü çağırır. Core'un raf düzeni için birebir uygulanabilir şablon; turda maliyet 260 token'da kalıyor.
- fikir: `workspace-ledger.md` + `jspace.py` — metin paketinin kendi kurallarına uyulup uyulmadığını deterministik denetleyen yardımcı; Core'un "model gerekmiyorsa model kullanma" kuralıyla aynı hat.
- fikir: 33.777 B'lik test dosyası bir istem paketinin de test edilebileceğini gösteriyor; Core'un `npm test` kapsamına raf metinleri de girebilir.

## Karar
fikir notu — bilimsel dayanağı ("Gurnee et al., Anthropic, 2026") doğrulanabilir değil ve içerik bilişsel iddia; alınacak olan mimari: 260 tokenlik giriş + istenince açılan modül.
