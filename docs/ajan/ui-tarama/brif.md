# UI Tarama Brifi

Amaç: özel raftaki arayüz kitaplarını (`~/.claude/teknesyum-private/private/tercihler/ui-duzeni.md`,
`ui.md`, `kabuk-standardi.md`, `guncelleme-paneli.md`) piyasadaki UI depolarından süzülmüş
kurallarla genişletmek. Hedef: akıcılık, şıklık, cila, "program çalıştığını gösterir".

Önce bu dört dosyayı oku; mevcut kuralı tekrar önerme, çelişeni ayrıca işaretle.

## Sabit Kısıtlar (Raf Bunları Değiştirmez)
- Yalnız koyu tema, neon vurgu. Renk, süre, yarıçap, boşluk sayısı kitaba yazılmaz; `--tk-*`
  token'ından gelir. Kaynakta sayı varsa kuralı sayısız yaz, sayıyı "token önerisi" satırına
  kaynağıyla koy. Sayı uydurma.
- Davranış kitaplığı alınabilir, görsel tema kitaplığı asla (MUI, shadcn teması, Material.Avalonia vb.).
- Yığın: Tauri 2 + React (web arayüzlü), Avalonia (medya/ağır yerel), Electron dondurulmuş.
- Yalnız `transform` ve `opacity` canlanır.
- Gösterişli efekt (WebGL, parçacık, gsap sahnesi) uygulamaya girmez.

## Yöntem
- `gh` ve WebFetch/WebSearch serbest. README, docs, kaynak kodu oku; yıldız sayısı ve lisansı `gh api repos/O/R` ile al.
- Olabildiğince çok depo tara (en az 12). Her depo için bir satır, taranıp elenenler dahil.

## Rapor Biçimi (Türkçe, `docs/ajan/ui-tarama/<alan>.md`)
1. `## Taranan Depolar` tablosu: depo · lisans · yıldız · karar (al / uyarla / ele) · tek cümle neden.
2. `## Kural Adayları`: her aday şu dört satır:
   - **Kural:** tek cümle, emir kipinde, ölçülebilir ya da gözle denetlenebilir.
   - **Kaynak:** depo + dosya/doküman bağlantısı.
   - **Token önerisi:** kaynakta sayı varsa `--tk-...: değer (kaynak)`, yoksa `-`.
   - **Denetim:** nasıl doğrulanır (rg deseni, test, ekran görüntüsünde neye bakılır).
3. `## Çelişkiler`: mevcut raf kuralıyla çatışan bulgular, iki tarafın gerekçesiyle.
4. `## Şablon Adayları`: Teknesyum-UI `templates/`'e kopyalanmaya değer davranış bileşenleri (lisansıyla).

Kural adayı sayısı kaliteye bağlı; zayıf olanı yazma. Son mesajın yalnız dosya yolu ve
aday sayısı olsun.
