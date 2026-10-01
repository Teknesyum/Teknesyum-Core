# Danışma 035: Danışma: Araya Gelen Soruları Haiku'ya Devretmeyi Core'a Kuralım Mı

claude-fable-5-1, 3.888 çıktı token, 72 sn. Girdi: [035-fable-araya-haiku-girdi.md](035-fable-araya-haiku-girdi.md). Cevap olduğu gibi:

---

## Danışma 035 — Cevap

**1. Kurulmalı mı?** Evet, kur; yeni ölçüm yapma. Karar için n=2 yeter, çünkü belirleyici boyut tutarlı ve büyük: puan eşit (0,98–0,99 / 0,99–1,00), ana iş her kolda tam, cevap süresi 3–5 dk'dan 30–70 sn'ye iniyor. "Öneri" kolunu ölçmeye gerek yok — §13–16 zaten Opus'un gönüllü devretmediğini gösterdi; öneri kolu %0 devir çıkar, para boşa gider. Devri metin zorunlu kılacak. Denetim kolu kapanır: puan artmadı, para iki katı.

Tek düzeltilecek şey build'de: haiku kolunun 1,63 $'a çıkan ucu. Okuyucuya `effort: low`, araç listesi Read/Grep/Glob (Bash yok), "en fazla N dosya, kısa cevap" sınırı koy; ham kayıtta pahalı tekrarın nereden geldiğine bir bak (büyük ihtimal okuyucunun gezinmesi).

**2. Kurulum kararları**

- **Soru/iş ayrımı: kanca regex'i yapar, Opus yalnız veto eder.** Kaba kesim deterministik ve 0 token (maliyet kuralına uyar): soru işareti ya da "nedir/nerede/nasıl/hangi/var mı" ile başlayan istem → soru. "bu/şu/az önce/demin/neden/niye … yaptın" gibi konuşma bağlamına işaret eden kelimeler → Opus'ta kalır. `mod.queued` iki dala ayrılır: `mod.queued` (bugünkü metin) ve `mod.queued.soru` ("okuyucu ajanına arka planda ver, dönen cevabı 'okuyucu cevabı, denetlenmedi' etiketiyle aynen aktar, kendin cevaplama, işine dön"). Opus'a tek bir kaçış bırak: "soru elindeki işin bağlamını gerektiriyorsa devretme, sıraya al".
- **Haiku bekçisi:** teknik çelişki yok — `ust.js haiku()` yalnız `tool_input.model`'e bakıyor, `core/agents/okuyucu.md` frontmatter'ı geçiyor. Ruhuyla çelişkiyi de bu danışma çözüyor: sahibin "kur" demesi açık onaydır. Ayar ekleme; bekçiyi değiştirme. `okuyucu.md`'nin başına bir satır: "Bu ajan 035 kararıyla Haiku; bekçi (`ust.js haiku`) bu dosyayı kapsamaz."
- **Varsayılan: açık.** Yalnız araya istem gelince çalışır, normal turda sıfır; kapalı varsayılan özelliği hiç kullanmamak demek. Kapatma anahtarı istiyorsan `teknesyum.json`'a tek bayrak yeter, UI gerekmez.

**3. Gözden kaçan riskler**

- **Yanlış cevabın sessizce gitmesi:** Haiku'nun zayıf noktası (çok dosyalı çapraz eşleştirme) regex'le yakalanamaz. Çözüm denetim değil **etiket**: cevap "okuyucu (Haiku), denetlenmedi" damgasıyla gider, sahip kaynağı bilir; emin olamadığında "kendin bak" der. Okuyucu talimatına "bulamadıysan uydurma, 'bulamadım' de" satırı şart.
- **Bağlam sızıntısı:** okuyucuya yalnız soru metni + cwd gider, transcript gitmez — bu doğru. Ters yönü risk: sahibin "bu dosya", "az önceki hata" gibi göndermeleri okuyucuda karşılıksız kalır. Bunu regex'in bağlam-kelime listesi tutar; kaçanı da okuyucunun "gönderme çözülemiyor" cevabı Opus'a geri düşürür (o zaman Opus sıraya alır).
- **İki cevabın çakışması:** okuyucu sonucu Opus bir araç çağrısının ortasındayken düşer. Kural "aynen aktar, yeniden cevaplama" yetmez; ikinci risk **Stop kapısı**: `dur.js` sira/jobs sıradaki "Sıra:" satırını bitmemiş sayıp tekrar sorar. Devredilen soru `acik.md`'ye "Sıra:" değil "Devredildi:" olarak yazılmalı ve aktarıldığında `[x]` olmalı; yoksa her devirde kapı bir soru fazla sorar.
- **Üçüncü, küçük:** sahip arka arkaya iki soru sorarsa iki okuyucu paralel kalkar; her biri ayrı bedeldir ve sıralı aktarım karışır. Aynı anda tek okuyucu; ikinci soru ilkini beklesin.

**Karar özeti:** kur, zorunlu metin, kanca regex'i karar verir, Opus yalnız vetolar, varsayılan açık, bekçiye dokunma, cevap etiketli gider, `acik.md`'de ayrı satır türü. Ölçüm bitti; para kaçağını build'de kapat.
