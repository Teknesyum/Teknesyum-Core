# Danışma 032 girdi: Teknesyum sisteminin hantal yönleri

Ajana giden metin:

---

[[danisma:032]]

# Teknesyum sisteminin hantal yönleri

Sen Teknesyum Core'un karar ortağısın. Cevabın Türkçe, en çok 900 kelime. Kod yazma; ölç ve
eleştir. Dosyaları kendin oku; tahmin ettiğin her sayıyı "tahmin" diye işaretle, ölçtüğünü
komutuyla yaz.

## Kullanıcının sözleri

"bu tarz eleştiriyi tüm sistemimize yapması lazım fable ın çok hantal yönlerimiz var"

"Bu tarz" = danışma 031: her danışmada betik okumak, girdiyi iki kez yazmak gibi, her seferinde
aynı bedeli ödeyip karşılığında az şey alan alışkanlıklar. Okuman gerekirse:
`docs/danisma/030-fable-mc-tasarim.md`, `docs/danisma/031-fable-danisma-okumasi.md`.

## Kapsam

- Depo: `C:\Users\Administrator\Desktop\Projeler\Teknesyum-Core` (`core/hooks/hooks.json`,
  `core/hooks/*.js`, `core/scripts/*.js`, `core/strings.json`, `test/`, `docs/`).
- Her oturumda yüklenenler: `C:\Users\Administrator\.claude\CLAUDE.md`, `RULES.md`, `RTK.md`,
  projenin `AGENTS.md`'si, bellek dizini
  `C:\Users\Administrator\.claude\projects\C--Users-Administrator-Desktop-Projeler-Teknesyum-Core\memory\MEMORY.md`.
- İstenince okunan: `C:\Users\Administrator\.claude\teknesyum\yordam.md`.
- Makine durumu: `C:\Users\Administrator\.claude\teknesyum\` (banner-*.json, advice-*.json
  birikimi), `~/.claude/plugins/cache/teknesyum/teknesyum-core/` (eski sürüm klasörleri).
- Çalışma alışkanlıkları: bu oturumun kaydı
  `C:\Users\Administrator\.claude\projects\C--Users-Administrator-Desktop-Projeler-Teknesyum-Core\e189bcf9-4db1-416f-a418-fcd5abaaa8ab.jsonl`
  (büyük; yalnız örnek al, tamamını okuma).

## Kurallar

- Maliyet altın kural: işaretsiz tur doğal maliyette kalmalı. Çağrılınca harcamak serbest,
  ama ana bağlama kalıntı en aza insin.
- Kullanıcıya görünen metin ekran kanalından (`lib.say`/`sayBlock` → `bant.js`) gider.
- Bir şeyi kaldırmayı önerirken kullanıcının bilerek istediği bir davranışı bozuyorsan söyle.

## Senden istenen

1. Hantallık listesi, bedeline göre sıralı. Her madde: ne, nerede (dosya), bedel (her tur mu,
   çağrılınca mı, disk/zaman mı; kaba sayı), karşılığında ne alınıyor, öneri, kazanç.
2. Hepsinden önce "her turda ödenen" bedeller: oturum başı yüklenen metinler, her tur çalışan
   kancalar, bunların bayt/token karşılığı.
3. Kaldırılmalı / sadeleştirilmeli / aynen kalmalı diye üçe ayır.
4. İlk üç işi uygulama sırasıyla ver.
