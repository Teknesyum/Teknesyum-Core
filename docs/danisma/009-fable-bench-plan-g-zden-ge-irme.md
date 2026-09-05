# Fable bench planı gözden geçirme

- soran: T0
- danisilan: fable
- tarih: 2026-09-04

## Sorulan

C:/Users/Teknesyum/.claude/plugins/cache/teknesyum/teknesyum-core/0.15.0/roles/advisor.md dosyasını oku ve onu izle.

Depo kökü: C:\Users\Teknesyum\Desktop\Projeler\Teknesyum Core
Soran: T0, opus. Senin koltuğun: fable/medium.

## Soru

`docs/BENCH.md` planı bir yıl önce yazıldı ve ertelendi. Şimdi uygulanacak. Kod yazılmadan önce plandaki ölçüm tasarımında kusur var mı?

Özellikle dört düğüm:

1. Plan 5 görev × 3 tekrar × 4 profil = 60 koşu diyor. Bunu önce 2 görev × 3 tekrar × 4 profil = 24 koşuluk bir pilot olarak koşup, sonuçlar iyiyse kalan 36 koşuyu ekleyip aynı veri kümesine tamamlamak rakamları bozar mı? Bozuyorsa neyi bozar.
2. %40 durma eşiği doğru yerde mi, ve 24 koşuluk pilotta anlamlı biçimde tetiklenebilir mi.
3. Bölüm 4'teki kirlenmeye karşı önlemler yeterli mi — eksik bir kirlenme kaynağı görüyor musun.
4. `native` kolu gerçekten adil mi kurulmuş: Core'un sözleşme şablonundan yönerge sızmaması yetiyor mu, yoksa başka bir asimetri kalıyor mu.

## Elindeki olgular

- Plan: `docs/BENCH.md` (90 satır). Maliyet modeli: `docs/COST-MODEL.md`. Koltuk tablosu: `core/tiers.json`.
- Ağaç `main`, `3841bc6`, temiz. v0.15.0. `npm test` dört suite yeşil, `test/all.js` 2.672 sav.
- Bugün kapanan iki ölçüm: `docs/raporlar/2026-09-05-danisma-turu-etkisi.md` (8 danışma turunun 8'i de sonraki adımı etkiledi; 001'in A/B deneyi hiç koşulmadı, `sonnet/high` premium builder hücresinde ölçülmeden duruyor) ve `docs/raporlar/2026-09-05-guard-sinir-ve-kapsam.md`.
- Devir notunun açık işlerinden biri: "`sonnet/high` kalıcı sayılmadan önce 20-30 sözleşme yeniden ölçülecek." Bu iş bench'in içinde eriyor mu, ayrı mı kalmalı — buna da bir cümle ayır.
- Bench'i koşacak `bench/run.js` henüz yazılmadı. Depoda `bench/` klasörü yok.
- Ölçüm bu makinede yapılacak: Windows 11, Node 24.19, Claude Code 2.1.241, tek makine.

Türkçe yaz. Kod yazma, dosya oluşturma; tek çıktın rol dosyandaki üç başlıklı ve en fazla 20 satırlık mesaj.

## Donen

## Call
Tasarımı iki yerde düzelt, sonra pilotu koş: pilot+36 birleştirmesi ancak profil, görev seti, `bench/run.js` ve Claude Code/model sürümü önceden dondurulup koşular görev-bloklu ve karışık sırayla verilirse aynı kümeye girer; %40 eşiği pilotta karar kuralı olmaz, yalnız "devam/durdur" bayrağı olur; `native` kolu temiz HOME ile koşar.

## Why
24 koşu = görev×profil başına 3 tekrar; LLM koşularında tekrar-içi sapma zaten %30-50, o yüzden %40 fark gürültüyle de tetiklenir ve pilottan sonra bakıp devam etmek isteğe bağlı durdurmadır, yanlış pozitif oranını şişirir. Kalan 36 koşu farklı günde/sürümde koşarsa "pilot" bir yığın etkisi olur; batch id ile işaretle, analizde görev blok faktörü olsun, 2 pilot görevi 5'in rastgele örneği değilse pilot sonucunu 5'e genelleme. `native` için şablon sızmaması yetmez: bu makinede küresel CLAUDE.md, RULES.md, otomatik hafıza (`~/.claude/projects/.../memory`), RTK kancası ve yazar-sözleşmesi kancası her kola biniyor; bunlar Core ekosistemidir, native kolu bunlarsız koşmalı, Core kolu ise danışma turlarının tokenini kabul-başına maliyete katmalı.

## Missed
- Plan metni bana verilmedi; Bölüm 4'ü görmeden söyleyebildiğim eksik kaynaklar: otomatik hafıza dosyası, çalışma ağacında önceki koşudan kalan artıklar (worktree/npm cache), model tarafındaki sessiz sürüm kayması, koşuları yazan T0'nun ilk sonuçları görüp sonraki görevleri şekillendirmesi.
- Kabulü kim yargılıyor? Kolu bilen yargıç (aynı model ya da T0) yanlıdır; yargılama kör olmalı, koşu çıktıları kol etiketi olmadan sunulmalı.
- `native` kolunun koltuğu: tiers.json'daki hangi model/effort ile eşleşiyor belirtilmemiş; eşleşmezse ölçülen şey harness farkı değil koltuk farkı olur.
- `sonnet/high` işi ayrı kalsın: o Core içi bir koltuk seçimi, bench ise harness-vs-native; ancak 4 profilden biri `sonnet/high` builder ise 20-30 sözleşme yeniden ölçümü bench'in Core kolunun yan ürünü olur, ayrı koşuya gerek kalmaz.
- Metrik önceden yazılı mı: token, süre, kabul oranı, tur sayısı — eşik hangisine bağlı ve yönü ne, koşmadan önce tek satırla sabitlenmeli.
