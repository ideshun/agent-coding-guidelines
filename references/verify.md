# Verify — prove the outcome

Use for complex evidence selection. Reuse project/user verification rules; these examples add no grading system.

## Match evidence to impact

| Change | Useful evidence |
| --- | --- |
| Text or formatting with no behavior change | Diff and relevant link, syntax or render checks where applicable. |
| Logic or bug fix, even in one file | Targeted behavior check; relevant types or lint. Reproduce the bug before fixing when practical. |
| Integration, shared contracts or build configuration | Checks covering affected callers or boundaries; build or relevant suite if it adds evidence. |
| UI interactions or environment-dependent behavior | Runtime, browser or E2E observations when needed to establish the result. |

Assess impact when uncertain. Irreversible actions need authorization and a practical recovery path; state when reversal is impossible.

## Rules

- Record actual checks, output and exit status for the final version/environment. Silent success is valid; unexecuted checks are not. Reuse still-valid results.
- A regression check should distinguish defective from correct behavior. If it passes before the fix, investigate its coverage; other passing checks remain useful. Explain unavailable or intermittent reproduction.
- Separate new failures, pre-existing failures and blocked checks. Never repair unrelated failures or weaken assertions to manufacture success. Do not claim unverified outcomes as confirmed.
- Rerun for affected code, dependency/environment changes or flaky-result investigation; disclose unresolved flakiness. Add tests only for meaningful behavior.
- Read enough output to assess results; retrieve material missing parts and disclose remaining truncation. Report relevant errors and exit status without secrets.

## Diff self-check

Check scope and consistency across the diff, affected callers and artifacts. Remove only your unrelated changes and orphaned imports; preserve user edits.

## Report

What changed → verified (commands + outcomes) → not verified + risk.
