# agency-agents ile Teknesyum Core Kıyası

**Tarih:** 2026-09-05
**Soru:** msitarzewski/agency-agents bize faydalı olabilir mi?
**Bağlam:** Bugünkü ölçümde Core'un ajan başına tüketimi native Claude Code'a göre
+%16-21 çıktı ([COST-MODEL.md](../COST-MODEL.md) satır 30-45). Altın kural ≤%5.

**Token tahmini kuralı:** Bu raporda geçen her `tok~` değeri `wc -c` çıktısının 4'e
bölümüdür. Gerçek tokenizer sayısı değil, bayt/4 yaklaşımıdır; İngilizce Markdown'da
tipik olarak gerçek değerin %5-10 altında kalır.

---

## 1. agency-agents ne

### 1.1 Yapı

Depo kökü: `.../scratchpad/agency-agents`

| Ne | Sayı | Kanıt |
|---|---|---|
| Toplam `.md` | 318 | `find . -name "*.md"` |
| Frontmatter'lı gerçek ajan dosyası | **273** | 18 division klasörü, `divisions.json` |
| Division (bölüm) | 18 | `divisions.json`, `divisions` anahtarı |
| Ajan olmayan md | 45 | README (82 KB), CONTRIBUTING, `strategy/`, `examples/`, `integrations/` |
| Ajan metni toplam boyut | 3.870.844 bayt → **tok~ 967.711** | `find … \| xargs wc -c` |

Bölüm başına ajan sayısı: `engineering` 59, `specialized` 58, `marketing` 36,
`game-development` 21, `gis` 13, `security` 12, `design` 10, `sales` 9, `testing` 9,
`paid-media`/`project-management` 7, `academic`/`spatial-computing`/`support` 6,
`finance`/`product` 5, `healthcare` 3, `research` 1.

`strategy/` bir division değil: `playbooks/` (phase-0…phase-6, 7 dosya),
`runbooks/` (4 senaryo), `coordination/` (`agent-activation-prompts.md` 13 KB,
`handoff-templates.md` 10 KB).

### 1.2 Ajan dosyası anatomisi

Frontmatter alan frekansı (273 dosya üstünde ölçüldü):

| Alan | Kaç dosyada | Not |
|---|---|---|
| `name:` | 273 | zorunlu (`scripts/lint-agents.sh` satır 34) |
| `description:` | 273 | zorunlu |
| `color:` | 273 | zorunlu |
| `emoji:` | 273 | katalog UI'ı için |
| `vibe:` | 272 | tek satırlık slogan |
| `tools:` | **17** | ör. `tools: WebFetch, WebSearch, Read, Write, Edit` |
| `tier:` | **7** | |
| `author:` / `url:` | 7 | |
| `model:` | **0** | model seçimi hiç yok |

Gövde şablonu her ajanda aynı: `# … Agent Personality` → `## 🧠 Your Identity & Memory`
→ `## 🎯 Your Core Mission` → `## 🚨 Critical Rules You Must Follow` → `## 📋 Checklist`
→ `## 💬 Communication Style` → `## 🎯 Your Success Metrics`.

**Beş örnek ajanın boyutu** (bayt/4):

| Dosya | Satır | Bayt | tok~ |
|---|---:|---:|---:|
| `engineering/engineering-code-reviewer.md` | 76 | 3.076 | **769** |
| `engineering/engineering-backend-architect.md` | 236 | 10.928 | **2.732** |
| `design/design-ui-designer.md` | 382 | 13.339 | **3.334** |
| `specialized/agents-orchestrator.md` | 366 | 15.725 | **3.931** |
| `security/security-penetration-tester.md` | 398 | 21.436 | **5.359** |

273 dosyanın dağılımı: min 1.700 bayt (`spatial-computing/xr-interface-architect.md`),
**medyan 13.587 bayt (tok~ 3.397)**, ortalama 14.178, max 35.322 bayt (tok~ 8.831).

### 1.3 `divisions.json` ve `tools.json`

İkisi de "tek doğru kaynak + CI drift kontrolü" kalıbı.

- `divisions.json` (2.537 bayt): her bölüm → etiket, Lucide ikon adı, marka rengi.
  Kendi `_note` alanında yazdığı gibi, `scripts/check-divisions.sh` diskteki klasörleri,
  `convert.sh` ve `lint-agents.sh` içindeki `AGENT_DIRS` dizilerini ve
  `.github/workflows/lint-agents.yml` yol filtrelerini bu dosyayla karşılaştırır, uyuşmazsa
  build'i düşürür (`scripts/check-divisions.sh` satır 4-16).
- `tools.json` (8.414 bayt): 16 CLI aracının kurulum sözleşmesi — `detect.dirs`,
  `dest` şablonları, `format` (render sözleşmesi), `installKind`
  (`per-agent` / `roster` / `plugin`), `scope.user|project`, sürüm komutu.
  `scripts/check-tools.sh` bunu `install.sh` içindeki `ALL_TOOLS` ile karşılaştırır.

Bunlar **katalog metadata'sı**; çalışma zamanında hiçbir şeyi zorlamazlar.

### 1.4 `integrations/claude-code`

Tek dosya: `integrations/claude-code/README.md`, 712 bayt. İçeriği aynen şu — dönüşüm
yok, `.md` + YAML frontmatter zaten Claude Code'un yerel biçimi. Kurulum:

```
./scripts/install.sh --tool claude-code
```

`install_claude_code()` (`scripts/install.sh` satır 758-771) yalnızca 18 klasördeki her
`.md` dosyasını `~/.claude/agents/` altına kopyalar; `--agents-file` verilirse
`slug_allowed` ile seçmeli kurar (`scripts/agents-to-install.example`).
Ajanı çağırma yolu prompt metnidir: "Activate Frontend Developer and help me build…".

### 1.5 `scripts/`

| Dosya | Bayt | İş |
|---|---:|---|
| `install.sh` | 59.061 | 16 araç için kopyalama/kurulum |
| `convert.sh` | 23.492 | md → TOML/MDC/YAML vb. biçim dönüştürme |
| `build-hermes-plugin.py` | 19.929 | Hermes router eklentisi üretimi |
| `test-install.sh` / `test-convert-outputs.sh` | 15.9 K / 15.5 K | kurulum ve dönüşüm testleri |
| `lint-agents.sh` | 4.947 | frontmatter zorunluluğu (`name`,`description`,`color`) + bölüm uyarısı |
| `check-divisions.sh` / `check-tools.sh` | 5.479 / 4.067 | tek-doğru-kaynak drift kontrolü |
| `check-agent-originality.sh` | 6.429 | kopyala-yapıştır ajan tespiti |
| `i18n/localize-agents-zh.ps1` | 1.654 | Çince ad yerelleştirme |

### 1.6 Orkestrasyon / kapı / maliyet mekanizması var mı

**Yok.** Depo baştan sona rol metnidir.

- Sözleşme, `owns:`, `verify:` yok.
- Hook, gate, kapanış mührü yok — `.github/` yalnızca lint CI'ı.
- Maliyet modeli, model/tier seçimi yok (`model:` alanı 273 dosyanın hiçbirinde yok).
- Tek "orkestratör" `specialized/agents-orchestrator.md`: 366 satır **düz metin**.
  İçinde "Maximum 3 attempts per task", "No phase advancement without meeting quality
  standards" gibi kurallar yazılı, ama bunları uygulayan tek şey modelin kendisi.
  Faz adımları prompt içine gömülü shell örnekleri (`ls -la project-specs/*-setup.md`).
- `strategy/coordination/handoff-templates.md`: ajandan ajana devir için doldurulacak
  Markdown tablosu ("From / To / Phase / Acceptance criteria" checkbox listesi).
  Yine şablon; doğrulayan bir şey yok.

---

## 2. Rol metinleri: satır satır kıyas

### 2.1 Ajan başına prompt boyutu

| | agency-agents | Teknesyum Core |
|---|---|---|
| Rol dosyası sayısı | 273 | 6 (`core/roles/*.md`, 298 satır) |
| Tek rol, medyan | 13.587 bayt / **tok~ 3.397** | 1.360 bayt / **tok~ 340** |
| En küçük rol | 1.700 bayt / tok~ 425 | `builder.md` 894 bayt / **tok~ 223** |
| En büyük rol | 35.322 bayt / tok~ 8.831 | `advisor.md` 2.893 bayt / **tok~ 723** |
| Tüm roller toplam | 3.870.844 bayt / tok~ 967.711 | 9.950 bayt / **tok~ 2.488** |

Core rolleri tek tek:

| Dosya | Satır | Bayt | tok~ |
|---|---:|---:|---:|
| `core/roles/builder.md` | 32 | 894 | 223 |
| `core/roles/planner.md` | 30 | 964 | 241 |
| `core/roles/scribe.md` | 38 | 1.063 | 265 |
| `core/roles/scout.md` | 56 | 1.656 | 414 |
| `core/roles/auditor.md` | 60 | 2.480 | 620 |
| `core/roles/advisor.md` | 82 | 2.893 | 723 |

**Oran:** medyan agency ajanı, Core builder'ın **15 katı**; en ağır agency ajanı
builder'ın **24 katı**.

### 2.2 Rol tanımının niteliği

| Boyut | agency-agents | Teknesyum Core |
|---|---|---|
| Açılış | "You are **Backend Architect**, a senior backend architect…" (`engineering/engineering-backend-architect.md` satır 10) | "Write the code a contract asks for." (`core/roles/builder.md` satır 7) |
| Kişilik | Var ve zorunlu şablon: `## 🧠 Your Identity & Memory` — "Personality: Strategic, security-focused…", "Memory: You remember successful architecture patterns" (satır 13-16) | Yok. Hiçbir rol dosyasında kişilik satırı yok |
| Alan bilgisi | Ağırlık burada: "sub-20ms query times", "99.9% availability", CQRS/Event Sourcing, Kubernetes (satır 22-235) | Yok — alan bilgisi modele bırakılmış |
| Sınır | Yalnız `tools:` alanı, 273'ün 17'sinde | `owns:` listesi: "Touch only files in the contract's `owns:` list. A file outside it is a blocker, not a detour" (`builder.md` satır 11-13) |
| Sıra | Faz anlatısı, serbest metin | Numaralı 4 adım (`builder.md` satır 17-21), "Read `.claude/relay/map.md` before opening source files" |
| Dönüş biçimi | Serbest: "Start with a summary… End with encouragement" (`engineering-code-reviewer.md` satır 74-78) | Sabit blok: `result / files / verify / blockers` (`builder.md` satır 25-30); planner'da 4 bölüm, "Nothing else" (`planner.md` satır 28) |
| Başarı ölçütü | "Success Metrics" — modele söylenen temenni | `verify:` adımlarının exit 0 vermesi; ölçen model değil, CLI |

### 2.3 Bağlayıcılık — zorlama var mı

| | agency-agents | Teknesyum Core |
|---|---|---|
| Dosya sınırı zorlanır mı | Hayır | Evet — `PreToolUse` → `guard.js` (`core/hooks/hooks.json` satır 3-27), 21.811 bayt |
| Ajan çağrısı denetlenir mi | Hayır | Evet — `Agent\|Task` matcher → `watch.js` (satır 28-38), 19.080 bayt |
| Kapanış | Yok | `SubagentStop` → submit + complete, `autoclose.js` + `seal.js` (`core/skills/relay/SKILL.md` "Closing") |
| Risk | Metinde "quality gates" temennisi | Diff'ten hesaplanır: hassas yol, >8 dosya veya >300 satır → high, denetim kaydı zorunlu (`SKILL.md`, "Risk comes from the diff since the merge-base, not from a claim") |
| Model seçimi | Yok | `core/tiers.json` (116 satır): rol × profil → hücre; tavan `eco: sonnet`, `normal/premium: opus` |
| Kural ihlali | Model unutursa hiçbir şey olmaz | Hook reddeder; auditor bir dosya yazarsa denetim geçersiz (`core/roles/auditor.md` satır 12-13) |

Tek cümleyle: **onlarınki tavsiye, bizimki icra.** Onlarınki bilgi taşır, bizimki
davranış zorlar. Bu ikisi rakip değil, farklı katman.

---

## 3. Tüketim: bir agency ajanını kurmak koşu başına ne ekler

İki ayrı maliyet var ve büyük olanı ikincisi.

### 3.1 Ajan çağrıldığında: system prompt'a giren gövde

Claude Code bir alt ajanı açtığında ajan dosyasının **tüm gövdesi** o ajanın system
prompt'una girer. Core'da bu 223 token (builder). agency'de medyan 3.397.

**Fark: ajan başına +3.174 token**, ajanın iç döngüsündeki her turda yeniden ödenir.

Bugünkü ölçümde bir builder koşusu medyan 11 tur / $0.1047 idi
([COST-MODEL.md](../COST-MODEL.md) tablo). Sonnet fiyatlarıyla (girdi $3/Mtok,
cache yazma $3,75/Mtok, cache okuma $0,30/Mtok):

| Kalem | Hesap | $ |
|---|---|---|
| İlk tur, cache yazma | 3.174 × 3,75 / 1e6 | 0,0119 |
| 10 tur, cache okuma | 31.740 × 0,30 / 1e6 | 0,0095 |
| **Toplam ek** | | **≈ 0,0214** |

$0,1047 taban üstünde **≈ +%20**. Yani mevcut +%16-21 sorununu **ikiye katlar**;
toplam native'e göre kabaca **+%36-41** olur. Altın kural ≤%5.

### 3.2 Her turda, sonsuza kadar: ajan listesi

Claude Code kurulu her alt ajanı `name` + `description` ile ana oturumun system
prompt'unda listeler. 273 ajanın `name:` + `description:` satırları toplam
**71.941 bayt → tok~ 17.985**.

| Kaç ajan kurulu | Ana oturuma her turda eklenen |
|---:|---:|
| 273 (tümü) | tok~ **17.985** |
| 50 | tok~ ~3.290 |
| 10 | tok~ ~658 |
| 5 | tok~ ~329 |

Core bugün bu maliyeti **sıfırlamış** durumda: tek ajan tipi (`worker`) var, rol dosyası
prompt içinde adıyla verilir. README satır 40'ta yazdığı gibi rol açıklamaları context'e
girmez, yalnızca o rolü tutan ajan öder. 273 ajanı kurmak bu tasarım kararını iptal eder.

**Cevap: kötüleştirir. Tüm depoyu kurmak +%16-21'i yaklaşık +%40'a taşır ve üstüne ana
oturuma turda ~18 K token sabit yük bindirir.**

---

## 4. İşimize yarayabilecek somut parçalar

| # | Ne | Nerede | Nasıl alınır | Bedel |
|---|---|---|---|---|
| 1 | **Tek-doğru-kaynak drift kontrolü.** JSON kanonik, script diskle ve kodla karşılaştırıp uyuşmazsa CI'ı düşürür | `scripts/check-divisions.sh` (5.479 B), `scripts/check-tools.sh` (4.067 B) | Kalıbı kopyala, `core/tiers.json` ↔ `core/roles/*.md` ↔ `core/hooks/hooks.json` üçlüsüne uygula. Yeni bir rol eklendiğinde tiers'ta hücresi yoksa build düşsün | ~60 satır script, tek sözleşme |
| 2 | **Rol frontmatter linteri.** Zorunlu alanlar yoksa ERROR, önerilen bölümler yoksa WARN | `scripts/lint-agents.sh` satır 34-36 | Aynısı `core/roles/*.md` için: `role:` ve `tier:` zorunlu, `## Return` bölümü zorunlu | ~40 satır, tek sözleşme |
| 3 | **Kod incelemesi önceliklendirme dili:** 🔴 blocker / 🟡 suggestion / 💭 nit üçlüsü ve "Be specific — 'SQL injection on line 42' not 'security issue'" | `engineering/engineering-code-reviewer.md` satır 31-64 | `core/roles/auditor.md` `## Checks` altına 3-4 satır olarak sıkıştır. Dosyayı kurma, cümleyi al | ~5 satır, +30 token/auditor koşusu |
| 4 | **Senaryo runbook'ları.** Olay müdahalesi, MVP, kurumsal özellik için hazır faz sırası | `strategy/runbooks/scenario-*.md` (4 dosya, 25 KB) | Okunur, T0'ın sözleşme bölmesi için fikir kaynağı. Depoya konmaz | 0 (yalnız okuma) |
| 5 | **Seçmeli kurulum listesi.** Slug veya insan adıyla satır satır ajan seçimi | `scripts/agents-to-install.example`, `install.sh` `slug_allowed` | Eğer 3.1'deki bedele rağmen 2-3 ajan denenecekse, tümünü kurma yolu bu | 0 |

1 ve 2 gerçek kazanç; 3 ucuz ve doğrudan; 4 ve 5 yalnız kolaylık.

---

## 5. Bize zarar verecek / çakışan parçalar

| Ne | Nerede | Neden çakışıyor |
|---|---|---|
| **273 ajanın tümünü kurmak** | `install.sh --tool claude-code` | Ana oturuma turda tok~ 17.985 sabit yük. Core'un "rol açıklamaları context'e girmez" tasarımını (README satır 40) doğrudan iptal eder |
| **Rakip orkestratör** | `specialized/agents-orchestrator.md` (366 satır) | Kendi pipeline'ı, kendi `project-specs/` + `project-tasks/` düzeni, kendi retry limiti var. T0 + sözleşme + `SubagentStop` kapanışıyla kafa kafaya çarpışır; ikisi aynı oturumda çalışamaz |
| **Kişilik/hafıza blokları** | Her ajanda `## 🧠 Your Identity & Memory` | Ölçülemez, doğrulanamaz, `verify:` ile ifade edilemez. `planner.md` satır 21-22'deki kural bunu zaten yasaklıyor: kabulü çalıştırılabilir komutla ifade edilemeyen sözleşme kötü bölünmüştür |
| **`model:` alanının hiç olmaması** | 273/273 | `core/tiers.json` rol × profil yönlendirmesi devre dışı kalır; her ajan oturumun modelini alır. `eco` profilinin anlamı kaybolur |
| **`tools:` yalnız 17 dosyada** | Frontmatter frekans tablosu | Kalan 256 ajan tam alet setiyle açılır. `guard.js` yine tutar ama sözleşmesiz açılan ajanın `owns:`'u olmadığı için kapı boşa çalışır |
| **"Success Metrics" temennileri** | ör. `engineering-backend-architect.md` satır 205-211 | "%99,9 uptime" modele söylenen bir dilek. Core'da başarı ölçütü `verify:`'ın exit 0'ıdır; iki ölçüt aynı ajanda çelişir |

---

## 6. Ajan sayısını azaltma konusunda öğrenilecek bir şey var mı

**Hayır — depo tam tersi yönde bir örnek.** Tasarım ilkesi "her niş için ayrı bir ajan":
273 ajan, 18 bölüm, `engineering` tek başına 59 tane. Bağlam kaybını çözme yolları da
ajan sayısını azaltmak değil, aralarında el değiştirme şablonu doldurmak
(`strategy/coordination/handoff-templates.md`: "Consistent handoffs prevent context loss
— the #1 cause of multi-agent coordination failure").

Tek ilginç kırıntı `tools.json` içindeki `installKind: "roster"`: Aider ve Windsurf için
**tüm ajanlar tek dosyaya** düzleştirilir (`CONVENTIONS.md`, `.windsurfrules`) — yani tek
ajan çok rolü aynı anda taşır. Ama bu birleştirme düz birleştirmedir, sıkıştırma değil:
273 × ~14 KB tek dosyaya yığılır. Bizim sorunumuza çözüm değil, uyarı örneği.

Bizim tarafta zaten daha iyisi var: tek ajan tipi + prompt'ta adı verilen rol dosyası
(`SKILL.md`, "## Agents" → "One type, `worker`"). Onlardan alınacak ders yok.

---

## 7. Karar

**Uzak dur — iki script kalıbı (`check-divisions.sh`, `lint-agents.sh`) ve
code-reviewer'ın 🔴/🟡/💭 önceliklendirme cümlesi dışında hiçbir şeyini alma:** depo bir
prompt kütüphanesidir, orkestrasyon/kapı/maliyet mekanizması içermez, kurulması ajan
başına ~+%20 (mevcut +%16-21'i ~+%40'a çıkarır) ve tümü kurulursa ana oturuma turda
tok~ 17.985 sabit yük getirir; bu, ≤%5 altın kuralıyla aynı yöne bakmıyor.
