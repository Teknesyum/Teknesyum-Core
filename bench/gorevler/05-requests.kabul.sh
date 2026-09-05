#!/usr/bin/env bash
set -u
DIR="${1:-.}"

fail() {
  echo "FAIL: $1"
  exit 1
}

VENV_ROOT=""
VENV=""
SUITE_LOG=""
REPRO_PY=""
REPRO_LOG=""

cleanup() {
  [ -n "$SUITE_LOG" ] && rm -f "$SUITE_LOG"
  [ -n "$REPRO_PY" ] && rm -f "$REPRO_PY"
  [ -n "$REPRO_LOG" ] && rm -f "$REPRO_LOG"
  [ -n "$VENV_ROOT" ] && rm -rf "$VENV_ROOT"
}
trap cleanup EXIT HUP INT TERM

cd "$DIR" 2>/dev/null || fail "çalışma dizinine girilemedi: $DIR"
[ -f src/requests/utils.py ] || fail "src/requests/utils.py yok (depo dosyaları eksik)"
[ -d tests ] || fail "tests dizini yok"
grep -q "def guess_json_utf" src/requests/utils.py || fail "guess_json_utf fonksiyonu utils.py içinde bulunamadı"

BASE_PY=python
command -v python >/dev/null 2>&1 || BASE_PY=python3
command -v "$BASE_PY" >/dev/null 2>&1 || fail "python bulunamadı"

VENV_ROOT="$(mktemp -d)"
VENV="$VENV_ROOT/requests-kabul-venv"
"$BASE_PY" -m venv "$VENV" || fail "geçici venv oluşturulamadı"

if [ -x "$VENV/bin/python" ]; then
  PY="$VENV/bin/python"
else
  PY="$VENV/Scripts/python.exe"
fi
[ -x "$PY" ] || fail "geçici venv'de python bulunamadı"

"$PY" -m pip install --quiet -e . || fail "requests, düzenlenebilir kurulum olarak içe aktarılamadı"
"$PY" -m pip install --quiet "pytest>=2.8.0,<10" || fail "pytest kurulamadı"

SUITE_LOG="$(mktemp)"
"$PY" -m pytest -q tests/test_utils.py >"$SUITE_LOG" 2>&1
if [ $? -ne 0 ]; then
  tail -n 40 "$SUITE_LOG"
  fail "tests/test_utils.py kırmızı"
fi

REPRO_PY="$(mktemp --suffix=.py)"
cat > "$REPRO_PY" << 'EOF'
import sys
sys.path.insert(0, "src")
from requests.utils import guess_json_utf

# Bu değerler pinlenen orijinal (dae7ef63b4df6eded86637f251fc4e3a06c3b479) koddan
# doğrudan çalıştırılarak elde edildi; refactor bu eşleşmeleri birebir korumalı.
cases = [
    (b"{}", "utf-8"),
    ("{}".encode("utf-32"), "utf-32"),
    ("{}".encode("utf-8-sig"), "utf-8-sig"),
    ("{}".encode("utf-16"), "utf-16"),
    ("{}".encode("utf-16-be"), "utf-16-be"),
    ("{}".encode("utf-16-le"), "utf-16-le"),
    ("{}".encode("utf-32-be"), "utf-32-be"),
    ("{}".encode("utf-32-le"), "utf-32-le"),
    (b"\x00\x00\x00\x00", None),
    ("﻿{}".encode("utf-16-be"), "utf-16"),
    ("﻿{}".encode("utf-32-le"), "utf-32"),
    (b"", "utf-8"),
    (b"a", "utf-8"),
    (b"ab", "utf-8"),
    (b"abc", "utf-8"),
    (b'{"a":1}', "utf-8"),
]

ok = True
for data, expected in cases:
    got = guess_json_utf(data)
    if got != expected:
        print(f"guess_json_utf({data!r}) => {got!r}, beklenen {expected!r}")
        ok = False

sys.exit(0 if ok else 1)
EOF

REPRO_LOG="$(mktemp)"
"$PY" "$REPRO_PY" >"$REPRO_LOG" 2>&1
if [ $? -ne 0 ]; then
  cat "$REPRO_LOG"
  fail "guess_json_utf davranış-koruma savları kırmızı"
fi

echo "PASS: tests/test_utils.py yeşil ve guess_json_utf davranışı korunmuş"
exit 0
