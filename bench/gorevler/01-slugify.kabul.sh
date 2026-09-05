#!/usr/bin/env bash
set -u
DIR="${1:-.}"

fail() {
  echo "FAIL: $1"
  exit 1
}

cd "$DIR" 2>/dev/null || fail "çalışma dizinine girilemedi: $DIR"
[ -f index.js ] || fail "index.js yok"
[ -f test.js ] || fail "test.js yok (depo dosyaları eksik)"
[ -f package.json ] || fail "package.json yok"

npm install --no-audit --no-fund --silent >/tmp/slugify-kabul-install.log 2>&1
if [ $? -ne 0 ]; then
  fail "npm install başarısız, bkz /tmp/slugify-kabul-install.log"
fi

npx --yes ava test.js >/tmp/slugify-kabul-ava.log 2>&1
if [ $? -ne 0 ]; then
  fail "depodaki mevcut test takımı (test.js) kırmızı, bkz /tmp/slugify-kabul-ava.log"
fi

cat > ./.kabul-extra.mjs << 'EOF'
import slugify, {slugifyWithCounter} from './index.js';

const cases = [
  ['Café résumé naïve', 'cafe-resume-naive'],
  ['İstanbul’dan Ankara’ya', 'istanbul-dan-ankara-ya'],
  ['Ελληνικά γράμματα', 'ellinika-grammata'],
  ['Москва слезам не верит', 'moskva-slezam-ne-verit'],
  ['한국어 테스트', ''],
  ['éclair', 'eclair'],
  ['Ñoño & Piñata', 'nono-and-pinata'],
  ['___multi___underscore___', 'multi-underscore'],
];

let ok = true;
for (const [input, expected] of cases) {
  const got = slugify(input);
  if (got !== expected) {
    console.error(`slugify(${JSON.stringify(input)}) => ${JSON.stringify(got)}, beklenen ${JSON.stringify(expected)}`);
    ok = false;
  }
}

const counter = slugifyWithCounter();
const c1 = counter('baz qux');
const c2 = counter('baz qux');
counter.reset();
const c3 = counter('baz qux');
if (c1 !== 'baz-qux' || c2 !== 'baz-qux-2' || c3 !== 'baz-qux') {
  console.error(`slugifyWithCounter sırası yanlış: ${c1}, ${c2}, ${c3}`);
  ok = false;
}

process.exit(ok ? 0 : 1);
EOF

node ./.kabul-extra.mjs >/tmp/slugify-kabul-extra.log 2>&1
EXTRA_STATUS=$?
rm -f ./.kabul-extra.mjs
if [ $EXTRA_STATUS -ne 0 ]; then
  cat /tmp/slugify-kabul-extra.log
  fail "ek Unicode kenar durum savları kırmızı"
fi

echo "PASS: test.js yeşil ve ek Unicode kenar durum savları geçti"
exit 0
