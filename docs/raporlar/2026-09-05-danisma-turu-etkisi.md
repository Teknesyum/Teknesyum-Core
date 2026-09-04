# Danışma Turlarının Etkisi

`docs/danisma/` altındaki 8 dosyanın (001-008, ikisi 008'in soru/cevap çifti) her biri için
Fable'ın önerisi, T0'ın sonraki somut adımı ve bu adımın öneriyle örtüşüp örtüşmediği; kanıt
git commit'lerinden ve depo dosyalarından.

## Tablo

| Dosya | Sorulan | Fable'ın önerisi | T0'ın sonraki adımı | Karar |
|---|---|---|---|---|
| 001-ucuz-once-tier.md | sonnet/high builder kalıcı mı; sessiz-yanlış riski nasıl kapanır | fan-in + plancı damgası ekle; A/B deneyi (tek/çift sözleşme id, geri dönme eşikleri) kur | Fan-in ve `raise/why` sinyalleri kuruldu (commit `4e88510`, `7397382`); A/B deneyinin tasarımı `docs/YOL-HARITASI.md`'ye yazıldı ama tek/çift alternatifli ölçüm hiç çalıştırılmadı, `core/tiers.json`'da `sonnet/high` hâlâ kalıcı, geri dönmedi | kısmen |
| 002-denetci-ve-iki-basamak.md | denetçi tetiği + fan-in/damga itirazı | (c) önce ölç, (a) defter sütunu olarak; `raise` mührü seal'de donsun; fan-in bayatsa `unknown` yaz, yükseltme; haiku okuru (b) şimdi kurma | Hepsi birebir: ledger'a `model, requestedModel, signals, fanIn, raise` eklendi, `raiseSeal()` ile raise open anında mühürlendi, `fanIn: reach.read===false ? 'unknown'` eklendi, `acceptanceMiss` ledger sütunu eklendi (commit `61b91c8`); haiku okuru kurulmadı | değiştirdi |
| 003-kapinin-bash-koru-noktasi.md | Bash kör noktası: A (tavan tüm araçlara), B (sızıntı dedektörü), C (iç içe depo koruması) | A hemen kur; B'yi bölüp yalnız iç içe depo kısmını (C) önce, log-only `owns` kolu sonra kur; mtime karşılaştırmasıyla ucuz önleme dene | `exhausted()` artık `Bash` çağrısından önce de çalışıyor (A); `spilled()` nested-repo tespiti eklendi ve doğrudan bloklayıcı (commit `60b7010`) — ama mtime karşılaştırması değil `git status --porcelain`, ve B'nin log-only `owns` ara adımı hiç kurulmadı | değiştirdi (yöntemde sapma var, ayrıştırma bölümüne bak) |
| 004-prompt-zenginlestirme.md (4 tur) | prompt zenginleştirmeyi kim/nasıl yapsın: kanca mı, ayrı rol mü, T0'ın kendisi mi | 1. tur: D + dar B (kanca kurma); 2. tur: kullanıcının "advisor promptu yeniden yazsın" fikri reddedilsin, `clarifier` adında ayrı rol (ucuz model) önerilir; 3. tur: `??` bir talimat olsun, kanca değil; 4. tur: `clarifier` fable modeliyle, `## Soru/## Olgu/## Yol` çıktısıyla kurulsun | `clarifier` rolü fable modeliyle, `## Soru/## Olgu/## Yol` başlıklarıyla, kanca değil `CLAUDE.md` talimatı olarak kuruldu (commit `27ec216`, 0.12.0); 2. turun reddi de uygulandı — advisor'ın kendisi hiç yeniden yazmadı | değiştirdi |
| 005-clarifier-gerekli-mi.md | ayrı `clarifier` rolü depo bedeline değer mi | dosya kalksın, iş `advisor`'a iki dönüş kalıbıyla katlansın; işaret tek kapı kalsın, T0'a inisiyatif verilmesin | `clarifier.md` `trash/`'e taşındı, iş `advisor.md`'ye iki dönüş kalıbı olarak katlandı, savlar sekizden ikiye indi (commit `3dc4d76`, 0.13.0) | değiştirdi |
| 006-tasinabilir-proje-kapsami.md | kardeş proje klasörüne erişim herkese açık eklentide nasıl genelleştirilir | A'yı kur ama yalnız açık `--projectsRoot` bayrağıyla, varsayılan otomatik yazılmasın, `.bak` + günlük | `setup.js --projectsRoot <klasör>` yalnız bayrak verilince, ev dizini/kök/`~/.claude` reddedilerek, `.bak` alıp yazacak şekilde kuruldu (commit `4a2714b`, 0.14.0) | değiştirdi |
| 007-kuresel-mi-projeye-ozel-mi.md | küresel `additionalDirectories` mı, projeye özel mi | küresel satırı kaldır; eklenti yalnız projeye özel yolu sunsun, küresel bayrak ekleme | `~/.claude/settings.json`'daki küresel `additionalDirectories` silindi, yedeği `settings.json.bak-kuresel-kapsam`; `docs/devir/2026-09-05-laptopa-devir.md` bunu satır satır kaydediyor | değiştirdi |
| 008-uzun-komut-ilerlemesi(-girdi).md | uzun Bash komutunun ilerlemesi ücretsiz gösterilebilir mi | önce sıfır-kod terminal yolu; kanca çözümü yalnız statusline'ın komut sürerken yenilendiği ölçülürse denensin | Ölçüm yapıldı: 45 sn'lik komutta statusline 0 kez tetiklendi (commit `9e35a0d`); bu, Fable'ın kendi koşuluna göre kanca yolunu ölü doğurdu, kullanıcı "Claude Code dışıysa gerek yok" dedi, kod yazılmadı (commit `aba3ad6`) | değiştirdi |

## Sayı

**6 / 8 tur tam değiştirdi, 1 kısmen, 1 değiştirdi-ama-yöntemde-sapma → dar sayımla 6/8 (%75), geniş sayımla (kısmi + sapmalı dahil) 8/8 (%100) bir sonraki adımı etkiledi.**

Sıfır tur "değiştirmedi" oldu — sekiz danışmanın hiçbirinde T0 öneriyi görüp hiçbir şey
yapmadan geçmedi. Bu, `docs/danisma/` kaydının seçilmiş (yalnız işe yarayanlar tutulmuş)
olabileceği ihtimalini dışlamıyor; ölçüm yalnız var olan 8 dosyayı kapsıyor.

## Ayrıştırma (öneri tam uygulanmadı)

**001 — A/B deney protokolü kurulmadı.** Fable, "tek/çift sözleşme id'sine göre alternatifli,
15+15 örnek, üç geri dönme eşiği" biçiminde somut bir deney istedi. `docs/YOL-HARITASI.md`
(satır ~156) bu tasarımı harfiyen kaydediyor ama hiçbir rapor dosyasında gerçek bir alternatifli
ölçüm sonucu yok; `core/tiers.json` içinde `sonnet/high` hâlâ premium builder hücresinde duruyor,
ne ölçülüp kalıcı kılındı ne geri alındı. Gerekçe depoda yazılı değil — muhtemelen VidShrink'te
yeterli yeni sözleşme hacmi birikmedi, ama bu bir varsayım, kanıt değil.

**003 — önlemenin biçimi Fable'ın önerdiğinden farklı kuruldu.** Fable'ın sıralaması: önce A,
sonra C'nin ucuz mtime-karşılaştırma şıkkı (bloklar), sonra B'nin `owns` kolu yalnız log
modunda (bloklamaz), 2-3 gün ölçüldükten sonra B'nin kapıya çevrilip çevrilmeyeceğine karar
verilsin. Kurulan (`60b7010`) A'yı uyguladı, ama iç içe depo koruması mtime değil doğrudan
`git status --porcelain` ile kuruldu ve baştan bloklayıcı — B'nin önerilen log-only ara adımı
hiç kurulmadı. Sonuç aynı yöne (A + iç içe depo koruması) gitti, ama Fable'ın istediği
"önce ölç, sonra blokla" sırası atlanıp doğrudan bloklamaya geçildi; gerekçe commit
mesajında yok.
