#!/usr/bin/env bash
# Teknesyum Core
# Install:  curl -fsSL https://raw.githubusercontent.com/Teknesyum/Teknesyum-Core/v0.11.0/install.sh | bash
set -e

REPO="Teknesyum/Teknesyum-Core"
CFG="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"

printf '\n  Teknesyum Core\n\n'

if ! command -v claude >/dev/null 2>&1; then
  printf '  Claude Code not found. Install it first, then run this again.\n'
  exit 1
fi

printf '  [1/3] Adding the marketplace...\n'
claude plugin marketplace add "$REPO"

printf '  [2/3] Installing the plugin...\n'
claude plugin install teknesyum-core@teknesyum

printf '  [3/3] Setup...\n'
if ! command -v node >/dev/null 2>&1; then
  printf '  Node.js missing. Install it, then run the setup script from the installed plugin.\n'
  exit 0
fi

SETUP=""
for BASE in "$CFG/plugins/cache/teknesyum/teknesyum-core" "$CFG/plugins/teknesyum/teknesyum-core"; do
  [ -d "$BASE" ] || continue
  VER="$(ls -1 "$BASE" 2>/dev/null | grep -E '^[0-9]+\.[0-9]+\.[0-9]+$' | sort -t. -k1,1n -k2,2n -k3,3n | tail -1)"
  [ -n "$VER" ] || continue
  if [ -f "$BASE/$VER/scripts/setup.js" ]; then
    SETUP="$BASE/$VER/scripts/setup.js"
    break
  fi
done

if [ -n "$SETUP" ]; then
  node "$SETUP"
  printf '\n  Restart Claude Code.\n'
else
  printf '  Installed plugin not found on disk.\n'
  printf '  Paste the setup block from the README to Claude instead.\n'
fi
