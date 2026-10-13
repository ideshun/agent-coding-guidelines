# Agent Coding Guidelines

A concise, reliable, maintainable, cross-tool **workflow skill** for AI coding agents. Core goal: **more effective, lower cost, more controllable**. Karpathy's four principles guide how much clarification, planning and verification a task needs.

**Single source of truth, no duplicate entries**: root [`SKILL.md`](SKILL.md) holds the shared principles; each reference has its own trigger, without a mandatory three-stage sequence. Exports derive from these source files. There is currently **no controlled comparison proving effectiveness**; static checks cannot establish model quality or cost gains (see [verification](docs/verification.md)).

[简体中文](README.md)

## Contents

```
SKILL.md                       # Single entry: four principles + independent triggers
references/
  clarify.md                   # Key ambiguity / consequential design: what + trade-offs
  plan.md                      # Complex implementation: how; reuse host Plan
  verify.md                    # Complex evidence selection; reuse existing verification rules
profiles/                      # Opt-in project profiles (never global)
scripts/                       # Export, runtime pack & compatibility (Node 20+ stdlib)
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

> Read the README and `docs/compatibility.md`, identify your tool and version, and install into the supported shared or native user config. For Skills hosts deploy **only** the runtime files: `SKILL.md`, `LICENSE`, and `references/` (use `pack-skill` below). Do not copy `benchmarks/`, `docs/`, `scripts/`, or `profiles/`. For CodeBuddy IDE/plugins, verify the native tool and rule paths, then merge the short development-task trigger into existing Rules while preserving custom content. Otherwise use `node scripts/export.mjs --format instructions`. Deduplicate entries, back up existing config, finish install, and report discovery and actual invocation separately.

A skill listed as available may still have an unloaded body. The CodeBuddy trigger Rule requests the native skill for development tasks without duplicating its instructions. See [CodeBuddy automatic activation](docs/compatibility.md#codebuddy-自动触发) for installation, deduplication, and fresh-session checks. Use each other host's own mechanisms.

### Runtime pack (preferred install source)

```sh
node scripts/pack-skill.mjs --out /tmp/agent-coding-guidelines
```

Copies the five runtime files into an empty directory and prints a JSON manifest. Keep `benchmarks/` and other maintainer material in git only.

### Rule-host export

```sh
node scripts/export.mjs --format skill
node scripts/export.mjs --format instructions
node scripts/export.mjs --format instructions-full
```

Stdout only; no config writes; no network:

- `skill`: preserves the root source; install its references too.
- `instructions`: default compact rules, preserving the whole root body and triggers while turning optional file links into labels. Essential constraints stay in the root; no separate summaries.
- `instructions-full`: appends the actual referenced source bodies once, using internal links. Choose it only when detailed guidance is needed.

Both rule exports validate references and reject missing files, symlinks or unsupported local links. Optional reference detail is available only through native Skills or the full export.

Native Skills can read references on demand. Rule-only hosts load the entire chosen export; the full form cannot offer the same file-level context cost. Prefer native Skills; otherwise default to compact rules with supported scopes and no duplicate entries.

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

Preserve existing Rules / Skills / MCP / AGENTS.md. Compare and back up equivalent entries before authorized updates to this skill; do not blindly append duplicate copies. Backup and rollback: [compatibility.md](docs/compatibility.md).

## Workflow summary

1. **Understand** — read evidence first; clarify key ambiguity or consequential design choices. Clear tasks proceed directly.
2. **Plan when needed** — order steps, dependencies and risks through the host's existing mechanism; no prerequisite Clarify document.
3. **Change surgically** — choose a simple sufficient solution, reuse existing code, preserve user edits and inspect the final diff.
4. **Verify** — choose sufficient checks for behavior and impact, reuse project verification rules, and report failures, unexecuted checks and risk.

## Maintenance

```sh
node --test tests/*.test.mjs
node scripts/validate.mjs
```

These checks do not call models. Behavioral comparison methods: [benchmarks.md](docs/benchmarks.md) and [verification.md](docs/verification.md).

## License

[MIT](LICENSE). Not affiliated with Karpathy, Superpowers, or tool vendors. Research snapshots: [references.md](docs/references.md).
