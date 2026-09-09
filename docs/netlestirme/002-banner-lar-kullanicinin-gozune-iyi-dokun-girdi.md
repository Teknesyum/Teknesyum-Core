[[netlestirme:002]]

# Netleştirme: Banner'lar kullanıcının gözüne iyi dokunuşlar mı yapıyor, ve sohbet adını rename

İşe başlamadan önce soruyu keskinleştir. Görüş verme, plan yazma, kod yazma.
Yalnız şunu döndür: soruda belirsiz kalan yerler, her biri için tek satırlık bir netleştirme sorusu, en fazla beş. Belirsizlik yoksa "net" yaz.

## Soru

Banner'lar kullanıcının gözüne iyi dokunuşlar mı yapıyor, ve sohbet adını rename ile canlı güncellemek banner benzeri bir genel durum izlemesi olarak mantıklı mı? Native seviyesinde calisan, base davranislarina yakin etki veren bir eklenti icin bu ikisini incele.

## Elde olan olgular

# Olgular

## Ürün

Teknesyum Core, Claude Code için bir eklenti (plugin). Slash komutu yok; her şey kancalar
ve betikler. Sürüm 0.26.0. Bağlı sekiz olay: SessionStart, UserPromptSubmit, PreToolUse,
PostToolUse, PostToolUseFailure, Stop, SessionEnd, Notification. Sekiz kanca dosyası
`core/hooks/` altında.

Tasarım ilkesi: sıradan turda hiçbir kanca modelin bağlamına bir şey yazmaz. Durum bilgisi
statusline'da durur ve model onu görmez. Konuşma yalnız eşikte, bir kez olur.

## Kullanıcının bugünkü sorusu

Kullanıcı iki şeyi merak ediyor:

1. Banner'lar (eşikte basılan tek satırlık, başlığı Baş Harfleri Büyük bildirimler)
   kullanıcının gözüne iyi dokunuşlar mı yapıyor? Bunlar terminalde sohbet akışının içinde
   görünür ve tek satırdır.

2. Sol taraftaki sohbet listesinde bu sohbetin adını rename ile değiştirmek — yani oturum
   başlığını işin durumuna göre canlı güncellemek — banner'a benzer bir "genel durum
   izlemesi" olarak mantıklı mı? Claude Code'da oturum başlığını değiştiren bir arayüz var
   (desktop uygulamasında set_session_title benzeri bir yetenek) ve teorik olarak bir kanca
   bunu iş ilerledikçe güncelleyebilir.

Kullanıcının kendi cümlesi, olduğu gibi:

"ff fable a danış demek olsun banner lar ile kullanıcınını gözüne iyi dokunuşlar yapıyoruz
değil mi birde sol taraftaki bu sohbetin ismini rename yapma ile banner benzeri bir genel
durum izlemesi mantıklı mı bunu da fable incelesin"

"native seviyesinde çalışan bir pluginimiz olmalı ve önceki base davranışlarına yakın bir
etki görsün kullanıcı"

## Bağlam: banner'lar bugün nerede basılıyor

- Eşik uyarısı: "N dosyaya dokunuldu ve plan yok" — bir kez, sonra susar.
- Ajans koltuğu: Stop olayında bir kez tek satır.
- Kanıt kapısı (0.26.0): dosya düzenlenmiş ve o ağaçta koşan komut yoksa Stop bir kez
  bloklanır ve tek paragraf gerekçe basar.
- Denylist (0.26.0): tehlikeli komut reddedilince tek satır gerekçe.
- `??` / `++` / `pp` / `aa` işaretleri: kullanıcı işareti yazdığı turda bağlama kütüphane
  bulguları ya da ajans koltukları gelir. İşaret cümlenin başında ya da sonunda okunur.

## Bağlam: maliyet ölçüsü

Kullanıcının altın kuralı: token tasarrufu başarı kadar önemli. Sıradan turda sıfır bağlam
yazan her şey bedava sayılır; her turda çalışıp modele metin yazan her şey pahalıdır.
Statusline modelin bağlamına girmediği için bedavadır.

## Bağlam: "base davranışı"

Kullanıcının daha önce kullandığı Base adlı bir kurulum vardı; ondan Core'a geçerken
sözleşme/relay makinesi, /save, /load, /scan, /rc, /pusla, /report gibi slash komutları
kaldırıldı. Kullanıcı şimdi "native seviyesinde çalışan bir plugin" ve "önceki base
davranışlarına yakın bir etki" istiyor — yani kullanıcı tarafında görünen canlılık ve
durum farkındalığı hissi, ama Core'un ucuzluğundan ödün vermeden.

## Kısıt

- Claude Code eklentisi yalnız kanca olaylarında ve betiklerle iş yapabilir.
- Statusline'ı eklenti yazabilir; model onu görmez.
- Oturum başlığını değiştirmek desktop uygulamasının bir yeteneğidir; bir kancanın buna
  erişimi olup olmadığı doğrulanmadı.
