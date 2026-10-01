# Danışma 035 girdi: Danışma: Araya Gelen Soruları Haiku'ya Devretmeyi Core'a Kuralım Mı

Ajana giden metin:

---

[[danisma:035]]

# Danışma: Araya Gelen Soruları Haiku'ya Devretmeyi Core'a Kuralım Mı

Sahibin cümlesi (aynen): "bunu kurmalı mıyız sence fable a da danış"

## Olgular

- Bench: `bench/rapor.md` §18 (betik `bench/araya.js`, ham `bench/araya-ham/`). Opus ana iş yaparken
  (test yaz, bağla, geçir) 20 sn arayla 4 kod sorusu akışa düşüyor. 3 kol × 2 tekrar + 1 duman.
  - kendi (Opus cevaplar): puan 0,99–1,00, 1,03–1,05 $, ilk cevap çoğu kez 3–5 dk sonra (ana işi bitirip cevaplıyor).
  - haiku (Opus, Haiku okuyucu ajana verir, bakmaz): 0,98–0,99, 1,03–1,63 $, kolay sorular 30–70 sn.
  - denetim (Haiku cevaplar, Opus denetler): 0,99–1,00, 1,63–2,00 $. Puan artmadı.
  - Her kolda ana iş tam puan. Haiku kollarında 4 sorunun 4'ü devredildi, ama devri sistem istemi zorunlu kıldı.
- §17: Haiku tek başına okuma/özet 0,92 (Sonnet 0,93, Opus 0,99), maliyet Opus'un üçte biri; zayıf yanı çok dosyalı çapraz eşleştirme.
- §13–16 şant (ana işteki büyük okumayı Sonnet'e verme) kapatıldı: Opus küçük işte reddetti, devredince pahalı çıktı.
- Core bugün: `core/hooks/mod.js` busy() → enqueue(): iş sürerken gelen istem `.claude/acik.md`'ye "Sıra:" satırı olur, banner basılır, modele `mod.queued` metni gider ("işi bölme, elindekini bitir…"). Stop kapısı (`dur.js` sira/jobs) bitmemiş sıradakileri bir kez sorar.
- Core'da model bekçisi var: `core/hooks/ust.js` haiku(): Agent çağrısında model haiku ise ve son istemde "haiku" geçmiyorsa reddeder. Eklentinin kendi ajan dosyasında `model: haiku` frontmatter'ı bu bekçiden geçer (tool_input.model boş).
- Kural: her turda maliyet ekleyen özellik önce sahibe fiyatlanır; yalnız çağrılınca maliyetliyse doğrudan yapılır.

## Olası kurulum

Eklentiye `core/agents/okuyucu.md` (model: haiku, araçlar Read/Grep/Glob/Bash) eklenir; `mod.queued` metni,
istem soru biçimindeyse (kod/depo sorusu) "okuyucu ajanına arka planda ver, cevabı aktar, denetleme, işine dön" der.
Konuşma bağlamı isteyen sorular ("neden X yaptın") Opus'ta kalır. Yalnız araya istem gelince devreye girer, normal turda 0 token.

## Soru

1. Bu kurulmalı mı? Kazanç hız (para eşit), denetim boşa. n=2 ve devri istem zorunlu kıldı — karar için yeter mi,
   yoksa önce "zorunlu değil, öneri" kolu mu ölçülmeli?
2. Kurulacaksa: soru/iş ayrımını kim yapsın (kanca regex'i mi, Opus mu)? Haiku bekçisiyle çelişki nasıl çözülsün
   (sahip açık onay verdi mi sayılır, ayar mı olsun)? Varsayılan açık mı kapalı mı?
3. Gözden kaçan risk var mı (yanlış cevabın sessizce gitmesi, bağlam sızıntısı, iki cevabın çakışması)?
Kısa ve kararlı cevap ver; Türkçe.
