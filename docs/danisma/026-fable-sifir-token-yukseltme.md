# Danışma 026 — Sıfır tokenli yükseltme desenleri (fable cevabı)

Girdi: `026-fable-sifir-token-yukseltme-girdi.md`. Model fable, 51.369 token, 72 sn, araç yok.
Cevap olduğu gibi:

---

## 1. Yükselme deseni (yalnız olay anında, A sınıfı)

**Saptama, üç deterministik sinyalin birleşimi; hiçbiri model okumaz.**
- Ajan tanımı kontratı: her Core ajanı bitmeden `npm test` koşar ve son satırı `DURUM: tamam|düştü` yazar. Ayrıştırmak regex, maliyeti birkaç çıktı token'ı.
- `count.js` kaydı: ağaç karması değiştiyse ve o karma için kayıtlı son çıkış kodu ≠ 0 ise düştü sayılır — ajan "tamam" dese bile kapı bunu geçersiz kılar.
- Boş ya da hata biçimli `tool_response` (Agent aracı hata döndürdü) → düştü.

**Kim başlatır:** PostToolUse(Agent) kancası — `yukselt.js`. Başarıda sessiz (sıfır satır), düşüşte tek `additionalContext` satırı: "Ajan düştü [kanıt: test X, çıkış 1]; aynı görevi `model: opus` ile bir kez yeniden başlat." Yeniden başlatan ana modeldir; kanca ajan açamaz, açmamalı da (bkz. 4). Döngü kilidi: görev karması başına bir yükselme, durum dosyasında.

Tek satır gerekçe: sıfır token olan **karar ve saptama**dır; opus koşusu ve boşa giden sonnet denemesi faturaya girer — bu yüzden yalnız kapı deterministik olduğunda ucuz kalır.

## 2. Aynı ailede ucuz kalite desenleri

| # | Desen | Sınıf | Tek satır |
|---|---|---|---|
| a | Ucuz model + deterministik kapı (test/lint/çıkış kodu yargıç, LLM yargıç yok) | A | Kalite kapısının bedeli sıfır, cascade'in yargıç maliyeti düşer |
| b | Düşüşte yükselme (1'deki) | A | Yalnız düşen görev opus öder |
| c | Yalnız düşen parçayı yeniden koşturmak (kanca düşen test adları + diff'i satıra koyar; retry görevi bütün iş değil o parça) | A | Retry bağlamı küçülür, opus'a giden token 3-5× düşer |
| d | Önbellekli ikinci görüş (`ff` kaydı ağaç karması + soru karmasıyla anahtarlı; isabet varsa kanca dosya yolunu yazar, çağrı yapılmaz) | Z/A | Aynı soru aynı ağaca ikinci kez ödenmez |
| e | Sabit model yönlendirmesi ajan tanımında (Explore=haiku, drudgery=sonnet, karar=opus/fable) | Z | Yapılandırma, tur başına sıfır |

## 3. Öneri ve sıra

**1. a+b birlikte — `core/agents/*.md` kontrat satırı + `core/hooks/yukselt.js` (PostToolUse, matcher Agent).** Sıradan tura etki: sıfır (kanca yalnız Agent çağrısında koşar, başarıda hiç yazmaz). Ölçüm: bench iki kol, sonnet yalnız vs sonnet+yükselme, kol başına ≤3 tekrar; metrik geçme oranı, görev başına $, yükselme sayısı. Beklenti: geçme ≥ opus-yalnız, $ ≈ 0,7·S + 0,3·(S+O).

**2. c — aynı kancanın `reason` metni + CLAUDE.md'ye tek satır** ("düşen ajanı opus'la, yalnız kanıtla, bir kez yeniden başlat"). Etki sıfır. Ölçüm: 1'in bench'inde üçüncü kol, retry token'ı ayrıca sayılır.

**3. d — `ff` kayıt yolunda karma anahtarı, `scout.js` içinde isabet kontrolü.** Etki: A, yalnız `ff` işaretinde. Ölçüm: bench yok; bir haftalık isabet sayısı ve atlanan danışma sayısı `bench/rapor.md`'ye satır.

e zaten büyük ölçüde var; yeni iş açma.

## 4. Kaçınılacaklar

- **LLM eleştirmen/yargıç her ajan dönüşünde** (HydraFusion Critique) → C; başarılı dönüşte de yargıç ödenir.
- **Tur seviyesinde cascade** → C; ucuz model her turda önce dener, Core'un "sıradan tur native" kuralını bozar. Cascade'in DeepSWE'de −1,5 vermesi de kapının modele bırakıldığında gücünü yitirdiğini gösterir.
- **Kancanın `claude -p --model opus` açması** → görünmez fatura, sonuç bağlama dönmez, ana model işi yeniden yapar; iki kat ödeme.
- **SubagentStop `block` ile yeniden koşturma** → aynı zayıf modelle döngü; yükselme değil, ucuz modele daha çok ödeme. Kap yoksa sessiz çarpan.
- **Başarıda "ajan tamam" satırı** → damla damla C'ye kayar. Kanca yalnız düşüşte konuşur.
- Yükselme sayacı olmadan retry → tek düşen görev sınırsız opus.

Yok
