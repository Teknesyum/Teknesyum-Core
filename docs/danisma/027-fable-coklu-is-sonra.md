# Danışma 027 — Çok işli istem ve sonra.md (fable cevabı)

Girdi: `027-fable-coklu-is-sonra-girdi.md`. Öncesinde netleştirme: `docs/netlestirme/005-birden-cok-is-gelen-istemde-birini-yap-g.md`. Model fable, 54.264 token, 42 sn, araç yok.
Cevap olduğu gibi:

---

## Hüküm

**1. "Birini yap, gerisini ertele" mantıklı mı?** Hayır. RULES.md ile doğrudan çelişiyor: sahibin tek istemde verdiği beş iş için üç istem daha yazmak zorunda kalması, "kapsamı kendi başına daraltma"nın tam tanımı. 025'teki öneri "ertelediysen unutma" idi; yordama "do one" olarak geçmesi bir çeviri hatası, kararın kendisi değil. Gözlenen davranış (bir al, dördü yaz; sonra bir daha al, üçü yaz) kuralın modeli bir "varsayılan ertelemeye" ittiğinin kanıtı.

**2. Doğru kural.** İstemdeki her iş aynı turda biter: verilen sırayla; birbirinden bağımsız ve aynı dosyaya dokunmayanlar paralel alt ajanla. Erteleme yalnız üç halde: (a) iş sahibin kararını bekliyor, (b) iş depo dışında bir şeye takılı (eksik erişim, kırık bağımlılık), (c) %60 devir notu tetiklendi. "Çok iş", "beş dosyayı aşıyor", "karmaşık" erteleme sebebi değil — K0 zaten cevabı veriyor: plan.md yaz, aynı turda yapıma devam et.

**3. sonra.md kalsın mı?** Kalsın, rolü değişsin: "yapmamayı seçtiklerim" kuyruğu değil, **gerekçeli istisna defteri**. Her satır sebebini taşır (`- iş — sahibin kararı bekleniyor`). Çoğu tur boş; mod.js yalnız dosya varken bastığı için sıradan tura maliyeti sıfır. Sahibin kalıcı istekleri yine YOL-HARİTASI/plan.md'de, iki kuyruk ayrı (005'teki 3. cevap doğru).

**4. Yazılacak metinler.**

CLAUDE.md (mevcut cümlenin yerine):
```
Every job in a prompt is done in that turn: in the given order, or in parallel subagents when
independent and not touching the same files. Defer only what waits on my decision, is blocked
outside the repo, or hits the context handoff — write it to `.claude/sonra.md` with the reason,
say so in one line. Deferring for size or count is scope-narrowing: five files or more means
`docs/plan.md`, then build on in the same turn.
```

yordam.md ("do one, write the rest" cümlesinin yerine):
```
Within a session: a prompt with several jobs → all in that turn (sequence, or parallel subagents
when independent). `.claude/sonra.md` holds only reasoned exceptions (`- job — reason`): waiting
on the owner, blocked outside the repo, or the context handoff. `mod.js` hands it back on the
next prompt and moves it to `trash/sonra-<ts>.md`; `handoff.js` notes it if the session ends first.
No postread (fable, docs/danisma/025).
```

`mod.sonra` değişsin — şimdiki cümle bekleyeni "söyle, geç" diyor, yani yine erteliyor:
```
Önceki turdan gerekçesiyle bırakılanlar (dosya trash/'e taşındı). Gerekçesi düşmüş olanı bu turda yap, hâlâ bekleyeni tek satır söyle, sonra isteğe geç:
```

**Maliyet.** Kanca yok, her tur okunan yeni metin yok; CLAUDE.md'ye net +2 satır (zaten yüklenen dosya, payı %0,1'in altında). mod.js geri verme mekanizması olduğu gibi kalıyor.
