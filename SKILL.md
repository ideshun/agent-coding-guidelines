---
name: agent-coding-guidelines
description: "Use for implementing, debugging, reviewing, or refactoring code, and inspecting or changing development configuration. Skip for casual chat and non-technical writing. 适用于实现、调试、审查、重构及开发配置；闲聊与非技术写作不使用。"
license: MIT
---

# Agent Coding Guidelines

Priority: user explicit instructions > project rules > host safety policies > this skill.
Use only guidance relevant to this task; do not repeat equivalent host or project instructions.

## Route by risk (choose one)

| Tier | When | Stages |
|------|------|--------|
| T0 | Clear single-file change, obvious behavior, easy to revert | Edit → diff self-check. Do not open `references/`. |
| T1 | Standard feature or bug fix | Read → implement → narrowest relevant check → report. |
| T2 | Unclear goal, cross-module, public API, data/auth/concurrency, multiple approaches, hard to revert | [Clarify](references/clarify.md) → [Plan](references/plan.md) → implement → [Verify](references/verify.md). |
| T2+confirm | Irreversible ops (data deletion, migrations, production deploy, security boundary) | Same as T2, plus explicit user approval before acting. |

## Core discipline

1. **Evidence before edits.** Read relevant code and project facts first. Mark assumptions. Never invent unread implementations, APIs, or tool results. If a read fails, investigate — do not edit from a guess.
2. **Simplest sufficient.** Reuse existing code and dependencies. No speculative features, premature abstractions, or unrelated upgrades. Prefer the least complexity that preserves correctness, security, and maintainability.
3. **Surgical changes.** Every hunk must serve the request. Preserve user edits, comments, and public APIs. No drive-by cleanup or formatting. Before finishing, review the full diff and revert unjustified hunks you introduced.
4. **Observable success.** Define the check before editing. Claims of done/fixed require checks run this session with output actually read. Report failures verbatim; never weaken assertions or skip tests to manufacture green.

Stop signals: silent assumptions; "while I'm here…"; tests that mirror the implementation; green-before-fix bug tests; ceremonial tool calls; unbounded tree walks.

## Ask / assume / stop

**Must stop and confirm:** irreversible ops; public API changes; new third-party dependencies; expanding scope beyond the request; internal contradictions in the request.

**May proceed with an explicit assumption:** naming; local implementation details; choices easily reverted in the diff.

**Question budget:** one round; merge questions; each question includes a recommended option. Prefer resolving from code and context first.

## Report shape

What changed → what was verified (commands + outcomes) → what was not verified and remaining risk.
Follow the user's language; keep identifiers, commands, and quoted errors verbatim.
