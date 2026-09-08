# K-Dense-AI/scientific-agent-skills

- lisans: MIT
- kurulum biçimi: plugin (Agent Plugins 1.0.0 manifesti, `plugin.json` + `skills/` ağacı)
- mekanizma: kanca yok, komut yok, alt ajan yok, MCP yok. Tek şey: 163 adet `skills/<ad>/SKILL.md`
  (Agent Skills spesifikasyonuna uygun, `references/`, `scripts/`, `assets/` alt klasörleriyle
  istenince yüklenen içerik). `scan_skills.py` depo-içi bir kalite/format denetleyicisi, çalışma
  zamanı mekanizması değil.
- sıradan turda bağlama: 163 skill'in ham `name:`+`description:` frontmatter alanları toplam
  ~70 KB metin (`find skills -iname SKILL.md` üstünde awk ile çekildi) ≈ ~17.500 token — hepsi
  eklenti kurulunca her turda yükleniyor, çünkü Claude Code her skill'in tetikleyici
  description'ını her zaman bağlama koyuyor. CLAUDE.md sadece AGENTS.md'ye yönlendiren 1 satır,
  kanca stdout'u yok.
- premium: yok. README/AGENTS.md'de ücretli katman, API key zorunluluğu veya dashboard yönlendirmesi
  geçmiyor; bazı tekil skill'ler (adaptyv gibi) kendi dış servisinin API key'ini env var olarak
  istiyor ama bu K-Dense'in değil o servisin ücretlendirmesi.

## Ne yapar
Biyoloji, kimya, tıp ve araştırma iş akışları için 163 dar kapsamlı Agent Skill barındırıyor
(biopython, aeon, cobrapy, clinical-decision-support, analytical-method-validation gibi). Her
skill tek bir paket/veritabanı/platforma odaklı; AGENTS.md açıkça "genel amaçlı orkestratör
skill kabul etmiyoruz" diyor. Kurulum sadece dosya kopyalamak.

## Kullanıcıya nasıl hissettirir
Tamamen sessiz altyapı — banner, statusline veya kanca dokunuşu yok. Kullanıcı bir bilim/araştırma
terimi geçtiğinde ilgili skill'in description'ı eşleşip devreye giriyor, çıktı normal model
cevabına karışıyor.

## Core'a alınacak
- fikir: AGENTS.md'deki kapsam disiplini ("dar skill, orkestratör yok, ikinci sağlayıcı yok")
  Core'un kendi eklenti/kitap kabul kriterine referans olabilir.
- Skill içeriklerinin kendisi (biyoinformatik, kimya) Core'un konusu değil — alınacak kod/kanca yok.
- Ölçüm burada asıl ders: 163 skill'i tek eklenti olarak kurmak sıradan turda ~17,5K token sabit
  yük getiriyor — bu, Core'un "sıradan turda bağlama sıfır token" ilkesine ters bir örnek olarak
  kütüphanede referans tutulabilir (ne yapılmaması gerektiğinin kanıtı).

## Ölçülecek
Core'a alınmayacağı için ölçüm planı yok.

## Karar
hayır — bilim-alanına özel 163 skill'lik bir içerik kütüphanesi, Core'un genel geliştirme
mekanizmasıyla örtüşmüyor; tek değer disiplin örneği ve "büyük skill seti = büyük sabit bağlam
maliyeti" uyarısı, ikisi de not düzeyinde yeterli.
