# harperreed/dotfiles

- MIT · kurulum bicimi: CLAUDE.md (+ yadm ile yonetilen kisisel ayar deposu) · ★332
- mekanizma: 1 kanca (UserPromptSubmit -> `append_ultrathink.py`, 1.7 KB), 15 slash komut, ajan 0, skill 0, MCP 0
- sıradan turda bağlama: 16.4 KB / ~4100 token — `.claude/CLAUDE.md` 15928 B + `docs/local.md` 459 B, ikisi de her turda yuklu; komutlar cagrilmadan yuklenmez
- premium: yok

## Ne yapar
Bir kisinin yasayan Claude Code + Codex ayarlari. Ilginc parca `.claude/scripts/check-claude-md`:
CLAUDE.md adayini onaylanmis bir zarfa karsi dogruluyor — CLAUDE.md <= 11400 B, local.md <= 1500 B,
toplam <= 12500 B, 9 "bulunmali" ve 9 "bulunmamali" dizge, tam bir @-include ve o satir dosyanin sonu.
Basarisizsa cikis 1. Kural dosyasinin kendisi testli.

## Core'a alınacak
- pasif betik: `check-claude-md` kalibi — Core'un RULES.md 30 satir tavani ve AGENTS.md <=20 satir kurali su an hicbir sey tarafindan denetlenmiyor; bayt tavani + zorunlu/yasak dizge testi `core/scripts/` altina kucuk bir dogrulayici olarak girer.
- fikir: kural dosyasini "spec + tasarim notu + denetci betik" ucgeniyle degistirmek (docs/specs altinda 16 KB'lik tasarim, degisiklik ona karsi olculuyor).
- hic: `append_ultrathink.py` — her isteme sabit metin ekliyor, Core'un sifir-token ilkesine aykiri.

## Karar
Al — `check-claude-md` bayt-tavani dogrulayicisi Core'un yazili ama denetlenmeyen kural tavanlarini olculebilir yapiyor.
