# agentskills/agentskills

- APACHE-2.0 · kurulum biçimi: metin paketi (şartname/belge deposu, kurulmuyor) · ★25143
- mekanizma: 0 skill, 1 kanca (`SessionStart`), 0 komut, 0 ajan, 0 MCP; yanında `skills-ref` adlı Python doğrulayıcı
- sıradan turda bağlama: `CLAUDE.md` 9 B — içi yalnız `AGENTS.md` satırı; `AGENTS.md` 2003 B (~500 token). Toplam ~500 token
- premium: yok

## Ne yapar
Agent Skills biçiminin şartnamesi. `SKILL.md` + isteğe bağlı `scripts/`, `references/`, `assets/`; `description` 1-1024 karakter zorunlu; kademeli açılım üç aşamada tanımlı (ad+açıklama ~100 token açılışta, gövde eşleşince, referanslar gerekince). Depo kendi kuralını kendine uyguluyor: `docs/specification.mdx` tek yetkili kaynak, açıklayıcı belgeler biçime şart ekleyemez.

## Core'a alınacak
- **Kitap — şartnamenin kendisi.** Frontmatter alanları, 1024 karakter tavanı, `allowed-tools`, `compatibility`, dosya referansı kuralları. Core skill kurmuyor ama raf yazarken bu tavanlar ölçü; kütüphaneye tek raf olarak girer.
- **Kanca — asenkron kanca.** `.claude/hooks/session-start.sh` ilk satırda `{"async":true,"asyncTimeout":15000}` basıyor: kanca turu bloke etmiyor. Core'un eşik kancaları için doğrudan uygulanabilir mekanizma.
- **Fikir — yetki sınırı cümlesi.** "Şartname yetkili; örnekler, testler ve uygulamalar biçime şart eklemez, çeliştiklerinde çelişki yüzeye çıkarılır." Core'un `AGENTS.md`/`RULES.md` çatışma kuralına birebir oturuyor.

## Karar
Al — 9 baytlık `CLAUDE.md` → `AGENTS.md` deseni Core'unkiyle aynı; şartname raf, `async` kanca ise ölçülmüş bir mekanizma.
