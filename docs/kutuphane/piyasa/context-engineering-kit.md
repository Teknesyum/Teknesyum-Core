# NeoLabHQ/context-engineering-kit

- GPL-3.0 · plugin (marketplace, 14 ayrı eklenti) · ★1675
- mekanizma: 68 skill, 21 ajan, 3 komut, 1 kanca dosyası (reflexion: UserPromptSubmit + Stop)
- sıradan turda bağlama: tüm skill frontmatter'ları toplam 17.277 bayt ≈ 4.300 token (`awk` ile 68 SKILL.md'nin ilk `---` bloğu sayıldı). Tek eklenti kurulursa pay düşer: örn. reflexion 3 skill ≈ 760 bayt. Kanca sıradan turda susuyor, yalnız `reflect` kelimesi geçerse konuşuyor.
- premium: yok

## Ne yapar

Bağlam mühendisliği tekniklerini (Reflexion, Self-Refine, TDD, SDD, kaizen, çoklu ajan) 14 bağımsız eklentiye bölmüş bir pazar yeri. Her eklenti yalnız kendi skill/ajan/komutunu yüklüyor; "granular kurulum" ve "token verimliliği" açıkça satış argümanı. Skill yerine alt-ajanlı komut tercih ettiklerini söylüyorlar.

## Core'a alınacak

- **kanca**: `onStopHandler.ts` — kullanıcı istemi bir tetik kelime içeriyorsa Stop olayını `decision: "block"` ile geri çevirip modele tek bir iş yaptırıyor; ardışık Stop'ları sayarak döngü kırıyor. Core'un `??`/`pp` önek kancası şu an yalnız UserPromptSubmit'te; Stop tarafında "iş bitmeden şunu yap" kapısı yok.
- **fikir**: tetik kelimeyi `(?<![:/])\bword\b` ile arıyor — slash komutunda yanlış tetiklemeyi engelliyor; Core'un önek eşleşmesi için ucuz bir sağlamlaştırma.
- **kitap**: `plugins/sadd` (alt-ajan desenleri: yarıştır, yargıla, adımla) ve `plugins/kaizen` (kök neden) metinleri rafa girecek olgunlukta.

## Karar

Al — 4.300 tokenlik skill yükünü almadan kanca deseni ve iki metni pasif raf olarak almak mümkün.
