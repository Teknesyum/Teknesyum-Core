# snyk/agent-scan

- Apache-2.0 · kurulum biçimi: CLI (`uvx`, tek ikili) · ★3018
- mekanizma: 0 kanca, 0 komut, 0 ajan, 0 skill; harici tarayıcı. Bulduğu şey: harness + MCP sunucusu + skill
- sıradan turda bağlama: **0 bayt** — Claude Code'a hiç kurulmuyor, elle çağrılan bir tarayıcı
- premium: var — CLI ücretsiz, kurumsal "Snyk Evo" platformu ücretli; CLI çıktısı deneysel ilan edilmiş

## Ne yapar
Makinedeki kurulu ajan bileşenlerini bulur ve doğal dilde saklanmış prompt injection, gizli indirme URL'si, sabit kodlu sır, yıkıcı yetenek gibi riskleri puanlar (0-1000). Uyarı: MCP taraması yapılandırmadaki komutları **çalıştırıyor**, onay istiyor.

## Core'a alınacak
- **kitap**: `docs/risks.md` + `docs/issue-codes.md` — 21 adlandırılmış risk (E001-E006, W007-W021): tool açıklamasında yönlendirme, gizli Unicode, doğrulanamayan dış bağımlılık, skill'de sır. Core'un kütüphanesine rafa konan üçüncü parti metni tartmak için hazır ölçüt listesi.
- **fikir**: `kutuphane.js fetch` sonrası indirilen rafı bu ölçütlerle tarayan pasif bir betik — model çağırmadan, salt regex/Unicode kontrolü.
- **fikir**: "gizli Unicode karakter" (W021) taraması Core'un `pp` özel rafına da uygulanabilir.

## Karar
Al — risk taksonomisi 21 maddelik hazır bir kitap; tarayıcının kendisi kurulmaz, ölçütleri rafa girer.
