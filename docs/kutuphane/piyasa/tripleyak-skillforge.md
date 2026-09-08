# tripleyak/SkillForge

- MIT · plugin/skill (tek SKILL.md + references) · ★889
- mekanizma: 1 skill (SKILL.md 12 KB, ~1.158 kelime), 1 komut (`commands/skillforge.md`), 11 `references/*.md` istenince okunur, 24 python betiği (validate_skill.py 846 satır, triage_skill_request.py 795 satır), 2 kanca (SessionStart + UserPromptSubmit), MCP yok
- sıradan turda bağlama: yalnız 1 skill description (~400 bayt, ~100 token). Kancalar eşiği geçmezse exit 0 ve sıfır çıktı; UserPromptSubmit kancası 1.5 sn yumuşak bütçeyle önceden kurulmuş indeksi okur, oturum ve gün başına tavan `hook_state.json`'da tutulur.
- premium: yok

## Ne yapar
Skill üreten ve ürettiğini kanıtlayan bir çatı. Yazmadan önce "RED gate": taze bir alt ajan işi skill'siz dener; başarısız olmazsa skill yazılmaz. Sonra GREEN koşusu ile davranış farkı ölçülür. Lint (`validate_skill.py`) yanlışlanabilir kontrolleri yapar, tek bir hasım gözden geçirici gerisini.

## Core'a alınacak
- kanca: UserPromptSubmit'te sert zaman bütçesi (1.5 sn), oturum/gün tavanı ve eşik altında sessiz exit 0 kalıbı — Core'un "eşikte bir kez konuşur" kuralının olgunlaşmış hali; tavan durumu tek JSON dosyada.
- fikir: RED/GREEN kapısı — bir kitap ya da betik eklemeden önce ajanın onsuz denemesi; Core'un kütüphanesine raf eklerken "gerçekten gerekli mi" ölçüsü.
- fikir: description = yalnız tetik koşulu (v5'te iş akışı özeti yazılınca ajan gövdeyi atlıyordu; v6'da düzeltildi) — Core'un raf başlıkları için ucuz kural.

## Karar
Al — sıradan turda ~100 token, kanca kalıbı ve RED/GREEN kapısı Core'un ilkesiyle birebir örtüşüyor.
