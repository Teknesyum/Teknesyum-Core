# HydraFusion — Araştırma Raporu

Tarih: 2026-09-11. Kaynak: web araması (aşağıda linkli). Uydurma yok; kaynağı
olmayan hiçbir sayı veya iddia yazılmadı.

## 0. Kimlik Netleştirme

"HydraFusion" adında en az iki bağımsız şey var:

| Aday | Ne | Olasılık |
|---|---|---|
| **Project HydraFusion (GitHub Copilot CLI)** | Microsoft/GitHub'ın Eylül 2026'da duyurduğu, çoklu-model orkestrasyon araştırma önizlemesi | **Yüksek** — kullanıcının tarif ettiği "bizim sistematiğimize benziyor" ajan/LLM bağlamına uyan tek aday |
| AICPS/hydrafusion (GitHub repo) | 2022 ICCPS makalesi, otonom araç kamera/radar/lidar sensör füzyonu (Faster R-CNN, ResNet-18) | Düşük — konu tamamen farklı (bilgisayarlı görü), MIT lisans, 33 yıldız, LLM/ajan ile ilgisi yok |

Rapor Project HydraFusion (Copilot) üzerine kurulu. AICPS reposu sadece ad
çakışması olarak not düşüldü, derinlemesine incelenmedi çünkü konu alakasız.

## 1. HydraFusion Nedir

Project HydraFusion, GitHub Copilot CLI içinde `/experimental` bayrağıyla
açılan, "araştırma önizlemesi" (research preview) statüsünde bir özellik.
Tek bir model seçmek yerine, her görev için çalışma zamanında bir yürütme
planı kuruyor ve birden fazla sağlayıcının modelleri arasında geçiş yapıyor.

- **Kaynak/repo**: Yok. Kapalı kaynak, yalnızca Copilot CLI içinde çalışan
  bir üründür — GitHub'da bağımsız bir repo, README, yıldız sayısı yok.
- **Olgunluk**: Araştırma önizlemesi, 5 Eylül 2026 civarı duyuruldu. GitHub'ın
  kendi ifadesiyle "sonuçlar, modeller, iş akışları, isimler değişebilir."
- **Lisans**: Yok — Copilot'a bağlı, kapalı, ücretli bir özellik.
- **Erişim**: `/update` → `/experimental on` → `/model` içinden
  "HydraFusion (Research Preview)" seçilir.

## 2. Mimari

Her görev için üç yürütme deseninden biri seçiliyor:

1. **Single** — tek model görevi doğrudan çözer (hız/verimlilik odaklı).
2. **Cascade** — ucuz/hızlı model önce dener; bir kalite kapısı sonucu kabul
   eder ya da daha güçlü modele yükseltir.
3. **Critique** — bir model taslak üretir, farklı bir model ailesinden
   salt-okunur bir "eleştirmen" değerlendirir (rubber-duck benzeri), asıl
   model bir kez revize eder.

Ara adımlar kullanıcıya gösterilmiyor: "HydraFusion iş akışı aşamalarını
gösterir ama ara taslakları saklar, tek bir tutarlı sonuç döndürür." Şu an
yalnızca "ilk tur, tek promptluk" görevlerde öneriliyor; çok turlu oturum
desteği geliştirme aşamasında.

## 3. Maliyet Yaklaşımı

Faturalama, kullanılan tüm modellerin gerçek token tüketimine dayanıyor —
taslak, eleştiri, revizyon, yükseltme, yeniden deneme, geri düşüş dahil "tam
muhasebe." Yani **her tur, kullanılan model sayısı kadar token harcıyor** —
Single modda tek model maliyeti, Cascade/Critique modda iki (bazen üç) model
maliyeti üst üste biniyor.

Hacker News'te **jawns**'ın yorumu: sıralı akış (yönlendirme → planlama →
yürütme → inceleme) hız yerine maliyeti önceliklendiriyor. **Roark66**
ayrıca "modelle harness arasına konan ek yazılım" sonuçları şişirebilir
diyor — yani orkestrasyon katmanının kendisi de bir maliyet ve belirsizlik
kaynağı.

**Bizim sınıflandırmamıza göre**: HydraFusion'ın orkestrasyon katmanı **C
sınıfı** — her turda ödeme yapan bir mekanizma. Bizim altın kuralımız
("sıradan tur native'den fazla harcamaz") ile doğrudan çelişiyor; HydraFusion
zaten bunu hedeflemiyor, o "ucuza yüksek kalite" arıyor, "sıfır ek maliyet"
değil.

## 4. Karşılaştırma Tablosu

| Özellik | HydraFusion | Teknesyum Core | Kim Önde |
|---|---|---|---|
| Model seçimi | Otomatik, çalışma zamanında, çoklu sağlayıcı | Yok — tek model (Claude), Core davranışı hook/prompt-mark ile yönetir | HydraFusion (bu eksende) |
| Her tur ek token | Var — 2-3 model üst üste (Cascade/Critique) | Yok — Z/A sınıfı hedef, C sınıfı istisna | **Teknesyum önde** |
| Şeffaflık/denetlenebilirlik | Düşük — ara taslaklar saklanıyor, sadece aşama adı gösteriliyor | Yüksek — statusline'da sayaç, kanıt kapısı, devir notu görünür | **Teknesyum önde** |
| Kaynak açıklığı | Kapalı kaynak, repo yok | Açık, repo içinde okunabilir (hook'lar, scriptler) | **Teknesyum önde** |
| Kalite/performans kanıtı | 3 bağımsız benchmark (TerminalBench, DeepSWE, CheckpointBench), karışık sonuç | Bench var (`bench/rapor.md`), ama halka açık üçüncü parti benchmark yok | HydraFusion (dış doğrulama açısından) |
| Çok turlu oturum desteği | Yok / geliştirme aşamasında | Var — Core zaten çok turlu ajan/oturum üzerine kurulu | **Teknesyum önde** |
| Danışma / ikinci görüş mekanizması | Critique modu (aynı görev içinde, otomatik) | `ff` fable danışması (kullanıcı tetikli, kayıtlı) | Farklı tasarım, ikisi de geçerli — HydraFusion otomatik, Core kayıt tutuyor |
| Ölçekli araç taraması | Yok | 1000 repo tarandı, 93 alındı, 38 raf/1968 kitap | **Teknesyum önde** |
| Kurumsal destek / dağıtım | Microsoft/GitHub, milyonlarca Copilot kullanıcısı | Tek kullanıcı/proje ölçeğinde eklenti | HydraFusion (ölçek) |

## 5. Bizden İleride Oldukları Yerler

- **Model-çeşitliliği ile kalite arbitrajı**: Farklı sağlayıcıların modellerini
  aynı görevde birleştirip zayıf halkayı güçlü modelle telafi ediyor. Core
  tek model (Claude) ile çalışıyor, böyle bir çapraz-model kontrol mekanizması
  yok. ([GitHub Blog](https://github.blog/ai-and-ml/github-copilot/project-hydrafusion-frontier-quality-via-multi-model-orchestration/))
- **Bağımsız, üç ayrı benchmark üzerinde ölçülmüş, sayılara dökülmüş
  sonuç**: TerminalBench 2.1'de +4,9 puan / %67 daha ucuz; DeepSWE'de -1,5
  puan / %36 daha ucuz; CheckpointBench'te -0,1 puan / %65 daha ucuz (Opus 5
  temel alınarak). Core'un bench raporu kendi iç ölçümü, dış/bağımsız
  benchmark karşılaştırması yok.
- **Kalite kapısı ile otomatik yükseltme**: Cascade modunda ucuz model
  başarısız olursa otomatik olarak güçlü modele geçiyor — kullanıcı hiç
  müdahale etmiyor. Core'da `ff` (fable) danışması kullanıcı/model tetikli,
  otomatik "başarısız oldum, yükseliyorum" mekanizması yok.
  *Not (2026-09-11, sahip):* "altın inek yok". Cascade'in her tur ödenen hâli alınmaz,
  ama yükseltme deseninin kendisi alınabilir: ajan başarısız olunca opus'a geçiş kanca ya
  da betik ile 0 tokenle kurulabilir. Fable'a sorulacak (yol haritası).

## 6. Bizden Geride Oldukları Yerler

- **Maliyet önceliği ters**: Kendi analistlerinin dediği gibi "ucuz modele
  her cascade isteğinde ödeme yapıyorsunuz" — HydraFusion maliyeti *dağıtıyor*,
  *sıfırlamıyor*. Core'un "sıradan tur ek harcamaz" ilkesi HydraFusion'da yok;
  orkestrasyon katmanının kendisi her turda çalışıyor.
- **Şeffaflık düşük**: Ara taslaklar saklanıyor, sadece "aşama" gösteriliyor.
  Core'da kanıt kapısı, sayaç, statusline her şeyi görünür tutuyor.
- **Kapalı kaynak**: İncelenemez, güvenle "bizim sistematiğimize benziyor mu"
  diye kod düzeyinde doğrulanamaz — yalnızca blog/basın açıklamalarına
  güvenilebilir.
- **Kalite iddiası tartışmalı**: VentureBeat'in başlığı net —
  "her benchmark'ta maliyeti düşürüyor, sadece birinde kaliteyi
  eşitliyor/geçiyor." 3 testten 2'sinde Opus 5'in gerisinde kalmış (DeepSWE
  -1,5, CheckpointBench -0,1 puan).
- **Sadece tek-tur görevlerde önerilir**: "First-turn, single-prompt coding
  tasks are the best place to start" — çok turlu, iteratif oturumlarda henüz
  olgun değil. Core zaten çok turlu oturum/devir üzerine kurulu.
- **Bağımsız üçüncü taraf şüphesi var**: Hacker News'te ValentineC, kıyasın
  Opus 5 ile yapılıp daha yeni modellerle yapılmadığını "seçici/aldatıcı"
  buluyor; Roark66 orkestrasyon katmanının kendisinin sonuçları şişirebileceğini
  gösteriyor (Qwen üzerinde basit proxy müdahalesiyle %10 iyileşme).

## 7. Alınabilecek Fikirler

| Fikir | Maliyet Sınıfı Tahmini | Alınmalı mı |
|---|---|---|
| **Kalite kapısı + otomatik yükseltme** (zayıf sonuç tespit edilirse tek seferlik daha güçlü modele/fable'a otomatik geçiş) | **C** — her turda bir kalite kontrolü çalıştırmak gerekir, ya da en azından "başarısızlık sinyali" yakalamak için ek bir okuma | Hayır, mevcut haliyle — altın kuralı bozar. `ff` zaten kullanıcı tetikli eşdeğeri; otomatikleştirmek istenirse önce maliyeti net rakamla tartıp ayrı onay alınmalı. |
| **Critique deseni**: bir işi bitirdikten sonra farklı "sesle" (başka alt ajan/persona) tek seferlik gözden geçirme | **A** — yalnız çağrılınca, oturum başına bir kez tetiklenebilir | Zayıf evet — `aa` ajans zaten benzer bir koltuk sağlıyor; ayrı bir mekanizma kurmak yerine mevcut ajans akışına "bir kez eleştiri" seçeneği eklenebilir. Küçük ek. |
| **Bağımsız/dış benchmark ile ölçülme** (Core'un bench sonuçlarını üçüncü parti bir teste karşı da raporlama) | **Z** (tek seferlik, oturum dışı ölçüm — modelin her turuna maliyet yansımaz) | Evet, düşük riskli — bench zaten var, kıyas eklemek dosya işi, hook değil. |
| **Şeffaflık lehine olan farkı koru**: HydraFusion'ın ara adımları sakladığı modele karşı, Core'un statusline+kanıt kapısı yaklaşımı zaten üstün — burada "onlardan alınacak" bir şey yok, tam tersi savunulacak bir fark. | — | Alınmaz; mevcut tasarım korunmalı. |
| **Çoklu-sağlayıcı model havuzu** (aynı görevde birden fazla LLM sağlayıcısını karıştırma) | **C**, potansiyel olarak **B** (havuz şeması oturum başına kurulursa) | Hayır — Core'un tek-model / Claude Code eklentisi kimliğiyle çelişir, mimariyi kökten değiştirir. Büyük ölçekli, gelecekte ayrıca değerlendirilebilir bir yol haritası maddesi olabilir ama şimdi değil. |

## 8. Kaynaklar

- [Project HydraFusion: Frontier quality via multi-model orchestration — The GitHub Blog](https://github.blog/ai-and-ml/github-copilot/project-hydrafusion-frontier-quality-via-multi-model-orchestration/)
- [GitHub's HydraFusion cuts AI coding costs in every benchmark. It only matches quality in one. — VentureBeat](https://venturebeat.com/orchestration/githubs-hydrafusion-cuts-ai-coding-costs-in-every-benchmark-it-only-matches-quality-in-one)
- [Project HydraFusion: Frontier quality via multi-model orchestration — Hacker News tartışması](https://news.ycombinator.com/item?id=49566788)
- [[Research Preview] HydraFusion is live in GitHub Copilot CLI — GitHub Community Discussion #206492](https://github.com/orgs/community/discussions/206492)
- [GitHub Introduces Project HydraFusion — MarkTechPost](https://www.marktechpost.com/2026/09/05/github-introduces-project-hydrafusion-runtime-multi-model-orchestration-that-builds-a-workflow-per-coding-task-in-copilot-cli/)
- [GitHub - aicps/hydrafusion (alakasız ad çakışması — otonom araç sensör füzyonu, ICCPS 2022)](https://github.com/aicps/hydrafusion)
