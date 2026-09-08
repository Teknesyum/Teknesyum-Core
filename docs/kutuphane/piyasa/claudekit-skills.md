# mrgoonie/claudekit-skills

- lisans belirtilmemiş (marketplace girdilerinde MIT) · kurulum: plugin marketplace (`/plugin marketplace add`) · ★2211
- mekanizma: 45 `SKILL.md`, 6 tematik plugin, 1 ajan (`mcp-manager`), kanca yok, komut yok, `.mcp.json` kasten `.claude/` altına taşınmış
- sıradan turda bağlama: `CLAUDE.md` 3.0 KB + tüm skill `description` satırları toplamı **13.99 KB** (ölçüm: `find -name SKILL.md -exec sed -n '/^description:/p'` | wc -c) ≈ 17 KB, **~4.3k token** — hepsi kurulursa. Tek plugin kurulursa payı kadar.
- premium: var — claudekit.cc ve GoClaw/TOSE ürünlerine yönlendiriyor, depo pazarlama kanalı

## Ne yapar
Kimlik doğrulamadan veritabanına, DevOps'tan doküman işlemeye 45 alan skill'ini altı plugin hâlinde marketplace olarak dağıtır. Öne çıkan tarafı skill sayısı değil, MCP sunucularını ana bağlamdan tamamen çıkaran düzeni.

## Core'a alınacak
- **fikir — MCP'yi alt ajana sürgün etmek**: `.mcp.json` `.claude/` altına alınıp ana ajanın açılışta yüklemesi engelleniyor; araç gerektiğinde `mcp-manager` alt ajanı çağrılıyor, araç listesini o kendi penceresinde okuyup yalnız sonucu döndürüyor. 80 MCP sunucusunda bile ana bağlam temiz kalıyor. Core'un "sıradan turda sıfır token" ilkesinin MCP'ye uzanan hâli; Core'da MCP kullanımı doğarsa doğrudan bu desen.
- **fikir — açıklama bütçesi ölçümü**: 45 skill'in yalnız açıklamaları 14 KB tutuyor; katalog büyüdükçe maliyetin nereden geldiğini gösteren somut sayı, Core'un raf yaklaşımının lehine kanıt.
- hiç — skill gövdeleri alan bilgisi, Core'un mekanizmasına katkısı yok.

## Karar
Fikir notu — MCP'yi alt ajana taşıma deseni tek başına değerli; 14 KB açıklama yüküyle katalogun kendisi Core ilkesine aykırı.
