# Danışma 027 — Çok işli istem ve sonra.md (girdi)

Fable'a olduğu gibi giden metin.

---

Sen Teknesyum Core'un karar ortağısın. Dosya okuma; olgular aşağıda. Cevabın Türkçe olsun, kısa ve kesin: her soruya hüküm, gerekçe tek-iki satır, sonunda yazılacak kural metni.

## Sahibin sözü (aynen)

> şimdi 5 işimiz var t0 yönetici 1.sine odaklandı kalan 4 ünü sonraya yazdı tam stop diyecekti kalan 4 ünü gördü ordan 1 ini aldı 3 ünü sonraya yazdı
> bu şekilde mi çalışıyoruz bu şekilde mantıklı mı fable danışalım

## Şu anki kural (yazılı)

- Global CLAUDE.md: "Work you defer from a prompt goes into `.claude/sonra.md` as a short list, and you say so in one line; the next prompt brings it back and moves the file to `trash/`."
- yordam.md: "Within a session: a prompt with several jobs → do one, write the rest to `.claude/sonra.md` (`- ` lines), say so in one line. `mod.js` hands it back on the next prompt and moves it to `trash/sonra-<ts>.md`; `handoff.js` notes it if the session ends first. No postread: a Stop block would fight the evidence gate (fable, docs/danisma/025)."
- RULES.md (sahibin kuralı): "Don't leave work half done and don't narrow the scope on your own." ve "Build order is mine to pick: in every project, when several things are queued, I choose the best sequence, write it into the roadmap and start; I never ask which first."
- K0: beş dosya ve üstü iş → önce `docs/plan.md`. Sahibin bekleyen istekleri kalıcı olarak `docs/YOL-HARITASI.md`'de.
- Altın kural: sıradan tur native'den fazla tutmaz. Alt ajan çağırmak serbest, sınır yok (kendi bağlamında koşar, ana pencereyi şişirmez). Bağlam %60'ta makine devir notu yazar.

## Kuralın kökeni

Sahip 025'te önermişti: "örneğin bu yaptığım gibi kompleks farklı farklı işler verdim sen birine odaklanmak istiyorsun diğer 3 ünü bi sonraki inputun preread kısmına veya bu mesajın postread kısmına koydun bak şunu şunu yaptım şunlar sonraya saklandı bu şekilde sonraya saklanan hiç bişeyi unutmayacaksın". 025 kararı: "preread kurulsun (`.claude/sonra.md`), postread kurulmasın"; gerekçe: sonra.md modelin bir turluk kısa kuyruğu, Stop bloğu kanıt kapısıyla (dur.js) kavga eder.

Yordama giden cümle "do one, write the rest" oldu. 025'te "tek iş yap" diye bir hüküm yok; öneri "ertelediysen yaz" idi.

## Gözlenen davranış

Bir istemde 5 iş. T0 1.'yi yaptı, 4'ünü sonra.md'ye yazdı. Turu kapatacakken bekleyen 4'ü gördü, 1'ini daha aldı, 3'ünü yine sonraya yazdı. Sahip kalan 3 için yeni istem yazmak zorunda.

## Netleştirme (netlestirme/005) soruları ve cevapları

1. Toplam beş dosyayı aşarsa: plan.md yazılır ve aynı turda yapıma devam edilir. K0'da plan bir durak değil, yapımdan önceki adımdır; plan.md'yi sahibin onayına sunmak yok (yapım sırası benim).
2. Bağlam eşiği: yeni eşik yok, var olan %60 devir notu mekanizması geçerli.
3. sonra.md yalnız T0'ın bir sonraki turuna yazılan kısa kuyruk. Sahibin kalıcı istekleri YOL-HARITASI'na / plan.md'ye gider; iki kuyruk ayrı.
4. Sahipten karar gereken iş yalnız kendisi bekler; bağımsız olanlar sürer.
5. Paralel alt ajan: "bağımsızsa paralel" yeter; aynı dosyaya dokunan iki iş paralel koşmaz.

## Soru

1. "Birden çok iş gelince birini yap, gerisini ertele" mantıklı mı? RULES.md'deki "kapsamı kendi başına daraltma" ile çelişiyor mu?
2. Doğru kural ne? Aynı turda hepsi mi (sırayla ya da bağımsızsa paralel alt ajanla); erteleme hangi durumlarla sınırlı?
3. sonra.md kalmalı mı, rolü ne?
4. CLAUDE.md ve yordam.md'ye yazılacak kural metni: en çok iki-üç satır, İngilizce. mod.js'in geri verirken bastığı Türkçe cümle (`mod.sonra`: "Önceki turdan sonraya bırakılanlar (dosya trash/'e taşındı). Bekleyenleri tek satır söyle, sonra isteğe geç:") değişmeli mi?

Kısıt: sıradan tura sabit token eklemeyen çözüm. Kanca ya da her tur okunan metin önerirsen payını söyle.
