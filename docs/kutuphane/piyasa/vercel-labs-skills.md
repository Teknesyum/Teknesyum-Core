# vercel-labs/skills

- MIT · CLI (`npx skills`) · ★30681
- mekanizma: 0 kanca, 0 ajan, 0 MCP; bir Node CLI (`bin/cli.mjs`) + kendi `skills/` klasörü. 79 ajan hedefi destekliyor (Claude Code, Codex, Cursor, OpenCode…)
- sıradan turda bağlama: 0 KB — CLI kurulum yapmadan da çalışıyor, hiçbir şey kalıcı yüklenmiyor
- premium: yok (skills.sh dizini ücretsiz)

## Ne yapar
Skill'leri git kaynaklarından (GitHub kısayolu, tam URL, GitLab, ssh, yerel yol) çeken bir paket yöneticisi. Asıl ilginç komut `skills use`: skill'i **kurmadan** geçici dizine açıp yalnız üretilen istemi stdout'a basıyor — `npx skills use repo@skill | claude`.

## Core'a alınacak
- **fikir (güçlü)**: "kurmadan kullan" — bilgi tek turda boruyla akıyor, hiçbir yere yerleşmiyor. Core'un `??`/`++` kancasıyla aynı fikir ama depo dışından; Core'un kütüphanesine dış raf çekmenin hazır yolu.
- **pasif betik**: kimlik doğrulama zinciri (git credential helper → `gh repo clone` → SSH), token'ı hiç process'e kopyalamadan. Core'un özel raf aynası (`teknesyum-private`) için doğrudan kullanılabilir desen.
- **fikir**: kaynak biçimi olarak "depodaki tek skill'e doğrudan tree URL'i" — raf başına adresleme.

## Karar
Fikir notu · CLI'nın kendisi Core'a gerekmez, ama "kurmadan kullan" ve kimlik zinciri iki somut desen.
