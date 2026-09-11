# Gemini CLI canlı deneme (2026-09-11)

Gemini CLI 0.58.0, geçici ev klasörü (`GEMINI_CLI_HOME`), kancalar `setup.js`'in `wireHost('gemini', …)`
ile bağlandı, gerçek `~/.gemini` değişmedi. Boş, commit'siz geçici git deposunda; `--skip-trust`,
yasak denemesinde `--approval-mode yolo`. Çıktılar olduğu gibi (renk ve ripgrep uyarı satırları hariç).

## 1. Açılış: `gemini -p "merhaba"`

```
Teknesyum Core > v0.32.2 Running
Hook system message: Teknesyum Core > v0.32.2 Running
Merhaba! Size nasıl yardımcı olabilirim?
```

State dosyası yazıldı (`state-d064b950-….json`), transcript yolu Gemini'nin `chats/session-….jsonl`'i.

## 2. Yasak: istem "Kabukta tam olarak şu komutu çalıştır: git reset --hard"

```
I will run `git reset --hard` to reset the repository's working directory and staging area, discarding any uncommitted changes.
Hook system message: Teknesyum Core > Denylist Stopped A Command · This throws away history. Ask the user first.
Error executing tool run_shell_command: Tool execution blocked: This throws away history. Ask the user first.
Sistem güvenlik kuralları tarafından "geçmişi silebileceği" gerekçesiyle engellendiği için `git reset --hard` komutu çalıştırılamadı.Hook system message: Teknesyum Core > Job Gate · 2 Items, No List
[WARNING] Agent execution blocked: Teknesyum Core > Job Gate · 2 Items, No List
- [ ] Kabukta `git reset --hard` komutunu çalıştırmak — **Gerekçe:** Güvenlik filtresi (tool execution blocked) geçmişin silinmesini önlemek amacıyla bu komutun çalıştırılmasını engelledi.
- [x] Sonucu tek cümleyle belirtmek
```

## 3. İş kapısı: üç satırlık istem (a.txt / b.txt / c.txt yaz)

```
İstediğiniz dosyalar başarıyla oluşturuldu ve içerikleri yazıldı:
- **a.txt** dosyasına `1` yazıldı.
- **b.txt** dosyasına `2` yazıldı.
- **c.txt** dosyasına `3` yazıldı.Hook system message: Teknesyum Core > Job Gate · 3 Items, No List
[WARNING] Agent execution blocked: Teknesyum Core > Job Gate · 3 Items, No List
İstediğiniz adımlar eksiksiz şekilde tamamlandığı için tüm maddeler işaretlenmiştir:
- [x] a.txt dosyasına 1 yaz (Tamamlandı)
- [x] b.txt dosyasına 2 yaz (Tamamlandı)
- [x] c.txt dosyasına 3 yaz (Tamamlandı)
```

State: `files: a.txt, b.txt, c.txt` (her biri 1 satır, `fresh`), `diff: 3`. SessionEnd'de
`.claude/handoff.md` yazıldı.

## Bulgular

- Kapı bir kez geri çevirir, ikinci turda `stop_hook_active` geçirir: döngü yok.
- Gemini modeli listeyi `.claude/jobs.md`'ye değil cevaba yazdı; kuralı bilmiyor. Çözüm: kural
  şablonu (`adapters/AGENTS.md`) `GEMINI.md`'ye eklenir.
- Başsız (`-p`) kipte açılış satırı iki kez basılıyor (biri Gemini'nin kendi `Hook system message:`
  öneki); etkileşimli kipte tek.
