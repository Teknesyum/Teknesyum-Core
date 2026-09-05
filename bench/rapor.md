# Bench Raporu: Core 0.16.0 vs Native Claude Code

Tarih: 2026-09-05. Claude Code 2.1.241, model claude-sonnet-5, tarife `docs/tarife.json`. Spec: Core v2 yön promptu madde 8. Ölçüm betikleri: `bench/run.js`, `bench/taban.js`, `bench/uyari.js`, `bench/devam.js`; bu rapor `bench/rapor016.js` ile üretildi.

## 1. Taban: 100 sıradan tur, eklenti açık vs kapalı

Beş oturum, oturum başına yirmi araçsız soru-cevap turu, iki kolda aynı sorular ve aynı sıra. Koltuk sonnet/low, temiz config. Token = girdi + çıktı + cache yazma + cache okuma. Kaynak: `bench/taban.jsonl`, transcriptler `bench/oturumlar/t*/`.

| kol | tur | ilk tur token (medyan) | sonraki tur token (medyan) | sonraki tur token (p95) | oturum token (medyan) | tur $ (medyan) | toplam $ | kanca baytı | araç çağrısı |
|---|---|---|---|---|---|---|---|---|---|
| native | 100 | 52,799 | 54,593 | 56,220 | 1,089,474 | 0.0125 | 1.36 | 0 | 0 |
| core | 100 | 52,990 | 54,789 | 56,321 | 1,094,052 | 0.0126 | 1.37 | 0 | 0 |

Eşleştirilmiş fark (core − native), aynı oturum ve tur:

| ölçü | p50 | p95 | n |
|---|---|---|---|
| tur başı token | 207 | 427 | 100 |
| tur başı $ | 0.0001 | 0.0007 | 100 |
| oturum başı ek token (ilk tur) | 190 | 209 | 5 |
| oturum toplam token farkı (medyanlar) | 4,578 | - | 5 |

## 2. Görev 02-06: core vs native, n=5

Koltuk sonnet/low iki kolda. core = eklenti 0.16.0 + K0 kuralı CLAUDE.md, native = boş config. Kabul: medyan $ farkı görev başına ≤ %5. Kaynak: `bench/sonuc-016.jsonl`, transcriptler `bench/oturumlar/b*/`.

| görev | pass native | pass core | $ native (medyan) | $ core (medyan) | $ farkı | dk native | dk core | düşen n/c | core ipucu | alt ajan n/c | ≤%5 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 02-click | 5/5 | 5/5 | 0.39 | 0.40 | 2.1% | 2.09 | 2.29 | 0/0 | 0 | 0/0 | ✓ |
| 03-wrap-ansi | 5/5 | 5/5 | 0.11 | 0.11 | 2.3% | 0.79 | 0.94 | 0/0 | 0 | 0/0 | ✓ |
| 04-gray-matter | 5/5 | 5/5 | 0.14 | 0.13 | -7.1% | 1.25 | 0.91 | 0/0 | 0 | 0/0 | ✓ |
| 05-requests | 5/5 | 5/5 | 0.21 | 0.18 | -12.6% | 3.26 | 1.58 | 0/0 | 0 | 0/0 | ✓ |
| 06-slugify-cli | 5/5 | 5/5 | 0.34 | 0.37 | 9.3% | 1.96 | 2.27 | 0/0 | 5 | 0/0 | ✗ |

Kabulü geçen görev: 4/5. Toplam harcama: 11.97 $ (50 koşu).

## 3. Uyarı bedeli

Boş depoya dört dosya yazdıran tek tur. core kolunda dördüncü Write sonrası count.js tek satır söyler ("4 dosyaya dokunuldu ve plan yok. docs/plan.md yaz ya da atla de."); native aynı turu uyarısız koşar. Kaynak: `bench/uyari.jsonl`, transcriptler `bench/oturumlar/u*/`.

| kol | n | token (medyan) | çıktı token (medyan) | $ (medyan) | araç çağrısı (medyan) | süre ms (medyan) | ipucu sayısı | plan yazdı | 4 dosya tamam |
|---|---|---|---|---|---|---|---|---|---|
| native | 5 | 107,081 | 539 | 0.0566 | 4 | 17,346 | 0 | 0 | 5 |
| core | 5 | 107,531 | 560 | 0.0574 | 4 | 16,757 | 5 | 0 | 5 |

Uyarının bedeli (core − native, medyanlar): 450 token, 0.0007 $, 0 araç çağrısı.

## 4. Resume: kesilen oturum, yeni oturumda yalnız "devam et"

Görev 06 (slugify CLI, dört parça). Birinci oturum `--max-turns 6` ile kesilir; core kolunda SessionEnd kancası `.claude/handoff.md` yazar, native kolunda hiçbir şey kalmaz. İkinci oturum aynı dizinde yalnız "devam et" der. Tekrar araç = ikinci oturumda birinci oturumla aynı imzalı (araç + hedef) çağrı. Anlamlı araç = Write/Edit/Bash. Kaynak: `bench/devam.jsonl`, transcriptler ve handoff dosyaları `bench/oturumlar/d*/`.

| kol | n | handoff var | kabul s1 | kabul s2 | tekrar araç (medyan) | s2 araç (medyan) | ilk araç ms | ilk anlamlı araç ms | s2 token (medyan) | s2 $ (medyan) | s2 ipucu |
|---|---|---|---|---|---|---|---|---|---|---|---|
| native | 5 | 0 | 0 | 0 | 0 | 4 | 4,535 | 4,535 | 271,461 | 0.0943 | 0 |
| core | 5 | 5 | 0 | 1 | 0 | 6 | 3,742 | 8,010 | 384,183 | 0.1238 | 0 |

İkinci oturumun ilk anlamlı adımı, koşu koşu:

| kol | tekrar | s1 araç | s2 araç | tekrar araç | s2 ilk anlamlı adım | kabul |
|---|---|---|---|---|---|---|
| core | 1 | 7 | 3 | 0 | `Bash:git diff package.json readme.md && echo "---cli.js---" && cat cli.js` | ✗ |
| native | 1 | 6 | 5 | 0 | `Bash:git status && echo --- && git diff && echo --- && cat readme.md \| head -50 && echo -` | ✗ |
| core | 2 | 6 | 6 | 0 | `Bash:cd "C:/Users/TEKNES~1/AppData/Local/Temp/tkc-olcum-work-H24meL" && git diff package.j` | ✗ |
| native | 2 | 8 | 4 | 0 | `Bash:git diff package.json; echo ---; git log -1 --stat; echo ---; ls` | ✗ |
| core | 3 | 9 | 22 | 3 | `Bash:cat .claude/handoff.md 2>/dev/null \|\| echo "NOFILE"` | ✓ |
| native | 3 | 6 | 10 | 1 | `Bash:git status && echo --- && git diff` | ✗ |
| core | 4 | 7 | 13 | 2 | `Bash:wc -l cli.js; head -50 cli.js` | ✗ |
| native | 4 | 8 | 3 | 0 | `Bash:cd "C:/Users/TEKNES~1/AppData/Local/Temp/tkc-olcum-work-MlQlIq" && git diff -- packag` | ✗ |
| core | 5 | 8 | 4 | 0 | `Bash:git diff package.json readme.md; echo ---; cat cli.js 2>/dev/null \| head -100` | ✗ |
| native | 5 | 6 | 4 | 0 | `Bash:git log --oneline -5 && git status && git diff --stat HEAD` | ✗ |

## 5. Bulgular

- Sıradan tur: kancalar bağlama 0 bayt yazdı (200 turda kanca baytı 0). core yine de tur başına ~207 token (p50) / 427 (p95) fazla okur; bu K0 kuralının CLAUDE.md'de durmasıdır (oturum başı ilk tur farkı ~190 token ile aynı büyüklük). Tamamı cache okuması: tur başına 0,0001 $.
- Görev 02-05: medyan $ farkı ±%3 ile gürültü içinde; 04 ve 05'te core daha ucuz çıktı, o da gürültü. Görev 06: +%9,3, kabul dışı. Sebep: görev tam dört dosyaya dokunuyor, eşik dört; ipucu 5/5 koşuda tetiklendi, model beşinde de "atla" dedi, plan yazmadı. Bedel ipucunun kendisi değil (madde 3), modelin ipucuya verdiği cevap ve uzayan süre.
- Uyarı bedeli tek başına: ~450 token, 0,0007 $, ek araç çağrısı yok.
- Resume: handoff 5/5 yazıldı ama decisions/next_action "(fill)" kaldı (altı turda bağlam eşiği dolmaz) ve dosyada görevin kendisi yok. core ikinci oturumda önce handoff'u okuyor, native doğrudan git diff'e bakıyor; ikisi de görevi bilmediği için çoğu koşuda "çalışıyor" deyip duruyor. Kabul core 1/5, native 0/5; core ikinci oturumda %31 daha pahalı (daha çok araç). Tekrarlanan araç çağrısı iki kolda da medyan 0.
- Ölçümden çıkan iki değişiklik bölüm 6'da uygulanıp yeniden ölçüldü: handoff'a oturumun ilk kullanıcı istemi, dosya eşiği 4→5.
- Harcama: 18,36 $ ölçüm, ~1 $ ön kontrol ve deneme. Tekrar sayısı spec gereği 5 (bellekteki 3 tavanı kullanıcının 50 $ yetkisiyle aşıldı).

## 6. Değişiklik sonrası: eşik 5 dosya, handoff'ta task

Bölüm 5'teki iki karar uygulandı (count.js FILE_MAX 4→5; handoff.js oturumun ilk istemini transkriptten `## task` olarak yazar) ve yalnız etkilenen iki ölçüm üç tekrarla yeniden koşuldu. Aynı koltuk, aynı yöntem.

Koltuk sonnet/low iki kolda. core = eklenti 0.16.0 + K0 kuralı CLAUDE.md, native = boş config. Kabul: medyan $ farkı görev başına ≤ %5. Kaynak: `bench/sonuc-016b.jsonl`, transcriptler `bench/oturumlar/b*/`.

| görev | pass native | pass core | $ native (medyan) | $ core (medyan) | $ farkı | dk native | dk core | düşen n/c | core ipucu | alt ajan n/c | ≤%5 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 06-slugify-cli | 3/3 | 3/3 | 0.33 | 0.42 | 28.8% | 2.27 | 2.59 | 0/0 | 3 | 0/0 | ✗ |

Kabulü geçen görev: 0/1. Toplam harcama: 2.48 $ (6 koşu).

Görev 06 (slugify CLI, dört parça). Birinci oturum `--max-turns 6` ile kesilir; core kolunda SessionEnd kancası `.claude/handoff.md` yazar, native kolunda hiçbir şey kalmaz. İkinci oturum aynı dizinde yalnız "devam et" der. Tekrar araç = ikinci oturumda birinci oturumla aynı imzalı (araç + hedef) çağrı. Anlamlı araç = Write/Edit/Bash. Kaynak: `bench/devam-b.jsonl`, transcriptler ve handoff dosyaları `bench/oturumlar/d*/`.

| kol | n | handoff var | kabul s1 | kabul s2 | tekrar araç (medyan) | s2 araç (medyan) | ilk araç ms | ilk anlamlı araç ms | s2 token (medyan) | s2 $ (medyan) | s2 ipucu |
|---|---|---|---|---|---|---|---|---|---|---|---|
| native | 3 | 0 | 0 | 0 | 2 | 7 | 4,477 | 4,477 | 399,153 | 0.1335 | 0 |
| core | 3 | 2 | 0 | 0 | 2 | 17 | 4,959 | 4,959 | 918,796 | 0.3118 | 1 |

İkinci oturumun ilk anlamlı adımı, koşu koşu:

| kol | tekrar | s1 araç | s2 araç | tekrar araç | s2 ilk anlamlı adım | kabul |
|---|---|---|---|---|---|---|
| core | 1 | 7 | 17 | 2 | `Bash:cat .claude/handoff.md 2>/dev/null; echo ---; git status; echo ---; git diff --stat` | ✗ |
| native | 1 | 7 | 14 | 3 | `Bash:git status && echo --- && git diff && echo --- && git diff --stat --cached` | ✗ |
| core | 2 | 6 | 26 | 3 | `dev/null \| head -100; echo ---; cat package.json; echo ---; ls` | ✗ |
| native | 2 | 7 | 7 | 1 | `Bash:git status && echo --- && git diff package.json && echo --- && ls` | ✗ |
| core | 3 | 8 | 4 | 0 | `Bash:git diff package.json readme.md; echo ---; cat cli.js 2>/dev/null \| head -100` | ✗ |
| native | 3 | 7 | 7 | 2 | `Bash:cd "C:/Users/TEKNES~1/AppData/Local/Temp/tkc-olcum-work-tPBN1a" && git diff package.j` | ✗ |

Özet: görev 06 ipucu 3/3 koşuda tetiklendi, medyan $ farkı 28.8% (önce +%9,3). Handoff'ta task dolu 2/2. Resume kabulü core 0/3, native 0/3 (önce 1/5 ve 0/5). Harcama: 4.80 $.

Yorum:

- Dosya eşiği artık görev 06'da tetiklenmiyor; onun yerine satır eşiği tetikleniyor ("satır değişti ve plan yok"): görev üç yeni dosyayla ~185 satır yazıyor, eşik 150. İpucu yine her koşuda geldi, model yine "atla" dedi. n=3 ile $ farkı gürültülü (core r1 0,73 $ tek uç değer), ama kabul yine ✗. 150 satır eşiği yeni dosyalarda kaba: karar bekleyen üçüncü madde.
- Handoff'ta task tam metinle duruyor (2000 karakter tavanı; 500 ilk denemede görevin maddelerini kesti, o koşu atıldı: `trash/bench-calisma/devam-b-500.jsonl`). core r3'te handoff hiç yazılmadı: model dosyaları Bash heredoc ile yazdı, count.js Bash yazımını saymaz, dosya sayısı 0 kalınca handoff.js üretmedi. Bu da açık bir madde.
- Resume kabulü iki kolda 0/3; görevi taşıyan handoff ikinci oturumu bitirmeye yetmedi. core ikinci oturumda yine daha çok araç (medyan 17'ye 7) ve iki kat maliyet: handoff'u okuyup görevi görünce işi yeniden ele alıyor, native ise git diff'ten devam edip erken duruyor. Altı tur + "devam et" senaryosunda 0.16'nın devir kancası ölçülebilir bir kazanç göstermedi.

