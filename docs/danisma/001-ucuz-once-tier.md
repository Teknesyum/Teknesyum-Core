# Ucuz önce: sonnet/high kalıcı olsun mu

- soran: T0 (opus)
- danışılan: fable
- tarih: 2026-09-03
- kayıt: elle (kanca bu danışmadan sonra yazıldı)

## Sorulan

You are advising on Teknesyum-Core, a Claude Code plugin. Read `core/tiers.json`, the resolver
(grep for MODEL_RANK), and the "Tiers"/"Agents" sections of README.md before answering. Do not
write any files. Answer in English, in prose, under 600 words.

Context. The tier table picks a model from a role x profile cell. Last commit changed the
`builder` and `ui-builder` cells in the **premium** column from `opus/medium` to `sonnet/high`.
The rationale was: a first attempt should be cheap, and the existing escalation signals
(repeatFail >= 2, round >= 3, risk: high, irreversible) still reach opus. I told the user this
change is provisional because the measurement behind it was dirty — the 156-contract sample it
came from was collected while the main-branch gate was accidentally disabled, and nothing was
checking the dispatched model at all, so "118 opus / 38 sonnet" measures an unpoliced system,
not a policy.

The user's position, verbatim in substance: "why not give simple work to sonnet? we save a lot.
Let opus do the important work, and the savings buy us longer working sessions. Nothing here is
a sacred cow."

I agree with the direction. What I want from you is the part I might be getting wrong.
Specifically:

1. Is there a failure mode where starting on sonnet costs *more* than starting on opus — a job
   where the cheap attempt produces a plausible-but-wrong diff that passes `verify:`, gets
   sealed, and is discovered three contracts later? If so, which role x signal combination
   should be exempt from cheap-first, and is `risk: high` a sufficient guard or does it fire too
   late?

2. The escalation ladder currently needs a *failure* to climb: repeatFail at 2, round at 3. That
   means the cheapest path to opus is to fail twice. Is that the right shape, or should
   something be able to escalate *before* the first attempt — e.g. a contract with more than N
   owned files, or one whose `## Acceptance` names a design decision rather than a behaviour?

3. What is the smallest honest experiment that would settle this? I proposed 20-30 fresh
   contracts under the now-working dispatch gate. Say what to record per contract so the result
   is a measurement and not an anecdote, and what number would make me revert.

Be concrete and be willing to tell me the change was wrong.

## Dönen

**Short verdict.** The direction is right; the sentence "the existing escalation signals still
reach opus" is the part that is wrong. Every signal in `tier()` is loud: `risk: high`, tool-call
failures, reopen rounds. The failure you describe in Q1 is silent by definition, and nothing in
the ladder hears it.

**1. The silent-wrong-diff mode is real, and `risk: high` is the wrong guard for it.**

Look at what `risk.js` computes: sensitive paths, `owns` count, diff lines, deletes, renames.
Three of those need a diff, and at dispatch there is no diff. So for model selection, `risk:
high` fires on path or file count only; everything else lands at the seal, where it opens an
auditor instead of changing the builder. Worse: a plausible-but-wrong diff is *small*. Small
diff, few files, no delete — risk resolves `low`, no audit record is demanded, sonnet's work is
sealed with no opus eyes on it. The guard is not late; for this case it never fires.

`repeatFail` does not help either. The signal text says "verify failed N times with the same
signature", but `tallyFails` reads the per-agent tool-failure counter the hook keeps. A wrong
diff that runs clean produces zero of those.

What actually separates dangerous cheap work from safe cheap work is fan-in, not diff size. You
already have `map.js`. Exempt from cheap-first: a builder whose `owns` contains a file with
import fan-in above some N (start at 5), or any file under `core/scripts/`, `core/hooks/` — the
plugin editing its own gate is exactly where verify is weakest, because verify was written by
the same understanding that is being changed. `selfRiskOpensAdvisor` already recognises this
class; extend it to raise the builder too.

**2. The ladder should have one pre-dispatch rung, and it should be the planner's.**

Detecting "acceptance names a design decision" mechanically is a losing game. But the planner is
opus in every profile, and it writes the contract. Let it stamp `model: opus` with a mandatory
one-line `why:`; the dispatch gate treats that as a signal, and the seal writes the stamp to the
ledger. That gives you two things: a way up before the first attempt, and a measurement — if the
planner stamps more than a third of contracts, cheap-first is a fiction and you should know that
from the ledger rather than from feel.

Add the fan-in rule above as the second automatic rung. Nothing else. A file-count threshold
already exists inside `risk.js` (`FILE_LIMIT`), so do not duplicate it.

**3. The experiment.**

20-30 contracts answers "does sonnet-first usually pass verify" but not your Q1, which is a
delayed defect. Two changes make it a measurement:

Alternate by contract ID parity — odd opens on opus/medium, even on sonnet/high — in the same
project, same fortnight. The 156-sample is not a control; it is a different regime.

Record per contract: dispatched model and effort (from the gate, not the report), the signal
that set it, `owns` count, max fan-in, final diff lines, rounds, tool failures, whether the
auditor opened, builder plus auditor cost per round, and one column you do not have today —
**origin**: when a later `reopen --critical` or `log.js` entry names a file this contract sealed,
charge that round back here. Close the window 20 contracts after the last one in the sample.

Revert if any of: the sonnet arm's reopen rate exceeds the opus arm's by more than 15 points;
three or more charged-back late defects in the sonnet arm against zero or one in the opus arm;
or attributed cost per sealed contract in the sonnet arm is not at least 25% under the opus arm.
With 15 per arm you can only see large effects, so a null result means "not obviously wrong", not
"right". Say that in the README when you write the number in.
