[[netlestirme:001]]

# Netleştirme: İki soru. (1) Claude Code'un Stop kancasında 'gerçek stop' ile 'ara duraklama' d

İşe başlamadan önce soruyu keskinleştir. Görüş verme, plan yazma, kod yazma.
Yalnız şunu döndür: soruda belirsiz kalan yerler, her biri için tek satırlık bir netleştirme sorusu, en fazla beş. Belirsizlik yoksa "net" yaz.

## Soru

İki soru. (1) Claude Code'un Stop kancasında 'gerçek stop' ile 'ara duraklama' deterministik olarak nasıl ayırt edilir? Elimizde transcript_path, stop_hook_active, oturum durum dosyası (düzenlenen dosyalar, test koşuları, ağaç hash'i) var. Kanıt kapısı yalnız iş gerçekten bittiğinde, model işi kapattığını söyleyip durduğunda ateşlemeli; kullanıcıya soru sorup durduğunda, hiçbir şey yapılmayan turda, alt ajan bitişinde ateşlememeli. Hangi sinyal en ucuz ve en az yanlış pozitif verir - transcript'in son asistan mesajını okumak mı, oturum durumundaki düzenleme/koşu farkı mı, başka bir şey mi? Elle 'doubt' ile kurma zorunluluğunu kaldırmak istiyoruz; varsayılan açık ama sessiz olmalı. (2) Kullanıcı 'gerekirse fable'a danış' insiyatifini her sohbette istiyor: model kendiliğinden, tüketimi kötüleştirmeden ne zaman danışacağına karar verebilmeli. Bunu hangi mekanizma taşır - kanca mı, CLAUDE.md kuralı mı, bütçe sayacı mı? Hangi eşik ve hangi kapı yanlış tetiklemeyi keser?

## Elde olan olgular

# Olgular - Teknesyum Core v0.25.0

## Kanca yuzeyi (core/hooks/)
- count.js: SessionStart, PostToolUse, PostToolUseFailure, Stop. Oturum durumunu
  ~/.claude/teknesyum/state-<oturum>.json icine yazar: files (bu oturumda duzenlenen dosyalar),
  tests (kosulan test komutlari; her kayitta o anki agac hash'i = HEAD + git status porcelain sha1),
  ctx (baglam yuzdesi), diff.
- mod.js: UserPromptSubmit. Istem "??", "++", "pp", "aa", "doubt" onekiyle basliyorsa baglama metin koyar;
  sıradan turda 0 bayt.
- loop.js: PreToolUse (Bash|PowerShell). Ust siniri olmayan bekleme dongusunu permissionDecision:deny ile reddeder.
- prefs.js: PreToolUse (Write|Edit). scout.js: PreToolUse (Agent). handoff.js: SessionEnd. notify.js: Notification.
- dur.js (v0.25.0, yeni): Stop. Oturum "doubt" onekiyle kurulmussa ve tur dosya duzenleyip
  o agac durumunda kosmus test/komut yoksa {"decision":"block", reason} doner.
  stop_hook_active true ise hicbir sey yapmaz (tek israr).

## Kullanicinin duzeltmesi (2026-09-09)
- "doubt yaz acilsin kapansin" bicimi kullaniciyi zorluyor; kullanici minimal ayarla istedigini
  elde etmeli. Kapi elle kurulmadan calismali.
- Kapi YALNIZ "gercek" bir Stop olayinda tetiklenmeli: gercek is bittiginde, model isi
  kapattigini soyleyip durdugunda. Ara duraklamalarda (kullaniciya soru sorup durma,
  arka plan gorevi bildirimi, alt ajan bitisi, hicbir sey yapilmayan tur) tetiklenmemeli.
- Bu ozellik kullanicinin ozel (private) ozelligi; genel urun degil.

## Claude Code Stop kancasinin girdisi
Stop kancasina gelen JSON: hook_event_name, session_id, transcript_path, cwd, stop_hook_active,
permission_mode. SubagentStop ayri bir olaydir. Stop her asistan turunun sonunda ates eder;
kullaniciya soru sorup duran tur da Stop uretir.

## Kullanicinin ikinci istegi
Kullanici "gerekirse fable'a danis" cumlesini seviyor ve T0'in (ana oturum) bunu her sohbette
kendi insiyatifiyle kullanabilmesini istiyor - tuketimi kotulestirmeden. Bugun mekanizma:
advice.js ask ile soru dosyaya yazilir, hooks/scout.js PreToolUse kapisi ayni soruya ikinci
cagriyi keser, cevap advice.js record ile docs/netlestirme/ altina yazilir. Tetik su an
kullanicinin "??" oneki ya da acik cumlesi; model kendiliginden cagirmiyor.
