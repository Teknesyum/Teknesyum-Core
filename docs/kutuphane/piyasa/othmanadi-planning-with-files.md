# OthmanAdi/planning-with-files

- MIT · plugin (Claude Code eklentisi + Agent Skills paketi) · ★26720
- mekanizma: 6 kanca olayı (SessionStart, UserPromptSubmit, PreToolUse, PostToolUse,
  PreCompact, Stop), 13 komut, 2 skill, 0 ajan, 0 MCP; kanca betiği 333 satır sh
- sıradan turda bağlama: plan dosyası yoksa kanca sessiz çıkıyor (`claude-hook.sh`
  satır 155-157, 240-242: `[ -f "$INJECT_PLAN" ] || exit 0`) → 0 token.
  Sabit gider yalnız SKILL.md frontmatter açıklaması: ~700 karakter ≈ 175 token.
- premium: yok

## Ne yapar
`task_plan.md`, `findings.md`, `progress.md` üçlüsünü diske yazar; kanca her turda
aktif plan varsa `additionalContext` olarak enjekte eder. Amaç `/clear`, çökme ve
compact sonrası planın hayatta kalması. 60+ ajana Agent Skills standardıyla kuruluyor.

## Core'a alınacak
- kanca: "plan dosyası yoksa sessiz çık" deseni Core'un ilkesinin birebir aynısı;
  ama PreCompact ve Stop olayları Core'da yok — compact öncesi planı yeniden
  enjekte etmek Core'un `docs/plan.md` eşiğini tamamlar.
- pasif betik: `resolve-plan-dir` + `inject-plan --context=<olay>` ayrımı; tek betiğin
  olaya göre farklı kırpma yapması, Core'un `hooks/mod.js` tek gövdesinden temiz.
- fikir: `plan-doctor` komutu — plan dosyasının bayatlığını ölçüp tek satır uyarı.

## Karar
Al — Core'un plan kancasının olgunlaşmış hali; ölçülen sabit gider 175 token.
