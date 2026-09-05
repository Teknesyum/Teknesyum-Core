#!/usr/bin/env bash
# Kabul: 06 — slugify CLI. Kol etiketi görmez; yalnız çalışma dizinini alır. 0 = geçti, 1 = kaldı.
set -u
DIR="${1:?çalışma dizini gerekli}"
cd "$DIR" || { echo "FAIL: dizin yok: $DIR"; exit 1; }

LOG_ROOT="$(mktemp -d)"
cleanup() { rm -rf "$LOG_ROOT"; }
trap cleanup EXIT HUP INT TERM

fail() { echo "FAIL: $*"; exit 1; }

command -v node >/dev/null 2>&1 || fail "node bulunamadı"
command -v npm >/dev/null 2>&1 || fail "npm bulunamadı"

npm install --no-audit --no-fund --silent >"$LOG_ROOT/install.log" 2>&1 \
  || fail "npm install başarısız, bkz $LOG_ROOT/install.log"

BIN="$(node -e 'const p=require("./package.json");const b=p.bin;if(!b){process.exit(3)};const v=typeof b==="string"?b:b.slugify;if(!v){process.exit(4)};process.stdout.write(v)' 2>/dev/null)" \
  || fail "package.json içinde bin.slugify yok"
[ -f "$BIN" ] || fail "bin hedefi yok: $BIN"
head -c 2 "$BIN" | grep -q '#!' || fail "bin dosyası shebang ile başlamıyor"

node -e 'const p=require("./package.json");const d=Object.keys(p.dependencies||{}).sort().join(",");if(d!=="@sindresorhus/transliterate,escape-string-regexp")process.exit(1)' \
  || fail "çalışma zamanı bağımlılıkları değişmiş"

run() { node "$BIN" "$@"; }

check() {
  local beklenen="$1"; shift
  local cikti
  cikti="$(run "$@" 2>>"$LOG_ROOT/stderr.log")"
  [ "$cikti" = "$beklenen" ] || fail "$* → '$cikti' (beklenen '$beklenen')"
}

check "hello-world" "Hello World"
check "hello_world" "Hello World" --separator _
check "foobar" "fooBar" --no-decamelize
check "Hello-World" "Hello World" --no-lowercase
check "_foo" "_foo" --preserve-leading-underscore
check "foo-" "foo-" --preserve-trailing-dash
check "unicorns-and-rainbows" "UNICORNS AND RAINBOWS"
check "i-love-dogs" "I ♥ Dogs"

STDIN_OUT="$(printf 'Foo Bar\n\nDéjà Vu!\n' | run 2>>"$LOG_ROOT/stderr.log")"
[ "$STDIN_OUT" = "$(printf 'foo-bar\ndeja-vu')" ] || fail "stdin çok satır → '$STDIN_OUT'"

run </dev/null >/dev/null 2>"$LOG_ROOT/empty.err"; KOD=$?
[ "$KOD" -eq 1 ] || fail "boş girdi çıkış kodu $KOD (beklenen 1)"
[ -s "$LOG_ROOT/empty.err" ] || fail "boş girdide stderr mesajı yok"

run --help >"$LOG_ROOT/help.out" 2>&1; KOD=$?
[ "$KOD" -eq 0 ] || fail "--help çıkış kodu $KOD"
grep -qi "separator" "$LOG_ROOT/help.out" || fail "--help bayrakları anlatmıyor"

run "x" --bilinmeyen-bayrak >/dev/null 2>"$LOG_ROOT/unknown.err"; KOD=$?
[ "$KOD" -eq 2 ] || fail "bilinmeyen bayrak çıkış kodu $KOD (beklenen 2)"

[ -f test-cli.js ] || fail "test-cli.js yok"
grep -q "cli.js" test-cli.js || fail "test-cli.js aracı çalıştırmıyor"
grep -q "^## CLI" readme.md || fail "readme.md içinde '## CLI' bölümü yok"

npx --yes ava test.js test-cli.js >"$LOG_ROOT/ava.log" 2>&1 \
  || { tail -20 "$LOG_ROOT/ava.log"; fail "ava kırmızı (test.js + test-cli.js)"; }

echo "PASS: CLI davranışları, bağımlılık sınırı, readme bölümü ve ava (test.js + test-cli.js) yeşil"
exit 0
