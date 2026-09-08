# ngmeyer/librarian-mcp

- MIT · kurulum biçimi: MCP sunucusu (Rust ikili) + skill · ★29
- mekanizma: 1 MCP sunucusu (stdio), 1 skill içinde 12 slash komut; `--setup` Claude Desktop ve
  Claude Code yapılandırmasını yazıyor (yedek alarak). Ölçüm README'den, klonlanmadı.
- sıradan turda bağlama: MCP araç şemaları + skill açıklaması her turda yüklü; Core'un
  sıfır-token ilkesine ters, tam sayı README'den çıkarılamadı.
- premium: yok

## Ne yapar

Karpathy'nin "LLM Wiki" desenini ürünleştiriyor: Obsidian kasası ya da düz markdown klasörü
üzerinde çift yönlü grafik gezinme, otomatik wikilink, trigram arama, topluluk tespiti ve D3
grafik görünümü. Tamamen yerel, ağa çıkmıyor.

## Core'a alınacak

- **fikir** — Core'un pasif kütüphanesi (raflar) şu an düz dosya; wikilink + trigram indeks ile
  "istenince okunan" rafın içinde arama yapılabilir hale gelir, hiçbiri bağlama girmeden.
- **fikir** — `--setup`'ın yaptığı iş Core'da yasak (settings'e dokunma); karşı örnek olarak not.
- **hiç** — MCP sunucusu alınmaz.

## Karar

fikir notu — raf içi arama/bağlantı indeksi fikri değerli, ama MCP kurulumu Core ilkesine ters.
