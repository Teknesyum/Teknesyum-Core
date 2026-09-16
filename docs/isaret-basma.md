# `hh` Neden Basılmadı

Tarih: 2026-09-16

## Olay

Bir önceki istemde `hh` vardı. İşaret okundu, banner da basıldı; ama işaret listesi ekrana
gelmedi. Kullanıcı listeyi bekledi, listeyi görmedi.

## Neden

`mod.js` listeyi `additionalContext` alanına yazıyordu. O alan modele bir
`<system-reminder>` bloğu olarak ulaşır. Modelin bu blok için yazılı yönergesi şudur:
arka plan bilgisidir, kullanıcının talimatı değildir. Yani liste modele "şunu ekrana bas"
diye değil, "bunu bil" diye geliyordu.

Sonuç: basılıp basılmayacağı modelin insafına kalmıştı. İstemin kalanında iş varsa model
işe koşuyor, listeyi bilgi sayıp geçiyordu. Bu bir dikkat kusuru değil, mimari kusurdu:
kullanıcıya gösterilecek metin, gösterilip gösterilmeyeceğine model karar veren bir kanala
konmuştu. Üstelik bedeli vardı — liste her `hh` turunda bağlama giriyordu.

## Çözüm

Liste artık ekran kanalına gidiyor.

- `lib.sayBlock(session, metin)` çok satırlı metni banner kuyruğuna `{ block: metin }`
  olarak koyar.
- `bant.js` kuyruğu `MessageDisplay` olayında boşaltır; `block` taşıyan kayıtları ters
  tırnağa sarmadan, ham markdown olarak yazar.
- `mod.js` `help()` artık `sayBlock` çağırır ve `''` döner.

Böylece liste `hh` görülür görülmez, modelin ilk cümlesinin üstünde basılır; bağlama tek
harf girmez; maliyet sıfırdır. İstemin kalanına model bundan sonra bakar.

## Testte tutulan

`test/all.js` iki şeyi birden kontrol ediyor: `hh` turunun bağlamına listeden tek satır
girmediğini, ve listenin `bant.build` çıktısında mesaj metninin üstünde durduğunu.

## Kural

Kullanıcının gözü için yazılan hiçbir metin `additionalContext` ya da `systemMessage`
alanına konmaz. Ekran kanalı `say` / `sayBlock`, gösterimi `bant.js` yapar.
