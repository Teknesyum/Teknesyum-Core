# Yol Haritası

Kullanıcının istediği, henüz bitmemiş işler. Buraya yalnız **kullanıcının söylediği**
şeyler yazılır; ben kendi fikrimi buraya eklemem. Bir madde bitince silinmez,
`[x]` işaretlenir ve bitiş sürümü yazılır. Compact bu dosyayı unutturamaz.

Kural: her tur başında bu dosya okunur, sıradaki madde alınır, biter, onay istenir.
Aynı anda tek madde açık kalır.

## Değişmez ilkeler

- **Altın kural: maliyet.** Mümkünse 0. Sıradan bir turda hiçbir kanca modelin
  bağlamına token yazmaz. Bir özellik bunu bozuyorsa özellik değildir.
- **Fable karar ortağıdır**, sadece denetçi değil. Plan kurulurken —
  seçim yapılmadan önce — görüşü alınır. Önemli işte onay makamı da olabilir;
  ama birincil rolü karar ve plan.
- Bu disiplin diğer projelerde de aynı: kullanıcının istekleri bir yol haritası
  dosyasına yazılır, maliyeti minimum tutulur, unutulmaz.

## Açık maddeler

Yok.

## Bitenler

- [x] **6. Ekosistem raporu.** (`docs/EKOSISTEM.md`) Maliyet dört sınıfa ayrıldı;
      Core tamamen Z (sıfır). Karar: hiçbir şey kurulmuyor. Obsidian, kalıcı bellek
      MCP'leri, RAG ve GitHub-MCP kurma; graphify ve LSP koşullu; Windows-MCP
      varsayılan kapalı olsun. Gerçek boşluk iki tane: kod tabanı anlama (graphify
      kapatıyor) ve oturumlar arası hafıza (yerleşik hafıza + yol haritası kapatıyor).
      Altın kuralı sessizce bozmanın beş yolu ve her birinin ölçüsü yazıldı.
      Fable'a danışıldı; hükümler onun.
- [x] **7. Graphify durumu.** (`docs/GRAPHIFY.md`) Core'da değil, hiç olmadı.
      `~/.claude/skills/graphify` (v0.9.39) olarak kullanıcı seviyesinde kurulu, o
      yüzden her oturumda görünür. Base'in "kısmen eklendi" dediği şey grafik değil
      import haritasıydı; o parça `core/scripts/map.js` olarak Core'da. Ayrı kalır:
      Core Node ve sıfır bağımlılık, graphify Python ve çağrı başına maliyet.
- [x] **11. Açık günlüklerin hepsi.** (v0.7.3) On üç kayıt okundu, gerekçesiyle
      kapatıldı: coreRepo makarası (setup + log.js sesi + doctor `logs` satırı),
      verify zaman aşımının süreç ağacı (`killTree`), Stop kapısının soru şartının
      kaldırılması, trash ölçüsü (`orphans`), plan konseyinin tetiği, denetçinin
      eklenen sahte assertion kontrolü, paralel yazarların git indeksi, rozet
      kontrastı, imza bloğu. Biri Core kaydı değildi (Avalonia konağı), o da
      gerekçesiyle kapandı.
- [x] **1/3/4. Sole raporu ve banner araştırması.** Rapor geldi, 12 hatanın hepsi
      işlendi (madde 9). Ölçülen: `###` başlık render **edilmiyor**, markdown ve
      HTML de çalışmıyor; **ANSI çalışıyor** — renk, kalın, ters video, yani
      "beyaz dolgu üstüne kırmızı yazı" `ESC[31;47m` ile mümkün. Bağlama yazmayan
      diğer kanallar: statusline, Notification kancası, `terminalSequence` (yalnız
      OSC). Ücretsiz **olmayanlar**: `additionalContext`, SessionStart/
      UserPromptSubmit stdout, kanca stderr/exit 2. Detay maliyeti artırmadan
      artıyor, çünkü hepsi zaten diskteki kayıtlardan okunuyor — madde 10.
- [x] **10. Banner yeniden tasarımı.** (04a881a) İki satır: üstte kim oturuyor
      — `2× Haiku-Low İzci · SZL12 R2 · 5 dk sessiz` —, altında dallarda ne
      yapıyor: `└ rozet metni duzeni · adım 12 · son: statusline.js`. Fiil dolgusu
      (`Atandı`, `Yapılıyor`) ve `###` öneki gitti. Renk 256 renkli: mark camgöbeği,
      koltuk mor, uyarı macenta; değerler boyasız kaldığı için kimlik, dosya adı ve
      sözleşme başlığı olduğu gibi okunuyor. `NO_COLOR` hepsini siliyor. En çok üç
      satır, her satır 120 karakter. Fable'ın kararı olduğu gibi uygulandı;
      `steps` oranlanmadı (birimler farklı, yalan söylerdi).
- [x] **9. Sole'nin bulduğu 12 hata.** (04a881a, f2234f8, 2314093) Hepsi kapandı:
      notify.js üç düzeltme · schema.js CRLF · log.js slug · banner bütçesi artık
      görünür uzunluktan hesaplanıyor · merge() kilit alıyor (ölçüldü: kilitsiz 12
      artıştan 2-9'u kayboluyordu, kilitli 12/12) · write() rename'i tekrar deniyor
      ve sonucu döndürüyor · biten alt ajanı geç olay diriltmiyor · dropSnapshot,
      `stash create`, `git diff` ve release.js'in git hataları artık sessiz düşmüyor.
      Şüphelilerden `_stale.json` çift kaydı gerçekti, kilide alındı; ledger
      appendFileSync tek satırlık O_APPEND yazımı, hata değil.
- [x] **8. Fable'ın üç kapısı.** watch.js Stop kapısı (submitted teslim + soruyla
      biten tur), guard.js Bash kapısı (git merge/push), SKILL.md ve auditor.md
      satırları. `TEKNESYUM_GATE_OPEN=1` kaçış yolu duruyor.
- [x] **5. Altın kural denetimi.** İhlal yok. Bağlama yazan tek yüzey `cue.js`;
      o da yalnız "log yaz" cümlesinde ve açık sözleşmeli oturum açılışında
      konuşuyor. Kancaların hepsi ~30 ms, çıktıları boş.
- [x] **3c/4c. Dil düğmesi ve karar notu.** (2c6d244) `assets/badge-lang.svg` +
      `.tr.svg` iki yarımlı EN|TR düğmesi; `scaffold.js langlink` yazıyor.
      YONTEM günlüğü `docs/DECISIONS.md` D16 oldu, günlük arşive alındı.
- [x] **a. Trash disiplini.** (2c6d244) `contract.js complete` kapanışta ağacın
      artık adını anmadığı sahipli dosyaları listeliyor, `trash/` gösteriyor.
- [x] **2. openlogs denetimi.** (3dcfbf3) setup `coreRepo`yu yazıyor, günlük nereye
      düştüğünü söylüyor, `log close/archive` öneki ne olursa olsun buluyor.
      Guard günlüğü kapandı. Şüpheliler kullanıcıya soruldu.
