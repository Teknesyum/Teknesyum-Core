# Tasarım seçenekleri — A/B ölçümü, agency rolleri, tek işçi, bukalemun

**Tarih:** 2026-09-05. **Soran:** kullanıcı. **Danışma:** Fable,
[danisma/022](../danisma/022-fable-tasar-m-se-enekleri-dan-mas.md). **Kısıt:** tüketim artışına
sıfır tolerans.

Kullanıcının dört sorusu sırayla; her birinde olgu, Fable'ın kararı, benim eklediğim ve bedel.

## 1. "A PC'sinde Core var, B'de yok — A ne ödedi, ne aldı?"

**Olgu: bu ölçüm hiç yapılmadı.** Bugüne kadarki bütün kollar tek dev oturumun içinde koştu;
T0 bağlamı 350-440k tokendi ve her tur o bağlamı yeniden okudu. Ajan tarafı temiz ölçüldü
(+%16 medyan, +%21 ortalama), T0 tarafı yalnız tur sayısıyla kıyaslandı. "İki ayrı PC" sorusu
iki taze oturum ister; elimizde o yok.

**Protokol (Fable onayladı, iki düzeltmeyle):**

| kol | nasıl | ne var |
|---|---|---|
| B — Core yok | `claude -p --bare "<görev>"` | kanca, eklenti, LSP, CLAUDE.md **yok** |
| C — Core yok, kurallar var | `claude -p --settings '<eklenti kapalı, kancalar boş>' "<görev>"` | CLAUDE.md var, Core yok |
| A — Core var | `claude -p "<görev>"` | her şey açık, T0 relay skill'iyle builder gönderir |

Üçüncü kol Fable'ın uyarısından geldi: `--bare` CLAUDE.md'yi de kesiyor, "Core yok" ile "kural
yok" ayrışmalı. Ayrıca `settings.json` içinde Core'un `bridge.js` kancası duruyor; C kolunda
o da kapatılır, yoksa B ile A arasında melez olur.

- **Görev:** dondurulmuş `bench/gorevler/01-05` (kabul betikli). Chess960 kullanıcının isteği
  diye yanına n=3 ile eklenir; kalite ölçülmez, tur ve $ ölçülür.
- **T0 modeli ve effort üç kolda sabit** (bugün: opus). Aksi halde kol farkı model farkı olur.
- **n=5 / görev / kol.** A kolunda ilk koşu eklenti system prompt'unu cache'e yazar, pahalıdır;
  ayrı raporlanır.
- **Ölçülen:** oturum toplam $ (T0 + bütün alt ajanlar, `bench/maliyet.js`), T0 turu, ajan
  turu, pass@1, süre.
- **"A ne aldı" — yalnız sayılabilenler:** pass oranı, ilk denemede mühürlenen sözleşme sayısı,
  günlük ve mühür satırı adedi, kapı reddi sayısı. "Güvenlik hissi" sayılmaz.
- **Eşik, koşudan önce:** A toplam $ > C toplam $ × 1,10 → hava cıva. A ≤ C × 1,05 → geçer.
  Arası → kullanıcı karar verir.

**Bedel:** 5 görev × 3 kol × 5 tekrar = 75 koşu + chess960 9 koşu = 84 koşu. Koşu başına
~$0,15-0,40 (taze oturum, T0 opus küçük bağlam) → **~$15-30, 3-4 saat** (koşular art arda,
paralel değil; paralel koşu cache paylaşımını bozar). Hazırlık: koşucu betik + kabul çağrısı,
~1 saat T0 işi. **Yapılmadı; ikinci söz bekliyor.**

## 2. agency-agents pasif veritabanı, advisor talep üzerine okur

**Olgu:** 273 rol, medyan ~3.400 token. Bir rolü system prompt'a sokmak koşu başına ~+%20;
273'ünü `~/.claude/agents`'a kurmak her T0 turuna ~18k token sabit yük
([kıyas raporu](2026-09-05-agency-agents-kiyas.md)).

**Fable: evet, sıfır maliyetle olur.** Tasarım:

- Depo `~/.claude/teknesyum-ozel/agency/` altına klonlanır. **Hiçbir dosya `~/.claude/agents`'a
  girmez**, hiçbir rol Claude Code'a agent olarak tanıtılmaz. Tetik yokken bedel sıfır bayt.
- `advisor.md`'ye tek satır: prompt `@agency:<rol>` içeriyorsa advisor önce o dosyayı okur,
  sonra kendi rolünü uygular. Okuma o çağrıya sınırlı: +3.170 token, o tur. Sonraki tura
  taşınmaz çünkü advisor tek turluk, kapanır.
- Kullanıcı tetikler ("`?? @agency:security-engineer` şu tasarıma bak") ya da T0, konu rol
  kataloğundaki bir alanla çakışıyorsa önerir — kendi başına açmaz.
- Kataloğun `name`/`description` listesi (~18k token) bağlama **girmez**; T0 ihtiyaç duyarsa
  `rg` ile arar, o da bir araç çağrısı.

Bedel: klon 1 komut, advisor'a 3 satır, savı 1. Bakım: depo güncellemesi elle, `git pull`.

## 3. "Bütün ajanları kaldır, tek işçi rol dosyasını okusun"

**Bu zaten mevcut tasarım.** `agents/worker.md` tek ajan tipi, 10 satır; "prompt bir rol
dosyası adlandırır, önce onu oku" der. Roller `core/roles/*.md`: builder 894 B, planner 964,
scribe 1.063, scout 1.656, auditor 2.480, advisor 2.893 — toplam ~2.500 token, hepsi birden
değil, çağrılan okunur. Kullanıcının tarif ettiği şey 0.14'ten beri çalışıyor.

Kalan kazanç iki yerde:

| | bugün | kes | kazanç |
|---|---|---|---|
| `bench-low/medium/high` agents | üründe değil ama `.claude/agents`'ta, her T0 turuna tanımları giriyor | bench klasörüne taşı, yalnız bench oturumunda yükle | T0 turu başına ~150 token |
| `advisor.md` | 2.893 B, `??` bölümü ve giriş uzun | 1.500 B'ye kırp | advisor çağrısı başına ~350 token |

İkisi de küçük; toplamda %1'in altında. Ajan tarafındaki +%16'nın bununla ilgisi yok — o
fark rol dosyasından değil, ajanın kabul betiğini kendisi koşturmasından (~%8) ve keşif
oynaklığından geliyor.

## 4. Bukalemun — tek uzun ömürlü ajan, rol değiştirir, iş bitene dek kapanmaz

**Fable: hayır, pahalı.** Sayıyla:

- Rol okuma tasarrufu: ~1.000 token / rol geçişi, bir kez.
- Bağlam birikimi: her tur bütün bağlam yeniden okunur. 100k bağlamda sonnet'te ~$0,03/tur,
  ve büyür. Advisor'ın cevabı, okuduğu dosyalar, builder'ın diff'i hepsi kalır.
- Denge: **≤3 rol geçişi ve toplam ≤15 tur** ise bukalemun ucuz; 15 tur sonrası her tur,
  taze ajanın rol dosyasını yeniden okumasından daha pahalı. Bizim koşular 9-17 tur; sınırın
  üstünde başlıyor.
- **"Rolden arınma" bir modelde olmaz.** Advisor cevabı bağlamda kalır, builder onu görür,
  ikinci görüş ilkesi bozulur (advisor asker'in taslağını görmez kuralı).
- **Guard tek sözleşme bağlar.** Bir ajan kimliği ikinci sözleşmeye geçemez; bukalemun ya
  kapıyı gevşetir ya tek sözleşmede kalır.
- Mekanik olarak mümkün: `SendMessage` ile ajan yeniden uyandırılır, bağlamı korur. Yani
  "kapanmasın" zaten var; pahalı olan kullanmak.

Ucuz olduğu tek yer: aynı builder'ın aynı sözleşmede kırmızı verify sonrası ikinci turu.
Bunu zaten `SendMessage` yapıyor, yeni tasarım gerekmez.

## Fable'ın "kaçırdığın" listesi, olduğu gibi

- A/B'de T0 modeli sabitlenmeli; yoksa kol farkı model farkı olur.
- `--bare` CLAUDE.md'yi de kesiyor; üçüncü kol gerekebilir. (Eklendi, C kolu.)
- chess960'ı kabul betiği yok diye reddetme; tur/$ ölçülür. (Eklendi, n=3.)
- A kolunda ilk koşu cache yazar; ayrı raporla. (Eklendi.)

## Karar özeti

| soru | karar | bedel |
|---|---|---|
| A/B iki PC ölçümü | protokol hazır, koşulmadı | ~$15-30, 3-4 saat, ikinci söz gerekir |
| agency pasif katalog | yap: klon + advisor'a 3 satır | ~0 tüketim, 1 saat iş |
| tek işçi | zaten var; bench agents'ı taşı, advisor'ı kırp | <%1 kazanç |
| bukalemun | yapma | — |
