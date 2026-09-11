# Danışma 028 — Çok işli turda unutmama ve dosya adları (fable cevabı)

Girdi: `028-fable-is-listesi-girdi.md`. Model fable, 56.248 token, 75 sn, araç yok.
Cevap olduğu gibi:

---

## 1. Kural metni yeter mi?

**Hüküm: Yetmez; ağ doğru, iki eksik var.**
Kural oturum başında bir kez okunur; 5 iş × onlarca araç çağrısı sonunda ilk istem bağlamın en gerisinde kalır, compact gelirse tamamen gider. Serkan'ın gördüğü tam bu. Deterministik ağ şart, önerinin dört maddesi de yerinde.

Eksik 1 — **compact köprüsü**: turun ortasında compact olursa `jobs.md` yeniden okunmaz. `SessionStart` (matcher `compact`) kancası: dosya varsa açık maddeleri additionalContext'e koy. A sınıfı, sıradan turda 0 bayt.

Eksik 2 — **reason'a maddeleri yaz**: "N iş açık" değil, açık satırların kendisi. Model dosyayı okumadan bitirmeye döner; bir araç çağrısı tasarrufu, blok tek ısrar olduğu için gerekli.

Fazla yok. Tek risk: model bloktan kaçmak için hepsine sahte gerekçe yazar; bunu deterministik yakalayamazsın, ama sessiz unutmayı **görünür ertelemeye** çevirmiş olursun; sahip gerekçeleri görür. Yeterli.

## 2. 025 ile çelişki

**Hüküm: Çelişmiyor; gerekçe düşüyor.**
025'in itirazı teknikti: Stop'ta iki ayrı kanca iki `decision:block` üretemez. `dur.js` içinde tek blok, tek reason olunca bu itiraz kalkar. Karar ise ayakta: bu bir postread (serbest not enjeksiyonu) değil, **kapı**. DECISIONS'a bir satır: "027: 025'in postread'i kurulmadı; yerine dur.js'de iş kapısı; itiraz birleşik reason ile düştü."

## 3. Ad ve dosya sayısı

**Hüküm: `.claude/jobs.md`, tek dosya.**
CLAUDE.md'deki terim zaten "job"; `tasks/todo` harness araçlarıyla karışır. Tek dosya yeter: önce/sonra ayrımı ölüyor, çünkü aynı dosya hem turun kontrol listesi (eski postread) hem sonraki isteme dönen artık (eski sonra). Trash adı `trash/jobs-<ts>.md`; strings anahtarları `mod.jobs`, `banner.jobs`.

Cursor sorusu (sahibin ikinci cümlesi, senin sorularında yok): Cursor'un kendi kanca sistemi var ama şema ve olay adları farklı, additionalContext ve statusline yok. Doğrudan kurulmaz, port ayrı iş; bunu olguyla doğrulamadan söz verme.

## 4. Model listeyi yazmazsa

**Hüküm: Ucuz yakalama var, kur; iki parça.**
Parça A — `mod.js` zaten her istemde çalışıyor; regex ekle: ≥2 satır `^\s*(\d+[.)]|[-*])` ya da ayraçlı çok madde. Tutarsa tek satır: "İstemde N madde görüldü — önce `.claude/jobs.md` yaz." Ve `.claude/jobs.expect` işaretini bırak. Bedel: yalnız o istemde ~20 token, sıradan turda 0; yanlış pozitif (yapıştırılmış log) bir satıra mal olur, kabul.

Parça B — `dur.js`: `jobs.expect` var, `jobs.md` yoksa bir kez block, reason "liste yazılmadı; işleri `jobs.md`'ye yaz, sonra bitir." Sonra işareti sil. Bu döngüyü kapatır: hatırlatma modele bağlı kalmaz, kapı deterministik. Bedel sıradan turda 0.

## Yapılacaklar

1. `sonra.md` → `jobs.md`: `mod.js`, `handoff.js`, `strings.json`, `test/all.js`, README×2, `docs/banner.md`, `yordam.md`, CLAUDE.md kural cümlesi (aynı uzunlukta, `- [ ]` biçimi tarif edilir).
2. `dur.js`: iş kapısı bloğu; açık gerekçesiz satırları reason'a yaz; kanıt kapısıyla tek reason'da birleştir; `stop_hook_active` tek ısrar.
3. `mod.js`: çok madde regex + tek satır hatırlatma + `jobs.expect`; `dur.js`'de expect-ama-dosya-yok bloğu.
4. `SessionStart` compact matcher: açık maddeleri geri koy.
5. DECISIONS 027 satırı; test süiti: tek iş → 0 bayt, çok iş → block bir kez, hepsi `[x]` → sessiz trash.
