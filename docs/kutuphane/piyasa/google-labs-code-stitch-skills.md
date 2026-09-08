# google-labs-code/stitch-skills

- Apache-2.0 · plugin (3 eklenti: stitch-design, stitch-build, stitch-utilities) · ★8274
- mekanizma: 0 kanca, 10+ skill (SKILL.md), 0 ajan, Stitch MCP sunucusuna bağlı
- sıradan turda bağlama: kanca ve CLAUDE.md yok; sabit gider yalnız skill
  `description:` satırları — 1.441 bayt ≈ 360 token (10 skill, bayt/4)
- premium: yok (Stitch hesabı gerekiyor)

## Ne yapar
Google Stitch'in tasarım üretme akışını Agent Skills standardına paketler:
`generate-design`, `code-to-design`, `extract-design-md`, `manage-design-system`
ve React/React Native/shadcn üretim skill'leri. Codex, Gemini CLI, Claude Code,
Cursor'a marketplace üzerinden sparse checkout ile kuruluyor.

## Core'a alınacak
- fikir: `--sparse` ile marketplace'ten yalnız gereken alt klasörü çekmek —
  Core'un `kutuphane.js fetch` işlemi de rafı tam depo yerine tek klasör çekebilir.
- fikir: `extract-design-md` — tasarım kararlarını tek markdown'a çıkarma;
  teknesyum-ui token dosyası aynı biçimde yazılabilir.
- hiç: skill'ler MCP'ye bağımlı, Core skill kurmuyor.

## Karar
Hayır — 360 token'lık sabit gider küçük ama işlev Stitch MCP'sine bağlı;
yalnız sparse fetch fikri alınır.
