#!/usr/bin/env bash
set -u
DIR="${1:-.}"

fail() {
  echo "FAIL: $1"
  exit 1
}

SUITE_LOG=""
REPRO_JS=""
REPRO_LOG=""

cleanup() {
  [ -n "$SUITE_LOG" ] && rm -f "$SUITE_LOG"
  [ -n "$REPRO_JS" ] && rm -f "$REPRO_JS"
  [ -n "$REPRO_LOG" ] && rm -f "$REPRO_LOG"
}
trap cleanup EXIT HUP INT TERM

cd "$DIR" 2>/dev/null || fail "çalışma dizinine girilemedi: $DIR"
[ -f index.js ] || fail "index.js yok (depo dosyaları eksik)"
[ -d test ] || fail "test dizini yok"

command -v node >/dev/null 2>&1 || fail "node bulunamadı"
command -v npm >/dev/null 2>&1 || fail "npm bulunamadı"

if [ ! -d node_modules ]; then
  npm install --no-audit --no-fund --quiet || fail "npm install başarısız"
fi

SUITE_LOG="$(mktemp)"
npm test >"$SUITE_LOG" 2>&1
if [ $? -ne 0 ]; then
  tail -n 60 "$SUITE_LOG"
  fail "depodaki mevcut test takımı kırmızı"
fi

if command -v pwd >/dev/null 2>&1 && pwd -W >/dev/null 2>&1; then
  INDEX_PATH="$(pwd -W)/index.js"
else
  INDEX_PATH="$(pwd)/index.js"
fi

REPRO_JS="$(mktemp --suffix=.js)"
cat > "$REPRO_JS" << EOF
var matter = require('$INDEX_PATH');
var fixture = '---\r\nabc: xyz\r\n---\r\ncontent here\r\n';
var res = matter(fixture);
var expected = 'content here\r\n';
if (res.content !== expected) {
  console.error('beklenmeyen content: ' + JSON.stringify(res.content) + ' (beklenen: ' + JSON.stringify(expected) + ')');
  process.exit(1);
}
EOF

REPRO_LOG="$(mktemp)"
node "$REPRO_JS" >"$REPRO_LOG" 2>&1
if [ $? -ne 0 ]; then
  cat "$REPRO_LOG"
  fail "CRLF front-matter reprodüksiyonu hâlâ kırmızı"
fi

echo "PASS: mevcut test takımı yeşil ve CRLF front-matter reprodüksiyonu düzeldi"
exit 0
