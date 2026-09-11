bump: minor

Core runs in Cursor's own agent and in Gemini CLI through core/hooks/host.js: setup.js --host cursor|gemini [--remove] wires only its own entries and keeps the rest. Cursor gets the denylist, loop bound, count, job and evidence gates as one follow-up, and handoff; Gemini also gets the banner through systemMessage and the marks. Codex and the other hosts get the rules as text in adapters/AGENTS.md. A background task notification no longer moves .claude/jobs.md to trash. release.js stamps tagged git clone lines too. Both READMEs open with a New In 0.33 section.
