# Changelog

## v0.11.1

- The band names the model's family instead of the resolved id, so a seat no longer opens with
- one model and ends with another. The resolved id stays in the record and the seal; the
- shortening happens only at the moment of drawing.
- Work lines on the band are title-cased like every other heading the plugin prints.
- An open advisor consultation is on the band. A consult that answers without touching a tool
- leaves no step behind, so nothing moved while it ran; the open consultation is read from the
- consultation record itself.
- A waiting notice raised while an agent is still working no longer rings. The bell is for the
- moment the run actually stops.
- A statusline command whose script is missing is replaced rather than respected, so a wiring
- left over from an older install stops failing silently.

## v0.11.0

- The step ceiling now counts every tool, not only the writing ones. A contract that did its
- work through `Bash` used to pass its ceiling unchecked; the statusline reported the overrun
- and nothing acted on it. The only command still let through past the ceiling is the one that
- closes the contract.
- Independent git repositories sitting inside the checkout are now a boundary the guard holds.
- It notes where they are and what they had uncommitted, and refuses the next shell call if one
- of them moved. A shell call that dirties tracked files outside `owns` in the checkout itself
- is only written to `live/problems.log`, so the false-positive rate can be measured before it
- becomes a gate.
- A ceiling raised on purpose reads as `Adım 197/250 (yükseltildi)` instead of a silent overrun.

## v0.10.0

- Five ways a seal could be issued without the work behind it are now closed. A contract
- verified in the wrong worktree, an auditor from an older round or another contract, a diff
- that moved after the audit, an acceptance block with nothing executable in it, and a
- dependency that never passed - each is refused at the gate rather than noticed afterwards.
- A closure interrupted halfway now recovers. The journal under `audits/closures/` lets the
- next run finish the move without writing a second ledger row for the same contract.
- Alongside the main suite, 33 closure scenarios and a synthetic host fixture drive the real
- hooks end to end, and the earlier counterexample set no longer reproduces seven of its
- twelve holes.

## v0.9.0

- Premium raises the ceiling, not the starting model. `builder` and `ui-builder` open on
- `sonnet/high` in every profile's premium column instead of `opus/medium`; the existing
- signals - a repeated failure, round 3, risk high - still reach opus.
- `scout` now covers measurement as well as prior art: benchmarks, timings, inventories, any
- question whose answer is a number rather than a change.
- The model is checked at dispatch. An `Agent` call above what the role resolves to with no
- signal behind it is refused before a token is spent; below the cell stays free. The seal
- writes the same finding to `live/problems.log` rather than refusing work already paid for.
- The `main`-branch hatch is per command again. `TEKNESYUM_GATE_OPEN=1` pinned in the
- environment is ignored - the Windows registry or an `export` in a shell profile - and the
- block says why. One machine had carried it for months with the gate quietly off.
- A promise now survives the turn it was made in. `.claude/relay/OWED.md` holds at most three
- lines of sixty characters, written by `handoff.js owe --add` and closed by `owe --done <n>
- --because "..."`. Every prompt carries the list back inside the cue string that was already
- there, so an empty ledger still costs nothing. Nothing expires - an old debt is marked
- `stale`, not dropped - closing needs a reason, and the reason lands in `HANDOFF.md`.
- A consultation is now on the record without anyone remembering to write it down. When an
- agent opens on the ceiling model or in the `advisor` role, the dispatch hook writes the
- prompt to `docs/danisma/NNN-<topic>.md` before it runs and fills the answer in from the
- agent's own transcript when it stops. Neither half passes through the model that asked, so
- neither can be trimmed to fit the conclusion. Ordinary work records nothing.
- Two signals now speak for the failure nobody hears. A plausible wrong diff is small and
- green, so no existing signal fires on it. The import map already knows the shape of the
- project: when a contract owns a file five or more others import, the first attempt is not
- the cheap one. And the planner can write `raise: opus` in the contract, taken only with a
- `why:` on the same page. Both stay under the profile ceiling.
- Neither rung reads a value that could be edited under it. The `raise:` line is sealed the
- first time the contract file is written and the ladder reads the seal, so a builder adding a
- raise to its own contract on round two raises nothing; the reason has to sit on the same line
- as the raise. The import map is checked against HEAD before it is believed, rebuilt if it is
- stale, and the fan-in signal is recorded as `unknown` rather than acted on when it cannot be.
- A seal records what the ladder decided, not only that it closed: the model that ran, the
- model that was asked for, the signals that fired, the fan-in and the file it was measured on,
- the sealed `raise:`, and whether the diff went anywhere near the identifiers the acceptance
- names. None of it changes a decision - it is there so the next question about the ladder is
- answered from a column.
- `git merge-base` is no longer read as `git merge`, so a read-only ancestry check is not held
- by the trunk gate. Every refusal the guard makes is appended to `live/refused.log` with the
- tool, the agent and the command: a gate whose false positives are not counted cannot be
- tuned. A directory in `owns` is refused where it is written rather than at the seal, when the
- whole round is already spent.
- A relay under a linked `git worktree` now resolves to the main tree's relay. Five separate
- field reports - a sealed contract read as `submitted`, work coming back `unassigned`, `live/`
- in two places, an audit record with nowhere to go - were one wrong root.
- The band tells you more about a running seat: how many files it has touched, how long it
- has been going, and its steps against the contract's step ceiling - `Adım 12/150` instead of
- a bare count. Every label in the band is Title Case now, not only the role and the cell.
- `complete` and `audit` now refuse while tracked source files outside `owns` are modified, the
- seal carries the role and the Core version that produced it, and the hollow-run patterns count
- digits: `10 passing` is no longer read as `0 passing`.

## v0.8.0

- The finish bell rings when the turn really ends, and not while the gate still holds it open.
- Numbers in a document a contract owns are checked against that document's own tables; a fourth round does not open without a second mind; the auditor is recognised by the role it was given, not the type it was spawned as; the gate stops work that reaches main, on both shells, and no longer opens for the word "push" in prose
- The round is counted from the ledger, not read from the contract body: a body that claims a round nobody opened does not seal.
- The handoff note is refreshed before a compaction, not only when the session ends.
- The gate refuses a plain-line verify, a step that collected no tests, and two verify runs at once; a round does not open without --critical; the banner's record is created by the first agent, not the first contract

## v0.7.4

- Risk is measured from the merge-base, classifies adds/edits/deletes/renames, and names the changed hunks; the close refuses on a blocked dependency, an overlapping owner, or a dirty tree; the map guards its own freshness and size

## v0.7.3

- The statusline repoints itself when the plugin updates, a verify that runs long has its process tree swept, and the Stop gate holds unassigned work

## v0.7.2

- Banner: markdown instead of ANSI, since the client renders one and prints the other

## v0.7.1

- Banner: no ANSI in the message band, and roleless rows no longer take a seat
- doctor reads the version from the plugin manifest, so an installed copy is not a failure

## v0.7.0

- a turn cannot close on an unanswered delivery, and work no longer reaches main around the gate
- records survive a crowd: merges take a lock, a stopped subagent stays stopped, an unreadable diff is not low risk
- the language link is a two-half EN/TR button; a closing contract names the files nothing references any more
- setup records the core repo; a bug log with no repo says where it landed; log close/archive finds a log whatever its prefix
- the banner reads in two lines: who is seated, and what they are on

## v0.6.0

- The banner reads as a heading and names the seat before the work

## v0.5.0

- The banner says what the agents were sent to do

## v0.4.6

- The README says who does the work before it says how, and the comparison comes last

## v0.4.5

- Simpler wording for the free ways to help

## v0.4.4

- The support section speaks to the reader

## v0.4.3

- The last section says what support does instead of repeating the license

## v0.4.2

- The README says what the three modes are and how to set one

## v0.4.1

- The banner names the seat and the cell instead of repeating the profile

## v0.4.0

- Acceptance that cannot fail is refused, contracts carry a ceiling, and precheck pins the tree

## v0.3.0

- map.js who, contract.js list, unresolved references in check, and a zero-cost update hint
- The map is sealed to the commit it was built from, and a stale map now says so

## v0.2.0

- The gate stops guessing at shell commands, and a handoff note says where the project stands
