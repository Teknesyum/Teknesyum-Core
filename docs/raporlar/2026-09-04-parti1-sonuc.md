# Parti 1: kapanış ve denetim bütünlüğü — uygulama sonucu

Tarih: 4 Eylül 2026. Önceki kapsamlı incelemenin G01–G11 düzeltme partisidir.

## Sonuç ve tamamlanma sınırı

İlk partinin kod değişiklikleri, izole regresyonları ve ilişkili akış belgeleri tamamlandı.
**Bütün plugin düzelmiş veya üretime hazır değildir.** Eski 12 karşı örneğin 7'si artık
üretilemiyor, 5'i sürüyor. Yedi karşı örneğin engellenmesi yedi bulgunun her yönüyle
kapandığını göstermez: özellikle aynı kullanıcı yetkisine karşı sahtecilik ve kabuk izolasyonu
çözülmüş değildir. Gerçek Claude host kabulü de yapılmadı.

Önceki inceleme tabanı `61b91c829e11ec0bd9b95f218c4583b0f6e54a7d`; son testin Git tabanı
`5f7cd4da5d5c840008ca370262381764756f514d` ve bunun üzerindeki commit edilmemiş çalışma ağacıdır.
Aradaki mevcut commitler ve işe başlarken bulunan contract.js değişiklikleri bu uygulamanın
kendi değişiklikleri diye sayılmadı. Commit, push ve kurulum yapılmadı.

Bu teslim, önceki raporun tarihsel bulgularını sessizce değiştirmez. Ayrıntılı yeni çıktılar,
eski karşı örnekler ve test edilen dosya hash'leri [kanıt dosyasında](2026-09-04-parti1-kanit.json).
İlk inceleme ve maliyet soruları [ana raporda](2026-09-04-core-tam-inceleme.md) korunuyor.

## Doğrulama

| Kontrol | Son koşu | Gerçekte kanıtladığı |
|---|---|---|
| İzole ana takım | 2.630 assertion geçti, 0 başarısız | Mevcut takımın beklentileri sağlanıyor; bağımsız davranış sayısı değil |
| Önceki regresyonlar | 17/17 senaryo geçti | Önceden eklenen dar düzeltmeler korunuyor |
| Yeni kapanış bütünlüğü | 33/33 senaryo geçti | Olumlu kapanış, olumsuz kontroller ve enjekte edilen I/O hataları |
| Windows timeout | Geçti | Yeni runner'ın test çocuğu kapanıyor; eski kontrol çocuğu bırakıyordu |
| JavaScript syntax | 33 dosya, 0 hata | core/test/tools dosyaları ayrıştırılabiliyor |
| Genel karşı örnekler | 7 engellendi, 5 sürüyor | `--expect-fixed` bilerek exit 1; bütün sistem yeşil değil |
| `git diff --check` | exit 0 | Yeni farkta whitespace hatası yok; Windows satır-sonu uyarısı hata değil |
| Kaynak değişmezliği | 51 dosyada aynı toplu SHA-256 | Testler gerçek kaynak/test dosyalarını değiştirmedi |

Tekrarlama: `rtk node test/run.js` ve `rtk node tools/full-review-probes.js --expect-fixed`.
Ana test koşucusu geçici repo kopyası ve ayrı `CLAUDE_CONFIG_DIR` kullanır. Gerçek HKCU
Environment üzerinde çalışan üç kontrol artık sahte adaptörle çalışır; atlanmadılar.
Release/scaffold testlerinin dosya yazıları da kopyada kalır. Fixture'lar inceleme için tutulur.
Son tam takım: `C:/Users/ADMINI~1/AppData/Local/Temp/tkc-suite-5Af35H`.

Eski teste yalnız ret bekleterek başarılı görünüm verilmedi. Testler, geçerli bir denetim
kaydını yeni olay akışıyla oluşturup doğru işin kapanabildiğini de doğruluyor. Stale-audit
karşı örneği de önce geçerli audit oluşturuyor; erken kimlik reddini yanlışlıkla hash-race
düzeltmesi diye saymıyor. Hata mesajı ve başarılı PostToolUse beklentileri değişen eski
fixture'lar yeni sözleşmeye uyarlandı. Bir fixture uyarlaması gerçek bir hatayı da yakaladı:
round alanı olmayan eski sözleşmede dispatch'in varsayılan turu son olaya taşınmıyordu.

## G01–G11: nerede, ne düzeldi, ne kaldı?

1. **G01 — yanlış checkout:** [lib.js](../../core/hooks/lib.js:232) `checkoutRoot` ayrımını
   sağlıyor; [contract.js](../../core/scripts/contract.js:44) locate/risk/hash/verify akışları
   gerçek checkout kullanıyor. Ana kopyada 1, bağlı worktree'de 999 olan test artık reddediliyor;
   worktree düzeltilince geçiyor ve ledger o checkout'u yazıyor. İç içe bağımsız Git deposu
   üst relay'i ödünç almıyor. Gerçek host/worktree ve tüm eşzamanlı yazıcı kombinasyonları
   ayrıca doğrulanmalı; ortak relay kilidi kapanışları korumacı biçimde seri çalıştırır.

2. **G02 — denetim sonrası değişiklik:** [completeLocked](../../core/scripts/contract.js:952)
   verify öncesi/sonrası HEAD, sahiplenilen içerik, kontrat metni ve index karşılaştırıyor.
   Geçerli audit sonrasında kaynak, HEAD, kontrat veya index değiştiren testler reddedildi.
   Kapanışın yayınlanmasına kadar kilit tutuluyor; journal da girdileri yeniden karşılaştırıyor.
   Bu bir tam dosya sistemi dondurması değildir; başka süreçlerin değiştirip geri koyduğu
   girdiler, ignored dosyalar ve dış servisler için hermetik yürütücü hâlâ gerekir.

3. **G03 — ilgisiz/eski denetçi:** [watch.js](../../core/hooks/watch.js:239),
   [checkAuditor](../../core/hooks/seal.js:145) ve [audit](../../core/scripts/contract.js:1767)
   iş/tur/checkout/dispatch/ebeveyn/revizyon/bitmiş transcript bağı kuruyor. Yanlış iş, tur,
   checkout, dispatch, builder kimliği, bitmemiş koşu ve başarısız/çelişkili verdict reddediliyor.
   Çağrıdan önce kontrat veya host tool-use kimliği eksikse denetçi başlatma girişimi reddediliyor.
   Eski audit JSON'larına alan ekleyerek göç yapılmamalı; gerçek yeni inceleme gerekir.
   Bu kanıtlar sentetik host olaylarıyla test edildi; canlı host entegrasyonu bekliyor.

4. **G04 — güven sınırı:** Eski biçimli sahte live+audit çifti artık geçmiyor; fakat yeni
   biçimdeki bütün dosyaları aynı kullanıcı yetkisiyle üretebilen süreç engellenmiyor.
   **Güçlü sahtecilik önleme açık kaldı.** Yerel hash veya aynı dizindeki sır bunun çözümü değil.
   Güvenilir dış supervisor, ayrı izinler ve doğrulanmış host olayları olmadan bunu güvenlik
   garantisi olarak anlatmak yanlış. Belgelerdeki iddia bu sınırla düzeltildi.

5. **G05 — yarım kapanış:** Yeni [closure.js](../../core/hooks/closure.js:54), işlem kimliği ve
   prepared/committed journal kullanıyor. Audit tüketimi, tekil ledger satırı, done yayını ve
   son journal kaydı kurtarılabilir adımlar oldu. Kullanıcı kontratı değişmişse üzerine yazılmıyor.
   Used-record yazımı, özgün audit silme, ledger, arşiv rename ve final-journal hataları
   enjekte edilip tek kayıtla kurtarma doğrulandı. Snapshot yalnız commit sonrası temizlenir;
   unmet kapanışta korunur. Fiziksel güç kaybı/fsync garantisi ve hard-kill sonrası otomatik
   `.held` kilit kurtarma tamamlanmadı; her olası dosya sistemi arızası test edilmiş değildir.

6. **G06 — boş kabul:** Gerekçesiz `verify: []` reddediliyor. Açık boş liste, manual mode,
   en az 40 karakterlik manual-reason ve Acceptance, ayrıca bağımsız audit ile dar istisna var.
   Manuel neden ve doğrulama modu ledger'a yazılıyor. Prose lint tek başına ürün kabulü değil.
   Uzunluk kontrolü bir gerekçenin anlamlı olduğunu kanıtlamaz; anlamsız metni semantik olarak
   reddetmek hâlâ gerçek denetçinin sorumluluğudur. Sıfır çıkışlı totoloji problemi tümüyle çözülmedi.

7. **G07 — unmet bağımlılık:** [blockers](../../core/scripts/contract.js:736) dosyanın done
   altında bulunmasını yeterli saymıyor; başarılı sonuç ve yeni işlemlerde committed journal
   istiyor. Unmet önkoşul bloke ediyor, passed önkoşul izin veriyor. Aktif dizine elle done
   yazılması da başarı sayılmıyor. Ayrı cancelled komutu/durum modeli bu partide eklenmedi.

8. **G08 — repo dışı yazı:** [boundary](../../core/hooks/guard.js:322) yetki bağlamını hedefte
   aramak yerine çağıranın relay/checkout bilgisinden alıyor. Canonical/realpath denetimi
   junction kaçışını da kapsıyor. Repo dışı Write ve sahiplenilen linkin dışarı taşması
   reddedildi. Bağlı ajan başka kontrata geçemiyor veya owns genişletemiyor. Bu sonuç bütün
   kabuk/MCP araçlarına uygulanmış genel bir izin matrisi değildir; G09 açık.

9. **G09 — kabuk izolasyonu:** **Açık.** Bash/PowerShell genel dosya yazımını engellemiyor;
   yalnız mevcut Git-merge/push kontrolleri var. Kapanışta Git-visible kapsam dışı değişiklikler
   artık yakalansa da bu önleyici sandbox değildir. README ve rol/relay metnindeki yanlış
   “shell de kapalı” ifadesi kaldırıldı. Ayrı yetki/yürütücü tasarımı gerekir.

10. **G10 — parçalı Edit:** [decide](../../core/hooks/guard.js:455) Edit sonrası oluşacak tam
    metni hesaplayıp Write ile aynı şema/geçiş kontrollerinden geçiriyor. Alan silme, doğrudan
    terminal durum, blocked→done, yeniden bağlanma ve owns genişletme reddediliyor. PreToolUse
    artık binding/raise yazmıyor; başarısız araç olayının ardından bağ oluşmuyor, başarılı
    PostToolUse ardından oluşuyor. Bütün araç türlerinde OS seviyesinde izolasyon iddiası yok.

11. **G11 — metadata ayrıştırma:** [schema.js](../../core/hooks/schema.js:8) sınırlı metadata
    alanı, tekil anahtarlar, fenced örnekleri dışlama, pozitif round, sürüm kontrolü ve
    tırnak/virgül/braket farkındalığı ekliyor. Açık boş liste prose başlığına düşmüyor; eski
    eksik round kontrollü olarak 1 kabul ediliyor. **Kısmi:** tam YAML şeması değil; bütün eski
    regex tüketicileri henüz taşınmadı. Suffix-ID statusline karşı örneği bunun açık kanıtı.

Kilit iyileştirmesinin G20'ye, izole test koşucusunun G44'e de faydası var; bunları o
bulguların bütünüyle kapandığı şeklinde saymıyorum.

## Denetçi akışındaki önemli değişiklik

Eski rol metni denetçiye, kendi çalışması bitmeden audit kaydı yazmasını söylüyordu.
Yeni bitmiş-koşu şartıyla bu talimat birlikte çalışamazdı. Artık sıra şudur:

1. Koordinatör denetçiyi kontrat ve rol yoluyla başlatır; dispatch revizyonu kaydedilir.
2. Denetçi inceler, verdict/findings ve kanıtları döner. Kayıt yazmaz.
3. Koordinatör Agent sonucu ve SubagentStop kanıtı geldikten sonra `audit` çalıştırır.
4. `complete` bağlı kaydı kontrol eder, verify çalıştırır, girdileri tekrar doğrular ve kapatır.

Başarı yanıtındaki `verdict: passed` / `findings: none` satırları tekil olmalı ve kod
örneği/fence içinde olmamalı. `--dry-run` artık ücret ödemeden önceki test değil, bitmiş koşunun
uygunluk kontrolüdür. Bunlar [auditor rolü](../../core/roles/auditor.md),
[relay talimatı](../../core/skills/relay/SKILL.md), iki README ve
[bütünlük/sınırlar belgesinde](../SEAL-INTEGRITY.md) eşleştirildi.

## Açık kalan karşı örnekler ve sonraki kabul

| Bulgu | Son koşudaki açık | Sonraki düzeltmenin kabulü |
|---|---|---|
| G14 | İlk relay öncesi rol çağrısı model belirtmeden pahalı ebeveyni miras alıyor | İlk çağrı dahil tek routing kararı; model/effort eksikse çağrı öncesi ret |
| G21 | Payload session id varken başka session'ın kaydı kapanıyor | Bir oturumun bitişi diğer kaydı byte düzeyinde değiştirmemeli |
| G24 | Handoff yenilemesi Closed debts kanıtını siliyor | Yenileme öncesi/sonrası borç kapanış geçmişi korunmalı |
| G27 | Dirty import grafı fresh sayılıyor | Commit olmadan eklenen import tazelik ve fan-in kararını değiştirmeli |
| G33 | Harf suffix'li kontrat statusline'da görünmüyor | Parser/CLI/statusline aynı ID kümesini kabul edip saymalı |

Bunlara ek olarak **G12–G17 attempt/Fable/model politika işleri sonraki partinin önceliği**.
Üçüncü gerçek deneme öncesi ilgili iki başarısızlığa bağlanmış, bitmiş Fable görüşü şartı
bütün yollar için henüz sağlanmadı. Mevcut 17 testin geçmesi bu daha geniş garantiyi vermez.
Kalıcı attempt kimliği, failure signature, tek routing kararı ve host'ta gerçekten çözümlenen
model birlikte ele alınmalı; sadece round alanına veya role adına bakılmamalı.

G12–G60, kurulum/release, özgün kapalı-log kabulleri ve canlı host doğrulaması tamamlanmadan
geniş VidShrink benchmark'ına güvenilir ölçüm deneyi demem. Önce bu partinin gerçek host olay
alanları, sırası ve transcript erişimi küçük kontrollü kabulde doğrulanmalı; sessiz uyumluluk
fallback'iyle eski zayıf kayıt kabulüne dönülmemeli.

## Maliyet, rapor ve sonraki kişiye not

Bu tur alt-ajan, Claude/Opus/Fable çağrısı veya ücretli ürün benchmark'ı başlatılmadı. Node/Git
regresyonları yerel işlemlerdir; ayrı model çağrısı yapmazlar. Bu, Codex konuşmasının kendi
token kullanımının sıfır olduğu anlamına gelmez.

“Max kotasının %25'i kurtarılırdı” veya “sıfır continuous token” iddiası yeni bir ölçümle
doğrulanmış değildir. Önceki maliyet analizi ve API eşdeğeri/kota ayrımı aynen geçerli sınırla
korunuyor. Bu partiden somut çıkarım, yanlış kapanışı ve belirli gereksiz yeniden deneme
nedenlerini azaltacak kontroller eklenmesidir; kazanılan kota yüzdesi ölçülmedi.

VidShrink'in eksik olay/maliyet raporunu tamamlatmak için
[önceki promptun B bölümü](2026-09-04-claude-duzeltme-plani.md) kullanılabilir. Buradan başka
göreve mesaj gönderilmedi; yeni görev açılmadı. İlk parti burada teslim edilir. Sonraki parti
ayrı bir kullanıcı devam isteğiyle, bu rapordaki açık kabul listesine göre sürdürülmelidir.
