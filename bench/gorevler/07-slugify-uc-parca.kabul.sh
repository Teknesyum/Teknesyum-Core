#!/usr/bin/env bash
# Kabul: 07 — slugify üç parça. Kol etiketi görmez; yalnız çalışma dizinini alır. 0 = geçti, 1 = kaldı.
set -u
DIR="${1:?çalışma dizini gerekli}"
cd "$DIR" || { echo "FAIL: dizin yok: $DIR"; exit 1; }

LOG_ROOT="$(mktemp -d)"
cleanup() { rm -rf "$LOG_ROOT" "$DIR/.kabul-b.mjs" "$DIR/.kabul-c.mjs"; }
trap cleanup EXIT HUP INT TERM
fail() { echo "FAIL: $*"; exit 1; }

command -v node >/dev/null 2>&1 || fail "node bulunamadı"
command -v npm >/dev/null 2>&1 || fail "npm bulunamadı"
npm install --no-audit --no-fund --silent >"$LOG_ROOT/install.log" 2>&1 || fail "npm install başarısız"

node -e 'const p=require("./package.json");const d=Object.keys(p.dependencies||{}).sort().join(",");if(d!=="@sindresorhus/transliterate,escape-string-regexp")process.exit(1)' \
  || fail "çalışma zamanı bağımlılıkları değişmiş"

# --- A: CLI
BIN="$(node -e 'const b=require("./package.json").bin;const v=typeof b==="string"?b:(b&&b.slugify);if(!v)process.exit(3);process.stdout.write(v)' 2>/dev/null)" || fail "A: bin.slugify yok"
[ -f "$BIN" ] || fail "A: bin hedefi yok: $BIN"
head -c 2 "$BIN" | grep -q '#!' || fail "A: shebang yok"
runcli() { node "$BIN" "$@"; }
chk() { local b="$1"; shift; local o; o="$(runcli "$@" 2>>"$LOG_ROOT/err")"; [ "$o" = "$b" ] || fail "A: $* → '$o' (beklenen '$b')"; }
chk "hello-world" "Hello World"
chk "hello_world" "Hello World" --separator _
chk "foobar" "fooBar" --no-decamelize
chk "Hello-World" "Hello World" --no-lowercase
[ "$(printf 'Foo Bar\n\nDéjà Vu!\n' | runcli 2>>"$LOG_ROOT/err")" = "$(printf 'foo-bar\ndeja-vu')" ] || fail "A: stdin çok satır"
runcli </dev/null >/dev/null 2>"$LOG_ROOT/e1"; [ $? -eq 1 ] || fail "A: boş girdi çıkış kodu 1 değil"
[ -s "$LOG_ROOT/e1" ] || fail "A: boş girdide stderr mesajı yok"
runcli --help >"$LOG_ROOT/h" 2>&1; [ $? -eq 0 ] || fail "A: --help çıkış 0 değil"
grep -qi separator "$LOG_ROOT/h" || fail "A: --help separator anlatmıyor"
runcli x --bilinmeyen >/dev/null 2>&1; [ $? -eq 2 ] || fail "A: bilinmeyen bayrak çıkış 2 değil"
[ -f test-cli.js ] || fail "A: test-cli.js yok"
grep -q "^## CLI" readme.md || fail "A: readme '## CLI' yok"

# --- B: maxLength
cat >"$DIR/.kabul-b.mjs" <<'EOF'
import slugify, {slugifyWithCounter} from './index.js';
const eq = (a, b, m) => { if (a !== b) { console.error('B: ' + m + ' → ' + JSON.stringify(a) + ' (beklenen ' + JSON.stringify(b) + ')'); process.exit(1); } };
eq(slugify('foo bar baz', {maxLength: 7}), 'foo-bar', 'maxLength 7');
eq(slugify('foo bar baz', {maxLength: 6}), 'foo', 'maxLength 6');
eq(slugify('foo bar baz', {maxLength: 3}), 'foo', 'maxLength 3');
eq(slugify('foo bar baz'), 'foo-bar-baz', 'sınırsız varsayılan');
eq(slugify('foo bar baz', {maxLength: 8, separator: '_'}), 'foo_bar', 'separator ile');
const c = slugifyWithCounter();
eq(c('foo bar baz', {maxLength: 3}), 'foo', 'sayaç ilk');
eq(c('foo bar baz', {maxLength: 3}), 'foo-2', 'sayaç ikinci, ek sınıra dahil değil');
EOF
node "$DIR/.kabul-b.mjs" 2>"$LOG_ROOT/berr" || { cat "$LOG_ROOT/berr"; fail "B: maxLength davranışı"; }
grep -q "maxLength" index.d.ts || fail "B: index.d.ts maxLength yok"
[ -f test-maxlength.js ] || fail "B: test-maxlength.js yok"
grep -q "maxLength" readme.md || fail "B: readme maxLength yok"

# --- C: dil tabloları
cat >"$DIR/.kabul-c.mjs" <<'EOF'
import slugify from './index.js';
import {turkishReplacements, germanReplacements} from './overridable-replacements.js';
const eq = (a, b, m) => { if (a !== b) { console.error('C: ' + m + ' → ' + JSON.stringify(a) + ' (beklenen ' + JSON.stringify(b) + ')'); process.exit(1); } };
if (!Array.isArray(turkishReplacements) || !Array.isArray(germanReplacements)) { console.error('C: tablolar dizi değil'); process.exit(1); }
const has = (t, a, b) => t.some(p => p[0] === a && p[1] === b);
if (!has(turkishReplacements, 'ı', 'i') || !has(turkishReplacements, 'ğ', 'g') || !has(turkishReplacements, 'ş', 's')) { console.error('C: türkçe tablo eksik'); process.exit(1); }
if (!has(germanReplacements, 'ß', 'ss') || !has(germanReplacements, 'ö', 'oe') || !has(germanReplacements, 'ü', 'ue')) { console.error('C: almanca tablo eksik'); process.exit(1); }
eq(slugify('Ölçü birimi', {customReplacements: turkishReplacements}), 'olcu-birimi', 'türkçe ö/ü');
eq(slugify('İstanbul Şişli', {customReplacements: turkishReplacements}), 'istanbul-sisli', 'türkçe');
eq(slugify('Ölçü'), 'oelcue', 'tablo verilmeden varsayılan');
eq(slugify('Straße Köln', {customReplacements: germanReplacements}), 'strasse-koeln', 'almanca');
eq(slugify('Hællæ, hva skjera?'), 'haellae-hva-skjera', 'varsayılan değişmedi');
EOF
node "$DIR/.kabul-c.mjs" 2>"$LOG_ROOT/cerr" || { cat "$LOG_ROOT/cerr"; fail "C: tablo davranışı"; }
[ -f test-replacements.js ] || fail "C: test-replacements.js yok"
grep -q "^## Language tables" readme.md || fail "C: readme '## Language tables' yok"

npx --yes ava test.js test-cli.js test-maxlength.js test-replacements.js >"$LOG_ROOT/ava.log" 2>&1 \
  || { tail -20 "$LOG_ROOT/ava.log"; fail "ava kırmızı"; }

echo "PASS: A (CLI), B (maxLength), C (dil tabloları) ve ava dört dosyada yeşil"
exit 0
