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

## D7 — Constants are written by a script, not by the model

A token audit of D6 found the gate itself cheap and the thing it guards expensive. Blocking
a bad README costs one message; making the model *produce* the license text costs 8–10k
output tokens at output prices, every repository, forever. The same holds for the signature
block, the badge SVGs and the language link — text that never varies between projects.

So they left the model's output path. `scripts/scaffold.js` writes them:

```
license [--spdx <id>]   copy the license text, set the license field
signature [--file F]    append the signature block, copy its assets
langlink                link README.md and README.tr.md to each other
```

`prefs.md` also split into one file per subject with a `doc` field on each rule, so writing
a README no longer loads the license rules. The diagram question became an `ask` line: the
hook asks once, the answer is written to `docs/diagram.md` in the repository, and it never
asks again there.

What the model still writes is the part that differs per project — the prose.

---

## D8 — Model tiering

**The cell is data. Signals raise it, the profile caps it, and three roles are exempt from
the cap. Nothing lowers it.**

A single base per role was too coarse: the same builder is waste on a rename and too thin on
a refactor, and the user's profile should move the whole grid, not clip its top. So the tier
became a table of cells, `core/tiers.json`, resolved in one place:

```bash
node <P>/scripts/contract.js tier --role builder --profile eco --id T7
```

Cell is `model/effort`. Bold cells pierce the profile ceiling.

| Row | eco | normal | premium |
|---|---|---|---|
| T0 (advice only, not forced) | sonnet | opus | opus |
| planner | sonnet/medium | opus/medium | opus/high |
| builder | sonnet/low | sonnet/medium | opus/medium |
| ui-builder | sonnet/low | sonnet/medium | opus/medium |
| scribe | haiku/low | haiku/low | sonnet/low |
| scout | haiku/low | sonnet/low | sonnet/medium |
| auditor | **opus/medium** | opus/medium | opus/high |
| advisor | **opus/high** | opus/high | **fable/high** |

Search subagents are not roles: `haiku/low` in every profile, fixed. The plan council is
1 member on eco, 2 on normal, 3 on premium — two opus planners and one fable planner, each
working independently and unaware of the others. There is no fable *pass* over finished
plans: showing one planner another's work is the same leak the blinding rule forbids.
Resolve it with `contract.js council --profile premium`.

**Four signals, on top of the risk gate.** All four are computed, never declared:

1. The same verify step failed twice with the same signature → `effort` +1; a third time
   → `model` +1.
2. `round >= 3` → the builder's model +1.
3. `round >= 4` → the advisor opens **before** the next attempt.
4. An irreversible operation — migration, release, history rewrite, detected by
   `risk.js` from the owned paths and the verify commands — opens the auditor whatever
   the profile says.

**Why the ceiling is pierced.** The profile is a budget, and a budget that silently buys a
weaker auditor is not saving money, it is removing the check that the money was spent well.
Every role the risk gate opens is therefore exempt from the ceiling: `auditor`, `advisor`,
and a `builder`/`ui-builder` that a signal has raised. On eco a risk-raised builder goes to
opus; it does not stop at `sonnet/high`. The user decided this: eco is for ordinary work,
and work that tripped the gate is not ordinary work.

**Advisor is exempt outright.** A second opinion that is cheaper than the first opinion is
not a second opinion. Eco opens opus like everyone else.

**The advisor must run a different model than the asker.** `advisorModelGap` is the whole
rule: if the resolved advisor cell equals the asker's model, the advisor **does not open**
and `contract.js tier` exits 2 with the reason. The question goes to the user, or the
profile is raised so the cell lands elsewhere. A fake second opinion is not bought. This is
why premium's advisor is `fable/high` alone and no longer a double cell: on premium the
asker is opus, opus already decides as T0 and already audits irreversible work, so a second
opus adds cost and no new angle. On normal the advisor's real customer is a stuck sonnet
builder — sonnet → opus is a genuine upgrade — and a normal opus T0 gets no advisor at all.

**Blinding.** The advisor is given the contract's Goal and Acceptance, the raw evidence and
the file paths. It is not given the draft decision or the history of earlier attempts; an
opinion that has already seen the answer is a review, not an opinion.

**Frequency, in force now.** On premium the advisor opens alongside every `builder` and
`ui-builder` contract — same message, in parallel with that agent, never a serial step.
`scribe` and `scout` are exempt. One opening per contract by default; signals may add more.
Work T0 does without a contract is not a hole: if it trips a `risk.js` signal — irreversible
operation, protected path, new dependency — the advisor opens there too. Computed, never
declared.

**Three structural locks.** Exemption without a limit is just a higher ceiling, so each
exempt role is fenced:

- **Tool set** — the auditor reads and runs, never writes; one written file voids the
  audit and the gate rejects the record (D5). The advisor writes no file at all.
- **Output ceiling** — the advisor returns three headings and at most twenty lines. An
  expensive model on a bounded output is a bounded cost.
- **Quota** — on eco, at most 1 advisor opening per contract and 3 per relay.
  `contract.js` counts them from the `live/` records and blocks the overflow. Normal and
  premium have no quota.

`xhigh` and `max` effort are never granted automatically. They exist only on the user's
explicit request.

**Cost class.** `tiers.json` is **Z** — a file the resolver reads, never the model.
Role frontmatter is **O**, two lines, paid once by the agent that holds the role. The
display is **Z**: `statusline.js` prints the profile and `builder·sonnet/low` from the
agent's `live/` record. Per-turn injection stays **0**.

*Fable's objection, rejected:* "the Task tool may not be able to pass a model, so the tier
would have to be encoded as separate agent definitions." It can. The `Agent` tool takes a
`model` parameter that takes precedence over the agent definition's frontmatter — verified
against the live tool contract. Splitting one agent into a tier per model would reinstate
the class **S** cost D3 removed.

*Fable's two open points, recorded:*

- Eco ceiling-piercing was left ambiguous — "is an eco builder raised to opus, or to
  `sonnet/high`?" Settled by the user: opus.
- The cost ratios behind the grid are estimates. They are to be checked against the first
  real relay run, and the grid revised there rather than argued here.
- Divergence between the advisor and the asker has no referee, and no cross-examination
  round is built: a second round would mostly buy an agreement, not a truth. A factual,
  testable divergence is settled by verification, not by more opinion — run the command and
  read the exit code. What stays genuinely open is presented to the user unarbitrated.

---

## D9 — Agent language

Every artifact an agent reads or writes is English: contract bodies, agent prompts,
reports, checkpoints, `_issues.log`. Contract frontmatter, role files, `map.md`, `live/`
and `tiers.json` were already English; what changes is T0's writing habit. Turkish keeps
exactly one channel: T0's chat with the user.

**Cost.** A contract body of ~2,500 output tokens in Turkish is ~1,700 in English. Output
is priced ~5× input, so the saving is worth roughly 4k input-equivalent tokens per
contract. Agent reports shrink ~40%, and unlike the body a report stays in T0's context
for the rest of the relay, so the saving is paid once and collected on every later turn.

**Approval fidelity.** The user no longer approves the contract; they approve T0's Turkish
summary of it. A summary that drops an acceptance item makes the user approve something
else. Rule: the summary lists the contract's `## Acceptance` items one for one, unabridged.
`## Goal` and the work list may be summarised; `## Acceptance` may not.

**`_issues.log` format.** Lines stay short and templated —
`<contract> | <role> | <what was sought> | <what was missing> | <what was done>`.
No prose. The user opens that file without T0.

The numbers above are unmeasured estimates. They are to be checked against the first real
relay run and corrected here.

## D10 — Cues, not injections

A statusline is **Z**: the user sees it, the model never does. So a relay left half-open
across a session boundary is invisible to the model, and the next unrelated request walks
over a contract someone else owns. Compaction is worse — the summary dissolves the contract
IDs and the model starts inventing what is still open.

One hook, `cue.js`, answers two events and nothing else writes context:

- `SessionStart` — silent unless `contracts/*.md` or an unended, unstale `live/` record
  exists. Output is one English line: the relay path first, then contract IDs and live
  roles. Never the goal, the acceptance list or the route.
- `UserPromptSubmit` — silent unless the prompt matches `(log|günlük) (yaz|tut)\w*`. Then
  it points at `scripts/log.js`; the file body is written by that script, not by the model.

Cap 200 characters, enforced in code and asserted in `test/all.js`. The rejected
alternatives were a dedicated skill (~25 tok in every context and every subagent) and a
line in the user's `CLAUDE.md` (the same rent, in every project) — both class **S** rent
for a capability used a few times a month.

Bug logs land in `logs/openlogs/`, which is `.gitignore`d: they are the user's Turkish
working notes and this repo publishes in English.

### What the audit changed

An outside review (fable) plus a check of the hook documentation broke four things:

**`PostCompact` was dead.** The event exists, but plain stdout is injected into context on
only three events — `SessionStart`, `UserPromptSubmit`, `UserPromptExpansion`. Everywhere
else stdout goes to the debug log and the model never sees it. The compaction cue was
working only by accident, because `SessionStart` also fires after compaction with
`source: "compact"`. The registration and the branch are gone; `SessionStart` covers it.

**Silence leaked.** `watch.js` only swept `live/` once 40 files had piled up, so below that
a crashed agent's record was immortal and every later session announced `live: builder`
forever. There was no `SessionEnd` handler either — Base had one and Core had dropped it.
Now `SessionEnd` closes every unended record, the sweep ages records out at any count, and
`cue.js` independently ignores any record untouched for 12 hours. Two locks, because the
first one depends on a hook that a killed process never fires.

**Truncation ate the instruction.** `read .claude/relay/` was pushed last, so the 200-char
slice cut the only actionable sentence and left bare IDs. It is now first: eight contracts
and six roles truncate the list, never the instruction.

**The positive path had no test.** Every assertion was about silence; nothing proved the
line's content, its cap, or that it carries no contract body. It does now, including the
stale-record and crowded-relay cases.

Accepted knowingly: the cue points only at `.claude/relay/`. Work tracked in a document
outside that tree is not named. Adding a second search path costs a directory scan at every
session start to serve a convention that is this repository's, not the plugin's.

**Open question.** `SessionStart` earns nothing if the user always opens with "devam",
since the relay skill then reads `contracts/` anyway. The measurement is offline and costs
nothing per turn: grep the session transcripts under `~/.claude/projects/<project>/*.jsonl`
for whether a read of `.claude/relay/contracts` happens in the first few tool calls, and
whether the opening prompt already said "devam". Two weeks of transcripts give fired,
useful and redundant counts. If useful stays near zero, drop the event.

---

---

## Standing law

No feature may write to `additionalContext` or `systemMessage` on an ordinary turn.
No feature may require the model to print a banner. See `COST-MODEL.md`.
