# SnailSploit/Claude-Red

- MIT · metin paketi (78 SKILL.md, `install.sh` ile kopyalanır) · ★3048
- mekanizma: 78 skill, 23 kategori, kanca 0, komut 0, ajan 0, MCP 0; `claude-skills.json` kataloğu 59.211 B, `convert_skills.py` biçim dönüştürücü
- sıradan turda bağlama: hepsi kurulursa 78 açıklama 42.800 B ≈ 11k token. `install.sh --category web` ile tek kategori kurulabildiği için pay seçimle düşer.
- premium: yok

## Ne yapar
Saldırgan güvenlik yöntemlerini (SQL enjeksiyonu, EDR atlatma, ADCS suistimali) alan alan SKILL.md dosyalarına yazan kütüphane. Konusu Core'un işi değil; ilgi çekici olan paketleme biçimi.

## Core'a alınacak
- betik: `install.sh` — kategori seçimli, `--dry-run` ve `--list` destekli kopyalayıcı; Core'un `kutuphane.js fetch` komutuna seçici kurulum ve kuru koşum kalıbı.
- fikir: `claude-skills.json` — 78 parçanın tek makine okunur kataloğu; raf listesini modele okutmadan araca okutma yolu.

## Karar
Hayır — alanı Core'la ilgisiz; yalnız seçici kurulum ve katalog dosyası kalıbı not edilir.
