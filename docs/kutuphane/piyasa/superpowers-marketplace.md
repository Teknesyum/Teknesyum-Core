# obra/superpowers-marketplace

- MIT · plugin marketplace (yalnız katalog) · ★1252
- mekanizma: 11 eklenti kaydı, hepsi ayrı depoya `url` kaynağı ve `strict: true` ile bağlı; deponun kendisinde skill/kanca/komut/ajan yok (110 KB, README + `marketplace.json`)
- sıradan turda bağlama: 0 token — katalog kurulmuyor, yalnız `/plugin marketplace add` ile listeleniyor. Yük kurulan eklentinin kendisinde (ör. superpowers: 20+ skill ve SessionStart bağlam enjeksiyonu).
- premium: yok

## Ne yapar

Jesse Vincent'ın superpowers ailesini tek yerden dağıtan katalog. İçindekiler: çekirdek skill kütüphanesi, Chrome DevTools erişimi, Elements of Style tam metni (~12k token referans), oturumlar arası anlamsal bellek (episodic-memory), tmux ile başka Claude oturumlarını sürücü, ve "devam edeyim mi?" sorusunu Claude'a yargılatıp kesen `double-shot-latte`.

## Core'a alınacak

- **fikir**: `marketplace.json` içinde her eklentinin ayrı depoya `url` ile bağlanması ve `strict: true` — Core'un kütüphane raflarını tek depoda şişirmeden dış depolara işaret ederek büyütmesinin hazır biçimi.
- **fikir**: `double-shot-latte` — "devam edeyim mi?" duraklamasını kancayla kesip kararı modele verdirme; Core'un Stop tarafında hiçbir kapısı yok, `cek/reflexion` ile aynı yere işaret ediyor.
- **kitap**: `elements-of-style` eklentisinin yaklaşımı — 1918 tam metnini her zaman yüklemek yerine skill çağrılınca okutuyor; Core'un yazım rafı için doğrudan örnek (ama 12k token'lık tam metin alınmaz, damıtılmışı alınır).

## Karar

Fikir notu — katalog kendisi 0 token ve mekanizmasız; alınacak olan dış-depo referanslı raf büyütme biçimi ile Stop kapısı fikri, eklentilerin kendisi değil.
