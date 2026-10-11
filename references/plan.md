# Plan — how to implement

Read for T2 after Clarify, or when T1 grows into multi-step or hard-to-revert work. Decides *how*, not *what*. Prefer the host's native Plan mode when available; otherwise write a short inline plan. Never run two overlapping planning systems.

## Contents

- **Scope** — areas touched, and what stays untouched.
- **Approach** — chosen route in a few lines and why.
- **Steps with checks** — each step paired with proof:

```
1. <step> → verify: <command or observation>
2. <step> → verify: <...>
```

- **Risks** — ordering, external state, rollback.
- **Verification tier** — which V-level from Verify applies and why (risk-based, not maximal).

Success criteria come from the Clarify brief — do not invent a second definition of done. Clear local fixes need no plan artifact.

## Discipline

Depth matches risk. A longer plan is not a better plan. If reality diverges mid-task, stop, say so, and update the plan — do not quietly improvise.
