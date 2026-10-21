# headroom Proxy Ölçümü

Tarih: 2026-10-22. Soru: headroom proxy kipinde, gerçek bench görevlerinde faturayı ne kadar düşürür, neye mal olur?

## Düzenek

- Görevler: 02-click, 03-wrap-ansi, 04-gray-matter, 05-requests, 06-slugify-cli.
- Koltuk sonnet/low, kol core, her görev 3 tekrar.
- headroom-ai 0.41.0; `--no-optimize` sıkıştırmasız, varsayılan `--mode cache` sıkıştırmalı.
- `gozcu.js` her isteğin şeklini ve usage'ını yazdı. A, B ve C kollarında kollar her tekrarda sırayla dönüştürüldü.

| Kol | Zincir |
|---|---|
| D | proxy yok (gerçek kullanım) |
| A | gözcü → Anthropic |
| B | gözcü → headroom sıkıştırmasız → Anthropic |
| C | gözcü → headroom sıkıştırmalı → Anthropic |

## Sonuç

| Kol | Satır | Kabul | Toplam $ | Satır başı $ | D'ye göre | Girdi token | Süre medyanı |
|---|---:|---:|---:|---:|---:|---:|---:|
| D | 15 | 15 | 2,651 | 0,177 | — | 5.312.909 | 59,3 sn |
| A | 15 | 15 | 2,945 | 0,196 | +%11 | 7.202.015 | 64,6 sn |
| B | 15 | 15 | 2,037 | 0,136 | -%23 | 2.540.225 | 63,3 sn |
| C | 15 | 15 | 1,952 | 0,130 | -%26 | 2.364.034 | 61,8 sn |

Görev başına $ (3 tekrar):

| Görev | D | A | B | C |
|---|---|---|---|---|
| 02-click | 0,243 0,201 0,216 | 0,251 0,279 0,313 | 0,173 0,170 0,148 | 0,148 0,154 0,178 |
| 03-wrap-ansi | 0,143 0,138 0,146 | 0,166 0,164 0,163 | 0,117 0,117 0,110 | 0,119 0,111 0,110 |
| 04-gray-matter | 0,114 0,116 0,102 | 0,118 0,131 0,132 | 0,089 0,089 0,087 | 0,085 0,086 0,085 |
| 05-requests | 0,140 0,136 0,148 | 0,200 0,152 0,168 | 0,124 0,104 0,137 | 0,110 0,120 0,109 |
| 06-slugify-cli | 0,267 0,194 0,346 | 0,201 0,313 0,193 | 0,272 0,153 0,145 | 0,232 0,159 0,145 |

Gözcü günlüğü (istek başına ortalama):

| Kol | İstek | İstemci gövdesi | Araç şeması | Girdi | Önbellek yazma | Önbellek okuma | Önek değişimi |
|---|---:|---:|---:|---:|---:|---:|---:|
| A | 130 | 159 KB | 116 KB | 125 | 2.113 | 54.614 | 47 |
| B | 142 | 158 KB | 116 KB | 125 | 1.942 | 17.307 | 53 |
| C | 135 | 157 KB | 115 KB | 128 | 2.000 | 16.888 | 51 |

Önek değişimi, ardışık iki istekte system ve araç özetinin değiştiği sayıdır. Kollar arasında aynı düzeyde; headroom önbelleği kırmıyor.

## Kazanç Nereden Geliyor

Sıkıştırma değil. headroom `--no-optimize` kipinde bile araç şemalarını erteliyor. Günlüğündeki işaret `router:tool_search_deferral:30tools:32635tok`, B'deki 142 isteğin 115'inde var. Her istekte yaklaşık 32 bin token önbellekten okunmak yerine hiç gönderilmiyor.

Asıl sıkıştırma (C, B'ye göre) küçük kalıyor:

- headroom'un kendi sayacı: -%2,8 token;
- fatura: -%4.

## Gözcünün Kendi Bedeli

A, D'den %11 pahalı; girdi token'ı da %36 fazla. Proxy'li kollarda istemci her istekte 116 KB araç şeması gönderiyor. Claude Code özel bir `ANTHROPIC_BASE_URL` görünce kendi araç ertelemesini bırakıyor gibi. Bu yüzden temel D'dir, A değil.

## Bedel

- Kabul: dört kolda 15/15; kayıp yok.
- Süre: C'nin süre medyanı D'den %4 uzun. headroom'un kendi işi istek başına 7 ms; farkın çoğu yerel zincir.
- Disk 2,1 GB, çalışan bir Python süreci, oturum başına `ANTHROPIC_BASE_URL`.
- Toplam harcama: 10,09 $ (60 satır + 1 deneme).

## Karar (T6)

headroom silinmez. Sonnet/low koltuğunda faturayı %26 düşürüyor ve kabul değişmiyor.

Varsayılan yapılmaz, çünkü:

- kazancın çoğu Claude Code'un kendi yaptığı işin (araç ertelemesi) daha sıkı hâli;
- opus koltuğunda ve uzun oturumda oran ölçülmedi;
- her oturumun arkasında bir Python süreci duruyor.

Sıradaki (plan U5, sahibin kararı): isteğe bağlı bir başlatıcı ve opus/T0 koltuğunda ikinci ölçüm.

Ham veri: `olcum-dis/gozcu/` altında `bench-{a,b,c,d}.jsonl`, `{a-dogrudan,b-gecir,c-sikistir}.jsonl`, `hr-*.log`, çözümleyici `coz.js`.
