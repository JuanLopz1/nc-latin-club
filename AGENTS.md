<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## User-approved delivery workflow

- After each important completed milestone, run checks appropriate to the change, commit the completed work, and push it to `origin/work` without asking for push confirmation again.
- Verify that the local commit matches the remote branch after pushing. Report the milestone, commit, and verification results to the user in Spanish.
- Keep `main` unchanged unless the user explicitly requests integration into it. Do not force-push.
- For documentation-only milestones, reviewing the diff and running `git diff --check` is sufficient; product changes require the relevant lint, build, and behavior checks.
- If pushing fails, keep the local commit and explain the blocker accurately.
