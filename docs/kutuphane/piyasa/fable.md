# grooverLab/fable

- MIT · CLI + MCP + kanca (pipx, `fable install` settings.json'a yazar) · ★11
- mekanizma: 7 kanca olayı (SessionStart, UserPromptSubmit, Stop, SubagentStop, PreCompact 120 sn, PreToolUse ve PostToolUse eşleştiricili) · 25 MCP aracı · 0 skill · 0 ajan · 0 komut · sıfır bağımlılık (yalnız stdlib)
- sıradan turda bağlama: MCP `TOOLS` bloğu 28.593 bayt ≈ **~7.100 token sabit** (`sed`+`wc -c` ile ölçüldü). Kanca enjeksiyonu ise **kapılı**: "recall scout" yalnız istemde geçmiş-işe atıf (deixis) + nadir/özel varlık varsa ve skor 70 tabanını geçerse konuşur; onay sözcükleri ("ok", "thanks") ve düz İngilizce istemler sessiz. Ayrıca duvar saati bütçesi var, bütçe biterse hiç yazmaz.
- premium: yok

## Ne yapar
Claude Code'un kendi `.jsonl` dökümlerini indeksleyip aramayı, iş parçacığını satır satır geri getirmeyi ve bir dosyanın oturumlar arası düzenleme geçmişini çıkarmayı sağlar. Yeni bir bellek uydurmak yerine var olanı açar; sıkıştırma ve 30 günlük silme öncesinde kasaya alır.

## Core'a alınacak
- **kitap** — "under-push beats over-push" kapı tasarımı: istem tarafı kapı (deixis + nadir varlık regex'i, jenerik sözcük kara listesi), mutlak puan tabanı (70), iki geri getiricinin uyuşmasına +12 bonus. Core'un "eşikte bir kez konuş" kuralının olgunlaşmış hali; kanca yazarken referans.
- **kitap/betik** — duvar saati bütçesi deseni: Claude Code UserPromptSubmit kancasını 30 sn'de öldürüp **çıktısını atar**; fable yakalamayı bütçesiz, süslemeyi bütçeli yapıp bütçe bitince sessizce geçer. Core kancalarına doğrudan uygulanır.
- **fikir** — `skills.py`'nin yineleme kapısı: bir yordam N kez + M oturumda ve **tutarlı dosya kümesiyle** tekrarlıyorsa aday; "hata düzelt" gibi dağınık dosyalı işler elenir. Core'un raf/kitap seçiminde aynı ölçüt kullanılabilir.

## Karar
Al — 25 MCP aracı (~7.100 token) kurulmaz, ama kanca kapısı ve bütçe deseni Core'un ilkesinin en iyi piyasa örneği; kitap olarak rafa.
