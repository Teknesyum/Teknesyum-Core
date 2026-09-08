# Jeffallan/claude-skills

- MIT · plugin (marketplace) · ★11371
- mekanizma: 67 SKILL.md, 3 komut + 1 workflow yaml, 0 kanca, 0 ajan, 0 MCP
- sıradan turda bağlama: CLAUDE.md 11560 B + 67 frontmatter 57786 B ≈ 68 KB / ~17.000 token (wc -c; frontmatter'lar awk ile ayıklandı)
- premium: yok

## Ne yapar
12 dil uzmanı, 10 arka uç çatısı, altyapı/DevOps/güvenlik/test becerilerinden oluşan
tam yığın paketi. Kendi CLAUDE.md'sinde beceri yazım şartnamesi tutuyor: "Açıklama Tuzağı" —
açıklamaya süreç adımı yazılırsa ajan gövdeyi okumadan açıklamayı uyguluyor;
biçim `[Yetenek cümlesi]. Use when [tetikleyici koşul]`.

## Core'a alınacak
- fikir: Açıklama Tuzağı kuralı — Core'un kanca ve raf başlıklarının yazım ölçütü olur; ne/ne zaman açıklamada, nasıl gövdede.
- fikir: 67 becerinin 17.000 tokenlık sabit maliyeti, "pasif raf" tercihinin sayısal gerekçesi olarak Core belgelerine yazılabilir.

## Karar
Fikir notu — mekanizma Core'un tersini yapıyor (17.000 token sabit), yalnız yazım kuralı alınır.
