# Verify — prove the outcome

Read for T2, or whenever reporting done on non-trivial T1 work. Prefer project or user verification schemes when present; the tiers below are the default when none exist.

## Tiers (aligned with task route)

| Tier | When | Minimum |
|------|------|---------|
| V0 | T0 | Diff self-check only. |
| V1 | T1 | Diff + narrowest relevant check (lint / typecheck / targeted test from `package.json`, Makefile, or CI). |
| V2 | T2 | V1 + reproduce-first for bugs + build or relevant suite covering changed behavior. |

Irreversible ops: V2 plus explicit user confirmation and a rollback path.

## Rules

- A check counts only if it ran this session and its output was read. Exit 0 without seeing output is not evidence.
- Bug fixes: reproduction must fail on pre-fix code first. Green-before-fix means a bad test.
- Do not weaken assertions, skip failing tests, or fix unrelated pre-existing failures to manufacture success — report them.
- Do not add tests that merely mirror the implementation.
- Same check once per edit round unless the code under test changed.
- Runtime / browser / E2E only when the user asks or the defect is only observable at runtime.
- Static green ≠ feature correct. State what remains unverified.

## Diff self-check

Every hunk traces to the request. Revert unrelated hunks you introduced. Never overwrite the user's pre-existing uncommitted changes. No orphaned imports left by your edit.

## Report

What changed → verified (commands + outcomes) → not verified + risk.
