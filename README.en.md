# Agent Coding Guidelines

A concise, reliable, maintainable, cross-tool **workflow skill** for AI coding agents. Core goal: **more effective, lower cost, more controllable** — via risk routing and progressive disclosure, not another agent framework.

**Single source of truth, no duplicate entries**: root [`SKILL.md`](SKILL.md) is the only shared body; `references/` load only on T2 (or matching triggers); export scripts and the compatibility catalog derive from it. Honest disclaimer: this repository currently has **no controlled comparison proving effectiveness** — static tests check integrity and budgets, not model gains (see [verification](docs/verification.md)).

[简体中文](README.md)

## Contents

```
SKILL.md                       # Single entry: T0/T1/T2 route + core discipline
references/
  clarify.md                   # T2: what (brief + trade-offs)
  plan.md                      # T2: how (steps → verify; prefer host Plan)
  verify.md                    # T2 / non-trivial T1: V0–V2 + honest report
profiles/                      # Opt-in project profiles (never global)
scripts/                       # Read-only export, pack & compatibility (Node 20+ stdlib)
benchmarks/                    # Eight public tasks + offline oracles (maintainers only; not installed)
docs/
  design.md                    # Research → decision → location
  rule-probe-map.md            # Rule ↔ fixture probes (exploratory)
  compatibility.md             # Cross-tool compatibility
  tool-registry.json           # Host catalog
  benchmarks.md                # Evaluation boundaries
  verification.md              # Discovery vs. behavior acceptance
  references.md                # Research notes and evidence limits
```

## Design sources

- [andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) four principles plus practical hardening from community PRs (task calibration, non-negotiable verification, scope discipline).
- [obra/superpowers](https://github.com/obra/superpowers) brainstorming ideas (Goal / Non-goal / Anti-goal / trade-offs), **without** mandatory multi-round questions, design docs, subagent review, or auto-commits.
- Host-native Skills discovery, Plan modes, and existing project verification schemes.

Full mapping: [design.md](docs/design.md). Rule ↔ probe map: [rule-probe-map.md](docs/rule-probe-map.md).

## Usage

Give the repo link or local path to your AI tool:

> Read the README, identify your tool and version, and install into the supported shared or native user config. For Skills hosts deploy **only** the runtime files: `SKILL.md`, `LICENSE`, and `references/` (use `pack-skill` below). Do not copy `benchmarks/`, `docs/`, `scripts/`, or `profiles/`. Otherwise use `node scripts/export.mjs --format instructions`. Deduplicate entries, back up existing config, finish install, and report native-load acceptance.

### Runtime pack (preferred install source)

```sh
node scripts/pack-skill.mjs --out /tmp/agent-coding-guidelines
```

Copies the five runtime files into an empty directory and prints a JSON manifest. Keep `benchmarks/` and other maintainer material in git only.

### Rule-host export

```sh
node scripts/export.mjs --format skill
node scripts/export.mjs --format instructions
```

Stdout only; no config writes; no network. The instructions format folds every `references/*.md` link into a short self-contained hint.

### Compatibility lookup

```sh
node scripts/compatibility.mjs --list
node scripts/compatibility.mjs --tool codebuddy
```

See [compatibility.md](docs/compatibility.md) and [tool-registry.json](docs/tool-registry.json).

### Opt-in React + TypeScript profile

[profiles/react-typescript.md](profiles/react-typescript.md) is never global:

```sh
node scripts/export-profile.mjs --format cursor
node scripts/export-profile.mjs --format vscode
```

### Protect existing config

Install appends; it does not wipe Rules / Skills / MCP / AGENTS.md. Backup and rollback: [compatibility.md](docs/compatibility.md).

## Workflow summary

1. **Route** — pick T0 / T1 / T2; clear small edits skip ceremony.
2. **Clarify** (T2) — brief: goal / non-goals / anti-goals / constraints / success criteria.
3. **Plan** (T2) — steps with per-step verify; prefer host Plan mode.
4. **Verify** — V0/V1/V2 aligned with T; real output; honest gaps.

## Maintenance

```sh
node --test tests/*.test.mjs
node scripts/validate.mjs
```

These checks do not call models. Behavioral comparison methods: [benchmarks.md](docs/benchmarks.md) and [verification.md](docs/verification.md).

## License

[MIT](LICENSE). Not affiliated with Karpathy, Superpowers, or tool vendors. Research snapshots: [references.md](docs/references.md).
