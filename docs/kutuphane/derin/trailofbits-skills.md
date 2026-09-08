# trailofbits/skills

- lisans: CC BY-SA 4.0 (Attribution-ShareAlike) — türev eser aynı lisansla paylaşılmalı, atıf zorunlu
- tür: skills (Claude Code plugin marketplace — her plugin bir skills/<isim>/SKILL.md taşır)
- kitap sayısı ve yeri: ~40 plugin, her biri `plugins/<isim>/skills/<isim>/SKILL.md`; bazılarında ek `references/`, `resources/`, `agents/`, `evals/` alt klasörleri
- scan: `plugins/*/skills/*/SKILL.md` · skip: `plugins/*/evals/`, `plugins/*/skills/*/assets/`, `.github/`, `.git/`

## Ne işe yarar
Trail of Bits'in güvenlik odaklı Claude Code plugin pazarı: akıllı kontrat denetimi, C/Rust/Go güvenlik incelemesi, GitHub Actions AI-agent denetimi, Semgrep/YARA/CodeQL kural yazımı, tedarik zinciri riski, DWARF/APK analizi gibi uzman alanları kapsıyor. Her plugin dar bir uzmanlık alanına odaklı, "ne zaman kullanma" ve "reddedilecek rasyonalizasyonlar" bölümleriyle disiplinli yazılmış. Bazıları (audit-context-building, code-improver) alt-ajan/workflow dispatch mimarisi kullanıyor, düz metin kitaptan fazlası.

## ??'de ne zaman bulunmalı
- "GitHub Actions workflow'unda AI agent güvenlik açığı var mı bak"
- "Bu Rust/C kodunu güvenlik açısından incele"
- "Semgrep kuralı yaz / mevcut kuralı başka dile taşı"
- "Bu depoyu audit etmeden önce context'ini çıkar"

## Kalite
Özgün, Trail of Bits'in gerçek denetim pratiğinden damıtılmış; her SKILL.md "when NOT to use" ve reddedilecek gerekçeler listesiyle yüzeysel prompt değil gerçek disiplinli doküman. Son commit 2026-09-02, aktif bakımda (Dependabot dahil).

## Karar
raf — Teknesyum Core'un güvenlik/kod-inceleme sınıfında karşılığı yok, dar-uzman kitap seti niteliğinde ve lisansı (CC BY-SA, atıflı) rafa uygun.
