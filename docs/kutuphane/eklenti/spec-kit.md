# github/spec-kit

- lisans: MIT
- kurulum biçimi: CLI (`specify` — uv tool / pipx) + hedef repoya şablon kopyalayan ajan çatısı
- mekanizma: hook yok. Python CLI (`src/specify_cli`) hedef repoya 10 komut şablonu (`templates/commands/*.md`: specify, plan, tasks, clarify, analyze, implement, checklist, constitution, converge, taskstoissues), 6 gömülü uzantı (agent-context, assess, bug, git, selftest, template — `extensions/catalog.json`), preset'ler (constitution-sync, lean, scaffold, self-test) ve iş akışı tanımları (`workflows/speckit/workflow.yml`) yazar. `specify init --integration <ajan>` seçilen ajana göre (Claude Code dahil 10+ hedef) komutları o ajanın kendi formatına (`.claude/commands/`, `.github/copilot-instructions.md` vb.) uyarlar.
- sıradan turda bağlama: sıfır — CLI çalıştırılmadan hiçbir dosya kopyalanmaz; kurulduktan sonra da yalnız komut çağrıldığında o `.md` şablonu okunur (tahmini birkaç KB/komut), her zaman yüklü bir parça yok.
- premium: yok. Tamamı açık kaynak, ücretsiz.

## Ne yapar
Spec-Driven Development (SDD) akışını dayatır: önce anayasa (constitution), sonra spec, plan, tasks, en son implement — sırayı komut şablonları zorlar. Bug triage ve idea assessment için ayrı, benzer şablonlanmış akışlar sunar. Uzantı/preset/bundle sistemiyle bu akış projeye göre genişletilebilir.

## Kullanıcıya nasıl hissettirir
Ajan-agnostik: aynı `/speckit.*` komut seti Claude Code, Copilot, Cursor vb. üstünde kendi native komut formatında görünür. Sessiz altyapı yok, statusline yok — kullanıcı doğrudan slash komutları çağırır, çıktı o ajanın normal yanıtı.

## Core'a alınacak
- fikir: metin kitabına değil komut sırasına dayalı disiplin (specify→plan→tasks→implement) — Core'un K0 kuralına benzer bir "adım zorlama" şablonu olarak referans alınabilir.
- fikir: ajan-agnostik komut şablonu + `--integration` uyarlaması — Core tek ajana (Claude Code) bağlı, bu ölçek gerekmiyor.
- Core'un kendisiyle örtüşme yüzeyi düşük: spec-kit bir proje metodolojisi CLI'ı, Core bir Claude Code eklenti çatısı. Doğrudan alınacak mekanizma yok.

## Ölçülecek
Uygulanmaz — mekanizma örtüşmediği için ölçüm planlanmadı.

## Karar
hayır — proje metodolojisi katmanı, Core'un eklenti/kanca mekanizmasıyla örtüşmüyor; alınacak somut parça yok.
