# mrtooher/fable-mode

- lisans yok · kurulum biçimi: metin paketi (install.sh ile `~/.claude/skills/` + `~/.claude/agents/`) · ★856
- mekanizma: 0 kanca, 0 komut, 0 MCP; 7 skill (fable-mode, fable-fable/opus/sonnet/haiku, execution-guardrails, double-check) + 4 ajan tanımı (orchestrator, verifier, worker-sonnet, worker-haiku)
- sıradan turda bağlama: 7 SKILL.md frontmatter'ı toplam 5426 B (`awk` ile `---` blokları sayıldı) ≈ 1350 token, her turda yüklü; gövdeler 4136-9187 B, yalnız tetikte
- premium: yok

## Ne yapar
Büyük işlerde aşamalı yürütme disiplinini dayatır: yazılı aşama haritası, adı konmuş ajanlara devir, her aşamada başarısız olabilen bir doğrulama, teslim öncesi soğuk çift kontrol. v3'te devir prozadan gerçek ajan tanımlarına taşınmış; `fable-orchestrator` Write/Edit aracı olmadan tanımlanarak üretimi zorla işçilere kaydırıyor.

## Core'a alınacak
- kitap: "doğrulamadan uyarma" + "uyarı eşiği (varsayılan üç)" + "sed'de kelime sınırı" üçlüsü (execution-guardrails, 4136 B) — Core'un eşikte tek satır konuşma ilkesiyle birebir aynı fikrin başkasınca yazılmış hâli, rafta durur.
- fikir: araçsız orkestratör — bir ajanı Write/Edit'siz tanımlayarak çıktıyı işçiye zorlamak; Core'un ajan kullanan akışlarında ucuz bir yapısal kısıt.
- fikir: teslim kapısı olarak taze gözle çift kontrol (ternary PASS/FAIL/UNVERIFIABLE), model katmanına göre işbölümü.

## Karar
fikir notu — mekanizması 5.4 KB her-tur skill açıklaması, yani Core'un sıfır-token ilkesine aykırı; içindeki üç kural ve orkestratör kısıtı kitap/fikir olarak alınır.
