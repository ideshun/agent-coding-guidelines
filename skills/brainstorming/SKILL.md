---
name: brainstorming
description: Clarify what to build before designing how. Use only when the request has critical ambiguity, involves a significant design decision, has materially different technical approaches, or changes architecture/behavior at a large scale. Small, clear tasks must skip this.
---

# Brainstorming — What, Not How

Brainstorming answers **what to do and what must not happen**. Plan answers **how to implement and verify**. Keep them separate.

## Gate: Is This Needed At All?

Ask first: is everything that matters already in the request or discoverable from the codebase?

- Clear, small, well-scoped task → skip this skill, execute directly.
- Existing project conventions or code can settle the question → read them, don't ask.
- Only trigger when: critical ambiguity that changes direction / a real design decision / several materially different approaches / large architectural or behavioral change.

Do not turn every task into an interview. One round of questions is often enough; sometimes zero.

## What To Establish

- **Goals** — what success looks like.
- **Non-goals** — what is explicitly out of scope.
- **Anti-goals** — what would make this a failure even if it "works".
- **Constraints** — stack, compatibility, budget, existing architecture.
- **Prior art** — what already exists in this project to reuse.

Prefer open questions anchored in specifics over option menus. Mark your guesses as guesses; only what the user said counts as theirs.

## Tradeoffs & Approval

- When approaches genuinely differ, present the tradeoff briefly and recommend one with a reason. Don't list options to look thorough.
- Major architecture decisions, irreversible changes, and choices with real downside need explicit user approval before building.
- A cheap throwaway spike is allowed to learn — label it throwaway, minimal or no tests, and keeping its output is a new request that comes back through approval.

## Output

Only for genuinely significant work, record a short decision note (in chat or `docs/`, per project convention): intent, goals, non-goals, anti-goals, constraints, the calls made and by whom. Small changes don't need a document.

Building starts after the direction is agreed. Then move to Plan — not before.

## Red Flags

| Thought | Reality |
|---------|---------|
| "Every task needs a brainstorm first" | No. Clear small tasks execute directly. |
| "I'll ask a few questions to be safe" | Ask only what code/context can't answer. |
| "They said 'sounds good'" | Approval covers exactly what was described. |
| "The spike works, keep building on it" | Keeping it is a new request. Back through the gate. |
