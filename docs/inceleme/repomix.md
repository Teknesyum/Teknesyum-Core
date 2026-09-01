# Repomix

> Kanıt seviyesi: doküman (README + `package.json` okundu), depo verisi `gh api` ile alındı

## Kimlik

Depo `yamadashy/repomix`, dil TypeScript, lisans MIT, sürüm 1.18.0.
`package.json` içinde **28 doğrudan çalışma zamanı bağımlılığı** var —
`web-tree-sitter`, `@repomix/tree-sitter-wasms`, `@secretlint/core`,
`gpt-tokenizer`, `handlebars`, `globby`, `zod`, `@modelcontextprotocol/sdk`
dahil. Son commit 2026-08-30 (etkin bakımda).

Kurulum biçimi üç türlü: **CLI** (`npx repomix@latest` ya da `npm i -g repomix`),
**MCP sunucusu** (`repomix --mcp`), ve kütüphane olarak içeri alma.

## Çözdüğü dert

"Bütün depoyu tek bir dosyaya paketle de modele elimle yapıştırayım; kaç token
tuttuğunu da söylesin."

## Veri akışı

Dosya sisteminden okur (`globby` ile tarama, `.gitignore` ve `repomix.config.json`
desenlerine uyar) ya da `--remote user/repo` ile uzak depoyu klonlayıp okur.
Çıktıyı **tek bir dosyaya** yazar: varsayılan `repomix-output.xml`; `--style` ile
`xml` (varsayılan), `markdown`, `json`, `plain`.

Yol boyunca üç işlem yapar:

- **Token sayımı** — `--token-count-encoding` ile tokenizer seçilir, varsayılan
  `o200k_base`. `--token-count-tree` token dağılımını klasör ağacı olarak gösterir;
  `--token-budget` aşılırsa **komut hata verir** (kapı davranışı).
- **Sıkıştırma** — `--compress` tree-sitter ile fonksiyon ve sınıf imzalarını
  tutup gövdeleri üç noktaya indirir.
- **Güvenlik taraması** — Secretlint ile sızmış sır arar; `--no-security-check`
  ile kapatılır.

Güncelleme zamanı: **talep üzerine**. Kalıcı bir indeks tutmaz; her çalıştırmada
depoyu baştan tarar ve çıktı dosyasını yeniden yazar. `chokidar` bağımlılığı
izleme kipinin var olduğunu gösterir.

## Bağlam maliyeti

**CLI kipinde pasif yük sıfır** — Core'un sınıflandırmasında A sınıfı; yalnız
çalıştırıldığında iş yapar ve çıktısı diske gider, modelin bağlamına değil.

**MCP kipinde** dört araç görünür: `pack_codebase`, `pack_remote_repository`,
`grep_repomix_output`, `read_repomix_output` (README bunları sayıyor; dosya okuma
yardımcıları da olabilir). Araç başına şema büyüklüğü **tahmin 150–400 token**,
toplam pasif yük **tahmin 800–1800 token/oturum** — yani B sınıfı.

Çağrı başı yük yıkıcıdır ve asıl mesele budur: `read_repomix_output` bütün
depoyu tek parça olarak döndürür. Teknesyum-Core'un kendi `core/scripts` klasörü
tek başına ~117 KB kaynak; **tahmin ~30.000 token**. Orta boy bir depoda tek çağrı
yüz binlerce token demektir. `--compress` bunu düşürür ama sırayı değiştirmez.

## Core'daki karşılık

- Aynı işi yapan bir organ **yok** ve olmasına da gerek yok: Repomix'in varlık
  sebebi "model dosya okuyamıyor, ona her şeyi tek seferde ver" varsayımıdır.
  Claude Code'da Read/Grep/Glob zaten var; Core bu varsayımın tersi üstüne kurulu.
- `map.js` ilgili ama farklı: o **depoyu değil, deponun ilişkilerini** paketler —
  `map.md` insan için, `map.json` makine için, ikisi de diskte, ikisi de küçük.
  Repomix'in "tek dosyaya paketle" fikrinin ucuz akrabası zaten Core'da.
- Core'da **daha iyi**: çıktı bütçesi. `map.js` çıktısı deponun büyüklüğüyle değil
  ilişki sayısıyla büyür; Repomix çıktısı deponun tam boyudur.
- Core'da **hiç olmayan**: token sayımı. Core hiçbir yerde çıktısının kaç token
  ettiğini ölçmüyor — ne `map.md`, ne sözleşme dosyaları, ne handoff.

## Çalınabilir fikir

1. **`--token-budget` kapı deseni.** Bütçe aşılınca uyarı değil **hata** vermek.
   Core'un sözleşme kapısına doğal oturur: `contract.js complete` verify adımları
   arasında "üretilen belge X token'ı aşmasın" ölçüsü olabilir; `handoff.js` ve
   `map.js` çıktıları için de aynı eşik. Ölçüm için tokenizer gerekmez —
   `bytes/4` yaklaşımı bir eşik denetimi için yeterlidir.
   **Altın kuralı ihlal eder mi — hayır.** Ölçüm çalıştırma anında olur, sonuç
   ekrana/çıkış koduna gider. Aksine, kuralı **koruyan** bir mekanizmadır.

2. **`--token-count-tree`: maliyetin klasör ağacı olarak dağılımı.** "Hangi klasör
   bağlamın kaçını yiyor" sorusunun cevabı. Core'da bu, statusline'ın ve
   `MessageDisplay` bandının doğal yemidir: `map.js` zaten her dosyanın satır
   sayısını (`lines`) `map.json`'a yazıyor; klasör başına toplam ve pay eklemek
   birkaç satır. Ekrana gider, bağlama girmez.
   **Altın kuralı ihlal eder mi — hayır.**

3. **Sıkıştırma = gövdeyi at, imzayı tut.** `--compress`'in kuralı basit ve
   Core'un `map.js` çıktısına uygulanabilir: `## Edges` bölümünde her dosyanın tam
   kenar listesi yerine, eşiği aşan depolarda yalnız hub'lara giden kenarları tut.
   Aynı bilgi mimarisi, küçük dosya.
   **Altın kuralı ihlal eder mi — hayır.**

4. **Çıktı üretim hattında zorunlu sır taraması.** Secretlint'in yerini regex
   tutmaz ama deseni değerlidir: **paketleme adımının içine gömülü, kapatılması
   için açık bayrak (`--no-security-check`) gereken bir denetim.** Core'un
   `risk.js`'i hassas *yolları* biliyor ama hassas *içerik* aramıyor. Sözleşme
   kapatılırken diff içinde anahtar/token deseni aramak aynı desendir.
   **Altın kuralı ihlal eder mi — hayır.** Kapıda çalışır, sonuç ekrana gider.

5. **Tek dosya + sabit ad + yeniden yazma.** Repomix her çalıştırmada aynı ada
   yazar; sürüm tutmaz, birikme olmaz. `map.js` bunu zaten yapıyor; aynı disiplin
   `handoff.js` ve rapor üreten her betik için kural olabilir (RULES.md'deki
   "ölü dosya yok" maddesinin araç tarafı).
   **Altın kuralı ihlal eder mi — hayır.**

## Ret adayı gerekçe

Repomix'in çözdüğü dert Core'da **yok**. Tek dosyaya paketlemenin sebebi, dosya
sistemine erişemeyen bir sohbet penceresine kod taşımaktır; Claude Code'un
Read/Grep/Glob'u varken bu iş, bağlamı gereksiz yere doldurmaktan ibarettir.
MCP kipi ayrıca hem B sınıfı pasif şema vergisi hem de sınırsız `tool_result`
şişmesi getirir — `EKOSISTEM.md`'nin "sonuç şişmesi" maddesinin ders kitabı örneği.
Değerli olan token muhasebesi fikri ise 28 bağımlılık kurmadan alınabilir.

## README cümlesi

Repomix exists to carry a whole repository into a chat window that cannot read
files; Claude Code already reads files, and Core's job is to keep that reading
small, so packing the repo into one context blob solves a problem you do not have.
