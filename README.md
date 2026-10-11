# Agent Coding Guidelines

一套简洁、可靠、可维护、跨工具复用的 AI Coding 流程化 skill。核心目标：**更有效、更低成本、更可控**——用分级路由与按需加载约束 Agent 行为，而不是制造复杂框架。

**单一来源，不叠加等价入口**：根 [`SKILL.md`](SKILL.md) 是唯一通用原则正文；`references/` 仅在 T2（或对应触发）时按需读取；导出脚本与兼容目录都从它派生。诚实声明：本仓库目前**没有受控对照实验证明提效**——静态测试只验证内容完整性与预算，不验证模型行为收益（见[验证说明](docs/verification.md)）。

[English](README.en.md)

## 内容

```
SKILL.md                       # 唯一入口：T0/T1/T2 路由 + 核心纪律
references/
  clarify.md                   # T2：what（brief + 取舍）
  plan.md                      # T2：how（步骤 → verify；优先宿主 Plan）
  verify.md                    # T2 / 非平凡 T1：V0–V2 + 诚实报告
profiles/                      # 可选项目级规范（不进全局）
scripts/                       # 只读导出、打包与兼容查询（Node 20+ 标准库）
benchmarks/                    # 八类公开任务与离线 oracle（仅维护；不进安装包）
docs/
  design.md                    # 研究来源 → 决策 → 落实位置
  rule-probe-map.md            # 规则 ↔ fixture 探针（探索性）
  compatibility.md             # 跨工具兼容
  tool-registry.json           # 宿主配置目录
  benchmarks.md                # 评测边界
  verification.md              # 发现与行为验收分开
  references.md                # 研究记录与证据边界
```

## 设计来源

- [andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) 四原则，及其社区 PR 中的实操强化：任务分级、验证不可省略、范围纪律（PR #188/#197 等，采纳时按 diff 实审）。
- [obra/superpowers](https://github.com/obra/superpowers) brainstorming 的 Goal / Non-goal / Anti-goal / 取舍理念，但**不继承**强制多轮提问、强制设计文档、subagent review 或自动 git commit。
- 各工具官方机制：Skills 发现、宿主原生 Plan、项目既有验证方案。

完整映射见 [design.md](docs/design.md)；规则与探针对应见 [rule-probe-map.md](docs/rule-probe-map.md)。

## 使用

把仓库链接或本地路径发给你正在用的 AI 工具，并说：

> 请读取 README，识别你当前的工具与版本，把本仓库安装到可用的公共配置或原生用户配置。支持 Skills 时**只**部署运行时文件：`SKILL.md`、`LICENSE` 和 `references/`（可用下方 `pack-skill` 生成）；不要复制 `benchmarks/`、`docs/`、`scripts/`、`profiles/`。不支持 Skills 时用 `node scripts/export.mjs --format instructions` 的输出。检查重复入口，备份已有内容，完成安装并报告原生加载验收。

### 运行时打包（推荐安装源）

```sh
node scripts/pack-skill.mjs --out /tmp/agent-coding-guidelines
```

只复制 5 个运行时文件到空目录，输出 JSON 清单。`benchmarks/` 等维护资料留在 git，不进 Skills 安装目录。

### 规则型宿主导出

```sh
node scripts/export.mjs --format skill
node scripts/export.mjs --format instructions
```

只输出到 stdout，不改宿主配置、不联网。instructions 会把全部 `references/*.md` 链接折叠为自包含短提示。

### 兼容查询

```sh
node scripts/compatibility.mjs --list
node scripts/compatibility.mjs --tool codebuddy
```

其他宿主见 [compatibility.md](docs/compatibility.md) 与 [tool-registry.json](docs/tool-registry.json)。

### 可选项目级规范（React + TypeScript）

[profiles/react-typescript.md](profiles/react-typescript.md) 仅供确实采用该栈的项目选用，不进全局：

```sh
node scripts/export-profile.mjs --format cursor
node scripts/export-profile.mjs --format vscode
```

### 已有配置保护

安装只追加、不覆盖：不删除或批量替换你已有的 Rules / Skills / MCP / AGENTS.md。备份与回滚见 [compatibility.md](docs/compatibility.md)。

## 流程摘要

1. **Route** — 按风险选 T0 / T1 / T2；小改动直接做。
2. **Clarify**（T2）— 产出 brief：目标 / 非目标 / 反目标 / 约束 / 成功标准。
3. **Plan**（T2）— 步骤与 per-step verify；优先宿主 Plan。
4. **Verify** — 与 T 对齐的 V0/V1/V2；真实输出；诚实报告未验证项。

## 维护

```sh
node --test tests/*.test.mjs
node scripts/validate.mjs
```

这些检查不调用模型。行为对照方法见 [benchmarks.md](docs/benchmarks.md) 与 [verification.md](docs/verification.md)。

## 许可

[MIT](LICENSE)。与 Karpathy、Superpowers 及各工具厂商没有官方关系；来源快照见 [references.md](docs/references.md)。
