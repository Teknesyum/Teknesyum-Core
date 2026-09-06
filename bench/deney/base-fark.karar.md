# Deney: base-fark

- soru: Base'de olup Core'da olmayan, daha ucuz surumu yazilamayan iki parca: yazim sonrasi sozdizim denetimi ve .lsp.json kaydi
- kaynak: bench/base-fark.jsonl
- bant: ±10%

| koşul | görev | taban $ | beklenti | 1. tur $ | gözlem | 2. tur $ | ortalama $ | karar | kabul |
|---|---|---|---|---|---|---|---|---|---|
| c3-sozdizimi-06 | 06-slugify-cli | 0.37 | esit | 0.36 / 0.30 / 0.35 (m 0.35) | esit ✓ | - | 0.34 | esit | 3/3 |
| c3-sozdizimi-07 | 07-slugify-uc-parca | 0.74 | esit | 0.60 / 0.77 / 0.72 (m 0.72) | esit ✓ | - | 0.70 | esit | 3/3 |
| c4-lsp-06 | 06-slugify-cli | 0.37 | esit | 0.49 / 0.34 / 0.25 (m 0.34) | esit ✓ | - | 0.36 | esit | 3/3 |

Karar sütunu: ikinci tur koşulduysa iki turun ortalaması, koşulmadıysa ilk turun medyanı, tabana göre 10% bant ile.

Toplam harcama: 4.19 $ (9 koşu).
