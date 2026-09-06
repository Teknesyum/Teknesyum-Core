# Teknesyum Core

The plugin lives in `core/`, its hooks in `core/hooks/`, its scripts in `core/scripts/`.
Tests: `npm test`. Bench: `bench/run.js`, results in `bench/rapor.md`.

Handoff between machines: when the user says `devam` and `docs/devir.md` exists, read it
first, run `docs/devir.ps1` with `powershell -NoProfile -ExecutionPolicy Bypass -File`,
show its output, then follow the note's `next_action`. When that note is spent, move
`docs/devir.md` and `docs/devir.ps1` to `trash/` and commit.

Internal papers under `docs/` are Turkish; README and repository documents are English.
