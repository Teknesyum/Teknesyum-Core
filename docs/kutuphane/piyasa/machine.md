# katspaugh/machine

- MIT · kurulum biçimi: CLI (Lima VM sağlayıcı) · ★15
- mekanizma: 0 kanca, 0 skill, 0 ajan, 0 MCP; proje başına bir Lima VM kuruyor, içine Claude Code'u resmî pazar yeri ve 8 eklentiyle (frontend-design, superpowers, github, typescript-lsp, security-guidance, commit-commands, chrome-devtools-mcp, supabase) önden kurulmuş getiriyor, `defaultMode: auto`
- sıradan turda bağlama: 0 token — konak tarafında çalışıyor, oturuma hiçbir metin yazmıyor (README kurulum bölümünden)
- premium: yok

## Ne yapar
Her GitHub projesine, ajan çalışmaya hazır tek bir izole VM veriyor: Docker, Node, ajan CLI'ları, `gh`, imzalı git, isteğe bağlı araç profilleri. Konak dosya sistemi bağlanmıyor, özel anahtarlar konakta kalıyor, sırlar tmpfs'te tutulup yeniden başlatmada siliniyor.

## Core'a alınacak
- fikir: "her şeye evet" modunu güvenli kılan sınır klasör değil makine — Core'un toplu yazma/depo sınırı notuna komşu bir yaklaşım.
- fikir: sırların tmpfs'e render edilip yeniden başlatmada yok olması.

## Karar
hayır — VM sağlayıcı, eklenti değil; Core'a alınacak bir mekanizma taşımıyor, iki fikir notu yeter.
