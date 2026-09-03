---
name: relay
description: Split work into gated contracts and run them with agents. Use for any build, fix, refactor, or new project.
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

```markdown
---
id: T7
status: open
round: 1
owns: [src/auth/token.js, test/token.test.js]
verify:
  - node --test test/token.test.js
---

## Goal
One sentence.

## Acceptance
- Refresh tokens expire after 15 minutes.
- Expired refresh returns 401, not 500.

## Checkpoint
Updated as work proceeds, not at the end.
```

Enforced, not advised:

- `owns:` lists **files**. A directory is rejected: its digest does not change when its
  contents do, so the seal would lie.
- `verify:` is required and each entry must exit 0. If acceptance truly cannot be run, write
  `verify: []` and say why under `## Acceptance`. A verify step may not touch `done/`,
  `audits/`, `live/`, or call `contract.js`.
- `status:` climbs `open → active → submitted → done`, never back, `open` never past `active`;
  `blocked` is free in both directions. `blocked-by: [T3]` must be `done` first, and `list
  --ready` shows what nothing is holding. A close refuses on a changed file another open
  contract owns, or dirty tracked source outside `owns`.
- An agent binds to the contract it first edits and writes **only** inside that `owns`.
  Widening it to fit an edit is wrong: record the blocker under `## Checkpoint`.

## Layout

```
.claude/relay/
  PLAN.md              projects from scratch only
  contracts/<ID>.md    open work
  contracts/done/      closed; only contract.js writes here
  audits/  live/       gate-owned; Write, Edit and shell are refused
  map.md               import graph, generated
```

`<ID>` is letters + digits: `T1`, `UI3`, `FIX12`. Before opening source, `node
<P>/scripts/map.js` writes `map.md` — hubs, cycles, orphans, edges; regenerate after a refactor.

## Closing

```bash
node <P>/scripts/contract.js check --id T7      # risk and verify steps, no side effect
node <P>/scripts/contract.js complete --id T7   # runs verify, gates, moves to done/
```

Risk comes from the diff since the merge-base, not from a claim: sensitive paths (auth,
migrations, hooks, CI, dependency and settings files), more than 8 owned files, or more than
300 changed lines mean **high**. A contract may escalate with `risk: high`, never lower itself.
High risk also needs an audit record, which only the auditor writes and which is consumed.

Unmet work does not vanish:

```bash
node <P>/scripts/contract.js close --id T7 --reason "<40 characters or more>"
```

## Agents

One type, `worker`. Name the role file in the prompt:

```
Read <P>/roles/builder.md and follow it.
Contract: .claude/relay/contracts/T7.md
```

`builder`, `ui-builder`, `auditor`, `planner`, `advisor`, `scout`, `scribe`. The role file names
its row; row x profile picks the cell in `<P>/tiers.json`. Resolve it, never restate it: `node
<P>/scripts/contract.js tier --role builder --id T7`. Signals raise a cell, the profile caps it,
nothing lowers it. Pass it as the `Agent` call's `model` and write it into the contract - a call
above the cell that no signal earned is refused.

Open the advisor whenever a second mind would widen the view - no gate, no qualifying list; a
plan that picks the product's direction is one of those moments. Pass `--asker <your own
model>`, since a model cannot second-guess itself. On premium it also opens beside every
`builder`/`ui-builder` contract. It gets the goal and the evidence, never your draft answer.

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

## Owed

A promise you cannot keep this turn goes on the ledger, not into the conversation:
`handoff.js owe --add "ask fable about the tier table"`. Every prompt carries it back until
`owe --done <n> --because "..."` closes it. Three at a time; a fourth is a contract.

## Reporting

What changed, where, what the gate said. The statusline shows contracts, agents and problems;
never narrate them. While work is open the turn ends on one line - what is next, who has it -
and a delivery is answered in the turn it arrived, with its next contract.
