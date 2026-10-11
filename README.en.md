# Agent Coding Guidelines

A concise, reliable, maintainable set of AI coding workflow rules, reusable across tools. Core goal: **more effective, lower cost, more controllable** — not another complex agent framework.

**Single source of truth, no equivalent duplicate entries**: `skills/*/SKILL.md` is the only canonical body; `adapters/`, export scripts and the compatibility catalog all derive from it. Honest disclaimer: this repository currently has **no controlled comparison proving effectiveness** — all static tests verify content integrity, not model behavior gains (see [verification](docs/verification.md)).

[简体中文](README.md)

## Contents

```
skills/                        # Single source of truth
  global-coding-principles/    # L1 global coding discipline (always-on)
  brainstorming/               # L2 requirement clarification (on demand)
  plan/                        # L3 implementation planning (on demand)
  verification/                # L4 risk-based verification
  stack-conventions/           # Special: stack-agnostic convention adherence (on demand)
adapters/
  cursor/rules/                # Cursor .mdc (scope config + synced reference)
  codex/                       # Codex AGENTS.md / skills installation notes
  claude-code/                 # Claude Code installation notes
scripts/                       # Read-only export & compatibility queries (Node 20+ stdlib, no deps)
profiles/                      # Opt-in project-level profiles (never global)
docs/
  architecture.md              # Layering and loading strategy
  compatibility.md             # Cross-tool compatibility entries and deployment modes
  tool-registry.json           # 88 host profiles with evidence levels
  verification.md              # Host discovery vs. behavioral acceptance, verified separately
  design.md                    # Research source → decision → location → acceptance
  references.md                # Research records and evidence limits
```

## Design sources

- [andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) four principles, plus practical hardening from community PRs: task calibration, over-engineering smell lists, red-flag tables, non-negotiable verification (PRs #188/#197 etc.; each diff re-inspected on adoption, unmerged content is only a candidate).
- [obra/superpowers](https://github.com/obra/superpowers) brainstorming ideas (Goal/Non-goal/Anti-goal/trade-offs/approval), but **not** its mandatory workflow: no brainstorm for small tasks, no forced multi-round questions, no forced design docs or subagent review, no automatic git commit.
- Official host mechanisms: Cursor `.mdc` (alwaysApply / description / globs), Codex `AGENTS.md` (`~/.codex` global + project cascade) and skills, Claude Code `CLAUDE.md` and `.claude/skills/`.

The full research source → decision → location mapping is in [design.md](docs/design.md); diff snapshots and rejection reasons are in [references.md](docs/references.md).

## Usage

### Cursor

1. Copy `adapters/cursor/rules/*.mdc` into the project `.cursor/rules/` (project scope) or Cursor user rules (user scope).
2. Run the sync to inline skill bodies into the `.mdc` files (Cursor `@file` references do not inline bodies):

```bash
./scripts/sync-cursor.sh /path/to/target-project
```

### Codex / Claude Code / others

See `adapters/codex/README.md`, `adapters/claude-code/README.md`. Same principle: L1 goes into the global instruction file; the rest install as on-demand skills, **never into the global file**.

For 88 more hosts, see [compatibility.md](docs/compatibility.md) and [tool-registry.json](docs/tool-registry.json); query with read-only commands:

```sh
node scripts/compatibility.mjs --list
node scripts/compatibility.mjs --tool codebuddy
```

### Rule-based host export

Rule-based hosts (instructions / project rules) use an export of the same source; never maintain a second guideline body:

```sh
node scripts/export.mjs --skill global-coding-principles --format instructions
```

Output goes to stdout only; no host configuration is touched, no network access.

### Opt-in project profile (React + TypeScript)

[profiles/react-typescript.md](profiles/react-typescript.md) is for projects that actually use that stack; never global. Export as a Cursor `.mdc` or a VS Code instructions file:

```sh
node scripts/export-profile.mjs --format cursor   # .cursor/rules/react-typescript.mdc
node scripts/export-profile.mjs --format vscode   # .github/instructions/react-typescript.instructions.md
```

### Existing configuration protection

Installation appends and never overwrites: do not delete, empty or batch-replace your existing Rules / Skills / MCP / AGENTS.md. When the project already has an `AGENTS.md`, only append a reference line. Backup and rollback rules are in [compatibility.md](docs/compatibility.md), section "Deduplication, priority and rollback".

## Principle summary

1. **Think Before Coding** — don't assume; read the code first; ask only on critical ambiguity.
2. **Simplicity First** — the simplest solution that meets the need; no speculative abstractions.
3. **Surgical Changes** — every changed line traces to the request; self-review the git diff.
4. **Goal-Driven Execution** — define verifiable success criteria first.
5. **Verification Is Not Optional** — "done" requires real execution evidence from this session; report failures honestly.

## Maintenance

```sh
node --test tests/*.test.mjs   # static tests (export integrity, catalog format, repo validation)
node scripts/validate.mjs      # static public-content validation (identity, links, JSON, secret patterns)
```

These checks make no model calls; static success does not establish model benefits. Host discovery and behavioral acceptance methods are in [verification.md](docs/verification.md).

## License

[MIT](LICENSE). No affiliation with Karpathy, Superpowers or any tool vendor; source snapshots and evidence limits are in [references.md](docs/references.md).
