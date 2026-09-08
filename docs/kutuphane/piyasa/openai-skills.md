# openai/skills

- lisans yok (beceri basina ayri LICENSE.txt) · kurulum bicimi: metin paketi (Codex skill kataloğu) · ★26259
- mekanizma: 44 SKILL.md (5 `.system`, 39 `.curated`/`.experimental`), kanca yok, MCP yok, komut yok; kurulum `$skill-installer` beceri-icinden
- sıradan turda bağlama: 0 KB — hicbir beceri Codex'e otomatik yuklenmez, `.system` disindakiler elle kurulur; `skills/` toplami 6.5 MB, en buyuk SKILL.md 19 KB (skill-creator)
- premium: yok; depo "deprecated", devami openai/plugins

## Ne yapar
Codex icin beceri kataloğu: her klasorde frontmatter'li SKILL.md, yaninda `scripts/` ve `references/`.
`skill-creator` yeni beceri iskeleti kurup `quick_validate.py` ile dogruluyor, `skill-installer` GitHub yolundan
beceri cekiyor. Claude'un Agent Skills standardiyla ayni sozlesme (agentskills.io).

## Core'a alınacak
- kitap: `skill-creator/SKILL.md` + `scripts/quick_validate.py` — beceri/raf yazarken "ne zaman yuklenir, tanim kac karakter" olcutleri; rafa 19 KB'lik tek dosya olarak girer, sıradan turda okunmaz.
- fikir: `description` alanini "Use when… Do not use when…" kalibinda yazmak (imagegen ornegi) — Core'un `??`/`pp` oneklerinde hangi rafin acilacagini netlestirir.
- fikir: beceriyi kurmadan calistirma — installer bile bir beceri; Core'un "hicbir sey ajan/skill olarak kurulmaz" ilkesine ters olmayan tek parca budur.

## Karar
fikir notu — 44 becerinin tamami Codex'e bagli, ama skill-creator olcutleri Core'un raf yazim kilavuzuna dogrudan girer.
