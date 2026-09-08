# upstash/context7

- lisans: MIT
- kurulum biçimi: plugin (marketplace) + CLAUDE Code skill + MCP + CLI (`ctx7`)
- mekanizma: kanca yok. Claude Code eklentisi 1 komut (`/context7:docs`), 1 alt ajan
  (`docs-researcher`), 1 MCP sunucusu (`.mcp.json` → uzak HTTP `mcp.context7.com`) taşıyor.
  Ayrıca depo kökünde 3 bağımsız skill var: `context7-cli`, `context7-mcp`, `find-docs`
  (hepsi aynı işi — kütüphane dokümanı çekmeyi — farklı istemcilere anlatıyor).
- sıradan turda bağlama: yalnız aktif skill'in frontmatter description'ı her zaman yüklü;
  ölçüm ~300-925 bayt/skill (find-docs en şişkini, ~925 B ≈ ~230 token). Plugin kurulduğunda
  CLAUDE.md'ye hiçbir şey eklenmiyor, kanca stdout'u yok — MCP çağrılana kadar ek token sıfır.
- premium: var. `context7.com/dashboard`'dan alınan API key ile daha yüksek rate limit;
  fiyat README'de yazmıyor, kayıt/kartla dashboard'a yönlendiriyor.

## Ne yapar
Kütüphane/framework adı verince Context7'nin barındırdığı güncel, versiyona özel dokümantasyonu
ve kod örneklerini modele MCP üzerinden çekiyor. `resolve-library-id` → `query-docs` iki adımlı
akış; sonuç doğrudan konuşma bağlamına ekleniyor, dosyaya yazılmıyor.

## Kullanıcıya nasıl hissettirir
Sessiz altyapı: kullanıcı "use context7" yazınca ya da bir kütüphane adı geçince skill/komut
tetikleniyor, çıktı normal model cevabına karışıyor. Banner ya da statusline dokunuşu yok.

## Core'a alınacak
- fikir: "pasif kütüphane, istenince oku" ilkesi zaten Core'un `kutuphane.js` mekanizmasıyla
  örtüşüyor — context7'nin iki-adımlı resolve→query akışı, kütüphanenin kendi `find`/`show`
  ikilisine model olarak referans alınabilir.
- Core'un kendi kitap deposu zaten var; context7'nin MCP sunucusunu veya CLI'sini almaya gerek yok.

## Ölçülecek
Core'a alınmayacağı için ölçüm planı yok.

## Karar
hayır — context7 dış kütüphane dokümantasyonu çekmek için bir servis/istemci, Core'un
konsepti (kendi içindeki pasif bilgi deposu) ile örtüşmüyor; tek devşirilebilir şey fikir
düzeyinde ve zaten karşılığı var.
