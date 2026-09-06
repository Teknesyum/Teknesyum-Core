# Deney: banner

- soru: Stop kancasindan systemMessage ile basilan tek satir banner bench maliyetine giriyor mu
- kaynak: bench/banner.jsonl
- bant: ±10%

| koşul | görev | taban $ | beklenti | 1. tur $ | gözlem | 2. tur $ | ortalama $ | karar | kabul |
|---|---|---|---|---|---|---|---|---|---|
| c5-banner-06 | 06-slugify-cli | 0.37 | esit | 0.49 / 0.31 / 0.32 (m 0.32) | ucuz ✗ | 0.31 / 0.31 / 0.53 | 0.38 | esit | 6/6 |

Karar sütunu: ikinci tur koşulduysa iki turun ortalaması, koşulmadıysa ilk turun medyanı, tabana göre 10% bant ile.

Toplam harcama: 2.27 $ (6 koşu).
