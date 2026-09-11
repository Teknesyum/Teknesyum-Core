# Danışma 028 — Çok işli turda unutmama ve dosya adları (girdi)

Fable'a olduğu gibi giden metin.

---

Sen Teknesyum Core'un karar ortağısın. Dosya okuma; olgular aşağıda. Cevabın Türkçe olsun, kısa ve kesin: her soruya hüküm, gerekçe tek-iki satır, sonunda yapılacaklar.

## Sahibin sözü (aynen)

> neden reddediyor 5 büyük iş var hepsini unutmadan yapabilecek mi cursorda serkan bunun olmadığını bazılarını unuttuğunu söyledi
> bide cursorda da kullanılabilir mi bu plugin
> önce ve sonra.md lerini nerede kullanıyoruz ve adları artık ingilizce olsun

## Şu anki durum (v0.31.0, D18, danışma 027)

- Kural (CLAUDE.md, her oturum yüklü): "Every job in a prompt is done in that turn: in the given order, or in parallel subagents when independent and not touching the same files. Defer only what waits on my decision, is blocked outside the repo, or hits the context handoff — write it to `.claude/sonra.md` with the reason, say so in one line. Deferring for size or count is scope-narrowing: five files or more means `docs/plan.md`, then build on in the same turn."
- "Önce" dosyası yok. 025'te sahip `preread.md` + `postread.md` önermişti; yalnız preread kuruldu, adı `.claude/sonra.md`. Postread (Stop'ta okunan) kurulmadı; gerekçe: Stop'ta bağlama yazmanın tek yolu `decision:block`, o da `dur.js` kanıt kapısıyla çakışır.
- `sonra.md` kullanıldığı yerler: `core/hooks/mod.js` (UserPromptSubmit: dosya boş değilse içeriği `mod.sonra` cümlesiyle additionalContext'e koyar, dosyayı `trash/sonra-<ts>.md`'ye taşır, banner satırı `banner.sonra`), `core/hooks/handoff.js` (devir notuna "N lines waiting"), strings.json (`mod.sonra`, `banner.sonra`), test/all.js (bir süit), README×2 kanca tablosu, docs/banner.md, DECISIONS, yordam.md, CLAUDE.md.
- `dur.js` (Stop): düzenlenmiş kod dosyası varsa ve o ağaç karması için geçen test yoksa bir kez `decision:block` + reason; `stop_hook_active` true ise geçer; aynı ağaç ikinci kez sorulmaz. Tek ısrar.
- Sınıflar: Z hiç yazmaz, A yalnız tetiklenince yazar, sıradan turda 0 bayt. Core yalnız Z ve A.
- Bu harnesste yerel yapılacaklar listesi aracı her ortamda yok (bu oturumda TodoWrite görünmüyor).

## Gözlem

Serkan (Cursor'da, Core'suz) tek istemde çok iş verince modelin bazılarını unuttuğunu söylüyor. Şu an Core'da unutmaya karşı yalnız kural metni var; deterministik bir ağ yok. Uzun turda (5 büyük iş, onlarca araç çağrısı) ilk istemdeki maddeler bağlamda geride kalıyor.

## Benim önerim (değerlendir, düzelt ya da reddet)

1. `.claude/sonra.md` → `.claude/jobs.md`. İstemde iki ya da daha çok iş varsa model işe başlamadan hepsini `- [ ] iş` olarak yazar, bittikçe `- [x]`, bırakılan `- [ ] iş — reason`.
2. Stop ağı `dur.js` içine (ayrı kanca değil, tek blok): `jobs.md`'de gerekçesiz `- [ ]` varsa bir kez block, reason "N iş açık: …; bitir ya da gerekçe yaz". Kanıt kapısıyla aynı Stop'ta ikisi de gerekirse tek reason'da birleşir; `stop_hook_active` ile tek ısrar korunur.
3. Sonraki istemde `mod.js` yalnız açık kalanları (gerekçeli) geri verir, dosyayı `trash/jobs-<ts>.md`'ye taşır. Hepsi `[x]` ise sessizce trash'e.
4. Tek işli istemde dosya yazılmaz; sıradan tur 0 bayt.

## Soru

1. Yalnız kural metni 5 büyük işi unutmadan bitirtir mi? Değilse önerdiğim ağ doğru mu, eksik/fazla ne var?
2. 025'in "postread kurulmasın" kararı bu tasarımla (dur.js içinde tek blok) çelişiyor mu, yoksa gerekçesi burada düşüyor mu?
3. İngilizce ad: `jobs.md` mi, başka mı? Tek dosya mı, iki dosya mı?
4. Model listeyi yazmayı unutursa (ağ hiç kurulmazsa) ne olur; ucuz bir yakalama var mı (ör. UserPromptSubmit'te istemde numaralı/çok maddeli liste görülünce tek satır hatırlatma)? Bunun bedelini söyle.

Kısıt: sıradan tura sabit token eklemeyen çözüm.
