# agenticnotetaking/arscontexta

- MIT · plugin (marketplace) · ★3486
- mekanizma: 2 kanca olayı / 3 komut (SessionStart: session-orient.sh; PostToolUse:Write:
  write-validate.sh + auto-commit.sh), 26 skill, 1 ajan, 249 iddia dosyası
- sıradan turda bağlama: 26 SKILL.md frontmatter'ı 12,99 KB (~3,2k token, `---` blokları
  toplandı). Kancalar sıradan turda susuyor; SessionStart betiği (5,5 KB) çalışma alanı ağacı,
  hedefler ve "CONDITION: N bekleyen gözlem" satırlarını basıyor. `methodology/` 3,7 MB pasif.
- premium: yok

## Ne yapar
Kullanıcıyla 2-4 soruluk bir konuşmadan sonra kişiye özel bir bilgi sistemi *üretiyor*:
klasör yapısı, not şablonları, işleme hattı, kancalar ve MOC gezinme haritaları. Şablon
kopyalamıyor, 249 araştırma iddiasından türetiyor.

## Core'a alınacak
- kitap (raf): `methodology/` — dosya başına tek iddia, başlığı iddianın kendisi
  ("LLM attention degrades as context fills"). Ajan belleği, bağlam bütçesi ve otomasyonun ne
  zaman emekli edileceği üzerine 249 parça; Core'un raf biçimine hazır, sıradan turda sıfır.
- fikir: dosya adı = iddia. Core raflarında başlıklar konu adı; iddia başlığı grep'le
  aranabilir kılıyor, gövde okunmadan karar verilebiliyor.
- fikir: SessionStart'ta "CONDITION: N bekleyen ..." tek satırı — Core'un eşik dilinin aynısı.

## Karar
fikir notu — `methodology` rafı cazip ama 3,7 MB ve üretim motoruna bağlı; 26 skill'in ~3,2k
token sabit yükü alınamaz, iddia dosyaları seçilerek kitaba dönüştürülebilir.
