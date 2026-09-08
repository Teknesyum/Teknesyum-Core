# alexgreensh/attention-span

- AGPL-3.0 · plugin (`.claude-plugin/`, output-styles + skills) · ★1022
- mekanizma: 3 output style (attention-kind 7,8 KB, spartan 3,7 KB, rundown 2,7 KB), 4 skill (hepsi `disable-model-invocation: true`), 1 komut (`/style`), kanca yok, ajan yok, MCP yok
- sıradan turda bağlama: 0 KB / 0 token — kanca yok, dort skill de model cagrisina kapali, stil dosyasi ancak kullanici actiginda yuklenir (aktifken ~1-2k token). Sayim: `wc -c` output-styles ve SKILL.md frontmatter, `hooks` girdisi yok.
- premium: yok

## Ne yapar
Claude Code'un *nasil konustugunu* degistiren uc cikti stili: Attention-kind (ADHD dostu, once cevap, kalin yazi ile taranabilir), Spartan (kisa, sifir sicaklik), Rundown (TL;DR brifing). `keep-coding-instructions: true` ile kodlama davranisi degismiyor. Ayrica `/tldr` donusumu.

## Core'a alınacak
- kitap: olcum yontemi — 12 kodlama gorevi, gizli test takimi, ayni model, stil kapali/acik 3'er kosu; is degismedi (35/36 vs 35/36; code-eval'de %88,9 -> %100), cikti ortalama %43 kisaldi, ayrintili cevaplarda %50-71. Yargic model yok, hepsi yeniden uretilebilir. Core'un bench'i icin dogrudan sablon.
- betik/fikir: `disable-model-invocation: true` — skill'i yalniz kullanici cagirabilir hale getirir; tanimi model baglamina girmez. Core'un "sifir token" ilkesiyle skill dagitmanin resmi yolu, `pp`/`??` oneklerine alternatif.
- fikir: stil dosyasinin kendisi (once cevap, blok basina tek fikir, kalin okununca tam cevap) — Core'un RULES.md cikti kurallariyla ortusuyor, disaridan olculmus surumu.

## Karar
Al — kitap; sifir baglam maliyeti ve yargicsiz, tekrarlanabilir A/B olcumu Core'un bench disiplini icin en iyi ornek. Lisans AGPL-3.0, metin kopyalanmaz, yontem alinir.
