# Ölçüm Turu D Kolu — Orkestrasyon, Hafıza Ve Diğerleri

Tarih: 2026-10-21. Plan: `docs/plan.md` S, S1. Ham veri: `bench/olcum-d.jsonl` (araç başına bir satır).
Harcanan model maliyeti: **0 $** (10 $ bütçeden). Tüm klonlar `--depth 1`, `C:\Users\Administrator\olcum-dis\<araç>\src`.

## Yöntem Ve Sınırlar

- **Kimlik yok, canlı A/B yapılamadı.** Yalıtılmış `CLAUDE_CONFIG_DIR` ile `claude -p "ok"` "OAuth session expired" döndü; varsayılan config de aynı. `CLAUDE_CODE_OAUTH_TOKEN` kullanıcı değişkeni tanımlı değil, `bench/olcum.js` `kimlikEnv()` bu yüzden duruyor. Model gerektiren her davranış ölçümü "çalıştırılamadı — kimlik yok" diye yazıldı.
- **Her tur yükü kaynak koddan ve gerçek çıktıdan bayt olarak ölçüldü.** MCP sunucuları stdio JSON-RPC ile (`initialize` → `tools/list`) çalıştırılıp araç tanımlarının JSON baytı alındı; hook'lar örnek stdin ile çalıştırılıp stdout baytı alındı; skill satırı frontmatter `name`+`description` toplamı (`disable-model-invocation: true` hariç).
- **Token tahminidir:** ≈ bayt / 3.6. Claude Code MCP araçlarını tool search ile erteleyebilir; o durumda gerçek yük yalnız araç adlarıdır — bu canlı doğrulanamadı.
- Üçüncü taraf her çalıştırmada `HOME`, `USERPROFILE`, `CLAUDE_CONFIG_DIR` (gerekince `APPDATA`, `LOCALAPPDATA`) kum dizinine yönlendirildi — ilk context-mode çalıştırmasından sonra (bkz. Yan Etkiler).
- Sınıf: **Gerçek** (iddianın en az yarısı tuttu), **Kısmi**, **Balon** (tutmadı ya da ters döndü), **N/A** (sayısal iddia yok, yük ölçüldü), **Ölçülemedi**.

## Yan Etkiler

- **context-mode** `start.mjs` ilk çalıştırmada gerçek `~/.claude/settings.json`'a yazdı (13:08): `hooks.SessionStart` içine cache-heal kancası, `enabledPlugins` içine `context-mode@context-mode`, ayrıca `~/.claude/hooks/context-mode-cache-heal.mjs` ve `~/.claude/context-mode/`. Geri alındı: iki giriş node ile çıkarıldı (JSON 2 boşluk birebir), değişmiş kopya ve dosyalar `olcum-dis\context-mode\yan-etki\` altına taşındı; `settings.json` ve `~/.claude.json`'da "context-mode" geçmiyor. Bu, "~/.claude'a yazma" kuralının ihlalidir; sonraki tüm koşular kum ortamında yapıldı.
- **claude-real-video** `USERPROFILE`'ı yok sayıp `C:\Users\Administrator\.crv\memory.db` yazdı; `olcum-dis\claude-real-video\yan-etki\crv-dizini` altına taşındı. Çıktısında ücretli "Pro" reklamı var.
- **v4-pro** `run_benchmark` klondaki `src/benchmarks/RESULTS.md`'yi değiştirdi (zararsız, klon içi).

## İndirmeler

| Araç | Ad | Kaynak | Boyut |
|---|---|---|---|
| bonsai | `bonsai_windows_amd64.zip` v0.1.0 (sha256 checksums.txt ile eşleşti) | GitHub release | 2.3 MB (exe 6.0 MB) + klon 293 KB |
| claude-worktree-hooks | klon | github.com/tfriedel/claude-worktree-hooks | 21 KB |
| fleetmates | klon | github.com/andreymudri/fleetmates | 22.7 MB |
| Archon | klon | github.com/coleam00/Archon | 36.8 MB |
| claude-code-action | klon | github.com/anthropics/claude-code-action | 2.0 MB |
| reviewd | klon | github.com/simion/reviewd | 390 KB |
| sloppy | klon | github.com/Heyosseus/sloppy | 4.3 MB |
| claude-multisession | klon | github.com/wshallwshall/claude-multisession | 2.8 MB |
| beads | klon + npm `@beads/bd` 1.3.1 (depo URL eşleşti) | GitHub + npm | 66.2 MB + 151 MB |
| claude-handoff | klon | github.com/REMvisual/claude-handoff | 137 KB |
| hatel | klon | github.com/junyeong-ai/hatel | 1.1 MB |
| tdd-guard | klon | github.com/nizos/tdd-guard | 6.2 MB |
| context-mode | klon + npm `context-mode@1.0.169` (`--ignore-scripts`, 141 paket) | GitHub + npm | 13.5 MB + 48 MB |
| godot-mcp-go | klon | github.com/regiellis/godot-mcp-go | 188.5 MB (çoğu medya) |
| ffmpeg-skill | klon | github.com/kajisho5/ffmpeg-skill | 21.3 MB |
| claude-real-video | klon + PyPI `claude-real-video` 0.10.7 | GitHub + PyPI | 38.9 MB + 131 MB |
| fauxnix | klon + `npm ci --ignore-scripts` (152 paket) | GitHub + npm | 266.6 MB (tanıtım mp4) + 80 MB |
| v4-pro | klon + PyPI `v4-pro` 2.3.0 (uv) | GitHub + PyPI | 1.2 MB + 27 MB |

## Araçlar

### Bonsai

- Depo: sauravpanda/bonsai @ d1303fc · 9 yıldız · MIT.
- İddia: worktree'leri safe/review/protected diye sınıflar, yalnız safe olanı siler; dirty, untracked, unpushed, locked korunur.
- Her tur yükü: skill satırı 255 B (≈70 tok); hook ve MCP yok.
- Davranış: kum deposunda 5 worktree (merged, dirty, unmerged, untracked, locked). Release v0.1.0'da README'deki `--json`, `--keep-history` bayrakları ve safe/review/protected sınıflaması yok. `prune --dry-run --offline` (257 ms) **dirty, locked, untracked ve merged'i** "no unpushed commits" gerekçesiyle silme adayı gösterdi; yalnız unmerged dışarıda kaldı. `prune -y` yalnız merged'i sildi; diğer üçü `git worktree remove` exit 128 ile düştü — koruyan bonsai değil git. `--force` ile üçü de silinirdi.
- Sınıf: **Balon**. Hüküm: yayımlanan sürüm koruma iddiasını taşımıyor, güvenliği git'in kendi reddi sağlıyor.

### Claude-Worktree-Hooks

- Depo: tfriedel/claude-worktree-hooks @ 3fbf985 · 29 yıldız · lisans yok.
- İddia: sayısal yok (worktree oluşturma/silme kancaları).
- Her tur yükü: 0 B (olay kancası, stdout'a yalnız yol).
- Davranış: `grep -oP` ve `lsof` kullanıyor; Windows'ta bozuk.
- Sınıf: **N/A**. Hüküm: bağlama yük bindirmiyor ama Windows'ta çalışmıyor, lisanssız.

### Fleetmates

- Depo: andreymudri/fleetmates @ d658265 · 3 yıldız · MIT.
- İddia: thinking'de %72-76 azalma; `npm test` için ~40k token tasarrufu — kendi iç ölçümleri, araçsız taban yok.
- Her tur yükü: SessionStart 6,482 B (using-fleetmates skill'inin tamamı) + 15 skill ve 3 agent açıklaması 3,131 B = **9,613 B ≈ 2.7k tok**.
- Davranış: çalıştırılamadı — kimlik yok.
- Sınıf: **Ölçülemedi**. Hüküm: sabit 9.6 KB/tur yükü kesin, tasarruf iddiası tabansız.

### Archon

- Depo: coleam00/Archon @ 2b124af · 23,737 yıldız · MIT.
- İddia: sayısal yok (kendi orkestratörü olan iş akışı motoru).
- Her tur yükü: Claude Code oturumuna 0 B.
- Davranış: çalıştırılamadı — Bun, Claude girişi ve uzak betikli kurulum gerekiyor.
- Sınıf: **N/A**. Hüküm: Core ile aynı katmanda değil; ölçülecek iddia yok.

### Claude-Code-Action

- Depo: anthropics/claude-code-action @ a5a423f · 9,596 yıldız · MIT.
- İddia: sayısal yok.
- Her tur yükü: yerelde 0 B; Actions içinde `generateDefaultPrompt` ≈275 satır ve 7 MCP aracı enjekte ediyor.
- Davranış: çalıştırılamadı — GitHub Actions, API anahtarı ve GitHub App gerekiyor.
- Sınıf: **N/A**. Hüküm: bulut tarafı araç, yerel Core'a karşılığı yok.

### Reviewd

- Depo: simion/reviewd @ 0ab1006 · 70 yıldız · MIT.
- İddia: sayısal yok.
- Her tur yükü: 0 B (claude CLI'yı dışarıdan çağırıyor).
- Davranış: çalıştırılamadı — model ve Git token gerekiyor.
- Sınıf: **N/A**. Hüküm: yük yok, ölçülecek iddia yok.

### Sloppy

- Depo: Heyosseus/sloppy @ 0802087 · 160 yıldız · MIT.
- İddia: "33 kural".
- Her tur yükü: CLAUDE.md'ye kural bloğu ekliyor (boyut ölçülemedi — PHP yok); PostToolUse ve Stop kancaları yalnız ihlalde yazıyor; MCP 7 araç isteğe bağlı. Model çağırmıyor.
- Davranış: çalıştırılamadı — PHP ve composer yok.
- Sınıf: **N/A**. Hüküm: deterministik kapı yaklaşımı Core K1 ile aynı aile; ölçüm PHP ister.

### Claude-Multisession

- Depo: wshallwshall/claude-multisession @ 2df6a64 · 3 yıldız · MIT.
- İddia: ~0.5 s/prompt ve ~366 ms/araç gecikme maliyeti.
- Her tur yükü: SessionStart `session-context.ps1` 1,349-1,662 B (≈0.4 k tok, oturumda bir kez); UserPromptSubmit `announce-session` 0 B; PreToolUse `worktree_gate` 0 B (yalnız ihlalde).
- Davranış (pwsh, kum deposu, 3 tekrar): session-context 1,050 / 1,121 / 1,154 ms; announce 495 / 526 / 480 ms; worktree_gate 499 / 465 / 601 ms.
- Sınıf: **Gerçek**. Hüküm: prompt gecikmesi aynen tuttu, araç gecikmesi bu makinede ~%40 fazla; bağlam yükü küçük ama her araçta yarım saniye bedel var.

### Beads

- Depo: gastownhall/beads @ 9826fed · 28,065 yıldız · MIT. Kurulum: npm `@beads/bd` 1.3.1.
- İddia: `bd prime` ~1-2k token; MCP'ye göre 10-50x daha ucuz.
- Her tur yükü: `bd init` proje CLAUDE.md'sine 3,153 B ekliyor + SessionStart `bd prime --hook-json` 6,285 B = **≈9.4 KB ≈ 2.6k tok**. Ayrıca AGENTS.md 5,949 B, `.agents/skills` 2,146 B, plugin yolu 31 dosya açıklaması 2,766 B, `.cursor` ve `.codex` dosyaları.
- Davranış: `bd prime` 5,715 B (≈1.6-1.8k tok, iddia tuttu); `bd ready` 401 B, `bd list` 439 B; init ≈5.5 s. Aynı 5 iş `jobs.md` eşdeğerinde 172 B. "10-50x" ölçülmedi; jobs.md'ye karşı A/B çalıştırılamadı — kimlik yok.
- Sınıf: **Kısmi**. Hüküm: prime boyutu iddiası doğru, ama Core'un `jobs.md` defteri bağlama 0 B sokarken beads her turda ~9.4 KB taşıyor.

### Claude-Handoff

- Depo: REMvisual/claude-handoff @ 22b326e · 65 yıldız · MIT.
- İddia: oturumun %20-40'ı kurtarılır.
- Her tur yükü: skill açıklamaları 776 B; çağrılınca handoff 11,752 B + handoffplan 12,814 B + references 13,572 B okunuyor.
- Davranış: kalite A/B çalıştırılamadı — kimlik yok. %20-40 için depoda ölçüm yok, tahmin.
- Sınıf: **Balon**. Hüküm: Core `handoff.js` 0 B/tur deterministik SessionEnd notu yazarken bu araç dayanaksız bir yüzdeyle her devirde ~38 KB okutuyor.

### Hatel

- Depo: junyeong-ai/hatel @ 5ac3b83 · 0 yıldız · Apache-2.0.
- İddia: sayısal yok.
- Her tur yükü: hook stdout 0 B, skill satırı 267 B; MCP 4 araç isteğe bağlı.
- Davranış: çalıştırılmadı (cargo derlemesi, iddia yok).
- Sınıf: **N/A**. Hüküm: hafif, ölçülecek iddia yok.

### Tdd-Guard

- Depo: nizos/tdd-guard @ 108992d · 2,363 yıldız · MIT.
- İddia: sayısal yok (TDD ihlallerini engeller). README halef olarak Probity'yi öneriyor.
- Her tur yükü: allow durumunda 0 B; skill `disable-model-invocation`.
- Davranış: her Write/Edit/MultiEdit/TodoWrite'ta Agent SDK ile claude-sonnet-4-6'ya doğrulayıcı çağrı; şablon ≈19.9 KB + diff + test çıktısı. A/B çalıştırılamadı — kimlik yok.
- Sınıf: **N/A**. Hüküm: bağlamı değil faturayı büyütüyor (her düzenlemede ≥5k tok model çağrısı); Core K1 Stop kapısı deterministik ve modelsiz kalmalı.

### Context-Mode

- Depo: mksglu/context-mode @ a1712db · 31,533 yıldız · lisans NOASSERTION (plugin.json Elastic-2.0). Kurulum: npm `context-mode@1.0.169`.
- İddia: %98 bağlam tasarrufu.
- Her tur yükü: MCP 11 araç 30,028 B (ctx_execute 5,197, ctx_search 4,693, ctx_batch_execute 4,620, …); SessionStart 4,801 B; PreToolUse rehberi Read 487 B, Bash 768 B (türe bir kez); skill açıklamaları 2,668 B. Toplam **≈37.5 KB ≈ 10k tok**.
- Davranış (ctx_execute + intent, model yok): `git log --stat -n 200` 136,811 → 2,474 B (%98.2); `find` 206,955 → 1,651 B (%99.2); `grep` 1,530,515 → 2,492 B. Ama ilk dönüşte soruların cevabı: 0/3 tam, 1 kısmi — `ctx_search` takibi gerekiyor. Taban: hedefli komut (`git log --oneline -- bench/run.js`) 1,376 B'de doğru cevap; rtk aynı komutlarda 50,920 / 938 / 19,274 B.
- Sınıf: **Kısmi**. Hüküm: %98 ham çıktıya karşı doğru ama kıyas tabanı yanlış; hedefli komut ve rtk'ya karşı 10k tok sabit yük ve düşük isabetle Core'un çıktı sıkıştırmasının önüne geçmiyor.

### Godot-Mcp-Go

- Depo: regiellis/godot-mcp-go @ 4343d9a · 69 yıldız · MIT.
- İddia: tam şema ~56k token / 338 araç; `typed=false` ile ~490 token.
- Her tur yükü: 2 skill açıklaması 714 B; MCP ölçülemedi.
- Davranış: çalıştırılamadı — Godot ve Go yok.
- Sınıf: **Ölçülemedi**. Hüküm: iddia doğrulanmadı.

### Ffmpeg-Skill

- Depo: kajisho5/ffmpeg-skill @ 4334225 · 2,034 yıldız · MIT.
- İddia: 42 araç; 100/100 yönlendirme isabeti.
- Her tur yükü: skill açıklaması 951 B; MCP varsayılan 12 araç **56,981 B ≈ 15.8k tok**, FULL 42 araç **162,587 B ≈ 45k tok**.
- Davranış: 42 araç sayısı doğrulandı; yönlendirme isabeti model ister — çalıştırılamadı.
- Sınıf: **Kısmi**. Hüküm: sayı doğru ama MCP yolu bağlamı ağır yüklüyor; skill tek başına (951 B) yeterli yol.

### Claude-Real-Video

- Depo: HUANGCHIHHUNGLeo/claude-real-video @ ab4b9b2 · 2,248 yıldız · MIT. Kurulum: PyPI 0.10.7.
- İddia: akıllı kare ayıklama ile videoyu az tokenla okutmak.
- Her tur yükü: skill açıklaması 307 B; MCP 5 araç (mcp eki kurulu değil, ölçülmedi).
- Davranış: 433.7 s, 1920x1080 video, `crv --no-transcribe` 51 s. 436 adaydan 71 kare, 640x360 → ≈307 tok/kare ≈ 21.8k tok. 1 fps tabanı 434 kare ≈ 133k tok → kare sayısında **%84 azalma**. ffmpeg sahne algılama tabanı: eşik 0.1'de 18, 0.05'te 22, 0.02'de 25 kare.
- Sınıf: **Gerçek** (1 fps'e karşı). Hüküm: azaltma gerçek, ama düz ffmpeg sahne algısı daha az kareyle aynı işi görüyor; ev dizinine izinsiz yazıyor.

### Fauxnix

- Depo: 20000419/fauxnix @ a2ee3cd · 995 yıldız · MIT.
- İddia: 270 vakalık fark oracle'ında Git Bash ile aynı çıktı.
- Her tur yükü: MCP 4 araç 6,573 B ≈ 1.8k tok (bash 2,941, bash_batch 2,346, fauxnix_session 685, fauxnix_translate 596).
- Davranış: oracle bu makinede 269/270 (%99.6), 37 s; tek hata bracket-leading-empty-alt. Bağımsız 10 komutluk set 8/10 (`grep -rn` mutlak yol basıyor; `xargs` yerleşik komut çalıştırmıyor). DeepSeek süre iddiaları ölçülmedi.
- Sınıf: **Gerçek**. Hüküm: uyumluluk iddiası tekrarlandı; Core'da karşılığı yok, Git Bash zaten varken kazancı dar.

### V4-Pro

- Depo: yn400/v4-pro @ ee77cdf · 3 yıldız · MIT. Kurulum: PyPI 2.3.0.
- İddia: kendi benchmark'ında 35/35; temiz kodda P0 yanlış pozitif yok; %71.3 phantom recall.
- Her tur yükü: 0 B.
- Davranış: `run_benchmark` 35/35, 181 ms — ama temiz set bu kurulumda 0 dosya, FP kontrolü hiç çalışmadı. Bağımsız slop setim (10 ekilmiş sorun): 10/10 (4 P0, 6 P1), ≈2 s. Temiz kod (click, 17 modül, 12,674 satır): 73 bulgu — 1 P0 yanlış pozitif (`_typeshed` sahte bağımlılık sanıldı), 52 P1 (çoğu overload/platform tanımı ve yutulan istisna), 12 P2, 8 P3. %71.3 ölçülmedi (ağ ve veri).
- Sınıf: **Gerçek**. Hüküm: yakalama tuttu, "P0'da FP yok" 1/17 ile kırıldı, P1 gürültüsü kapı olarak kullanılmayı engelliyor.

## Kimlik İçin Gereken

Davranış A/B'lerini (tdd-guard ↔ K1, claude-handoff ↔ handoff.js, beads ↔ jobs.md, fleetmates) koşmak için bir kez `claude setup-token` çalıştırılıp çıkan değer kullanıcı ortam değişkeni `CLAUDE_CODE_OAUTH_TOKEN` olarak ayarlanmalı; `bench/olcum.js` onu okuyor.
