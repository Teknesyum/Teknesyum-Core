# eze-is/web-access

- lisans MIT (frontmatter) · plugin / tek skill · ★8880
- mekanizma: 1 skill (SKILL.md 18703 B), 5 pasif betik (`cdp-proxy.mjs`, `browser-discovery.mjs`, `match-site.mjs`, `find-url.mjs`, `check-deps.mjs`), 3 referans dosyası, 0 kanca, 0 MCP
- sıradan turda bağlama: frontmatter yalnız 28 B (~7 token, açıklama blok skalar) + skill adı; gövde 18 KB (~4700 token) yalnız çağrılınca
- premium: yok

## Ne yapar
Claude Code'a üç katmanlı ağ erişimi: hafif fetch → arama → gerçek tarayıcı CDP proxy'si. Giriş gerektiren siteler, dinamik sayfalar, video karesi yakalama. MCP sunucusu kurmuyor; yerel Chrome'a CDP ile bağlanan bir betik çalıştırıyor.

## Core'a alınacak
- fikir: MCP sunucusu yerine **pasif betik + skill metni** ile aynı yeteneği vermek — Core'un "hiçbir şey ajan/skill olarak kurulmaz" ilkesine en yakın piyasa örneği; bağlam maliyeti 7 token.
- kitap: `references/site-patterns` — site başına seçici/akış notları ayrı dosyada, yalnız o site geçince okunuyor; Core raflarının alt-raf deseni.
- fikir: `check-deps.mjs` önkoşul denetimi skill gövdesinin ilk bölümünde ("前置检查") — eksikse iş başlamadan tek satır uyarı.

## Karar
Al · 7 token'lık bağlamla 5 betiklik yetenek; Core'un raf+betik ayrımının en iyi ölçülmüş örneği.
