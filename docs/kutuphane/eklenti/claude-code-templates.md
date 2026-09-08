# davila7/claude-code-templates

- lisans: MIT
- kurulum biçimi: CLI (npx claude-code-templates@latest --agent/--command/--mcp/--skill ... --yes) — seçilen bileşen kullanıcının projesine kopyalanır, plugin olarak yüklenmez
- mekanizma: kanca değil, katalog + kopyalayıcı. cli-tool/components altında 435 agent, 346 command, 103 mcp, 75 settings, 89 hook, 5659+ skill dosyası; hepsi aitmpl.com üzerinden de taranabilir. Repo'nun kendi `.claude/` klasörü (agents/commands/hooks) geliştirme ekibinin iç takımı, dağıtılan ürün değil
- sıradan turda bağlama: 0 — mekanizma "bir kere kopyala, projene göm" şeklinde; resident bir kanca veya her turda okunan CLAUDE.md yok (kullanıcı hook component'i seçip kopyalarsa o zaman o hook'un kendi maliyeti oluşur)
- premium: yok; npm paketi ücretsiz, sponsorluklarla (Z.AI, Bright Data, Neon, Vercel OSS) finanse. Ayrı bir `--analytics` komutu var (yerel kullanım panosu, ücretsiz)

## Ne yapar
Claude Code için hazır agent/command/mcp/hook/settings/skill şablonlarının büyük bir kataloğunu tutar ve `npx claude-code-templates@latest` ile tek satırda projeye kopyalar. Web arayüzü (aitmpl.com) tarama ve interaktif kurulum sağlar. Kendi başına çalışan bir ajan çatısı ya da kanca sistemi değil, bir dağıtım/kurulum aracı.

## Kullanıcıya nasıl hissettirir
Kurulum bir CLI komutu; bileşen kopyalanınca ondan sonrası tamamen o bileşenin kendi davranışı (agent/command/hook ne yapıyorsa). Sessiz, banner yok; statusline'a dokunmaz.

## Core'a alınacak
- fikir | katalogdan tekil dosya çekip yerelde kalıcı hale getirme deseni — Core'un kütüphane betiği (`kutuphane.js`) zaten benzer bir "pasif depo, istenince oku" mantığı uyguluyor; bu depo somut agent/command şablonları için ek kaynak olabilir ama kod olarak alınacak bir mekanizma yok.
- hiç | kanca/plugin mimarisi yok, ölçülecek bir maliyet mekanizması da yok

## Ölçülecek
Core'a alınmayacağı için ölçüm gereksiz.

## Karar
hayır — bir plugin/kanca mekanizması değil, harici bir şablon kopyalama CLI'sı; Core'un ilkeleriyle (bağlamda kalıcı iz, kanca disiplini) örtüşecek bir mekanizması yok.
