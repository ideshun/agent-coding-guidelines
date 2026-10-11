# 研究如何落实到技能

目标是把 Karpathy 四原则做成更可靠、跨工具的行为约束。运行时以一份可自动发现的 [SKILL.md](../SKILL.md) 为入口；按风险分级决定是否读取 `references/` 中的 Clarify / Plan / Verify。研究、兼容与评测留在仓库供维护和验收，不由日常任务默认读取。兼容覆盖国内外工具，优先原生加载；通用原则只有一个来源，避免重复入口与无必要的额外内容。

## 分级路由与加载边界

| 层 | 入口与作用域 | 承担内容 | 不承担 |
| --- | --- | --- | --- |
| Route + Core | 根 [SKILL.md](../SKILL.md)，相关编码任务才选择 | T0/T1/T2 路由、证据/简单/外科/可观察成功、提问与停手清单、汇报格式、优先级 | 个人栈偏好、强制设计文档、默认输出语言 |
| Clarify | [references/clarify.md](../references/clarify.md)，仅 T2 或 T1 暴露关键歧义时读取 | goal / non-goal / anti-goal / constraints / success criteria、真正方案取舍 | 简单任务的问答仪式、强制多轮提问或自动审批 |
| Plan | [references/plan.md](../references/plan.md)；优先宿主原生 Plan | 实施范围、步骤与 per-step verify、风险、验证档位 | 再次决定用户要什么、第二套常驻 planning 技能 |
| Verify | [references/verify.md](../references/verify.md)；T2 或非平凡 T1 完成时读取 | V0/V1/V2（与 T 对齐）、真实输出与退出码、diff 自查；项目方案可覆盖 | 与用户项目冲突的第二套 L1/L2/L3、虚构通过或机械全量测试 |

优先级：用户明确指令 > 项目规则 > 宿主安全策略 > 本技能。本技能不能覆盖权限、安全策略或项目专属事实。多 Agent 同时工作时使用同一源包；每个 Agent 仍须遵守自己可见的项目指令和实际检查结果。

## 可选项目规范

[React + TypeScript 源规范](../profiles/react-typescript.md) 不在全局技能中。项目确认采用该栈后，选择目标 IDE 的项目规则入口；[只读转换器](../scripts/export-profile.mjs) 可输出 Cursor `.cursor/rules/react-typescript.mdc`、VS Code `.github/instructions/react-typescript.instructions.md` 或无元数据正文。Ant Design、Umi、AG-Grid、React Flow 只在项目确实使用时适用，不能由个人偏好覆盖项目代码风格。

运行时技能需要 `SKILL.md` 与 `references/{clarify,plan,verify}.md`；用 [pack-skill.mjs](../scripts/pack-skill.mjs) 可生成仅含这 5 个文件的安装目录。仓库顶层 `scripts/` 负责维护与只读转换，不在安装包中，不依赖 Node.js 才能使用技能。`docs/` 和 `benchmarks/` 是维护资料，不属于技能参考目录，不得随 Skills 安装复制。规则型宿主由转换器将全部 `references/*.md` 链接折叠为自包含短提示。

## 来源 → 行为 → 验收

| 研究来源 | 采用的决策 | 当前落实位置 | 验收场景 |
| --- | --- | --- | --- |
| Karpathy 四原则 | 先读证据、简单充分、局部修改、定义并验证成功 | [SKILL.md](../SKILL.md) Core | 八类公开任务 |
| PR 188 | 工作量、规划及检查与复杂度和风险相称 | 路由表；T0 直接执行 | `01-style`；跨文件见 `05-cross-file` |
| PR 186 | 复用上下文；范围化搜索；读取失败先调查 | Core §1；Ask 清单 | `07-ambiguity`；文件不可读不猜实现 |
| PR 208 | 最终版本上的真实输出和退出码 | [verify.md](../references/verify.md) | 检查失败/未执行如实报告 |
| PR 197 | 审查覆盖范围准确；保留既有用户改动 | Core §3；verify diff 自查 | `08-narrow-scope`；既有失败不顺手修 |
| PR 187 | 单一规范来源 | 根技能及 [README](../README.md) | 一份公共入口 |
| PR 177 | 复用既有能力，避免无价值依赖 | Core §2 | 无关升级不进 diff |
| PR 206 | 报告结果、验证和不确定性 | Report shape | 简洁真实交付 |
| PR 89 / 104 | 标准入口和简短双语 description | frontmatter | 发现 / 选择 / 行为分测 |
| PR 141 | 实质性矛盾与简短推荐 | Ask / assume / stop | 矛盾需求不猜方案 |
| PR 168 | 简单方案保留正确性、安全与可维护性 | Core §2 | 少代码不能删保护 |
| PR 183 | 使用现成验证；未执行不伪报 | verify 覆盖钩子 | 无框架不强装测试 |
| Superpowers Brainstorming | 重大设计的 goal / non-goal / anti-goal / 取舍 | [clarify.md](../references/clarify.md) | `06-design` |

以上是设计可追溯性，不是模型收益成绩。规则与 fixture 对应及已删减项见 [规则探针清单](rule-probe-map.md)；研究 diff 快照见 [研究记录](references.md)。

## 跨场景决策

| 情况 | 所需工作 | 应避免 |
| --- | --- | --- |
| 明确的局部修改 | T0/T1：读相关实现，局部改动，最小充分检查 | 全量 clarify、无关整理 |
| 关键目标缺失 | Clarify：先读事实，问会改变方案的关键问题 | 为方便执行而自选指标 |
| 重要设计选择 | Clarify brief + 真正不同的取舍 | 每个任务固定设计文档 |
| 复杂实施或难恢复的变更 | Plan（原生优先）+ Verify V2 | 第二套常驻 planning 技能 |
| 检查、解释、审查 | 依据证据报告范围；获准修改才动文件 | 把「这些有用吗」理解成批量移除授权 |
| 检查失败或环境受阻 | 调查实际输出，说明未验证部分 | 吞错误、弱化检查、顺手修既有问题 |

## 中文兼容

兼容包含语义选择、意图边界、输出语言三件事。双语 description 提供任务线索；正文保留否定、范围、顺序、上下文指代和明确修正，不增加中文副本或英文动词正则 hook。不在共享技能中写死默认输出语言。具体同义提示与负例见 [多语言验收](multilingual-evaluation.md)。

## 不放入通用技能的内容

个人框架、包管理器、注释风格、具体命令、默认口语语言属于用户或项目规范。原生权限和适用项目指令保持宿主优先级。已批准的实施不泛化为安装额外应用、hooks、MCP、自动提交、外部裁决或第三方数据流的授权。

## 成本与加载

原生技能部署 `SKILL.md`、`LICENSE` 与三个条件式 reference；规则型宿主部署折叠后的自包含正文。T0/T1 默认不读取 `references/`。技能正文不引用研究或评测文件。按需选择与去重是设计选择；在实际测量前，不把字节量或更短正文写成 token 节省结论。
