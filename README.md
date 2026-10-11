# Agent Coding Guidelines

一套简洁、可靠、可维护、跨工具复用的 AI Coding 工作流规则。核心目标：**更有效、更低成本、更可控**，而不是制造复杂的 Agent 框架。

**单一来源，不叠加等价入口**：`skills/*/SKILL.md` 是唯一规范正文，`adapters/`、导出脚本与兼容目录都从它派生。诚实声明：本仓库目前**没有受控对照实验证明提效**——所有静态测试只验证内容完整性，不验证模型行为收益（见[验证说明](docs/verification.md)）。

[English](README.en.md)

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
scripts/                       # 只读导出与兼容查询（Node 20+ 标准库，无依赖）
profiles/                      # 可选项目级规范（不进全局）
docs/
  architecture.md              # 层级与加载策略说明
  compatibility.md             # 跨工具兼容入口与部署方式
  tool-registry.json           # 88 宿主配置（区分证据等级）
  verification.md              # 宿主发现与行为验收分开验证
  design.md                    # 研究来源 → 决策 → 落实位置 → 验收
  references.md                # 研究记录与证据边界
```

## 设计来源

- [andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) 四原则，及其社区 PR 中的实操强化：任务分级、过度设计信号清单、红旗表、验证不可省略（PR #188/#197 等，采纳时按 diff 实审，未合并内容仅作候选）。
- [obra/superpowers](https://github.com/obra/superpowers) brainstorming 的需求澄清理念（Goal/Non-goal/Anti-goal/取舍/审批），但**不继承**其强制流程：小任务不 brainstorm、不强制多轮提问、不强制设计文档与 subagent review、不自动 git commit。
- 各工具官方机制：Cursor `.mdc`（alwaysApply / description / globs）、Codex `AGENTS.md`（`~/.codex` 全局 + 项目级联）与 skills、Claude Code `CLAUDE.md` 与 `.claude/skills/`。

来源 → 决策 → 落实位置的完整映射见 [design.md](docs/design.md)；每项研究的 diff 快照与不采纳理由见 [references.md](docs/references.md)。

## 使用

### Cursor

1. 将 `adapters/cursor/rules/*.mdc` 复制到项目 `.cursor/rules/`（项目级）或 Cursor 用户规则（用户级）。
2. 运行同步，把 skill 正文内联进 `.mdc`（Cursor 的 `@file` 引用不会内联正文，仅作为 Agent 可读取的提示）：

```bash
./scripts/sync-cursor.sh /path/to/target-project
```

### Codex / Claude Code / 其他

见 `adapters/codex/README.md`、`adapters/claude-code/README.md`。原则相同：L1 进全局指令文件，其余作为按需 skill 安装，**不并入全局**。

其他 88 个宿主的入口、证据等级与注意事项见 [compatibility.md](docs/compatibility.md) 与 [tool-registry.json](docs/tool-registry.json)；可用只读命令查询：

```sh
node scripts/compatibility.mjs --list
node scripts/compatibility.mjs --tool codebuddy
```

### 规则型宿主导出

规则型宿主（instructions / 项目规则）使用同一正文的导出形式，不维护第二份规范正文：

```sh
node scripts/export.mjs --skill global-coding-principles --format instructions
```

只输出到 stdout，不改宿主配置、不联网。

### 可选项目级规范（React + TypeScript）

[profiles/react-typescript.md](profiles/react-typescript.md) 仅供确实采用该栈的项目选用，不进全局。导出为 Cursor `.mdc` 或 VS Code instructions：

```sh
node scripts/export-profile.mjs --format cursor   # .cursor/rules/react-typescript.mdc
node scripts/export-profile.mjs --format vscode   # .github/instructions/react-typescript.instructions.md
```

### 已有配置保护

安装只追加、不覆盖：不删除、清空或批量替换你已有的 Rules / Skills / MCP / AGENTS.md。项目已有 `AGENTS.md` 时只追加引用行。备份与回滚规则见 [compatibility.md](docs/compatibility.md) 的「去重、优先级与回滚」。

## 原则摘要

1. **Think Before Coding** — 不臆测；先读代码；关键歧义才提问。
2. **Simplicity First** — 满足需求的最简单方案；不造未要求的抽象。
3. **Surgical Changes** — 每行改动可追溯至需求；提交前自审 git diff。
4. **Goal-Driven Execution** — 先定义可验证的成功标准。
5. **Verification Is Not Optional** — 「完成」必须有本次会话的真实执行证据；失败如实上报。

## 维护

```sh
node --test tests/*.test.mjs   # 静态测试（导出完整性、目录记录格式、仓库校验）
node scripts/validate.mjs      # 公开内容静态校验（身份、链接、JSON、敏感模式）
```

这些检查不调用模型，静态通过不代表模型收益；宿主发现与行为验收的方法见 [verification.md](docs/verification.md)。

## 许可

[MIT](LICENSE)。与 Karpathy、Superpowers 及各工具厂商没有官方关系；来源快照与证据边界见 [references.md](docs/references.md)。
