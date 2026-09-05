---
repo: https://github.com/psf/requests.git
sha: dae7ef63b4df6eded86637f251fc4e3a06c3b479
---

Çalışma dizininde `psf/requests` Python paketinin `dae7ef63b4df6eded86637f251fc4e3a06c3b479`
commit'ine pinlenmiş bir kopyası var (`pip install -e .` ile kurulu, sanal ortam hazır).
Bu, büyük ve çok dosyalı bir kütüphane; görevin dar bir kapsamda kalıyor.

Görev: `src/requests/utils.py` dosyasındaki `guess_json_utf` fonksiyonunu **davranışını
değiştirmeden** refactor et — okunabilirliğini artır ve iç içe geçmiş if/elif yapısını
sadeleştir. Fonksiyon bir JSON baytının önündeki 4 baytlık örneğe (BOM ve null byte
sayımına) bakarak olası kodlamayı (`"utf-8"`, `"utf-16"`, `"utf-16-be"`, `"utf-16-le"`,
`"utf-32"`, `"utf-32-be"`, `"utf-32-le"`, `"utf-8-sig"` ya da `None`) tahmin ediyor.

Kurallar:

- Değişikliği yalnız `src/requests/utils.py` dosyasıyla sınırla; başka dosyaya dokunma.
- Fonksiyonun imzası (`def guess_json_utf(data: bytes) -> str | None`) ve dışa dönük
  davranışı birebir aynı kalmalı — aynı girdi için aynı çıktıyı üretmeli. İstersen
  fonksiyonu birden fazla küçük yardımcı fonksiyona bölebilir, mantığı yeniden
  düzenleyebilir, isim/yapı iyileştirebilirsin; önemli olan sonucun değişmemesi.
- Modülün başka hiçbir davranışını (diğer fonksiyonları, `_null`/`_null2`/`_null3`
  sabitlerini) bozma.

Bitirdiğinde depodaki `tests/test_utils.py` dosyasını (`pytest tests/test_utils.py`) çalıştır;
bu dosya `guess_json_utf` dahil `requests/utils.py` içindeki fonksiyonları kapsıyor ve
tamamen çevrimdışı çalışıyor (ağ erişimi gerektirmiyor). Refactor'dan önce de sonra da
tüm testler yeşil kalmalı.
