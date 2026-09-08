# frankbria/ralph-claude-code

- MIT · CLI (global `ralph` komutu, kabuk betikleri) · ★9623
- mekanizma: 0 kanca · 0 skill · 0 ajan · 0 MCP; `.ralphrc` proje ayarı, `ralph-enable` sihirbazı, `ralph-stats` metrik komutu. README'ye göre 784 test.
- sıradan turda bağlama: 0 — Claude Code'un içine hiçbir şey enjekte etmiyor, dışarıdan `claude` sürecini döngüye sokuyor (`--resume`, `--output-format`, `--allowed-tools` bayrakları).
- premium: yok

## Ne yapar
Geoffrey Huntley'in "Ralph" tekniğinin Claude Code uyarlaması: proje bitene kadar Claude Code'u tekrar tekrar çağıran otonom döngü. Sonsuz döngüyü ve API israfını engellemek için çift koşullu çıkış kapısı (hem tamamlanma işareti hem açık EXIT_SIGNAL), saatlik hız sınırı (100 çağrı), devre kesici, yanıt çözümleyici ve otomatik git yedek dalı var.

## Core'a alınacak
- fikir: çift koşullu çıkış kapısı — "model bitti dedi" tek başına yetmez, ayrıca açık bir işaret gerekir. Core'un handoff/plan eşiklerinde aynı mantık uygulanabilir.
- fikir: saatlik çağrı sayacı + devre kesici; Core'un maliyet disiplinine pasif betik olarak eklenebilir (`ralph-stats` gibi JSON Lines tur metriği).

## Karar
Fikir notu — dışarıdan süreç sürücüsü, Core'un kanca/raf mimarisine girmiyor; çıkış kapısı ve tur metriği desenleri not edilmeye değer.
