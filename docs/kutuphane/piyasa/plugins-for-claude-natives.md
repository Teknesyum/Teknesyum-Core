# team-attention/plugins-for-claude-natives

- MIT · eklenti pazaryeri (14 ayrı eklenti) · ★824
- mekanizma: 14 eklenti; kanca yalnız ikisinde — `doubt` (UserPromptSubmit + Stop, 860 B + 821 B iki bash betiği) ve `say-summary` (Stop, python TTS); geri kalanı skill/agent/MCP (`interactive-review` kendi MCP sunucusunu taşıyor)
- sıradan turda bağlama: tek tek kurulum, seçilmezse 0 B; `doubt` kurulduğunda kanca sıradan turda hiçbir şey basmıyor, yalnız istemde `!rv` geçerse tek satırlık `additionalContext` yazıyor (~30 token, betikten okundu)
- premium: yok

## Ne yapar
Güç kullanıcıları için birbirinden bağımsız 14 eklenti: çok modelli görüş meclisi (`agent-council`), belirsiz isteği spec'e çeviren `clarify`, web arayüzlü plan onayı, Gmail/Takvim/KakaoTalk köprüleri, oturum kapanış araç seti.

## Core'a alınacak
- kanca: `doubt` deseni — UserPromptSubmit'te önek yakalanınca `~/.claude/.hook-state/doubt-mode-$session_id` yazılır, Stop kancası dosyayı görürse `{"decision":"block","reason":...}` döndürüp bir kez doğrulama turu zorlar ve durum dosyasını siler. Core'un `??`/`++`/`pp` öneki yalnız giriş tarafında; çıkış tarafında tek atımlık kapı yok.
- fikir: önek yakalandığında modele "bu meta komuttur, isteğin parçası değil" satırı geçirmek — Core'un önek kancasında bu uyarı yok.
- fikir: oturum başına durum dosyası (`session_id` ile isimlendirilmiş), kullanıldıktan sonra silinir — kalıcı ayar yerine tek turluk mod; Core'un "eşikte bir kez konuşur" kuralının kanca tarafındaki karşılığı.

## Karar
Al — `doubt` kancası 1.681 B iki betik, sıradan turda 0 B basıyor ve Core'un eksik olan çıkış tarafı kapısını tam olarak dolduruyor.
