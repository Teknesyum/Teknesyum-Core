# MinishLab/semble

- MIT · CLI + MCP + alt ajan (Python, uv) · ★6026
- mekanizma: MCP sunucusu, CLI, `semble-search` alt ajanı; kurulum biçimini kullanıcı seçiyor (`semble install --type mcp|instructions|subagent`). Kanca yok.
- sıradan turda bağlama: yalnız CLI kurulursa AGENTS.md'ye eklenen kullanım notu kadar (~yüzlerce bayt, ~100-200 token); MCP seçilirse araç tanımları her turda yüklü, alt ajan seçilirse ajan açıklaması yüklü. En ucuz kip: yalnız CLI + tek satır not. README ve kurulum belgesinden okundu, kaynak ölçülmedi.
- premium: yok; API anahtarı, GPU, dış servis gerektirmiyor, CPU'da çalışıyor.

## Ne yapar
Ajanlar için kod arama: doğal dilde soru sorup yalnız ilgili kod parçalarını geri veriyor, grep+read'e göre ~%99 daha az token harcadığını ve tam kod tabanını saniyenin altında indekslediğini iddia ediyor.

## Core'a alınacak
- fikir: Core'un `graphify` yönergesine ikinci seçenek — büyük/yabancı kod tabanında dosya okumak yerine sorgu; kurulum kipi "yalnız CLI + AGENTS.md tek satır" seçilirse sıradan tur maliyeti sıfıra yakın kalıyor.
- kitap: üç kurulum kipini (MCP / yönerge / alt ajan) maliyetiyle birlikte anlatan yarım sayfa; Core'un "hiçbir şey ajan/skill olarak kurulmaz" ilkesini örneklendiren temiz bir karşılaştırma.
- hayır: MCP ve alt ajan kipleri.

## Karar
fikir notu — CLI kipi Core ilkesine uyuyor, ama iddia edilen %99 kazanç ölçülmedi; kütüphaneye araç notu olarak girer, kurulum kararı ölçümden sonra.
