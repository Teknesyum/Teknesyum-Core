# İlerleme Çubuğu Neden Görünmüyor

Tarih: 2026-10-28

## Çubuğun Yeri

Çubuğu `core/scripts/statusline.js` içindeki `progressPart` çiziyor; `~/.claude/settings.json`
`statusLine` → `~/.claude/teknesyum/bridge.js` → `statusline.js` zinciriyle çağrılıyor.
Tek kaynağı `.claude/jobs.md`: açık `- [ ]` satırı yoksa ya da hepsi `[x]` ise çubuk hiç basılmıyor.

## Ölçüm

Teknesyum-Core'da elle çalıştırılan durum satırı:

```
Teknesyum ▸ Teknesyum-Core · devir
```

Çubuk yok, çünkü `.claude/jobs.md` yok.

Projeler altında `.claude` klasörü olan 17 projede `jobs.md` durumu:

| Proje | Tarih | Açık satır | `(n/m)` satırı |
|---|---|---|---|
| ArctisPil | 2026-09-27 | 0 | 0 |
| DustyBytes | 2026-10-03 | 0 | 0 |
| SlaytEdit | 2026-10-28 | 4 | 0 |
| Teknesyum-UI | 2026-10-13 | 0 | 0 |
| VidShrink | 2026-10-22 | 0 | 9 |

Kalan 12 projede `jobs.md` hiç yok. Bugün çubuğun görünebileceği tek yer SlaytEdit.

## Nedenler

1. **Gösterim yeri.** Çubuk `statusLine` içinde. Masaüstü uygulamasının belgesi (code.claude.com/docs/en/desktop)
   `statusLine` için bir şey söylemiyor; sahibin gönderdiği masaüstü ekran görüntüsünde Teknesyum satırı yok.
   Sahip uygulamada `Teknesyum ▸ …` satırını hiç görmüyorsa çubuk hiçbir koşulda görünmez.
2. **Besleme.** `jobs.md` yalnız "tek istemde birden çok iş" kuralıyla yazılıyor. Masaüstünde ajan
   ilerlemeyi uygulamanın kendi görev listesine (`update_plan`) yazıyor; `jobs.md` çoğu turda hiç açılmıyor.
3. **Uzun tek iş.** Asıl bekleme durumu tek bir uzun arka plan işi. O iş `jobs.md`'ye dokunmaz;
   çubuk ilerlemesini göremez. v0.82.0'daki `bekle.js` bu boşluk için yazıldı.
