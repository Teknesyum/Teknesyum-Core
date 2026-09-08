# daymade/claude-code-skills

- MIT · plugin marketplace (skill paketleri) · ★1384
- mekanizma: 104 SKILL.md, ~65 ust dizin/paket, birkac paket kendi kancasini kuruyor (`claude-code-hooks`, `auto-repo-setup` SessionStart), depo CLAUDE.md'si 28.6 KB
- sıradan turda bağlama: tum paketler kurulursa 104 skill frontmatter'i toplam 73.4 KB (~18k token; `find -name SKILL.md -exec awk '/^---$/{n++} n==1'` ile olculdu). Tek paket kurmak birkac KB.
- premium: yok

## Ne yapar
Anthropic'in skill-creator'inin "uretimde sertlestirilmis" catallanmasi etrafinda buyuk bir pazar yeri: git kurtarma, GitHub islemleri, dokuman donusturme, ses hatti, arastirma. Her skill'de "outcome contract" (once cikti, yetkili hedef, durma kosulu tek cumleyle konusulur) sarti var.

## Core'a alınacak
- kitap: `daymade-skill/skill-governance` — "sicak yonlendirici gorunur, soguk yetenek diskte kalir; dizin sayisi basari degil, taze konakta gorunurluk basari". Core'un pasif raf tezinin bagimsiz piyasa dogrulamasi ve olcum tarifi.
- pasif betik: `git-safety-net/scripts/` 6 deterministik sh (`git_loss_audit`, `git_find_all_checkouts`, `git_preserve_danglers`, `git_verify_branch_merged`) — model yazmadan calisan kayip-is denetimi; Core'un "angaryada deterministik arac" kuralina birebir.
- fikir: "outcome contract" — is baslamadan cikti/yetki/durma kosulunu tek cumle yazdirmak; Core'un plan esigi kancasina ucuz ek.

## Karar
al — skill-governance metni ve git-safety-net betikleri rafa/`scripts`'e alinabilir; 104 skill = 18k token olcumu de neyin alinmayacagini gosteriyor.
