# FerroxLabs/agents-md

- MIT · metin paketi (tek `AGENTS.md`, `CLAUDE.md`/`GEMINI.md` symlink) · ★683
- mekanizma: 0 kanca, 0 komut, 0 ajan, 0 skill, 0 MCP — yalnız 1 dosya
- sıradan turda bağlama: `AGENTS.md` 10.610 bayt = ~2.650 token, her turda; `wc -c` ile ölçüldü
- premium: yok

## Ne yapar
Tek bir `AGENTS.md` dosyasını depo köküne bırakıyor; Claude Code, Codex, Cursor, Gemini CLI, Aider hepsi kendiliğinden okuyor. İçerik "kıdemli mühendis davranışı" kuralları: geri it, en küçük diff, dosyayı baştan biçimlendirme, doğrulanmamış iddia yok. Kurulum ritüeli yok, eklenti yok.

## Core'a alınacak
- fikir: `CLAUDE.md` → `AGENTS.md` tek kaynak + symlink/`@AGENTS.md` satırı kalıbı; Core zaten bunu yapıyor, doğrulanmış oldu.
- kitap: 10,6 KB'lık daima-yüklü dosya, Core'un "sıfır token" ilkesinin karşı örneği olarak rafta iyi bir ölçü referansı (2.650 token/tur × her tur).

## Karar
fikir notu — mekanizması yok, tek dosya; alınacak şey içeriği değil, 10,6 KB'ı her tura ödemenin maliyeti.
