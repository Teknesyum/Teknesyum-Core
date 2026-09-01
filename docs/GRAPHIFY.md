# Graphify: nerede duruyor

Soru: Base'de "kısmen eklendi" denmişti, Base terk edildi. Core'da var mı, gömülü mü,
skill listesinde neden görünmüyor.

## Ölçülen durum

`graphify` **Core'un içinde değil, hiç olmadı.** Bağımsız bir kişisel skill olarak
duruyor:

```
C:\Users\Administrator\.claude\skills\graphify\     SKILL.md (43 KB) + references/
sürüm: 0.9.39   kurulum: 2026-08-11   boyut: 109 KB
```

Kullanıcı seviyesinde kurulu olduğu için **her oturumda erişilebilir** ve skill
listesinde görünür — Core'un `core/skills/` klasöründe yalnız `relay` vardır.

Base'in "kısmen eklendi" cümlesi grafiği değil, **import haritasını** kastediyordu.
O parça Core'a taşındı ve orada duruyor: `core/scripts/map.js` — hub'lar, döngüler,
öksüz dosyalar, kenarlar. `map.js` grafik değil; model çağırmaz, dosya başına
maliyeti sıfırdır. Base'in taramasındaki hüküm bugün de geçerli: pahalı olan
graphify'ın **semantik** katmanıdır (dosya başına model çağrısı), bağ çıkarmak değil.

## İş bölümü

| İş | Araç | Maliyet |
|---|---|---|
| Kendi projendeki import zinciri, döngü, öksüz dosya | `map.js` | sıfır — düz metin tarama |
| Yabancı / büyük bir kod tabanını anlamak, topluluk tespiti, grafik sorgusu | `graphify` | yalnız çağrıldığında; semantik katman dosya başına model çağrısı |
| Tek dosya, tek sembol arama | Grep / Glob / LSP | sıfıra yakın |

`graphify`'ın kendi açıklaması da bu ayrımı yazıyor: `graphify-out/` yoksa ve kullanıcı
`/graphify` demediyse skill açılmaz.

## Karar

Ayrı kalır. Core'a gömülmez:

- Core Node.js'tir ve sıfır bağımlılıkla çalışır; graphify Python ve kendi bağımlılıkları
  ile gelir. Gömmek Core'un kurulumunu ona bağlar.
- Sürümleri bağımsız ilerliyor (graphify 0.9.39, Core 0.7.x).
- Maliyet sınıfları farklı: Core sıfır, graphify çağrı başına. Aynı pakette olmaları
  "eklenti bedava" cümlesini yalan yapar.

`docs/TRIAGE.md` zaten `graphify | already separate` diyordu; bu belge o satırın
gerekçesidir.
