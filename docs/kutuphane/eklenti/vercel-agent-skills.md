# vercel-labs/agent-skills

- lisans: yok (LICENSE dosyası yok, package.json `"private": true`, license alanı boş)
- kurulum biçimi: skill (Agent Skills formatı; `npx skills add` veya `cp -r skills/{ad} ~/.claude/skills/`)
- mekanizma: 0 kanca, 0 komut, 0 ajan, 0 MCP — yalnız 9 bağımsız `SKILL.md` (biri zip'li de dağıtılıyor); vercel-optimize ek olarak `scripts/gate-investigations.mjs` ve `references/*.json` taşıyor
- sıradan turda bağlama: 9 skill'in frontmatter description toplamı 3688 bayt (~925 token, 4 bayt/token); tek tek kurulan skill'de yalnız o skill'in description'ı yüklenir (~250-750 bayt); SKILL.md gövdesi yalnız tetiklenince okunuyor
- premium: yok — vercel-optimize kullanıcının kendi Vercel API token'ıyla kendi projesinin metriklerini çekiyor, eklentinin kendisi bir şey satmıyor

## Ne yapar
Vercel/React ekosistemi için 9 ayrı, konu bazlı skill sunuyor: deploy, cost/performance audit (vercel-optimize), React/Next.js performans kuralları, React Native, view transitions, composition patterns, web/writing guideline denetimi, token'lı CLI kullanımı. Her biri kendi başına kurulup çalışıyor, ortak bir çatı yok.

## Kullanıcıya nasıl hissettirir
Sessiz — banner, statusline, kanca çıktısı yok. Skill tetiklenince SKILL.md içeriği bağlama girer ve model onu talimat gibi izler; vercel-optimize dışındakiler saf metin/kural listesi.

## Core'a alınacak
- vercel-optimize'ın "metrikten sonra dosyaya bak" disiplini (deterministic gate → yalnız işaretlenen dosyayı oku) — fikir notu: Core'un kendi ölçüm/eşik mantığına (RULES.md "angarya işte önce deterministik araç") paralel, doğrudan kod alınmaz.
- react-best-practices ve web-design-guidelines gövdeleri — kütüphaneye kitap olarak eklenebilir (React/Next.js ve UI denetimi ihtiyacı çıkarsa `kutuphane.js fetch` ile).
- Kalanı (deploy-to-vercel, vercel-cli-with-tokens, react-native, view-transitions, composition-patterns, writing-guidelines) Core'un kapsamı dışında, proje-özel.

## Ölçülecek
- Kütüphaneye kitap olarak eklenirse: `kutuphane.js find` ile isabet oranı, `show --lean` token maliyeti.

## Karar
fikir notu — mekanizma yok (saf skill koleksiyonu), ama vercel-optimize'ın metrik-önce-dosya disiplini ve iki içerik skill'i (react-best-practices, web-design-guidelines) kütüphaneye kitap adayı.
