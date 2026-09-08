# Fission-AI/OpenSpec

- lisans: MIT
- kurulum biçimi: CLI (npm `@fission-ai/openspec`) + üretici — hedef araca özel skill/command dosyaları yazar
- mekanizma: 0 kanca, 0 MCP, 0 ajan. `openspec init` seçilen profile göre Claude Code'a `.claude/skills/openspec-*/SKILL.md` (varsayılan "core" profilde 6 tane: propose, explore, apply, update, sync, archive) ve `.claude/commands/opsx/<id>.md` üretir; genişletilmiş profilde 12'ye çıkar (new, continue, ff, verify, bulk-archive, onboard eklenir). 25'ten fazla farklı araç için ayrı adaptör var (Codex, Cursor, Amazon Q, Gemini CLI...).
- sıradan turda bağlama: yalnız kurulu skill'lerin frontmatter `description` alanı Claude Code'un kendi skill listesine girer — 6 skill × ~200 karakter ≈ 1,2 KB ≈ ~300 token. Command dosyaları (`opsx/*.md`) yalnız çağrılınca okunur, sıfır sürekli maliyet. Kanca yok, statusline'a dokunmuyor.
- premium: yok — tamamen açık kaynak, ücretli katman yok.

## Ne yapar
Proje içinde `openspec/` adlı bir spec deposu (specs/ + changes/) kurup AI asistanına "önce spec üzerinde anlaş, sonra kodla" akışını slash komut zinciriyle dayatıyor: `/opsx:explore → /opsx:propose → /opsx:apply → /opsx:sync → /opsx:archive`. Her adım kendi skill'i içinde CLI'yi (`openspec status/validate/archive ...`) çağırıyor. `openspec/config.yaml` ile proje bağlamı, kural ve şema enjekte edilebiliyor (opsiyonel, her zaman yüklü değil).

## Kullanıcıya nasıl hissettirir
Skill'ler `allowed-tools: Bash(openspec:*)` ile sınırlı, kendi CLI'sinin dışına çıkmıyor; explore modu yazma öncesi açık onay istiyor ("confirmation covers only the scope you described"). Sessiz araya girmiyor — yalnız kullanıcı `/opsx:...` yazınca konuşuyor, statusline'a dokunmuyor.

## Core'a alınacak
- fikir: "confirmation covers only the scope you described, genişleyince yeniden sor" ilkesi — explore skill'inin onay sınırlama cümlesi, Core'un K0 kuralına yakın, örnek metin olarak faydalı.
- fikir: tek CLI arkasına 25+ araç adaptörü koyup her birine özel dosya yolu üretme deseni — Core'un kendi eklenti dağıtımı için referans olabilir (şu an tek hedef Claude Code olduğu için acil değil).
- hiç: skill/command gövdeleri OpenSpec'in kendi spec-driven iş akışına özel; Core'un "sıfır bağlam" ilkesiyle zaten örtüşüyor, alınacak kod/kanca yok.

## Ölçülecek
- Alınırsa: "confirmation scope" cümlesinin gerçek turlarda onay sayısını nasıl etkilediği — önce/sonra karşılaştırması.

## Karar
fikir notu — mekanizması Core'a taşınacak bir şey içermiyor (kod/kanca yok), yalnız onay-sınırlama cümlesi ilke notu olarak değerli.
