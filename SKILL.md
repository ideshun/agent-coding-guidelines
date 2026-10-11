---
name: agent-coding-guidelines
description: "Use for implementing, debugging, reviewing or refactoring code, and inspecting or changing development configuration. 适用于编码、调试、审查、重构及开发配置；普通聊天与非技术写作不使用。"
license: MIT
---

# Agent Coding Guidelines

Follow host policies, permissions and applicable project rules using the host's priority order. Apply only relevant guidance; this skill does not grant authorization or replace equivalent instructions.

## 1. Understand before acting

- Read relevant code and facts before editing; distinguish evidence from assumptions. Never invent unread implementations, APIs or tool results. Investigate failed reads; stop dependent edits if essential evidence stays unavailable.
- Preserve negation, scope, sequence, contextual references and latest corrections across languages. Resolve uncertainty from inspected facts; ask only when a remaining ambiguity or contradiction changes the outcome. Clear tasks proceed directly.
- Scope searches and reuse inspected facts. Avoid aimless traversal, repeated reads and ceremonial calls. For optimization, establish the intended behavior or metric and baseline first.

## 2. Choose the simplest sufficient solution

Reuse existing code, dependencies and native capabilities. Add only what is needed; avoid speculative features, premature abstractions and unrelated upgrades. Preserve correctness, security and maintainability; follow project architecture and style.

## 3. Keep changes surgical

- Keep every change within the request. Preserve user edits, comments and public APIs unless their change is in scope; avoid incidental cleanup or formatting. Review the final diff or equivalent comparison; remove only unrelated changes you introduced.
- For review, report examined scope and findings; edit only when authorized. Honor existing authorization. Confirm unapproved consequential choices, scope expansion or irreversible actions; silence is not approval. Follow required host approvals.

## 4. Verify the outcome

- Define observable success before editing. Reproduce bugs when practical; disclose unavailable reproduction. Use existing verification rules and the smallest checks sufficient for behavior and risk, without another grading system. File count alone does not determine risk.
- Inspect actual output and exit status for the final version. Static success does not prove runtime behavior. Never weaken checks, swallow failures or invent results; distinguish passed, failed and unexecuted checks. Avoid irrelevant full suites, redundant reruns and mirrored tests.

## Conditional detail

Choose these independently. Clear local work needs no plan artifact or reference read.

- [Clarify](references/clarify.md) for unresolved key ambiguity or consequential design choices: goals, excluded/unacceptable outcomes, constraints, success criteria and meaningful trade-offs.
- [Plan](references/plan.md) for sequencing, dependencies or implementation risk: prefer the host's existing Plan; outline scope, steps and checks. A clear goal needs no clarification stage.
- [Verify](references/verify.md) for complex evidence selection, integration, runtime behavior or blocked checks: match checks to impact and report gaps.

Report outcome, relevant verification and remaining risk concisely. Follow the requested language, otherwise the conversation's; preserve identifiers, commands and quoted errors, and omit secrets. Mention untouched scope only to prevent misunderstanding.
