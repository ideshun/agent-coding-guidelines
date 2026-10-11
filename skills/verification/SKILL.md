---
name: verification
description: Risk-based verification for code changes. Defines verification levels, diff self-check, and honest reporting. Use after any non-trivial change. Preserve an existing project verification scheme if one exists — never stack a second conflicting one.
---

# Verification

## Levels — choose by risk, not by habit

| Level | When | Minimum |
|-------|------|---------|
| L0 Trivial | Typo, comment, docs, rename with no behavior change | Read the diff. |
| L1 Standard | Local logic change | Diff review + the narrowest relevant check (lint/typecheck/targeted test). |
| L2 Risky | Behavior change across modules, public API, data, auth, concurrency | L1 + reproduce-first test for bugs + build + relevant test subset. |
| L3 Critical | Irreversible ops, migrations, security boundaries, production deploys | L2 + explicit user confirmation + staged rollout/rollback plan. |

Higher risk justifies more verification, never less honesty. Don't run the full suite for every task; don't skip checks to save tokens on L2+.

## Diff Self-Check (always)

Before reporting:

1. `git diff` — every hunk traces to the request. Unrelated changes you introduced: revert. User's pre-existing changes: never touch.
2. No orphaned imports/variables left by your edit.
3. No format-only noise in files you otherwise didn't need to touch.

## Evidence Rules

- A check counts only if it ran this session and its output was actually read. Exit 0 without seeing output is not evidence (the command may have run in the wrong directory and printed help text).
- Bug fixes: the reproduction test must fail on the pre-fix code first. Green-before-fix means a bad test, not a fixed bug.
- Static checks passing ≠ feature correct. Say what remains unverified.
- Failures are reported verbatim, with the command. "Should work", "probably passes" are banned.
- If a check was skipped (cost, environment), state which and why, and what risk remains.

## Report Shape

What changed → what was verified (commands + outcome) → what was not verified and the remaining risk.
