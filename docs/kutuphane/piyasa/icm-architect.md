# RinDig/icm-architect

- MIT · skill (tek klasor, `~/.claude/skills/` altina kopyalanir) · ★1472
- mekanizma: 1 skill (SKILL.md 12,9 KB), 4 referans dosyasi (28,7 KB), 8 sablon; kanca yok, komut yok, ajan yok, MCP yok
- sıradan turda bağlama: yalnizca frontmatter `description` alani ~1,0 KB / ~250 token; govde ancak cagrilinca okunur. Sayim: `wc -c` SKILL.md ve frontmatter satiri.
- premium: yok (topluluk baglantisi var, urun degil)

## Ne yapar
"Interpretable Context Methodology" (arXiv:2603.16021) yontemini uygular: cok ajanli cerceve yerine klasor yapisi orkestrasyon yapar — numarali klasorler sirayi, hiyerarsi baglam kapsamini, duz markdown dosyalari durumu tasir. Iki kip: Build (isi anlatan cumleden alti bicimden birini secip en kucuk calisma alanini kurar) ve Restructure (var olan klasoru katalog/sozlesme/fabrika/urun/olu diye siniflar, gocurur, dogrular). Her sonuc "walk test" ile denetlenir: hafizasiz bir ajan yalniz dosyalardan yonelebilmeli.

## Core'a alınacak
- kitap: token disiplini olcusu — bir asamanin tam baglami 2.000-8.000 token; ayni is icin monolitik istem 30k-50k. "Sikistirmak degil, hic yuklememek" cumlesi Core'un ilkesinin disaridan dogrulamasi, sayiyla.
- kitap: "kutuphane / katalog / raf" modeli — yonlendirme dosyalari kucuk ve kararli, icerik rafta. Core'un kutuphanesi ile bire bir ortusuyor; bes ilke ve "ICM nerede kaybeder" bolumu durustlugu ile alinmali.
- fikir: walk test — Core'un `AGENTS.md` disiplinini sinamak icin: hafizasiz ajan klasorden yonelebiliyor mu.

## Karar
Al — kitap; 250 token'lik tek tanim disinda sifir baglam, ve Core'un pasif raf ilkesini akademik referansla ve olculmus token araligiyla destekliyor.
