# eyaltoledano/claude-task-master

- lisans: MIT WITH Commons-Clause (Sell yasak; hosting/consulting olarak satılamaz)
- kurulum biçimi: plugin (marketplace) + MCP + CLI (`task-master-ai` npm paketi)
- mekanizma: kanca yok (0). Plugin paketi (`packages/claude-code-plugin`) 46 düz slash komut, 3 ajan (orchestrator/executor/checker, opus), 1 MCP sunucu (`npx task-master-ai`, stdio, ~37 araç). Kendi CLAUDE.md'si repoya özgü, plugine dahil değil.
- sıradan turda bağlama: plugin başına CLAUDE.md yok — komut ve ajan dosyaları yalnız çağrıldığında okunur. Asıl kalıcı yük MCP sunucusunun ~37 araç şeması; her biri birkaç yüz kelimelik description taşıyor, kabaca 5-15K token (37 araç × ort. 150-400 token/şema, 4 karakter/token varsayımıyla dosya boyutlarından kabaca çıkarıldı, çalıştırıp ölçmedim).
- premium: repo içinde yok; ürün "Hamster Studio" (tryhamster.com) ayrı, fiyatı repoda geçmiyor — dış barındırılan pano/takım katmanı olarak tanıtılıyor.

## Ne yapar
PRD'den görev grafiği çıkarır, bağımlılık/karmaşıklık analiziyle görevleri böler, MCP araçları ve CLI ile görev durumunu yönetir. Orchestrator/executor/checker ajan üçlüsü paralel görev yürütmeyi otomatikleştiriyor.

## Kullanıcıya nasıl hissettirir
46 komutla ağır bir "proje yönetimi" katmanı — `.taskmaster/` altında JSON dosyaları, PR/commit/görev bağlama gibi ek ritüel. Sessiz değil: MCP araç listesi her turda modele görünür, ajanlar kendi banner/rapor formatını kullanıyor.

## Core'a alınacak
- fikir: task-orchestrator/executor/checker üçlüsünün "ajan rolü ayrımı" deseni (planlayan/yürüten/denetleyen) — Core'un mevcut ajan yokluğuna örnek olabilir ama doğrudan kod alınmaz.
- hiç: 46 komut, .taskmaster JSON şeması, MCP sunucusu — Core'un "sıfır bağlam" ilkesiyle çelişiyor, hepsi kalıcı yük.

## Ölçülecek
- Core'a fikir olarak alınırsa: üç rolü ayrı ajan olarak tanımlayıp bench'te tek görevde token/başarı farkına bakılır.

## Karar
fikir notu — ajan-rolü-ayrımı deseni ilginç ama mekanizmanın tamamı (46 komut + kalıcı MCP şema yükü) Core'un sıfır-bağlam ilkesine aykırı.
