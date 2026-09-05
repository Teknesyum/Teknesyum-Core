# Fable sözleşme turlarını nasıl kısarız

- soran: T0
- danisilan: fable
- tarih: 2026-09-05

## Sorulan

C:/Users/Teknesyum/.claude/plugins/cache/teknesyum/teknesyum-core/0.15.0/roles/advisor.md dosyasını oku ve onu izle.

Depo kökü: C:\Users\Teknesyum\Desktop\Projeler\Teknesyum Core
Soran: T0, opus. Senin koltuğun: fable/medium.

## Kullanıcının cümlesi

"0 maliyet diye yola çıktığımız bu plugin tüketimi inanılmaz arttırmış. Sebebini araştır, ne yi yanlış yapmışsak düzeltelim. %5-10'dan fazla bir tüketimi kabul edemiyorum."

## Ölçülen veri — pilot bench, click hata düzeltme görevi, tek tekrar

Dört kol koştu, dördü de kabul testini geçti, dördü de aynı düzeltmeyi yaptı. Core kolu = sözleşme altında çalışan ajan; native kolu = aynı koltuk, sözleşme yok, ham görev metni.

| Kol | tur | çıktı | cache okuma | $ | tur başına $ | araçlar |
|---|---|---|---|---|---|---|
| eco (Core) | 26 | 6.188 | 592.318 | 0,2596 | 0,0100 | Read×3 Bash×15 Grep×4 Edit×3 |
| native-eco | 26 | 5.984 | 549.427 | 0,2172 | 0,0084 | Grep×1 Bash×24 |
| normal (Core) | 29 | 8.464 | 729.341 | 0,3221 | 0,0111 | Read×6 Bash×19 Edit×3 |
| native-normal | 20 | 6.924 | 448.893 | 0,2099 | 0,0105 | Bash×18 Edit×1 |

Sözleşme dosyasına dokunan çağrıları tek tek saydım:

- eco: **4 çağrı** — Read (sözleşmeyi oku), Bash (sözleşmeyi oku), Edit (status: active), Edit (status: submitted + checkpoint)
- normal: **5 çağrı** — Read, Bash, Edit, Read, Edit

Tur başına maliyet yaklaşık $0,010, yani sözleşme mekanizmasının kendisi eco'da ~$0,040, normal'de ~$0,055.

Farkla karşılaştır: eco Core − native-eco = **$0,0424**. normal Core − native-normal = **$0,1122**, ama normal 29 tur, native-normal 20 tur sürmüş; aradaki 9 turun çoğu ajanın kendi yolunun uzunluğu, mekanizma değil.

Tur başına maliyet Core ve native'de neredeyse aynı ($0,0084–$0,0111). Yani mekanizma turları pahalılaştırmıyor, **tur sayısını artırıyor**. Turun pahalı olmasının sebebi her turun bütün bağlamı yeniden okuması: tur başına ~22.000 token cache okuma.

Ek olgu: Core'un dört bağlam kancasını (`UserPromptSubmit`, `SessionStart`, `Stop`, `MessageDisplay`) tek tek çalıştırdım, dördü de sıfır bayt döndü. Yani sıradan turda bağlama hiçbir şey enjekte edilmiyor; `docs/COST-MODEL.md` "sıfır sürekli token" iddiasını bu anlamda tanımlıyor ve iddia ölçümle tutuyor.

## Sorular

1. Sözleşme mekanizmasının bedeli bu görevde 4-5 tur. Kapının güvencelerini (owns sınırı, bağlanma, kabul kaydı, mühür) kaybetmeden bu turları 1-2'ye indirmenin doğru yolu ne? Aklımdakiler: sözleşme metnini dosyaya okutmak yerine prompt'a gömmek; "işe başlamadan status: active yaz" adımını kaldırıp bağlanmayı ilk kaynak yazımında yapmak; status ve checkpoint'i tek yazımda birleştirmek. Hangileri güvenceyi bozar?

2. Sabit 4-5 turluk bir ek yük, görev büyüdükçe oransal olarak küçülür. Kullanıcının %5-10 tavanı hangi görev büyüklüğünde tutar, ve bu tavanı "sabit tur sayısı" cinsinden ifade etmek daha mı dürüst olur?

3. Bu ölçüm tek koşu ve tek görev. Kullanıcı sonuca üzüldü ve düzeltme istiyor. Elimizdeki veriyle "mekanizmanın bedeli şudur" demek dürüst mü, yoksa önce tekrar mı gerekiyor?

Türkçe yaz. Kod yazma, dosya oluşturma; tek çıktın rol dosyandaki üç başlıklı ve en fazla 20 satırlık mesaj.

## Donen

## Call
Ajanın sözleşmeye dokunan turunu sıfıra indir: bağlanmayı (status: active) ajan değil, onu başlatan T0 yazsın; sözleşme metni prompt'a gömülsün; ajan yalnız işini bitirince tek Edit ile submitted + checkpoint yazsın. Tavanı yüzde değil "ajan başına ≤1 sabit tur + T0'da N tur" diye ifade et. Sonucu açıklamadan önce üç tekrar koş.

## Why
Tur başına maliyet iki kolda eşit; bedel yalnız tur sayısıdır. Sözleşmeyi ayrıca okumak 2 tur, bağlanmak 1 tur, submit 1 tur — ilk üçü ajanın işi değil. Bağlanma T0'a taşınınca "owns sınırı" ve kilit zayıflamaz: T0 zaten sözleşmeyi yazan taraftır, aynı anda ikinci ajan göndermeyen de odur. Mühür `complete` betiğinde, ajanda değil; dokunulmaz.
Sabit $0,04–0,05 yük, %10 tavanı ancak ≥$0,45'lik görevde, %5'i ≥$0,90'da tutar; bu görev $0,21. Tek turla yük $0,01'e iner, tavan $0,20'de tutmaya başlar.
n=1'de sayılabilir olan tek şey 4–5 dokunuştur; normal kolundaki fazla 9 turun "ajanın kendi yolu" olduğu henüz kanıt değil, varsayım.

## Missed
Kullanıcının "0 maliyet" beklentisi bağlam enjeksiyonu içindi ve ölçüm bunu doğruluyor; kullanıcı ise toplam görev maliyetini ölçüyor. Önce bu tanım farkı kullanıcıya bir cümleyle söylenmeli, yoksa düzeltme yanlış yere gider.
Bench T0'ın kendi turlarını saymıyor: sözleşmeyi yazmak, ajanı başlatmak, `complete` ve verify — mekanizmanın asıl bedeli büyük ihtimalle orada, ajanda değil. Bu sayılmadan "%5–10" sözü verilemez.
Ajan sözleşmeyi hem Read hem Bash ile okumuş — aynı dosya iki kez. Bu mekanizma değil, rol metnindeki talimatın bulanıklığı; en ucuz kazanç budur.
Üç tekrar dört kol için ~$1; kullanıcıya bu rakamla sorulur, koşulmaz.
