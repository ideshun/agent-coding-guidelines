# Agent Coding Guidelines

一套简洁、可靠、可维护、跨工具复用的 AI Coding 流程化 skill。核心目标：**更有效、更低成本、更可控**。以 Karpathy 四原则为基础，按实际需求决定澄清、规划和验证的深度。

**单一来源，不叠加等价入口**：根 [`SKILL.md`](SKILL.md) 承载通用原则；`references/` 根据各自条件读取，不强制串行执行三个阶段。导出从这些源文件生成。当前**没有受控对照实验证明提效**，静态检查不能证明模型更准、更省（见[验证说明](docs/verification.md)）。

[English](README.en.md)

## 内容

```
SKILL.md                       # 唯一入口：四原则 + 独立触发条件
references/
  clarify.md                   # 关键歧义 / 重要设计：what + 取舍
  plan.md                      # 复杂实施：how；复用宿主 Plan
  verify.md                    # 复杂证据选择：按影响验证，复用已有规则
profiles/                      # 可选项目级规范（不进全局）
scripts/                       # 导出、运行时打包与兼容查询（Node 20+ 标准库）
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
node scripts/export.mjs --format instructions-full
```

只输出到 stdout，不改宿主配置、不联网：

- `skill`：保留根入口原文，安装时仍须带上参考文件。
- `instructions`：默认轻量规则，完整保留根入口的原则和触发条件，仅将可选文件链接改为名称。必要约束都在根入口，导出不另写摘要。
- `instructions-full`：在同一根入口后，将实际参考正文各内联一次，转换为文内链接。只有需要详细指导时才选择这一版。

两种规则导出都检查引用文件；缺失、软链接或不支持的本地引用直接报错。可选参考文件只在原生 Skill 或完整导出中提供。

原生 Skills 可按需读取参考文件；规则型宿主加载所选导出的全部正文，完整导出无法获得相同的文件级渐进加载成本。优先原生 Skills；否则默认轻量导出，按宿主作用域加载并避免重复入口。

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

保留已有 Rules / Skills / MCP / AGENTS.md。同名或同义入口先比较、备份，再按授权更新本技能内容；避免盲目追加重复副本。备份与回滚见 [compatibility.md](docs/compatibility.md)。

## 流程摘要

1. **Understand** — 先读证据；关键歧义或重要设计才澄清，目标明确直接执行。
2. **Plan when needed** — 实施需要顺序、依赖或风险管理才规划，复用宿主机制；不要求先生成 Clarify 文档。
3. **Change surgically** — 简单充分，复用已有实现，保护用户改动，检查最终 diff。
4. **Verify** — 按行为影响选择充分检查，复用项目验证方案；如实报告失败、未执行项与风险。

## 维护

```sh
node --test tests/*.test.mjs
node scripts/validate.mjs
```

这些检查不调用模型。行为对照方法见 [benchmarks.md](docs/benchmarks.md) 与 [verification.md](docs/verification.md)。

## 许可

[MIT](LICENSE)。与 Karpathy、Superpowers 及各工具厂商没有官方关系；来源快照见 [references.md](docs/references.md)。
