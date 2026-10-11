# Agent Coding Guidelines

一套简洁、可靠、可维护、跨工具复用的 AI Coding 工作流规则。核心目标：**更有效、更低成本、更可控**，而不是制造复杂的 Agent 框架。

## 内容

```
skills/                        # 唯一规范来源（source of truth）
  global-coding-principles/    # L1 全局编码纪律（常驻）
  brainstorming/               # L2 需求澄清（按需）
  plan/                        # L3 实施计划（按需）
  verification/                # L4 风险分级验证
  stack-conventions/           # 专项：技术栈无关的约定遵循（按需加载）
adapters/
  cursor/rules/                # Cursor .mdc（作用域配置 + 同步引用）
  codex/                       # Codex AGENTS.md / skills 安装说明
  claude-code/                 # Claude Code 安装说明
docs/architecture.md           # 层级与加载策略说明
```

## 设计来源

- [andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) 四原则，及其社区 PR 中的实操强化：任务分级、过度设计信号清单、红旗表、验证不可省略（PR #188/#197 等，采纳时按 diff 实审，未合并内容仅作候选）。
- [obra/superpowers](https://github.com/obra/superpowers) brainstorming 的需求澄清理念（Goal/Non-goal/Anti-goal/取舍/审批），但**不继承**其强制流程：小任务不 brainstorm、不强制多轮提问、不强制设计文档与 subagent review、不自动 git commit。
- 各工具官方机制：Cursor `.mdc`（alwaysApply / description / globs）、Codex `AGENTS.md`（`~/.codex` 全局 + 项目级联）与 skills、Claude Code `CLAUDE.md` 与 `.claude/skills/`。

## 使用

### Cursor

1. 将 `adapters/cursor/rules/*.mdc` 复制到项目 `.cursor/rules/`（项目级）或 Cursor 用户规则（用户级）。
2. 运行同步，把 skill 正文内联进 `.mdc`（Cursor 的 `@file` 引用不会内联正文，仅作为 Agent 可读取的提示）：

```bash
./scripts/sync-cursor.sh /path/to/target-project
```

### Codex / Claude Code / 其他

见 `adapters/codex/README.md`、`adapters/claude-code/README.md`。原则相同：L1 进全局指令文件，其余作为按需 skill 安装，**不并入全局**。

### 已有配置保护

安装只追加、不覆盖：不删除、清空或批量替换你已有的 Rules / Skills / MCP / AGENTS.md。项目已有 `AGENTS.md` 时只追加引用行。

## 原则摘要

1. **Think Before Coding** — 不臆测；先读代码；关键歧义才提问。
2. **Simplicity First** — 满足需求的最简单方案；不造未要求的抽象。
3. **Surgical Changes** — 每行改动可追溯至需求；提交前自审 git diff。
4. **Goal-Driven Execution** — 先定义可验证的成功标准。
5. **Verification Is Not Optional** — 「完成」必须有本次会话的真实执行证据；失败如实上报。
