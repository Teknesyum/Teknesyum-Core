# yvgude/lean-ctx

- Apache-2.0 · CLI + MCP sunucusu + plugin (`.claude-plugin/plugin.json`, `lean-ctx --mcp`) · ★3736
- mekanizma: ~12 MCP araci (`ctx_compose`, `ctx_read`, `ctx_search`, `ctx_shell`, `ctx_glob`, `ctx_tree`, `ctx_callgraph`, `ctx_patch`, `ctx_session`, `ctx_knowledge`, `ctx_expand`), 2 skill, kanca yok; 10 okuma kipi, 95+ kabuk deseni
- sıradan turda bağlama: `LEAN-CTX.md` proje kurali olarak 3,5 KB (~900 token) + 2 skill tanimi ~0,3 KB + 12 MCP aracinin sema tanimi (tahmin ~3-5k token). Toplam ~5-6k token, her turda. Sayim: `wc -c` LEAN-CTX.md ve SKILL.md frontmatter; MCP araci sayisi plugin.json ve LEAN-CTX.md eslemesinden.
- premium: var — yerel kullanim ucretsiz, bulut/panel icin leanctx.com/pricing

## Ne yapar
Ajanin gordugu baglami yerelde suzen bir katman: dosya okumalarini imza/harita/tam kiplerine indirger, kabuk ciktisini komuta ozel sikistirir, tekrar okumalari deterministik referansa cevirir, oturum hafizasi tutar ve tasarrufu yerel bir deftere yazar. Proxy kipi istekleri prompt-cache'i bozmadan sikistiriyor.

## Core'a alınacak
- kitap: "navigasyon paradoksu" kural seti — daha cok okumak daha cok anlamak degil; anlamsal soruya arama, tam dosya okumasi degil; yonelim icin `mode=signatures`. Core'un token tasarrufu kuralinin islemsel karsiligi.
- kitap: geri cekilmis benchmark bildirimi (`BENCHMARKS.md`) — "ayni is yuku, bilinen baseline, ilan edilmis kalite esigi, gorunur yontem yoksa kazanc gecerli degil; ucuza basarisiz olan is kazanc degildir". Core'un bench raporu icin kanit doktrini.
- fikir: tasarruf defteri + Shadow Mode — tasarrufu iddia etmek yerine ayni is yukunde olcup yerel dosyaya yazmak.

## Karar
fikir notu — MCP + 3,5 KB zorunlu kural her turda ~5-6k token bagliyor, Core'un sifir-token ilkesine dogrudan ters; alinacak olan kanit doktrini ile navigasyon kurallari, mekanizmasi degil.
