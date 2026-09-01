# mem0 (+ Letta/MemGPT)

> Kanıt seviyesi: doküman + kod (kaynak istem dosyası okundu; çalıştırılmadı)

## Kimlik

Depo `mem0ai/mem0`, Apache-2.0, ana dil Python (yanında bir TypeScript istemcisi var).
Son push 2026-09-01 — yani aktif. Kurulum kütüphane olarak: `pip install mem0ai` veya
`npm install mem0ai`; ayrıca self-hosted Docker (`docker compose up`) ve barındırılan
bulut sürümü var.

Bağımlılık sayısı: doğrudan sayılmadı; ama zorunlu olarak bir LLM sağlayıcısı
(varsayılan OpenAI GPT-5-mini), bir embedding modeli (`text-embedding-3-small`) ve bir
vektör deposu (varsayılan örnek Qdrant) ister. Opsiyonel olarak SpaCy (varlık çıkarımı)
ve BM25. Yani "sıfır bağımlılık" ölçütünde ölçülemez: **çekirdek çalışması için ağ
üstünden ücretli bir model çağrısı şarttır**. Bu Core'un Node + sıfır bağımlılık
duruşunun tam karşı ucu.

Letta (eski MemGPT) ayrı bir depo ve ayrı bir kategori: kütüphane değil, **sunucu**.
Ajan durumu PostgreSQL + pgvector'da tutulur, ajan bir servis olarak yaşar.

## Çözdüğü dert

"Ajan benimle konuştuğu her şeyi unutuyor; bir sonraki oturumda kim olduğumu ve neyi
tercih ettiğimi yeniden anlatmak zorunda kalıyorum."

## Veri akışı

mem0'da akış iki fazlıdır ve ikisi de LLM çağrısıdır:

1. **Çıkarım.** Konuşma mesajları bir LLM'e verilir, "hatırlanmaya değer olgu, karar,
   tercih" listesi döner.
2. **Güncelleme.** Çıkarılan her olgu, aynı kullanıcı uzayında vektör benzerliğiyle
   bulunan mevcut belleklerle birlikte ikinci bir LLM'e verilir; model her olgu için bir
   **olay** seçer: `ADD`, `UPDATE`, `DELETE`, `NONE`.

Çelişki tam olarak burada çözülür ve mekanizma şudur: **çelişen bellek güncellenmez,
silinir.** Kaynak istem dosyasının kuralı, yeni olgu mevcut belleğin tersini söylüyorsa
eski kaydın `DELETE` edilmesi yönünde; `UPDATE` yalnız "aynı şeyin daha zengin hâli"
için. Yani zıtlık = sil + ekle, incelme = güncelle.

Not — sürüm farkı: resmî dokümanın güncel "memory operations" sayfası, yeni algoritmanın
**tek geçişli ve yalnız-ADD** olduğunu, belleklerin biriktiğini ve hiçbir şeyin üzerine
yazılmadığını söylüyor; çelişki artık silme ile değil, **zamansal akıl yürütme** ile
(sorgu için doğru tarihli örneği sıralayan zaman-farkında getirme) ele alınıyor. Kaynak
koddaki dört-olaylı istem hâlâ duruyor. İki tasarım da depoda mevcut; hangisinin varsayılan
olduğu doğrulanmadı — bu ayrım Core açısından fikir olarak önemli, çünkü iki farklı
çelişki felsefesi sunuyor.

Okuma tarafı: sorgu anında **çok sinyalli getirme** — semantik benzerlik, BM25 anahtar
kelime ve varlık eşleşmesi paralel puanlanıp birleştiriliyor. Depolama vektör
veritabanında; güncelleme her mesaj turunda (`add`) ya da talep üzerine.

**Letta'nın bellek mimarisi** başka bir eksende durur ve fikir olarak Core'a daha
yakındır. Letta bağlam penceresini bir işletim sisteminin RAM'i gibi görür: küçük ve
pahalı. Üç katman vardır — **core memory**, prompt'a sabitlenmiş, ajanın kendi
araçlarıyla (`memory_replace`, `memory_rethink`) yeniden yazabildiği düzenlenebilir
bloklar; **recall memory**, diskteki tam mesaj geçmişi, `conversation_search` ile
taranır; **archival memory**, gömme ile yazılıp benzerlikle okunan vektör deposu
(`archival_memory_insert` / `archival_memory_search`). Sayfalamayı çerçeve değil ajanın
kendisi yapar: neyin RAM'de kalacağına araç çağırarak karar verir. Ayrım şudur — core
memory **her turda bağlamdadır** (yani sabit pasif yük), archival **yalnız istendiğinde**
gelir. Core'un "sıradan turda sıfır token" kuralı, Letta'nın core memory'sini baştan
reddeder; archival deseni ise kuralla uyumludur.

## Bağlam maliyeti

Pasif yük: mem0 bir eklenti kancası değil kütüphane olduğu için, **sıradan turda kendi
başına bağlama sıfır token yazar** — ta ki entegrasyonu yapan taraf her isteme
`search()` sonucunu enjekte edene kadar; tipik kullanım kalıbı tam olarak budur ve o
noktada pasif yük getirilen bellek sayısı × bellek uzunluğu olur. **Tahmin:** 5-10
bellek × 15-30 token = **tur başına 100-300 token** (ölçülmedi).

Çağrı başına yük Core için asıl mesele değil, çünkü asıl maliyet token değil **LLM
çağrısı**: her `add()` en az iki model çağrısı (çıkarım + güncelleme kararı) ve her
`search()` bir embedding çağrısı demek. **Tahmin:** yazma başına ~2 çağrı, gecikme
saniyeler mertebesi.

Letta'da pasif yük tanım gereği sıfır değildir: core memory blokları her istemde
bağlamdadır. **Tahmin:** blok başına 100-500 token, tipik 2 blok (persona + human).

## Core'daki karşılık

Core'da **bellek organı yok** — en yakın akrabaları, hafızayı bellek olarak değil
**defter** olarak tutan iki yapıdır: `audits/ledger.jsonl` (kapanan her sözleşmenin
sonucu, riski, HEAD sha'sı) ve `log.js` (hata günlüğü, `BUG-` önekli markdown dosyaları).
Sözleşmelerin `## Checkpoint` bölümü de bir tür çalışma belleğidir: iş ilerledikçe
güncellenir, sonda değil.

Hiç olmayan kısımlar: olgu çıkarımı, benzerlikle getirme, çelişki çözme, katman ayrımı,
bir belleğin zaman içinde yanlışlanması kavramı. Core'da bir kayıt yanlışsa kimse fark
etmez; hiçbir şey onu silmez.

Core'un daha iyi olduğu kısım keskin: **defter ekleme-önce (append-only) ve
kriptografiktir.** `seal.js` sahip olunan dosyaların digest'ini alır, denetim kaydı
`headSha` + `diffHash` ile bağlanır ve kullanıldığında tüketilir. mem0'ın belleği bir
modelin yargısıdır; Core'un defteri bir dosya digest'idir. Biri ikna edilebilir, diğeri
edilemez. Ayrıca Core'un kaydı düz metindir — git ile diff'lenir, insanla okunur, model
gerektirmez.

## Çalınabilir fikir

1. **Dört-olaylı güncelleme kararı olarak `DELETE`-önce çelişki kuralı.** Mekanizma:
   yeni bilgi eskisiyle *zıt* ise güncelleme değil silme + ekleme; yalnız *zenginleşme*
   ise güncelleme. Core'da uygulanacağı yer `log.js`: bir `BUG-` kaydı, sonradan gerçek
   sebebin başka olduğu anlaşıldığında düzeltilmiyor, tarihçesi bozuluyor. Zıtlık →
   yeni kayıt + eskisine `superseded-by` alanı, incelme → aynı kayda ekleme.
   **Altın kuralı ihlal eder mi — hayır.** Karar anı yazma anıdır (`log.js write`),
   sıradan turda hiçbir şey çalışmaz. Ama LLM ile karar vermek pahalıdır; Core'da bunu
   kaydı yazan ajan tek satırda beyan etmeli, ayrı bir model çağrısı olmamalı.

2. **Zaman-farkında getirme (temporal ranking).** Mekanizma: her kaydın bir tarihi var,
   aynı konudaki kayıtlar arasında en yeni olan öne alınıyor, eskisi silinmiyor.
   Core'da: `ledger.jsonl` zaten `at` alanı taşıyor; bir `ledger --topic <yol>` alt
   komutu, o dosya yolunu `owns`'unda geçiren kapanmış sözleşmeleri en yeniden eskiye
   dizebilir. Bu, "bu dosyaya en son ne oldu ve niçin" sorusunun cevabıdır.
   **Altın kuralı ihlal eder mi — hayır.** Talep üzerine çalışan bir alt komut; kanca yok.

3. **Letta'nın core / archival ayrımı, "her turda mı yoksa istendiğinde mi" ölçütü
   olarak.** Mekanizma bir veri yapısı değil, bir **sınıflandırma kuralı**: her bellek
   parçasına "bu her istemde bulunmalı mı?" diye soruluyor ve cevabı hayır olan her şey
   araçla çağrılan bir depoya sürülüyor. Core bunu zaten uyguluyor ama adlandırmıyor;
   adlandırmak, gelecekte bir kancanın bağlama yazma isteğine karşı hazır bir cevap
   verir: "bu archival'dır, çağrılır."
   **Altın kuralı ihlal eder mi — hayır; tam tersine kuralın genelleştirilmiş hâli.**

4. **Çok sinyalli getirme (semantik + BM25 + varlık, paralel puanlanıp birleştirilir).**
   Core'un vektörü ve embedding'i yok, olmamalı da. Ama sinyal birleştirme fikri
   modelsiz de çalışır: `map.js` import grafiği + dosya yolu eşleşmesi + `ledger.jsonl`
   tarihçesi, üç sinyal olarak toplanıp "bu işe bakarken hangi dosyalar okunmalı"
   sıralaması üretebilir. **Altın kuralı ihlal eder mi — hayır**, indeks talep üzerine
   üretiliyor (`map.js` zaten böyle çalışır).

## Ret adayı gerekçe

mem0'ın çalışması için ağ üstünden bir LLM'e ve bir vektör veritabanına ihtiyacı var.
Core'un tüm kimliği, "sıfır bağımlılık, Node, dosya sistemi"nde duruyor; mem0'ı almak
Core'a bir API anahtarı, bir gömme modeli ve bir servis bağımlılığı sokmak demek. Üstelik
belleğin doğruluğu bir modelin yargısına emanet: bir olgu yanlış çıkarıldığında ya da
yanlış `DELETE` edildiğinde bunu yakalayacak bir kapı yok — Core'un tüm sözleşme
mimarisi ise tam olarak "modelin beyanına güvenme, diff'e bak" üzerine kurulu. Bellek
katmanı bu ilkeyi tersine çevirir.

## README cümlesi

You do not need to install this: Core keeps its memory as an append-only, hash-sealed
ledger of closed contracts rather than as model-inferred facts in a vector store, so
there is nothing to embed, no API key to hold, and nothing that can be forgotten by a
wrong inference.
