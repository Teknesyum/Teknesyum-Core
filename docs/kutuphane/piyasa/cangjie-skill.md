# kangarooking/cangjie-skill

- MIT · metin paketi (tek meta-skill + yöntem klasörleri) · ★9698
- mekanizma: 36 SKILL.md, 0 kanca, 0 komut, 0 MCP; `scripts/cangjie.py compile` deterministik derleyici
- sıradan turda bağlama: 0 — kanca yok, kök SKILL.md (≈6 KB) yalnız kullanıcı "bu kitabı skill'e çevir" dediğinde okunuyor
- premium: yok (site var, depo tek kaynak)

## Ne yapar
Kitap, uzun video, podcast, kurs gibi uzun içeriği "çalıştırılabilir" beceri kartlarına damıtan bir boru hattı: RIA-TV++ — 0. aşama bütünü anlama, 1. aşama 5 paralel çıkarıcı, 1.5 üçlü doğrulama, 1.6 bağımsız skill terfi kapısı, 2-4 kart yazımı + Zettelkasten bağlama + stres testi, 5 derleme. Çıktı tek kaynak: `verified.yaml` + `cards/*.md`; single ve pack aynı bundle'dan derleniyor.

## Core'a alınacak
- kitap: RIA-TV++ damıtma yöntemi — Core'un raf kitaplarının nasıl yazılacağını tarif eden bir "kitap yazma kitabı". Şu an rafa alma kararı el yordamıyla veriliyor.
- fikir: "terfi kapısı" (promotion gate) — her çıkarılan birim bağımsız kitap mı yoksa yönlendirici satır mı olacağına ölçütle karar veriliyor. Core'un raf şişmesine karşı doğrudan kural.
- fikir: tek kaynaktan deterministik derleme — `verified.yaml`'dan hem ince hem kalın sürüm. Core'un `--lean` gövdeleriyle aynı mantık, tek dosyadan üretilebilir.

## Karar
Al — sıfır kanca, sıfır sıradan tur maliyeti, ve Core'un en zayıf yeri olan "rafa ne, nasıl girer" sorusuna ölçütlü cevap veriyor.
