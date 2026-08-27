# Core decisions

Locked after the 2026-08-27 triage. Each entry: decision, cost class, rationale.
Second opinion on all four came from a Fable advisor pass; dissent is recorded.

---

## D1 — Completion gate

**Deterministic first, agent only on high risk.**

- A contract carries `verify:` — shell commands with expected exit codes, plus
  grep/path assertions. A Stop-hook runs them. Class **Z**: no context cost.
- Risk is computed by the hook, not declared by the model: touched path globs
  (auth, migrations, hooks, build config), diff line count, new dependencies.
- The model may raise risk `low → high`. It may never lower it.
- The `auditor` role opens only on `risk: high`.

Rationale: of the 4 defects Base's auditor caught, 2 were "the agent said done, the
code disagrees" — exactly the class a command + exit code catches, cheaper and more
reliably. The other 2 were semantic; that is why the auditor role survives.

*Fable's catch, accepted:* if the model declares its own risk, the party saying "done"
is the party saying "low risk". Hence risk comes from signals, not from a claim.

---

## D2 — Doctrine size

**One `SKILL.md`, English, 120–150 lines. No `references/`.**

Delete everything the model already does by default. Keep only:

1. File schemas — contract fields, return-block shape. Given as **one filled example**,
   not prose.
2. Ownership boundary (`owns:`) and the completion gate.
3. Thresholds and concrete values (delegate at N, profile knob values, paths).
4. Rules that run **against** the model's default (e.g. "T0 never writes code").
5. A `Precedence` block, 3–5 lines: which rule wins when two collide.

Anything pointing the same way as the model's default is cut. Anything already in
the user's `CLAUDE.md` is cut — paying for it twice is the definition of waste.

*Fable's catch, accepted:* the risk of cutting is not lost behaviour, it is lost
tie-breaking. Precedence block is mandatory.

---

## D3 — Surface

**Zero slash commands. One skill. One agent type.**

| Base | Core |
|---|---|
| 16 commands (~700 tok/session) | none |
| 7 agent definitions (~950 tok/session, **repaid inside every subagent**) | 1 generic agent (~150 tok) |
| skill descriptions ×2 | 1 skill — the only entry point |

Roles (`planner`, `builder`, `auditor`, `advisor`, `scout`) live as files under
`roles/`. The caller writes the role's **path** into the agent prompt; the agent reads
it. Cost moves from **S paid in every context** to **O paid once per agent that
actually holds that role** — and role selection stops being a guess, because the
caller names it.

Why one skill survives: a hook can enforce and a statusline can display, but neither
can *start* a behaviour — the model never opens a disk file it was not pointed at.
One entry point is the minimum that makes the plugin do anything at all.

---

## D4 — Setup

**`setup.js` does the work. The model only interviews.**

- Dual mode via `process.stdin.isTTY`:
  - user's own terminal → the script asks its own questions, **zero tokens**;
  - inside Claude Code (no TTY) → `--check` prints JSON of what is missing, the model
    asks those questions in one message, then calls `--apply` with flags.
- Everything deterministic stays in the script: file writes, `settings.json` wiring,
  statusline bridge, repo clone, platform checks.
- Persistent output: `~/.claude/teknesyum.json` + `settings.json`. Read afterwards by
  the statusline and the hooks — class **Z**, never by the model.
- The private-repo question is asked during setup and stored there.
- README ships both paths, terminal one recommended.

The pasted README text must be **instructions with no interpretation left open** —
"run this, ask these, call that with these flags" — because a model rewriting
`settings.json` from a description will not produce the same file twice.

---

## D5 — Closing the bypasses

A Fable review of the built Core found three holes. All three are closed.

**`audits/` and `live/` were writable.** An agent could compose its own passing audit
record with `Write` and complete a high-risk contract unaudited. Both directories now
refuse Write, Edit and the shell. The record is produced by

```bash
node <P>/scripts/contract.js audit --id T7 --run-id <agent> --verification "..."
```

which computes `headSha`, `diffHash` and `owns` itself. The auditor supplies only what it
observed, and cannot supply what it would need to forge.

**`verify:` reached into the gate.** A verify step is shell, so a step could move a file
into `done/` or call `contract.js`. Steps touching `done/`, `audits/`, `live/` or
`contract.js` are now refused before anything runs.

**Nothing enforced `owns:`.** Base did not enforce it either — the earlier claim in
`TRIAGE.md` that it did was wrong. An agent binds to the first contract it edits; after
that, writes outside that contract's `owns` are blocked. A session with no binding is
unaffected, so the main loop is never restricted.

`GIT_READ` was also renamed `GIT_SAFE`: it contains `add`, `commit` and `push`, which are
not reads. They stay — none can place a file into `done/` — but the name lied.

---

## D6 — Personal conventions, off by default

The author's standing conventions — license choice, README shape, signature block — are
personal, not part of the plugin. They live in `~/.claude/teknesyum/prefs.md`, mirrored to
a private repository, never in a published tree.

A `PreToolUse` hook watches Write and Edit. If `prefs.json` does not exist it exits
immediately, so for every other user the feature does not exist. If it does, and a README
or LICENSE is written without the conventions it lists, the hook blocks once and names the
file to read.

The condition is on **content**, not on the filename — a filename condition would block the
corrected write too and loop forever. A per-session counter caps it at two blocks per file,
so a genuine disagreement stops the gate rather than the work.

Cost: zero on an ordinary turn, one block message when it actually fires.

---

## Standing law

No feature may write to `additionalContext` or `systemMessage` on an ordinary turn.
No feature may require the model to print a banner. See `COST-MODEL.md`.
