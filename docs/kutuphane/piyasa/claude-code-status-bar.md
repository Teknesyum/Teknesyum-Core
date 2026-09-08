# briansmith80/claude-code-status-bar

- MIT · kurulum bicimi: plugin (statusline + 2 komut) · ★17
- mekanizma: kanca 0, 2 slash komut (setup, configure), ajan 0, skill 0, MCP 0; `statusline-command.sh` 127 KB bash, `statusline-helper.js` 23 KB, `statusline-subagent.js` 8.6 KB
- sıradan turda bağlama: 0 KB / 0 token — statusline ciktisi modele gitmez, kullaniciya cizilir; depodaki 49 KB'lik CLAUDE.md gelistiricinin kendi deposuna ait, kurulumda tasinmaz
- premium: yok

## Ne yapar
Her yanitin altina kota yakimi, baglam doluluk cubugu, oturum maliyeti, git durumu ve o an calisan
araci basar. Ikinci satir canli etkinlik: calisan alt ajanlar, todo cubugu. `statusline-subagent.js`
Claude Code'un `subagentStatusLine` ayarini kullanip ajan panelindeki her satiri kendisi ciziyor —
tick basina gelen `tokenSamples` dizisini tok/s hizina ve spark cizgisine ceviriyor.

## Core'a alınacak
- fikir: `subagentStatusLine` ayari — Core'un statusline'i su an yalniz alt satiri yaziyor; ajan panelindeki satirlari da devralmak "model gormez, kullanici gorur" ilkesine tam uyar.
- pasif betik: `tokenSamples` -> tok/s + spark cizgisi hesabi (`statusline-subagent.js`, ~60 satir) — Core'un bench/maliyet gostergesine dogrudan girer.
- fikir: hata durumunda sessiz cikip Claude Code'un varsayilan cizimine dusme — Core kancalarinin kirilma davranisi icin iyi kural.

## Karar
Al — kurulumda baglama sifir token yazan, Core'un statusline alanina birebir oturan iki somut mekanizma (subagentStatusLine, tokenSamples spark).
