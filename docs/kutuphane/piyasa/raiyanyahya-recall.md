# raiyanyahya/recall

- MIT · plugin (marketplace) · ★750
- mekanizma: 3 kanca olayı (SessionStart, Stop, SessionEnd), 4 komut, ajan 0, skill 0, MCP 0; 12 Python betiği / 1.676 satır, salt stdlib
- sıradan turda bağlama: 0. Kancalar yalnız oturum başında/sonunda çalışıyor; sıradan turda hiçbir şey yazmıyor. SessionStart `context.md`'yi (~1–2K token, README'nin kendi ölçümü) enjekte ediyor
- premium: yok; satış argümanı "özet yerel algoritmayla üretiliyor, sıfır model token"

## Ne yapar
Her oturumu `.recall/history.md`'ye append eder, oturum bitince TF-IDF + TextRank ile yerel olarak özetleyip `.recall/context.md`'yi üzerine yazar. Hiçbir şey makineden çıkmıyor, API anahtarı yok. Yeni oturum bu özetten devam ediyor.

## Core'a alınacak
- **fikir**: özetin model değil klasik algoritma üretmesi. Core'un `handoff.md`/`devir.md`'sini bugün model yazıyor; TextRank'lı bir `ozet.js` aynı işi sıfır token'a yapar. En değerli tek fikir.
- **pasif betik**: `session_start.py`'nin savunma deseni — Windows'ta `sys.stdout.reconfigure("utf-8")` ve her hatada sessizce `exit 0`. Core kancaları Windows'ta çalışıyor, aynı tuzak geçerli.
- **fikir**: kanca diyalog kuramadığı için Claude'a "kullanıcıya şunu sor" talimatı enjekte etmek — Core'un eşik sorusuyla aynı mekanizma, ikinci bir uygulama örneği.

## Karar
Al — yerel/deterministik özetleyici fikri Core'un sıfır-token ilkesiyle birebir örtüşüyor.
