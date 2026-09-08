# nexu-io/html-anything

- Apache-2.0 · CLI + web uygulaması (Claude Code eklentisi değil) · ★8701
- mekanizma: 0 kanca, 0 slash komut, 0 ajan; 75 "skill" şablonu uygulamanın kendi dizininde, `cli/src/skills-loader.ts` + `cli/src/skills-matcher.ts` ile seçiliyor. Kök `CLAUDE.md` 11 bayt
- sıradan turda bağlama: 0 — Claude Code'a hiçbir şey kurulmuyor; uygulama PATH'te bulduğu 9 ajan CLI'sinden birini dışarıdan çağırıyor
- premium: yok

## Ne yapar
Yerel ajan CLI'sini (Claude Code dahil) dışarıdan sürerek HTML çıktı üretiyor: makale, sunum,
poster, kart, veri raporu. 75 şablon 9 teslim yüzeyine bölünmüş; kullanıcı yüzeyi seçiyor,
eşleştirici yalnız o şablonu isteme koyuyor.

## Core'a alınacak
- fikir: `skills-matcher` deseni — 75 şablonun hepsini yüklemek yerine istekle eşleşen tek
  şablonu bağlama koymak; eşleştirmenin model değil kod tarafında olması Core'un `??`/`pp`
  önek kancasıyla aynı mantık.
- fikir: kataloğun uygulamada durup ajana yalnız seçilen parçanın verilmesi — raf sayısı
  büyüdüğünde Core kütüphanesi için ölçeklenme yolu.

## Karar
fikir notu — Claude Code'a hiçbir şey kurmadığı için alınacak dosya yok; kod tarafında eşleştirme fikri kayda değer.
