[[netlestirme:005]]

# Netleştirme: Birden çok iş gelen istemde 'birini yap, gerisini sonra.md'ye ertele' kuralı man

İşe başlamadan önce soruyu keskinleştir. Görüş verme, plan yazma, kod yazma.
Yalnız şunu döndür: soruda belirsiz kalan yerler, her biri için tek satırlık bir netleştirme sorusu, en fazla beş. Belirsizlik yoksa "net" yaz.

## Soru

Birden çok iş gelen istemde 'birini yap, gerisini sonra.md'ye ertele' kuralı mantıklı mı, doğru kural ne?

## Elde olan olgular

## Sahibin sözü (aynen)

> şimdi 5 işimiz var t0 yönetici 1.sine odaklandı kalan 4 ünü sonraya yazdı tam stop diyecekti kalan 4 ünü gördü ordan 1 ini aldı 3 ünü sonraya yazdı
> bu şekilde mi çalışıyoruz bu şekilde mantıklı mı fable danışalım

## Şu anki kural (yazılı)

- Global CLAUDE.md: "Work you defer from a prompt goes into `.claude/sonra.md` as a short list, and you say so in one line; the next prompt brings it back and moves the file to `trash/`."
- yordam.md: "Within a session: a prompt with several jobs → do one, write the rest to `.claude/sonra.md` (`- ` lines), say so in one line. `mod.js` hands it back on the next prompt and moves it to `trash/sonra-<ts>.md`; `handoff.js` notes it if the session ends first. No postread: a Stop block would fight the evidence gate (fable, docs/danisma/025)."
- RULES.md (sahibin kuralı): "Don't leave work half done and don't narrow the scope on your own." ve "Build order is mine to pick: in every project, when several things are queued, I choose the best sequence, write it into the roadmap and start; I never ask which first."
- K0: beş dosya ve üstü iş → önce `docs/plan.md`. Sahibin bekleyen istekleri kalıcı olarak `docs/YOL-HARITASI.md`'de.
- Altın kural: sıradan tur native'den fazla tutmaz. Alt ajan çağırmak serbest, sınır yok (kendi bağlamında koşar, ana pencereyi şişirmez). Bağlam %60'ta makine devir notu yazar.

## Kuralın kökeni

Sahip 025'te önermişti (aynen kısaltılmadan ilgili parça): "örneğin bu yaptığım gibi kompleks farklı farklı işler verdim sen birine odaklanmak istiyorsun diğer 3 ünü bi sonraki inputun preread kısmına veya bu mesajın postread kısmına koydun bak şunu şunu yaptım şunlar sonraya saklandı bu şekilde sonraya saklanan hiç bişeyi unutmayacaksın". Sen (025) "preread kurulsun (`.claude/sonra.md`), postread kurulmasın" dedin; gerekçe: sonra.md modelin bir turluk kısa kuyruğu, "bu turda yapmadığım 3 iş", Stop bloğu kanıt kapısıyla (dur.js) kavga eder.

Yordama giden cümle "do one, write the rest" oldu. 025'in önerisi "bir işi ertelediysen yaz" idi; "tek iş yap" diye bir hüküm 025'te yok.

## Gözlenen davranış

Bir istemde 5 iş. T0 (ana oturum) 1.'yi yaptı, 4'ünü sonra.md'ye yazdı. Turu kapatacakken bekleyen 4'ü gördü, 1'ini daha aldı, 3'ünü yine sonraya yazdı. Sonuç: sahip kalan 3 için yeni istem yazmak zorunda; her yeni istem bir tur. Sahip bunun "böyle mi çalışıyoruz" diye sorguluyor.

## Soru

1. "Birden çok iş gelince birini yap, gerisini ertele" mantıklı mı? RULES.md'deki "kapsamı kendi başına daraltma" ile çelişiyor mu?
2. Doğru kural ne olmalı? Hangi durumda aynı turda hepsi (sırayla ya da bağımsız olanlar paralel alt ajanla), hangi durumda erteleme (ör. sahipten karar gerekiyor, bağlam eşiği, beş dosya+ plan.md gerekiyor)?
3. sonra.md kalmalı mı, rolü ne olmalı?
4. CLAUDE.md ve yordam.md'ye yazılacak kural metni: en çok iki-üç satır, İngilizce.

Kısıt: sıradan tura sabit token eklemeyen çözüm. Kanca ya da her tur okunan metin önerirsen payını söyle.
