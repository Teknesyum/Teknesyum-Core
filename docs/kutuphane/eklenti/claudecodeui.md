# siteboon/claudecodeui

- lisans: AGPL-3.0
- kurulum biçimi: bağımsız uygulama (Node sunucu + React istemci + Electron masaüstü); Claude Code eklentisi değil
- mekanizma: `.claude-plugin`, `hooks.json`, `commands/`, `agents/`, `.mcp.json` yok — kanca sıfır. Kendi geliştirme deposu için `.agents/skills/{backend,frontend}-module-standards/SKILL.md` iki adet, `AGENTS.md`'de dizine göre koşullu yükleniyor (`server/` işi backend, `src/` işi frontend skill'ini çeker); bunlar ürünün kendi kod tabanını yazan ajanlar için, kullanıcıya dağıtılmıyor
- sıradan turda bağlama: 0 KB — Claude Code oturumuna hiç girmiyor; ayrı bir web/masaüstü arayüz olarak Claude Code CLI'yi saracak şekilde çalışıyor
- premium: var — "CloudCLI Cloud" (cloudcli.ai), barındırılan konteynerli geliştirme ortamı; self-host sürüm AGPL ile ücretsiz, fiyat sitede

## Ne yapar
Claude Code, Cursor CLI ve Codex için masaüstü/mobil bir web arayüzü: proje/oturum listesi, sohbet, terminal, dosya ve git gezgini, tarayıcı oturumu açma. Kendi "Plugin System"i var ama bu Claude Code eklenti sistemi değil, CloudCLI'nin kendi sekme/servis eklenti çatısı (ayrı depo: cloudcli-plugin-starter).

## Kullanıcıya nasıl hissettirir
Tam bir web/masaüstü uygulaması: banner yok, statusline yok, sessiz kanca yok — kullanıcı tarayıcıda/Electron penceresinde proje kartları, sohbet balonları, terminal ve dosya ağacı görür. Uzaktan (telefon dahil) erişim vaadi öne çıkıyor.

## Core'a alınacak
hiç — bu bir Claude Code eklentisi değil, ayrı bir ürün. Teknesyum Core'un kanca/pasif-kütüphane mimarisine aktarılabilecek bir mekanizma (hook, komut, MCP, skill deseni) taşımıyor.

## Ölçülecek
Alınacak bir şey yok; ölçüm gerekmiyor.

## Karar
hayır — Claude Code eklentisi değil, ayrı bir web/masaüstü uygulaması; Core mimarisine aktarılabilecek mekanizma yok.
