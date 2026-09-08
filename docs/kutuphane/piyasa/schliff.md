# Zandereins/schliff

- MIT · plugin + CLI (`uvx schliff`, pip, GitHub Action, pre-commit) · ★15
- mekanizma: 1 komut (`/schliff`), 1 skill, 1 kanca (SessionStart injector — `hooks.json` "REFERENCE ONLY", elle settings'e eklenir), 0 ajan, 0 MCP
- sıradan turda bağlama: skill frontmatter'ı 902 B ≈ 225 token (tetik cümleleri uzun); kanca elle kurulmadıkça 0. Sayım: `awk` ile ilk `---` bloğu.
- premium: yok

## Ne yapar
`AGENTS.md`, `SKILL.md`, `CLAUDE.md`, `.cursorrules` gibi yönerge dosyalarını 8 boyutlu, sürümlenmiş bir kural motoruyla puanlar. Kritik yolda LLM yok, ağ yok, rastgelelik yok: aynı bayt her makinede aynı puan. CI'da kapı olarak kullanılabiliyor, dosyanın vaat ettiği komutların depoda gerçekten çözülüp çözülmediğini de denetliyor.

## Core'a alınacak
- pasif betik: Core'un kendi `AGENTS.md`/`CLAUDE.md`/raf dosyalarını ölçen deterministik puanlayıcı — "angarya işte model kullanma" kuralının tam karşılığı, `map.js`/`log.js` yanına oturur.
- fikir: yönerge dosyasının token bütçesini ve çürümesini ölçmek — Core zaten dosya sayıyor, kelime/token tavanını da sayabilir.
- fikir: `hooks.json` içine "bu dosya otomatik okunmaz, elle kur" notu koyma alışkanlığı.

## Karar
Al · fikir notu değil betik: modelsiz, 0 token, Core'un ölçme kültürüne doğrudan katkı.
