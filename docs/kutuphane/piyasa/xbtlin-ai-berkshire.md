# xbtlin/ai-berkshire

- MIT · metin paketi (skill dosyaları + depo olarak klonlanır) · ★16242
- mekanizma: 0 kanca · 0 komut · 21 skill (`skills/*.md`, tek dosyalık) + aynı 21 istem `codex-prompts/` altında ikizlenmiş · 0 ajan · 0 MCP
- sıradan turda bağlama: skill'ler tek dosya, `SKILL.md` klasörü değil — yalnız çağrılınca okunur. Depo kökündeki CLAUDE.md 6.3 KB (~1600 token), o depoda çalışırken yüklenir; Core'a kurulunca sıfır.
- premium: yok, ama depo bir WeChat hesabına yönlendiriyor; "asıl seçki orada" diyor.

## Ne yapar
Buffett, Munger, Duan Yongping ve Li Lu'nun yatırım yöntemlerini 21 araştırma istemine dönüştürmüş; şirket incelemesi, bilanço okuma, tez kayması takibi, portföy gözden geçirme gibi adımları çok ajanlı koşuyla üretiyor. Depoda 2328 üretilmiş rapor duruyor.

## Core'a alınacak
- fikir: `thesis-drift.md` deseni — daha önce yazılmış bir kararın hâlâ geçerli olup olmadığını periyodik sınayan istem; Core'un `docs/plan.md` ve yol haritası için aynı "karar kayması" denetimi yazılabilir.
- fikir: aynı istemin Claude ve Codex için ikizlenmesi (`skills/` + `codex-prompts/`) — Core'un AGENTS.md/CLAUDE.md ikiz kuralıyla aynı mantık, tek kaynaktan üretilmeli.

## Karar
hayır — alan (yatırım araştırması) Core ile ilgisiz; yalnız "karar kayması denetimi" fikri not edilir.
