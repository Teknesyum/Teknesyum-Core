# ciembor/agent-rules-books

- MIT · metin paketi (AGENTS.md kuralı / skill gövdesi) · ★2716
- mekanizma: 0 kanca, 0 komut, 0 ajan, 0 skill dosyası — yalnız 14 kitaptan damıtılmış markdown
- sıradan turda bağlama: 0 KB (hiçbir şey otomatik yüklenmez; kullanıcı hangi dosyayı vereceğini seçer). Ölçüm: depoda hook/plugin manifesti yok, `find -name SKILL.md` = 0
- premium: yok

## Ne yapar
On dört klasik yazılım kitabını (Clean Code, Refactoring, DDD, Release It, Legacy Code...) ajanın uyacağı kural setlerine damıtır. Her kitap üç sürümde çıkar: `full` (13-18 KB kanonik kaynak), `mini` (3-6 KB, önerilen çalışma sürümü), `nano` (~1.3 KB, bağlam çok darken hep-açık yedek). README'de her sürüm için satır / kural / bayt sayısı deterministik ölçülüp tabloya yazılır.

## Core'a alınacak
- **kitap**: Core kütüphanesinin 14 rafına aynı üç kademeli sürüm düzeni (`full` / `mini` / `nano` + `traceability.md`) — bugün raflar tek gövde; `nano` kademesi `??` önekiyle gelen metni ~1 KB'a indirir.
- **pasif betik**: `_rule-workbench/RELEASE.md`'deki deterministik ölçüm — satır, kural (markdown liste öğesi), bayt sayısını sayıp README tablosunu üreten betik. Model yazmaz, `wc` sayar; Core'un "sabit metinleri model yazmaz" kuralına birebir oturur.
- **fikir**: `docs/USAGE.md`'deki "en küçük mekanizmayı kullan" tablosu (skill / hep-açık kural / kapsamlı kural / istek üzerine) — Core'un raf-mı-kanca-mı kararı için hazır ölçüt.

## Karar
Al — Core'un pasif kütüphanesiyle aynı felsefede, sıfır kanca ile 2716 yıldız; üç kademeli sürüm + deterministik ölçüm doğrudan kopyalanabilir.
