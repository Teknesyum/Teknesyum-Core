# Teknesyum Core Rules For Other Hosts

Hooks enforce Core; a rules file tells the model why. Codex CLI has no hooks on Windows, so
there this block is all of Core. In Cursor and Gemini CLI the adapter (`setup.js --host`) runs
the gates, and this block teaches the model the job list the gates expect.

| Host | Where the block goes |
|---|---|
| Codex CLI | `AGENTS.md` in the project, or `~/.codex/AGENTS.md` |
| Cursor | `AGENTS.md` in the project |
| Gemini CLI | `GEMINI.md` in the project, or `~/.gemini/GEMINI.md` |

It costs its own length on every turn, about 150 tokens.

```
- One file and a job you know: do it.
- Five or more files: docs/plan.md first.
- A library you do not know: read before writing.
- When done, run it and show the output.
- Small job: none of the above.
- More than one job in a prompt: list them in .claude/jobs.md as "- [ ] job", tick "- [x]"
  as each is done, and leave one open only as "- [ ] job — reason" when it waits on the
  user, is blocked outside the repo, or hits the handoff. Size or count is no reason.
- Before ending a long session, write .claude/handoff.md: task, changed files, tests run,
  decisions, next_action. The next session reads it first.
```
