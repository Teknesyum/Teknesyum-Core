# Danışma 034: Soru: Core'a "şant" (büyük okuma kapısı) kurulsun mu, nasıl?

claude-fable-5-1, 5.130 çıktı token, 91 sn. Girdi: [034-fable-sant-okuma-kapisi-girdi.md](034-fable-sant-okuma-kapisi-girdi.md). Cevap olduğu gibi:

---

# Danışma 034 — Karar

## 1. Kurmaya değer mi?
**Evet, ama işçisiz "yönlendirici" olarak.** Sıfır token ilkesiyle uyumlu: kanca Node, sıradan turda ses çıkarmaz; yalnız reddettiğinde ~60 tokenlik gerekçe pencereye girer. Asıl kazanç okumanın kendisi değil, **birikim**: erken okunan 5k tokenlik dosya oturum boyunca her turda yeniden gönderilir (önbellek fiyatıyla bile). Kapı bunu keser.

Zarar verdiği yerler ve önlemi:
- **Edit'in Read şartı:** kısmi Read (offset/limit) de dosyayı "okunmuş" sayar; ret gerekçesi "Grep -n ile satırı bul, offset/limit ile 40 satır oku" desin. Bench'te doğrulanacak.
- **Parça parça yürüme:** model 400 satırı 4 parçada okur, aynı token + 4 çağrı. Shunt bunu kabul ediyor; biz sayacağız (bench ölçütü).
- **Sahibin adını verdiği dosya:** "şu dosyayı oku" dendiğinde ret saçma olur. Çözüm ucuz: UserPromptSubmit'te (count.js zaten var) promptta geçen yollar bir duruma yazılır, o dosyalar o tur muaf.
- **Bu depoda neredeyse hiç tetiklenmez:** kancaların hepsi ≤348 satır. Değer büyük depolarda (Projeler altındaki diğerleri). Küçük depoda gecikme yalnız Node açılışı (~50-100 ms/Read), önemsiz.

## 2. İşçi
- **Haiku yok.** Özeti kaybettiği ayrıntı sonraki Edit'i bozar; kazanç yeniden okumaya gider.
- **Tek büyük dosya → işçi değil, hedefli okuma.** Sonnet alt ajanın sabit gideri (sistem istemi + talimat, birkaç k token) tek dosyanın kendisini geçer. Devir yalnız pencereyi korur, faturayı düşürmez.
- **"N dosya, tek soru" → Explore, modeli sonnet'e sabitlenmiş.** Shunt'ın gerçek kazancı burada; özet döner, ham içerik pencereye girmez.
- Ret gerekçesi iki seçeneği açıkça sunsun: hedefli oku ya da çok dosyaysa Explore'a ver.

## 3. Eşik ve istisnalar
- **350 kalsın, ayarlanabilir** (env ya da Core ayarı). Java ölçeğinden geliyor ama bizim kancalar altında kaldığı için zararsız; bench sonucuna göre 300'e inilir.
- **Muaf:** offset/limit taşıyan Read; promptta sahibin yazdığı yol (o tur); `docs/plan.md`, `docs/devir.md`, `.claude/jobs.md` (akış dosyaları, her tur lazım).
- **Muaf değil:** md belgeler. En şişkin okumalar onlardır; "ilk okuma muaf" da olmasın, kapıyı ilk tur delik bırakır.
- **"Aynı dosyaya ikinci deneme geçer" olmasın.** Model bunu bir turda öğrenir, kapı süse döner. Kaçış yolu yukarıdaki muafiyetlerdir.
- **Bash/PowerShell:** yasak.js'e ekle. Boru hattısız, aralıksız `cat`/`Get-Content`/`type` büyük dosyada ret; `head`, `sed -n`, `-TotalCount`, `-Tail`, `| grep`/`Select-String` serbest. RTK'nin `cat` çıktısını zaten kırpıp kırpmadığına bak, kırpıyorsa Bash tarafı gereksiz.

## 4. Bench (kol başına ≤3 tekrar)
- **Kollar:** A kapı yok · B kapı, yalnız yönlendirme · C kapı + çok dosyada Explore/sonnet.
- **Görevler (3):** büyük depoda "anla ve yanıtla" (toplu okuma) · 350+ satırlık dosyada doğrulanabilir düzenleme (test geçiyor mu) · küçük depoda sıradan iş (gerileme var mı).
- **Ölçüler:** ana pencere giriş tokeni (transcript JSONL usage), alt ajanlar dahil toplam fatura, doğruluk (test/çıktı), süre, ret sayısı ve ret sonrası parça okuma sayısı.
- **Karar kuralı:** B, ana pencerede ≥%30 düşüş ve doğruluk kaybı yoksa kurulur. C, toplu görevde **toplam faturayı** B'ye göre de düşürüyorsa eklenir; yalnız pencereyi düşürüyorsa eklenmez.
- Mevcut `bench/run.js` üstüne; sonuç `bench/rapor.md`.

**Özet karar:** kur — yönlendirici kapı, haiku'suz, ikinci-deneme kaçışı yok, sahibin yazdığı yol muaf, toplu okuma Explore/sonnet; önce üç kollu bench, kural yukarıda.
