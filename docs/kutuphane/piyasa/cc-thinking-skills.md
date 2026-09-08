# tjboudreaux/cc-thinking-skills

- MIT · plugin (marketplace) + `npx skills add` ile taşınabilir skill klasörü · ★1293
- mekanizma: 28 skill, 0 kanca, 0 komut, 0 ajan, 0 MCP
- sıradan turda bağlama: 28 SKILL.md frontmatter'ı toplam 6833 B ≈ 1700 token (`awk` ile ilk `---` bloklarının bayt toplamı); gövdeler yalnız çağrılınca okunur. Depodaki CLAUDE.md 614 B ve dağıtılmıyor.
- premium: yok

## Ne yapar
Karar, teşhis, risk, strateji için 28 düşünme modelini (pre-mortem, theory-of-constraints, via-negativa, red-team…) birer prosedür skill'i olarak paketler. Bir `thinking-model-router` skill'i doğru çerçeveyi seçer ve `disable-model-invocation: true` ile yalnız elle çağrılır. `analysis/AUDIT.md` altında eval kaydı var.

## Core'a alınacak
- kitap: 28 modelin sıkıştırılmış tek raf kitabı — Core'un pasif kütüphanesi tam bu iş için var; 28 skill kurmak yerine tek dosya, sıradan turda 0 token.
- fikir: `disable-model-invocation: true` — bir skill'i modele göstermeden yalnız elle çağrılır kılmak; Core'un "istenince okunur" ilkesinin resmi karşılığı.
- fikir: yönlendirici raf ("hangi çerçeve") — kütüphane girişine tek sayfalık seçim kılavuzu.

## Karar
Al · içerik kitap olarak değerli, kurulum biçimi değil: 28 skill 1700 token sabit bedel, aynı içerik rafta 0.
