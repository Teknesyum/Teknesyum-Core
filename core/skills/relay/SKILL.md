---
name: relay
description: Split work into gated contracts and run them with agents. Use whenever a change touches two or more files or needs a design choice, even inside one small package; only a single-file fix with no design choice is done directly. Independent parts run as parallel contracts to cut wall time.
---

# Relay

You are T0: split work, open agents, close contracts. Once a relay exists you stop writing
product code yourself. `<P>` is this plugin's root.

## Precedence

1. A gate that blocks — fix the cause, never route around it.
2. The user's instruction this turn.
3. This file.
4. Your judgement.

Report a broken rule; do not hide one.

## Size

| Signal | Do |
|---|---|
| One file, no design choice | Do it yourself, no relay |
| Two or more files, or a real design choice | One contract, one builder |
| Independent parts | One contract each, in parallel |
| From scratch, nothing read yet | scout first — the gate blocks otherwise |
| The answer is a number, not a change | scout — a measurement is not builder work |

## Contract

Frontmatter as in the dispatch template below. Under it: `## Goal` in one sentence,
`## Acceptance` as bullets, `## Checkpoint` only when a blocker has to be recorded.

Enforced, not advised:

- `owns:` lists files, not directories. Links cannot escape the checkout.
- `verify:` entries must exit 0. An empty list requires `verification-mode: manual`,
  `manual-reason:` and `## Acceptance` of at least 40 characters each, plus independent audit.
  Verify may not touch `done/`, `audits/`, `live/`, or call `contract.js`.
- `status:` climbs `open → active → submitted → done`; only the CLI writes terminal states.
  `blocked` must return to `open` or `active` before submission. `blocked-by: [T3]` requires
  committed success, not an unmet/adopted archive; `list --ready` shows unblocked contracts.
- Closure refuses overlapping open ownership and Git-visible dirty/untracked files outside
  `owns`, including docs; relay metadata and generated `.claude/map.md` / `.claude/map.json` are excluded.
- Binding happens at dispatch, from the contract path in the prompt. Bound agents cannot
  switch contracts or widen `owns`; a blocker goes in the return, not in the file.

## Layout

```
.claude/relay/
  PLAN.md              projects from scratch only
  contracts/<ID>.md    open work
  contracts/done/      closed; only contract.js writes here
  audits/  live/       gate-owned; Write/Edit are refused, shell is not sandboxed
  map.md               import graph, generated
```

`<ID>` is letters + digits: `T1`, `UI3`, `FIX12`. Before opening source, `node
<P>/scripts/map.js` writes `map.md` — hubs, cycles, orphans, edges; regenerate after a refactor.

## Closing

When a bound `builder`/`ui-builder` stops, `SubagentStop` runs `submit` then `complete`
detached and writes the verdict to `.claude/relay/live/_kapanis/<ID>.json` - read that, do not
close by hand. A red verify leaves the contract `submitted` with the reason there; nothing
retries. The manual path stays for what the hook does not cover, an auditor round among them:

```bash
node <P>/scripts/contract.js check --id T7      # risk and verify steps, no side effect
node <P>/scripts/contract.js complete --id T7   # runs verify, gates, moves to done/
```

Risk comes from the diff since the merge-base, not from a claim: sensitive paths (auth,
migrations, hooks, CI, dependency and settings files), more than 8 changed files, or more than
300 changed lines mean **high**. A contract may escalate with `risk: high`, never lower itself.
High risk needs a version-2 audit. Dispatch the auditor with its role and exact contract path.
Wait for its result and SubagentStop, requiring `verdict: passed` and `findings: none`.
Then the coordinator runs `audit --id T7 --run-id <child-id> --verification "<evidence>"`
with `node <P>/scripts/contract.js`, followed by `complete --id T7`.

Changed review inputs require a new review. After I/O failure, retry the same closure with
unchanged inputs; conflicting journals require manual reconciliation. Metadata is not a
same-user security boundary. Details: repository `docs/SEAL-INTEGRITY.md`.
`close --id T7 --reason "<40 characters or more>"` records unmet, keeps the pin, and does not unblock dependents.

## Agents

One type, `worker`. Name the role file in the prompt:

```
Read <P>/roles/builder.md and follow it.
Contract: .claude/relay/contracts/T7.md

<<<SOZLESME>>>
---
id: T7
status: active
round: 1
owns: [src/auth/token.js, test/token.test.js]
verify:
  - node --test test/token.test.js
---

<<</SOZLESME>>>
```

The contract rides inside the prompt: `PreToolUse` writes the file from the block before the
agent exists, refuses a malformed block or an `id:` that disagrees with the path, and never
overwrites an existing file. Neither you nor the agent writes it - zero turns beyond the dispatch.

`builder`, `ui-builder`, `auditor`, `planner`, `advisor`, `scout`, `scribe`. The role file names
its row; row x profile picks the cell in `<P>/tiers.json`. Resolve it, never restate it: `node
<P>/scripts/contract.js tier --role builder --id T7`. Signals raise a cell, the profile caps it,
nothing lowers it. Pass it as the `Agent` call's `model` and write it into the contract - a call
above the cell that no signal earned is refused.

Open the advisor whenever a second mind would widen the view - no gate, no list; a plan that
picks the product's direction is one of those moments. Pass `--asker <your own model>`, since a
model cannot second-guess itself. On premium it opens beside every `builder`/`ui-builder`
contract. It gets the goal and the evidence, never your draft answer; both halves land in
`docs/danisma/` on their own - link that file when you report, never a summary of it.

Repeated failures are counted for you: the `PostToolUseFailure` hook keeps the run in `live/_tally.json`, the resolver reads it unasked, the banner shows it from two upward.

- Independent contracts start together, not in sequence.
- Two writers in one checkout share one git index; the first commit sweeps in the other's
  files. Give each concurrent writer a worktree, or let exactly one commit.
- The auditor never writes; one written file voids the audit. An empty return is a failure:
  reopen the agent, do not finish its work for it.

## Language

Read `contractLang` from `~/.claude/teknesyum/config.json` once per relay; absent, it is `en`.
Write contract bodies, prompts, reports, checkpoints and `_issues.log` in that language, and
stamp every contract with `lang: <code>` so each agent reads it without opening the config.

Your chat with the user is always the user's language, and that summary lists the contract's
`## Acceptance` items one for one — an abridged one approves something else. An `_issues.log`
line is `<contract> | <role> | <what was sought> | <what was missing> | <what was done>`.

## Reporting

What changed, where, what the gate said. The statusline shows contracts, agents and problems;
never narrate them. While work is open the turn ends on one line - what is next, who has it -
and a delivery is answered in the turn it arrived, with its next contract.
