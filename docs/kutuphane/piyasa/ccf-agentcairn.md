# ccf/agentcairn

- Apache-2.0 · plugin + MCP + CLI (PyPI, `uvx`) · ★50
- mekanizma: 4 kanca olayı (UserPromptSubmit, SessionStart, SessionEnd, PreCompact — hepsi `matcher: "*"`), 5 komut, 0 ajan, 2 skill, 1 MCP sunucu (5 araç: recall, search, build_context, recent, remember)
- sıradan turda bağlama: **her turda** yazıyor. `user-prompt-submit.sh` senkron çalışıp `cairn recall-hook` çıktısını additionalContext olarak basıyor; SessionStart ayrıca "recent-memory digest" ekliyor. Boyut kasadaki hafızaya bağlı, tavan yok — sıfır değil. Kaynak: `plugin/hooks/hooks.json` + `plugin/scripts/*.sh`.
- premium: yok, ama LLM judge için kullanıcının kendi Anthropic API anahtarı (`~/.agentcairn/config.toml`)

## Ne yapar

Ajanlar arası kalıcı hafıza: oturumdan çıkarılan olguları provenance'lı Markdown olarak bir kasaya yazıyor, DuckDB'yi yalnız değiştirilebilir arama önbelleği sayıyor. Obsidian yardımcı eklentisi aynı dosyaları okuyor. SessionEnd oturumu damıtıyor, UserPromptSubmit istemle eşleşen anıyı geri çağırıyor.

## Core'a alınacak

- **kanca**: fail-open kalıbı — `recall-hook` her durumda 0 dönüyor, sorunda hiç çıktı vermiyor; 10 sn kanca zaman aşımı tavan olarak kullanılıyor. Core kancalarında yazılı kural hâline getirilebilir.
- **betik**: ilk çalıştırmada soğuk kurulumu tamamen ayrılmış (stdin/stdout/stderr detach) arka plan işine atıp kancayı bloke etmeme; ikinci oturumda hızlı yol. Core'un eşik kancaları için doğrudan uygulanabilir.
- **fikir**: `/agentcairn:savings` komutu — hafızanın kaç token kazandırdığını kullanıcıya gösteren sayaç; Core'un "eklenti sayar, gösterir" çizgisiyle aynı.

## Karar

fikir notu — her turda bağlama yazdığı için mekanizması Core'un sıfır-token ilkesine aykırı; fail-open ve detached-warmup kanca kalıpları alınmaya değer.
