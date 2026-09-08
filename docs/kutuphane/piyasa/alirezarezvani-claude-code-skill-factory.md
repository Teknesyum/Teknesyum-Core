# alirezarezvani/claude-code-skill-factory

- MIT · CLAUDE.md + komut/ajan paketi (`.claude/`) · ★859
- mekanizma: 0 kanca, 17 komut, 6 ajan, ayrıca `generated-skills/` ve `generated-agents/` örnekleri; kurulum `cp -r ... ~/.claude/skills/`
- sıradan turda bağlama: kök CLAUDE.md **10082 B (~2520 token)**, her turda. Üstüne modüler alt CLAUDE.md'ler çalışma dizinine göre yükleniyor. Ölçüm: `wc -c CLAUDE.md`.
- premium: yok

## Ne yapar
Beceri, ajan, prompt ve kanca üretmek için şablon ve prompt mühendisliği paketi. `/build skill`, `/build agent`, `/build hook` komutları etkileşimli üreticiye bağlanır; hazır 69 prompt önayarı taşır.

## Core'a alınacak
- **fikir**: `/build hook` — kanca iskeletini modele yazdırmak yerine şablondan üretme; Core'un "sabit metinleri model yazmaz" (scaffold.js) çizgisiyle aynı yöne bakıyor.
- **hiç**: 10 KB'lik daimi CLAUDE.md ve 17 komut, Core'un slash komutu olmayan tasarımına ters.

## Karar
Hayır — tek turda 2520 token sabit yük ve 17 komut; Core'un ilkesiyle ölçüm düzeyinde çelişiyor.
