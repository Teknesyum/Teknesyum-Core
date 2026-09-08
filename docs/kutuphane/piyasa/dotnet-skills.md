# dotnet/skills

- MIT · plugin pazarı (7+ eklenti, `.claude-plugin` + `.codex-plugin` + `.cursor-plugin`) · ★5383
- mekanizma: 105 SKILL.md, 0 kanca, LSP tanımı (`lsp.json`, roslyn), birkaç `agents/` klasörü, MCP yok
- sıradan turda bağlama: yalnız skill frontmatter'ları. Tüm depo 72.4 KB (~18k token, 105 skill); tek başına `dotnet` eklentisi 597 bayt / 1 skill (~150 token). Sayım: her SKILL.md'nin ilk `---` bloğu `wc -c`
- premium: yok

## Ne yapar
.NET ekibinin resmi skill koleksiyonu. Her skill dar bir işi (SDK kurulumu, MSBuild teşhisi, EF, yükseltme) anlatır; eklentiler alan alan bölünmüş ki kullanıcı yalnız ihtiyacı olanı yükleyip bağlam ödesin.

## Core'a alınacak
- **fikir (en güçlü)**: `dotnet-skills.experiment.yaml` — her skill için *baseline (skill yok) × skilled (yalnız o skill)* eşli koşu, aynı model ve yargıç model, `vary: /environment/skills`. `eng/eval-quality/check_eval_quality.py` her uyaranı tek oya indiriyor, tekrarları bağımsız saymıyor. Core'un bench'i bugün kolları böyle eşlemiyor; doğrudan alınabilir.
- **kitap**: frontmatter kalıbı `USE FOR: … DO NOT USE FOR: …`. Core'un raf başlıklarında "ne zaman okunmaz" satırı yok; yanlış rafın açılmasını ucuza keser.
- **fikir**: eklentiyi alana bölüp bağlam maliyetini kullanıcıya seçtirme (72 KB toplam vs 0.6 KB çekirdek).

## Karar
Al · ölçülü eval çatısı ve frontmatter disiplini Core'un bench'ine ve raf başlıklarına birebir oturuyor.
