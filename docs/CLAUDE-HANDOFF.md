# Claude handoff — reliability and product hardening

Date: 2026-08-29  
Target: Claude Code 2.1.234, Teknesyum Core 0.1.12

## Mission

Make Teknesyum Core dependable enough to use as the default control plane for future coding
work. Preserve its product thesis: native Claude agents do the work; Core adds disk-backed
contracts, ownership, deterministic verification, risk-sensitive audit, and user-visible
state without ordinary-turn context rent.

Do not trade away these laws:

- No ordinary-turn `additionalContext` or model-visible banner.
- One skill, one generic agent, no standing slash-command catalogue.
- No automatic commit, branch, push, or destructive git operation.
- Deterministic checks before model judgement; high-risk work gets independent review.
- User-facing strings follow `lang`; model-facing enforcement remains concise English.
- Plugin behavior must work on Windows, macOS, and Linux or state the narrower support honestly.

## Verified baseline

- `npm test`: `2294 passed, 0 failed` on Windows.
- `claude plugin validate core`: passes.
- `claude plugin validate .`: passes with one marketplace-description warning.
- Installed plugin is enabled and listed as 0.1.12; `plugin details` reports 0.1.9.
- Project worktree was clean before this handoff file.
- Tests are 1,270 lines in one custom runner; most of the 2,294 count is a tier matrix,
  not 2,294 independent behavioral scenarios.

Passing baseline does not cover the defects below. Reproduce each before changing it and add
a regression test that fails for the current reason, not merely for any non-zero exit.

## P0 — repair the trust chain first

### 1. Audit identity fails open

`core/hooks/seal.js:92-99` returns success when the requested live record does not exist.
`contract.js audit --run-id nonexistent-auditor` therefore writes a valid audit record. This
was reproduced against the test fixture. `test/all.js:343-352` masks the bug with
`auditCmd.status === 2 || auditCmd2.status === 2`: the first call succeeds, the second fails
only after a non-auditor record is created.

Required outcome:

- Missing, stale, ended, malformed, non-auditor, or write-tainted auditor records are rejected.
- The record must identify the same live run and contract/round being audited.
- Evidence must be produced after the run began and bind to the current owned-file digest.
- Tests cover every rejection separately; no `A || B` assertion can hide one path.

### 2. Contract lifecycle is not enforced at completion

`core/scripts/contract.js:459-551` never checks `status:`. An `active` fixture (`Q1`) was
successfully completed and moved to `done/`; an `open` contract with a passing command follows
the same path. The moved file keeps `status: active/submitted`; it is never stamped `done`.
`guard.js:50-93` also allows an Edit that removes the status line because it validates only
`new_string`, not the reconstructed document.

Required outcome:

- `complete` accepts exactly the intended pre-close state (`submitted`, unless a documented
  alternative is deliberately chosen).
- The archived contract carries a terminal status consistent with the documented ladder.
- Write and Edit validate the complete resulting contract, including removal of required fields.
- `close --reason` has an explicit allowed-state policy and terminal representation.

### 3. Ownership is narrower than the product claim

Current enforcement binds an agent only after it edits a contract (`guard.js:222-262`). Before
that edit it may write anywhere. `Bash` is checked only for gate-owned directories and is never
checked against `owns`; `watch.js:90-102` records files only for Write/Edit/NotebookEdit. A bound
builder or auditor can therefore alter source through Bash without ownership/audit taint.
`owns` accepts absolute paths, `..`, duplicates, missing paths, and overlapping ownership across
contracts. A target outside the project makes `relayRoot(..., {git:false})` return null, so the
boundary silently disappears.

Required outcome:

- Normalize and validate `owns`: project-relative canonical files only; reject absolute paths,
  traversal, directories, duplicates, reserved relay paths, and ambiguous case collisions.
- Detect overlapping ownership among live contracts before writers start.
- Bind the child to its contract before its first mutating tool, or fail closed until bound.
- Define an honest Bash policy. Prefer post-operation changed-file evidence/snapshots over a
  command regex presented as a sandbox.
- Auditor write detection includes shell and every mutating tool, not only file tools.
- Completion proves the contract's changed-file boundary, including untracked files, without
  confusing concurrent contracts. If worktrees are the only sound solution, make that boundary
  explicit and automate it.

### 4. Notifications are currently dead for normal sessions

`core/hooks/notify.js:6,48-52` imports and calls `sessionFile`, but `core/hooks/lib.js` neither
defines nor exports it. `resolveSettings('.', 'diagnostic-session')` throws
`TypeError: sessionFile is not a function`; the main hook swallows that exception, producing a
silent failure. `testNoContextWrites` explicitly skips `notify.js`.

Required outcome:

- Restore or remove the session layer coherently; test real payloads with `session_id`.
- Test precedence (project > session > machine), mute flags, cooldown, missing player, and each OS
  adapter without playing sound in CI.
- Hook failures should remain non-blocking but become diagnosable through a bounded local log or
  doctor check.

## P1 — make the architecture truthful and operable

### Contract schema and gate

- Replace regex-over-entire-document parsing with strict frontmatter parsing/validation. Validate
  filename/id match, required fields, known status, positive round, language, owns, verify, and
  unknown keys. `FIELDS` currently exists but is not used as a schema.
- Define `verify: []` structurally: require a human-review/audit route rather than accepting prose
  that the gate never reads. A contract with no executable acceptance proof should not silently
  become low-risk.
- Harden verify isolation. The current substring denylist in `unsafeStep()` is bypassable by path
  construction and cannot guarantee that a command did not alter gate state. Run verification in
  a constrained environment or check immutable snapshots before and after.
- Make completion/ledger/audit updates transactional and recoverable. A crash between rename,
  audit consumption, and ledger append currently leaves split state. Add idempotent recovery.
- Add contract dependency and lease metadata only if it earns enforcement: blocked-by relationships,
  ownership conflict checks, and resumable checkpoints are more valuable than decorative fields.

### Risk and audit quality

- `git diff HEAD --numstat` omits untracked files; a large new generic source file can remain low
  risk. Include staged, unstaged, deleted, renamed, binary, and untracked owned files.
- `risk.js` uses a literal `\*\.csproj` regex, so ordinary `Foo.csproj` files are not classified as
  dependency/build-sensitive. Add ecosystem fixtures rather than extending one regex blindly.
- Bind audit evidence to exact verify commands and observed exit data. Free-form strings alone do
  not prove the auditor ran them.
- Check files changed outside `owns`, not only digests of files listed in `owns`.
- Threat-model explicitly: Core is policy enforcement, not a hostile-code sandbox. Documentation
  must distinguish guarantees from best-effort command inspection.

### Live state, model routing, and concurrency

- `lib.write()` is atomic per file replacement but read-modify-write users (`_tally.json`,
  `_calls.json`, live records) have lost-update races across parallel hook processes. Introduce a
  cross-process lock/append protocol and crash recovery; test parallel writers.
- The skill says T0 writes model/effort into live records, but `live/` is sealed and there is no
  legitimate command for that. `watch.js` stores model/task only in `_calls.json`, omits effort and
  contract, and child records generally lack model/effort/contract. Make hook-derived metadata
  sufficient; do not ask the model to violate the seal.
- Per-contract advisor quota reads `live/*.json` `record.contract`, but advisors do not edit the
  contract and no current hook assigns that field. Prove quota behavior through a real Agent event
  sequence. Decide whether ended/stale records count toward a relay quota and persist that policy.
- Capture a failure signature, not merely a counter. D8 promises “same verify step/same signature”;
  `watch.js` currently increments any consecutive tool failure and stores only the tool name.
- Validate requested model/effort against the live Agent tool contract and handle unavailable
  `fable`, aliases, fallback, and future effort levels with a clear diagnostic.

### Product/documentation drift

- `core/roles/advisor.md:22` names nonexistent `advisorPair`; runtime uses `advisorLadder`.
- Core advertises and instructs `<P>/roles/ui-builder.md`, but that file intentionally lives in
  Teknesyum-UI and Core declares no dependency or resolver. Either make the companion integration
  explicit and detectable, provide a Core fallback, or remove the broken route.
- `privateRepo` is asked and stored but never cloned, mirrored, or otherwise used, despite D4/README
  language. Implement a safe explicit workflow or remove the promise/question.
- README calls Node optional although every enforcement/display hook invokes `node`. Without Node,
  Core's thesis does not run. Either ship a runtime-independent launcher or call Node required.
- Version sources disagree: `package.json` is 0.1.4, plugin manifest/README/tag are 0.1.12, install
  script comments say 0.1.9, and local CLI details resolve 0.1.9. Establish one release source of
  truth and fail CI/tagging on drift.
- The tagged installer downloads a pinned script, then adds an unpinned GitHub marketplace and
  installs its current plugin. Decide whether releases are reproducible and document the truth.
- Marketplace validation warns that its description is missing.

### Performance and observability

- D15 says one MessageDisplay hook run per message. The event actually invokes the command on every
  display flush; `notice.js` starts Node and only then ignores middle flushes. Benchmark a long
  streaming answer and report p50/p95 spawn count and added display latency. Preserve zero tokens,
  but do not call per-flush process cost “one run”.
- Measure parallel `watch.js` overhead and state contention. Set a supported latency budget.
- Replace swallowed catch blocks on integrity paths with bounded, local, privacy-safe diagnostics.
  User-visible output must remain class Z.

### Test and release engineering

- Split the monolithic custom runner into focused suites while preserving zero-dependency operation
  if that is a deliberate constraint. Count scenarios separately from matrix cases.
- Add integration fixtures that replay real hook payloads for main agent, subagent, Agent spawn,
  MessageDisplay, session lifecycle, and concurrent writers.
- Add Windows and Linux CI at minimum; add macOS adapters through mocks if hosted macOS is too costly.
- Add manifest validation, version consistency, install smoke test, package-content snapshot,
  README command/link checks, and release checksum generation to CI.
- Add plugin evals for behavior the model must perform: contract splitting, exact acceptance summary,
  role selection, advisor blinding, blocker return, and resume after compaction. Deterministic code
  tests cannot prove the skill is followed.

## P2 — high-value additions after correctness

1. `setup.js --doctor` (or a similarly zero-context script): runtime/version, plugin source, hook
   registration, config/schema, statusline bridge, sound adapter, writable state, relay integrity,
   stale locks, manifest/version drift, and concise remediation. It must not mutate unless asked.
2. `contract.js validate [--all]`: schema, ownership collisions, dependencies, verify portability,
   risk explanation, stale audit, and ledger consistency before agents spend tokens.
3. Recovery workflow: list resumable contracts, reconcile orphaned live records, incomplete
   transactions, stale audits, and worktrees. Never guess completion.
4. Deterministic contract scaffold/template that writes only invariant structure and leaves goal,
   acceptance, ownership, and verification decisions to T0.
5. Import-map support matrix and honest fallbacks. Current parser is useful for JS/TS, partial for
   Python/C#, and absent for Go/Rust despite broader risk rules. Add language fixtures before claims.
6. Local metrics command/file for opt-in latency, hook failures, blocks, retries, contract lead time,
   and verification failures. No telemetry and no context injection by default.
7. Companion-plugin capability discovery so Teknesyum-UI roles are available only when installed,
   with a deterministic fallback message.

## Execution order

Use the `relay` skill. Do not implement this as one diff.

1. Bootstrap contract: audit fail-open + notification crash + focused regression tests.
2. Lifecycle/schema contract: terminal states, full-document validation, path canonicalization.
3. Ownership/auditor contract: pre-binding, shell/write evidence, overlap and concurrency model.
4. Live-state contract: race-safe writes, metadata provenance, advisor quota/failure signatures.
5. Risk/transaction contract: complete diff coverage and recoverable gate transitions.
6. Release/documentation contract: dependency truth, version authority, companion role, installer.
7. CI/evals/doctor contract.
8. Reassess P2 from measurements; do not add a feature merely because it is listed here.

For every contract: name exact owned files, runnable verification, migration/backward-compatibility
impact, and rollback. Independent contracts may run in parallel only after overlap is checked.
Do not commit or push. Stop for a user decision only when it changes the product promise, data format,
or security boundary; otherwise make the safest compatible choice and record it in DECISIONS.md.

## Definition of done for this handoff

- All P0 defects have focused regression tests and are fixed without weakening zero-context laws.
- P1 items are either implemented or recorded as explicit, evidence-backed decisions with owners and
  runnable acceptance criteria; no stale promise remains in README/roles/skill.
- Clean install and upgrade are smoke-tested on supported platforms.
- `npm test`, plugin validation, doctor, and integration/eval suites pass.
- Final report separates guarantees, best-effort policies, measurements, and remaining risks.
