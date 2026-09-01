# Semgrep ve CodeQL

> Kanıt seviyesi: kod

Semgrep kaynak kodu ve resmî dokümanlar, CodeQL lisansı ve dokümanları okundu. Bu iki
araç makinede kurulmadı/çalıştırılmadı; buna karşılık **mekanizmalarının git karşılığı**
Teknesyum-Core deposunda çalıştırılarak doğrulandı (aşağıda işaretli).

## Kimlik

**Semgrep OSS** — Semgrep Inc. Lisans **LGPL-2.1**. Motor `semgrep-core` OCaml, CLI
Python (`>=3.10`). Kurulum `pip install semgrep` / `brew` / docker.
Gerçek ağırlık (PyPI, 1.176.0): `win_amd64` **55.4 MB**, `manylinux x86_64` **67.3 MB**,
`macos arm64` **47.6 MB**, sdist 0.5 MB. Native motor tekerleğin içinde gömülü
(**çıkarım**, boyut farkından).

**CodeQL** — GitHub. CLI **kapalı kaynak ve kısıtlı lisanslı**; sorgu kütüphaneleri
(`github/codeql`) ayrıca MIT. `codeql-cli-binaries/LICENSE.md`'nin izin verdiği:
akademik araştırma, "Open Source Codebase" analizi, OSI lisanslı sorguların testi.
Yasakladığı, birebir: *"generate CodeQL databases … in connection with any codebase that
is not an Open Source Codebase (e.g., code in a private repo in GitHub)"* ve açık kaynak
olmayan projelerde "automated analysis, CI or CD". Tek muafiyet ücretli **GitHub Advanced
Security** lisansı.

Boyut (gh API, v2.26.4): `codeql-win64.zip` **402 MB**, linux64 **552 MB**, osx64
**1074 MB**, hepsi bir arada `codeql.zip` **1694 MB** (v2.26.4, gh API ile ölçüldü). Veritabanı derleme süresi için
resmî rakam bulunamadı (**tahmin**: dile ve depoya göre dakikalar).

## Çözdüğü dert

İkisi de aynı şeyi farklı yoldan yapıyor: **kodu sorgulanabilir bir veri yapısına
çevirip, kuralı o yapının üstünde yazmak.** Kural koda gömülü değil, veriye karşı
çalışan bir sorgu. Core'un `risk.js`'i bunun tersi: kurallar (`HIGH_PATHS`, `DIFF_LIMIT`,
`FILE_LIMIT`) doğrudan JavaScript sabitine gömülü.

## Veri akışı

**Semgrep** — kaynağı kendi parser'larıyla AST'ye çevirir; kural da aynı dilin
sözdiziminde bir pattern olarak parse edilip AST üzerinde eşlenir (metavariable `$X`,
ellipsis `...`). Kural YAML:

```yaml
rules:
  - id: md5-usage
    languages: [python]
    message: Found md5 usage
    pattern: hashlib.md5(...)
    severity: HIGH
```

Taint (veri akışı) modu:

```yaml
mode: taint
pattern-sources:
  - pattern: get_user_input(...)
pattern-sinks:
  - pattern: html_output(...)
```

OSS sürümde taint yalnız dosya içi; prosedürler arası (`--pro-intrafile`) ve dosyalar
arası (`--pro`, `interfile: true`) **ücretli** motorda.

**CodeQL** — kaynaktan bir veritabanı çıkarılır: *"a full, hierarchical representation of
the code, including … the abstract syntax tree, the data flow graph, and the control flow
graph"*. Derlenen dillerde extractor derleyici çağrılarını izler. Sonra QL (Datalog
benzeri) sorguları koşulur:

```ql
import java

from Constructor fileReader, Call call
where
  fileReader.getDeclaringType().hasQualifiedName("java.io", "FileReader") and
  call.getCallee() = fileReader
select call.getArgument(0)
```

### Diff'e dokunan kurallar — raporun asıl konusu

**Semgrep `--baseline-commit`.** Doküman tanımı birebir: *"Only show results that are not
found in this commit hash. Aborts run if not currently in a git directory, there are
unstaged changes, or given baseline hash doesn't exist."*

Kaynaktan (`cli/src/semgrep/git.py`, `run_scan.py`) gerçek mekanizma — evet iki tarama,
ama ikincisi agresif daraltılmış:

1. `BaselineHandler._get_git_status()` →
   `git diff --name-status --no-ext-diff --diff-filter=ACDMRTUXB` (`--merge-base` bayrağı
   varsa onunla) ile değişen dosyaları **A/M/D/R sınıflarına ayırır**.
2. Head taraması yalnızca bu dosyalara kısıtlanır.
3. Baseline taraması tüm depoya değil, **yalnız head'de bulgu çıkan dosyalara** koşulur:
   `baseline_targets = set(paths_with_matches)`; rename'lerin eski yolları eklenir
   (`status.renamed.values()`), baseline'da olmayan yeni dosyalar çıkarılır
   (`baseline_targets -= status.added`). Head'de bulgu yoksa ikinci tarama **hiç
   yapılmaz**.
4. Baseline commit'e `git worktree add` ile geçici çalışma ağacı açılır, tarama orada
   koşar, worktree silinir. Çalışma dizini bozulmaz.
5. `remove_matches_in_baseline()` bulguları `ci_unique_key` ile eşleştirip ortakları düşer.

Diff-aware tarama dosyalar arası analizi desteklemez.

**CodeQL diff-informed.** Mimari olarak farklı: iki tarama yok, **diff aralığı kuralın
içine veri olarak enjekte ediliyor**. CI, aralıkları bir QL extension pack'e yazar:

```yaml
extensions:
  - addsTo:
      pack: codeql/util
      extensible: restrictAlertsTo
      checkPresence: false
    data:
      - ["/path/to/repo/src/utils.ts", 16, 17]
      - ["/path/to/repo/src/utils.ts", 27, 27]
```

```shell
codeql database run-queries --additional-packs=PATH_TO_EXTENSION_PACK \
  --extension-packs=my-ci/pr-diff-range PATH_TO_DATABASE QUERIES
codeql database interpret-results --sarif-run-property=incrementalMode=diff-informed PATH_TO_DATABASE
```

`restrictAlertsTo` tablosu sorgunun içine girdiği için dataflow araması budanır — hem
hızlanır hem sonuç azalır. Kenar durumlar açıkça tanımlı: ikili/çok büyük diff için
`{path, 0, 0}` sentinel'i **tüm dosyayı** kapsar; hiç değişiklik yoksa `["", 0, 0]`
girdisi **tüm uyarıları keser**. SARIF sonrası filtre kuralı da yazılı:

```
range.startLine <= location.endLine AND location.startLine <= range.endLine
```

Gereksinim: CLI ≥ 2.21.0 (overlay için ≥ 2.23.8, Git ≥ 2.38). `--overlay-base` /
`--overlay-changes` ikinci eksen: default branch'in önbelleğe alınmış veritabanı üstüne
yalnız değişen dosyaların katmanı bindirilir; dosya kimlikleri
`git ls-files --recurse-submodules --format='%(objectname)_%(path)'` ile kaydedilir.

## Bağlam maliyeti

Doğrudan: **sıfır** — ikisi de dışarıdan çağrılan ikili, çıktıları betiğe düşer.
EKOSISTEM.md'nin A sınıfı ("çağrıldığında yazar").

Dolaylı ve gerçek olan maliyet **kurulum ve süre**: Semgrep 47-67 MB tekerlek + Python
runtime; CodeQL 400 MB - 1.7 GB indirme + veritabanı derleme. Core bugün `install.ps1` /
`install.sh` ile tek klasör kopyalayıp bitiyor, bağımlılık sıfır. Her ikisi de bu
karakteri bozar.

İkinci dolaylı maliyet: bulgular modele gösterilirse SARIF/JSON çıktısı büyüktür ve
filtresizdir. Diff'e kısıtlama tam da bunu kesen şey.

## Core'daki karşılık

- `core/scripts/risk.js` — `gitNumstat()` bugün `git diff --numstat HEAD` çağırıyor:
  **satır sayısı var, satır aralığı yok**, dosya durumu (A/M/D/R) yok, taban `HEAD`
  (merge-base değil). Semgrep'in `--name-status --merge-base` çifti buraya birebir oturur.
- `HIGH_PATHS` — Semgrep'in kural YAML'ının kapalı, gömülü hali. Yedi regex, JS sabiti.
  Kuralı veriye çıkarma fikrinin (`tiers.json` gibi bir `risk.json`) doğal adresi.
- `core/scripts/contract.js` — `check()` ve `complete()`, `risk.resolve()`'un `reasons`
  dizisini yazdırıyor. Severity sayısal ekseni (SARIF `security-severity` 0.0-10.0)
  bugünkü ikili `low|high`'ın yerine geçebilecek yapı.
- `core/scripts/map.js` — `who()` ters bağımlılık veriyor. CodeQL'in etki-yarıçapı
  sorgusunun ucuz karşılığı zaten Core'da var; risk hesabına bağlı değil.
- `core/hooks/seal.js` — `ownsDigest` + `headSha`. CodeQL'in overlay dosya kimliği
  (`git ls-files --recurse-submodules --format='%(objectname)_%(path)'`) aynı işi yapan resmî desen.

## Çalınabilir fikir

1. **`--name-status` sınıflarını riske katmak.** `git diff --name-status --diff-filter=ACDMRT`
   — **bu depoda çalıştırıldı**, `D` (silme) ve `M` (değiştirme) ayrımını temiz veriyor.
   Silme ve rename, ekleme+değiştirmeden farklı risk taşır; `risk.js` bugün ikisini de
   ham satır sayısına eziyor.
   *Altın kuralı ihlal eder mi — hayır.*

2. **Diff satır aralığı tablosu (`restrictAlertsTo`'nun git karşılığı).**
   `git diff --unified=0 <base> HEAD -- <file> | grep '^@@'` — **çalıştırıldı**, 7 hunk
   döndü ve hunk başlıkları **kapsayan fonksiyon adını da taşıyor**:
   `@@ -44 +44 @@ function fit(parts, cap)`, `@@ -222,0 +223,5 @@ function group(list)`.
   Yani `{dosya, başlangıç, bitiş, fonksiyon}` tablosu git'ten bedava çıkıyor. Bir kural
   ancak bu aralıklarla kesişirse tetiklensin; kesişim testinin formülü hazır:
   `range.startLine <= loc.endLine && loc.startLine <= range.endLine`.
   *Altın kuralı ihlal eder mi — hayır.*

3. **İki sentinel.** `{path, 0, 0}` = tüm dosya riskli (ikili dosya, çok büyük diff);
   `["", 0, 0]` = hiçbir şey değişmedi, tüm uyarıları kes. `risk.js`'in bugün
   `stat === null` durumunda "diff okunamadı" demesi bu sentinellerin ilkinin yarısı;
   ikisi birlikte davranışı tam tanımlar.
   *Altın kuralı ihlal eder mi — hayır.*

4. **Kirli çalışma ağacında iptal.** Semgrep unstaged değişiklik varsa taramayı
   **durduruyor** — çünkü baseline karşılaştırması yalan söyler. Core'un `seal.js`
   digest'i için aynı gerekçe geçerli; `complete()` bunu bugün kontrol etmiyor.
   *Altın kuralı ihlal eder mi — hayır.*

5. **`git worktree` ile temiz baseline okuma.** "Öncesi neydi" sorusuna kullanıcının
   çalışma ağacını kirletmeden cevap. SKILL.md zaten eşzamanlı yazıcılar için worktree
   öneriyor; aynı araç risk hesabında da kullanılabilir.
   *Altın kuralı ihlal eder mi — hayır.*

6. **Pahalı ikinci geçişi hedefe daraltmak.** Semgrep baseline'ı tüm depoda değil,
   yalnız bulgu çıkan dosyalarda koşuyor; bulgu yoksa hiç koşmuyor. Core'un `orphans()`
   fonksiyonu bugün `owns`'taki **her** dosya için `git grep` çalıştırıyor — aynı
   daraltma buraya uygulanabilir.
   *Altın kuralı ihlal eder mi — hayır.*

7. **Kuralı koddan veriye çıkarmak.** `HIGH_PATHS` yedi regex'i `tiers.json` gibi bir
   veri dosyasına taşınsın; her kurala sayısal ağırlık verilsin (SARIF'in
   `security-severity` 0.0-10.0 ekseni), toplam bir eşiği geçince `high`. Bugünkü
   "herhangi bir sebep varsa high" davranışı sıfır granülerlikte.
   *Altın kuralı ihlal eder mi — hayır* (veri dosyası diskte, model okumaz).

8. **`partialFingerprints` / `ci_unique_key`.** Bir bulguyu commit'ler arası aynı
   kimlikle izleme. Core'un `_issues.log`'u bugün serbest metin; parmak izi verilirse
   "bu sorun tekrar etti" ölçülebilir hale gelir.
   *Altın kuralı ihlal eder mi — hayır.*

9. **Opsiyonel dedektör deseni.** `semgrep --version` varsa
   `semgrep scan --sarif --baseline-commit=<merge-base>` çağır, SARIF'i skora kat; yoksa
   kendi sezgisiyle devam et. Sıfır bağımlılık korunur, güçlü kullanıcı kazanır.
   *Altın kuralı ihlal eder mi — hayır* (kurulu değilse hiç çalışmaz; kuruluysa bile
   çıktı betikte kalır).

## Ret adayı gerekçe

- **CodeQL lisansı kapıyı kapatıyor.** Kullanıcıların çoğu özel depoda çalışır; GHAS
  lisansı olmadan veritabanı üretmek lisans metninin açıkça yasakladığı şey. Bir
  eklentinin kullanıcıyı lisans ihlaline sokması kabul edilemez. Mekanizma alınabilir,
  araç alınamaz.
- **Ağırlık.** 47-67 MB (Semgrep) ve 400 MB-1.7 GB (CodeQL) karşısında Core'un tamamı
  ~3600 satır JavaScript. Oran ciddi değil.
- **Semgrep'in gücü ücretli tarafta.** OSS taint yalnız dosya içi; Core'un ilgilendiği
  "bu değişiklik neyi kırar" sorusu tanımı gereği dosyalar arası. Ücretsiz kısım
  sorunun yarısını bile çözmüyor.
- **Severity dünyası ikiye bölünmüş.** Semgrep hem `CRITICAL|HIGH|MEDIUM|LOW|INFO`
  (1.72.0+) hem eski `ERROR|WARNING|EXPERIMENT|INVENTORY` üretiyor, `--severity` bayrağı
  hâlâ eski üçlüyü alıyor. Skor tablosu yazan ikisini de eşlemek zorunda — dış şemaya
  bağlanmanın bedeli.
- **Core'un risk sorusu güvenlik sorusu değil.** Semgrep/CodeQL "bu kod açık mı" diye
  sorar; `risk.js` "bu değişikliği denetimsiz kapatabilir miyim" diye sorar. İkisi aynı
  motoru paylaşmak zorunda değil; kural motorunu almak, cevaplamadığı bir soruya
  altyapı kurmak olabilir.
- **Süre.** Veritabanı derleme dakikalar sürüyor. `contract.js check` bugün milisaniye
  ölçeğinde bir kapı; kapıyı dakikalara çıkarmak kapının kullanılmamasına yol açar.

## README cümlesi

You do not need to install these: CodeQL's licence forbids the private repositories most
of this runs in, Semgrep's cross-file analysis is behind its paid engine, and the one idea
that pays -- restricting rules to the line ranges the diff actually touched -- is a
four-line git command Core can run itself.
