# Haleclipse/CCometixLine

- MIT · kurulum biçimi: CLI ikili (`npm i -g @cometix/ccline`), `settings.json` statusLine girdisi · ★3458
- mekanizma: 0 kanca, 0 komut, 0 ajan, 0 skill, 0 MCP; tek bir Rust ikilisi + TUI yapılandırma arayüzü
- sıradan turda bağlama: **0 token** — statusline çıktısını model görmez; ikili her tur bir kez çalışır, `context_window` segmenti transcript dosyasını okuyup pencere doluluğunu hesaplar
- premium: yok

## Ne yapar
Claude Code statusline'ını Rust'ta yeniden yazıyor: model adı, dizin, git dal/durum, transcript'ten hesaplanan bağlam penceresi. Yanında bir "Claude Code iyileştirme" katmanı var — Claude Code ikilisini yamalayarak "Context low" uyarısını kapatıyor ve verbose modu açıyor, sürüm güncellemelerine dayanacak biçimde, otomatik yedekle.

## Core'a alınacak
- **fikir**: bağlam penceresi doluluğunu **transcript dosyasından** okuma — Core'un statusline'ı sayacı zaten tutuyor; aynı kaynaktan gerçek doluluk da okunabilir, modele hiç sormadan.
- **fikir**: TUI ile yapılandırma (`ccline -c`) — Core'un `setup.js`'i için, ama Core'un ilkesi "makine ayarı tek komut", TUI fazla.
- hayır: ikili yamalama katmanı — Claude Code'un kendi dosyasını değiştiriyor; Core'un "settings'e dokunma" sınırının ötesinde.

## Karar
Fikir notu — statusline'da sıfır token doğru referans ama Rust ikilisi Core'a girmez; transcript'ten pencere doluluğu okumak tek alınabilir fikir.
