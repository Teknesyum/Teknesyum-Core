# Ameliyat sonucu — kesim, katlama ve %5 tavanı

**Tarih:** 2026-09-05. **Yetki:** kullanıcı, "tüm yetki Fable'da, ne gerekiyorsa yap".
**Plan:** Fable, [danisma/019](../danisma/019-fable-ameliyat-plan-tam-yetki.md). **Kısıt:** native'e
göre toplam tüketim farkı ≤ %5, istisnai %10.

Eşikler koşudan önce yazıldı ve sonuç ne çıktıysa o yazıldı; ölçüm istenene kadar
tekrarlanmadı.

## Ne kesildi

Fable'ın listesi: hiçbiri bir ölçüme dayanmıyordu, hepsi bakım yüküydü.

| Parça | Ne yapıyordu | Nereye gitti |
|---|---|---|
| güncelleme kontrolü (`update.js`) | SessionEnd'de GitHub'a bakıyor, doctor denetimi ve banner satırı ekliyordu | `trash/`; kurulu sürümü okuyan 8 satır doctor'ın içine indi |
| OWED defteri (`handoff.js owe`) | bir sözü her prompt'a geri taşıyordu — sıradan turda bağlama yazan tek kanca yoluydu | kod, kapı kontrolü, prompt ipucu, skill bölümü, 17 sav |
| fan-in sinyali | sahipli dosyayı ≥5 dosya içe alıyorsa modeli yükseltiyordu | `map.js fanIn`, `tiers.json`, README basamağı, savlar |
| `raise:` mührü | sözleşmedeki plancı yükseltmesini ilk yazımda mühürlüyordu | `schema.raiseOf`, `watch.js` mühür yazımı, savlar |
| round-4 danışman zorunluluğu | üçüncü yeniden açılışta Fable'ı şart koşuyordu | `secondOpinion`, `roleRecord`, `ADVISOR_FROM`, savlar |

Kesilmeyenler ve neden: `verify` kapısı — gözlemsel kanıtı yok ama bedeli sıfır tur
(`complete` içinde koşuyor). `manset.js` — Fable kendi kararını geri aldı: en pahalı kusuru
(22 sözleşmede manşet kayması) sıfır model bedeliyle yakalayan tek deterministik parça.
Denetçi — kanıtı olan tek parça (72 ek turun 33'ü), ama turu 95-100k token; %5 tavanı altında
zorunlu olamaz, yalnız `risk: high` ve istek üzerine. Tanımsız kaldığı için dokunulmayanlar:
"banner ayrıntısı", "advice.js dışı danışma kanalı".

Kesim sırasında düzelen bir gerileme: `normal` profilde danışman hücresi `off` olunca
`overDispatch` boş modelle karşılaştırıp "advisor resolves to ." deyip **engelliyordu**; muafiyet
kalkınca altından çıktı. `off` "tavan yok" demektir, "danışman yok" değil.

Toplam: **7.781 → 7.480 satır**, `test/all.js` 2.677 → 2.640 sav (kesilen davranışların
savları düştü, yeni davranışların savları eklendi), dört suite yeşil.

## Ne katlandı

Koordinatör bir turu sözleşme dosyasını yazmaya, bir-iki turu kapatmaya harcıyordu; ajan
bir turu bağlanmaya. Hepsi zaten olan çağrılara bindi:

- **Sözleşme prompt'un içinde gidiyor** (`<<<SOZLESME>>>` … `<<</SOZLESME>>>`). `PreToolUse`
  dosyayı ajan var olmadan yazıyor; blok bozuksa ya da `id:` yoldaki kimlikle çelişiyorsa
  dispatch'i reddediyor; var olan dosyanın üstüne asla yazmıyor. (`hooks/embed.js`)
- **Kapanış `SubagentStop`'ta koşuyor.** Bağlı bir builder durunca `submit` + `complete` ayrık
  bir süreçte koşuyor, hüküm `live/_kapanis/<ID>.json`'a yazılıyor. Kırmızı verify ya da
  reddedilen mühür sözleşmeyi `submitted` bırakıyor; hiçbir şey tekrar denemiyor.
  (`hooks/autoclose.js`) Tetik ajan tipinin adına değil sözleşmenin `role:` alanına bakıyor.
- Builder rolü sözleşmeye hiç dokunmuyor; `SKILL.md` şablonu ve kapanış bölümü buna göre.

## Ölçüm — katlanmış akış, 3 koşu

Aynı dondurulmuş `click` görevi, `sonnet/low`, pinlenmiş taze klonlar, kabul betiği bağımsız.
Native tabanı önceki üç tekrar (aynı klon ve sanal ortam düzeni).

| | native | Core, katlanmış |
|---|---|---|
| ajan turu | 11 / 9 / 12 → **11** | 10 / 10 / 15 → **10** |
| ajan $ | 0,1079 · 0,0940 · 0,1151 → **0,1079** | 0,1068 · 0,1106 · 0,1403 → **0,1106** |
| ajan $ farkı | — | **+%2,5** |
| T0 turu (3 koşu toplam) | 6 | **4** |
| kabul testi | 3/3 | 3/3 |
| kanca kapanışı | — | `submit` 0/3 koşuda, `complete` üçünde de durdu |

**Eşik:** T0 turu Core ≤ native **ve** ajan $ farkı ≤ +%5. İkisi de tuttu.

T0 tarafında Core'un koşu başına ek turu **sıfıra indi**: bekleme turu bir sonraki dispatch ile
birleşince 3 koşu 4 turda bitti; native protokolü 6 turdu. Ajan tarafında fark +%2,5, aralıklar
örtüşük.

## Yapısal sınır — %5 tavanının gerçek engeli

Kanca kapanışı üç koşuda da mekanik olarak çalıştı ama `complete` üçünde de aynı sebeple
durdu: **"owns 17 files (limit 8) → high risk → denetçi kaydı şart."** Görev "hatayı
`src/click/` altında bir yerde bul" olduğu için sözleşme paketin 17 dosyasını sahipleniyor;
Core'un kendi risk kuralı bunu yüksek risk sayıp 95-100k tokenlik denetçiyi zorunlu kılıyor.
Bu, %5 tavanının 10 katı.

Yani bugünkü sınır: **yeri bilinmeyen bir hata için açılan, 8'den geniş sahiplikli sözleşme
Core'da %5 bütçesiyle mühürlenemez.** Seçenekler: sahipliği daraltmak (ajana ipucu verir,
ölçümü bozar), dosya sayısı kuralını değiştirmek (ölçüm için ürünü eğmek olur, yapılmadı), ya da
o durumda denetçi bedelini kabul etmek. Karar kullanıcının.

## Lekeli koşular ve neden

- **M1:** eski kancalarla koştu. Depo `core/` düzenlemeleri kurulu eklenti önbelleğinde canlı
  değildi; duman testleri depo dosyasını doğrudan çağırdığı için geçmişti. Önbellek depoyla
  eşitlendi; kalıcı çözüm günlükte.
- **M2:** kimlik çakışması — sabahki scout sözleşmesi de `M2` idi, `submit` "zaten `done/`
  altında" dedi; ayrıca `SubagentStop` bildirimi tam benim izleme eklerken önbelleği kırdığım
  pencereye denk geldi. `KAT2` olarak yeniden adlandırılıp kapatıldı.
- **KAT4 (ilk):** klon `m-1` yeniden kullanıldı, M1'in düzeltmesi içindeydi; öldürüldü, taze
  klonda tekrarlandı.

## Yol boyunca bulunan ve düzeltilen

- `maliyet.js` harness'in `<synthetic>` kayıtlarında çöküyordu; artık atlıyor, savı var.
- Kancalar `${CLAUDE_PLUGIN_ROOT}` altındaki kopyayı koşturuyor; geliştirme deposu canlıya
  çıkmıyor. Doctor'a "önbellek depoyla aynı mı" denetimi önerildi (günlük).
- Bir builder ajanı, `owns` içindeki `guard.js`'te OWED'i değil **bağsız-ajan korumasını** silip
  savlarını da silince takım yeşil kaldı. `owns` nereye yazıldığını sınırlıyor, ne yapıldığını
  değil. Geri alındı, günlükte.

## Kayıtlar

Ham veri: `bench/katlama-kol-maliyet.jsonl`, `bench/katlama-anlik.jsonl`. Kanca hükümleri:
`.claude/relay/live/_kapanis/KAT{3,4,5}.json`. Danışma: `docs/danisma/018`, `019`.
