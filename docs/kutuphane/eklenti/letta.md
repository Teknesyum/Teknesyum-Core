# letta-ai/letta

- lisans: Apache-2.0
- kurulum biçimi: ajan çatısı (Python server + CLI/SDK); Claude Code eklentisi değil
- mekanizma: kanca yok. Bellek "block" nesnesi (etiket + değer + karakter limiti + read_only bayrağı), birden çok ajana bağlanabilir (blocks_agents). Ayrı bir "sleeptime" ajan grubu, N konuşma turunda bir (`sleeptime_agent_frequency`) tetiklenip blokları düzenliyor (precise edit + `rethink` toplu yeniden yazma tool'u).
- sıradan turda bağlama: bloklar sistem promptunun içinde sabit dururken tam metin geçiyor — "pasif kütüphane, istenince oku" yok, blok = her turda otomatik context. KB tahmini yapılmadı: boyut kullanıcı tanımlı `limit` alanına bağlı (varsayılan `CORE_MEMORY_BLOCK_CHAR_LIMIT`), repo'da sabit değer bulunamadı.
- premium: repo'nun kendisi artık sadece iniş sayfası; ücretli katman Letta Cloud (barındırma) — kod tabanında fiyat yok.

## Ne yapar
Ajan hafızasını "core memory" adlı, her turda context'e giren etiketli bloklara ayırır (human, persona, vb.). Bloklar ajanlar arası paylaşılabilir, read-only olabilir, şablon (template) olarak saklanabilir. Ayrı bir arka plan ajanı (sleeptime), ana konuşmayı N turda bir durdurup bu blokları temizler/yeniden yazar.

## Kullanıcıya nasıl hissettirir
Kullanıcı bunu görmez; sleeptime ajanı arka planda, ayrı bir run olarak çalışır, ana sohbeti kesmez. Banner/statusline yok — bu bir API/server, arayüz katmanı ayrı repoda (letta-code).

## Core'a alınacak
- fikir: "memory block" kavramı — sabit karakter limitli, etiketli, read-only/read-write ayrımlı bellek birimi. Core'daki `docs/` veya kütüphane kayıtlarına benzer ama "her turda otomatik context'e giren" farkı var; Core'un ilkesiyle (sıfır token varsayılan) çelişiyor, doğrudan alınmaz.
- fikir: N turda bir tetiklenen arka plan "consolidation" ajanı — Core'un kanca eşik mantığına (N dosya/tur sonra bir kez konuş) yapısal olarak yakın; sayaç + eşik deseni zaten Core'da var, yeni bir şey öğretmiyor.
- hiç: kod/kütüphane olarak alınacak parça yok — mimari Python server, Core'un plugin/hook modeliyle örtüşmüyor.

## Ölçülecek
Alınmayacağı için ölçüm yok.

## Karar
fikir notu — "eşikte bir kez konuşan arka plan ajanı" deseni Core'da zaten var, memory-block'un "her turda otomatik context" yaklaşımı Core'un sıfır-token ilkesiyle ters; kod alınmaz, yalnız desen doğrulaması olarak not edilir.
