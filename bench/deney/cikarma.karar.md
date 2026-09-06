# Deney: cikarma

- soru: Plan ipucu kapatilirsa ve K0'daki Kucuk is satiri cikarilirsa maliyet ne olur
- kaynak: bench/cikarma.jsonl
- bant: ±10%

| koşul | görev | taban $ | beklenti | 1. tur $ | gözlem | 2. tur $ | ortalama $ | karar | kabul |
|---|---|---|---|---|---|---|---|---|---|
| k0siz-cue | 07-slugify-uc-parca | 0.74 | esit | 0.54 / 0.49 / 0.49 (m 0.49) | ucuz ✗ | 0.55 / 0.54 / 0.46 | 0.51 | ucuz | 5/6 |
| k0siz-sessiz | 07-slugify-uc-parca | 0.54 | ucuz | 0.73 / 0.72 / 0.53 (m 0.72) | pahali ✗ | 0.65 / 0.53 / 0.74 | 0.65 | pahali | 6/6 |
| c1-sessiz | 07-slugify-uc-parca | 0.74 | esit | 0.70 (m 0.70) | esit ✓ | - | 0.70 | esit | 1/1 |
| c2-kucuk | 06-slugify-cli | 0.37 | pahali | 0.32 / 0.39 / 0.24 (m 0.32) | ucuz ✗ | 0.59 / 0.32 / 0.26 | 0.35 | esit | 6/6 |

Karar sütunu: ikinci tur koşulduysa iki turun ortalaması, koşulmadıysa ilk turun medyanı, tabana göre 10% bant ile.

Toplam harcama: 9.81 $ (19 koşu).
