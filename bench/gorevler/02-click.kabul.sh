#!/usr/bin/env bash
set -u
DIR="${1:-.}"

fail() {
  echo "FAIL: $1"
  cleanup
  exit 1
}

VENV=""
SUITE_LOG=""
REPRO_PY=""
REPRO_LOG=""

cleanup() {
  [ -n "$SUITE_LOG" ] && rm -f "$SUITE_LOG"
  [ -n "$REPRO_PY" ] && rm -f "$REPRO_PY"
  [ -n "$REPRO_LOG" ] && rm -f "$REPRO_LOG"
  [ -n "$VENV" ] && rm -rf "$VENV"
}

cd "$DIR" 2>/dev/null || fail "çalışma dizinine girilemedi: $DIR"
[ -d src/click ] || fail "src/click yok (depo dosyaları eksik)"
[ -d tests ] || fail "tests dizini yok"

BASE_PY=python
command -v python >/dev/null 2>&1 || BASE_PY=python3
command -v "$BASE_PY" >/dev/null 2>&1 || fail "python bulunamadı"

VENV="$(mktemp -d)/click-kabul-venv"
"$BASE_PY" -m venv "$VENV" || fail "geçici venv oluşturulamadı"

if [ -x "$VENV/bin/python" ]; then
  PY="$VENV/bin/python"
else
  PY="$VENV/Scripts/python.exe"
fi
[ -x "$PY" ] || fail "geçici venv'de python bulunamadı"

"$PY" -m pip install --quiet -e . || fail "click, düzenlenebilir kurulum olarak içe aktarılamadı"
"$PY" -m pip install --quiet "pytest==9.0.2" || fail "pytest==9.0.2 kurulamadı"

SUITE_LOG="$(mktemp)"
"$PY" -m pytest -q tests \
  --deselect tests/test_termui.py::test_get_pager_file_nullpager_keeps_stringio_stream \
  >"$SUITE_LOG" 2>&1
if [ $? -ne 0 ]; then
  tail -n 40 "$SUITE_LOG"
  fail "depodaki mevcut test takımı kırmızı"
fi

REPRO_PY="$(mktemp --suffix=.py)"
cat > "$REPRO_PY" << 'EOF'
from click import command, echo_via_pager
from click.testing import CliRunner

@command()
def cli():
    echo_via_pager("Hello, Click!")

runner = CliRunner()
result = runner.invoke(cli)

if result.exception is not None:
    raise SystemExit(f"exception: {result.exception!r}")
if result.output != "Hello, Click!\n":
    raise SystemExit(f"beklenmeyen çıktı: {result.output!r}")
EOF

REPRO_LOG="$(mktemp)"
"$PY" "$REPRO_PY" >"$REPRO_LOG" 2>&1
if [ $? -ne 0 ]; then
  cat "$REPRO_LOG"
  fail "echo_via_pager + CliRunner reprodüksiyonu hâlâ kırmızı"
fi

echo "PASS: mevcut test takımı yeşil ve echo_via_pager reprodüksiyonu düzeldi"
cleanup
exit 0
