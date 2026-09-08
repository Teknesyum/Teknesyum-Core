# open-gitagent/opengap

- MIT · CLI (npm `@open-gitagent/opengap`) + spec · ★2928
- mekanizma: 11 CLI komutu (`init/validate/export/import/audit/run/install/skills/registry/info/lyzr`), 19 hedef adaptörü (claude-code, codex, cursor, copilot, gemini, opencode, crewai, openai…), 37.792 baytlık spec, 18 örnek skill; kanca/ajan/MCP kurmuyor
- sıradan turda bağlama: 0 token — Claude Code'a hiçbir şey yüklemiyor; depo dışı bir CLI, yalnız elle çağrılınca çalışıyor. Adaptörün ürettiği `.claude/` dosyalarının maliyeti kullanıcının yazdığı manifeste bağlı.
- premium: yok

## Ne yapar

"Depon ajanın olsun" diyen git-yerel bir standart: `agent.yaml` manifesti + `SOUL.md`, `RULES.md`, `DUTIES.md`, `AGENTS.md` dosyaları bir depoyu taşınabilir ajan tanımına çeviriyor. Referans CLI bu tanımı 19 farklı çatıya derliyor; FINRA/SEC uyum alanları ve görev ayrımı birinci sınıf.

## Core'a alınacak

- **fikir**: tek kaynaktan çok hedefe derleme — Core'un raflarını ve kurallarını `AGENTS.md` + tek satırlık `CLAUDE.md` biçiminde tutması aynı fikrin elle yapılan hali; `src/adapters/shared.ts` bunu betikleştirmenin haritası.
- **pasif betik**: `opengap validate` deseni — manifest ile diskteki dosyaların tutarlılığını sayıp rapor eden, model çağırmayan bir doğrulayıcı. Core'un `map.js`/`setup.js` yanına raf bütünlüğü denetçisi olarak uyarlanabilir.
- **fikir**: `RULES.md`/`DUTIES.md` ayrımı — kısıt ile yetki sınırının ayrı dosyada durması; Core'un `RULES.md`'si şu an ikisini karıştırıyor.

## Karar

Fikir notu — sıradan turda 0 token ve ilkeye aykırı değil, ama Core tek çatıda çalışıyor; 19 adaptörlü makine gereksiz, doğrulayıcı deseni ve iki dosyalı kural ayrımı not edilir.
