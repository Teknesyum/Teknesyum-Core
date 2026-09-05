#!/usr/bin/env bash
set -u
DIR="${1:-.}"

fail() {
  echo "FAIL: $1"
  exit 1
}

INSTALL_LOG=""
SUITE_LOG=""
BEHAVIOR_MJS=""
BEHAVIOR_LOG=""

cleanup() {
  [ -n "$INSTALL_LOG" ] && rm -f "$INSTALL_LOG"
  [ -n "$SUITE_LOG" ] && rm -f "$SUITE_LOG"
  [ -n "$BEHAVIOR_MJS" ] && rm -f "$BEHAVIOR_MJS"
  [ -n "$BEHAVIOR_LOG" ] && rm -f "$BEHAVIOR_LOG"
}
trap cleanup EXIT HUP INT TERM

cd "$DIR" 2>/dev/null || fail "çalışma dizinine girilemedi: $DIR"
[ -f index.js ] || fail "index.js yok"
[ -f test.js ] || fail "test.js yok (depo dosyaları eksik)"
[ -f package.json ] || fail "package.json yok"

INSTALL_LOG="$(mktemp)"
npm install --no-audit --no-fund --silent >"$INSTALL_LOG" 2>&1
if [ $? -ne 0 ]; then
  cat "$INSTALL_LOG"
  fail "npm install başarısız"
fi

SUITE_LOG="$(mktemp)"
node --test test.js >"$SUITE_LOG" 2>&1
if [ $? -ne 0 ]; then
  tail -n 60 "$SUITE_LOG"
  fail "depodaki mevcut test takımı (test.js) kırmızı"
fi

# Davranış-değişmedi savı: pinlenen commit'teki orijinal wrapAnsi ile gerçekten üretilmiş
# çıktılar. index.js'i import edip aynı girdilerle karşılaştırıyoruz; uydurma değer yok.
BEHAVIOR_MJS="./.kabul-behavior.mjs"
cat > "$BEHAVIOR_MJS" << 'EOF'
import wrapAnsi from './index.js';

const ESC = '';

const cases = [
  [`${ESC}[31mred foreground text wraps here${ESC}[39m and continues plain`, 15, {}, "[31mred foreground[39m\n[31mtext wraps here[39m\nand continues\nplain"],
  [`${ESC}[41mbg text that is long enough to wrap across rows${ESC}[49m plain`, 12, {}, "[41mbg text that[49m\n[41mis long[49m\n[41menough to[49m\n[41mwrap across[49m\n[41mrows[49m plain"],
  [`${ESC}[58;5;9munderline colored text spanning several words${ESC}[59m tail`, 14, {}, "[58;5;9munderline[59m\n[58;5;9mcolored text[59m\n[58;5;9mspanning[59m\n[58;5;9mseveral words[59m\ntail"],
  [`${ESC}[1mbold${ESC}[0m and ${ESC}[4munderline${ESC}[24m text that wraps over multiple short rows`, 10, {}, "[1mbold[0m and\n[4munderline[24m\ntext that\nwraps over\nmultiple\nshort rows"],
  [`${ESC}[31m${ESC}[41mfg and bg together wrap over rows${ESC}[0mtail plain text`, 12, {}, "[31m[41mfg and bg[49m[39m\n[31m[41mtogether[49m[39m\n[31m[41mwrap over[49m[39m\n[31m[41mrows[0mtail\nplain text"],
];

let ok = true;
for (const [input, columns, options, expected] of cases) {
  const got = wrapAnsi(input, columns, options);
  if (got !== expected) {
    console.error(`wrapAnsi(${JSON.stringify(input)}, ${columns}) =>`);
    console.error(`  got:      ${JSON.stringify(got)}`);
    console.error(`  expected: ${JSON.stringify(expected)}`);
    ok = false;
  }
}

process.exit(ok ? 0 : 1);
EOF

BEHAVIOR_LOG="$(mktemp)"
node "$BEHAVIOR_MJS" >"$BEHAVIOR_LOG" 2>&1
if [ $? -ne 0 ]; then
  cat "$BEHAVIOR_LOG"
  fail "SGR sıfırlama davranışı pinlenen commit'teki orijinal çıktıdan farklı"
fi

echo "PASS: test.js yeşil (80 test) ve SGR sıfırlama davranışı değişmedi"
exit 0
