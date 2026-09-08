# inoX-Network/claude-code-safety-guard

- MIT · elle kurulan kanca paketi (settings.json'a `PreToolUse`) · ★8
- mekanizma: 4 kanca betiği (`command-guard.py` 3970 satır, `diagnostics-register.py`, `update-check.py`), Bash/Read/Write/Edit eşleyicilerine bağlı; 0 skill, 0 komut, 0 ajan, 0 MCP
- sıradan turda bağlama: 0 token — kanca yalnız engellediğinde konuşur; `settings.example.json` içinde dört `PreToolUse` girdisi var, hiçbiri oturum başında metin yazmıyor.
- premium: yok

## Ne yapar
Her araç çağrısını çalışmadan önce görüp yıkıcı olanı reddeden deterministik bir bekçi: `rm -rf /`, `~/.ssh` okuma, `/etc` yazma, `main`'e zorla itme, kimlik sızdırma. LLM yok, aynı girdi aynı karar. 3 seviyeli, ajan kapsamlı geçici yetki sistemi var (alt ajan koordinatörün yetkisini miras almaz) ve kancanın kendi dosyalarını koruyan bir katman — model kendi bekçisini kapatamıyor.

## Core'a alınacak
- kanca: `PreToolUse` reddi — Core'un kural setinde "yıkıcı işten önce tek cümle sor" yazıyor; bunu modele değil deterministik kancaya bağlamak ilkeyi bozmuyor, sıradan turda 0 token.
- fikir: kendini koruma katmanı — Core kancalarının kendi dosyalarına yazmayı reddetmesi.
- fikir: seviye mirasının olmaması; alt ajan varsayılan olarak seviye 0.

## Karar
Fikir notu · mekanizma (0 token, modelsiz reddetme) Core'a uygun ama 4000 satırlık Python bekçiyi olduğu gibi taşımak Core'un yükünü ikiye katlar.
