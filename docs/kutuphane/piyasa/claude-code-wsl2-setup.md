# congmnguyen/claude-code-wsl2-setup

- MIT · kurulum biçimi: metin paketi (rehber dosyaları + 3 kabuk betiği, elle kurulur) · ★50
- mekanizma: 0 eklenti manifesti; 1 statusline betiği, 1 bildirim betiği (Notification kancası), 1 tmux sarmalayıcı; 1 ajan (code-architect), 3 skill (commit-push-pr, deep-teach, pytorch-training), MCP kurulumu ayrı belge
- sıradan turda bağlama: çekirdek kurulum bağlama hiçbir şey yazmıyor — statusline modele görünmez, bildirim kancası stdout üretmiyor ≈ 0 token; 3 skill isteğe bağlı ek
- premium: yok

## Ne yapar
WSL2 + Windows Terminal'de Claude Code'un Windows tarafıyla sürtünmesini gideren belge seti: ekran görüntüsü yapıştırma, Windows bildirimi, terminal başlığı, ve bağlam yakan geniş dosya aramasını LSP'ye çeviren kurulum. Statusline proje dizini, dal, bağlam doluluk çubuğu, 5 saatlik ve 7 günlük kullanım oranını renk kodlu gösteriyor.

## Core'a alınacak
- fikir: statusline'da bağlam doluluğu + 5s/7g kullanım kotasının birlikte gösterimi — Core'un statusline'ı zaten var, kota satırı eksik.
- kitap: LSP kurulumunun bağlam tasarrufu gerekçesiyle anlatıldığı rehber (`lsp-setup.md`); Core'un AGENTS.md'sindeki "LSP proje kökünü bekler" notunun karşılığı.
- fikir: Notification kancasına bağlı, terminal odaktayken susan bildirim.

## Karar
fikir notu — kurulum tamamen elle rehber, alınacak bir mekanizma değil; statusline kota satırı ve odak-duyarlı bildirim iki ucuz fikir.
