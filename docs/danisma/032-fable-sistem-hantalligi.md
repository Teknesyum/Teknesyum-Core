# Danışma 032: Teknesyum sisteminin hantal yönleri

claude-fable-5-1, 8.279 çıktı token, 138 sn. Girdi: [032-fable-sistem-hantalligi-girdi.md](032-fable-sistem-hantalligi-girdi.md). Cevap olduğu gibi:

---

## Danışma 032: Teknesyum Sisteminin Hantal Yönleri

Ölçümler bu makineden alındı; "tahmin" yazanlar benim çıkarımım.

### 1. Her turda ödenen bedel

**Oturum başı yüklenen metinler** (`wc -c`):

| Dosya | Bayt |
|---|---|
| `~/.claude/CLAUDE.md` | 3.218 |
| `RULES.md` | 3.612 |
| `RTK.md` | 990 |
| proje `AGENTS.md` | 602 |
| `memory/MEMORY.md` | 1.800 |
| **Toplam** | **10.222 bayt ≈ 2.700–3.000 token (tahmin, 3,5–4 bayt/token)** |

Bu, önbellekte de olsa her turun tabanı. `yordam.md` (5.403 bayt) yalnız çağrılınca giriyor; doğru.

**Her turda çalışan kancalar** (`hooks.json` + `date +%s%N` ile ölçüm): çıplak node 49 ms, `count.js` 66, `mod.js` 64, `yasak.js` 64, `loop.js` 65, `dur.js` 98–112 ms. Bir Bash çağrısı = yasak + loop + count = 3 süreç ≈ 195 ms; Edit = 1 süreç ≈ 65 ms; Stop = count + dur ≈ 180 ms. **Bağlama token katmıyorlar**: `grep additionalContext` ile baktım, count.js yalnız eşikte, mod.js yalnız işarette, dur.js yalnız açık iş varken konuşuyor. Bedel zaman: bu oturumda 842 kabuk + 348 düzenleme çağrısı → ≈ 3 dakika süreç başlatma (tahmin, ölçümlerin çarpımı).

**Sonuç:** işaretsiz turun token maliyeti gerçekten doğal. Hantallık token değil, üç yerde: her tur yüklenen metnin ~3 bin tokenlik payı, süreç başlatma süresi, disk birikimi.

### 2. Hantallık listesi, bedeline göre

**A. Her danışmada betik ve kanca okuma alışkanlığı** — `oturum.jsonl` içinde `file_path` sayımı: `mod.js` 29, `count.js` 22, `dur.js` 11, `yasak.js` 10, `lib.js` 9 kez okunmuş; `yordam.md` 10 kez. Her tur: hayır; her iş: evet, ve compact yoksa kalıntı (bu oturumda 0 compact, 18,9 MB kayıt). Bedel: kabaca 100 okuma × 1,5–3 bin = 150–300 bin token kalıntı (tahmin). Karşılık: biçimi hatırlamak. Öneri: 031'deki çözüm — biçimi betiğe göm, model betiği okumasın; ayrıca `AGENTS.md`'ye her kancanın tek satırlık sözleşmesi (girdi olayı, ne zaman konuşur). Kazanç: iş başına 2–5 bin token.

**B. Danışma girdisinin ana bağlama iki kez yazılması** — 031'de ölçüldü, uygulanmış değil: `git status` `advice.js` değişik, henüz commit yok; ve bu 032 girdisi de elle yazılmış. Bu danışmanın kendisi `yordam.md`'nin "Never make the agent read files, hand it the facts" kuralına ters: ajana "dosyaları kendin oku" dendi. İkisinden biri yanlış; ya kural ya da alışkanlık. Öneri: 031'in iki modlu `ask`'ı bitir; `gorus` modu "ajan okur" kuralı olsun, yordam'a yaz. Kazanç: danışma başına ~3,5 bin kalıntı.

**C. Kabuk başına üç node süreci** — `yasak.js` ve `loop.js` ayrı süreç, ardından `count.js`. Bedel: ≈ 195 ms × her Bash; oturumda ~3 dk. Karşılık: yasak komut kapısı, döngü kapısı, sayım. Öneri: PreToolUse'ta tek `host.js` girişi (dosya zaten var, 5.628 bayt) iki kancayı aynı süreçte koşsun; PostToolUse count'a `Read/Grep` matcher yok, iyi. Kazanç: Bash başına ~65 ms, oturumda ~1 dk. Kaldırma değil birleştirme; kullanıcının istediği davranış bozulmuyor.

**D. Durum dizini süpürülmüyor** — `~/.claude/teknesyum/` içinde 240 `state-*.json`, 101 `banner-*.json`, 9 `advice-*.json`; 160 state dosyası 3 günden eski (`find -mtime +3`). Süpüren kod yok (`grep unlink` yalnız tmp/owner). Bedel: disk küçük (KB), ama `lib.js`'in dizin taraması ve `ls` çıktıları büyüyor; kokusu "sistem kendini toplamıyor". Öneri: SessionStart'ta 7 günden eski `state-/banner-/advice-` sil, 10 satır. Kazanç: temizlik, sıfır token.

**E. Kütüphane 571 MB** — 40 raf, `.git` paketleriyle (`claude-code-best-practice` 140 MB, 63'ü `.git`). Günlük `refresh` arka planda `fetch all` koşuyor (`detached`, ölçüm: SessionStart 67 ms, bloklamıyor). Bedel: disk ve ağ, günde bir. Karşılık: `??` isabetleri. Öneri: `--depth 1` klon ve `.git` sonrası `gc`; ya da rafları `--lean` metin olarak dondur. Kazanç: ~%40 disk (tahmin).

**F. Eklenti önbelleğinde 10 eski sürüm** — `plugins/cache/.../0.29.0 … 0.36.1`, 3,1 MB. Bedel küçük; `cop.js` var ama bunu kapsamıyor. Öneri: `cop.js`'e bu dizini ekle, son ikisi kalsın.

**G. `RULES.md` + `CLAUDE.md` çakışması** — iki dosyada aynı kurallar iki kez: "yorum yazma", "onay sorma", "maliyet altın kural", "iki başlık". ~1,2 KB tekrar ≈ 350 token/tur (tahmin). Öneri: RULES'ta yalnız CLAUDE'da olmayanlar kalsın; 30 satır tavanına zaten sığmıyor.

**H. `advice.js ask` metni kayıtta 198 kez geçiyor** — çoğu okuma ve yardım metni tekrarı, gerçek çağrı 20 fable ajanı. Aynı yardım metninin defalarca bağlama girmesi A'nın alt başlığı; ayrı iş değil.

### 3. Üçe ayırma

- **Kaldırılmalı:** RULES/CLAUDE tekrarları (G); eski eklenti sürümleri (F); eski state/banner dosyaları (D).
- **Sadeleştirilmeli:** betik okuma alışkanlığı (A) ve danışma ikilemesi (B) — 031 çözümü; üç süreç → tek giriş (C); kütüphane klonları sığ (E).
- **Aynen kalmalı:** kancaların sessiz kalması (işaretsiz turda additionalContext yok — doğru tasarım), `yordam.md`'nin çağrılınca okunması, `MEMORY.md`'nin 1,8 KB'de tutulması, günlük arka plan `refresh`.

### 4. İlk üç iş, uygulama sırasıyla

1. **031'i bitir** (`advice.js` iki mod + yordam'a "gorus modunda ajan okur" kuralı, uncommitted diff zaten başlamış) — en büyük kalıntı burada, ve kural çelişkisini kapatır.
2. **Süpürücü + önbellek** (D, F): SessionStart'ta 7 gün kuralı, `cop.js`'e eklenti dizini. Küçük, sıfır token, görünür temizlik.
3. **PreToolUse tek giriş** (C): `host.js` üzerinden yasak+loop tek süreç. Bash başına 65 ms.

G (RULES sadeleşmesi) senin dosyan; ben dokunmam, tek satır işaret ettim.

Yok
