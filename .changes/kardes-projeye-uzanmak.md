---
bump: minor
---

Setup can open the folder that holds your projects, so a session in one of them can reach a
sibling. It writes into that repository's own `.claude/settings.local.json`, never the global
settings file, and only when the folder is named on the command line - with no answer it
writes nothing and prints the command. The home directory, the filesystem root, a missing
folder and anything under `~/.claude` are refused.
