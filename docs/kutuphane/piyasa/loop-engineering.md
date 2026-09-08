# cobusgreyling/loop-engineering

- MIT · plugin + CLI (`npx @cobusgreyling/loop`) · ★11114
- mekanizma: 7 skill (budget-negotiator, install-loop, loop-budget, loop-constraints, loop-triage, loop-verifier, minimal-fix), 0 kanca, 0 komut, 0 ajan, 0 MCP
- sıradan turda bağlama: CLAUDE.md yok; 7 SKILL.md `name`+`description` toplam 589 B ≈ 0,6 KB ≈ ~150 token — dilimdeki en ucuz eklenti
- premium: yok; `loop doctor` kurulumu puanlıyor, ilk hafta yalnız rapor modu

## Ne yapar
Tek tek istem yazmak yerine ajan döngüsünü tasarlatıyor: bütçe, kısıt, doğrulayıcı ve en küçük
düzeltme adımlarını ayrı skill'lere bölüyor. CLI tarafı depoya desen kuruyor
(`loop init --pattern daily-triage --tool claude`) ve `doctor` ile kurulumu denetliyor.

## Core'a alınacak
- kitap: `loop-budget` + `budget-negotiator` metinleri — işe başlamadan maliyeti hesaplama;
  kullanıcının "önce fiyatla" kuralının hazır karşılığı, doğrudan rafa girer.
- pasif betik: `loop doctor` deseni — kurulumu okuyup puan veren, hiçbir şey kurmayan denetçi;
  Core'un `setup.js` yanına "denetle, dokunma" kipi olarak eklenebilir.
- fikir: "ilk hafta yalnız rapor" varsayılanı — yeni bir kanca eşiği devreye girmeden önce
  sessizce sayması, Core'un eşikte tek satır konuşma ilkesiyle uyumlu.

## Karar
Al — kitap; 7 skill 589 bayta sığdığı için ilkeyi bozmadan alınabilir, bütçe ve doğrulayıcı metinleri doğrudan raf malzemesi.
